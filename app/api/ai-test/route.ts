import { NextResponse } from "next/server";

const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
];

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "❌ KEY MISSING",
      fix: "Add OPENROUTER_API_KEY=sk-or-v1-xxx to .env.local and restart server"
    });
  }

  const results: Record<string, string> = {};
  let workingModel = "";

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
          messages: [{ role: "user", content: "Reply with: WORKS" }],
          max_tokens: 10,
        }),
      });

      const data = await res.json();

      if (res.ok && data.choices?.[0]?.message?.content) {
        results[model] = "✅ WORKING";
        if (!workingModel) workingModel = model;
      } else {
        results[model] = `❌ ${res.status}: ${data.error?.message?.slice(0, 60) ?? "failed"}`;
      }
    } catch (err: any) {
      results[model] = `❌ Error: ${err.message}`;
    }
  }

  return NextResponse.json({
    status: workingModel ? "✅ API WORKING" : "❌ ALL MODELS FAILED",
    bestModel: workingModel || "none",
    keyPreview: apiKey.slice(0, 20) + "...",
    modelResults: results,
  });
}
