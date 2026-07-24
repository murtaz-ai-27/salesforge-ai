import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("notifications").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return NextResponse.json({ notifications: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, title, message, link } = await req.json();
    if (!userId || !type || !title) return NextResponse.json({ error: "userId, type, title required" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("notifications").insert({ user_id:userId, type, title, message, link, read:false })
      .select().single();
    if (error) throw error;
    return NextResponse.json({ notification: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, id } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const q = id
      ? supabaseAdmin.from("notifications").update({ read:true }).eq("id",id).eq("user_id",userId)
      : supabaseAdmin.from("notifications").update({ read:true }).eq("user_id",userId);
    const { error } = await q;
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
