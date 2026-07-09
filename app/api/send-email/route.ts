import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const PLAN_LIMITS: Record<string,number> = {
  free:0, starter:1000, pro:10000, enterprise:-1
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, to, toName, subject, emailBody, prospectId } = body;

    if (!userId||!to||!subject||!emailBody) {
      return NextResponse.json({ error:"userId, to, subject, emailBody required" }, { status:400 });
    }

    const { data:planData } = await supabaseAdmin
      .from("user_plans").select("plan").eq("user_id", userId).single();
    const plan = planData?.plan ?? "free";
    const monthlyLimit = PLAN_LIMITS[plan] ?? 0;

    if (monthlyLimit === 0) {
      return NextResponse.json({
        error:"Email sending requires Starter plan ($29/mo). Upgrade at /dashboard/pricing",
        upgrade:true, currentPlan:"free"
      }, { status:403 });
    }

    if (monthlyLimit !== -1) {
      const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
      const { count } = await supabaseAdmin.from("email_logs")
        .select("*",{count:"exact",head:true})
        .eq("user_id", userId).gte("sent_at", start.toISOString());
      if ((count??0) >= monthlyLimit) {
        return NextResponse.json({
          error:`Monthly limit reached (${count}/${monthlyLimit}). Upgrade plan.`,
          upgrade:true, used:count, limit:monthlyLimit
        }, { status:429 });
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error:"RESEND_API_KEY not configured" }, { status:500 });

    const htmlBody = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;line-height:1.7;font-size:15px;">
${emailBody.split('\n').map((l:string)=>l.trim()?`<p style="margin:0 0 12px">${l}</p>`:'<br>').join('')}
<hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 16px">
<p style="color:#888;font-size:12px">Sent via <a href="https://salesforge.ai" style="color:#888">SalesForge AI</a> · <a href="#unsubscribe" style="color:#888">Unsubscribe</a></p>
</body></html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{"Authorization":`Bearer ${resendKey}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "SalesForge AI <onboarding@resend.dev>",
        to:[to], subject, html:htmlBody, text:emailBody,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) return NextResponse.json({ error:resendData.message??"Resend error", details:resendData }, { status:500 });

    await supabaseAdmin.from("email_logs").insert({
      user_id:userId, prospect_id:prospectId??null,
      subject, body:emailBody, status:"sent", sent_at:new Date().toISOString(),
    });

    if (prospectId) {
      await supabaseAdmin.from("prospects")
        .update({ status:"contacted", updated_at:new Date().toISOString() })
        .eq("id", prospectId).eq("status","new");
    }

    return NextResponse.json({ success:true, emailId:resendData.id, message:`Email sent to ${toName||to}` });
  } catch (err:any) {
    return NextResponse.json({ error:err.message }, { status:500 });
  }
}
