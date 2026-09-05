import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AttentionBanner } from "./attention-banner";
import type { AttentionAlertData } from "../../types/home";

describe("AttentionBanner", () => {
  const sampleAlert: AttentionAlertData = {
    currency: "JPY",
    title: "JPY 임박 이벤트",
    message: "내일 BOJ 금리 결정. 안전 버킷 하한을 점검하세요.",
    targetTab: "planner",
  };

  it("경고 알림이 있을 때 제목, 메시지, 플래너 이동 링크를 렌더링한다", () => {
    const onNavigateToPlanner = vi.fn();
    render(<AttentionBanner alert={sampleAlert} onNavigateToPlanner={onNavigateToPlanner} />);

    expect(screen.getByText("주의 필요")).toBeInTheDocument();
    expect(screen.getByText("JPY 임박 이벤트")).toBeInTheDocument();
    expect(screen.getByText(/내일 BOJ 금리 결정/)).toBeInTheDocument();

    const link = screen.getByRole("button", { name: /플래너 확인하기/ });
    fireEvent.click(link);
    expect(onNavigateToPlanner).toHaveBeenCalled();
  });

  it("알림 데이터가 없을 때 null을 렌더링한다", () => {
    const { container } = render(<AttentionBanner alert={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
