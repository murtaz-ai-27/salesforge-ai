"use client";
/**
 * EmptyState.tsx — Consistent empty-state UI
 *
 * Usage:
 *   <EmptyState
 *     icon="👥"
 *     title="No prospects yet"
 *     description="Add your first prospect to get started."
 *     action={{ label: "Add Prospect", onClick: () => setShowForm(true) }}
 *   />
 */

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
};

export function EmptyState({
  icon = "✦",
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: compact ? "40px 24px" : "72px 24px",
        gap: compact ? 10 : 14,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: compact ? 52 : 64,
          height: compact ? 52 : 64,
          borderRadius: compact ? 16 : 20,
          background: "rgba(200,255,0,0.06)",
          border: "1px solid rgba(200,255,0,0.12)",
          display: "grid",
          placeItems: "center",
          fontSize: compact ? 22 : 28,
          marginBottom: 4,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: compact ? 15 : 17,
          fontWeight: 700,
          color: "#f4f5f7",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: compact ? 13 : 14,
            color: "#9598a3",
            maxWidth: 320,
            lineHeight: 1.6,
          }}
        >
          {description}
        </div>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: compact ? 6 : 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {action && (
            <button
              onClick={action.onClick}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                border: "none",
                background: "#C8FF00",
                color: "#050505",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.15s, transform 0.15s",
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.opacity = "0.9";
                (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.opacity = "1";
                (e.target as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "#9598a3",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)";
                (e.target as HTMLButtonElement).style.color = "#f4f5f7";
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.target as HTMLButtonElement).style.color = "#9598a3";
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Convenience preset for search/filter "no results" case
export function NoResults({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon="🔍"
      title={query ? `No results for "${query}"` : "No results found"}
      description="Try adjusting your filters or search term."
      action={onClear ? { label: "Clear filters", onClick: onClear } : undefined}
      compact
    />
  );
}
