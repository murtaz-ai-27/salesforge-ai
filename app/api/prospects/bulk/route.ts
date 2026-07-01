import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// POST /api/prospects/bulk — bulk insert for CSV import
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, prospects } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (!Array.isArray(prospects) || prospects.length === 0) {
      return NextResponse.json({ error: "prospects array required" }, { status: 400 });
    }

    const rows = prospects.map((p: any) => ({ user_id: userId, ...p }));

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .insert(rows)
      .select();

    if (error) throw error;
    return NextResponse.json({ prospects: data, count: data.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
