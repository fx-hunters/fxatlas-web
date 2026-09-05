interface ProgressBarProps {
  /** 0 ~ 1 사이의 비율 (또는 0 ~ 100 사이의 값) */
  readonly ratio: number;
  readonly color?: string;
  readonly height?: number | string;
  readonly label?: string;
  readonly className?: string;
}

export function ProgressBar({
  ratio,
  color = "var(--primary)",
  height = 8,
  label,
  className = "",
}: ProgressBarProps) {
  // 0~1 비율이거나 0~100 퍼센트인 경우 0~100으로 정규화
  const clampedRatio = ratio > 1 ? Math.min(Math.max(ratio, 0), 100) : Math.min(Math.max(ratio * 100, 0), 100);

  return (
    <div className={`progress-bar ${className}`} style={{ width: "100%" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            fontWeight: 500,
            marginBottom: "0.375rem",
          }}
        >
          <span>{label}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(clampedRatio)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clampedRatio)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: "100%",
          height: typeof height === "number" ? `${height}px` : height,
          backgroundColor: "var(--border)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          className="progress-bar-fill-animated"
          style={{
            width: `${clampedRatio}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "inherit",
            boxShadow: color === "var(--primary)" ? "0 0 8px var(--primary)" : undefined,
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, box-shadow 0.2s ease",
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
}
