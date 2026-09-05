import { useState } from "react";
import type { NavTabId } from "../types/navigation";
import { NAV_ITEMS } from "../types/navigation";
import { useTheme } from "../hooks/use-theme";
import { Sidebar } from "../components/layout/sidebar";
import { Header } from "../components/layout/header";
import { MobileNav } from "../components/layout/mobile-nav";
import { Footer } from "../components/layout/footer";
import { HomeScreen } from "../screens/home/home-screen";
import { RouteScreen } from "../screens/route/route-screen";
import { XRayScreen } from "../screens/xray/xray-screen";
import { ForecastScreen } from "../screens/forecast/forecast-screen";
import { MyPageScreen } from "../screens/mypage/mypage-screen";
import { ConnectivityCheckPanel } from "../screens/connectivity/connectivity-check-panel";

export function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>("home");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const { isDark, toggleTheme } = useTheme("dark");

  const currentTabItem = NAV_ITEMS.find((item) => item.id === activeTab);
  const activeTabTitle = currentTabItem ? currentTabItem.label : "홈";

  return (
    <div className="app-shell">
      {/* 데스크톱 사이드바 */}
      <Sidebar
        activeTab={activeTab}
        isDemo={isDemo}
        isDark={isDark}
        onSelectTab={setActiveTab}
        onToggleDemo={() => setIsDemo((prev) => !prev)}
        onToggleTheme={toggleTheme}
      />

      {/* 메인 뷰포트 레이아웃 */}
      <div className="app-main-layout">
        <Header
          activeTabTitle={activeTabTitle}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onNavigateToMypage={() => setActiveTab("mypage")}
        />

        <main className="app-scroll-content">
          <div className="app-content-container">
            {activeTab === "home" && (
              <HomeScreen isDemo={isDemo} onNavigate={setActiveTab} />
            )}
            {activeTab === "planner" && (
              <RouteScreen isDemo={isDemo} onNavigate={setActiveTab} />
            )}
            {activeTab === "assets" && (
              <XRayScreen isDemo={isDemo} onNavigate={setActiveTab} />
            )}
            {activeTab === "range" && (
              <ForecastScreen isDemo={isDemo} onNavigate={setActiveTab} />
            )}
            {activeTab === "mypage" && (
              <MyPageScreen isDemo={isDemo} onNavigate={setActiveTab} />
            )}
            {activeTab === "connectivity" && <ConnectivityCheckPanel />}
          </div>
        </main>

        <Footer />
      </div>

      {/* 모바일 하단 내비게이션 바 */}
      <MobileNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
