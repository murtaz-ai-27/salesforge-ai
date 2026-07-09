import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error:"userId required" }, { status:400 });
    const { data, error } = await supabaseAdmin
      .from("scheduled_followups")
      .select("*, prospects(name, email, company, role)")
      .eq("user_id", userId).eq("status","pending")
      .order("scheduled_at", { ascending:true });
    if (error) throw error;
    return NextResponse.json({ followups:data??[] });
  } catch (err:any) { return NextResponse.json({ error:err.message }, { status:500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, prospectId, subject, emailBody, scheduledAt, touchNumber, angle } = body;
    if (!userId||!subject||!emailBody||!scheduledAt) {
      return NextResponse.json({ error:"userId, subject, emailBody, scheduledAt required" }, { status:400 });
    }
    const { data, error } = await supabaseAdmin.from("scheduled_followups").insert({
      user_id:userId, prospect_id:prospectId??null,
      subject, body:emailBody, scheduled_at:scheduledAt,
      touch_number:touchNumber??1, angle:angle??"follow-up", status:"pending",
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ followup:data, message:`Follow-up scheduled for ${new Date(scheduledAt).toLocaleDateString()}` });
  } catch (err:any) { return NextResponse.json({ error:err.message }, { status:500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id) return NextResponse.json({ error:"id required" }, { status:400 });
    const { data, error } = await supabaseAdmin.from("scheduled_followups")
      .update({ status:status??"sent", updated_at:new Date().toISOString() })
      .eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ followup:data });
  } catch (err:any) { return NextResponse.json({ error:err.message }, { status:500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error:"id required" }, { status:400 });
    await supabaseAdmin.from("scheduled_followups").delete().eq("id", id);
    return NextResponse.json({ success:true });
  } catch (err:any) { return NextResponse.json({ error:err.message }, { status:500 }); }
}
