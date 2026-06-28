import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPTS: Record<string, string> = {
  emailWriter: `You are an elite B2B cold email writer for SalesForge AI.
Write hyper-personalized cold emails that:
- Start with a SPECIFIC insight about the prospect or their company
- Have ONE clear value proposition
- Are under 120 words
- End with a soft CTA (15 min call)
- Sound human, not salesy
- Never use "I hope this email finds you well"
- Use {{firstName}} as placeholder for first name
Return ONLY the email body, no subject line, no explanation.`,

  subjectLine: `You are a cold email subject line expert.
Write 3 subject line options that:
- Are under 8 words each
- Create curiosity without clickbait
- Feel personal, not mass-email
- Reference something specific about the prospect
Return ONLY 3 subject lines, numbered 1-3. Nothing else.`,

  iceBreaker: `You are a sales personalization expert.
Write a 1-2 sentence personalized ice breaker based on the prospect info provided.
Reference something specific: recent news, LinkedIn activity, company milestone, job change.
Sound like you actually researched them. Be natural, not creepy.
Return ONLY the ice breaker sentences. Nothing else.`,

  objectionHandler: `You are a world-class sales coach.
Handle the sales objection provided with:
- Acknowledge the concern genuinely
- Reframe with a specific counter-point  
- End with a question to keep dialogue open
Keep it under 80 words. Sound confident but not pushy.
Return ONLY the response. No explanation, no preamble.`,

  prospectAnalyzer: `You are an ICP (Ideal Customer Profile) analyst for a B2B sales platform.
Analyze the prospect data and return a JSON object.
Return ONLY valid JSON, no markdown, no backticks, no explanation:
{
  "score": 85,
  "buyingIntent": "high",
  "bestChannel": "email",
  "personalizationHooks": ["hook1", "hook2"],
  "recommendedTiming": "immediate",
  "reasoning": "brief explanation"
}
score must be 0-100. buyingIntent must be high, medium, or low. bestChannel must be email, linkedin, or phone.`,

  dealAnalyzer: `You are a B2B deal intelligence expert.
Analyze the deal/prospect situation and provide:
- Deal health score (0-100)
- Risk factors
- Recommended next actions
- Win probability
Format as clear sections. Be specific and actionable.`,

  meetingSummarizer: `You are a sales meeting summarizer.
Extract and format:
**Key Discussion Points:** (bullet points)
**Decisions Made:** (bullet points)  
**Action Items:** (bullet points with owner and deadline if mentioned)
**Next Steps:** (bullet points)
**Sentiment:** (positive/neutral/negative with brief reason)
Be concise and actionable.`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, type, system: customSystem } = body;

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY not configured in .env.local" }, { status: 500 });
    }

    const systemPrompt = customSystem || SYSTEM_PROMPTS[type] || "You are a helpful B2B sales assistant. Be concise and practical.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://salesforge.ai",
        "X-Title": "SalesForge AI",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);

      // Try fallback model
      const fallback = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://salesforge.ai",
          "X-Title": "SalesForge AI",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.2-3b-instruct:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!fallback.ok) {
        return NextResponse.json({ error: `AI API error: ${response.status}. Check your OpenRouter API key.` }, { status: 500 });
      }

      const fallbackData = await fallback.json();
      const result = fallbackData.choices?.[0]?.message?.content ?? "No response from AI.";
      return NextResponse.json({ result, model: "llama-3.2-3b (fallback)" });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content ?? "No response from AI.";
    return NextResponse.json({ result, model: data.model });

  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}
