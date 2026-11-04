/**
 * GET  /api/role/app?userId=<uid>   → { appRole }
 * POST /api/role/app                → { userId, appRole, targetUserId } → update role
 *
 * App roles live in user_profiles.app_role (column).
 * Default for new users: "owner" (they own their own account).
 * When invited to a team, their role is set by the inviter.
 *
 * Supabase migration required:
 *   ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS app_role TEXT DEFAULT 'owner';
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { AppRole, ROLE_CAN } from "@/lib/roles";

const VALID_ROLES: AppRole[] = ["owner", "admin", "manager", "member", "viewer"];

/* ── GET — fetch appRole for a user ──────────────────────────────── */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("app_role")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // No profile yet → default to owner (they own their own account)
    return NextResponse.json({ appRole: "owner" });
  }

  const appRole: AppRole = VALID_ROLES.includes(data.app_role as AppRole)
    ? (data.app_role as AppRole)
    : "owner";

  return NextResponse.json({ appRole });
}

/* ── POST — update a team member's role (manager/owner/admin only) ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requesterId, targetUserId, newRole } = body as {
      requesterId:  string;
      targetUserId: string;
      newRole:      AppRole;
    };

    if (!requesterId || !targetUserId || !newRole) {
      return NextResponse.json({ error: "requesterId, targetUserId, newRole required" }, { status: 400 });
    }
    if (!VALID_ROLES.includes(newRole)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
    }

    // Fetch requester's role
    const { data: requesterData } = await supabaseAdmin
      .from("user_profiles")
      .select("app_role")
      .eq("user_id", requesterId)
      .single();

    const requesterRole: AppRole = (requesterData?.app_role as AppRole) ?? "member";

    // Only owner/admin/manager can assign roles
    if (!ROLE_CAN[requesterRole].manageTeam) {
      return NextResponse.json({ error: "You don't have permission to manage team roles" }, { status: 403 });
    }

    // Can't assign a role equal to or higher than your own
    const RANK: Record<AppRole, number> = { owner: 5, admin: 4, manager: 3, member: 2, viewer: 1 };
    if (RANK[newRole] >= RANK[requesterRole]) {
      return NextResponse.json({ error: "Cannot assign a role equal to or higher than your own" }, { status: 403 });
    }

    // Can't change an owner's role
    const { data: targetData } = await supabaseAdmin
      .from("user_profiles")
      .select("app_role")
      .eq("user_id", targetUserId)
      .single();

    if ((targetData?.app_role as AppRole) === "owner") {
      return NextResponse.json({ error: "Cannot change the owner's role" }, { status: 403 });
    }

    // Update
    const { error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .update({ app_role: newRole })
      .eq("user_id", targetUserId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, appRole: newRole });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update role" },
      { status: 500 }
    );
  }
}
