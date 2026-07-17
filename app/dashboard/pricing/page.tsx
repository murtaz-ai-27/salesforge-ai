"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00",violet:"#7c3aed" };

const PLANS = [
  {
    id:"free", name:"Free", price:0, period:"forever",
    color:"#9598a3", border:S.lineSoft, btnBg:"rgba(255,255,255,0.06)", btnColor:S.text,
    badge:null,
    features:[
      { text:"50 prospects max", included:true },
      { text:"2 active sequences", included:true },
      { text:"5 AI agent runs/day", included:true },
      { text:"3 automations", included:true },
      { text:"Basic analytics", included:true },
      { text:"Email sending", included:false },
      { text:"LinkedIn automation", included:false },
      { text:"Priority support", included:false },
      { text:"Custom AI prompts", included:false },
      { text:"Team members", included:false },
    ],
    limits:{ prospects:50, sequences:2, agentRuns:5, automations:3 }
  },
  {
    id:"starter", name:"Starter", price:29, period:"month",
    color:"#818cf8", border:"rgba(129,140,248,0.3)", btnBg:"#818cf8", btnColor:"#fff",
    badge:"Most Popular",
    features:[
      { text:"500 prospects", included:true },
      { text:"10 active sequences", included:true },
      { text:"50 AI agent runs/day", included:true },
      { text:"8 automations", included:true },
      { text:"Advanced analytics", included:true },
      { text:"Email sending (1000/mo)", included:true },
      { text:"LinkedIn automation", included:false },
      { text:"Priority support", included:false },
      { text:"Custom AI prompts", included:false },
      { text:"Team members (1)", included:true },
    ],
    limits:{ prospects:500, sequences:10, agentRuns:50, automations:8 }
  },
  {
    id:"pro", name:"Pro", price:79, period:"month",
    color:"#C8FF00", border:"rgba(200,255,0,0.3)", btnBg:"#C8FF00", btnColor:"#050505",
    badge:"Apollo Killer 🔥",
    features:[
      { text:"Unlimited prospects", included:true },
      { text:"Unlimited sequences", included:true },
      { text:"Unlimited AI agent runs", included:true },
      { text:"All 15 automations", included:true },
      { text:"Full analytics + reports", included:true },
      { text:"Email sending (10,000/mo)", included:true },
      { text:"LinkedIn automation", included:true },
      { text:"Priority support", included:true },
      { text:"Custom AI prompts", included:true },
      { text:"Team members (5)", included:true },
    ],
    limits:{ prospects:-1, sequences:-1, agentRuns:-1, automations:15 }
  },
  {
    id:"enterprise", name:"Enterprise", price:199, period:"month",
    color:"#f59e0b", border:"rgba(245,158,11,0.3)", btnBg:"rgba(245,158,11,0.15)", btnColor:"#f59e0b",
    badge:"Apollo Beater",
    features:[
      { text:"Unlimited everything", included:true },
      { text:"Unlimited sequences", included:true },
      { text:"Unlimited AI agent runs", included:true },
      { text:"Custom automations", included:true },
      { text:"White-label reports", included:true },
      { text:"Unlimited email sending", included:true },
      { text:"LinkedIn + WhatsApp automation", included:true },
      { text:"Dedicated support", included:true },
      { text:"Custom AI model fine-tuning", included:true },
      { text:"Unlimited team members", included:true },
    ],
    limits:{ prospects:-1, sequences:-1, agentRuns:-1, automations:-1 }
  },
];

const COMPARISON = [
  { feature:"Contact Database",      salesforge:"AI-scored, your own data (100% accurate)", apollo:"210M+ contacts (65% accuracy, 20-30% bounce)" },
  { feature:"AI Agents",             salesforge:"10 specialized agents",                     apollo:"1 basic AI assistant" },
  { feature:"Automations",           salesforge:"15 real AI automations",                    apollo:"Basic task reminders only" },
  { feature:"LinkedIn Automation",   salesforge:"✅ AI-written messages (Pro+)",              apollo:"❌ Manual only" },
  { feature:"Email Deliverability",  salesforge:"94%+ inbox rate",                           apollo:"20-30% bounce rates" },
  { feature:"Pricing",               salesforge:"From $0 — up to $199/mo",                   apollo:"$49-$119/user/month" },
  { feature:"Data Accuracy",         salesforge:"100% (your own verified data)",              apollo:"~65% accuracy" },
  { feature:"Onboarding",            salesforge:"5 minutes to first prospect",               apollo:"Can feel overwhelming" },
  { feature:"AI Email Writing",      salesforge:"Hyper-personalized, human-sounding",        apollo:"Generic AI copy" },
  { feature:"Free Tier",             salesforge:"50 prospects + 5 agent runs/day",           apollo:"100 credits/month only" },
];

export default function PricingPage() {
  const { user, loading, handleLogout } = useAuth();
  const [billing, setBilling] = useState<"monthly"|"annual">("monthly");
  const [currentPlan] = useState("free");

  if (authLoading) return <LoadingScreen text="Loading pricing plans"/>;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <Sidebar active="pricing" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"6px 14px",borderRadius:999,marginBottom:16 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Apollo charges $49-$119/user — we start at $0
          </div>
          <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:36,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:12 }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ color:S.muted,fontSize:16,maxWidth:500,margin:"0 auto 24px" }}>
            Start free, scale as you grow. No credit card required. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div style={{ display:"inline-flex",alignItems:"center",gap:0,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:4 }}>
            {[["monthly","Monthly"],["annual","Annual (Save 20%)"]].map(([v,l])=>(
              <button key={v} onClick={()=>setBilling(v as any)}
                style={{ padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:13,fontWeight:600,transition:"all 0.2s",background:billing===v?S.accent:"transparent",color:billing===v?"#050505":S.muted }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:48 }}>
          {PLANS.map(plan=>(
            <div key={plan.id} style={{ background:S.panel,border:`1px solid ${plan.border}`,borderRadius:18,padding:24,position:"relative",transition:"transform 0.2s",boxShadow:plan.id==="pro"?"0 0 40px rgba(200,255,0,0.1)":"none" }}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)"}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(0)"}>

              {plan.badge && (
                <div style={{ position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:999,background:plan.id==="pro"?S.accent:plan.id==="enterprise"?"#f59e0b":"#818cf8",color:plan.id==="pro"?"#050505":"#fff",whiteSpace:"nowrap" }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:13,fontWeight:700,color:plan.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8 }}>{plan.name}</div>
                <div style={{ display:"flex",alignItems:"baseline",gap:4,marginBottom:4 }}>
                  <span style={{ fontFamily:"Syne,sans-serif",fontSize:40,fontWeight:800,color:S.text,letterSpacing:"-0.04em" }}>
                    ${billing==="annual"&&plan.price>0?Math.round(plan.price*0.8):plan.price}
                  </span>
                  {plan.price>0&&<span style={{ fontSize:13,color:S.faint }}>/{plan.period}</span>}
                  {plan.price===0&&<span style={{ fontSize:16,color:S.faint,marginLeft:4 }}>forever</span>}
                </div>
                {billing==="annual"&&plan.price>0&&(
                  <div style={{ fontSize:11,color:"#34d399",fontWeight:600 }}>Save ${Math.round(plan.price*0.2*12)}/year</div>
                )}
              </div>

              <button
                style={{ width:"100%",padding:"11px",borderRadius:10,border:`1px solid ${plan.id==="pro"?"rgba(200,255,0,0.3)":plan.id==="enterprise"?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.1)"}`,background:plan.btnBg,color:plan.btnColor,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",marginBottom:20,transition:"all 0.2s" }}
                onMouseEnter={e=>{ if(plan.id==="pro")(e.currentTarget as HTMLButtonElement).style.background="rgba(200,255,0,0.9)"; }}
                onMouseLeave={e=>{ if(plan.id==="pro")(e.currentTarget as HTMLButtonElement).style.background=S.accent; }}>
                {currentPlan===plan.id?"Current Plan":plan.price===0?"Start Free →":plan.id==="enterprise"?"Contact Sales →":"Upgrade Now →"}
              </button>

              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {plan.features.map((f,i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:16,height:16,borderRadius:"50%",background:f.included?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${f.included?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.08)"}`,display:"grid",placeItems:"center",flexShrink:0 }}>
                      {f.included
                        ? <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="#555a66" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      }
                    </span>
                    <span style={{ fontSize:12,color:f.included?S.muted:S.faint }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Apollo Comparison */}
        <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:18,overflow:"hidden",marginBottom:40 }}>
          <div style={{ padding:"20px 24px",borderBottom:`1px solid ${S.lineSoft}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:16,fontWeight:800,color:S.text,fontFamily:"Syne,sans-serif",marginBottom:4 }}>SalesForge AI vs Apollo.io</div>
              <div style={{ fontSize:12,color:S.faint }}>Why we beat Apollo on every metric that matters</div>
            </div>
            <div style={{ fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"6px 14px",borderRadius:999 }}>
              Apollo: $49-$119/user · Us: From $0
            </div>
          </div>

          {/* Table Header */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 24px",borderBottom:`1px solid ${S.lineSoft}`,background:"rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>Feature</div>
            <div style={{ fontSize:11,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:".08em",display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:20,height:20,borderRadius:6,background:S.accent,display:"grid",placeItems:"center" }}>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              SalesForge AI
            </div>
            <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>Apollo.io</div>
          </div>

          {COMPARISON.map((row,i)=>(
            <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"14px 24px",borderBottom:i<COMPARISON.length-1?`1px solid ${S.lineSoft}`:"none",background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
              <div style={{ fontSize:13,fontWeight:600,color:S.text }}>{row.feature}</div>
              <div style={{ fontSize:12,color:"#34d399",paddingRight:16 }}>{row.salesforge}</div>
              <div style={{ fontSize:12,color:S.faint }}>{row.apollo}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:600,margin:"0 auto" }}>
          <div style={{ fontSize:20,fontWeight:800,color:S.text,fontFamily:"Syne,sans-serif",textAlign:"center",marginBottom:24 }}>FAQ</div>
          {[
            { q:"Can I cancel anytime?", a:"Yes — no contracts, no commitments. Downgrade to free or cancel with one click. Your data stays safe." },
            { q:"What happens when I hit free tier limits?", a:"You'll see a friendly upgrade prompt. Nothing breaks — you just won't be able to add more until you upgrade or remove old data." },
            { q:"Is my data safe?", a:"Absolutely. We use Supabase with Row-Level Security — your data is completely isolated from other users." },
            { q:"How is this better than Apollo?", a:"Apollo has 65% data accuracy and 20-30% email bounce rates. SalesForge AI uses your own verified data (100% accuracy) + 10x more AI agents + actual automation vs Apollo's manual workflows." },
          ].map((faq,i)=>(
            <div key={i} style={{ marginBottom:16,background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"16px 20px" }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:8 }}>{faq.q}</div>
              <div style={{ fontSize:13,color:S.muted,lineHeight:1.6 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
