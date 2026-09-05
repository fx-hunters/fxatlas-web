import { useState } from "react";
import { DonutChart } from "../../components/common/donut-chart";
import { Badge } from "../../components/common/badge";
import { Icon } from "../../components/common/icon";
import type { XRayDashboardData, StressScenarioItem } from "../../types/xray";

interface XRayExposureViewProps {
  readonly data: XRayDashboardData;
  readonly selectedScenarioId: string;
  readonly activeScenario: StressScenarioItem;
  readonly onSelectScenario: (id: string) => void;
  readonly onNavigateToPlanner: () => void;
  readonly onOpenAssetEdit: () => void;
}

export function XRayExposureView({
  data,
  selectedScenarioId,
  activeScenario,
  onSelectScenario,
  onNavigateToPlanner,
  onOpenAssetEdit,
}: XRayExposureViewProps) {
  const [isAssetEditSuccess, setIsAssetEditSuccess] = useState(false);

  const handleAssetEditClick = () => {
    onOpenAssetEdit();
    setIsAssetEditSuccess(true);
    setTimeout(() => {
      setIsAssetEditSuccess(false);
    }, 2000);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
      {/* 좌측 컬럼: 외화 비중, 통화별 노출, 예정 외화 지출 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* 외화 비중 카드 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
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
              marginBottom: "1.25rem",
            }}
          >
            외화 비중
          </h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "var(--text)",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}
              >
                {data.fxRatioPct}
                <span style={{ fontSize: "1.75rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: "2px" }}>
                  %
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--usd)",
                  marginTop: "0.75rem",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                외화 ₩{data.fxKrw.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  marginTop: "0.25rem",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                원화 ₩{data.krwAmount.toLocaleString()}
              </div>
            </div>

            <div style={{ width: "120px", height: "120px", flexShrink: 0 }}>
              <DonutChart percent={data.fxRatioPct} size={120} strokeWidth={16} color="var(--usd)" />
            </div>
          </div>
        </div>

        {/* 통화별 노출 카드 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              통화별 노출
            </h2>
            <Badge variant="danger">집중 높음</Badge>
          </div>

          {/* 다중 통화 게이지 바 (60% 기준선 마커 포함) */}
          <div
            style={{
              height: "16px",
              width: "100%",
              backgroundColor: "var(--border)",
              borderRadius: "var(--radius-full)",
              display: "flex",
              position: "relative",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            {/* 60% 기준선 빨간색 마커 */}
            <div
              style={{
                position: "absolute",
                left: `${data.exposureBreakdown.baselinePct}%`,
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: "var(--danger)",
                zIndex: 10,
                boxShadow: "0 0 6px var(--danger)",
              }}
            />
            <div style={{ width: `${data.exposureBreakdown.usd}%`, backgroundColor: "var(--usd)", height: "100%" }} />
            <div style={{ width: `${data.exposureBreakdown.jpy}%`, backgroundColor: "var(--jpy)", height: "100%" }} />
            <div style={{ width: `${data.exposureBreakdown.eur}%`, backgroundColor: "var(--eur)", height: "100%" }} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <div style={{ display: "flex", gap: "0.875rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "var(--usd)" }} />
                USD {data.exposureBreakdown.usd}%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "var(--jpy)" }} />
                JPY {data.exposureBreakdown.jpy}%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "var(--eur)" }} />
                EUR {data.exposureBreakdown.eur}%
              </span>
            </div>
            <span style={{ color: "var(--danger)" }}>기준선 {data.exposureBreakdown.baselinePct}%</span>
          </div>
        </div>

        {/* 예정 외화 지출 및 환율 민감도 카드 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
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
              marginBottom: "1rem",
            }}
          >
            예정 외화 지출 (플래너 연동)
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.875rem 1rem",
              backgroundColor: "var(--bg)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>
                {data.scheduledExpenditure.title}
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {data.scheduledExpenditure.dateLabel}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--usd)", fontVariantNumeric: "tabular-nums" }}>
                ${data.scheduledExpenditure.amountUsd.toLocaleString()}
              </div>
              <button
                type="button"
                onClick={onNavigateToPlanner}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--usd)",
                  textDecoration: "underline",
                  marginTop: "0.125rem",
                }}
              >
                계획 수정
              </button>
            </div>
          </div>

          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.75rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            환율 민감도
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.875rem",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>1% 상승 시</span>
            <span style={{ color: "var(--normal)", fontWeight: 700 }}>
              +₩ {data.fxSensitivity1PctKrw.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 우측 컬럼: 손익 분해 테이블, 종목 상세, 스트레스 시나리오 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* 손익 분해 카드 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              손익 분해
            </h2>
            <button
              type="button"
              onClick={handleAssetEditClick}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                padding: "0.375rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                transition: "all 0.15s ease",
              }}
            >
              <span>자산 편집</span>
              <Icon name="edit" size={13} />
            </button>
          </div>

          {isAssetEditSuccess && (
            <div
              role="status"
              style={{
                fontSize: "0.75rem",
                color: "var(--primary)",
                backgroundColor: "var(--primary-subtle)",
                padding: "0.5rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: "0.75rem",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              자산 편집 모달이 준비 중입니다.
            </div>
          )}

          {/* 손익 분해 테이블 */}
          <div style={{ overflowX: "auto", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
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
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 600 }}>항목</th>
                  <th style={{ paddingBottom: "0.75rem", textAlign: "right", fontWeight: 600 }}>금액 (KRW)</th>
                  <th style={{ paddingBottom: "0.75rem", textAlign: "right", fontWeight: 600 }}>비율</th>
                </tr>
              </thead>
              <tbody style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                <tr style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.875rem 0", color: "var(--text-muted)" }}>매입 원가</td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right" }}>
                    {data.pnl.costBasisKrw.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", color: "var(--text-muted)" }}>-</td>
                </tr>
                <tr style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.875rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "6px", height: "16px", borderRadius: "3px", backgroundColor: "var(--normal)" }} />
                    <span>주가 기여</span>
                  </td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", color: "var(--normal)" }}>
                    +{data.pnl.stockReturnKrw.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", color: "var(--normal)" }}>
                    +{data.pnl.stockReturnPct}%
                  </td>
                </tr>
                <tr style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.875rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "6px", height: "16px", borderRadius: "3px", backgroundColor: "var(--normal)" }} />
                    <span>환율 기여</span>
                  </td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", color: "var(--normal)" }}>
                    +{data.pnl.fxReturnKrw.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", color: "var(--normal)" }}>
                    +{data.pnl.fxReturnPct}%
                  </td>
                </tr>
                <tr style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.875rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "6px", height: "16px", borderRadius: "3px", backgroundColor: "var(--text-muted)" }} />
                    <span style={{ color: "var(--text-muted)" }}>상호 작용</span>
                  </td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", color: "var(--text-muted)" }}>
                    {data.pnl.interactionKrw.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", color: "var(--text-muted)" }}>
                    {data.pnl.interactionPct}%
                  </td>
                </tr>
                <tr
                  style={{
                    backgroundColor: "var(--primary-subtle)",
                    borderTop: "1px solid var(--border)",
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  <td style={{ padding: "0.875rem 0.5rem" }}>현재 평가액</td>
                  <td style={{ padding: "0.875rem 0.5rem", textAlign: "right", color: "var(--primary)" }}>
                    {data.pnl.totalValuationKrw.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.875rem 0.5rem", textAlign: "right", color: "var(--primary)" }}>
                    +{data.pnl.totalReturnPct}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 종목별 상세 아코디언 */}
          <details
            style={{
              backgroundColor: "var(--bg)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              marginTop: "auto",
            }}
          >
            <summary
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.875rem 1rem",
                outline: "none",
              }}
            >
              <span>종목별 상세 (접힘)</span>
              <Icon name="chevronDown" size={15} />
            </summary>
            <div
              style={{
                padding: "0 1rem 0.875rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {data.pnl.stockHoldings.map((stock) => {
                const isPositive = stock.returnPct >= 0;
                return (
                  <div
                    key={stock.symbol}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      padding: "0.5rem 0",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ color: "var(--text)" }}>{stock.symbol}</span>
                    <Badge variant={isPositive ? "default" : "danger"}>
                      {isPositive ? `+${stock.returnPct}%` : `${stock.returnPct}%`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </details>
        </div>

        {/* 스트레스 시나리오 카드 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
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
              marginBottom: "1rem",
            }}
          >
            스트레스 시나리오
          </h2>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {data.scenarios.map((scenario) => {
              const isSelected = scenario.id === selectedScenarioId;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => onSelectScenario(scenario.id)}
                  style={{
                    padding: "0.375rem 0.875rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isSelected ? "var(--primary)" : "var(--bg)",
                    color: isSelected ? "var(--primary-content)" : "var(--text)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {scenario.label}
                </button>
              );
            })}
          </div>

          {/* 시나리오 결과 박스 */}
          <div
            style={{
              padding: "1rem 1.25rem",
              backgroundColor: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>
                {activeScenario.title}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--danger)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  marginTop: "0.25rem",
                }}
              >
                <Icon name="check" size={13} />
                <span>{activeScenario.defenseMessage}</span>
              </div>
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--danger)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
            >
              ₩ {activeScenario.resultKrw.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
