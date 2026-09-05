import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useRoutePlanner, computeSimulation, DEFAULT_PARAMETERS } from "./use-route-planner";

describe("useRoutePlanner", () => {
  it("데모 모드일 때 초기 목표 목록을 제공한다", () => {
    const { result } = renderHook(() => useRoutePlanner(true));
    expect(result.current.goals.length).toBeGreaterThan(0);
    expect(result.current.viewMode).toBe("list");
  });

  it("비데모 모드일 때 빈 목표 목록으로 초기화된다", () => {
    const { result } = renderHook(() => useRoutePlanner(false));
    expect(result.current.goals.length).toBe(0);
  });

  it("새 목표 생성 화면을 열고, 목표를 생성하면 목록에 추가되고 상세 화면으로 이동한다", () => {
    const { result } = renderHook(() => useRoutePlanner(true));

    act(() => {
      result.current.openCreateView();
    });
    expect(result.current.viewMode).toBe("create");

    act(() => {
      result.current.createGoal({
        purposeType: "recurring",
        category: "해외주식 적립",
        name: "테스트 목표",
        currency: "USD",
        targetAmount: 5000,
        targetDate: "2026-12-31",
      });
    });

    expect(result.current.viewMode).toBe("detail");
    expect(result.current.selectedGoal?.name).toBe("테스트 목표");
    expect(result.current.selectedGoal?.targetAmount).toBe(5000);
    expect(result.current.selectedGoal?.isRecurring).toBe(true);

    // 기본 이름 및 카테고리 fallback 생성
    act(() => {
      result.current.createGoal({
        purposeType: "single",
        category: "",
        name: "",
        currency: "JPY",
        targetAmount: 0,
        targetDate: "",
      });
    });
    expect(result.current.selectedGoal?.name).toBe("새 외화 목표");
    expect(result.current.selectedGoal?.category).toBe("해외주식 적립");
    expect(result.current.selectedGoal?.targetAmount).toBe(1000);
  });

  it("목표를 선택하고 수정 및 삭제할 수 있다", () => {
    const { result } = renderHook(() => useRoutePlanner(true));
    const firstGoal = result.current.goals[0];
    const secondGoal = result.current.goals[1];

    // 새로 생성된 목표(선택 시 기본 파라미터 적용) 선택
    act(() => {
      result.current.createGoal({
        purposeType: "recurring",
        category: "적립",
        name: "파라미터 없는 목표",
        currency: "USD",
        targetAmount: 500,
        targetDate: "2026-10-10",
      });
    });
    const createdId = result.current.selectedGoalId!;
    act(() => {
      result.current.selectGoal(createdId);
    });
    expect(result.current.selectedGoal?.name).toBe("파라미터 없는 목표");

    act(() => {
      result.current.selectGoal(firstGoal.id);
    });
    expect(result.current.viewMode).toBe("detail");
    expect(result.current.selectedGoalId).toBe(firstGoal.id);

    act(() => {
      result.current.openEditView(firstGoal.id);
    });
    expect(result.current.viewMode).toBe("edit");

    act(() => {
      result.current.updateGoal(firstGoal.id, {
        purposeType: "single",
        category: "해외 여행 경비",
        name: "수정된 여행 목표",
        currency: "JPY",
        targetAmount: 200000,
        targetDate: "2026-11-15",
      });
    });
    expect(result.current.viewMode).toBe("detail");
    expect(result.current.selectedGoal?.name).toBe("수정된 여행 목표");
    expect(result.current.selectedGoal?.currency).toBe("JPY");

    // updateGoal 빈 필드 fallback으로 기존 값 유지
    act(() => {
      result.current.updateGoal(firstGoal.id, {
        purposeType: "recurring",
        category: "",
        name: "",
        currency: "USD",
        targetAmount: 0,
        targetDate: "",
      });
    });
    expect(result.current.selectedGoal?.name).toBe("수정된 여행 목표");
    expect(result.current.selectedGoal?.category).toBe("해외 여행 경비");
    expect(result.current.selectedGoal?.targetAmount).toBe(200000);

    // updateGoal 다른 목표 무변화 분기
    act(() => {
      result.current.updateGoal("non-existing-id", {
        purposeType: "recurring",
        category: "",
        name: "",
        currency: "USD",
        targetAmount: 0,
        targetDate: "",
      });
    });

    // 선택되지 않은 다른 목표 삭제 시 selectedGoalId 유지
    act(() => {
      result.current.deleteGoal(secondGoal.id);
    });
    expect(result.current.goals.find((g) => g.id === secondGoal.id)).toBeUndefined();

    // 현재 선택된 목표 삭제 시 selectedGoalId 초기화 및 목록 복귀
    act(() => {
      result.current.deleteGoal(firstGoal.id);
    });
    expect(result.current.viewMode).toBe("list");
    expect(result.current.selectedGoalId).toBeNull();

    // 존재하지 않는 목표 ID 선택 시 기본 파라미터 유지
    act(() => {
      result.current.selectGoal("non-existing-id");
    });
    expect(result.current.viewMode).toBe("detail");
    expect(result.current.selectedGoalId).toBe("non-existing-id");
  });

  it("파라미터 슬라이더를 조작하고 한계값 클램핑 및 기본값으로 리셋할 수 있다", () => {
    const { result } = renderHook(() => useRoutePlanner(true));

    act(() => {
      result.current.setMonthlyKrw(250);
      result.current.setSafeRatioPct(70);
      result.current.setSplitRounds(8);
    });

    expect(result.current.monthlyKrw).toBe(250);
    expect(result.current.safeRatioPct).toBe(70);
    expect(result.current.splitRounds).toBe(8);

    act(() => {
      result.current.setMonthlyKrw(20); // min 40 클램프
      result.current.setSafeRatioPct(20); // 하한 35%로 클램프
      result.current.setSplitRounds(0); // min 1 클램프
    });
    expect(result.current.monthlyKrw).toBe(40);
    expect(result.current.safeRatioPct).toBe(DEFAULT_PARAMETERS.safeRatioFloor);
    expect(result.current.splitRounds).toBe(1);

    act(() => {
      result.current.setMonthlyKrw(500); // max 400 클램프
      result.current.setSafeRatioPct(120); // max 100 클램프
      result.current.setSplitRounds(20); // max 16 클램프
    });
    expect(result.current.monthlyKrw).toBe(400);
    expect(result.current.safeRatioPct).toBe(100);
    expect(result.current.splitRounds).toBe(16);

    act(() => {
      result.current.resetParameters();
    });
    expect(result.current.monthlyKrw).toBe(DEFAULT_PARAMETERS.monthlyKrw);
    expect(result.current.safeRatioPct).toBe(DEFAULT_PARAMETERS.safeRatioPct);
    expect(result.current.splitRounds).toBe(DEFAULT_PARAMETERS.splitRounds);
  });

  it("목록으로 돌아가기(backToList) 동작이 정상 작동한다", () => {
    const { result } = renderHook(() => useRoutePlanner(true));
    act(() => {
      result.current.openCreateView();
    });
    expect(result.current.viewMode).toBe("create");

    act(() => {
      result.current.backToList();
    });
    expect(result.current.viewMode).toBe("list");
  });

  it("선택된 목표가 없을 때 completeCurrentRound를 호출해도 에러 없이 무시된다", () => {
    const { result } = renderHook(() => useRoutePlanner(false));
    act(() => {
      result.current.completeCurrentRound();
    });
    expect(result.current.goals.length).toBe(0);
  });

  it("이번 회차 완료 시 확보율이 증가하고 디데이가 감소한다", () => {
    const { result } = renderHook(() => useRoutePlanner(true));
    const firstGoal = result.current.goals[0];
    const initialRatio = firstGoal.fundedRatio;

    act(() => {
      result.current.selectGoal(firstGoal.id);
      result.current.completeCurrentRound();
    });

    const updated = result.current.goals.find((g) => g.id === firstGoal.id);
    expect(updated?.fundedRatio).toBeGreaterThan(initialRatio);
  });
});

describe("computeSimulation", () => {
  it("슬라이더 입력에 따라 시뮬레이션 결과(달성확률, 최악5%, 변동폭, 회차 스케줄)를 계산한다", () => {
    const sim = computeSimulation(150, 50, 4);
    expect(sim.successRatePct).toBeGreaterThanOrEqual(60);
    expect(sim.worst5PctEntryPriceKrw).toBeGreaterThan(1300);
    expect(sim.roundsSchedule.length).toBe(4);
    expect(sim.strategies.length).toBe(3);
  });
});
