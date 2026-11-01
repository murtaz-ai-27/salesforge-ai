import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// GET — fetch all prospects for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prospects: data ?? [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}

// POST — add a new prospect
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email, role, company, industry, company_size, notes, phone,
            ai_score, buying_intent, status, avatar_init, avatar_bg, avatar_color } = body;

    if (!userId || !name || !email) {
      return NextResponse.json({ error: "userId, name, and email are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .insert({
        user_id:      userId,
        name:         name.trim(),
        email:        email.trim().toLowerCase(),
        role:         role         ?? null,
        company:      company      ?? null,
        industry:     industry     ?? null,
        company_size: company_size ?? null,
        notes:        notes        ?? null,
        phone:        phone        ?? null,
        ai_score:     ai_score     ?? 50,
        buying_intent: buying_intent ?? "medium",
        status:       status        ?? "new",
        avatar_init:  avatar_init  ?? name.charAt(0).toUpperCase(),
        avatar_bg:    avatar_bg    ?? null,
        avatar_color: avatar_color ?? null,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prospect: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}

// PATCH — update a prospect (status, notes, any field)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Only allow known safe fields to be updated
    const allowed = ["name","email","role","company","industry","company_size",
                     "notes","phone","status","ai_score","buying_intent",
                     "avatar_init","avatar_bg","avatar_color","sequence_id"];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in rest) updates[key] = rest[key];
    }

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prospect: data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}

// DELETE — remove a prospect
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("prospects")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
