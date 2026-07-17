import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return NextResponse.json({ profile: data ?? null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, company, role, timezone, phone, linkedin, notifications, avatar_url } = body;

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Build update object
    const updateData: any = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (role !== undefined) updateData.role = role;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (phone !== undefined) updateData.phone = phone;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (notifications !== undefined) updateData.notifications = notifications;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data, message: "Saved!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Avatar upload endpoint
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) return NextResponse.json({ error: "file and userId required" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "File must be under 2MB" }, { status: 400 });

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `avatars/${userId}.${ext}`;
    const buffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;

    // Save to profile
    await supabaseAdmin.from("user_profiles").upsert({
      user_id: userId,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return NextResponse.json({ avatar_url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
