import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// GET /api/prospects?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .select("*")
      .eq("user_id", userId)
      .order("ai_score", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ prospects: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/prospects — create new prospect
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...prospectData } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .insert({ user_id: userId, ...prospectData })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ prospect: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/prospects — update prospect (status, notes, etc)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ prospect: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/prospects?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("prospects").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
