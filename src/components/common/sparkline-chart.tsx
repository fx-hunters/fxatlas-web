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
  gradientId = "sparkline-gradient",
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
  const priceRange = maxPrice - minPrice || 1;

  const width = 300;
  const paddingX = 8;
  const paddingY = 8;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * usableWidth;
    const y = paddingY + usableHeight - ((d.price - minPrice) / priceRange) * usableHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? width} ${height} L ${points[0]?.x ?? 0} ${height} Z`;

  return (
    <div className={`sparkline-chart ${className}`} style={{ width: "100%", height: `${height}px` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        role="img"
        aria-label={`환율 추이: 최저 ${minPrice.toFixed(1)}, 최고 ${maxPrice.toFixed(1)}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
      </svg>
    </div>
  );
}
