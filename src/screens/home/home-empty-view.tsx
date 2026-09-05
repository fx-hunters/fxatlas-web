import { Icon } from "../../components/common/icon";

interface HomeEmptyViewProps {
  readonly onNavigateToPlanner: () => void;
}

export function HomeEmptyView({ onNavigateToPlanner }: HomeEmptyViewProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 1.5rem",
        textAlign: "center",
        backgroundColor: "var(--surface)",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--primary-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary)",
        }}
      >
        <Icon name="planner" size={28} />
      </div>

      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
          외화 목표가 없습니다
        </h2>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>
          첫 목표를 만들고 안전하게 외화를 확보하세요.
        </p>
      </div>

      <button
        type="button"
        onClick={onNavigateToPlanner}
        style={{
          padding: "0.875rem 1.75rem",
          backgroundColor: "var(--primary)",
          color: "var(--primary-content)",
          borderRadius: "var(--radius-md)",
          fontWeight: 700,
          fontSize: "0.9375rem",
          boxShadow: "0 4px 10px var(--primary-subtle)",
          transition: "opacity 0.15s ease",
        }}
      >
        환전 플래너로 이동
      </button>
    </div>
  );
}
