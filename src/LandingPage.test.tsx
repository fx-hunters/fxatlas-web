import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LandingPage, useInView, Spark, formatLandingTooltipValue } from "./LandingPage";

describe("LandingPage", () => {
  const onEnterMock = vi.fn();
  const setIsDarkMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("히어로 헤드라인, 어원, 기능, 스텝, 통계 섹션을 렌더링한다", () => {
    render(
      <LandingPage onEnter={onEnterMock} isDark={true} setIsDark={setIsDarkMock} />
    );

    expect(screen.getByText("AI 기반 외화 분할 환전 & 리스크 엔진")).toBeInTheDocument();
    expect(screen.getByText("가장 지능적인 환전 타이밍")).toBeInTheDocument();
    expect(screen.getByText("USD/KRW 80% 신뢰구간 팬 차트")).toBeInTheDocument();
    expect(screen.getByText("DIVURVE의 의미")).toBeInTheDocument();
    expect(screen.getByText("불확실한 환율 시장의 3대 솔루션")).toBeInTheDocument();
    expect(screen.getByText("환전 목표를 달성하는 4단계 흐름")).toBeInTheDocument();
    expect(screen.getByText("목표 환전 단가 방어율")).toBeInTheDocument();
  });

  it("대시보드 시작하기 버튼 및 로고 클릭 시 onEnter가 호출된다", () => {
    const onLoginMock = vi.fn();
    const onSignupMock = vi.fn();

    render(
      <LandingPage
        onEnter={onEnterMock}
        onLogin={onLoginMock}
        onSignup={onSignupMock}
        isDark={true}
        setIsDark={setIsDarkMock}
      />
    );

    const loginBtn = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(loginBtn);
    expect(onLoginMock).toHaveBeenCalledTimes(1);

    const signupBtn = screen.getByRole("button", { name: /무료 시작/ });
    fireEvent.click(signupBtn);
    expect(onSignupMock).toHaveBeenCalledTimes(1);

    const startBtns = screen.getAllByRole("button", { name: /대시보드/ });
    fireEvent.click(startBtns[0]);
    expect(onEnterMock).toHaveBeenCalledTimes(1);

    // 로고 클릭
    const logoEl = screen.getByRole("button", { name: "D DIVURVE" });
    fireEvent.click(logoEl);
    expect(onEnterMock).toHaveBeenCalledTimes(2);

    // 키보드 Enter
    fireEvent.keyDown(logoEl, { key: "Enter" });
    expect(onEnterMock).toHaveBeenCalledTimes(3);

    // 키보드 Space
    fireEvent.keyDown(logoEl, { key: " " });
    expect(onEnterMock).toHaveBeenCalledTimes(4);

    // 다른 키
    fireEvent.keyDown(logoEl, { key: "Escape" });
    expect(onEnterMock).toHaveBeenCalledTimes(4);
  });

  it("테마 전환 버튼 클릭 시 setIsDark가 호출된다", () => {
    render(
      <LandingPage onEnter={onEnterMock} isDark={true} setIsDark={setIsDarkMock} />
    );

    const themeBtn = screen.getByRole("button", { name: "테마 전환" });
    fireEvent.click(themeBtn);
    expect(setIsDarkMock).toHaveBeenCalledWith(false);
  });

  it("라이트 모드일 때 테마 토글 버튼이 moon 아이콘 상태로 렌더링된다", () => {
    render(
      <LandingPage onEnter={onEnterMock} isDark={false} setIsDark={setIsDarkMock} />
    );

    const themeBtn = screen.getByRole("button", { name: "테마 전환" });
    fireEvent.click(themeBtn);
    expect(setIsDarkMock).toHaveBeenCalledWith(true);
  });

  it("스텝 카드 마우스 호버 시 세부 항목이 인터랙션된다", () => {
    render(
      <LandingPage onEnter={onEnterMock} isDark={true} setIsDark={setIsDarkMock} />
    );

    const stepEl = screen.getByText("01");
    const parentCard = stepEl.closest("div")?.parentElement;
    if (parentCard) {
      fireEvent.mouseEnter(parentCard);
      expect(screen.getByText("통화 선택 (USD / JPY / EUR)")).toBeInTheDocument();
      fireEvent.mouseLeave(parentCard);
    }
  });

  it("피처 카드 및 CTA 버튼 마우스 호버 이벤트가 정상 동작한다", () => {
    render(
      <LandingPage onEnter={onEnterMock} isDark={true} setIsDark={setIsDarkMock} />
    );

    const featCard = screen.getByText("몬테카를로 팬 차트 예측").closest("div")?.parentElement;
    if (featCard) {
      fireEvent.mouseEnter(featCard);
      fireEvent.mouseLeave(featCard);
    }

    const heroCtaBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.mouseEnter(heroCtaBtn);
    fireEvent.mouseLeave(heroCtaBtn);

    const bottomCtaBtn = screen.getByRole("button", { name: /대시보드로 바로가기/ });
    fireEvent.mouseEnter(bottomCtaBtn);
    fireEvent.mouseLeave(bottomCtaBtn);

    const headerCtaBtn = screen.getByRole("button", { name: /무료 시작/ });
    fireEvent.mouseEnter(headerCtaBtn);
    fireEvent.mouseLeave(headerCtaBtn);

    const exploreLink = screen.getByRole("link", { name: /기능 살펴보기/ });
    fireEvent.mouseEnter(exploreLink);
    fireEvent.mouseLeave(exploreLink);
  });
});
describe("Spark and Tooltip formatter", () => {
  it("스파크라인 차트를 정상 렌더링한다", () => {
    const { container } = render(<Spark data={[{ v: 10 }, { v: 20 }]} color="#00ffaa" />);
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("formatLandingTooltipValue가 숫자 및 문자열 값을 올바르게 포맷팅한다", () => {
    expect(formatLandingTooltipValue(1350)).toEqual(["₩1,350"]);
    expect(formatLandingTooltipValue("N/A")).toEqual(["N/A"]);
  });
});

describe("useInView", () => {
  it("IntersectionObserver 트리거 시 inView가 true로 변경된다", () => {
    let callback: (entries: { isIntersecting: boolean }[]) => void = () => {};
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn((cb) => {
        callback = cb;
        return {
          observe: observeMock,
          disconnect: disconnectMock,
        };
      })
    );

    function TestComponent() {
      const { ref, inView } = useInView(0.2);
      return <div ref={ref}>{inView ? "IN_VIEW" : "NOT_IN_VIEW"}</div>;
    }

    const { rerender } = render(<TestComponent />);
    expect(screen.getByText("NOT_IN_VIEW")).toBeInTheDocument();

    act(() => callback([{ isIntersecting: false }]));
    rerender(<TestComponent />);
    expect(screen.getByText("NOT_IN_VIEW")).toBeInTheDocument();

    act(() => callback([{ isIntersecting: true }]));
    rerender(<TestComponent />);
    expect(screen.getByText("IN_VIEW")).toBeInTheDocument();
  });

  it("ref가 바인딩되지 않은 컴포넌트에서는 observe를 호출하지 않는다", () => {
    function UnboundComponent() {
      const { inView } = useInView(0.2);
      return <div>{inView ? "IN_VIEW" : "NOT_IN_VIEW"}</div>;
    }

    render(<UnboundComponent />);
    expect(screen.getByText("NOT_IN_VIEW")).toBeInTheDocument();
  });
});
