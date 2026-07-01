import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// GET /api/sequences?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("sequences")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ sequences: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/sequences — create new sequence
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...seqData } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("sequences")
      .insert({ user_id: userId, ...seqData })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ sequence: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/sequences — update steps, status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("sequences")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ sequence: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/sequences?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("sequences").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
