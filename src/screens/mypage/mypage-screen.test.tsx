import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import type { MyPageBundle } from "../../api/generated/divurve-api";
import {
  MY_PAGE_API_FIXTURE,
  MY_PAGE_SETTINGS_FIXTURE,
} from "../../test/api-fixtures";
import { MyPageScreen } from "./mypage-screen";
import type { MyPageDependencies } from "./use-mypage";

function makeDependencies(
  overrides: Partial<MyPageDependencies> = {},
): MyPageDependencies {
  return {
    load: vi.fn().mockResolvedValue(MY_PAGE_API_FIXTURE),
    saveSettings: vi.fn().mockResolvedValue(MY_PAGE_SETTINGS_FIXTURE),
    ...overrides,
  };
}

const READ_NOTIFICATION_BUNDLE: MyPageBundle = {
  ...MY_PAGE_API_FIXTURE,
  notifications: {
    notifications: [
      ...MY_PAGE_API_FIXTURE.notifications.notifications,
      {
        id: "notice-2",
        type: "plan",
        title: "지난 회차 안내",
        message: "이미 확인한 알림입니다.",
        createdAt: "2026-09-01T00:00:00Z",
        read: true,
      },
    ],
  },
};

const DEMO_BUNDLE: MyPageBundle = {
  ...MY_PAGE_API_FIXTURE,
  profile: { ...MY_PAGE_API_FIXTURE.profile, isDemo: true },
  riskProfile: null,
  notifications: { notifications: [] },
};

describe("MyPageScreen", () => {
  it("서버 프로필·성향·설정·알림을 표시한다", async () => {
    render(<MyPageScreen dependencies={makeDependencies()} />);

    expect(
      screen.getByText("마이페이지를 불러오는 중입니다"),
    ).toBeInTheDocument();

    expect(await screen.findByText("플래너 사용자")).toBeInTheDocument();
    expect(screen.getByText("planner@example.com")).toBeInTheDocument();
    expect(screen.getByText("내 계정")).toBeInTheDocument();
    expect(screen.getByText("균형 항로형")).toBeInTheDocument();
    expect(screen.getByText("서버 점수 72")).toBeInTheDocument();
    expect(screen.getByText(/진단일 2026/)).toBeInTheDocument();
    expect(screen.getByText(/해커톤 MVP용 가설/)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "회차 실행일 안내" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "목표 구간 도달 안내" }),
    ).not.toBeChecked();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(
      screen.getByText(/실효 스프레드 0\.20% \(서버 계산값\)/),
    ).toBeInTheDocument();
    expect(screen.getByText("회차 확인")).toBeInTheDocument();
  });

  it("데모 계정에는 로그인 버튼과 빈 상태 문구를 표시한다", async () => {
    const onLogin = vi.fn();
    render(
      <MyPageScreen
        dependencies={makeDependencies({
          load: vi.fn().mockResolvedValue(DEMO_BUNDLE),
        })}
        onLogin={onLogin}
      />,
    );

    expect(await screen.findByText("데모 계정")).toBeInTheDocument();
    expect(
      screen.getByText(/아직 성향 진단 결과가 없습니다/),
    ).toBeInTheDocument();
    expect(screen.getByText("새 알림이 없습니다.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("우대율을 조정해 저장하면 서버 응답으로 실효 스프레드를 갱신한다", async () => {
    let resolveSave!: (value: typeof MY_PAGE_SETTINGS_FIXTURE) => void;
    const savePromise = new Promise<typeof MY_PAGE_SETTINGS_FIXTURE>(
      (resolve) => {
        resolveSave = resolve;
      },
    );
    const deps = makeDependencies({
      saveSettings: vi.fn().mockReturnValue(savePromise),
    });
    render(<MyPageScreen dependencies={deps} />);
    await screen.findByText("플래너 사용자");

    fireEvent.change(screen.getByLabelText("주거래 은행 우대율"), {
      target: { value: "70" },
    });
    expect(screen.getByText(/저장하면 갱신됩니다/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "설정 저장" }));
    expect(screen.getByRole("button", { name: "저장 중…" })).toBeDisabled();

    resolveSave({
      ...MY_PAGE_SETTINGS_FIXTURE,
      fxDiscountRatio: 0.7,
      effectiveSpreadRatio: 0.003,
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "서버에 저장했습니다",
    );
    expect(deps.saveSettings).toHaveBeenCalledWith({
      fxDiscountRatio: 0.7,
      notifyStepDue: true,
      notifyRegimeShift: true,
      notifyDeadlineNear: true,
      notifyTargetZone: false,
      notifyConcentration: true,
    });
    await waitFor(() =>
      expect(screen.getByText(/실효 스프레드 0\.30%/)).toBeInTheDocument(),
    );
  });

  it("설정 저장 오류를 표시한다", async () => {
    render(
      <MyPageScreen
        dependencies={makeDependencies({
          saveSettings: vi
            .fn()
            .mockRejectedValue(new Error("네트워크가 끊겼습니다")),
        })}
      />,
    );
    await screen.findByText("플래너 사용자");

    fireEvent.click(screen.getByRole("button", { name: "설정 저장" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "설정을 저장하지 못했습니다",
    );
  });

  it("조회 오류를 표시하고 다시 시도한다", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("프로필 API 오류", 500, "SERVER"))
      .mockResolvedValueOnce(MY_PAGE_API_FIXTURE);
    render(<MyPageScreen dependencies={makeDependencies({ load })} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "프로필 API 오류",
    );

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("플래너 사용자")).toBeInTheDocument();
  });

  it("바로가기와 로그아웃·투어 콜백을 연결한다", async () => {
    const onNavigate = vi.fn();
    const onLogout = vi.fn();
    const onStartTour = vi.fn();
    render(
      <MyPageScreen
        dependencies={makeDependencies()}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onStartTour={onStartTour}
      />,
    );
    await screen.findByText("플래너 사용자");

    fireEvent.click(screen.getByRole("button", { name: /자산 내역 편집/ }));
    fireEvent.click(screen.getByRole("button", { name: /외화 목표 편집/ }));
    fireEvent.click(screen.getByRole("button", { name: /가이드 투어 다시보기/ }));
    fireEvent.click(screen.getByRole("button", { name: /로그아웃/ }));

    expect(onNavigate).toHaveBeenNthCalledWith(1, "assets");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "planner");
    expect(onStartTour).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("콜백이 없으면 바로가기·계정 버튼을 눌러도 아무 일도 하지 않는다", async () => {
    render(<MyPageScreen dependencies={makeDependencies()} />);
    await screen.findByText("플래너 사용자");

    fireEvent.click(screen.getByRole("button", { name: /자산 내역 편집/ }));

    expect(
      screen.queryByRole("button", { name: "로그아웃" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /가이드 투어 다시보기/ }),
    ).not.toBeInTheDocument();
  });

  it("데모 계정이어도 로그인 콜백이 없으면 버튼을 노출하지 않는다", async () => {
    render(
      <MyPageScreen
        dependencies={makeDependencies({
          load: vi.fn().mockResolvedValue(DEMO_BUNDLE),
        })}
      />,
    );
    await screen.findByText("데모 계정");

    expect(
      screen.queryByRole("button", { name: "로그인" }),
    ).not.toBeInTheDocument();
  });

  it("읽은 알림에는 새 알림 표시를 붙이지 않는다", async () => {
    render(
      <MyPageScreen
        dependencies={makeDependencies({
          load: vi.fn().mockResolvedValue(READ_NOTIFICATION_BUNDLE),
        })}
      />,
    );
    await screen.findByText("지난 회차 안내");

    const unreadRow = screen.getByText("회차 확인").closest("li");
    const readRow = screen.getByText("지난 회차 안내").closest("li");

    expect(unreadRow).toHaveTextContent("새 알림");
    expect(readRow).not.toHaveTextContent("새 알림");
  });

  it("알림 항목을 켜고 끄면 저장 요청에 담아 보낸다", async () => {
    const deps = makeDependencies();
    render(<MyPageScreen dependencies={deps} />);
    await screen.findByText("플래너 사용자");

    fireEvent.click(screen.getByRole("checkbox", { name: "목표 구간 도달 안내" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "회차 실행일 안내" }));
    fireEvent.click(screen.getByRole("button", { name: "설정 저장" }));

    await waitFor(() =>
      expect(deps.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          notifyTargetZone: true,
          notifyStepDue: false,
        }),
      ),
    );
  });
});
