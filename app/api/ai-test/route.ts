import { NextResponse } from "next/server";

const MODELS = [
  "openrouter/free",
  "google/gemma-2-9b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "qwen/qwen2.5-vl-72b-instruct:free",
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
  let aiResponse = "";

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
          messages: [{ role: "user", content: "Reply with exactly: WORKS" }],
          max_tokens: 10,
        }),
      });

      const data = await res.json();

      if (res.ok && data.choices?.[0]?.message?.content) {
        results[model] = "✅ WORKING";
        if (!workingModel) {
          workingModel = model;
          aiResponse = data.choices[0].message.content;
        }
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
