import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import {
  MY_PAGE_API_FIXTURE,
  MY_PAGE_SETTINGS_FIXTURE,
} from "../../test/api-fixtures";
import type { MyPageApiDependencies } from "./use-mypage-api";
import { MyPageApiScreen } from "./mypage-api-screen";
import { MyPageScreen } from "./mypage-screen";

function makeDependencies(
  overrides: Partial<MyPageApiDependencies> = {},
): MyPageApiDependencies {
  return {
    load: vi.fn().mockResolvedValue(MY_PAGE_API_FIXTURE),
    saveSettings: vi.fn().mockResolvedValue(MY_PAGE_SETTINGS_FIXTURE),
    ...overrides,
  };
}

describe("MyPageApiScreen", () => {
  it("프로필·설정·알림을 표시하고 설정과 보조 행동을 연결한다", async () => {
    let resolveSave!: (value: typeof MY_PAGE_SETTINGS_FIXTURE) => void;
    const savePromise = new Promise<typeof MY_PAGE_SETTINGS_FIXTURE>((resolve) => {
      resolveSave = resolve;
    });
    const deps = makeDependencies({
      saveSettings: vi.fn().mockReturnValue(savePromise),
    });
    const onNavigate = vi.fn();
    const onStartTour = vi.fn();
    const onLogout = vi.fn();
    render(
      <MyPageApiScreen
        dependencies={deps}
        onNavigate={onNavigate}
        onStartTour={onStartTour}
        onLogout={onLogout}
      />,
    );

    expect(screen.getByText("사용자 설정을 불러오는 중입니다")).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "API 마이페이지" })).toBeInTheDocument();
    expect(screen.getByText("플래너 사용자")).toBeInTheDocument();
    expect(screen.getByText("회차 확인")).toBeInTheDocument();
    expect(screen.getByText("balanced")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("환전 우대율 API 값 (0~1)"), {
      target: { value: "0.7" },
    });
    fireEvent.change(screen.getByLabelText("설명 수준"), {
      target: { value: "detailed" },
    });
    fireEvent.change(screen.getByLabelText("설명 분야"), {
      target: { value: "finance" },
    });
    fireEvent.click(screen.getByRole("button", { name: "설정 저장" }));
    expect(screen.getByRole("button", { name: "저장 중…" })).toBeDisabled();
    resolveSave({
      ...MY_PAGE_SETTINGS_FIXTURE,
      fxDiscountRatio: 0.7,
      explainLevel: "detailed",
      explainDomain: "finance",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("서버에 저장했습니다");
    expect(deps.saveSettings).toHaveBeenCalledWith({
      fxDiscountRatio: 0.7,
      explainLevel: "detailed",
      explainDomain: "finance",
    });

    fireEvent.click(screen.getByRole("button", { name: "자산 내역 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "외화 목표 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "가이드 투어 다시보기" }));
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
    expect(onNavigate).toHaveBeenNthCalledWith(1, "assets");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "planner");
    expect(onStartTour).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("미진단·빈 알림·데모 계정을 표시하며 선택 콜백은 생략할 수 있다", async () => {
    render(
      <MyPageApiScreen
        dependencies={makeDependencies({
          load: vi.fn().mockResolvedValue({
            ...MY_PAGE_API_FIXTURE,
            profile: { ...MY_PAGE_API_FIXTURE.profile, isDemo: true },
            riskProfile: null,
            notifications: { notifications: [] },
          }),
        })}
      />,
    );
    expect(await screen.findByText("데모 계정")).toBeInTheDocument();
    expect(screen.getByText("아직 성향 진단을 하지 않았습니다.")).toBeInTheDocument();
    expect(screen.getByText("새 알림이 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "로그아웃" })).not.toBeInTheDocument();
  });

  it("설정 저장 오류를 표시한다", async () => {
    render(
      <MyPageApiScreen
        dependencies={makeDependencies({
          saveSettings: vi.fn().mockRejectedValue(
            new ApiError("설정 API 오류", 500, "SERVER"),
          ),
        })}
      />,
    );
    await screen.findByRole("region", { name: "API 마이페이지" });
    fireEvent.click(screen.getByRole("button", { name: "설정 저장" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("설정 API 오류");
  });

  it("조회 오류를 다시 시도한다", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("프로필 API 오류", 500, "SERVER"))
      .mockResolvedValueOnce(MY_PAGE_API_FIXTURE);
    render(<MyPageApiScreen dependencies={makeDependencies({ load })} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("프로필 API 오류");
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByRole("region", { name: "API 마이페이지" })).toBeInTheDocument();
  });

  it("상위 화면의 API 모드 분기를 사용한다", async () => {
    render(
      <MyPageScreen
        isDemo={false}
        apiDependencies={makeDependencies()}
      />,
    );
    expect(await screen.findByRole("region", { name: "API 마이페이지" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("API 계정")).toBeInTheDocument());
  });
});
