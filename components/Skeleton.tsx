"use client";
/**
 * Skeleton.tsx — Shimmer placeholder loaders
 *
 * Usage:
 *   <Skeleton w={200} h={20} />                // single bar
 *   <SkeletonCard />                           // KPI card
 *   <SkeletonTable rows={5} cols={4} />        // table rows
 *   <SkeletonList rows={6} />                  // list items (prospects, sequences…)
 */

const shimmer = `
  @keyframes sf-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
`;

const BASE = {
  background: "linear-gradient(90deg, #0d1018 25%, #111720 50%, #0d1018 75%)",
  backgroundSize: "800px 100%",
  animation: "sf-shimmer 1.4s infinite linear",
  borderRadius: 6,
} as React.CSSProperties;

// Inject keyframes once
let injected = false;
function injectStyles() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = shimmer;
  document.head.appendChild(style);
}

// ─── Single bar ───────────────────────────────────────────────────────────────
export function Skeleton({
  w = "100%",
  h = 16,
  radius = 6,
  style,
}: {
  w?: number | string;
  h?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  if (typeof window !== "undefined") injectStyles();
  return (
    <div
      style={{
        ...BASE,
        width: w,
        height: h,
        borderRadius: radius,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

// ─── KPI card skeleton ────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div
      style={{
        background: "#0d1018",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Skeleton w={80} h={12} />
      <Skeleton w={120} h={28} />
      <Skeleton w={60} h={10} />
    </div>
  );
}

// ─── Table skeleton ───────────────────────────────────────────────────────────
export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} w={60 + i * 10} h={10} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 12,
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            alignItems: "center",
          }}
        >
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              w={col === 0 ? "80%" : col === cols - 1 ? 60 : "60%"}
              h={col === 0 ? 14 : 12}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── List skeleton (card rows) ────────────────────────────────────────────────
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#0d1018",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Avatar */}
          <Skeleton w={36} h={36} radius={18} style={{ flexShrink: 0 }} />
          {/* Text block */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton w={`${50 + (i % 3) * 15}%`} h={13} />
            <Skeleton w={`${30 + (i % 4) * 10}%`} h={11} />
          </div>
          {/* Badge */}
          <Skeleton w={56} h={22} radius={999} style={{ flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Stats row skeleton ───────────────────────────────────────────────────────
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
