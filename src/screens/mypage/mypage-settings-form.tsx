import { useState } from "react";
import type {
  NotificationSettingKey,
  SettingsUpdateRequest,
} from "../../api/generated/divurve-api";
import type { SettingsView } from "../../types/mypage";
import type { SettingsSaveState } from "./use-mypage";

interface MyPageSettingsFormProps {
  readonly settings: SettingsView;
  readonly saveState: SettingsSaveState;
  readonly onSave: (input: SettingsUpdateRequest) => void;
}

const PANEL_STYLE = {
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  padding: "1.5rem",
  borderRadius: "var(--radius-xl)",
} as const;

/**
 * 기본 설정 폼.
 *
 * 조회가 끝난 뒤에만 마운트되므로 서버 값으로 state를 직접 초기화한다.
 * 실효 스프레드는 서버가 계산한 값을 그대로 보여 준다(§AGENTS 1).
 */
export function MyPageSettingsForm({
  settings,
  saveState,
  onSave,
}: MyPageSettingsFormProps) {
  const [discountPercent, setDiscountPercent] = useState(
    settings.discountPercent,
  );
  const [notifications, setNotifications] = useState<
    Readonly<Record<NotificationSettingKey, boolean>>
  >(() =>
    Object.fromEntries(
      settings.notificationSettings.map((item) => [item.key, item.isEnabled]),
    ) as Record<NotificationSettingKey, boolean>,
  );
  const isDirty = discountPercent !== settings.discountPercent;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ fxDiscountRatio: discountPercent / 100, ...notifications });
      }}
      style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
    >
      <div style={PANEL_STYLE}>
        <label
          htmlFor="bank-rate-slider"
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
            color: "var(--text)",
          }}
        >
          주거래 은행 우대율
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <input
            id="bank-rate-slider"
            type="range"
            min={0}
            max={100}
            value={discountPercent}
            onChange={(event) => setDiscountPercent(Number(event.target.value))}
            style={{ flex: 1, accentColor: "var(--primary)", cursor: "pointer" }}
          />
          <span
            style={{
              width: "5rem",
              textAlign: "center",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-lg)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text)",
              fontVariantNumeric: "tabular-nums",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {discountPercent}%
          </span>
        </div>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "var(--text-muted)",
            marginTop: "1.25rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          기준 스프레드 {settings.baseSpreadLabel} · 실효 스프레드{" "}
          {settings.effectiveSpreadLabel} (서버 계산값)
          {isDirty && " · 저장하면 갱신됩니다"}
        </p>
      </div>

      <div style={PANEL_STYLE}>
        <h3
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
            color: "var(--text)",
          }}
        >
          알림 설정 (계획 변화 기준)
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {settings.notificationSettings.map((item) => (
            <label
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={() =>
                  setNotifications((current) => ({
                    ...current,
                    [item.key]: !current[item.key],
                  }))
                }
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  accentColor: "var(--primary)",
                  cursor: "pointer",
                }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text)",
                }}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: "1.25rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          설명 수준 {settings.explainLevel} · 설명 분야 {settings.explainDomain}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="submit"
          disabled={saveState.status === "saving"}
          className="btn-primary-glow"
          style={{
            padding: "0.75rem 1.25rem",
            backgroundColor: "var(--primary)",
            color: "var(--primary-content)",
            borderRadius: "var(--radius-xl)",
            fontWeight: 700,
            fontSize: "0.875rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          {saveState.status === "saving" ? "저장 중…" : "설정 저장"}
        </button>
        {saveState.status === "saved" && (
          <span role="status" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            서버에 저장했습니다.
          </span>
        )}
        {saveState.status === "error" && (
          <span role="alert" style={{ color: "var(--danger)", fontSize: "0.875rem" }}>
            {saveState.message}
          </span>
        )}
      </div>
    </form>
  );
}
