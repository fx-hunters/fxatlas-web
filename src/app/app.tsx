/**
 * 루트 레이아웃·라우팅 진입 컴포넌트.
 * 화면은 src/screens/ 아래(home·xray·forecast·route·mypage)로 라우팅한다.
 * TODO(미확정): 라우터 라이브러리 선정 (CLAUDE.md 9장).
 * 라우터 확정 전까지 연결 확인 테스트 페이지를 루트에 노출한다.
 */
import { ConnectivityCheckPanel } from "../screens/connectivity/connectivity-check-panel";

export function App() {
  return (
    <main>
      <h1>Divurve</h1>
      <ConnectivityCheckPanel />
    </main>
  );
}
