import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const PLAN_LIMITS: Record<string, number> = {
  free: 0, starter: 1000, pro: 10000, enterprise: -1
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, prospectId, sequenceId, stepIndex } = body;

    if (!userId || !prospectId || !sequenceId) {
      return NextResponse.json({ error: "userId, prospectId, sequenceId required" }, { status: 400 });
    }

    // Check plan
    const { data: planData } = await supabaseAdmin
      .from("user_plans").select("plan").eq("user_id", userId).single();
    const plan = planData?.plan ?? "free";
    const monthlyLimit = PLAN_LIMITS[plan] ?? 0;

    if (monthlyLimit === 0) {
      return NextResponse.json({
        error: "Email sending requires Starter plan ($29/mo)",
        upgrade: true
      }, { status: 403 });
    }

    // Get prospect
    const { data: prospect } = await supabaseAdmin
      .from("prospects").select("*").eq("id", prospectId).single();
    if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });

    // Get sequence
    const { data: sequence } = await supabaseAdmin
      .from("sequences").select("*").eq("id", sequenceId).single();
    if (!sequence) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });

    const steps = sequence.steps ?? [];
    const currentStep = steps[stepIndex ?? 0];
    if (!currentStep) return NextResponse.json({ error: "No more steps in sequence" }, { status: 400 });

    // Personalize email
    const firstName = prospect.name?.split(" ")[0] ?? prospect.name;
    let subject = (currentStep.subject ?? "")
      .replace(/\{\{firstName\}\}/g, firstName)
      .replace(/\{\{company\}\}/g, prospect.company ?? "")
      .replace(/\{\{role\}\}/g, prospect.role ?? "");
    let emailBody = (currentStep.body ?? "")
      .replace(/\{\{firstName\}\}/g, firstName)
      .replace(/\{\{company\}\}/g, prospect.company ?? "")
      .replace(/\{\{role\}\}/g, prospect.role ?? "")
      .replace(/\{\{sender\}\}/g, "The SalesForge Team");

    // Use AI to personalize if step has aiWritten flag
    if (currentStep.aiWritten || !emailBody.trim()) {
      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "emailWriter",
          prompt: `Write step ${(stepIndex ?? 0) + 1} of ${steps.length} in a sales sequence for: ${prospect.name}, ${prospect.role} at ${prospect.company} (${prospect.industry}). This is touch #${(stepIndex ?? 0) + 1}. Keep it under 100 words, human tone, different angle from previous emails.`,
          userId,
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.result) emailBody = aiData.result;
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });

    // Build HTML
    const htmlBody = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;line-height:1.7;font-size:15px;">
${emailBody.split('\n').map((l: string) => l.trim() ? `<p style="margin:0 0 12px">${l}</p>` : '<br>').join('')}
<hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 16px">
<p style="color:#888;font-size:12px">Sent via <a href="https://salesforge.ai" style="color:#888">SalesForge AI</a> · <a href="#unsubscribe" style="color:#888">Unsubscribe</a></p>
</body></html>`;

    // Send email
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "SalesForge AI <onboarding@resend.dev>",
        to: [prospect.email],
        subject: subject || `Following up — ${prospect.company}`,
        html: htmlBody,
        text: emailBody,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      return NextResponse.json({ error: resendData.message ?? "Failed to send" }, { status: 500 });
    }

    // Log email
    await supabaseAdmin.from("email_logs").insert({
      user_id: userId,
      prospect_id: prospectId,
      sequence_id: sequenceId,
      subject: subject || `Following up — ${prospect.company}`,
      body: emailBody,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    // Update prospect status
    await supabaseAdmin.from("prospects")
      .update({ status: "contacted", updated_at: new Date().toISOString() })
      .eq("id", prospectId);

    // Schedule next step if exists
    const nextStep = steps[(stepIndex ?? 0) + 1];
    let nextScheduled = null;
    if (nextStep) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + (nextStep.day - (currentStep.day ?? 1)));
      await supabaseAdmin.from("scheduled_followups").insert({
        user_id: userId,
        prospect_id: prospectId,
        subject: nextStep.subject?.replace(/\{\{firstName\}\}/g, firstName).replace(/\{\{company\}\}/g, prospect.company ?? "") ?? `Follow-up #${(stepIndex ?? 0) + 2}`,
        body: nextStep.body?.replace(/\{\{firstName\}\}/g, firstName).replace(/\{\{company\}\}/g, prospect.company ?? "") ?? "",
        scheduled_at: nextDate.toISOString(),
        touch_number: (stepIndex ?? 0) + 2,
        angle: "follow-up",
        status: "pending",
      });
      nextScheduled = nextDate.toLocaleDateString();
    }

    return NextResponse.json({
      success: true,
      emailId: resendData.id,
      message: `Email sent to ${prospect.name} (${prospect.email})`,
      nextStep: nextStep ? `Next email scheduled for ${nextScheduled}` : "Sequence complete",
      stepsRemaining: steps.length - ((stepIndex ?? 0) + 1),
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
