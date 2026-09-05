import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "./card";

describe("Card", () => {
  it("자식 요소와 제목, 부제목, 액션을 렌더링한다", () => {
    render(
      <Card
        title="카드 제목"
        subtitle="카드 설명"
        action={<button>액션</button>}
        highlight
      >
        <p>본문 내용</p>
      </Card>,
    );

    expect(screen.getByRole("heading", { name: "카드 제목" })).toBeInTheDocument();
    expect(screen.getByText("카드 설명")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "액션" })).toBeInTheDocument();
    expect(screen.getByText("본문 내용")).toBeInTheDocument();
  });

  it("헤더 항목이 없을 때는 헤더 컨테이너를 렌더링하지 않는다", () => {
    const { container } = render(<Card><div>단독 본문</div></Card>);
    expect(screen.getByText("단독 본문")).toBeInTheDocument();
    expect(container.querySelector("h3")).not.toBeInTheDocument();
  });
});
