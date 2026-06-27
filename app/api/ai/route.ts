import { NextRequest, NextResponse } from "next/server";
import { callAI, AI_SYSTEM_PROMPTS } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { prompt, type } = await req.json();
    const system = AI_SYSTEM_PROMPTS[type as keyof typeof AI_SYSTEM_PROMPTS];
    const result = await callAI(prompt, system);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: "AI call failed" }, { status: 500 });
  }
}