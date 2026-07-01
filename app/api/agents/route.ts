import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// GET /api/agents?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("agents")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    // If user has no agents yet, create default 5 agents
    if (!data || data.length === 0) {
      const defaults = [
        { user_id: userId, name: "SDR Agent Alpha", type: "sdr", status: "active" },
        { user_id: userId, name: "Email Coach", type: "email_coach", status: "active" },
        { user_id: userId, name: "Deal Analyzer", type: "deal_analyzer", status: "active" },
        { user_id: userId, name: "Objection Handler", type: "objection_handler", status: "active" },
        { user_id: userId, name: "Meeting Summarizer", type: "meeting_summarizer", status: "paused" },
      ];
      const { data: created, error: createErr } = await supabaseAdmin
        .from("agents")
        .insert(defaults)
        .select();
      if (createErr) throw createErr;
      return NextResponse.json({ agents: created });
    }

    return NextResponse.json({ agents: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/agents — toggle status, update stats
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("agents")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ agent: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
