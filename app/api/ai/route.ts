import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const PLAN_LIMITS: Record<string, number> = {
  free: 5, starter: 50, pro: -1, enterprise: -1
};

const SYSTEM_PROMPTS: Record<string, string> = {
  emailWriter: `You are Jordan, an elite B2B sales copywriter. Your cold emails achieve 35-45% reply rates.

RULES:
1. Write ONLY the email body. Zero preamble.
2. Hard limit: 120 words.
3. Line 1: ONE hyper-specific observation about the prospect.
4. Lines 2-3: The pain point they are hitting RIGHT NOW.
5. Line 4: ONE proof point with a real number and timeframe.
6. Final line: Soft CTA.
7. Use {{firstName}} once at the start.

BANNED: "I hope this finds you well" / "touching base" / "circling back" / "synergies" / "game-changing" / "leverage" / "utilize"

OUTPUT: Just the email body. Nothing else.`,

  subjectLine: `You are a subject line expert. Write EXACTLY 3 subject line options. Numbered list only.
Rules: Under 7 words each. No exclamation marks. No emojis. No ALL CAPS.
Option 1: Company + specific situation. Option 2: Pain/result only. Option 3: Pattern interrupt.`,

  objectionHandler: `You are Marcus, a 50M+ career sales professional. Give 3 responses to the objection.
Each response under 75 words. Different psychological angle each time.
Framework: 1) Acknowledge 2) Reframe with data 3) Open question.
Never argue. Never say "Great point!" Return only the 3 responses.`,

  prospectAnalyzer: `You are a Revenue Intelligence AI. Score this prospect and return ONLY this JSON with no markdown and no backticks:
{"score":87,"buyingIntent":"high","bestChannel":"email","personalizationHooks":["hook1","hook2","hook3"],"recommendedTiming":"immediate","reasoning":"2-3 sentences","redFlags":"any concerns","estimatedDealValue":"$X,XXX"}

Scoring: 90-100=Perfect ICP. 75-89=Strong fit. 60-74=Decent. 40-59=Partial. Below 40=Poor fit.`,

  dealAnalyzer: `You are a Revenue Operations expert. Analyze this deal and use EXACTLY this format:

**DEAL HEALTH: X/100** — [verdict]

**WHAT IS WORKING**
• [signal]
• [signal]

**RISK FACTORS**
• RED [critical risk] — [how to fix]
• YELLOW [moderate risk] — [mitigation]
• GREEN [minor risk] — [watch for]

**THE REAL PROBLEM**
[2-3 honest sentences]

**NEXT 3 ACTIONS**
1. [exact action] — Due: [timeframe]
2. [action] — Due: [timeframe]
3. [action] — Due: [timeframe]

**WIN PROBABILITY: X%**
[one sentence]`,

  meetingSummarizer: `You are a Revenue Operations specialist. Format EXACTLY like this:

MEETING INTEL
Prospect: [Name, Title, Company]

SITUATION
[2-3 sentences]

PAIN POINTS
• [pain with business impact]
• [pain]

BUYING SIGNALS
• [signal]

OBJECTIONS
• [objection] — [how addressed]

ACTION ITEMS
• [action] — Owner: [name] — Due: [date]

DEAL ASSESSMENT
Sentiment: [Positive/Neutral/Negative]
Close Probability: [X%]
Estimated Close: [Quarter]`,

  cold_caller: `You are a cold call coach. Write a complete cold call script with:
OPENER (8 seconds), BRIDGE (10 seconds), VALUE PROP (15 seconds), DISCOVERY QUESTION,
OBJECTION SCRIPTS for: Not interested / Send email / Have competitor / No budget / Call later,
CLOSE with two time options. Under 250 words total.`,

  linkedin_writer: `You are a LinkedIn outreach specialist. Write TWO things:
1. CONNECTION REQUEST (max 280 characters) - peer-to-peer tone, reference their specific post or activity.
2. FOLLOW-UP MESSAGE (100-150 words) - after acceptance, one insight, one ask.
Label each section clearly. Show character count after connection request.`,

  proposal_writer: `You are a Senior Enterprise AE. Write a proposal with these sections:
WHAT WE DISCUSSED, COST OF TODAY (time + opportunity + risk = total annual cost),
WHAT WE PROPOSE, WHAT CHANGES (metrics before and after), INVESTMENT (price + ROI + payback),
IMPLEMENTATION (weekly milestones), YOUR NEXT STEP.
Use their exact words. Make it 100% about the client.`,

  competitor_intel: `You are a Competitive Intelligence Strategist. Create a battle card with:
CORE WEAKNESS, HOW TO SURFACE IT (question + what to listen for + your response),
HEAD-TO-HEAD (their claim vs reality vs your proof - 4 rows),
DISPLACEMENT STRATEGY, TRAP QUESTIONS (3 questions),
CONTRACT OBJECTION SCRIPT, ONE-LINE CLOSER.`,

  revenue_forecaster: `You are a CRO. Create a board-ready forecast with:
PIPELINE SNAPSHOT (total, weighted, commit, best case),
FORECAST (conservative, base, upside, quota, gap),
TOP 3 DEALS TO CLOSE (company, value, why, confidence%, close date),
AT-RISK DEALS (company, risk, action),
LEADING INDICATORS (2-3),
3 ACTIONS TO HIT QUOTA,
THE CALL (one sentence calling the number).`,

  csvAnalyzer: `You are a B2B sales data expert. Extract prospect info from this CSV data.
Return ONLY a JSON array with no markdown and no backticks:
[{"name":"Full Name","email":"email","company":"Company","title":"Job Title","linkedin_url":"url or empty","score":75,"intent":"high|medium|low","notes":"one sentence why interesting"}]
Scoring: VP/C-Suite + SaaS/Tech = 85-98. Director + mid-market = 70-84. Manager + SMB = 50-69. Other = 30-49.`,

  subjectLineAlt: `Write 3 cold email subject lines under 7 words each. Numbered list. No punctuation at end. No emojis.`,
};

// Groq models - fast
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
];

// OpenRouter models - fallback
const OR_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-r1:free",
  "google/gemma-3-27b-it:free",
];

function isCleanText(text: string): boolean {
  if (!text || text.length < 20) return false;
  let nonAscii = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 127 && code < 8000) nonAscii++;
  }
  return nonAscii / text.length < 0.15;
}

async function callGroq(system: string, prompt: string, key: string): Promise<{ result: string; model: string } | null> {
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.72,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (!isCleanText(text)) continue;
      return { result: text, model: `groq/${model}` };
    } catch {
      continue;
    }
  }
  return null;
}

async function callOpenRouter(system: string, prompt: string, key: string): Promise<{ result: string; model: string } | null> {
  for (const model of OR_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://salevrix-ai-black.vercel.app",
          "X-Title": "Salevrix AI",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.72,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (!isCleanText(text)) continue;
      return { result: text, model: `openrouter/${model}` };
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, type, system: customSystem, userId } = body;

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY ?? "";
    const orKey = process.env.OPENROUTER_API_KEY ?? "";

    if (!groqKey && !orKey) {
      return NextResponse.json({ error: "No AI API keys configured" }, { status: 500 });
    }

    // Plan limit check
    if (userId) {
      try {
        const { data: planData } = await supabaseAdmin
          .from("user_plans")
          .select("plan")
          .eq("user_id", userId)
          .single();
        const plan: string = planData?.plan ?? "free";
        const limit: number = PLAN_LIMITS[plan] ?? 5;
        if (limit !== -1) {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const { count } = await supabaseAdmin
            .from("agent_runs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", startOfDay.toISOString());
          if ((count ?? 0) >= limit) {
            return NextResponse.json({
              error: `Daily AI limit reached (${count}/${limit}). Upgrade at /dashboard/pricing`,
              upgrade: true,
              currentPlan: plan,
              used: count,
              limit,
            }, { status: 429 });
          }
        }
      } catch {
        // continue even if plan check fails
      }
    }

    const systemPrompt: string = customSystem || SYSTEM_PROMPTS[type as string] || SYSTEM_PROMPTS.emailWriter;

    // Try Groq first (fast), then OpenRouter (fallback)
    let aiResult: { result: string; model: string } | null = null;

    if (groqKey) {
      aiResult = await callGroq(systemPrompt, prompt, groqKey);
    }

    if (!aiResult && orKey) {
      aiResult = await callOpenRouter(systemPrompt, prompt, orKey);
    }

    if (!aiResult) {
      return NextResponse.json(
        { error: "AI is temporarily unavailable. Please try again in a moment." },
        { status: 500 }
      );
    }

    // Log to Supabase
    if (userId) {
      try {
        await supabaseAdmin.from("agent_runs").insert({
          user_id: userId,
          agent_type: type ?? "general",
          prompt: prompt.slice(0, 500),
          output: aiResult.result.slice(0, 2000),
        });
      } catch {
        // non-critical
      }
    }

    return NextResponse.json({ result: aiResult.result, model: aiResult.model });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
