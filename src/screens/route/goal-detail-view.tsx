import { useState } from "react";
import { Icon } from "../../components/common/icon";
import { Badge } from "../../components/common/badge";
import type { GoalSummary, GoalSimulationResult } from "../../types/route";

interface GoalDetailViewProps {
  readonly goal: GoalSummary;
  readonly simulation: GoalSimulationResult;
  readonly monthlyKrw: number;
  readonly safeRatioPct: number;
  readonly splitRounds: number;
  readonly safeRatioFloor: number;
  readonly onBack: () => void;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
  readonly onSetMonthlyKrw: (value: number) => void;
  readonly onSetSafeRatioPct: (value: number) => void;
  readonly onSetSplitRounds: (value: number) => void;
  readonly onResetParameters: () => void;
  readonly onCompleteRound: () => void;
}

export function GoalDetailView({
  goal,
  simulation,
  monthlyKrw,
  safeRatioPct,
  splitRounds,
  safeRatioFloor,
  onBack,
  onEdit,
  onDelete,
  onSetMonthlyKrw,
  onSetSafeRatioPct,
  onSetSplitRounds,
  onResetParameters,
  onCompleteRound,
}: GoalDetailViewProps) {
  const [isCompletedToast, setIsCompletedToast] = useState(false);
  const currencySymbol =
    goal.currency === "USD" ? "$" : goal.currency === "JPY" ? "¥" : "€";

  const handleRecordComplete = () => {
    onCompleteRound();
    setIsCompletedToast(true);
    setTimeout(() => {
      setIsCompletedToast(false);
    }, 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%" }}>
      {/* 상단 네비게이션 및 액션 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              transition: "color 0.15s ease",
            }}
          >
            ← 목록으로
          </button>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {goal.name} 계획
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--text)",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "0.5rem 0.875rem",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Icon name="edit" size={14} />
              <span>목표 수정</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--danger)",
                backgroundColor: "var(--danger-bg)",
                border: "1px solid var(--danger-border)",
                padding: "0.5rem 0.875rem",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <Icon name="trash" size={14} />
              <span>삭제</span>
            </button>
          )}
        </div>
      </div>

      {/* 완료 토스트 메시지 */}
      {isCompletedToast && (
        <div
          role="status"
          style={{
            backgroundColor: "var(--primary-subtle)",
            border: "1px solid var(--primary-border)",
            color: "var(--primary)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Icon name="check" size={18} />
          <span>이번 회차 환전이 성공적으로 기록되었습니다. (확보율 반영됨)</span>
        </div>
      )}

      {/* 2단 반응형 그리드 레이아웃 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "2rem",
          height: "100%",
        }}
      >
        {/* 좌측: 입력 파라미터 */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            입력 파라미터
          </h3>

          {/* 1. 월 가용 원화 */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <label
                htmlFor="monthly-krw-slider"
                style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}
              >
                월 가용 원화
              </label>
              <Badge variant="default">필수 조정</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <input
                id="monthly-krw-slider"
                type="range"
                min="40"
                max="400"
                value={monthlyKrw}
                onChange={(e) => onSetMonthlyKrw(Number(e.target.value))}
                style={{ flex: 1, accentColor: "var(--primary)" }}
              />
              <span
                style={{
                  minWidth: "6rem",
                  textAlign: "right",
                  backgroundColor: "var(--bg)",
                  border: "1px solid var(--border)",
                  padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--text)",
                }}
              >
                {monthlyKrw}만
              </span>
            </div>
          </div>

          {/* 2. 안전 버킷 비율 */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <label
                htmlFor="safe-ratio-slider"
                style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}
              >
                안전 버킷 비율
              </label>
              <Badge variant="primary">하한 {safeRatioFloor}%</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <input
                id="safe-ratio-slider"
                type="range"
                min="0"
                max="100"
                value={safeRatioPct}
                onChange={(e) => onSetSafeRatioPct(Number(e.target.value))}
                style={{ flex: 1, accentColor: "var(--primary)" }}
              />
              <span
                style={{
                  minWidth: "6rem",
                  textAlign: "right",
                  backgroundColor: "var(--bg)",
                  border: "1px solid var(--border)",
                  padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--text)",
                }}
              >
                {safeRatioPct}%
              </span>
            </div>
            {safeRatioPct === safeRatioFloor && (
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--primary)",
                  marginTop: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <Icon name="alertTriangle" size={14} />
                <span>이 목적의 안전 버킷 하한입니다. 그 아래로는 내릴 수 없습니다.</span>
              </p>
            )}
          </div>

          {/* 3. 분할 횟수 */}
          <div>
            <label
              htmlFor="split-rounds-slider"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "0.75rem",
              }}
            >
              분할 횟수
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <input
                id="split-rounds-slider"
                type="range"
                min="1"
                max="16"
                value={splitRounds}
                onChange={(e) => onSetSplitRounds(Number(e.target.value))}
                style={{ flex: 1, accentColor: "var(--primary)" }}
              />
              <span
                style={{
                  minWidth: "6rem",
                  textAlign: "right",
                  backgroundColor: "var(--bg)",
                  border: "1px solid var(--border)",
                  padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--text)",
                }}
              >
                {splitRounds}회
              </span>
            </div>
          </div>

          {/* 4. 자동 반영 값 (읽기 전용) */}
          <div
            style={{
              padding: "1.25rem",
              backgroundColor: "var(--bg)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.25rem",
              }}
            >
              자동 반영 값 (읽기 전용)
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--text-muted)" }}>보유 외화</span>
              <span style={{ fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                {currencySymbol} {(goal.holdingFxAmount ?? 450).toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--text-muted)" }}>투자 성향</span>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                {goal.riskProfile ?? "안정 추구형"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)" }}>변동성 백분위</span>
              <Badge variant="danger">{goal.volatilityPercentile ?? "상위 12%"}</Badge>
            </div>
          </div>
        </div>

        {/* 우측: 계획 상세 (시뮬레이션 결과) */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1.5rem",
            }}
          >
            계획 상세 (시뮬레이션 결과)
          </h3>

          {/* 히어로 박스 (진입가 변동폭 & 달성 확률) */}
          <div
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              backgroundColor: "var(--primary-subtle)",
              border: "1px solid var(--primary-border)",
              borderRadius: "var(--radius-lg)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "var(--primary)",
                color: "var(--primary-content)",
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                borderBottomLeftRadius: "var(--radius-md)",
              }}
            >
              {goal.isRecurring ? "RECURRING" : "SINGLE"}
            </div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              진입가 변동폭 (1σ)
            </div>
            <div
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--text)",
                marginBottom: "1rem",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              ±₩{simulation.oneSigmaVolatilityKrw.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                backgroundColor: "var(--surface)",
                color: "var(--primary)",
                padding: "0.375rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                display: "inline-block",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              예산 내 달성 확률: {simulation.successRatePct}%
            </div>
          </div>

          {/* 2열 스탯 요약 박스 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            <div
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.375rem",
                }}
              >
                안전 / 기회 버킷
              </div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {safeRatioPct}% / {100 - safeRatioPct}%
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--danger)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.375rem",
                }}
              >
                최악 5% 진입가
              </div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--danger)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ₩{simulation.worst5PctEntryPriceKrw.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* 전략 비교 테이블 */}
          <div
            style={{
              overflowX: "auto",
              fontSize: "0.875rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <tr>
                  <th style={{ padding: "0.875rem" }}>전략</th>
                  <th style={{ padding: "0.875rem" }}>평균 진입가</th>
                  <th style={{ padding: "0.875rem" }}>최악 5%</th>
                  <th style={{ padding: "0.875rem" }}>달성 확률</th>
                </tr>
              </thead>
              <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                {simulation.strategies.map((strat) => {
                  const isCurrent = strat.isCurrentPlan;
                  return (
                    <tr
                      key={strat.strategyKey}
                      style={{
                        backgroundColor: isCurrent ? "var(--primary-subtle)" : "transparent",
                        borderTop: "1px solid var(--border-subtle)",
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? "var(--text)" : "inherit",
                      }}
                    >
                      <td style={{ padding: "0.875rem", color: isCurrent ? "var(--primary)" : "var(--text-muted)" }}>
                        {strat.strategyName}
                      </td>
                      <td style={{ padding: "0.875rem" }}>
                        {strat.avgEntryPriceKrw.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        style={{
                          padding: "0.875rem",
                          color: strat.strategyKey === "A" ? "var(--danger)" : "inherit",
                        }}
                      >
                        {strat.worst5PctPriceKrw.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "0.875rem", color: isCurrent ? "var(--primary)" : "inherit" }}>
                        {strat.successRatePct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 안내 콜아웃 */}
          <div
            style={{
              fontSize: "0.75rem",
              padding: "1rem",
              backgroundColor: "var(--bg)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
            }}
          >
            <strong style={{ color: "var(--text)" }}>참고:</strong> 기회 버킷은 한 번에 실행되어 시간 분산이 되지
            않으므로 C 전략이 B보다 방어력이 낮을 수 있습니다. 안전 비율을 올리면 C가 B에 수렴합니다.
          </div>

          {/* 접이식 아코디언 (회차 계획 및 이력) */}
          <details
            className="group"
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              marginBottom: "auto",
            }}
          >
            <summary
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                outline: "none",
                color: "var(--text)",
              }}
            >
              <span>회차 계획 및 이력 (접힘)</span>
              <Icon name="chevronDown" size={16} className="accordion-chevron" />
            </summary>

            <div
              style={{
                padding: "0 1rem 1rem 1rem",
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                총 {splitRounds}회 분할 예정
              </div>
              {simulation.roundsSchedule.slice(0, 4).map((round) => (
                <div
                  key={round.roundNumber}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    paddingBottom: "0.625rem",
                  }}
                >
                  <span style={{ fontWeight: 500, color: "var(--text)" }}>
                    {round.roundNumber}회차 (D+{round.dDayOffset})
                  </span>
                  <Badge variant={round.bucketType === "안전" ? "default" : "primary"}>
                    {round.bucketType}
                  </Badge>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>
                    ₩{round.krwAmount.toLocaleString()}
                  </span>
                </div>
              ))}
              {splitRounds > 4 && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    paddingTop: "0.25rem",
                  }}
                >
                  ...외 {splitRounds - 4}회 예정
                </div>
              )}
            </div>
          </details>

          {/* 하단 액션 버튼 */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button
              type="button"
              onClick={onResetParameters}
              style={{
                flex: 1,
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                boxShadow: "var(--shadow-sm)",
                transition: "background-color 0.15s ease",
              }}
            >
              계획 다시 짜기
            </button>
            <button
              type="button"
              onClick={handleRecordComplete}
              style={{
                flex: 1,
                backgroundColor: "var(--primary)",
                color: "var(--primary-content)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                boxShadow: "0 4px 12px var(--primary-subtle)",
                transition: "all 0.15s ease",
              }}
            >
              이번 회차 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
