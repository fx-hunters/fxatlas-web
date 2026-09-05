import { Icon } from "../../components/common/icon";
import type { XRayDashboardData } from "../../types/xray";

interface XRayFitnessViewProps {
  readonly data: XRayDashboardData;
  readonly eurSimulationPct: number;
  readonly onSetEurSimulationPct: (pct: number) => void;
  readonly onNavigateToPlanner: () => void;
}

export function XRayFitnessView({
  data,
  eurSimulationPct,
  onSetEurSimulationPct,
  onNavigateToPlanner,
}: XRayFitnessViewProps) {
  // EUR 시뮬레이션 비율에 따라 조정 후 변동성 바 너비(%) 동적 계산
  const adjustedVolatilityWidthPct = Math.max(35, Math.round(75 - eurSimulationPct * 0.7));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 1행: 집중도 진단 & 쏠림 해결 가이드 네온 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* 집중도 진단 카드 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.75rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1.5rem",
            }}
          >
            집중도 진단
          </h2>
          <div
            style={{
              fontSize: "4.5rem",
              fontWeight: 800,
              color: "var(--danger)",
              marginBottom: "1rem",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {data.concentrationPct}
            <span style={{ fontSize: "2.25rem", fontWeight: 500, color: "var(--danger)", opacity: 0.7, marginLeft: "4px" }}>
              %
            </span>
          </div>
          <p
            style={{
              fontSize: "0.9375rem",
              fontWeight: 500,
              color: "var(--text)",
              borderLeft: "3px solid var(--danger)",
              paddingLeft: "0.75rem",
              lineHeight: 1.6,
            }}
          >
            주력 통화(USD) 비중이 기준선({data.concentrationBaselinePct}%)을 초과하여 집중도가 높습니다. 포트폴리오 변동성이
            증가합니다.
          </p>
        </div>

        {/* 쏠림을 고치는 방법 (네온 액센트 상단 보더 카드) */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderTop: "4px solid var(--primary)",
            borderRadius: "var(--radius-lg)",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px var(--primary-subtle)",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ color: "var(--primary)" }}>
                <Icon name="sparkles" size={18} />
              </div>
              <span>쏠림을 고치는 방법</span>
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
              }}
            >
              이미 가진 달러를 파는 것은 투자 결정이라 다루지 않습니다. 하지만 앞으로 사는 통화를 유로(EUR)나 엔(JPY)으로
              바꾸면 쏠림이 자연스럽게 줄어듭니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToPlanner}
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-content)",
              fontWeight: 700,
              fontSize: "0.875rem",
              padding: "0.875rem 1.5rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px var(--primary-subtle)",
              transition: "all 0.15s ease",
            }}
          >
            <span>새 통화 목표 만들기</span>
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </div>

      {/* 2행: 분산효과 시뮬레이터 & 통화별 성격 비교 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* 분산효과 시뮬레이터 카드 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.75rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1.5rem",
            }}
          >
            분산효과 시뮬레이터
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <label
                  htmlFor="eur-simulation-slider"
                  style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}
                >
                  EUR 추가 매수 비율 시뮬레이션
                </label>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  +{eurSimulationPct}%
                </span>
              </div>
              <input
                id="eur-simulation-slider"
                type="range"
                min="0"
                max="50"
                value={eurSimulationPct}
                onChange={(e) => onSetEurSimulationPct(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* 조정 전후 변동성 비교 바 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                backgroundColor: "var(--bg)",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.5rem",
                  }}
                >
                  조정 전 변동성
                </div>
                <div
                  style={{
                    height: "8px",
                    width: "100%",
                    backgroundColor: "var(--danger)",
                    borderRadius: "var(--radius-full)",
                    boxShadow: "0 0 6px var(--danger)",
                  }}
                />
              </div>

              <div style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                <Icon name="arrowRight" size={18} />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.5rem",
                  }}
                >
                  조정 후 변동성
                </div>
                <div
                  style={{
                    height: "8px",
                    width: `${adjustedVolatilityWidthPct}%`,
                    backgroundColor: "var(--normal)",
                    borderRadius: "var(--radius-full)",
                    boxShadow: "0 0 6px var(--normal)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 통화별 성격 비교 카드 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.75rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1.5rem",
            }}
          >
            통화별 성격 비교
          </h2>

          <div style={{ overflowX: "auto", fontSize: "0.875rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <tr>
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 600 }}>통화</th>
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 600 }}>변동성</th>
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 600 }}>유동성</th>
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 600 }}>분산기여</th>
                </tr>
              </thead>
              <tbody style={{ fontWeight: 500 }}>
                {data.currencyTraits.map((trait) => (
                  <tr key={trait.currency} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.875rem 0", fontWeight: 700, color: "var(--text)" }}>
                      {trait.currency}
                    </td>
                    <td style={{ padding: "0.875rem 0" }}>{trait.volatility}</td>
                    <td style={{ padding: "0.875rem 0" }}>{trait.liquidity}</td>
                    <td
                      style={{
                        padding: "0.875rem 0",
                        fontWeight: 600,
                        color: trait.isHighContribution ? "var(--normal)" : "var(--danger)",
                      }}
                    >
                      {trait.diversificationContribution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
