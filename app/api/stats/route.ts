import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const secHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId || userId.length < 5) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400, headers: secHeaders });
    }

    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for performance
    const [
      prospectsRes,
      emailsTodayRes,
      emailsMonthRes,
      agentRunsTodayRes,
      agentRunsMonthRes,
      followupsRes,
    ] = await Promise.all([
      supabaseAdmin.from("prospects").select("id,status,ai_score,buying_intent").eq("user_id", userId).limit(5000),
      supabaseAdmin.from("email_logs").select("*",{count:"exact",head:true}).eq("user_id", userId).gte("sent_at", startOfDay.toISOString()),
      supabaseAdmin.from("email_logs").select("*",{count:"exact",head:true}).eq("user_id", userId).gte("sent_at", startOfMonth.toISOString()),
      supabaseAdmin.from("agent_runs").select("*",{count:"exact",head:true}).eq("user_id", userId).gte("created_at", startOfDay.toISOString()),
      supabaseAdmin.from("agent_runs").select("id,agent_type").eq("user_id", userId).gte("created_at", startOfMonth.toISOString()).limit(1000),
      supabaseAdmin.from("scheduled_followups").select("*",{count:"exact",head:true}).eq("user_id", userId).eq("status","pending"),
    ]);

    const prospects = prospectsRes.data ?? [];
    const statusCounts = prospects.reduce((acc: Record<string,number>, p) => {
      const s = (p as any).status ?? "unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const agentRunsByType = (agentRunsMonthRes.data ?? []).reduce((acc: Record<string,number>, r) => {
      const t = (r as any).agent_type ?? "unknown";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    const avgScore = prospects.length
      ? Math.round(prospects.reduce((s, p) => s + ((p as any).ai_score ?? 0), 0) / prospects.length)
      : 0;

    return NextResponse.json({
      totalProspects: prospects.length,
      avgIcpScore: avgScore,
      highIntentProspects: prospects.filter((p) => (p as any).buying_intent === "high").length,
      prospectsByStatus: statusCounts,
      emailsSentToday: emailsTodayRes.count ?? 0,
      emailsSentThisMonth: emailsMonthRes.count ?? 0,
      agentRunsToday: agentRunsTodayRes.count ?? 0,
      agentRunsByType,
      pendingFollowups: followupsRes.count ?? 0,
      meetingsBooked: statusCounts["meeting"] ?? 0,
      pipelineValue: (statusCounts["meeting"] ?? 0) * 6000,
    }, { headers: secHeaders });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: secHeaders });
  }
}
