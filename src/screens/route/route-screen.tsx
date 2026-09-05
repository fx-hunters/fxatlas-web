import { Card } from "../../components/common/card";
import type { NavTabId } from "../../types/navigation";

interface ScreenProps {
  readonly isDemo?: boolean;
  readonly onNavigate?: (tab: NavTabId) => void;
}

export function RouteScreen({}: ScreenProps) {
  return (
    <Card title="환전 플래너">
      <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-muted)" }}>
        <p style={{ fontWeight: 600, color: "var(--text)" }}>환전 플래너 화면 준비 중입니다.</p>
        <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>다음 스프린트에서 계획 수립 및 시뮬레이터가 연결됩니다.</p>
      </div>
    </Card>
  );
}
