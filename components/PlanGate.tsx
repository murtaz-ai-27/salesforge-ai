"use client";
/**
 * PlanGate — Wraps any feature that requires a minimum plan.
 *
 * Usage:
 *   <PlanGate feature="mcpAccess" currentPlan={plan}>
 *     <McpPanel />
 *   </PlanGate>
 *
 *   <PlanGate feature="linkedinAccess" currentPlan={plan} inline>
 *     <LinkedInButton />
 *   </PlanGate>
 */

import React, { useState } from "react";
import { Plan, PLAN_LIMITS, PLAN_NAMES, PLAN_COLOR, UPGRADE_TO } from "@/lib/roles";
import { useRouter } from "next/navigation";

type GatedFeature =
  | "emailSending"
  | "linkedinAccess"
  | "mcpAccess"
  | "customPrompts"
  | "prioritySupport"
  | "apiAccess"
  | "advancedAnalytics"
  | "fullAnalytics";

interface PlanGateProps {
  /** The feature being gated */
  feature: GatedFeature;
  /** The user's current plan */
  currentPlan: Plan;
  /** Children shown when access is allowed */
  children: React.ReactNode;
  /**
   * inline=true → renders a small locked overlay over children instead
   * of replacing them completely. Good for buttons/icons.
   */
  inline?: boolean;
  /** Custom CTA text */
  cta?: string;
}

/* ── Feature → minimum required plan ─────────────────────────────── */
const FEATURE_MIN_PLAN: Record<GatedFeature, Plan> = {
  emailSending:      "starter",
  linkedinAccess:    "pro",
  mcpAccess:         "pro",
  customPrompts:     "pro",
  prioritySupport:   "pro",
  apiAccess:         "pro",
  advancedAnalytics: "starter",
  fullAnalytics:     "pro",
};

const FEATURE_LABEL: Record<GatedFeature, string> = {
  emailSending:      "Email Sending",
  linkedinAccess:    "LinkedIn Automation",
  mcpAccess:         "MCP / API Access",
  customPrompts:     "Custom AI Prompts",
  prioritySupport:   "Priority Support",
  apiAccess:         "API Access",
  advancedAnalytics: "Advanced Analytics",
  fullAnalytics:     "Full Analytics & Reports",
};

const PLAN_ORDER: Plan[] = ["free", "starter", "pro", "enterprise"];

function planRank(p: Plan) { return PLAN_ORDER.indexOf(p); }

function hasAccess(currentPlan: Plan, feature: GatedFeature): boolean {
  const minPlan = FEATURE_MIN_PLAN[feature];
  return planRank(currentPlan) >= planRank(minPlan);
}

/* ── Styles ─────────────────────────────────────────────────────── */
const S = {
  bg:      "#050505",
  panel:   "#0d1018",
  panel2:  "#111520",
  line:    "rgba(255,255,255,0.07)",
  text:    "#f4f5f7",
  muted:   "#9598a3",
  faint:   "#555a66",
};

/* ── Upgrade Modal ───────────────────────────────────────────────── */
function UpgradeModal({
  feature,
  currentPlan,
  onClose,
}: {
  feature: GatedFeature;
  currentPlan: Plan;
  onClose: () => void;
}) {
  const router = useRouter();
  const minPlan = FEATURE_MIN_PLAN[feature];
  const minColor = PLAN_COLOR[minPlan];
  const upgradeTo = UPGRADE_TO[currentPlan];
  const targetPlan = upgradeTo ?? minPlan;
  const targetColor = PLAN_COLOR[targetPlan];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: S.panel, border: `1px solid ${S.line}`,
          borderRadius: 20, padding: "36px 32px", maxWidth: 420, width: "100%",
          position: "relative", boxShadow: `0 0 60px ${targetColor}22`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            color: S.faint, fontSize: 20, lineHeight: 1,
          }}
        >×</button>

        {/* Lock icon */}
        <div style={{
          width: 54, height: 54, borderRadius: 14,
          background: `${minColor}18`, border: `1px solid ${minColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke={minColor} strokeWidth="1.8"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke={minColor} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ fontFamily: "Syne,sans-serif", fontSize: 20, fontWeight: 800, color: S.text, marginBottom: 8 }}>
          {FEATURE_LABEL[feature]}
        </div>
        <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.65, marginBottom: 24 }}>
          This feature requires the{" "}
          <span style={{ color: minColor, fontWeight: 700 }}>{PLAN_NAMES[minPlan]} plan</span>
          {" "}or above. You&apos;re currently on{" "}
          <span style={{ color: PLAN_COLOR[currentPlan], fontWeight: 700 }}>{PLAN_NAMES[currentPlan]}</span>.
        </div>

        {/* What's included in target plan */}
        <div style={{
          background: S.panel2, border: `1px solid ${targetColor}20`,
          borderRadius: 12, padding: "14px 16px", marginBottom: 22,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: targetColor, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
            {PLAN_NAMES[targetPlan]} Plan includes
          </div>
          {[
            PLAN_LIMITS[targetPlan].prospects === -1 ? "Unlimited prospects" : `${PLAN_LIMITS[targetPlan].prospects.toLocaleString()} prospects`,
            PLAN_LIMITS[targetPlan].emailsPerMonth === -1 ? "Unlimited emails" : `${PLAN_LIMITS[targetPlan].emailsPerMonth.toLocaleString()} emails/mo`,
            PLAN_LIMITS[targetPlan].mcpAccess ? "MCP / API access" : null,
            PLAN_LIMITS[targetPlan].linkedinAccess ? "LinkedIn automation" : null,
            PLAN_LIMITS[targetPlan].customPrompts ? "Custom AI prompts" : null,
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: S.muted, marginBottom: 5 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 4.5" stroke={targetColor} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {item}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => { onClose(); router.push("/dashboard/pricing"); }}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 11,
            background: targetColor, border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 800, color: targetColor === "#C8FF00" ? "#050505" : "#fff",
            fontFamily: "Syne,sans-serif", letterSpacing: "0.02em",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "0.88")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "1")}
        >
          Upgrade to {PLAN_NAMES[targetPlan]} →
        </button>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: S.faint }}>
          Cancel anytime · No contracts
        </div>
      </div>
    </div>
  );
}

/* ── Inline locked overlay ───────────────────────────────────────── */
function InlineLock({ feature, currentPlan }: { feature: GatedFeature; currentPlan: Plan }) {
  const [open, setOpen] = useState(false);
  const minPlan = FEATURE_MIN_PLAN[feature];
  const color = PLAN_COLOR[minPlan];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Requires ${PLAN_NAMES[minPlan]} plan`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 10px", borderRadius: 8,
          background: `${color}15`, border: `1px solid ${color}30`,
          cursor: "pointer", fontSize: 11.5, fontWeight: 700, color,
          fontFamily: "Syne,sans-serif",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {PLAN_NAMES[minPlan]}+
      </button>
      {open && (
        <UpgradeModal feature={feature} currentPlan={currentPlan} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

/* ── Main PlanGate ───────────────────────────────────────────────── */
export function PlanGate({ feature, currentPlan, children, inline = false, cta }: PlanGateProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const allowed = hasAccess(currentPlan, feature);

  if (allowed) return <>{children}</>;

  if (inline) {
    return <InlineLock feature={feature} currentPlan={currentPlan} />;
  }

  /* Full-replacement blocked state */
  const minPlan = FEATURE_MIN_PLAN[feature];
  const color = PLAN_COLOR[minPlan];

  return (
    <>
      <div
        style={{
          background: S.panel, border: `1px solid ${S.line}`,
          borderRadius: 16, padding: "40px 32px", textAlign: "center",
          cursor: "pointer",
        }}
        onClick={() => setModalOpen(true)}
      >
        <div style={{
          width: 54, height: 54, borderRadius: 14,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.8"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: 17, fontWeight: 800, color: S.text, marginBottom: 6 }}>
          {FEATURE_LABEL[feature]}
        </div>
        <div style={{ fontSize: 13, color: S.muted, marginBottom: 20 }}>
          Requires <span style={{ color, fontWeight: 700 }}>{PLAN_NAMES[minPlan]}</span> or above
        </div>
        <button
          style={{
            padding: "10px 24px", borderRadius: 10,
            background: color, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 800, color: color === "#C8FF00" ? "#050505" : "#fff",
            fontFamily: "Syne,sans-serif",
          }}
        >
          {cta ?? `Upgrade to ${PLAN_NAMES[minPlan]} →`}
        </button>
      </div>

      {modalOpen && (
        <UpgradeModal feature={feature} currentPlan={currentPlan} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

export { hasAccess };
