import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// ── Security headers for all responses
const secHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

// ── Input validation
function validateUserId(userId: string | null): boolean {
  return !!userId && userId.length > 5 && userId.length < 200;
}

function sanitizeText(text: unknown): string {
  if (typeof text !== "string") return "";
  return text.trim().slice(0, 2000).replace(/<[^>]*>/g, ""); // strip HTML
}

// GET /api/prospects?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!validateUserId(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400, headers: secHeaders });
    }

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .select("*")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false })
      .limit(1000); // prevent massive data loads

    if (error) throw error;
    return NextResponse.json({ prospects: data ?? [] }, { headers: secHeaders });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: secHeaders });
  }
}

// POST /api/prospects
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...raw } = body;

    if (!validateUserId(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400, headers: secHeaders });
    }

    // Validate required fields
    if (!raw.name || typeof raw.name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400, headers: secHeaders });
    }
    if (!raw.email || typeof raw.email !== "string" || !raw.email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400, headers: secHeaders });
    }

    // Sanitize all string fields
    const prospectData = {
      user_id: userId,
      name: sanitizeText(raw.name),
      email: sanitizeText(raw.email).toLowerCase(),
      company: sanitizeText(raw.company),
      title: sanitizeText(raw.title),
      role: sanitizeText(raw.role),
      industry: sanitizeText(raw.industry),
      company_size: sanitizeText(raw.company_size),
      linkedin_url: sanitizeText(raw.linkedin_url),
      notes: sanitizeText(raw.notes),
      status: raw.status ?? "new",
      ai_score: typeof raw.ai_score === "number" ? Math.min(100, Math.max(0, raw.ai_score)) : 50,
      buying_intent: ["high","medium","low","pending"].includes(raw.buying_intent) ? raw.buying_intent : "medium",
      avatar_init: sanitizeText(raw.avatar_init).slice(0, 2),
      avatar_bg: sanitizeText(raw.avatar_bg),
      avatar_color: sanitizeText(raw.avatar_color),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .insert(prospectData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ prospect: data }, { status: 201, headers: secHeaders });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: secHeaders });
  }
}

// PATCH /api/prospects
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, ...raw } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id required" }, { status: 400, headers: secHeaders });
    }

    // Verify ownership before update
    if (userId) {
      const { data: existing } = await supabaseAdmin
        .from("prospects").select("user_id").eq("id", id).single();
      if (existing && existing.user_id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403, headers: secHeaders });
      }
    }

    // Sanitize updates
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (raw.name) updates.name = sanitizeText(raw.name);
    if (raw.email) updates.email = sanitizeText(raw.email).toLowerCase();
    if (raw.company !== undefined) updates.company = sanitizeText(raw.company);
    if (raw.notes !== undefined) updates.notes = sanitizeText(raw.notes);
    if (raw.status) updates.status = raw.status;
    if (typeof raw.ai_score === "number") updates.ai_score = Math.min(100, Math.max(0, raw.ai_score));
    if (raw.buying_intent) updates.buying_intent = raw.buying_intent;
    if (raw.sequence_id !== undefined) updates.sequence_id = raw.sequence_id;

    const { data, error } = await supabaseAdmin
      .from("prospects").update(updates).eq("id", id).select().single();

    if (error) throw error;
    return NextResponse.json({ prospect: data }, { headers: secHeaders });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: secHeaders });
  }
}

// DELETE /api/prospects?id=xxx&userId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const userId = req.nextUrl.searchParams.get("userId");

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400, headers: secHeaders });

    // Verify ownership
    if (userId) {
      const { data: existing } = await supabaseAdmin
        .from("prospects").select("user_id").eq("id", id).single();
      if (existing && existing.user_id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403, headers: secHeaders });
      }
    }

    const { error } = await supabaseAdmin.from("prospects").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: secHeaders });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: secHeaders });
  }
}
