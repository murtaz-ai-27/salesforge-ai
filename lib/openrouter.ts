// lib/openrouter.ts
// Client-side helper — calls our /api/ai route (never exposes API key)

export async function callAI(prompt: string, type?: string, customSystem?: string): Promise<string> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, type, system: customSystem }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.result ?? "No response.";
  } catch (err: any) {
    throw new Error(err.message ?? "AI call failed");
  }
}

export const AI_SYSTEM_PROMPTS = {
  emailWriter: "emailWriter",
  subjectLine: "subjectLine",
  iceBreaker: "iceBreaker",
  objectionHandler: "objectionHandler",
  prospectAnalyzer: "prospectAnalyzer",
  dealAnalyzer: "dealAnalyzer",
  meetingSummarizer: "meetingSummarizer",
};
