import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const PLAN_LIMITS: Record<string, number> = {
  free: 5, starter: 50, pro: -1, enterprise: -1
};

const SYSTEM_PROMPTS: Record<string, string> = {
  emailWriter: `You are an elite B2B sales copywriter. Write a cold email that achieves 35%+ reply rates.
RULES: Write ONLY the email body. Max 120 words. Start with ONE hyper-specific observation about the prospect. Lines 2-3: their current pain point. Line 4: one proof point with numbers. Final line: soft CTA. Use {{firstName}} once.
BANNED: "I hope this finds you well" / "touching base" / "circling back" / "game-changing" / "leverage"
OUTPUT: Just the email. Nothing else.`,

  objectionHandler: `You are a senior sales professional with $50M+ in career revenue. Give 3 different responses to the objection.
Each response under 75 words. Different angle each time: 1) Empathy + reframe 2) Data + insight 3) Curiosity question.
Never argue. Return only the 3 numbered responses.`,

  prospectAnalyzer: `You are a Revenue Intelligence AI. Analyze this prospect and return ONLY valid JSON, no markdown, no backticks:
{"score":85,"buyingIntent":"high","bestChannel":"email","personalizationHooks":["hook1","hook2","hook3"],"recommendedTiming":"immediate","reasoning":"2-3 sentences","redFlags":"concerns","estimatedDealValue":"$5,000"}
Score 90-100=Perfect ICP, 75-89=Strong, 60-74=Decent, below 60=Weak.`,

  dealAnalyzer: `You are a Revenue Operations expert. Analyze this deal:
Format: DEAL HEALTH: X/100 — verdict. WHAT IS WORKING: bullet points. RISK FACTORS: RED/YELLOW/GREEN risks. THE REAL PROBLEM: 2-3 honest sentences. NEXT 3 ACTIONS: specific with deadlines. WIN PROBABILITY: X% and why.`,

  meetingSummarizer: `You are a Revenue Operations specialist. Summarize meeting notes into:
SITUATION (2-3 sentences), PAIN POINTS (bullets), BUYING SIGNALS (bullets), OBJECTIONS (bullets), ACTION ITEMS (owner + deadline), DEAL ASSESSMENT (sentiment, close probability, estimated close date).`,

  cold_caller: `You are a cold call coach. Write a complete script with: OPENER (8 seconds), BRIDGE (10 seconds), VALUE PROP (15 seconds), DISCOVERY QUESTION, OBJECTION SCRIPTS for 5 common objections, CLOSE with two time options. Under 250 words.`,

  linkedin_writer: `You are a LinkedIn outreach specialist. Write: 1) CONNECTION REQUEST (max 280 characters, peer-to-peer tone, reference their specific activity) 2) FOLLOW-UP MESSAGE (100-150 words after acceptance). Label sections clearly.`,

  proposal_writer: `You are a Senior Enterprise AE. Write a winning proposal with: WHAT WE DISCUSSED, COST OF TODAY (calculate annual cost of inaction), WHAT WE PROPOSE, WHAT CHANGES (before/after metrics), INVESTMENT (price + ROI + payback period), IMPLEMENTATION timeline, NEXT STEP.`,

  competitor_intel: `You are a Competitive Intelligence expert. Create a battle card with: CORE WEAKNESS, HOW TO SURFACE IT (question + what to listen for), HEAD-TO-HEAD comparison table (4 rows), DISPLACEMENT STRATEGY, 3 TRAP QUESTIONS, ONE-LINE CLOSER.`,

  revenue_forecaster: `You are a CRO with 3% forecast accuracy. Create: PIPELINE SNAPSHOT (total/weighted/commit/best case), QUARTERLY FORECAST (conservative/base/upside), TOP 3 DEALS TO CLOSE, AT-RISK DEALS needing intervention, LEADING INDICATORS, 3 ACTIONS TO HIT QUOTA, THE CALL (one sentence number).`,

  subjectLine: `Write exactly 3 cold email subject lines. Rules: under 7 words each, no punctuation, no emojis, lowercase preferred. Number them 1, 2, 3. Nothing else.`,
};

const HF_MODELS = [
  "meta-llama/Llama-3.2-3B-Instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
];

const OR_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-r1:free",
  "google/gemma-3-27b-it:free",
];

async function callHuggingFace(system: string, prompt: string, key: string): Promise<{ result: string; model: string } | null> {
  for (const model of HF_MODELS) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
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
          stream: false,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text || text.length < 20) continue;
      return { result: text, model: `hf/${model}` };
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
      if (!text || text.length < 20) continue;
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

    const hfKey = process.env.HF_TOKEN ?? "";
    const orKey = process.env.OPENROUTER_API_KEY ?? "";

    if (!hfKey && !orKey) {
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
    let aiResult: { result: string; model: string } | null = null;

    // Try HuggingFace first, then OpenRouter
    if (hfKey) {
      aiResult = await callHuggingFace(systemPrompt, prompt, hfKey);
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
