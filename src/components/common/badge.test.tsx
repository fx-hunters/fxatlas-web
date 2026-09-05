import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge, type BadgeVariant } from "./badge";

describe("Badge", () => {
  const variants: BadgeVariant[] = ["default", "primary", "normal", "warn", "danger"];

  it.each(variants)("%s variant 뱃지를 렌더링한다", (variant) => {
    render(<Badge variant={variant}>{variant} 뱃지</Badge>);
    expect(screen.getByText(`${variant} 뱃지`)).toBeInTheDocument();
  });
});
