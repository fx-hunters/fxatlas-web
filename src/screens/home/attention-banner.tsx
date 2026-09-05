import { Card } from "../../components/common/card";
import { Icon } from "../../components/common/icon";
import type { AttentionAlertData } from "../../types/home";

interface AttentionBannerProps {
  readonly alert?: AttentionAlertData;
  readonly onNavigateToPlanner?: () => void;
}

export function AttentionBanner({ alert, onNavigateToPlanner }: AttentionBannerProps) {
  if (!alert) {
    return null;
  }

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--warn)" }}>
          <Icon name="alertTriangle" size={16} />
          <span>주의 필요</span>
        </div>
      }
      className="attention-banner"
    >
      <div
        style={{
          padding: "1rem",
          backgroundColor: "var(--warn-bg)",
          border: "1px solid var(--warn-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.875rem",
          color: "var(--text)",
          animation: "barSlideInDown 0.35s var(--ease-out-smooth) forwards",
          transition: "all var(--transition-normal)",
        }}
      >
        <div style={{ fontWeight: 700, color: "var(--warn)", marginBottom: "0.25rem" }}>
          {alert.title}
        </div>
        <p style={{ margin: 0, lineHeight: 1.5, color: "var(--text)" }}>{alert.message}</p>
        {onNavigateToPlanner && (
          <button
            type="button"
            onClick={onNavigateToPlanner}
            style={{
              marginTop: "0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--warn)",
              textDecoration: "underline",
              display: "block",
              width: "100%",
              textAlign: "right",
            }}
          >
            플래너 확인하기 →
          </button>
        )}
      </div>
    </Card>
  );
}
