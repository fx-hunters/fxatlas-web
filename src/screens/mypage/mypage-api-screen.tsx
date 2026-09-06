import { useEffect, useState } from "react";
import { ApiStateView } from "../../components/common/api-state-view";
import { Badge } from "../../components/common/badge";
import { Card } from "../../components/common/card";
import type { NavTabId } from "../../types/navigation";
import { useMyPageApi, type MyPageApiDependencies } from "./use-mypage-api";

interface MyPageApiScreenProps {
  readonly onNavigate?: (tab: NavTabId) => void;
  readonly onLogout?: () => void;
  readonly onStartTour?: () => void;
  readonly dependencies?: MyPageApiDependencies;
}

export function MyPageApiScreen({
  onNavigate,
  onLogout,
  onStartTour,
  dependencies,
}: MyPageApiScreenProps) {
  const { state, saveState, reload, saveSettings } = useMyPageApi(dependencies);
  const [discountRatio, setDiscountRatio] = useState("0");
  const [explainLevel, setExplainLevel] = useState("simple");
  const [explainDomain, setExplainDomain] = useState("plain");

  useEffect(() => {
    if (state.status !== "success") return;
    setDiscountRatio(String(state.data.settings.fxDiscountRatio));
    setExplainLevel(state.data.settings.explainLevel);
    setExplainDomain(state.data.settings.explainDomain);
  }, [state]);

  if (state.status === "loading") {
    return (
      <ApiStateView
        status="loading"
        title="사용자 설정을 불러오는 중입니다"
        message="프로필과 서버 설정을 확인하고 있습니다."
      />
    );
  }
  if (state.status === "error") {
    return (
      <ApiStateView
        status="error"
        title="마이페이지를 불러오지 못했습니다"
        message={state.message}
        onRetry={reload}
      />
    );
  }

  const { profile, settings, riskProfile, notifications } = state.data;

  return (
    <section
      aria-label="API 마이페이지"
      style={{ maxWidth: "48rem", margin: "0 auto", display: "grid", gap: "1.5rem" }}
    >
      <Card
        title="사용자 프로필"
        action={<Badge variant="primary">{profile.isDemo ? "데모 계정" : "API 계정"}</Badge>}
      >
        <strong style={{ color: "var(--text)", fontSize: "1.5rem" }}>
          {profile.name}
        </strong>
        <p style={{ color: "var(--text-muted)", marginTop: "0.375rem" }}>
          {profile.email}
        </p>
      </Card>

      <Card title="의사결정 프로필">
        {riskProfile ? (
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
            <strong style={{ color: "var(--text)" }}>{riskProfile.riskType}</strong>
            <span style={{ color: "var(--text-muted)" }}>서버 점수 {riskProfile.score}</span>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>
            아직 성향 진단을 하지 않았습니다.
          </p>
        )}
      </Card>

      <Card title="기본 설정">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveSettings({
              fxDiscountRatio: Number(discountRatio),
              explainLevel,
              explainDomain,
            });
          }}
          style={{ display: "grid", gap: "1rem" }}
        >
          <label style={{ display: "grid", gap: "0.375rem", color: "var(--text-muted)" }}>
            환전 우대율 API 값 (0~1)
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={discountRatio}
              onChange={(event) => setDiscountRatio(event.target.value)}
              style={{ padding: "0.75rem", color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)" }}
            />
          </label>
          <label style={{ display: "grid", gap: "0.375rem", color: "var(--text-muted)" }}>
            설명 수준
            <select
              value={explainLevel}
              onChange={(event) => setExplainLevel(event.target.value)}
              style={{ padding: "0.75rem", color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <option value="simple">simple</option>
              <option value="detailed">detailed</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: "0.375rem", color: "var(--text-muted)" }}>
            설명 분야
            <select
              value={explainDomain}
              onChange={(event) => setExplainDomain(event.target.value)}
              style={{ padding: "0.75rem", color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <option value="plain">plain</option>
              <option value="finance">finance</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={saveState.status === "saving"}
            style={{ padding: "0.75rem", background: "var(--primary)", color: "var(--primary-content)", borderRadius: "var(--radius-md)", fontWeight: 700 }}
          >
            {saveState.status === "saving" ? "저장 중…" : "설정 저장"}
          </button>
        </form>
        {saveState.status === "saved" && <p role="status">서버에 저장했습니다.</p>}
        {saveState.status === "error" && <p role="alert">{saveState.message}</p>}
        <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
          서버 실효 스프레드: {settings.effectiveSpreadRatio}
        </p>
      </Card>

      <Card title="최근 알림">
        {notifications.notifications.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>새 알림이 없습니다.</p>
        ) : (
          <ul style={{ display: "grid", gap: "0.75rem", paddingLeft: "1.25rem" }}>
            {notifications.notifications.map((notification) => (
              <li key={notification.id} style={{ color: "var(--text)" }}>
                <strong>{notification.title}</strong> · {notification.message}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {onNavigate && (
          <>
            <button type="button" onClick={() => onNavigate("assets")} style={{ color: "var(--primary)", fontWeight: 700 }}>
              자산 내역 보기
            </button>
            <button type="button" onClick={() => onNavigate("planner")} style={{ color: "var(--primary)", fontWeight: 700 }}>
              외화 목표 보기
            </button>
          </>
        )}
        {onStartTour && (
          <button type="button" onClick={onStartTour} style={{ color: "var(--text)", fontWeight: 700 }}>
            가이드 투어 다시보기
          </button>
        )}
        {onLogout && (
          <button type="button" onClick={onLogout} style={{ color: "var(--danger)", fontWeight: 700 }}>
            로그아웃
          </button>
        )}
      </div>
    </section>
  );
}
