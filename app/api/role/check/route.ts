/**
 * GET /api/role/check?userId=<uid>
 *
 * Returns whether the given Firebase UID has admin privileges.
 * Admin UIDs are defined in the ADMIN_UIDS env var (comma-separated).
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminUid } from "@/lib/roles";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  return NextResponse.json({
    isAdmin: isAdminUid(userId),
  });
}
