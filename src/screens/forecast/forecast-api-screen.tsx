import { ApiStateView } from "../../components/common/api-state-view";
import { Badge } from "../../components/common/badge";
import { Card } from "../../components/common/card";
import type { NavTabId } from "../../types/navigation";
import type {
  ForecastCurrency,
  ForecastPeriod,
} from "../../types/forecast";
import { FanChart } from "./fan-chart";
import {
  useForecastApi,
  type ForecastApiLoader,
} from "./use-forecast-api";
import {
  directionVariant,
  ratioLabel,
  toFanChartData,
} from "./forecast-api-presenter";

const CURRENCIES: readonly ForecastCurrency[] = ["USD", "JPY", "EUR"];
const PERIODS: readonly ForecastPeriod[] = ["30D", "90D"];

interface ForecastApiScreenProps {
  readonly onNavigate?: (tab: NavTabId) => void;
  readonly loader?: ForecastApiLoader;
}

export function ForecastApiScreen({ onNavigate, loader }: ForecastApiScreenProps) {
  const { currency, period, state, setCurrency, setPeriod, reload } =
    useForecastApi(loader);

  if (state.status === "loading") {
    return (
      <ApiStateView
        status="loading"
        title="환율 범위를 불러오는 중입니다"
        message="팬 차트와 근거 데이터를 함께 확인하고 있습니다."
      />
    );
  }
  if (state.status === "error") {
    return (
      <ApiStateView
        status="error"
        title="환율 범위를 불러오지 못했습니다"
        message={state.message}
        onRetry={reload}
      />
    );
  }
  if (state.status === "empty") {
    return (
      <ApiStateView
        status="empty"
        title="표시할 환율 범위가 없습니다"
        message="선택한 통화와 기간의 데이터가 준비되면 이곳에 표시됩니다."
      />
    );
  }

  const { forecast, factors, performance, events } = state.data;
  const chartData = toFanChartData(state.data);
  const relevantEvents = events.events.filter(
    (event) => event.currencyCode === currency,
  );

  return (
    <section aria-label="API 환율 범위" style={{ display: "grid", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {CURRENCIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={currency === item}
              onClick={() => setCurrency(item)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor:
                  currency === item ? "var(--primary)" : "var(--surface)",
                color:
                  currency === item
                    ? "var(--primary-content)"
                    : "var(--text-muted)",
                border: "1px solid var(--border)",
                fontWeight: 700,
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {PERIODS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={period === item}
              onClick={() => setPeriod(item)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-md)",
                color: "var(--text)",
                backgroundColor:
                  period === item ? "var(--surface-subtle)" : "transparent",
                border: "1px solid var(--border)",
                fontWeight: 700,
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <Badge variant="primary">Swagger API</Badge>
      </div>

      <div className="forecast-main-grid">
        <Card title={`팬 차트 (${forecast.pairCode})`}>
          <div style={{ minHeight: "320px" }}>
            <FanChart data={chartData} currency={currency} />
          </div>
        </Card>
        <div style={{ display: "grid", gap: "1rem" }}>
          <Card title={`80% 범위 (${forecast.horizonDays}일)`}>
            <strong style={{ color: "var(--text)", fontSize: "1.5rem" }}>
              {forecast.interval80.lo.toLocaleString()} ~ {forecast.interval80.hi.toLocaleString()}
            </strong>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              구간 폭 {forecast.interval80.widthPct}%
            </p>
          </Card>
          <Card title="변동성 상태">
            <strong style={{ color: "var(--primary)", fontSize: "1.5rem" }}>
              {forecast.volatility.percentile5y} 백분위
            </strong>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              {forecast.volatility.regime} · 30일 실현값 {forecast.volatility.realized30d}
            </p>
          </Card>
          <Card title="내 자산 민감도" highlight>
            <strong style={{ color: "var(--primary)", fontSize: "1.5rem" }}>
              1% 변동 시 ₩{forecast.userImpact.per1pctKrw.toLocaleString()}
            </strong>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("planner")}
                style={{ color: "var(--primary)", fontWeight: 700, marginTop: "1rem" }}
              >
                플래너에서 확인하기
              </button>
            )}
          </Card>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "1.5rem",
        }}
      >
        <Card title="전망 동인">
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {factors.factors.map((factor) => (
              <div
                key={factor.key}
                style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}
              >
                <span style={{ color: "var(--text)" }}>{factor.label}</span>
                <Badge variant={directionVariant(factor.direction)}>
                  {factor.contributionPp}pp · {factor.direction}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card title="다가오는 일정">
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {relevantEvents.length === 0 && (
              <p style={{ color: "var(--text-muted)" }}>등록된 일정이 없습니다.</p>
            )}
            {relevantEvents.map((event) => (
              <div key={`${event.date}-${event.title}`}>
                <strong style={{ color: "var(--text)" }}>{event.title}</strong>
                <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  {event.date} · {event.importance}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="모델 검증 정보">
          <dl style={{ display: "grid", gap: "0.75rem" }}>
            <div>
              <dt style={{ color: "var(--text-muted)" }}>방향 적중률</dt>
              <dd style={{ color: "var(--text)", fontWeight: 700 }}>
                {ratioLabel(performance.model.hitRate)}
              </dd>
            </div>
            <div>
              <dt style={{ color: "var(--text-muted)" }}>80% 구간 포함률</dt>
              <dd style={{ color: "var(--text)", fontWeight: 700 }}>
                {ratioLabel(performance.model.coverage80)}
              </dd>
            </div>
            <div>
              <dt style={{ color: "var(--text-muted)" }}>검증 방식</dt>
              <dd style={{ color: "var(--text)", fontWeight: 700 }}>
                {performance.validation.method}
              </dd>
            </div>
          </dl>
          <p style={{ color: "var(--text-muted)", marginTop: "1rem", lineHeight: 1.5 }}>
            {performance.note}
          </p>
        </Card>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1.6 }}>
        {forecast.disclaimer}
      </p>
    </section>
  );
}
