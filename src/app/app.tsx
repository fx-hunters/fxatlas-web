import { useState } from "react";
import type { NavTabId } from "../types/navigation";
import { useTheme } from "../hooks/use-theme";
import { LandingPage } from "../LandingPage";
import { OnboardingTour } from "../OnboardingTour";
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

const TAB_LABELS: Record<NavTabId, string> = {
  home: "홈",
  planner: "환전 플래너",
  assets: "내 자산",
  range: "환율 범위",
  mypage: "마이페이지",
  connectivity: "연결 확인",
};

export function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTabId>("home");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const { isDark, toggleTheme, setTheme } = useTheme("dark");

  const activeTabTitle = TAB_LABELS[activeTab];

  const handleEnterDashboard = () => {
    setShowLanding(false);
    try {
      const seen = localStorage.getItem("divurve_tour_done");
      if (!seen) {
        setShowTour(true);
      }
    } catch {
      setShowTour(true);
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
    try {
      localStorage.setItem("divurve_tour_done", "1");
    } catch {
      // localStorage disabled fallback
    }
  };

  const handleSetIsDark = (dark: boolean) => {
    setTheme(dark ? "dark" : "light");
  };

  const handleNavigateTab = (tab: string) => {
    if (tab in TAB_LABELS) {
      setActiveTab(tab as NavTabId);
    }
  };

  if (showLanding) {
    return (
      <LandingPage
        onEnter={handleEnterDashboard}
        isDark={isDark}
        setIsDark={handleSetIsDark}
      />
    );
  }

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
          <div key={activeTab} className="app-content-container page-enter-animation">
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

      {/* 온보딩 투어 가이드 */}
      {showTour && (
        <OnboardingTour
          onComplete={handleTourComplete}
          onNavigate={handleNavigateTab}
        />
      )}
    </div>
  );
}
