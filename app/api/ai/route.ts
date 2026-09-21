import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// ══════════════════════════════════════════
// PLAN LIMITS
// ══════════════════════════════════════════
const PLAN_LIMITS: Record<string, { daily: number; perMinute: number; maxTokens: number }> = {
  free:       { daily: 5,      perMinute: 2,  maxTokens: 800  },
  starter:    { daily: 50,     perMinute: 5,  maxTokens: 1200 },
  pro:        { daily: 999999, perMinute: 20, maxTokens: 2000 },
  enterprise: { daily: 999999, perMinute: 50, maxTokens: 2000 },
};

// ══════════════════════════════════════════
// IN-MEMORY RATE LIMITERS
// ══════════════════════════════════════════
const globalLimit  = new Map<string, { count: number; resetAt: number }>();
const userLimit    = new Map<string, { count: number; resetAt: number }>();
const GLOBAL_MAX   = 100; // per minute platform-wide

function checkGlobal(): boolean {
  const now = Date.now();
  const e = globalLimit.get("g");
  if (!e || now > e.resetAt) { globalLimit.set("g", { count: 1, resetAt: now + 60000 }); return true; }
  if (e.count >= GLOBAL_MAX) return false;
  e.count++; return true;
}

function checkUser(uid: string, limit: number): boolean {
  const now = Date.now();
  const e = userLimit.get(uid);
  if (!e || now > e.resetAt) { userLimit.set(uid, { count: 1, resetAt: now + 60000 }); return true; }
  if (e.count >= limit) return false;
  e.count++; return true;
}

// ══════════════════════════════════════════
// INPUT VALIDATION
// ══════════════════════════════════════════
function sanitizePrompt(prompt: unknown): string {
  if (typeof prompt !== "string") return "";
  // Strip potential prompt injection attempts
  return prompt
    .replace(/ignore (previous|all) instructions?/gi, "")
    .replace(/you are now/gi, "")
    .replace(/jailbreak/gi, "")
    .slice(0, 5000); // max prompt length
}

// ══════════════════════════════════════════
// SYSTEM PROMPTS
// ══════════════════════════════════════════
const SYSTEM_PROMPTS: Record<string, string> = {
  emailWriter: `You are Jordan, an elite B2B sales copywriter. 35-45% reply rates.
RULES: Write ONLY the email body. Under 120 words. Line 1: specific observation about prospect. Lines 2-3: their pain point. Line 4: proof point with number + timeframe. Final: soft CTA. Use {{firstName}} once.
BANNED: "hope this finds you well" / "touching base" / "circling back" / "game-changing"
OUTPUT: Email body only. Nothing else.`,

  prospectAnalyzer: `You are a Revenue Intelligence AI. Return ONLY valid JSON — no markdown, no backticks:
{"score":85,"buyingIntent":"high","bestChannel":"email","personalizationHooks":["hook1","hook2","hook3"],"recommendedTiming":"immediate","reasoning":"2-3 sentences","redFlags":"any concerns or none","estimatedDealValue":"$5,000"}`,

  dealAnalyzer: `You are a Revenue Operations expert. Use EXACTLY this format:
**DEAL HEALTH: X/100** — [one-line verdict]
**WHAT IS WORKING**
• [signal]
**RISK FACTORS**
• 🔴 [Critical risk] — [exact fix]
• 🟡 [Moderate risk] — [mitigation]
**THE REAL PROBLEM**
[2-3 honest sentences]
**NEXT 3 ACTIONS**
1. [exact action] — Due: [timeframe]
2. [action] — Due: [timeframe]
3. [action] — Due: [timeframe]
**WIN PROBABILITY: X%**`,

  objectionHandler: `You are Marcus, a $50M+ career sales professional. Give EXACTLY 3 numbered responses. Each under 75 words. Different psychological angle each. Never say "Great point!" Return only the 3 responses.`,

  meetingSummarizer: `You are a Revenue Operations specialist. Format EXACTLY:
MEETING INTEL
Prospect: [Name, Title, Company]
SITUATION: [2-3 sentences]
PAIN POINTS:
• [pain with business impact]
BUYING SIGNALS:
• [signal]
ACTION ITEMS:
• [action] — Owner: [name] — Due: [date]
DEAL ASSESSMENT
Sentiment: [Positive/Neutral/Negative]
Close Probability: [X%]`,

  cold_caller: `Write a complete cold call script: OPENER (8 sec), BRIDGE (10 sec), VALUE PROP (15 sec), DISCOVERY QUESTION, 5 OBJECTION SCRIPTS, TWO-OPTION CLOSE. Under 250 words total.`,

  linkedin_writer: `LinkedIn outreach specialist. Output ONLY final messages — no reasoning, no counting.
**CONNECTION REQUEST** (X characters)
[Under 280 chars, peer-to-peer, references their specific post/activity]
**FOLLOW-UP MESSAGE** (X words)
[100-150 words, one insight, one ask, no generic openers]`,

  proposal_writer: `Write a complete sales proposal: WHAT WE DISCUSSED (their exact words), COST OF TODAY (annual cost of inaction with math), WHAT WE PROPOSE, WHAT CHANGES (before/after metrics), INVESTMENT (price + ROI + payback period), IMPLEMENTATION (week-by-week), NEXT STEP (specific ask).`,

  competitor_intel: `Create a battle card: CORE WEAKNESS, HOW TO SURFACE IT (question → listen for → your response), HEAD-TO-HEAD (4-row comparison), DISPLACEMENT STRATEGY (5 steps), 3 TRAP QUESTIONS, ONE-LINE CLOSER.`,

  revenue_forecaster: `Board-ready forecast: PIPELINE SNAPSHOT (total/weighted/commit/best-case), Q FORECAST (conservative/base/upside vs quota), TOP 3 TO CLOSE (confidence + close date), AT-RISK DEALS (action required), 3 ACTIONS TO HIT QUOTA, THE CALL (one sentence number with confidence).`,

  sequenceBuilder: `Write a COMPLETE 5-touch sequence. For each touch: Day, Subject line, Full email body (80-120 words).
TOUCH 1 (Day 1): Personalized cold email
TOUCH 2 (Day 3): Different angle, shorter
TOUCH 3 (Day 7): Value add — insight or stat
TOUCH 4 (Day 10): LinkedIn connection request
TOUCH 5 (Day 14): Breakup email
Write ALL 5. No placeholders.`,

  subjectLine: `Write EXACTLY 3 subject lines. Numbered list only. Under 7 words each. No punctuation. No emojis. Lowercase preferred. Nothing else.`,
};

const MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3.5-lightning:free",
  "poolside/laguna-s-2.1:free",
  "z-ai/glm-5.2:free",
];

const SEC_HEADERS = { "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" };

// ══════════════════════════════════════════
// POST /api/ai
// ══════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt: rawPrompt, type, system: customSystem, userId } = body;

    // Validate
    if (!rawPrompt) return NextResponse.json({ error: "prompt required" }, { status: 400, headers: SEC_HEADERS });

    const prompt = sanitizePrompt(rawPrompt);
    if (prompt.length < 5) return NextResponse.json({ error: "prompt too short" }, { status: 400, headers: SEC_HEADERS });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 500, headers: SEC_HEADERS });

    // Global rate limit
    if (!checkGlobal()) {
      return NextResponse.json({ error: "Platform busy. Try again in a moment." }, { status: 429, headers: SEC_HEADERS });
    }

    // User plan + limits
    let userPlan = "free";
    let planLimits = PLAN_LIMITS.free;

    if (userId) {
      try {
        const { data } = await supabaseAdmin.from("user_plans").select("plan").eq("user_id", userId).single();
        userPlan = data?.plan ?? "free";
        planLimits = PLAN_LIMITS[userPlan] ?? PLAN_LIMITS.free;
      } catch { /* default to free */ }

      // Per-user per-minute limit
      if (!checkUser(userId, planLimits.perMinute)) {
        return NextResponse.json({
          error: `Slow down — max ${planLimits.perMinute} requests/minute on ${userPlan} plan.`,
          rateLimited: true,
        }, { status: 429, headers: SEC_HEADERS });
      }

      // Daily limit (rolling 24hr)
      if (planLimits.daily !== 999999) {
        try {
          const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count } = await supabaseAdmin
            .from("agent_runs").select("*", { count: "exact", head: true })
            .eq("user_id", userId).gte("created_at", since);

          const used = count ?? 0;
          if (used >= planLimits.daily) {
            // Find reset time
            const { data: first } = await supabaseAdmin
              .from("agent_runs").select("created_at")
              .eq("user_id", userId).gte("created_at", since)
              .order("created_at", { ascending: true }).limit(1);

            const resetAt = first?.[0]?.created_at
              ? new Date(new Date(first[0].created_at).getTime() + 24 * 60 * 60 * 1000)
              : new Date(Date.now() + 3600000);
            const hoursLeft = Math.ceil((resetAt.getTime() - Date.now()) / 3600000);

            return NextResponse.json({
              error: `Daily limit reached (${used}/${planLimits.daily}). Resets in ${hoursLeft} hours.`,
              upgrade: true, plan: userPlan, used, limit: planLimits.daily,
            }, { status: 429, headers: SEC_HEADERS });
          }
        } catch { /* continue */ }
      }
    }

    // AI call with model fallback
    const systemPrompt = customSystem || SYSTEM_PROMPTS[type as string] || SYSTEM_PROMPTS.emailWriter;
    let result = "";
    let usedModel = "";
    let lastError = "";

    for (const model of MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://salevrix-ai-black.vercel.app",
            "X-Title": "Salevrix AI",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            max_tokens: planLimits.maxTokens,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (!res.ok) { lastError = `${model}: ${res.status}`; continue; }

        const data = await res.json();
        const raw: string = data.choices?.[0]?.message?.content?.trim() ?? "";

        // Filter thinking/reasoning output
        const cleaned = raw
          .replace(/<think>[\s\S]*?<\/think>/gi, "")
          .replace(/^(The user wants|Let me|I need to|First,)[^\n]*\n/gim, "")
          .trim();

        if (!cleaned || cleaned.length < 15) { lastError = `${model}: empty`; continue; }
        result = cleaned;
        usedModel = model;
        break;
      } catch (err) {
        lastError = err instanceof Error ? `${model}: ${err.message}` : `${model}: failed`;
        continue;
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "AI temporarily unavailable. Please try again." },
        { status: 503, headers: SEC_HEADERS }
      );
    }

    // Log to Supabase
    if (userId) {
      try {
        await supabaseAdmin.from("agent_runs").insert({
          user_id: userId,
          agent_type: type ?? "general",
          prompt: prompt.slice(0, 500),
          output: result.slice(0, 2000),
          model: usedModel,
          created_at: new Date().toISOString(),
        });
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ result, plan: userPlan }, { headers: SEC_HEADERS });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: SEC_HEADERS });
  }
}

// ══════════════════════════════════════════
// GET /api/ai?userId=xxx — Real-time usage
// ══════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400, headers: SEC_HEADERS });

    const { data: planData } = await supabaseAdmin
      .from("user_plans").select("plan").eq("user_id", userId).single();
    const userPlan = planData?.plan ?? "free";
    const planLimits = PLAN_LIMITS[userPlan] ?? PLAN_LIMITS.free;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("agent_runs").select("*", { count: "exact", head: true })
      .eq("user_id", userId).gte("created_at", since);

    const used = count ?? 0;
    const limit = planLimits.daily;
    const unlimited = limit === 999999;
    const remaining = unlimited ? 999999 : Math.max(0, limit - used);
    const usagePercent = unlimited ? 0 : Math.round((used / limit) * 100);

    // Find reset time
    let resetsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    if (used > 0 && !unlimited) {
      const { data: first } = await supabaseAdmin
        .from("agent_runs").select("created_at")
        .eq("user_id", userId).gte("created_at", since)
        .order("created_at", { ascending: true }).limit(1);
      if (first?.[0]?.created_at) {
        resetsAt = new Date(new Date(first[0].created_at).getTime() + 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const msLeft = new Date(resetsAt).getTime() - Date.now();
    const h = Math.floor(msLeft / 3600000);
    const m = Math.floor((msLeft % 3600000) / 60000);

    return NextResponse.json({
      plan: userPlan,
      used,
      limit: unlimited ? "Unlimited" : limit,
      remaining: unlimited ? "Unlimited" : remaining,
      usagePercent,
      perMinuteLimit: planLimits.perMinute,
      resetsAt,
      resetsIn: h > 0 ? `${h}h ${m}m` : `${m}m`,
    }, { headers: SEC_HEADERS });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500, headers: SEC_HEADERS });
  }
}
