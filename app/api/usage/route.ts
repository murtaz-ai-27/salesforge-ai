import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const PLAN_LIMITS = {
  free:       { emailsPerMonth:0,     agentRunsPerDay:5,  prospects:50,  sequences:2,  automations:3  },
  starter:    { emailsPerMonth:1000,  agentRunsPerDay:50, prospects:500, sequences:10, automations:8  },
  pro:        { emailsPerMonth:10000, agentRunsPerDay:-1, prospects:-1,  sequences:-1, automations:15 },
  enterprise: { emailsPerMonth:-1,    agentRunsPerDay:-1, prospects:-1,  sequences:-1, automations:-1 },
};

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Get user plan
    const { data: planData } = await supabaseAdmin
      .from("user_plans")
      .select("plan, created_at")
      .eq("user_id", userId)
      .single();

    const plan = planData?.plan ?? "free";
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;

    // Get actual usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [prospectsRes, sequencesRes, emailsRes, agentRunsRes] = await Promise.all([
      supabaseAdmin.from("prospects").select("*", { count:"exact", head:true }).eq("user_id", userId),
      supabaseAdmin.from("sequences").select("*", { count:"exact", head:true }).eq("user_id", userId).eq("status", "active"),
      supabaseAdmin.from("email_logs").select("*", { count:"exact", head:true }).eq("user_id", userId).gte("sent_at", startOfMonth),
      supabaseAdmin.from("agent_runs").select("*", { count:"exact", head:true }).eq("user_id", userId).gte("created_at", startOfDay),
    ]);

    const usage = {
      prospects: prospectsRes.count ?? 0,
      sequences: sequencesRes.count ?? 0,
      emailsThisMonth: emailsRes.count ?? 0,
      agentRunsToday: agentRunsRes.count ?? 0,
    };

    return NextResponse.json({ plan, limits, usage,
      canSendEmail: limits.emailsPerMonth === -1 || usage.emailsThisMonth < limits.emailsPerMonth,
      canRunAgent: limits.agentRunsPerDay === -1 || usage.agentRunsToday < limits.agentRunsPerDay,
      canAddProspect: limits.prospects === -1 || usage.prospects < limits.prospects,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
