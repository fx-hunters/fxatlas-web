import "./asset-input-fields.css";

export type AssetInputField =
  | "overseasStocks"
  | "foreignCurrencyDeposits"
  | "krwAssets";

export interface AssetInputValues {
  readonly overseasStocks?: string;
  readonly foreignCurrencyDeposits?: string;
  readonly krwAssets?: string;
}

interface AssetInputFieldsProps {
  readonly values: AssetInputValues;
  readonly onChange: (field: AssetInputField, value: string | undefined) => void;
}

const ASSET_FIELDS: readonly {
  readonly id: AssetInputField;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    id: "overseasStocks",
    label: "해외주식",
    description: "현재 보유한 해외주식 금액",
  },
  {
    id: "foreignCurrencyDeposits",
    label: "외화예금",
    description: "외화 통장과 예금의 보유 금액",
  },
  {
    id: "krwAssets",
    label: "원화 자산",
    description: "원화로 보유 중인 현금과 예금 금액",
  },
] as const;

export function AssetInputFields({ values, onChange }: AssetInputFieldsProps) {
  return (
    <div className="asset-input-fields">
      {ASSET_FIELDS.map((field) => (
        <label className="asset-input-fields__field" key={field.id}>
          <span className="asset-input-fields__label">{field.label}</span>
          <span className="asset-input-fields__description">
            {field.description}
          </span>
          <span className="asset-input-fields__control">
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              aria-label={`${field.label} 금액`}
              placeholder="금액 입력"
              value={values[field.id] ?? ""}
              onChange={(event) =>
                onChange(field.id, event.target.value || undefined)
              }
            />
          </span>
        </label>
      ))}
    </div>
  );
}
