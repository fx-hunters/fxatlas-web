import { useEffect, useState } from "react";
import { ApiStateView } from "../../components/common/api-state-view";
import { Badge } from "../../components/common/badge";
import { Card } from "../../components/common/card";
import { usePlannerApi, type PlannerApiDependencies } from "./use-planner-api";

function ratioLabel(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

interface PlannerApiScreenProps {
  readonly dependencies?: PlannerApiDependencies;
}

export function PlannerApiScreen({ dependencies }: PlannerApiScreenProps) {
  const { state, actionState, reload, complete, skip } =
    usePlannerApi(dependencies);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [executedAmount, setExecutedAmount] = useState("");
  const [executedRate, setExecutedRate] = useState("");

  useEffect(() => {
    if (state.status !== "success" || selectedGoalId !== null) return;
    setSelectedGoalId(state.data.items[0]!.goal.id);
  }, [selectedGoalId, state]);

  if (state.status === "loading") {
    return (
      <ApiStateView
        status="loading"
        title="플래너를 불러오는 중입니다"
        message="목표와 활성 계획을 서버에서 확인하고 있습니다."
      />
    );
  }
  if (state.status === "error") {
    return (
      <ApiStateView
        status="error"
        title="플래너를 불러오지 못했습니다"
        message={state.message}
        onRetry={reload}
      />
    );
  }
  if (state.status === "empty") {
    return (
      <ApiStateView
        status="empty"
        title="등록된 외화 목표가 없습니다"
        message="목표 생성 API가 연결되면 이곳에서 계획을 확인할 수 있습니다."
      />
    );
  }

  const selected =
    state.data.items.find((item) => item.goal.id === selectedGoalId) ??
    state.data.items[0]!;
  const nextStep = selected.activePlan?.steps.find(
    (step) => step.status !== "completed" && step.status !== "skipped",
  );

  return (
    <section aria-label="API 플래너" style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h2 style={{ color: "var(--text)", fontSize: "1.75rem", fontWeight: 800 }}>
            내 외화 플래너
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            목표와 회차 값은 서버 응답을 그대로 표시합니다.
          </p>
        </div>
        <Badge variant="primary">Swagger API</Badge>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {state.data.items.map((item) => (
          <button
            key={item.goal.id}
            type="button"
            aria-pressed={item.goal.id === selected.goal.id}
            onClick={() => setSelectedGoalId(item.goal.id)}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              backgroundColor:
                item.goal.id === selected.goal.id
                  ? "var(--primary-subtle)"
                  : "var(--surface)",
              color: "var(--text)",
              fontWeight: 700,
            }}
          >
            {item.goal.name}
          </button>
        ))}
      </div>

      <Card title={selected.goal.name} highlight>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <span style={{ color: "var(--text-muted)" }}>목표</span>
            <strong style={{ display: "block", color: "var(--text)", fontSize: "1.5rem" }}>
              {selected.goal.targetAmount.toLocaleString()} {selected.goal.currencyCode}
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>현재 확보</span>
            <strong style={{ display: "block", color: "var(--primary)", fontSize: "1.5rem" }}>
              {selected.goal.heldAmount.toLocaleString()} {selected.goal.currencyCode}
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>목표일</span>
            <strong style={{ display: "block", color: "var(--text)" }}>
              {selected.goal.targetDate || "미설정"}
            </strong>
          </div>
        </div>
      </Card>

      {!selected.activePlan ? (
        <Card title="활성 계획">
          <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            이 목표에 저장된 활성 계획이 없습니다. Curve와 대체 시나리오는 현재
            Swagger 응답에 좌표·시나리오 계약이 없어 목 데이터 체험에서만 제공합니다.
          </p>
        </Card>
      ) : (
        <>
          <Card
            title={`활성 계획 v${selected.activePlan.version}`}
            action={<Badge variant="normal">{selected.activePlan.isActive ? "활성" : "비활성"}</Badge>}
          >
            <p style={{ color: "var(--text)", lineHeight: 1.6 }}>
              {selected.activePlan.reason}
            </p>
            <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>
              안전 비율 {ratioLabel(selected.activePlan.safeRatio)} · 분할 회차 {selected.activePlan.splitCount}
            </p>
          </Card>

          <Card title="회차 계획">
            <ol style={{ display: "grid", gap: "0.75rem", paddingLeft: "1.25rem" }}>
              {selected.activePlan.steps.map((step) => (
                <li key={step.seq} style={{ color: "var(--text)" }}>
                  {step.scheduledDate} · {step.amount.toLocaleString()} {selected.goal.currencyCode}
                  {" · "}{step.status}
                </li>
              ))}
            </ol>
          </Card>

          {nextStep && (
            <Card title={`${nextStep.seq}회차 실행 기록`}>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void complete(
                    selected.activePlan!.id,
                    nextStep.seq,
                    Number(executedAmount),
                    Number(executedRate),
                  );
                }}
                style={{ display: "grid", gap: "0.75rem" }}
              >
                <label style={{ display: "grid", gap: "0.375rem", color: "var(--text-muted)" }}>
                  실행 외화 금액
                  <input
                    required
                    type="number"
                    value={executedAmount}
                    onChange={(event) => setExecutedAmount(event.target.value)}
                    style={{ padding: "0.75rem", color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.375rem", color: "var(--text-muted)" }}>
                  실행 환율
                  <input
                    required
                    type="number"
                    value={executedRate}
                    onChange={(event) => setExecutedRate(event.target.value)}
                    style={{ padding: "0.75rem", color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)" }}
                  />
                </label>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    disabled={actionState.status === "loading"}
                    style={{ padding: "0.75rem 1rem", background: "var(--primary)", color: "var(--primary-content)", borderRadius: "var(--radius-md)", fontWeight: 700 }}
                  >
                    이번 회차 기록
                  </button>
                  <button
                    type="button"
                    disabled={actionState.status === "loading"}
                    onClick={() => void skip(selected.activePlan!.id, nextStep.seq)}
                    style={{ padding: "0.75rem 1rem", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontWeight: 700 }}
                  >
                    이번 회차 건너뛰기
                  </button>
                </div>
              </form>
            </Card>
          )}
        </>
      )}

      {actionState.status === "loading" && <p role="status">서버에 반영 중…</p>}
      {actionState.status === "error" && <p role="alert">{actionState.message}</p>}
      {actionState.status === "success" && <p role="status">{actionState.message}</p>}
    </section>
  );
}
