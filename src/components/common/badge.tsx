import type { ReactNode } from "react";

export type BadgeVariant = "default" | "primary" | "normal" | "warn" | "danger";

interface BadgeProps {
  readonly children: ReactNode;
  readonly variant?: BadgeVariant;
  readonly className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: {
    bg: "var(--surface-subtle)",
    color: "var(--text)",
    border: "var(--border)",
  },
  primary: {
    bg: "var(--primary-subtle)",
    color: "var(--primary)",
    border: "var(--primary-border)",
  },
  normal: {
    bg: "var(--normal-bg)",
    color: "var(--normal)",
    border: "var(--normal-border)",
  },
  warn: {
    bg: "var(--warn-bg)",
    color: "var(--warn)",
    border: "var(--warn-border)",
  },
  danger: {
    bg: "var(--danger-bg)",
    color: "var(--danger)",
    border: "var(--danger-border)",
  },
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <span
      className={`badge badge--${variant} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.25rem 0.625rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        borderRadius: "var(--radius-full)",
        backgroundColor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        lineHeight: 1.2,
      }}
    >
      {children}
    </span>
  );
}
