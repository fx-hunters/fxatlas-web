import { useState } from "react";
import type { FanChartDataPoint } from "../../types/forecast";

interface FanChartProps {
  readonly data: readonly FanChartDataPoint[];
  readonly currency: string;
}

export function FanChart({ data, currency }: FanChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        데이터가 없습니다.
      </div>
    );
  }

  const svgWidth = 680;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Min / Max 계산
  const validValues: number[] = [];
  data.forEach((d) => {
    if (d.price !== null) validValues.push(d.price);
    if (d.projected !== null) validValues.push(d.projected);
    if (d.range80Upper !== null) validValues.push(d.range80Upper);
    if (d.range80Lower !== null) validValues.push(d.range80Lower);
  });

  const rawMin = validValues.length > 0 ? Math.min(...validValues) : 1300;
  const rawMax = validValues.length > 0 ? Math.max(...validValues) : 1450;
  const marginY = (rawMax - rawMin) * 0.1 || 10;
  const minY = Math.floor(rawMin - marginY);
  const maxY = Math.ceil(rawMax + marginY);
  const rangeY = maxY - minY || 1;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minY) / rangeY) * innerHeight;

  // 80% 밴드 폴리곤 경로
  const futurePoints = data
    .map((d, i) => ({ d, i }))
    .filter((item) => item.d.range80Upper !== null && item.d.range80Lower !== null);

  const range80Points =
    futurePoints.length > 0
      ? [
          ...futurePoints.map((item) => `${getX(item.i)},${getY(item.d.range80Upper!)}`),
          ...futurePoints
            .slice()
            .reverse()
            .map((item) => `${getX(item.i)},${getY(item.d.range80Lower!)}`),
        ].join(" ")
      : "";

  // 50% 밴드 폴리곤 경로
  const range50Points =
    futurePoints.length > 0
      ? [
          ...futurePoints.map((item) => `${getX(item.i)},${getY(item.d.range50Upper!)}`),
          ...futurePoints
            .slice()
            .reverse()
            .map((item) => `${getX(item.i)},${getY(item.d.range50Lower!)}`),
        ].join(" ")
      : "";

  // 실제 가격 라인 (과거)
  const pastPoints = data.map((d, i) => ({ d, i })).filter((item) => item.d.price !== null);
  const pastPathD =
    pastPoints.length > 0
      ? pastPoints
          .map((item, idx) => `${idx === 0 ? "M" : "L"} ${getX(item.i)} ${getY(item.d.price!)}`)
          .join(" ")
      : "";

  // 투영 시나리오 라인 (미래 점선)
  const projPoints = data.map((d, i) => ({ d, i })).filter((item) => item.d.projected !== null);
  const projPathD =
    projPoints.length > 0
      ? projPoints
          .map((item, idx) => `${idx === 0 ? "M" : "L"} ${getX(item.i)} ${getY(item.d.projected!)}`)
          .join(" ")
      : "";

  // Y축 눈금선 (4개)
  const yTicks = [minY, minY + rangeY * 0.33, minY + rangeY * 0.66, maxY];

  // X축 눈금 (주요 5개)
  const xTickIndices = [
    0,
    Math.floor(data.length * 0.25),
    Math.floor(data.length * 0.5),
    Math.floor(data.length * 0.75),
    data.length - 1,
  ];

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "280px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        role="img"
        aria-label={`시뮬레이션 팬 차트 (${currency}/KRW)`}
      >
        {/* Y축 그리드 라인 & 레이블 */}
        {yTicks.map((val, idx) => {
          const y = getY(val);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--text-muted)"
                fontFamily="inherit"
              >
                {Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* X축 레이블 */}
        {xTickIndices.map((idx) => {
          const point = data[idx];
          if (!point) return null;
          const x = getX(idx);
          return (
            <text
              key={idx}
              x={x}
              y={svgHeight - 12}
              textAnchor="middle"
              fontSize="11"
              fontWeight={point.day === "T0" ? 700 : 500}
              fill={point.day === "T0" ? "var(--primary)" : "var(--text-muted)"}
              fontFamily="inherit"
            >
              {point.day}
            </text>
          );
        })}

        {/* 80% 신뢰 밴드 영역 */}
        {range80Points && (
          <polygon
            points={range80Points}
            fill="var(--primary)"
            fillOpacity={0.08}
            stroke="none"
          />
        )}

        {/* 50% 신뢰 밴드 영역 */}
        {range50Points && (
          <polygon
            points={range50Points}
            fill="var(--primary)"
            fillOpacity={0.16}
            stroke="none"
          />
        )}

        {/* 미래 투영 중심선 (점선) */}
        {projPathD && (
          <path
            d={projPathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeDasharray="5 5"
            opacity={0.85}
          />
        )}

        {/* 과거 실제 가격선 (실선) */}
        {pastPathD && (
          <path
            d={pastPathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* 마우스 호버 감지용 인터랙티브 수직 영역 */}
        {data.map((d, i) => {
          const x = getX(i);
          const colWidth = innerWidth / data.length;
          return (
            <rect
              key={i}
              x={x - colWidth / 2}
              y={padding.top}
              width={colWidth}
              height={innerHeight}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {/* 호버 인디케이터 라인 & 포인트 */}
        {hoveredIndex !== null && activePoint && (
          <g>
            <line
              x1={getX(hoveredIndex)}
              y1={padding.top}
              x2={getX(hoveredIndex)}
              y2={padding.top + innerHeight}
              stroke="var(--text-muted)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            {activePoint.price !== null && (
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(activePoint.price)}
                r={4.5}
                fill="var(--primary)"
                stroke="var(--surface)"
                strokeWidth={2}
              />
            )}
            {activePoint.price === null && activePoint.projected !== null && (
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(activePoint.projected)}
                r={4}
                fill="var(--surface)"
                stroke="var(--primary)"
                strokeWidth={2}
              />
            )}
          </g>
        )}
      </svg>

      {/* 툴팁 오버레이 */}
      {hoveredIndex !== null && activePoint && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "10px",
            right: "20px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.75rem",
            boxShadow: "var(--shadow-md)",
            pointerEvents: "none",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <div style={{ fontWeight: 700, color: "var(--text)" }}>
            {activePoint.day} ({currency}/KRW)
          </div>
          {activePoint.price !== null && (
            <div style={{ color: "var(--primary)", fontWeight: 600 }}>
              실제 환율: ₩{activePoint.price.toLocaleString()}
            </div>
          )}
          {activePoint.projected !== null && activePoint.price === null && (
            <div style={{ color: "var(--primary)", fontWeight: 600 }}>
              시나리오 중심: ₩{activePoint.projected.toLocaleString()}
            </div>
          )}
          {activePoint.range80Lower !== null && activePoint.range80Upper !== null && (
            <div style={{ color: "var(--text-muted)" }}>
              80% 범위: {activePoint.range80Lower.toLocaleString()} ~ {activePoint.range80Upper.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
