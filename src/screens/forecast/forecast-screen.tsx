import { Card } from "../../components/common/card";
import type { NavTabId } from "../../types/navigation";

interface ScreenProps {
  readonly isDemo?: boolean;
  readonly onNavigate?: (tab: NavTabId) => void;
}

export function ForecastScreen({}: ScreenProps) {
  return (
    <Card title="환율 범위 (Forecast)">
      <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-muted)" }}>
        <p style={{ fontWeight: 600, color: "var(--text)" }}>환율 범위 & 시뮬레이션 팬 차트 화면 준비 중입니다.</p>
        <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>변동성 백분위 및 모델 성능 지표가 표시될 예정입니다.</p>
      </div>
    </Card>
  );
}
