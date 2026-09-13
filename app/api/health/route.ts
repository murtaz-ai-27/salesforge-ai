import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// GET /api/health — system health check
export async function GET() {
  const checks: Record<string, string> = {};
  let allOk = true;

  // 1. Supabase check
  try {
    const { error } = await supabaseAdmin.from("user_plans").select("id").limit(1);
    checks.supabase = error ? "error: " + error.message : "ok";
    if (error) allOk = false;
  } catch {
    checks.supabase = "unreachable";
    allOk = false;
  }

  // 2. OpenRouter check
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    checks.openrouter = res.ok ? "ok" : "error: " + res.status;
    if (!res.ok) allOk = false;
  } catch {
    checks.openrouter = "unreachable";
    allOk = false;
  }

  // 3. Env vars check
  const requiredEnvs = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "OPENROUTER_API_KEY",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
  ];
  const missingEnvs = requiredEnvs.filter(e => !process.env[e]);
  checks.env = missingEnvs.length === 0 ? "ok" : "missing: " + missingEnvs.join(", ");
  if (missingEnvs.length > 0) allOk = false;

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
    version: "2.0.0",
  }, { status: allOk ? 200 : 503 });
}
