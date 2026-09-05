import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useTheme } from "./use-theme";

describe("useTheme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark", "light");
  });

  it("기본으로 dark 테마를 적용한다", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggleTheme을 호출하면 light와 dark를 상호 전환한다", () => {
    const { result } = renderHook(() => useTheme("dark"));

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("초기 테마를 light로 지정할 수 있다", () => {
    const { result } = renderHook(() => useTheme("light"));
    expect(result.current.theme).toBe("light");
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});
