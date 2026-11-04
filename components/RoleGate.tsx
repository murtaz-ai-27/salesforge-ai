"use client";
/**
 * RoleGate — Conditionally renders children based on the user's app role.
 *
 * Usage:
 *   // Block entire page section
 *   <RoleGate appRole={appRole} require="manager">
 *     <AutomationPanel />
 *   </RoleGate>
 *
 *   // Inline — just hide a button
 *   <RoleGate appRole={appRole} require="admin" inline>
 *     <DeleteButton />
 *   </RoleGate>
 *
 *   // Read-only mode — show children but pass readOnly prop
 *   <RoleGate appRole={appRole} require="member" readOnlyBelow="manager">
 *     <ProspectTable readOnly={...} />
 *   </RoleGate>
 */

import React, { useState } from "react";
import { AppRole, ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";

const ROLE_ORDER: AppRole[] = ["viewer", "member", "manager", "admin", "owner"];
function roleRank(r: AppRole) { return ROLE_ORDER.indexOf(r); }

interface RoleGateProps {
  /** The user's current app role */
  appRole: AppRole;
  /** Minimum role required to see/use this */
  require: AppRole;
  children: React.ReactNode;
  /** Just hide the element entirely (no explanation shown) */
  hidden?: boolean;
  /** Show a small chip instead of full blocked screen */
  inline?: boolean;
  /** Custom message */
  message?: string;
}

const S = {
  bg:    "#050505",
  panel: "#0d1018",
  line:  "rgba(255,255,255,0.07)",
  text:  "#f4f5f7",
  muted: "#9598a3",
  faint: "#555a66",
};

export function RoleGate({
  appRole,
  require: minRole,
  children,
  hidden = false,
  inline = false,
  message,
}: RoleGateProps) {
  const [expanded, setExpanded] = useState(false);
  const allowed = roleRank(appRole) >= roleRank(minRole);

  if (allowed) return <>{children}</>;

  /* Completely hidden */
  if (hidden) return null;

  const color = ROLE_COLORS[minRole];
  const label = ROLE_LABELS[minRole];

  /* Inline chip */
  if (inline) {
    return (
      <span
        title={`Requires ${label} role or above`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 9px", borderRadius: 7,
          background: `${color}15`, border: `1px solid ${color}30`,
          fontSize: 11, fontWeight: 700, color,
          fontFamily: "Syne,sans-serif", cursor: "default",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2.2"/>
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
        {label}+
      </span>
    );
  }

  /* Full blocked card */
  return (
    <div
      style={{
        background: S.panel, border: `1px solid ${S.line}`,
        borderRadius: 16, padding: "36px 28px", textAlign: "center",
      }}
    >
      {/* Shield icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
        background: `${color}15`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      <div style={{ fontFamily:"Syne,sans-serif", fontSize:17, fontWeight:800, color:S.text, marginBottom:6 }}>
        {message ?? "Access Restricted"}
      </div>
      <div style={{ fontSize:13, color:S.muted, lineHeight:1.65, marginBottom:18 }}>
        This area requires the{" "}
        <span style={{ color, fontWeight:700 }}>{label}</span> role or above.{" "}
        Your current role is{" "}
        <span style={{ color: ROLE_COLORS[appRole], fontWeight:700 }}>{ROLE_LABELS[appRole]}</span>.
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background:"none", border:`1px solid ${S.line}`, borderRadius:8,
          padding:"7px 16px", fontSize:12, color:S.muted, cursor:"pointer",
          fontFamily:"Inter,sans-serif",
        }}
      >
        {expanded ? "Hide details ↑" : "What can I do? ↓"}
      </button>

      {expanded && (
        <div style={{
          marginTop:14, padding:"14px 16px",
          background:"rgba(255,255,255,0.03)", borderRadius:10,
          textAlign:"left", fontSize:12.5, color:S.muted, lineHeight:1.7,
        }}>
          Ask your <span style={{ color: ROLE_COLORS["owner"], fontWeight:700 }}>Owner</span> or{" "}
          <span style={{ color: ROLE_COLORS["admin"], fontWeight:700 }}>Admin</span> to upgrade your role
          to <span style={{ color, fontWeight:700 }}>{label}</span> or above in{" "}
          <strong style={{ color:S.text }}>Settings → Team</strong>.
        </div>
      )}
    </div>
  );
}

/**
 * Wraps children and passes `readOnly={true}` when the role is below `editRole`.
 * The child component must accept a `readOnly` prop.
 *
 * Usage:
 *   <RoleReadOnly appRole={appRole} editRole="member">
 *     {(readOnly) => <ProspectTable readOnly={readOnly} />}
 *   </RoleReadOnly>
 */
export function RoleReadOnly({
  appRole,
  editRole,
  children,
}: {
  appRole:  AppRole;
  editRole: AppRole;
  children: (readOnly: boolean) => React.ReactNode;
}) {
  const readOnly = roleRank(appRole) < roleRank(editRole);
  return <>{children(readOnly)}</>;
}

export { ROLE_LABELS, ROLE_COLORS };
