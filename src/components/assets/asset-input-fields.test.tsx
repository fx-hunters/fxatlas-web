import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AssetInputFields } from "./asset-input-fields";

describe("AssetInputFields", () => {
  it("세 자산 입력값을 표시하고 변경값과 빈 값을 구분해 전달한다", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <AssetInputFields
        values={{ overseasStocks: "1200000" }}
        onChange={onChange}
      />,
    );

    expect(screen.getByLabelText("해외주식 금액")).toHaveValue("1200000");
    expect(screen.getByLabelText("외화예금 금액")).toHaveValue("");
    expect(screen.getByLabelText("원화 자산 금액")).toHaveValue("");

    fireEvent.change(screen.getByLabelText("외화예금 금액"), {
      target: { value: "350000" },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      "foreignCurrencyDeposits",
      "350000",
    );

    rerender(
      <AssetInputFields
        values={{ foreignCurrencyDeposits: "350000" }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("외화예금 금액"), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      "foreignCurrencyDeposits",
      undefined,
    );
  });
});
