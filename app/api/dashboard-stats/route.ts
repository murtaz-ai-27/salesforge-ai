import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// GET /api/dashboard-stats?userId=xxx — aggregated stats for dashboard
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const [prospectsRes, sequencesRes, agentsRes] = await Promise.all([
      supabaseAdmin.from("prospects").select("id, status, ai_score, buying_intent, created_at").eq("user_id", userId),
      supabaseAdmin.from("sequences").select("id, status, open_rate, reply_rate, meeting_rate, prospect_count").eq("user_id", userId),
      supabaseAdmin.from("agents").select("id, status, meetings_booked, emails_sent, replies_handled").eq("user_id", userId),
    ]);

    const prospects = prospectsRes.data ?? [];
    const sequences = sequencesRes.data ?? [];
    const agents = agentsRes.data ?? [];

    const totalMeetings = agents.reduce((sum, a) => sum + (a.meetings_booked ?? 0), 0);
    const totalEmails = agents.reduce((sum, a) => sum + (a.emails_sent ?? 0), 0);
    const activeAgents = agents.filter(a => a.status === "active").length;
    const activeSequences = sequences.filter(s => s.status === "active").length;
    const totalProspectsInSeq = sequences.reduce((sum, s) => sum + (s.prospect_count ?? 0), 0);

    const avgReplyRate = sequences.length
      ? Math.round(sequences.reduce((sum, s) => sum + (s.reply_rate ?? 0), 0) / sequences.length)
      : 0;
    const avgOpenRate = sequences.length
      ? Math.round(sequences.reduce((sum, s) => sum + (s.open_rate ?? 0), 0) / sequences.length)
      : 0;

    return NextResponse.json({
      prospectsToday: prospects.length,
      emailsSent: totalEmails,
      meetingsBooked: totalMeetings,
      replyRate: avgReplyRate,
      openRate: avgOpenRate,
      activeSequences,
      activeAgents,
      totalAgents: agents.length,
      prospectsInSequences: totalProspectsInSeq,
      topProspects: prospects.sort((a,b) => (b.ai_score??0) - (a.ai_score??0)).slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
