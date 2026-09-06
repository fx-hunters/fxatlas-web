import { Card } from "../../components/common/card";
import type { NavTabId } from "../../types/navigation";

interface ScreenProps {
  readonly isDemo?: boolean;
  readonly onNavigate?: (tab: NavTabId) => void;
}

export function XRayScreen(props: ScreenProps) {
  void props;
  return (
    <Card title="내 자산 (X-Ray)">
      <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-muted)" }}>
        <p style={{ fontWeight: 600, color: "var(--text)" }}>내 자산 & 통화 노출 진단 화면 준비 중입니다.</p>
        <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>손익 분해 및 통화 적합도 분석 기능이 연결될 예정입니다.</p>
      </div>
    </Card>
  );
}
