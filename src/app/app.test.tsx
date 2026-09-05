import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { App } from "./app";

describe("App", () => {
  it("서비스명을 렌더링한다", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "FxAtlas" })).toBeInTheDocument();
  });
});
