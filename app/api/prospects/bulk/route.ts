import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const AVATARS = [
  { bg:"linear-gradient(140deg,#C8FF00,#86efac)", color:"#050505" },
  { bg:"linear-gradient(140deg,#818cf8,#c084fc)", color:"#fff" },
  { bg:"linear-gradient(140deg,#f59e0b,#ef4444)", color:"#fff" },
  { bg:"linear-gradient(140deg,#34d399,#059669)", color:"#fff" },
  { bg:"linear-gradient(140deg,#60a5fa,#3b82f6)", color:"#fff" },
  { bg:"linear-gradient(140deg,#f472b6,#ec4899)", color:"#fff" },
];

function scoreProspect(p: any): number {
  let score = 60;
  const role = (p.role || "").toLowerCase();
  if (role.includes("cro") || role.includes("chief revenue")) score += 15;
  else if (role.includes("vp") && role.includes("sale")) score += 12;
  else if (role.includes("head of sale") || role.includes("director of sale")) score += 10;
  else if (role.includes("vp") || role.includes("director")) score += 7;
  else if (role.includes("founder") || role.includes("ceo")) score += 8;
  else if (role.includes("manager")) score += 3;
  const size = (p.company_size || "").toLowerCase();
  if (size.includes("500") || size.includes("enterprise")) score += 8;
  else if (size.includes("100") || size.includes("200")) score += 6;
  else if (size.includes("50")) score += 4;
  const industry = (p.industry || "").toLowerCase();
  if (["saas","software","fintech","devtools"].some(i => industry.includes(i))) score += 7;
  const notes = (p.notes || "").toLowerCase();
  if (notes.includes("funding") || notes.includes("raised")) score += 10;
  if (notes.includes("hiring") || notes.includes("growing")) score += 7;
  if (notes.includes("interested")) score += 8;
  return Math.min(Math.max(score, 40), 99);
}

function getBuyingIntent(score: number): "high"|"medium"|"low" {
  if (score >= 80) return "high";
  if (score >= 65) return "medium";
  return "low";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, prospects: rawProspects } = body;
    if (!userId || !rawProspects?.length)
      return NextResponse.json({ error: "userId and prospects required" }, { status: 400 });

    const { data: planData } = await supabaseAdmin
      .from("user_plans").select("plan").eq("user_id", userId).single();
    const plan = planData?.plan ?? "free";
    const LIMITS: Record<string,number> = { free:50, starter:500, pro:-1, enterprise:-1 };
    const limit = LIMITS[plan] ?? 50;

    if (limit !== -1) {
      const { count } = await supabaseAdmin
        .from("prospects").select("*",{count:"exact",head:true}).eq("user_id", userId);
      const current = count ?? 0;
      if (current >= limit)
        return NextResponse.json({ error:`Prospect limit reached (${current}/${limit}). Upgrade your plan.`, upgrade:true }, { status:429 });
      if (current + rawProspects.length > limit) rawProspects.splice(limit - current);
    }

    const processed = rawProspects.map((p: any, idx: number) => {
      const av = AVATARS[idx % AVATARS.length];
      const name = (p.name||p.full_name||p.Name||p["Full Name"]||"").trim();
      const email = (p.email||p.Email||p["Email Address"]||"").trim().toLowerCase();
      const role = (p.role||p.job_title||p["Job Title"]||p.title||p.Role||"").trim();
      const company = (p.company||p.Company||p["Company Name"]||"").trim();
      const industry = (p.industry||p.Industry||"").trim();
      const company_size = (p.company_size||p["Company Size"]||p.size||"").trim();
      const notes = (p.notes||p.Notes||p.context||"").trim();
      const linkedin_url = (p.linkedin||p.linkedin_url||p["LinkedIn URL"]||"").trim();
      const score = scoreProspect({ role, company, industry, company_size, notes });
      const intent = getBuyingIntent(score);
      return {
        user_id: userId, name, email, role, company, industry, company_size, notes, linkedin_url,
        ai_score: score, buying_intent: intent, status: "new",
        avatar_init: name.split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()||"??",
        avatar_bg: av.bg, avatar_color: av.color,
        created_at: new Date().toISOString(),
      };
    }).filter((p: any) => p.name && p.email);

    if (!processed.length)
      return NextResponse.json({ error:"No valid prospects. CSV must have 'name' and 'email' columns." }, { status:400 });

    let inserted = 0;
    for (let i = 0; i < processed.length; i += 50) {
      const { error } = await supabaseAdmin.from("prospects").insert(processed.slice(i, i+50));
      if (!error) inserted += Math.min(50, processed.length - i);
    }

    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: userId, type:"general",
        title:`✅ ${inserted} prospects imported`,
        message:`${inserted} prospects imported and AI-scored. ${processed.filter((p:any)=>p.buying_intent==="high").length} are high intent.`,
        link:"/dashboard/prospects", read:false,
      });
    } catch {}

    return NextResponse.json({
      success:true, imported:inserted,
      highIntent: processed.filter((p:any)=>p.buying_intent==="high").length,
      avgScore: Math.round(processed.reduce((s:number,p:any)=>s+p.ai_score,0)/processed.length),
      message:`${inserted} prospects imported and AI-scored!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status:500 });
  }
}