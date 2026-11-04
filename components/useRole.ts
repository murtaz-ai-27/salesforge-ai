"use client";
/**
 * useRole — fetches the current user's plan + app role + usage
 * and exposes structured permission flags for the entire frontend.
 *
 * Usage:
 *   const { plan, appRole, limits, canAddProspect, canSeePage, roleLoading } = useRole();
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/useAuth";
import {
  Plan,
  AppRole,
  PlanLimits,
  UsageData,
  PLAN_LIMITS,
  ROLE_CAN,
  ROLE_PERMISSIONS,
  withinLimit,
  canSeePage as canSeePageFn,
  getAccess,
  type AccessLevel,
  type PagePermissions,
} from "@/lib/roles";

export interface RoleState {
  /* Plan */
  plan:    Plan;
  limits:  PlanLimits;
  usage:   UsageData;

  /* App Role */
  appRole: AppRole;

  /* Plan-based permission flags */
  canSendEmail:         boolean;
  canRunAgentByPlan:    boolean;
  canAddProspectByPlan: boolean;
  canUseMcp:            boolean;
  canUseLinkedin:       boolean;
  canUseCustomPrompts:  boolean;

  /* Role-based permission flags */
  canAddProspect:   boolean;
  canEditProspect:  boolean;
  canDeleteProspect:boolean;
  canCreateSequence:boolean;
  canRunAgent:      boolean;
  canSendEmailRole: boolean;
  canManageTeam:    boolean;
  canViewBilling:   boolean;
  canExportData:    boolean;
  canCreateAutomation: boolean;

  /** Returns true if the role can see a sidebar page */
  canSeePage: (page: keyof PagePermissions) => boolean;
  /** Returns the access level for a page */
  pageAccess: (page: keyof PagePermissions) => AccessLevel;

  /* System admin (Salevrix platform admin) */
  isSystemAdmin: boolean;

  roleLoading: boolean;
  roleError:   string | null;
  refresh:     () => void;
}

const DEFAULT_USAGE: UsageData = {
  prospects:       0,
  sequences:       0,
  emailsThisMonth: 0,
  agentRunsToday:  0,
};

export function useRole(): RoleState {
  const { user } = useAuth();

  const [plan,          setPlan]          = useState<Plan>("free");
  const [limits,        setLimits]        = useState<PlanLimits>(PLAN_LIMITS.free);
  const [usage,         setUsage]         = useState<UsageData>(DEFAULT_USAGE);
  const [appRole,       setAppRole]       = useState<AppRole>("member");
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [roleLoading,   setRoleLoading]   = useState(true);
  const [roleError,     setRoleError]     = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!user) { setRoleLoading(false); return; }

    try {
      setRoleLoading(true);
      setRoleError(null);

      const [usageRes, adminRes, appRoleRes] = await Promise.all([
        fetch(`/api/usage?userId=${user.uid}`),
        fetch(`/api/role/check?userId=${user.uid}`),
        fetch(`/api/role/app?userId=${user.uid}`),
      ]);

      if (usageRes.ok) {
        const data = await usageRes.json();
        const fetchedPlan: Plan = data.plan ?? "free";
        setPlan(fetchedPlan);
        setLimits(PLAN_LIMITS[fetchedPlan] ?? PLAN_LIMITS.free);
        setUsage({
          prospects:       data.usage?.prospects       ?? 0,
          sequences:       data.usage?.sequences       ?? 0,
          emailsThisMonth: data.usage?.emailsThisMonth ?? 0,
          agentRunsToday:  data.usage?.agentRunsToday  ?? 0,
        });
      }

      if (adminRes.ok) {
        const d = await adminRes.json();
        setIsSystemAdmin(d.isAdmin === true);
      }

      if (appRoleRes.ok) {
        const d = await appRoleRes.json();
        const r: AppRole = d.appRole ?? "member";
        setAppRole(r);
      }
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : "Failed to load role");
    } finally {
      setRoleLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRole(); }, [fetchRole]);

  /* ── Plan-based flags ──────────────────────────────────────────── */
  const canSendEmail         = limits.emailsPerMonth !== 0 && withinLimit(usage.emailsThisMonth, limits.emailsPerMonth);
  const canRunAgentByPlan    = withinLimit(usage.agentRunsToday, limits.agentRunsPerDay);
  const canAddProspectByPlan = withinLimit(usage.prospects, limits.prospects);
  const canUseMcp            = limits.mcpAccess;
  const canUseLinkedin       = limits.linkedinAccess;
  const canUseCustomPrompts  = limits.customPrompts;

  /* ── Role-based flags (from ROLE_CAN matrix) ───────────────────── */
  const roleCan = ROLE_CAN[appRole];

  /* Combined: role AND plan must both allow */
  const canAddProspect    = roleCan.createProspect  && canAddProspectByPlan;
  const canRunAgent       = roleCan.runAgent         && canRunAgentByPlan;

  return {
    plan, limits, usage, appRole,

    /* Plan flags */
    canSendEmail, canRunAgentByPlan, canAddProspectByPlan,
    canUseMcp, canUseLinkedin, canUseCustomPrompts,

    /* Role flags */
    canAddProspect,
    canEditProspect:    roleCan.editProspect,
    canDeleteProspect:  roleCan.deleteProspect,
    canCreateSequence:  roleCan.createSequence,
    canRunAgent,
    canSendEmailRole:   roleCan.sendEmail,
    canManageTeam:      roleCan.manageTeam,
    canViewBilling:     roleCan.viewBilling,
    canExportData:      roleCan.exportData,
    canCreateAutomation:roleCan.createAutomation,

    /* Page visibility */
    canSeePage: (page) => canSeePageFn(appRole, page),
    pageAccess: (page) => getAccess(appRole, page),

    isSystemAdmin,
    roleLoading,
    roleError,
    refresh: fetchRole,
  };
}
