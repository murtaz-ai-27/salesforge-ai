import { NextResponse } from "next/server";

const FREE_MODELS = [
  "openrouter/free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "qwen/qwen3-coder:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "deepseek/deepseek-r1:free",
];

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ status: "❌ KEY MISSING" });

  const results: Record<string, string> = {};
  let workingModel = "";
  let aiResponse = "";

  for (const model of FREE_MODELS) {
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
          messages: [{ role: "user", content: "Reply with exactly: WORKS" }],
          max_tokens: 10,
        }),
      });

      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        results[model] = "✅ WORKING";
        if (!workingModel) { workingModel = model; aiResponse = data.choices[0].message.content; }
      } else {
        results[model] = `❌ ${res.status}: ${(data.error?.message ?? "failed").slice(0, 80)}`;
      }
    } catch (err: any) {
      results[model] = `❌ Error: ${err.message}`;
    }
  }

  return NextResponse.json({
    status: workingModel ? "✅ API WORKING" : "❌ ALL MODELS FAILED",
    bestModel: workingModel || "none",
    aiResponse,
    keyPreview: apiKey.slice(0, 20) + "...",
    modelResults: results,
  });
}
