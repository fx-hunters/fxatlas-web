import { useState } from "react";
import { Header } from "../components/layout/header";
import { Sidebar } from "../components/layout/sidebar";
import { MobileNav } from "../components/layout/mobile-nav";
import { Footer } from "../components/layout/footer";
import { HomeScreen } from "../screens/home/home-screen";
import { RouteScreen } from "../screens/route/route-screen";
import { XRayScreen } from "../screens/xray/xray-screen";
import { ForecastScreen } from "../screens/forecast/forecast-screen";
import { MyPageScreen } from "../screens/mypage/mypage-screen";
import { ConnectivityCheckPanel } from "../screens/connectivity/connectivity-check-panel";
import { LandingPage } from "../LandingPage";
import { OnboardingTour } from "../OnboardingTour";
import { AuthPage, type AuthMode } from "../AuthPage";
import { useTheme } from "../hooks/use-theme";
import type { NavTabId } from "../types/navigation";

const TAB_LABELS: Record<NavTabId, string> = {
  home: "홈",
  planner: "환전 플래너",
  assets: "내 자산",
  range: "환율 범위",
  mypage: "마이페이지",
  connectivity: "연결 확인",
};

export const TOUR_STORAGE_KEY = "divurve_tour_done";
export const TOUR_INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7일 이상 경과 시 오랜만에 접속한 유저로 판단하여 재노출

export function shouldShowTour(storedValue: string | null, now: number = Date.now()): boolean {
  if (!storedValue) {
    // 최초 접속 / 최초 로그인
    return true;
  }
  const timestamp = Number(storedValue);
  // 이전 버전 "1" 등 단순 플래그이거나 비정상 타임스탬프인 경우, 또는 7일 이상 미접속 경과 시
  if (Number.isNaN(timestamp) || timestamp <= 1) {
    return true;
  }
  return now - timestamp >= TOUR_INACTIVITY_THRESHOLD_MS;
}

export function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showTour, setShowTour] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTabId>("home");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const { isDark, toggleTheme, setTheme } = useTheme("dark");

  const activeTabTitle = TAB_LABELS[activeTab];

  const goToLogin = () => {
    setShowLanding(false);
    setAuthMode("login");
    setShowAuth(true);
  };

  const goToSignup = () => {
    setShowLanding(false);
    setAuthMode("signup");
    setShowAuth(true);
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
    setShowLanding(true);
  };

  const handleLogout = () => {
    setShowLanding(true);
    setShowAuth(false);
  };

  const handleEnterDashboard = () => {
    setShowLanding(false);
    setShowAuth(false);
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (shouldShowTour(stored)) {
        setShowTour(true);
      }
    } catch {
      setShowTour(true);
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, Date.now().toString());
    } catch {
      // localStorage disabled fallback
    }
  };

  const handleStartTour = () => {
    setShowTour(true);
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
        onLogin={goToLogin}
        onSignup={goToSignup}
        isDark={isDark}
        setIsDark={handleSetIsDark}
      />
    );
  }

  if (showAuth) {
    return (
      <AuthPage
        initialMode={authMode}
        onSuccess={handleEnterDashboard}
        onBack={handleBackToLanding}
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
              <MyPageScreen
                isDemo={isDemo}
                onNavigate={setActiveTab}
                onLogin={goToLogin}
                onLogout={handleLogout}
                onStartTour={handleStartTour}
              />
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
