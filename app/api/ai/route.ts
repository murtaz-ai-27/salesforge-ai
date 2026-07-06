import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const PLAN_LIMITS = {
  free:       { agentRunsPerDay: 5  },
  starter:    { agentRunsPerDay: 50 },
  pro:        { agentRunsPerDay: -1 },
  enterprise: { agentRunsPerDay: -1 },
};

const SYSTEM_PROMPTS: Record<string, string> = {
  emailWriter: `You are an elite B2B cold email copywriter. Your emails get 40%+ reply rates.

RULES:
- Write ONLY the email body (no subject line, no "Here's the email:" preamble)
- Maximum 120 words
- Start with a specific, personalized observation about the prospect or their company
- One clear value proposition
- End with ONE soft call-to-action (15-minute call)
- Sound like a human, not a robot
- Never say "I hope this email finds you well"
- Use {{firstName}} placeholder for their first name

Write the email now:`,

  subjectLine: `You are a cold email subject line expert. You write subject lines that get 60%+ open rates.

RULES:
- Write exactly 3 subject line options
- Each under 7 words
- Create genuine curiosity, not clickbait
- Reference something specific about the prospect
- Format: just 3 numbered lines, nothing else

Write 3 subject lines now:`,

  iceBreaker: `You are a B2B sales personalization expert.
Write a 1-2 sentence personalized ice breaker based on the prospect info.
Reference something SPECIFIC: recent news, LinkedIn post, company milestone, job change.
Sound natural and researched. Return ONLY the ice breaker.`,

  objectionHandler: `You are a world-class B2B sales coach.
Handle the objection: 1) Acknowledge genuinely (1 sentence) 2) Reframe with counter-point (2 sentences) 3) End with open question (1 sentence).
Total under 80 words. Return ONLY the response.`,

  prospectAnalyzer: `You are an ICP analyst. Analyze the prospect and return ONLY valid JSON (no markdown, no backticks):
{"score":85,"buyingIntent":"high","bestChannel":"email","personalizationHooks":["hook1","hook2","hook3"],"recommendedTiming":"immediate","reasoning":"explanation"}
score=0-100, buyingIntent=high/medium/low, bestChannel=email/linkedin/phone`,

  dealAnalyzer: `You are a B2B deal intelligence expert. Analyze the deal and provide:
**Deal Health Score:** X/100
**Top 3 Risk Factors:** bullet points
**Recommended Next Actions:** numbered list
**Win Probability:** X%
**Why:** 2-3 sentence reasoning. Be specific.`,

  meetingSummarizer: `You are a sales meeting summarizer. Format as:
**KEY POINTS:** bullet points
**ACTION ITEMS:** [ ] item (Owner, Due date)
**NEXT STEPS:** bullet points
**DEAL SENTIMENT:** Positive/Neutral/Negative — reason`,

  cold_caller: `You are an expert B2B cold call script writer.
Write a complete script:
**OPENING (5 sec):** hook
**BRIDGE (10 sec):** connect situation to solution
**VALUE PROP (15 sec):** specific result
**QUALIFYING QUESTION:** one question
**OBJECTION HANDLERS:** "Not interested" / "Send email" / "No budget"
**CLOSE:** ask for meeting
Under 200 words. Conversational, not robotic.`,

  linkedin_writer: `You are a LinkedIn outreach expert (35%+ acceptance rates).
Write:
1. CONNECTION REQUEST (max 300 chars): reference their specific post/activity, clear reason to connect
2. FOLLOW-UP MESSAGE (under 150 words): soft value prop, clear next step
Label both clearly.`,

  proposal_writer: `You are a senior B2B sales consultant. Write a proposal outline:
**EXECUTIVE SUMMARY:** problem + solution (2-3 sentences)
**THE PROBLEM:** specific pain points
**OUR SOLUTION:** how we address each
**EXPECTED ROI:** specific numbers + timeline
**INVESTMENT:** pricing recommendation
**NEXT STEPS:** 3 actions with dates`,

  competitor_intel: `You are a competitive intelligence analyst.
**COMPETITOR WEAKNESSES:** 3 specific weaknesses with data
**OUR ADVANTAGES:** direct comparisons
**WINNING TALK TRACK:** 2-3 sentences to use
**QUESTIONS TO ASK:** 2 questions that expose competitor weakness
**ONE-LINER CLOSER:** memorable line`,

  revenue_forecaster: `You are a B2B revenue forecasting expert.
**PIPELINE SUMMARY:** total value, weighted, by stage
**FORECAST:** Conservative / Base / Optimistic with %
**LIKELY TO CLOSE:** top 2-3 deals with reasons
**AT-RISK:** deals + recommended actions
**RECOMMENDATION:** 3 specific actions to hit forecast`,
};

const MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "openrouter/free",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, type, system: customSystem, userId } = body;

    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY missing" }, { status: 500 });

    // Check daily agent run limits if userId provided
    if (userId) {
      try {
        const { data: planData } = await supabaseAdmin
          .from("user_plans").select("plan").eq("user_id", userId).single();
        const plan = planData?.plan ?? "free";
        const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.agentRunsPerDay ?? 5;

        if (limit !== -1) {
          const startOfDay = new Date();
          startOfDay.setHours(0,0,0,0);
          const { count } = await supabaseAdmin
            .from("agent_runs").select("*", { count:"exact", head:true })
            .eq("user_id", userId).gte("created_at", startOfDay.toISOString());

          if ((count ?? 0) >= limit) {
            return NextResponse.json({
              error: `Daily AI agent limit reached (${count}/${limit}). Upgrade your plan at /dashboard/pricing`,
              upgrade: true, currentPlan: plan, used: count, limit,
            }, { status: 429 });
          }
        }
      } catch {}
    }

    const systemPrompt = customSystem || SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.emailWriter;
    let lastError = "";
    let result = "";
    let usedModel = "";

    for (const model of MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://salesforge.ai",
            "X-Title": "SalesForge AI",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        const data = await res.json();

        if (!res.ok) { lastError = `${model}: ${res.status}`; continue; }

        const text = data.choices?.[0]?.message?.content;
        if (!text || text.trim().length < 10) { lastError = `${model}: empty`; continue; }

        // Garbage detection
        const garbled = (text.match(/[^\x20-\x7E\n\r\t]/g) || []).length;
        if (garbled / text.length > 0.1) { lastError = `${model}: garbled`; continue; }

        result = text.trim();
        usedModel = model;
        break;
      } catch (err: any) {
        lastError = `${model}: ${err.message}`;
      }
    }

    if (!result) return NextResponse.json({ error: `All models failed. ${lastError}` }, { status: 500 });

    // Log agent run to DB
    if (userId) {
      try {
        await supabaseAdmin.from("agent_runs").insert({
          user_id: userId,
          agent_type: type ?? "general",
          prompt: prompt.slice(0, 500),
          result: result.slice(0, 500),
          model_used: usedModel,
        });
      } catch {}
    }

    return NextResponse.json({ result, model: usedModel });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
