import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
} from "recharts";
import type { FanChartDataPoint } from "../../types/forecast";

interface FanChartProps {
  readonly data: readonly FanChartDataPoint[];
  readonly currency: string;
}

export function formatYTick(v: number | string, idx: number): string {
  return idx === 0 ? "" : Number(v).toLocaleString();
}

export function formatTooltipValue(value: unknown): [string] {
  return [typeof value === "number" ? `₩${value.toLocaleString()}` : String(value)];
}

export function FanChart({ data, currency }: FanChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        데이터가 없습니다.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    day: d.day,
    price: d.price,
    projected: d.projected,
    range80Upper: d.range80Upper,
    range80Lower: d.range80Lower,
    range50Upper: d.range50Upper,
    range50Lower: d.range50Lower,
    range80_upper: d.range80Upper,
    range80_lower: d.range80Lower,
    range50_upper: d.range50Upper,
    range50_lower: d.range50Lower,
  }));

  return (
    <div
      className="w-full h-full min-h-[280px]"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "280px",
      }}
      role="img"
      aria-label={`시뮬레이션 팬 차트 (${currency}/KRW)`}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <ComposedChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
          <XAxis
            dataKey="day"
            stroke="var(--text-muted)"
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            minTickGap={30}
          />
          <YAxis
            domain={["auto", "auto"]}
            stroke="var(--text-muted)"
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            width={55}
            tickFormatter={formatYTick}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={formatTooltipValue}
          />
          <Area
            type="monotone"
            dataKey="range80_upper"
            name="80% 상한"
            stroke="none"
            fill="var(--border)"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="range80_lower"
            name="80% 하한"
            stroke="none"
            fill="var(--bg)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="range50_upper"
            name="50% 상한"
            stroke="none"
            fill="var(--text-muted)"
            fillOpacity={0.1}
          />
          <Area
            type="monotone"
            dataKey="range50_lower"
            name="50% 하한"
            stroke="none"
            fill="var(--surface)"
            fillOpacity={1}
          />
          <Line
            type="monotone"
            dataKey="price"
            name="실제 환율"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="투영 시나리오"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
