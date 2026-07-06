import { NextResponse } from "next/server";

const MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "openrouter/free",
];

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ status: "❌ KEY MISSING" });

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
          messages: [
            { role: "system", content: "You are a helpful assistant. Reply with exactly what is asked, nothing more." },
            { role: "user", content: "Reply with exactly this text: API WORKING FINE" }
          ],
          max_tokens: 20,
          temperature: 0,
        }),
      });

      const data = await res.json();

      if (res.ok && data.choices?.[0]?.message?.content) {
        const response = data.choices[0].message.content;
        // Check for garbage
        const garbledChars = (response.match(/[^\x20-\x7E\n\r\t]/g) || []).length;
        const isGarbled = garbledChars / response.length > 0.1;

        if (isGarbled) {
          results[model] = `⚠️ GARBLED OUTPUT: ${response.slice(0,50)}`;
        } else {
          results[model] = `✅ WORKING: "${response.trim()}"`;
          if (!workingModel) { workingModel = model; aiResponse = response; }
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
