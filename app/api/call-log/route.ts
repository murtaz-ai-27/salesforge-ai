import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// POST — log a call attempt to Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, prospectId, prospectName, phone, status, notes } = body;

    if (!userId || !prospectId) {
      return NextResponse.json({ error: "userId and prospectId required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("call_logs")
      .insert({
        user_id:       userId,
        prospect_id:   prospectId,
        prospect_name: prospectName ?? null,
        phone:         phone        ?? null,
        status:        status       ?? "attempted",   // attempted | connected | no_answer | voicemail
        notes:         notes        ?? null,
        called_at:     new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, return a graceful error (don't crash the call flow)
      console.error("call_logs insert error:", error.message);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET — fetch call logs for a user (optionally filtered by prospectId)
export async function GET(req: NextRequest) {
  try {
    const userId     = req.nextUrl.searchParams.get("userId");
    const prospectId = req.nextUrl.searchParams.get("prospectId");

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    let query = supabaseAdmin
      .from("call_logs")
      .select("*")
      .eq("user_id", userId)
      .order("called_at", { ascending: false });

    if (prospectId) query = query.eq("prospect_id", prospectId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ logs: data ?? [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
