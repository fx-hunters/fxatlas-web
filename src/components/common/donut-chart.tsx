interface DonutChartProps {
  /** 0 ~ 100 사이의 퍼센트 값 */
  readonly percent: number;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly color?: string;
  readonly trackColor?: string;
  readonly label?: string;
  readonly className?: string;
}

export function DonutChart({
  percent,
  size = 128,
  strokeWidth = 14,
  color = "var(--usd)",
  trackColor = "var(--border)",
  label,
  className = "",
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div
      className={`donut-chart ${className}`}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={label ?? `외화 비중 ${Math.round(clampedPercent)}%`}
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* 배경 트랙 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 채워진 세그먼트 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {/* 중앙 텍스트 */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          fontVariantNumeric: "tabular-nums",
          fontWeight: 700,
          color: "var(--text)",
        }}
      >
        <span style={{ fontSize: `${size * 0.22}px` }}>{Math.round(clampedPercent)}</span>
        <span style={{ fontSize: `${size * 0.12}px`, color: "var(--text-muted)", marginLeft: "1px" }}>%</span>
      </div>
    </div>
  );
}
