import { Badge } from "../../components/common/badge";
import { ProgressBar } from "../../components/common/progress-bar";
import { Icon } from "../../components/common/icon";
import type { GoalSummary } from "../../types/route";

interface GoalListViewProps {
  readonly goals: readonly GoalSummary[];
  readonly onSelectGoal: (goalId: string) => void;
  readonly onCreateNew: () => void;
  readonly onEditGoal?: (goalId: string) => void;
  readonly onDeleteGoal?: (goalId: string) => void;
}

export function GoalListView({
  goals,
  onSelectGoal,
  onCreateNew,
  onEditGoal,
  onDeleteGoal,
}: GoalListViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          목표 목록
        </h2>
        <button
          type="button"
          onClick={onCreateNew}
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-content)",
            fontWeight: 700,
            fontSize: "0.875rem",
            padding: "0.625rem 1.25rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 2px 8px var(--primary-subtle)",
            transition: "all 0.15s ease",
          }}
        >
          새 목표 만들기 +
        </button>
      </div>

      {/* 목표 리스트 또는 빈 상태 */}
      {goals.length === 0 ? (
        <div
          style={{
            padding: "5rem 1rem",
            textAlign: "center",
            fontWeight: 500,
            color: "var(--text-muted)",
            backgroundColor: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border)",
          }}
        >
          아직 외화 목표가 없습니다. 첫 목표를 만들어보세요.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {goals.map((goal) => {
            const currencySymbol =
              goal.currency === "USD" ? "$" : goal.currency === "JPY" ? "¥" : "€";
            const fundedPercent = Math.round(goal.fundedRatio * 100);

            return (
              <div
                key={goal.id}
                onClick={() => onSelectGoal(goal.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectGoal(goal.id);
                  }
                }}
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {goal.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "var(--text-muted)",
                        marginTop: "0.375rem",
                      }}
                    >
                      {goal.category} · {goal.currency}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {onEditGoal && (
                      <button
                        type="button"
                        aria-label={`${goal.name} 수정`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGoal(goal.id);
                        }}
                        style={{
                          padding: "0.25rem",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name="edit" size={15} />
                      </button>
                    )}
                    {onDeleteGoal && (
                      <button
                        type="button"
                        aria-label={`${goal.name} 삭제`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGoal(goal.id);
                        }}
                        style={{
                          padding: "0.25rem",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--danger)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                    <Badge variant="default">{goal.isRecurring ? "반복" : "단건"}</Badge>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    borderBottom: "1px solid var(--border-subtle)",
                    paddingBottom: "1rem",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)" }}>
                    {currencySymbol} {goal.targetAmount.toLocaleString()}
                  </div>
                  <Badge variant="primary">D-{goal.deadlineDday}</Badge>
                </div>

                <div>
                  <ProgressBar ratio={goal.fundedRatio} height={8} />
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textAlign: "right",
                      marginTop: "0.375rem",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    확보율 {fundedPercent}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 하단 안내 배너 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          padding: "1rem",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "var(--text-muted)",
          marginTop: "0.5rem",
        }}
      >
        <div style={{ color: "var(--primary)", marginTop: "2px", flexShrink: 0 }}>
          <Icon name="alertTriangle" size={16} />
        </div>
        <span>안내: 목표는 내 자산의 '예정 외화 지출'과 같은 데이터로 연동됩니다.</span>
      </div>
    </div>
  );
}
