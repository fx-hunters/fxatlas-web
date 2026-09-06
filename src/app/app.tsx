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
import { ApiStateView } from "../components/common/api-state-view";
import { NAV_ITEMS } from "../types/navigation";
import type { AuthSuccessResult } from "../types/auth";
import { login, logout, signup } from "../api/auth";
import { readApiSession } from "../api/session";
import {
  INITIAL_SETUP_PATH,
  resolvePostAuthDestination,
} from "./post-auth-routing";
import { useSessionBootstrap, type SessionEnsurer } from "./use-session-bootstrap";

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

interface AppProps {
  /** 테스트에서 세션 확보 경로를 주입하기 위한 통로. */
  readonly ensureSession?: SessionEnsurer;
}

export function App({ ensureSession }: AppProps = {}) {
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
  const { isDark, toggleTheme, setTheme } = useTheme("dark");

  const isDashboardVisible = !showLanding && !showAuth && !showInitialSetup;
  const { state: sessionState, retry: retrySession } = useSessionBootstrap(
    isDashboardVisible,
    ensureSession,
  );

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

  if (sessionState.status === "bootstrapping") {
    return (
      <ApiStateView
        status="loading"
        title="체험 데이터를 준비하고 있습니다"
        message="서버에서 계정 세션을 확인하고 있습니다."
      />
    );
  }

  if (sessionState.status === "failed") {
    return (
      <ApiStateView
        status="error"
        title="체험 데이터를 준비하지 못했습니다"
        message={sessionState.message}
        onRetry={retrySession}
      />
    );
  }

  // 화면들은 아직 계정 종류로 데모 fixture와 API 화면을 가른다.
  // 도메인별 통합(PR-C~G)이 끝나면 이 분기 자체가 사라진다.
  const isDemoAccount = sessionState.accountKind === "demo";

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        accountKind={sessionState.accountKind}
        onSelectTab={navigate}
        onLogin={goToLogin}
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
              <HomeScreen onNavigate={navigate} />
            )}
            {activeTab === "planner" && (
              <RouteScreen mode={isDemoAccount ? "demo" : "api"} onNavigate={navigate} />
            )}
            {activeTab === "assets" && (
              <XRayScreen isDemo={isDemoAccount} onNavigate={navigate} />
            )}
            {activeTab === "range" && (
              <ForecastScreen isDemo={isDemoAccount} onNavigate={navigate} />
            )}
            {activeTab === "mypage" && (
              <MyPageScreen
                onNavigate={navigate}
                onLogin={goToLogin}
                onLogout={handleLogout}
                onStartTour={handleStartTour}
              />
            )}
            {activeTab === "connectivity" && <ConnectivityCheckPanel />}
          </div>
        </main>

        <Footer accountKind={sessionState.accountKind} />
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
