import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate()-7);
    const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(now.getDate()-14);

    const [
      totalUsersRes, newTodayRes, newWeekRes,
      totalProspectsRes, agentRunsTodayRes, totalAgentRunsRes,
      totalEmailsRes, emailsTodayRes, totalSequencesRes,
      planBreakdownRes, recentSignupsRes, agentsByTypeRes,
      dailySignupsRes, activeTodayRes,
    ] = await Promise.all([
      supabaseAdmin.from("user_profiles").select("*",{count:"exact",head:true}),
      supabaseAdmin.from("user_profiles").select("*",{count:"exact",head:true}).gte("created_at",todayStart.toISOString()),
      supabaseAdmin.from("user_profiles").select("*",{count:"exact",head:true}).gte("created_at",weekStart.toISOString()),
      supabaseAdmin.from("prospects").select("*",{count:"exact",head:true}),
      supabaseAdmin.from("agent_runs").select("*",{count:"exact",head:true}).gte("created_at",todayStart.toISOString()),
      supabaseAdmin.from("agent_runs").select("*",{count:"exact",head:true}),
      supabaseAdmin.from("email_logs").select("*",{count:"exact",head:true}),
      supabaseAdmin.from("email_logs").select("*",{count:"exact",head:true}).gte("created_at",todayStart.toISOString()),
      supabaseAdmin.from("sequences").select("*",{count:"exact",head:true}),
      supabaseAdmin.from("user_plans").select("plan"),
      supabaseAdmin.from("user_profiles").select("user_id,name,created_at").order("created_at",{ascending:false}).limit(20),
      supabaseAdmin.from("agent_runs").select("agent_type"),
      supabaseAdmin.from("user_profiles").select("created_at").gte("created_at",fourteenDaysAgo.toISOString()),
      supabaseAdmin.from("agent_runs").select("user_id").gte("created_at",todayStart.toISOString()),
    ]);

    // Plan breakdown
    const planBreakdown:Record<string,number> = {free:0,starter:0,pro:0,enterprise:0};
    (planBreakdownRes.data??[]).forEach((r:any)=>{ const p=r.plan??"free"; planBreakdown[p]=(planBreakdown[p]??0)+1; });

    // Recent signups
    const recentSignups = (recentSignupsRes.data??[]).map((u:any)=>({
      uid:u.user_id, email:u.name??"Unknown", created_at:u.created_at, plan:"free"
    }));

    // Agent types
    const agentsByType:Record<string,number>={};
    (agentsByTypeRes.data??[]).forEach((r:any)=>{ const t=r.agent_type??"general"; agentsByType[t]=(agentsByType[t]??0)+1; });

    // Daily signups
    const dailyMap:Record<string,number>={};
    for(let i=13;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); dailyMap[d.toISOString().split("T")[0]]=0; }
    (dailySignupsRes.data??[]).forEach((r:any)=>{ const k=r.created_at?.split("T")[0]; if(k&&dailyMap[k]!==undefined)dailyMap[k]++; });
    const dailySignups = Object.entries(dailyMap).map(([date,count])=>({date,count}));

    // Active today
    const activeSet = new Set((activeTodayRes.data??[]).map((r:any)=>r.user_id));

    return NextResponse.json({
      totalUsers:       totalUsersRes.count??0,
      newUsersToday:    newTodayRes.count??0,
      newUsersThisWeek: newWeekRes.count??0,
      activeUsersToday: activeSet.size,
      totalProspects:   totalProspectsRes.count??0,
      agentRunsToday:   agentRunsTodayRes.count??0,
      totalAgentRuns:   totalAgentRunsRes.count??0,
      totalEmailsSent:  totalEmailsRes.count??0,
      emailsSentToday:  emailsTodayRes.count??0,
      totalSequences:   totalSequencesRes.count??0,
      planBreakdown, recentSignups, agentsByType, dailySignups,
    });
  } catch(err:any) {
    return NextResponse.json({error:err.message},{status:500});
  }
}
