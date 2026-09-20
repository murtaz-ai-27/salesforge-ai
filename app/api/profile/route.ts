import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const secHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function sanitize(val: unknown, maxLen = 500): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen).replace(/<[^>]*>/g, "");
}

// GET /api/profile?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400, headers: secHeaders });

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return NextResponse.json({ profile: data ?? null }, { headers: secHeaders });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: secHeaders });
  }
}

// POST /api/profile — upsert profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400, headers: secHeaders });

    const updateData: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    // Sanitize every field
    if (body.name !== undefined) updateData.name = sanitize(body.name, 100);
    if (body.company !== undefined) updateData.company = sanitize(body.company, 200);
    if (body.role !== undefined) updateData.role = sanitize(body.role, 100);
    if (body.timezone !== undefined) updateData.timezone = sanitize(body.timezone, 100);
    if (body.phone !== undefined) updateData.phone = sanitize(body.phone, 20);
    if (body.linkedin !== undefined) updateData.linkedin = sanitize(body.linkedin, 300);
    if (body.notifications !== undefined) updateData.notifications = body.notifications;
    if (body.avatar_url !== undefined) updateData.avatar_url = sanitize(body.avatar_url, 500);

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data, message: "Saved!" }, { headers: secHeaders });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: secHeaders });
  }
}

// PUT /api/profile — avatar upload
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "file and userId required" }, { status: 400, headers: secHeaders });
    }

    // Security: validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF allowed" }, { status: 400, headers: secHeaders });
    }

    // Security: validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 2MB" }, { status: 400, headers: secHeaders });
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const path = `avatars/${userId}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabaseAdmin.from("user_profiles").upsert({
      user_id: userId,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return NextResponse.json({ avatar_url: publicUrl }, { headers: secHeaders });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: secHeaders });
  }
}
