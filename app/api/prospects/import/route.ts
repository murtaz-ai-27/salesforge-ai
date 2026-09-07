import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { csvData, userId } = await req.json();
    if (!csvData || !userId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key missing" }, { status: 500 });

    // Parse CSV
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, "_"));
    const rows = lines.slice(1).filter((l: string) => l.trim()).map((line: string) => {
      const vals = line.split(",").map((v: string) => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h: string, i: number) => { obj[h] = vals[i] || ""; });
      return obj;
    });

    if (rows.length === 0) return NextResponse.json({ error: "No data rows found" }, { status: 400 });

    // AI analyze with OpenRouter
    const MODELS = [
      "meta-llama/llama-3.3-70b-instruct:free",
      "deepseek/deepseek-r1:free",
      "google/gemma-3-27b-it:free",
    ];

    const prompt = `Analyze these CSV prospect rows and return a JSON array. For each prospect extract: name, email, company, title, linkedin_url, score (0-100 ICP score), intent (high/medium/low), notes (1 sentence why interesting).

CSV Data:
${JSON.stringify(rows.slice(0, 20), null, 2)}

Rules:
- VP/C-Suite + Tech/SaaS = score 85-98
- Director + Mid-market = score 70-84
- Manager + SMB = score 50-69
- Map CSV columns intelligently (e.g. "first_name"+"last_name" = name)
- Return ONLY a JSON array, no markdown, no backticks`;

    let analyzed = null;
    for (const model of MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://salevrix-ai-black.vercel.app",
            "X-Title": "Salevrix AI",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "You are a data extraction AI. Return ONLY valid JSON arrays. No markdown. No explanation." },
              { role: "user", content: prompt }
            ],
            max_tokens: 3000,
            temperature: 0.1,
          }),
        });
        const data = await res.json();
        if (!res.ok) continue;
        const text = data.choices?.[0]?.message?.content?.trim();
        if (!text) continue;
        // Clean and parse JSON
        const clean = text.replace(/```json|```/g, "").trim();
        const start = clean.indexOf("[");
        const end = clean.lastIndexOf("]") + 1;
        if (start === -1) continue;
        analyzed = JSON.parse(clean.slice(start, end));
        break;
      } catch { continue; }
    }

    // Fallback: parse CSV directly without AI
    if (!analyzed) {
      // No AI available - use neutral defaults (no fake randomness)
      analyzed = rows.map((row: Record<string, string>) => ({
        name: row.name || row.full_name || `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Unknown",
        email: row.email || row.email_address || "",
        company: row.company || row.company_name || row.organization || "",
        title: row.title || row.job_title || row.position || "",
        linkedin_url: row.linkedin || row.linkedin_url || row.linkedin_profile || "",
        score: 50, // Neutral score - AI will score properly when available
        intent: "medium", // Default until AI enriches
        notes: "Imported from CSV — run Prospect Enricher to get AI score",
      }));
    }

    // Insert into Supabase
    const toInsert = analyzed
      .filter((p: any) => p.name && p.name !== "Unknown")
      .map((p: any) => ({
        user_id: userId,
        name: p.name || "",
        email: p.email || "",
        company: p.company || "",
        title: p.title || "",
        linkedin_url: p.linkedin_url || "",
        score: Math.min(100, Math.max(0, parseInt(p.score) || 70)),
        status: "active",
        stage: "new",
        notes: p.notes || "",
        intent: p.intent || "medium",
      }));

    if (toInsert.length === 0) return NextResponse.json({ error: "No valid prospects found in CSV" }, { status: 400 });

    const { data, error } = await supabaseAdmin.from("prospects").insert(toInsert).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ 
      success: true, 
      imported: data.length,
      prospects: data,
      message: `Successfully imported ${data.length} prospects with AI scoring`
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
