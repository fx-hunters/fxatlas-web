import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { MarketPricePoint } from "../../types/home";

interface SparklineChartProps {
  readonly data: readonly MarketPricePoint[];
  readonly height?: number;
  readonly strokeColor?: string;
  readonly gradientId?: string;
  readonly className?: string;
}

export function SparklineChart({
  data,
  height = 80,
  strokeColor = "var(--primary)",
  gradientId = "colorPrice",
  className = "",
}: SparklineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: "0.75rem",
        }}
      >
        데이터 없음
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div
      className={`sparkline-chart ${className}`}
      style={{ width: "100%", height: `${height}px` }}
      role="img"
      aria-label={`환율 추이: 최저 ${minPrice.toFixed(1)}, 최고 ${maxPrice.toFixed(1)}`}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={[...data]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
