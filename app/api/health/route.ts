import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, string> = {};
  let allOk = true;

  // 1. Supabase check
  try {
    const { error } = await supabaseAdmin.from("user_plans").select("id").limit(1);
    checks.supabase = error ? `error: ${error.message}` : "ok";
    if (error) allOk = false;
  } catch {
    checks.supabase = "unreachable";
    allOk = false;
  }

  // 2. OpenRouter check
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      signal: AbortSignal.timeout(4000),
    });
    checks.openrouter = res.ok ? "ok" : `error: ${res.status}`;
    if (!res.ok) allOk = false;
  } catch {
    checks.openrouter = "unreachable";
    allOk = false;
  }

  // 3. Env vars
  const missing = ["NEXT_PUBLIC_SUPABASE_URL","OPENROUTER_API_KEY","NEXT_PUBLIC_FIREBASE_API_KEY"]
    .filter(k => !process.env[k]);
  checks.env = missing.length === 0 ? "ok" : `missing: ${missing.join(", ")}`;
  if (missing.length > 0) allOk = false;

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    responseTime: `${Date.now() - start}ms`,
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    checks,
  }, { status: allOk ? 200 : 503 });
}
