import { NAV_ITEMS, type NavTabId } from "../../types/navigation";
import { Icon } from "../common/icon";

interface MobileNavProps {
  readonly activeTab: NavTabId;
  readonly onSelectTab: (tab: NavTabId) => void;
}

export function MobileNav({ activeTab, onSelectTab }: MobileNavProps) {
  return (
    <nav
      className="mobile-nav"
      aria-label="모바일 하단 내비게이션"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--mobile-nav-height)",
        backgroundColor: "var(--surface)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 50,
        padding: "0 0.5rem",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
              flex: 1,
              padding: "0.5rem 0 0.375rem",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
              fontSize: "0.6875rem",
              fontWeight: isActive ? 700 : 500,
              transition: "color var(--transition-normal), transform var(--transition-fast)",
              transform: isActive ? "scale(1.05)" : "scale(1)",
            }}
          >
            {/* 상단 액티브 인디케이터 바 (자연스러운 in/out 애니메이션) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                width: isActive ? "2rem" : "0px",
                height: "3px",
                backgroundColor: "var(--primary)",
                borderRadius: "var(--radius-full)",
                transformOrigin: "center",
                opacity: isActive ? 1 : 0,
                transition: "width var(--transition-normal), opacity var(--transition-normal)",
              }}
            />
            <Icon name={item.iconName} size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
