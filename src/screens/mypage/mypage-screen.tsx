import { Card } from "../../components/common/card";
import type { NavTabId } from "../../types/navigation";

interface ScreenProps {
  readonly isDemo?: boolean;
  readonly onNavigate?: (tab: NavTabId) => void;
}

export function MyPageScreen(props: ScreenProps) {
  void props;
  return (
    <Card title="마이페이지">
      <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-muted)" }}>
        <p style={{ fontWeight: 600, color: "var(--text)" }}>사용자 프로필 & 의사결정 성향 설정 화면 준비 중입니다.</p>
        <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>주거래 은행 우대율 및 알림 설정이 제공될 예정입니다.</p>
      </div>
    </Card>
  );
}
