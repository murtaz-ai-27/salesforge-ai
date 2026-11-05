import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const SEC = { "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" };

// GET /api/profile?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400, headers: SEC });

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500, headers: SEC });
    }

    return NextResponse.json({ profile: data ?? null }, { headers: SEC });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: SEC });
  }
}

// POST /api/profile — upsert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, displayName, company, role, timezone, avatar_url } = body;

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400, headers: SEC });

    const payload: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    if (displayName !== undefined) payload.display_name = displayName;
    if (company    !== undefined) payload.company      = company;
    if (role       !== undefined) payload.role         = role;
    if (timezone   !== undefined) payload.timezone     = timezone;
    if (avatar_url !== undefined) payload.avatar_url   = avatar_url;

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: SEC });

    return NextResponse.json({ profile: data }, { headers: SEC });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: SEC });
  }
}
