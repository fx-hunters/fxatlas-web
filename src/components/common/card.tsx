import type { ReactNode } from "react";

interface CardProps {
  readonly title?: ReactNode;
  readonly subtitle?: ReactNode;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  readonly highlight?: boolean;
}

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  highlight = false,
}: CardProps) {
  return (
    <div
      className={`card ${highlight ? "card--highlight" : ""} ${className}`}
      style={{
        backgroundColor: "var(--surface)",
        border: `1px solid ${highlight ? "var(--primary-border)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: highlight ? "0 0 15px var(--primary-subtle)" : "var(--shadow-sm)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
    >
      {(title || subtitle || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "0.5rem",
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
