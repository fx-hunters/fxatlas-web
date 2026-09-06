import { NAV_ITEMS, type NavTabId } from "../../types/navigation";
import { Icon } from "../common/icon";

interface SidebarProps {
  readonly activeTab: NavTabId;
  readonly isDemo: boolean;
  readonly isDark: boolean;
  readonly onSelectTab: (tab: NavTabId) => void;
  readonly onToggleDemo: () => void;
  readonly onToggleTheme: () => void;
}

export function Sidebar({
  activeTab,
  isDemo,
  isDark,
  onSelectTab,
  onToggleDemo,
  onToggleTheme,
}: SidebarProps) {
  return (
    <aside
      className="sidebar"
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        backgroundColor: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        zIndex: 50,
        transition: "background-color 0.2s, border-color 0.2s",
      }}
    >
      {/* 로고 & 서비스명 */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--primary-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
          }}
        >
          <Icon name="sparkles" size={20} />
        </div>
        <h1
          style={{
            fontSize: "1.125rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "var(--text)",
          }}
        >
          DIVURVE
        </h1>
      </div>

      {/* 내비게이션 메뉴 */}
      <nav
        style={{
          flex: 1,
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
          overflowY: "auto",
        }}
        aria-label="주 메뉴"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-tour={`tour-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                backgroundColor: isActive ? "var(--primary-subtle)" : "transparent",
                borderLeft: `3px solid ${isActive ? "var(--primary)" : "transparent"}`,
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
                transition: "all 150ms ease",
                textAlign: "left",
              }}
            >
              <Icon
                name={item.iconName}
                size={18}
                className={isActive ? "icon--active" : ""}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 하단 유틸리티 (데모 토글, 테마 전환, 기준일) */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <button
          type="button"
          onClick={onToggleDemo}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: isDemo ? "var(--primary)" : "var(--text-muted)",
            padding: "0.5rem 0.625rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--surface-subtle)",
            border: "1px solid var(--border)",
            transition: "all 0.15s",
          }}
        >
          <Icon name={isDemo ? "checkCircle" : "database"} size={14} />
          <span>{isDemo ? "데모 데이터 켜짐" : "빈 상태 보기"}</span>
        </button>

        <button
          type="button"
          data-tour="tour-theme"
          onClick={onToggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "var(--text-muted)",
            padding: "0.5rem 0.625rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--surface-subtle)",
            border: "1px solid var(--border)",
            transition: "all 0.15s",
          }}
        >
          <Icon name={isDark ? "sun" : "moon"} size={14} />
          <span>{isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}</span>
        </button>

        <div
          style={{
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            backgroundColor: "var(--bg)",
            padding: "0.5rem 0.625rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          기준일: 2026.09.01 종가
        </div>
      </div>
    </aside>
  );
}
