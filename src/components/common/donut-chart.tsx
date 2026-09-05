import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const outerRadius = size / 2;
  const innerRadius = Math.max(0, outerRadius - strokeWidth);

  const data = [
    { name: "value", value: Number(clampedPercent.toFixed(1)) },
    { name: "track", value: Number((100 - clampedPercent).toFixed(1)) },
  ];

  return (
    <div
      className={`donut-chart relative flex items-center justify-center shrink-0 ${className}`}
      style={{
        position: "relative",
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={label ?? `외화 비중 ${Math.round(clampedPercent)}%`}
      role="img"
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={color} />
            <Cell fill={trackColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* 중앙 텍스트 */}
      <div
        className="absolute flex items-baseline justify-center pointer-events-none"
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
