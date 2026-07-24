import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { userId, calendlyLink, prospectId, prospectName, prospectEmail } = await req.json();
    if (!userId || !calendlyLink) return NextResponse.json({ error: "userId and calendlyLink required" }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("meeting_bookings")
      .insert({ user_id:userId, prospect_id:prospectId??null, prospect_name:prospectName??null, prospect_email:prospectEmail??null, calendly_link:calendlyLink, status:"pending" })
      .select().single();
    if (error) throw error;
    if (prospectId) {
      await supabaseAdmin.from("prospects").update({ status:"meeting", updated_at:new Date().toISOString() }).eq("id",prospectId);
    }
    await supabaseAdmin.from("notifications").insert({ user_id:userId, type:"meeting", title:"📅 Meeting Link Sent", message:`Calendly link sent to ${prospectName??"prospect"}`, link:"/dashboard/inbox", read:false }).catch(()=>{});
    return NextResponse.json({ booking: data, calendlyUrl: calendlyLink });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("meeting_bookings")
      .select("*, prospects(name, email, company)").eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ meetings: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
