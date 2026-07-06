import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// Plan limits
const PLAN_LIMITS = {
  free:       { emailsPerMonth: 0,     agentRunsPerDay: 5,  prospects: 50,  sequences: 2,  automations: 3  },
  starter:    { emailsPerMonth: 1000,  agentRunsPerDay: 50, prospects: 500, sequences: 10, automations: 8  },
  pro:        { emailsPerMonth: 10000, agentRunsPerDay: -1, prospects: -1,  sequences: -1, automations: 15 },
  enterprise: { emailsPerMonth: -1,    agentRunsPerDay: -1, prospects: -1,  sequences: -1, automations: -1 },
};

async function getUserPlan(userId: string): Promise<string> {
  try {
    const { data } = await supabaseAdmin
      .from("user_plans")
      .select("plan")
      .eq("user_id", userId)
      .single();
    return data?.plan ?? "free";
  } catch {
    return "free";
  }
}

async function getEmailUsage(userId: string): Promise<number> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabaseAdmin
      .from("email_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("sent_at", startOfMonth.toISOString());
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, to, subject, body: emailBody, prospectId, sequenceId } = body;

    if (!userId || !to || !subject || !emailBody) {
      return NextResponse.json({ error: "userId, to, subject, and body are required" }, { status: 400 });
    }

    // Check plan limits
    const plan = await getUserPlan(userId);
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;

    if (limits.emailsPerMonth === 0) {
      return NextResponse.json({
        error: "Email sending requires Starter plan or above. Upgrade at /dashboard/pricing",
        upgrade: true,
        currentPlan: plan,
      }, { status: 403 });
    }

    if (limits.emailsPerMonth !== -1) {
      const used = await getEmailUsage(userId);
      if (used >= limits.emailsPerMonth) {
        return NextResponse.json({
          error: `Monthly email limit reached (${used}/${limits.emailsPerMonth}). Upgrade your plan.`,
          upgrade: true,
          currentPlan: plan,
          used,
          limit: limits.emailsPerMonth,
        }, { status: 429 });
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "SalesForge AI <noreply@salesforge.ai>",
        to: [to],
        subject,
        html: emailBody.replace(/\n/g, "<br>"),
        text: emailBody,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      return NextResponse.json({
        error: resendData.message ?? "Failed to send email",
        details: resendData,
      }, { status: 500 });
    }

    // Log to Supabase
    await supabaseAdmin.from("email_logs").insert({
      user_id: userId,
      prospect_id: prospectId ?? null,
      sequence_id: sequenceId ?? null,
      subject,
      body: emailBody,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: resendData.id });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
