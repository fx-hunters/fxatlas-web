import { useState } from "react";
import { AuthPage, type AuthMode } from "../AuthPage";
import { LandingPage } from "../LandingPage";
import { OnboardingTour } from "../OnboardingTour";
import { Footer } from "../components/layout/footer";
import { Header } from "../components/layout/header";
import { MobileNav } from "../components/layout/mobile-nav";
import { Sidebar } from "../components/layout/sidebar";
import { useTabNavigation } from "../hooks/use-tab-navigation";
import { useTheme } from "../hooks/use-theme";
import { ConnectivityCheckPanel } from "../screens/connectivity/connectivity-check-panel";
import { ForecastScreen } from "../screens/forecast/forecast-screen";
import { HomeScreen } from "../screens/home/home-screen";
import { MyPageScreen } from "../screens/mypage/mypage-screen";
import { RouteScreen } from "../screens/route/route-screen";
import { XRayScreen } from "../screens/xray/xray-screen";
import { NAV_ITEMS } from "../types/navigation";

export const TOUR_STORAGE_KEY = "divurve_tour_done";
export const TOUR_INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export function shouldShowTour(
  storedValue: string | null,
  now: number = Date.now(),
): boolean {
  if (!storedValue) {
    return true;
  }
  const timestamp = Number(storedValue);
  if (Number.isNaN(timestamp) || timestamp <= 1) {
    return true;
  }
  return now - timestamp >= TOUR_INACTIVITY_THRESHOLD_MS;
}

export function App() {
  const { activeTab, navigate } = useTabNavigation();
  const [showLanding, setShowLanding] = useState<boolean>(
    () => window.location.pathname === "/",
  );
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showTour, setShowTour] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const { isDark, toggleTheme, setTheme } = useTheme("dark");

  const currentTabItem = NAV_ITEMS.find((item) => item.id === activeTab);
  const activeTabTitle = currentTabItem!.label;

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
    navigate("home");
    setShowAuth(false);
    setShowLanding(true);
  };

  const handleLogout = () => {
    navigate("home");
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

  const handleSetIsDark = (isNextDark: boolean) => {
    setTheme(isNextDark ? "dark" : "light");
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
      <Sidebar
        activeTab={activeTab}
        isDemo={isDemo}
        onSelectTab={navigate}
        onToggleDemo={() => setIsDemo((previous) => !previous)}
      />

      <div className="app-main-layout">
        <Header
          activeTabTitle={activeTabTitle}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onNavigateToMypage={() => navigate("mypage")}
        />

        <main className="app-scroll-content">
          <div
            key={activeTab}
            className="app-content-container page-enter-animation"
          >
            {activeTab === "home" && (
              <HomeScreen isDemo={isDemo} onNavigate={navigate} />
            )}
            {activeTab === "planner" && (
              <RouteScreen isDemo={isDemo} onNavigate={navigate} />
            )}
            {activeTab === "assets" && (
              <XRayScreen isDemo={isDemo} onNavigate={navigate} />
            )}
            {activeTab === "range" && (
              <ForecastScreen isDemo={isDemo} onNavigate={navigate} />
            )}
            {activeTab === "mypage" && (
              <MyPageScreen
                isDemo={isDemo}
                onNavigate={navigate}
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

      <MobileNav activeTab={activeTab} onSelectTab={navigate} />

      {showTour && (
        <OnboardingTour
          onComplete={handleTourComplete}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
