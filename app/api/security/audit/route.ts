// app/api/security/audit/route.ts
// Security audit log — like Apollo.io's audit trail
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const SEC = { "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" };

// Log security events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, event, metadata } = body;

    if (!userId || !event) {
      return NextResponse.json({ error: "userId and event required" }, { status: 400 });
    }

    const allowedEvents = [
      "login", "logout", "password_change", "email_change",
      "prospect_export", "api_key_view", "settings_change",
      "plan_upgrade", "plan_downgrade", "data_delete",
      "failed_login", "rate_limit_hit", "suspicious_activity",
    ];

    if (!allowedEvents.includes(event)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = req.headers.get("user-agent")?.slice(0, 200) ?? "unknown";

    await supabaseAdmin.from("security_audit_log").insert({
      user_id: userId,
      event,
      ip_hash: Buffer.from(ip).toString("base64"), // hash IP for privacy
      user_agent: userAgent,
      metadata: metadata ?? {},
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { headers: SEC });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}

// Get audit log for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("security_audit_log")
      .select("event, metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ logs: data ?? [] }, { headers: SEC });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
