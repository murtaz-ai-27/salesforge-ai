import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error:"userId required" }, { status:400 });

    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate()-now.getDay());

    const [prospectsRes, emailsTodayRes, emailsMonthRes, agentRunsTodayRes, agentRunsMonthRes, followupsRes] = await Promise.all([
      supabaseAdmin.from("prospects").select("id,status,ai_score,buying_intent").eq("user_id", userId),
      supabaseAdmin.from("email_logs").select("*",{count:"exact",head:true}).eq("user_id", userId).gte("sent_at", startOfDay.toISOString()),
      supabaseAdmin.from("email_logs").select("*",{count:"exact",head:true}).eq("user_id", userId).gte("sent_at", startOfMonth.toISOString()),
      supabaseAdmin.from("agent_runs").select("*",{count:"exact",head:true}).eq("user_id", userId).gte("created_at", startOfDay.toISOString()),
      supabaseAdmin.from("agent_runs").select("id,agent_type").eq("user_id", userId).gte("created_at", startOfMonth.toISOString()),
      supabaseAdmin.from("scheduled_followups").select("*",{count:"exact",head:true}).eq("user_id", userId).eq("status","pending"),
    ]);

    const prospects = prospectsRes.data ?? [];
    const statusCounts = prospects.reduce((acc:any, p:any) => { acc[p.status]=(acc[p.status]||0)+1; return acc; }, {});
    const agentRunsByType = (agentRunsMonthRes.data??[]).reduce((acc:any, r:any) => { acc[r.agent_type]=(acc[r.agent_type]||0)+1; return acc; }, {});
    const avgScore = prospects.length ? Math.round(prospects.reduce((s:number,p:any)=>s+(p.ai_score??0),0)/prospects.length) : 0;

    return NextResponse.json({
      totalProspects: prospects.length,
      avgIcpScore: avgScore,
      highIntentProspects: prospects.filter((p:any)=>p.buying_intent==="high").length,
      prospectsByStatus: statusCounts,
      emailsSentToday: emailsTodayRes.count??0,
      emailsSentThisMonth: emailsMonthRes.count??0,
      agentRunsToday: agentRunsTodayRes.count??0,
      agentRunsByType,
      pendingFollowups: followupsRes.count??0,
      meetingsBooked: statusCounts["meeting"]??0,
      pipelineValue: (statusCounts["meeting"]??0)*6000,
    });
  } catch (err:any) { return NextResponse.json({ error:err.message }, { status:500 }); }
}
