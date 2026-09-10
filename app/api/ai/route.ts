import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// ════════════════════════════════════════════════════════
// PLAN LIMITS — Same as ChatGPT/Claude model
// ════════════════════════════════════════════════════════
const PLAN_LIMITS: Record<string, {
  daily: number;        // AI runs per day
  perMinute: number;    // Requests per minute (rate limit)
  maxTokens: number;    // Max output tokens
}> = {
  free:       { daily: 5,         perMinute: 2,  maxTokens: 800  },
  starter:    { daily: 50,        perMinute: 5,  maxTokens: 1200 },
  pro:        { daily: 999999,    perMinute: 20, maxTokens: 2000 },
  enterprise: { daily: 999999,    perMinute: 50, maxTokens: 2000 },
};

// ════════════════════════════════════════════════════════
// GLOBAL RATE LIMITER — Prevents API bill explosion
// In-memory store (resets on cold start — fine for protection)
// ════════════════════════════════════════════════════════
const globalRequestCount = new Map<string, { count: number; resetAt: number }>();
const GLOBAL_LIMIT_PER_MINUTE = 100; // Max 100 total AI requests per minute globally

function checkGlobalLimit(): boolean {
  const now = Date.now();
  const key = 'global';
  const entry = globalRequestCount.get(key);

  if (!entry || now > entry.resetAt) {
    globalRequestCount.set(key, { count: 1, resetAt: now + 60000 });
    return true; // OK
  }

  if (entry.count >= GLOBAL_LIMIT_PER_MINUTE) {
    return false; // BLOCKED
  }

  entry.count++;
  return true; // OK
}

// Per-user per-minute rate limiter
const userRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkUserRateLimit(userId: string, limit: number): boolean {
  const now = Date.now();
  const entry = userRateLimit.get(userId);

  if (!entry || now > entry.resetAt) {
    userRateLimit.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ════════════════════════════════════════════════════════
const SYSTEM_PROMPTS: Record<string, string> = {
  emailWriter: `You are Jordan, an elite B2B sales copywriter. Your cold emails achieve 35-45% reply rates.

ABSOLUTE RULES:
1. Write ONLY the email body. Zero preamble.
2. Hard limit: 120 words.
3. Line 1: ONE hyper-specific observation about the prospect.
4. Lines 2-3: Their specific pain point RIGHT NOW.
5. Line 4: ONE proof point with a real number and timeframe.
6. Final line: Soft CTA.
7. Use {{firstName}} once at the start.
BANNED: "I hope this finds you well" / "touching base" / "circling back" / "game-changing" / "leverage"
OUTPUT: Just the email body. Nothing else.`,

  objectionHandler: `You are Marcus, a $50M+ career sales professional. Give EXACTLY 3 numbered responses to the objection.
Each under 75 words. Different psychological angle each time.
Never say "Great point!" Never argue. Return only the 3 responses.`,

  prospectAnalyzer: `You are a Revenue Intelligence AI. Return ONLY valid JSON, no markdown, no backticks:
{"score":85,"buyingIntent":"high","bestChannel":"email","personalizationHooks":["hook1","hook2","hook3"],"recommendedTiming":"immediate","reasoning":"2-3 sentences","redFlags":"concerns","estimatedDealValue":"$5,000"}`,

  dealAnalyzer: `You are a Revenue Operations expert. Use EXACTLY this format:

**DEAL HEALTH: X/100** — [verdict]

**WHAT IS WORKING**
• [signal]

**RISK FACTORS**
• 🔴 [Critical] — [fix]
• 🟡 [Moderate] — [mitigation]
• 🟢 [Minor] — [watch]

**THE REAL PROBLEM**
[2-3 honest sentences]

**NEXT 3 ACTIONS**
1. [exact action] — Due: [timeframe]
2. [action] — Due: [timeframe]
3. [action] — Due: [timeframe]

**WIN PROBABILITY: X%**`,

  meetingSummarizer: `You are a Revenue Operations specialist. Format EXACTLY:

MEETING INTEL
Prospect: [Name, Title, Company]

SITUATION: [2-3 sentences]

PAIN POINTS:
• [pain with impact]

BUYING SIGNALS:
• [signal]

ACTION ITEMS:
• [action] — Owner: [name] — Due: [date]

DEAL ASSESSMENT
Sentiment: [Positive/Neutral/Negative]
Close Probability: [X%]
Estimated Close: [Quarter]`,

  cold_caller: `Write a complete cold call script: OPENER (8 sec), BRIDGE (10 sec), VALUE PROP (15 sec), DISCOVERY QUESTION, OBJECTION SCRIPTS for 5 objections, CLOSE with two time options. Under 250 words.`,

  linkedin_writer: `You are a LinkedIn outreach specialist. Output ONLY the final messages.

**CONNECTION REQUEST** (X characters)
[Under 280 chars, peer-to-peer, references their specific post]

**FOLLOW-UP MESSAGE** (X words)
[100-150 words, one insight, one ask]`,

  proposal_writer: `Write a proposal with: WHAT WE DISCUSSED (their words), COST OF TODAY (calculate annual cost of inaction), WHAT WE PROPOSE, WHAT CHANGES (before/after metrics), INVESTMENT (price + ROI + payback), IMPLEMENTATION timeline, NEXT STEP.`,

  competitor_intel: `Create a battle card: CORE WEAKNESS, HOW TO SURFACE IT (question + listen for + response), HEAD-TO-HEAD (4 rows), DISPLACEMENT STRATEGY, 3 TRAP QUESTIONS, ONE-LINE CLOSER.`,

  revenue_forecaster: `Create a board-ready forecast: PIPELINE SNAPSHOT, FORECAST (conservative/base/upside), TOP 3 TO CLOSE, AT-RISK DEALS, LEADING INDICATORS, 3 ACTIONS TO HIT QUOTA, THE CALL (one sentence number).`,

  sequenceBuilder: `Write a COMPLETE 5-touch email sequence. Each touch: Day number, Subject line, Full email body (80-120 words).
TOUCH 1 (Day 1): Personalized cold email
TOUCH 2 (Day 3): Different angle, shorter
TOUCH 3 (Day 7): Value add - insight or resource
TOUCH 4 (Day 10): LinkedIn connection request text
TOUCH 5 (Day 14): Breakup email
Write ALL 5 complete touches.`,

  subjectLine: `Write EXACTLY 3 subject lines. Numbered list only. Under 7 words each. No punctuation. No emojis. Lowercase preferred.`,
};

const MODELS = [
  "google/gemma-4-31b-it:free",
  "z-ai/glm-5.2:free",
  "liquid/lfm-2.5-2.6b:free",
];

// ════════════════════════════════════════════════════════
// MAIN HANDLER
// ════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, type, system: customSystem, userId } = body;

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY ?? "";
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // ── GLOBAL RATE LIMIT (protect against bill explosion) ──
    if (!checkGlobalLimit()) {
      return NextResponse.json({
        error: "Platform is experiencing high traffic. Please try again in a moment.",
        retryAfter: 60,
      }, { status: 429 });
    }

    // ── USER PLAN + LIMITS ──
    let userPlan = "free";
    let planLimits = PLAN_LIMITS.free;

    if (userId) {
      try {
        const { data: planData } = await supabaseAdmin
          .from("user_plans")
          .select("plan")
          .eq("user_id", userId)
          .single();

        userPlan = planData?.plan ?? "free";
        planLimits = PLAN_LIMITS[userPlan] ?? PLAN_LIMITS.free;
      } catch {
        // Default to free limits
      }

      // ── PER-USER RATE LIMIT (per minute) ──
      if (!checkUserRateLimit(userId, planLimits.perMinute)) {
        return NextResponse.json({
          error: `Rate limit: max ${planLimits.perMinute} requests/minute on ${userPlan} plan. Upgrade for higher limits.`,
          rateLimited: true,
          plan: userPlan,
          perMinuteLimit: planLimits.perMinute,
        }, { status: 429 });
      }

      // ── DAILY LIMIT CHECK ──
      if (planLimits.daily !== 999999) {
        try {
          // 24-hour ROLLING window (like ChatGPT/Claude)
          const rollingStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const { count, data: lastRun } = await supabaseAdmin
            .from("agent_runs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", rollingStart.toISOString());

          const used = count ?? 0;
          if (used >= planLimits.daily) {
            // Find when first run in window was — that's when limit resets
            const { data: firstRun } = await supabaseAdmin
              .from("agent_runs")
              .select("created_at")
              .eq("user_id", userId)
              .gte("created_at", rollingStart.toISOString())
              .order("created_at", { ascending: true })
              .limit(1);

            const resetAt = firstRun?.[0]?.created_at
              ? new Date(new Date(firstRun[0].created_at).getTime() + 24 * 60 * 60 * 1000)
              : new Date(Date.now() + 60 * 60 * 1000);

            const hoursLeft = Math.ceil((resetAt.getTime() - Date.now()) / 3600000);
            const minsLeft = Math.ceil((resetAt.getTime() - Date.now()) / 60000);

            return NextResponse.json({
              error: `Daily limit reached (${used}/${planLimits.daily} runs). Resets in ${hoursLeft > 1 ? hoursLeft + ' hours' : minsLeft + ' minutes'}.`,
              upgrade: true,
              currentPlan: userPlan,
              used,
              limit: planLimits.daily,
              usagePercent: Math.round((used / planLimits.daily) * 100),
              resetsAt: resetAt.toISOString(),
              resetsIn: hoursLeft > 1 ? `${hoursLeft} hours` : `${minsLeft} minutes`,
            }, { status: 429 });
          }
        } catch {
          // Continue even if count fails
        }
      }
    }

    // ── AI CALL ──
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
        });

        if (!res.ok) { lastError = `${model}: ${res.status}`; continue; }
        const data = await res.json();
        const text: string = data.choices?.[0]?.message?.content?.trim() ?? "";
        if (!text || text.length < 20) { lastError = `${model}: empty`; continue; }
        result = text;
        usedModel = model;
        break;
      } catch (err: unknown) {
        lastError = `${model}: ${err instanceof Error ? err.message : "unknown"}`;
        continue;
      }
    }

    if (!result) {
      return NextResponse.json({ error: `AI unavailable. ${lastError}` }, { status: 500 });
    }

    // ── LOG TO SUPABASE ──
    if (userId) {
      try {
        await supabaseAdmin.from("agent_runs").insert({
          user_id: userId,
          agent_type: type ?? "general",
          prompt: prompt.slice(0, 500),
          output: result.slice(0, 2000),
        });
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ result, model: usedModel, plan: userPlan });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ════════════════════════════════════════════════════════
// USAGE ENDPOINT — GET /api/ai?userId=xxx
// Returns real-time usage for dashboard display
// ════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data: planData } = await supabaseAdmin
      .from("user_plans").select("plan").eq("user_id", userId).single();

    const userPlan = planData?.plan ?? "free";
    const planLimits = PLAN_LIMITS[userPlan] ?? PLAN_LIMITS.free;

    // 24-hour rolling window
    const rollingStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { count } = await supabaseAdmin
      .from("agent_runs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", rollingStart.toISOString());

    const used = count ?? 0;
    const limit = planLimits.daily;
    const remaining = limit === 999999 ? 999999 : Math.max(0, limit - used);
    const usagePercent = limit === 999999 ? 0 : Math.round((used / limit) * 100);

    // Find when limit resets (when oldest run in window expires)
    let resetsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    if (used > 0 && used >= limit && limit !== 999999) {
      const { data: firstRun } = await supabaseAdmin
        .from("agent_runs")
        .select("created_at")
        .eq("user_id", userId)
        .gte("created_at", rollingStart.toISOString())
        .order("created_at", { ascending: true })
        .limit(1);
      if (firstRun?.[0]?.created_at) {
        resetsAt = new Date(new Date(firstRun[0].created_at).getTime() + 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const msLeft = new Date(resetsAt).getTime() - Date.now();
    const hoursLeft = Math.floor(msLeft / 3600000);
    const minsLeft = Math.floor((msLeft % 3600000) / 60000);

    return NextResponse.json({
      plan: userPlan,
      used,
      limit: limit === 999999 ? "Unlimited" : limit,
      remaining: remaining === 999999 ? "Unlimited" : remaining,
      usagePercent,
      perMinuteLimit: planLimits.perMinute,
      resetsAt,
      resetsIn: hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`,
    });

  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
