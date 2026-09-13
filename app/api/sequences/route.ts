import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// GET — fetch all sequences for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("sequences")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sequences: data ?? [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}

// POST — create new sequence
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, steps, status } = body;
    if (!userId || !name) return NextResponse.json({ error: "userId and name required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("sequences")
      .insert({
        user_id: userId,
        name,
        steps: steps ?? [],
        status: status ?? "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sequence: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}

// PATCH — update sequence
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, steps, name, status } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (steps !== undefined) updates.steps = steps;
    if (name !== undefined) updates.name = name;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabaseAdmin
      .from("sequences")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sequence: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}

// DELETE — delete sequence
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("sequences")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
