import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RouteScreen } from "./route-screen";

describe("RouteScreen", () => {
  it("초기 렌더링 시 목표 목록을 렌더링한다", () => {
    render(<RouteScreen isDemo={true} />);
    expect(screen.getByRole("heading", { name: "목표 목록" })).toBeInTheDocument();
    expect(screen.getByText("미국 주식 정기매수")).toBeInTheDocument();
  });

  it("목표 생성 버튼 클릭 시 생성 폼으로 이동하고 생성 후 상세 화면이 노출된다", () => {
    render(<RouteScreen isDemo={true} />);

    fireEvent.click(screen.getByRole("button", { name: "새 목표 만들기 +" }));
    expect(screen.getByRole("heading", { name: "새 목표 생성" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("3. 목표 이름"), {
      target: { value: "신규 유학 자금" },
    });
    fireEvent.click(screen.getByRole("button", { name: "계획 수립하기" }));

    expect(screen.getByRole("heading", { name: "신규 유학 자금 계획" })).toBeInTheDocument();
  });

  it("목표 카드 클릭 시 상세 화면으로 이동하고 수정 모드로 진입할 수 있다", () => {
    render(<RouteScreen isDemo={true} />);

    fireEvent.click(screen.getByText("미국 주식 정기매수"));
    expect(screen.getByRole("heading", { name: "미국 주식 정기매수 계획" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "목표 수정" }));
    expect(screen.getByRole("heading", { name: "목표 수정" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("3. 목표 이름"), {
      target: { value: "미국 주식 월 2회 매수" },
    });
    fireEvent.click(screen.getByRole("button", { name: "목표 수정 저장" }));

    expect(screen.getByRole("heading", { name: "미국 주식 월 2회 매수 계획" })).toBeInTheDocument();
  });

  it("목표 상세에서 삭제 시 목록으로 돌아가고 목표가 제거된다", () => {
    render(<RouteScreen isDemo={true} />);

    fireEvent.click(screen.getByText("도쿄 여행 경비"));
    expect(screen.getByRole("heading", { name: "도쿄 여행 경비 계획" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.getByRole("heading", { name: "목표 목록" })).toBeInTheDocument();
    expect(screen.queryByText("도쿄 여행 경비")).not.toBeInTheDocument();
  });
});
