import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPTS: Record<string, string> = {
  emailWriter: `You are an elite B2B cold email writer.
Write hyper-personalized cold emails that:
- Start with a specific insight about the prospect
- Have ONE clear value proposition
- Are under 120 words
- End with a soft CTA (15 min call)
- Sound human, not salesy
Return ONLY the email body. No subject line. No explanation.`,

  subjectLine: `You are a cold email subject line expert.
Write 3 subject lines under 8 words each.
Return ONLY 3 numbered subject lines. Nothing else.`,

  iceBreaker: `You are a sales personalization expert.
Write 1-2 sentence personalized ice breaker.
Reference something specific about the prospect.
Return ONLY the ice breaker. Nothing else.`,

  objectionHandler: `You are a world-class sales coach.
Handle the objection in under 80 words:
- Acknowledge the concern
- Reframe with counter-point
- End with a question
Return ONLY the response. No preamble.`,

  prospectAnalyzer: `You are an ICP analyst. Analyze the prospect.
Return ONLY this exact JSON (no markdown, no backticks):
{"score":85,"buyingIntent":"high","bestChannel":"email","personalizationHooks":["hook1","hook2"],"recommendedTiming":"immediate","reasoning":"brief reason"}
score=0-100, buyingIntent=high/medium/low, bestChannel=email/linkedin/phone`,

  dealAnalyzer: `You are a B2B deal intelligence expert.
Analyze the deal situation and provide:
- Deal health score (0-100)
- Top 3 risk factors
- Recommended next actions
- Win probability %
Be specific and actionable.`,

  meetingSummarizer: `You are a sales meeting summarizer.
Format output as:
KEY POINTS:
- point 1

ACTION ITEMS:
- item 1 (owner, deadline)

NEXT STEPS:
- step 1

SENTIMENT: positive/neutral/negative`,
};

// Ordered fallback chain. openrouter/free is OpenRouter's own auto-router
// that picks whichever free model is currently healthy — most reliable option.
const MODELS = [
  "openrouter/free",
  "google/gemma-2-9b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "qwen/qwen2.5-vl-72b-instruct:free",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, type, system: customSystem } = body;

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: "OPENROUTER_API_KEY missing from .env.local"
      }, { status: 500 });
    }

    const systemPrompt = customSystem || SYSTEM_PROMPTS[type] || "You are a helpful B2B sales AI. Be concise.";

    let lastError = "";

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
            max_tokens: 800,
            temperature: 0.7,
          }),
        });

        const data = await res.json();

        if (res.status === 401) {
          return NextResponse.json({
            error: "Invalid OpenRouter API key. Get a new one at openrouter.ai/keys"
          }, { status: 401 });
        }

        if (!res.ok) {
          lastError = `${model}: ${res.status} ${data?.error?.message ?? ""}`;
          continue;
        }

        const result = data.choices?.[0]?.message?.content;
        if (!result) {
          lastError = `${model}: empty response`;
          continue;
        }

        return NextResponse.json({ result, model });

      } catch (err: any) {
        lastError = `${model}: ${err.message}`;
        continue;
      }
    }

    return NextResponse.json({
      error: `All models failed. Last: ${lastError}`
    }, { status: 500 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
