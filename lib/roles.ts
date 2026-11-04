/**
 * lib/roles.ts — Single source of truth for plans, limits, and roles.
 *
 * Import this in both API routes AND frontend components so limits
 * are never duplicated or out of sync.
 */

export type Plan = "free" | "starter" | "pro" | "enterprise";

/** System-level role — controls access to /admin panel */
export type SystemRole = "user" | "system_admin";

/**
 * App-level role — controls what a user sees and can do inside the app.
 *
 * owner    → Full access. Billing, team mgmt, every page.
 * admin    → Full access except billing settings.
 * manager  → Sees all team data. No billing/team mgmt.
 * member   → Sees only their own data. Standard features.
 * viewer   → Read-only. Can view dashboards, can't create/edit/delete.
 */
export type AppRole = "owner" | "admin" | "manager" | "member" | "viewer";

/** Legacy alias — kept for backward compat */
export type Role = SystemRole;

/* ── Plan limits ─────────────────────────────────────────────────── */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    emailsPerMonth:    0,
    agentRunsPerDay:   5,
    prospects:         50,
    sequences:         2,
    automations:       3,
    teamMembers:       1,
    templates:         3,
    apiAccess:         false,
    linkedinAccess:    false,
    prioritySupport:   false,
    customPrompts:     false,
    analytics:         "basic",
    mcpAccess:         false,
  },
  starter: {
    emailsPerMonth:    1_000,
    agentRunsPerDay:   50,
    prospects:         500,
    sequences:         10,
    automations:       8,
    teamMembers:       1,
    templates:         20,
    apiAccess:         false,
    linkedinAccess:    false,
    prioritySupport:   false,
    customPrompts:     false,
    analytics:         "advanced",
    mcpAccess:         false,
  },
  pro: {
    emailsPerMonth:    10_000,
    agentRunsPerDay:   -1,   // unlimited
    prospects:         -1,
    sequences:         -1,
    automations:       15,
    teamMembers:       5,
    templates:         -1,
    apiAccess:         true,
    linkedinAccess:    true,
    prioritySupport:   true,
    customPrompts:     true,
    analytics:         "full",
    mcpAccess:         true,
  },
  enterprise: {
    emailsPerMonth:    -1,
    agentRunsPerDay:   -1,
    prospects:         -1,
    sequences:         -1,
    automations:       -1,
    teamMembers:       -1,
    templates:         -1,
    apiAccess:         true,
    linkedinAccess:    true,
    prioritySupport:   true,
    customPrompts:     true,
    analytics:         "full",
    mcpAccess:         true,
  },
};

export interface PlanLimits {
  emailsPerMonth:  number;   // -1 = unlimited
  agentRunsPerDay: number;
  prospects:       number;
  sequences:       number;
  automations:     number;
  teamMembers:     number;
  templates:       number;
  apiAccess:       boolean;
  linkedinAccess:  boolean;
  prioritySupport: boolean;
  customPrompts:   boolean;
  analytics:       "basic" | "advanced" | "full";
  mcpAccess:       boolean;
}

/* ── Usage shape returned from /api/usage ───────────────────────── */
export interface UsageData {
  prospects:        number;
  sequences:        number;
  emailsThisMonth:  number;
  agentRunsToday:   number;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Returns true if the value is within the plan limit (-1 = unlimited). */
export function withinLimit(current: number, limit: number): boolean {
  return limit === -1 || current < limit;
}

/** Human-readable label for a limit value. */
export function formatLimit(limit: number): string {
  return limit === -1 ? "Unlimited" : limit.toLocaleString();
}

/** Canonical plan display names. */
export const PLAN_NAMES: Record<Plan, string> = {
  free:       "Free",
  starter:    "Starter",
  pro:        "Pro",
  enterprise: "Enterprise",
};

/** Upgrade CTA copy per plan. */
export const UPGRADE_TO: Record<Plan, Plan | null> = {
  free:       "starter",
  starter:    "pro",
  pro:        "enterprise",
  enterprise: null,
};

/** Badge color per plan. */
export const PLAN_COLOR: Record<Plan, string> = {
  free:       "#9598a3",
  starter:    "#818cf8",
  pro:        "#C8FF00",
  enterprise: "#f97316",
};

/* ── Admin check ─────────────────────────────────────────────────── */

/**
 * Returns the set of admin Firebase UIDs from the ADMIN_UIDS env var.
 * Format: comma-separated UIDs, e.g. "uid1,uid2"
 * Server-side only.
 */
export function getAdminUids(): Set<string> {
  const raw = process.env.ADMIN_UIDS ?? "";
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
}

export function isAdminUid(uid: string): boolean {
  return getAdminUids().has(uid);
}

/* ═══════════════════════════════════════════════════════════════════
   APP ROLE — permission matrix
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Every page/feature in the dashboard and what roles can access it.
 *
 * "none"      → page is hidden from sidebar + redirected away
 * "read"      → can view, cannot create/edit/delete
 * "own"       → full access but only to their own records
 * "team"      → full access to all team records
 * "full"      → unrestricted
 */
export type AccessLevel = "none" | "read" | "own" | "team" | "full";

export interface PagePermissions {
  dashboard:   AccessLevel;
  prospects:   AccessLevel;
  sequences:   AccessLevel;
  templates:   AccessLevel;
  agents:      AccessLevel;
  automations: AccessLevel;
  inbox:       AccessLevel;
  analytics:   AccessLevel;
  mcp:         AccessLevel;
  pricing:     AccessLevel;   // billing — owner only
  settings:    AccessLevel;
  team:        AccessLevel;   // team management page
}

export const ROLE_PERMISSIONS: Record<AppRole, PagePermissions> = {
  owner: {
    dashboard:   "full",
    prospects:   "full",
    sequences:   "full",
    templates:   "full",
    agents:      "full",
    automations: "full",
    inbox:       "full",
    analytics:   "full",
    mcp:         "full",
    pricing:     "full",
    settings:    "full",
    team:        "full",
  },
  admin: {
    dashboard:   "full",
    prospects:   "full",
    sequences:   "full",
    templates:   "full",
    agents:      "full",
    automations: "full",
    inbox:       "full",
    analytics:   "full",
    mcp:         "full",
    pricing:     "none",   // billing = owner only
    settings:    "full",
    team:        "full",
  },
  manager: {
    dashboard:   "full",
    prospects:   "team",
    sequences:   "team",
    templates:   "full",
    agents:      "team",
    automations: "read",
    inbox:       "team",
    analytics:   "team",
    mcp:         "none",
    pricing:     "none",
    settings:    "read",   // profile only
    team:        "read",   // can view team, can't manage
  },
  member: {
    dashboard:   "full",
    prospects:   "own",
    sequences:   "own",
    templates:   "read",
    agents:      "own",
    automations: "none",
    inbox:       "own",
    analytics:   "own",
    mcp:         "none",
    pricing:     "none",
    settings:    "own",    // profile only
    team:        "none",
  },
  viewer: {
    dashboard:   "read",
    prospects:   "read",
    sequences:   "read",
    templates:   "read",
    agents:      "none",
    automations: "none",
    inbox:       "none",
    analytics:   "read",
    mcp:         "none",
    pricing:     "none",
    settings:    "own",    // own profile only
    team:        "none",
  },
};

/** Returns true if the role can SEE the page at all (not "none"). */
export function canSeePage(
  role: AppRole,
  page: keyof PagePermissions
): boolean {
  return ROLE_PERMISSIONS[role][page] !== "none";
}

/** Returns the access level for a role + page. */
export function getAccess(
  role: AppRole,
  page: keyof PagePermissions
): AccessLevel {
  return ROLE_PERMISSIONS[role][page];
}

/** Human-readable role labels. */
export const ROLE_LABELS: Record<AppRole, string> = {
  owner:   "Owner",
  admin:   "Admin",
  manager: "Manager",
  member:  "Member",
  viewer:  "Viewer",
};

/** Role badge colors. */
export const ROLE_COLORS: Record<AppRole, string> = {
  owner:   "#f97316",
  admin:   "#C8FF00",
  manager: "#818cf8",
  member:  "#38bdf8",
  viewer:  "#9598a3",
};

/** What a role can do (verb-level, for inline checks). */
export const ROLE_CAN: Record<AppRole, {
  createProspect:  boolean;
  editProspect:    boolean;
  deleteProspect:  boolean;
  sendEmail:       boolean;
  createSequence:  boolean;
  runAgent:        boolean;
  createAutomation:boolean;
  manageTeam:      boolean;
  viewBilling:     boolean;
  exportData:      boolean;
}> = {
  owner:   { createProspect:true,  editProspect:true,  deleteProspect:true,  sendEmail:true,  createSequence:true,  runAgent:true,  createAutomation:true,  manageTeam:true,  viewBilling:true,  exportData:true  },
  admin:   { createProspect:true,  editProspect:true,  deleteProspect:true,  sendEmail:true,  createSequence:true,  runAgent:true,  createAutomation:true,  manageTeam:true,  viewBilling:false, exportData:true  },
  manager: { createProspect:true,  editProspect:true,  deleteProspect:false, sendEmail:true,  createSequence:true,  runAgent:true,  createAutomation:false, manageTeam:false, viewBilling:false, exportData:true  },
  member:  { createProspect:true,  editProspect:true,  deleteProspect:false, sendEmail:true,  createSequence:true,  runAgent:true,  createAutomation:false, manageTeam:false, viewBilling:false, exportData:false },
  viewer:  { createProspect:false, editProspect:false, deleteProspect:false, sendEmail:false, createSequence:false, runAgent:false, createAutomation:false, manageTeam:false, viewBilling:false, exportData:false },
};
