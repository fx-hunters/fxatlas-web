import { useState } from "react";
import { XRAY_STRESS_PRESETS } from "../../api/fixtures/xray-api-scenarios";
import { ApiStateView } from "../../components/common/api-state-view";
import { Badge } from "../../components/common/badge";
import { Card } from "../../components/common/card";
import { ProgressBar } from "../../components/common/progress-bar";
import type { NavTabId } from "../../types/navigation";
import { useXrayApi, type XrayApiDependencies } from "./use-xray-api";

function ratioLabel(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

interface XrayApiScreenProps {
  readonly onNavigate?: (tab: NavTabId) => void;
  readonly dependencies?: XrayApiDependencies;
}

export function XrayApiScreen({
  onNavigate,
  dependencies,
}: XrayApiScreenProps) {
  const { state, stressState, simulationState, reload, runStress, runSimulation } =
    useXrayApi(dependencies);
  const [currencyCode, setCurrencyCode] = useState("EUR");
  const [deltaShare, setDeltaShare] = useState("0.1");

  if (state.status === "loading") {
    return (
      <ApiStateView
        status="loading"
        title="자산 분석을 불러오는 중입니다"
        message="노출, 손익 분해와 집중도 정보를 함께 확인하고 있습니다."
      />
    );
  }
  if (state.status === "error") {
    return (
      <ApiStateView
        status="error"
        title="자산 분석을 불러오지 못했습니다"
        message={state.message}
        onRetry={reload}
      />
    );
  }
  if (state.status === "empty") {
    return (
      <ApiStateView
        status="empty"
        title="분석할 외화 자산이 없습니다"
        message="보유 종목이나 외화 예금을 등록하면 분석 결과가 표시됩니다."
      />
    );
  }

  const { overview, attribution, concentration } = state.data;

  return (
    <section aria-label="API 자산 분석" style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <p style={{ color: "var(--text-muted)" }}>
          서버가 계산한 자산 분석 결과를 그대로 표시합니다.
        </p>
        <Badge variant="primary">Swagger API</Badge>
      </div>

      <div className="xray-api-summary-grid">
        <Card title="전체 자산">
          <strong style={{ color: "var(--text)", fontSize: "1.75rem" }}>
            ₩{overview.totalAssetKrw.toLocaleString()}
          </strong>
        </Card>
        <Card title="외화 자산">
          <strong style={{ color: "var(--usd)", fontSize: "1.75rem" }}>
            ₩{overview.fxAssetKrw.toLocaleString()}
          </strong>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            외화 비중 {ratioLabel(overview.fxRatio)}
          </p>
        </Card>
        <Card title="1% 환율 민감도">
          <strong style={{ color: "var(--primary)", fontSize: "1.75rem" }}>
            ₩{overview.sensitivity1pct.totalKrw.toLocaleString()}
          </strong>
        </Card>
      </div>

      <div className="forecast-main-grid">
        <Card title="통화별 노출">
          <div style={{ display: "grid", gap: "1rem" }}>
            {overview.exposure.map((item) => (
              <div key={item.currencyCode}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong style={{ color: "var(--text)" }}>{item.currencyCode}</strong>
                  <span style={{ color: "var(--text-muted)" }}>
                    {ratioLabel(item.share)} · ₩{item.krw.toLocaleString()}
                  </span>
                </div>
                <ProgressBar ratio={item.share} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="집중도 진단">
          <strong style={{ color: "var(--text)", fontSize: "1.5rem" }}>
            {concentration.topCurrency} {ratioLabel(concentration.topShare)}
          </strong>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            {concentration.status} · 기준 {ratioLabel(concentration.threshold)}
          </p>
          <ul style={{ color: "var(--text-muted)", marginTop: "1rem", paddingLeft: "1.25rem" }}>
            {concentration.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title={`손익 분해 (${attribution.currencyCode})`}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {attribution.components.map((component) => (
            <div
              key={component.key}
              style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}
            >
              <span style={{ color: "var(--text-muted)" }}>{component.key}</span>
              <strong style={{ color: "var(--text)" }}>
                ₩{component.krw.toLocaleString()} · {component.contributionPp}pp
              </strong>
            </div>
          ))}
        </div>
      </Card>

      <div className="forecast-main-grid">
        <Card title="환율 충격 시나리오">
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
            선택한 입력값의 결과는 서버가 계산합니다.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {XRAY_STRESS_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => void runStress(preset.id)}
                disabled={stressState.status === "loading"}
                title={preset.description}
                style={{
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text)",
                  backgroundColor: "var(--surface-subtle)",
                  fontWeight: 700,
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {stressState.status === "loading" && <p role="status">계산 결과 확인 중…</p>}
          {stressState.status === "error" && <p role="alert">{stressState.message}</p>}
          {stressState.status === "success" && (
            <p style={{ color: "var(--primary)", marginTop: "1rem", fontWeight: 700 }}>
              서버 결과: ₩{stressState.data.totalAssetAfterKrw.toLocaleString()}
              {" · "}영향 ₩{stressState.data.impactKrw.toLocaleString()}
            </p>
          )}
        </Card>

        <Card title="분산 효과 확인">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void runSimulation(currencyCode, Number(deltaShare));
            }}
            style={{ display: "grid", gap: "0.75rem" }}
          >
            <label style={{ display: "grid", gap: "0.375rem", color: "var(--text-muted)" }}>
              통화 코드
              <select
                value={currencyCode}
                onChange={(event) => setCurrencyCode(event.target.value)}
                style={{ padding: "0.75rem", color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <option value="USD">USD</option>
                <option value="JPY">JPY</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: "0.375rem", color: "var(--text-muted)" }}>
              추가 비중 요청값
              <input
                type="number"
                step="0.01"
                value={deltaShare}
                onChange={(event) => setDeltaShare(event.target.value)}
                style={{ padding: "0.75rem", color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)" }}
              />
            </label>
            <button
              type="submit"
              disabled={simulationState.status === "loading"}
              style={{ padding: "0.75rem", background: "var(--primary)", color: "var(--primary-content)", borderRadius: "var(--radius-md)", fontWeight: 700 }}
            >
              서버에서 계산하기
            </button>
          </form>
          {simulationState.status === "error" && <p role="alert">{simulationState.message}</p>}
          {simulationState.status === "success" && (
            <p style={{ color: "var(--primary)", marginTop: "1rem" }}>
              변동성: {simulationState.data.portfolioVol.before} → {simulationState.data.portfolioVol.after}
            </p>
          )}
        </Card>
      </div>

      {onNavigate && (
        <button
          type="button"
          onClick={() => onNavigate("planner")}
          style={{ color: "var(--primary)", fontWeight: 700, justifySelf: "start" }}
        >
          플래너에서 목표 확인하기
        </button>
      )}
    </section>
  );
}
