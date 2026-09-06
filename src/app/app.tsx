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
import { InitialSetupScreen } from "../screens/initial-setup/initial-setup-screen";
import { NAV_ITEMS } from "../types/navigation";
import type { AuthSuccessResult } from "../types/auth";
import { login, logout, signup, startDemoSession } from "../api/auth";
import { ApiError } from "../api/client";
import { readApiSession } from "../api/session";
import {
  INITIAL_SETUP_PATH,
  resolvePostAuthDestination,
} from "./post-auth-routing";

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
  const [showInitialSetup, setShowInitialSetup] = useState<boolean>(
    () =>
      window.location.pathname === INITIAL_SETUP_PATH &&
      readApiSession()?.isDemo === false,
  );
  const [isDemo, setIsDemo] = useState<boolean>(() => readApiSession() === null);
  const [isApiSwitching, setIsApiSwitching] = useState(false);
  const [apiSwitchError, setApiSwitchError] = useState<string | null>(null);
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
    setShowInitialSetup(false);
    setShowAuth(false);
    setShowLanding(true);
  };

  const handleLogout = () => {
    logout();
    setIsDemo(true);
    navigate("home");
    setShowInitialSetup(false);
    setShowLanding(true);
    setShowAuth(false);
  };

  const handleEnterDashboard = () => {
    setShowLanding(false);
    setShowAuth(false);
    setShowInitialSetup(false);
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (shouldShowTour(stored)) {
        setShowTour(true);
      }
    } catch {
      setShowTour(true);
    }
  };

  const handleAuthenticated = (result: AuthSuccessResult | void) => {
    const destination = resolvePostAuthDestination(result);
    setIsDemo(result?.isDemo === true);

    if (destination === "initialSetup") {
      setShowLanding(false);
      setShowAuth(false);
      setShowTour(false);
      setShowInitialSetup(true);
      if (window.location.pathname !== INITIAL_SETUP_PATH) {
        window.history.pushState(null, "", INITIAL_SETUP_PATH);
      }
      return;
    }

    navigate("home");
    handleEnterDashboard();
  };

  const handleInitialSetupComplete = () => {
    navigate("home");
    handleEnterDashboard();
  };

  const handleToggleDataSource = async () => {
    setApiSwitchError(null);
    if (!isDemo) {
      setIsDemo(true);
      return;
    }

    setIsApiSwitching(true);
    try {
      await startDemoSession();
      setIsDemo(false);
    } catch (error) {
      setApiSwitchError(
        error instanceof ApiError
          ? error.message
          : "API 데모 계정을 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsApiSwitching(false);
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
        onSuccess={handleAuthenticated}
        onBack={handleBackToLanding}
        authenticateLogin={async (input, persistence) => {
          return login(input, persistence);
        }}
        authenticateSignup={async (input) => {
          return signup(input);
        }}
      />
    );
  }

  if (showInitialSetup) {
    return <InitialSetupScreen onComplete={handleInitialSetupComplete} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        isDemo={isDemo}
        onSelectTab={navigate}
        onToggleDemo={() => void handleToggleDataSource()}
        isDemoSwitching={isApiSwitching}
      />

      <div className="app-main-layout">
        <Header
          activeTabTitle={activeTabTitle}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onNavigateToMypage={() => navigate("mypage")}
        />

        <main className="app-scroll-content">
          {apiSwitchError && (
            <div
              role="alert"
              style={{
                margin: "1rem auto 0",
                maxWidth: "1200px",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--danger-border)",
                backgroundColor: "var(--danger-bg)",
                color: "var(--danger)",
              }}
            >
              {apiSwitchError}
            </div>
          )}
          <div
            key={activeTab}
            className="app-content-container page-enter-animation"
          >
            {activeTab === "home" && (
              <HomeScreen isDemo={isDemo} onNavigate={navigate} />
            )}
            {activeTab === "planner" && (
              <RouteScreen mode={isDemo ? "demo" : "api"} onNavigate={navigate} />
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
                isLoggedIn={true}
                onNavigate={navigate}
                onLogin={goToLogin}
                onLogout={handleLogout}
                onStartTour={handleStartTour}
              />
            )}
            {activeTab === "connectivity" && <ConnectivityCheckPanel />}
          </div>
        </main>

        <Footer isDemo={isDemo} />
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
