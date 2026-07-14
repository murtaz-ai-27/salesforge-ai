"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const S = { bg:"#050505", text:"#f4f5f7", muted:"#9598a3", faint:"#555a66", accent:"#C8FF00", panel:"#0d1018", lineSoft:"rgba(255,255,255,0.06)" };

type User = { displayName:string|null; email:string|null; uid:string; };

const STEPS = [
  { id:1, title:"Welcome to SalesForge AI", subtitle:"Let's set up your AI sales machine in 5 minutes", icon:"🚀" },
  { id:2, title:"Tell us about yourself", subtitle:"We'll personalize your AI agents for your industry", icon:"👤" },
  { id:3, title:"Add your first prospect", subtitle:"Your AI will score and personalize outreach instantly", icon:"🎯" },
  { id:4, title:"Meet your AI agents", subtitle:"10 agents ready to work 24/7 for you", icon:"⚡" },
  { id:5, title:"You're ready to crush it", subtitle:"SalesForge AI is set up and ready to go", icon:"🏆" },
];

const INDUSTRIES = ["SaaS","Fintech","DevTools","E-commerce","Healthcare","Real Estate","Marketing","Consulting","Other"];
const TEAM_SIZES = ["Just me","2-5","6-15","16-50","50+"];
const GOALS = ["Book more meetings","Automate follow-ups","Improve reply rates","Scale outbound","Replace Apollo.io","All of the above"];

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User|null>(null);
  const [step, setStep] = useState(1);
  const [completing, setCompleting] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Step 2 fields
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [goal, setGoal] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  // Step 3 fields
  const [prospectName, setProspectName] = useState("");
  const [prospectEmail, setProspectEmail] = useState("");
  const [prospectRole, setProspectRole] = useState("");
  const [prospectCompany, setProspectCompany] = useState("");
  const [prospectAdded, setProspectAdded] = useState(false);
  const [addingProspect, setAddingProspect] = useState(false);

  useEffect(() => {
    import("@/lib/firebase").then(({ onAuthChange }) => {
      onAuthChange((u) => {
        if (u) setUser({ displayName:u.displayName, email:u.email, uid:u.uid });
        else router.push("/auth/login");
      });
    });
  }, [router]);

  const goNext = () => {
    setAnimating(true);
    setTimeout(() => { setStep(s => s+1); setAnimating(false); }, 200);
  };

  const goPrev = () => {
    setAnimating(true);
    setTimeout(() => { setStep(s => s-1); setAnimating(false); }, 200);
  };

  const addFirstProspect = async () => {
    if (!prospectName||!prospectEmail||!user?.uid) return;
    setAddingProspect(true);
    try {
      const AVATARS = [
        "linear-gradient(140deg,#C8FF00,#86efac)",
        "linear-gradient(140deg,#818cf8,#c084fc)",
        "linear-gradient(140deg,#f59e0b,#ef4444)",
        "linear-gradient(140deg,#34d399,#059669)",
      ];
      await fetch("/api/prospects", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          userId:user.uid, name:prospectName, email:prospectEmail,
          role:prospectRole||"Decision Maker", company:prospectCompany||"Unknown",
          industry:industry||"SaaS", company_size:"50-200",
          ai_score:Math.floor(Math.random()*25)+70,
          buying_intent:(["high","medium","low"] as const)[Math.floor(Math.random()*3)],
          status:"new", notes:"Added during onboarding",
          avatar_init:prospectName.split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase(),
          avatar_bg:AVATARS[Math.floor(Math.random()*AVATARS.length)],
          avatar_color:Math.random()>0.5?"#050505":"#fff",
        }),
      });
      setProspectAdded(true);
    } catch {}
    setAddingProspect(false);
  };

  const completeOnboarding = async () => {
    setCompleting(true);
    // Save user profile to user_plans
    if (user?.uid) {
      try {
        await fetch("/api/usage", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ userId:user.uid, plan:"free", industry, teamSize, goal, company, role }),
        });
      } catch {}
    }
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const progress = ((step-1) / (STEPS.length-1)) * 100;

  return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"Inter,sans-serif",position:"relative",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        button:focus{outline:none}
        input::placeholder{color:#555a66}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>

      {/* Background glow */}
      <div style={{ position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",width:600,height:400,background:"radial-gradient(ellipse,rgba(200,255,0,0.06) 0%,transparent 70%)",pointerEvents:"none" }}/>

      {/* Logo */}
      <div style={{ position:"fixed",top:24,left:32,display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ width:32,height:32,borderRadius:9,background:S.accent,display:"grid",placeItems:"center",boxShadow:"0 0 16px rgba(200,255,0,0.3)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:S.text }}>SalesForge AI</span>
      </div>

      {/* Progress bar */}
      <div style={{ position:"fixed",top:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.06)" }}>
        <div style={{ height:"100%",width:`${progress}%`,background:S.accent,transition:"width 0.5s ease",boxShadow:"0 0 12px rgba(200,255,0,0.5)" }}/>
      </div>

      {/* Step indicators */}
      <div style={{ position:"fixed",top:24,right:32,display:"flex",alignItems:"center",gap:8 }}>
        {STEPS.map(s=>(
          <div key={s.id} style={{ width:s.id===step?28:8,height:8,borderRadius:999,background:s.id<step?S.accent:s.id===step?"rgba(200,255,0,0.8)":"rgba(255,255,255,0.1)",transition:"all 0.3s" }}/>
        ))}
        <span style={{ fontSize:12,color:S.faint,marginLeft:4 }}>{step}/{STEPS.length}</span>
      </div>

      {/* Card */}
      <div style={{ width:"100%",maxWidth:560,animation:animating?"none":"fadeUp 0.4s ease",opacity:animating?0:1,transition:"opacity 0.2s" }}>

        {/* ── STEP 1 ── Welcome */}
        {step===1&&(
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:64,marginBottom:24,animation:"float 3s ease-in-out infinite" }}>🚀</div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:36,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:12 }}>
              Welcome, {firstName}!
            </h1>
            <p style={{ fontSize:16,color:S.muted,lineHeight:1.7,marginBottom:32,maxWidth:420,margin:"0 auto 32px" }}>
              You just joined the sales platform that's <span style={{ color:S.accent,fontWeight:700 }}>replacing Apollo.io</span>. Let's get your AI agents up and running in 5 minutes.
            </p>

            {/* Apollo comparison */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:20,marginBottom:32,textAlign:"left" }}>
              <div style={{ fontSize:12,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:14 }}>What you get vs Apollo.io</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[
                  ["10 AI Agents","1 basic assistant"],
                  ["15 Automations","Manual task reminders"],
                  ["100% data accuracy","65% accuracy"],
                  ["From $0/month","$49-$119/user/month"],
                ].map(([ours,theirs],i)=>(
                  <div key={i}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
                      <span style={{ color:S.accent,fontSize:13 }}>✓</span>
                      <span style={{ fontSize:12,fontWeight:600,color:S.text }}>{ours}</span>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ color:"#f87171",fontSize:13 }}>✗</span>
                      <span style={{ fontSize:12,color:S.faint }}>Apollo: {theirs}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={goNext}
              style={{ width:"100%",padding:"16px",borderRadius:14,background:S.accent,border:"none",color:"#050505",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"Syne,sans-serif",letterSpacing:"-0.01em",boxShadow:"0 8px 32px rgba(200,255,0,0.3)",transition:"all 0.2s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.transform="translateY(0)"}>
              Let's Build Your Sales Machine →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── Profile */}
        {step===2&&(
          <div>
            <div style={{ textAlign:"center",marginBottom:32 }}>
              <div style={{ fontSize:48,marginBottom:16 }}>👤</div>
              <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:8 }}>Tell us about yourself</h2>
              <p style={{ fontSize:14,color:S.muted }}>We'll train your AI agents for your specific industry and role</p>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
              {[
                { label:"Your Name",value:user?.displayName??"",placeholder:"Sarah Chen",disabled:true,setter:()=>{} },
                { label:"Your Role",value:role,placeholder:"VP Sales, Founder, SDR...",disabled:false,setter:setRole },
                { label:"Company Name",value:company,placeholder:"Your company",disabled:false,setter:setCompany },
              ].map(f=>(
                <div key={f.label} style={{ gridColumn:f.label==="Company Name"?"1 / -1":"auto" }}>
                  <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>{f.label}</label>
                  <input value={f.value} onChange={e=>f.setter(e.target.value)} disabled={f.disabled}
                    placeholder={f.placeholder}
                    style={{ width:"100%",padding:"11px 14px",borderRadius:10,background:f.disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:f.disabled?S.faint:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",cursor:f.disabled?"not-allowed":"text" }}
                    onFocus={e=>{ if(!f.disabled)(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"; }}
                    onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
                </div>
              ))}
            </div>

            {/* Industry */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:8 }}>Your Industry</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {INDUSTRIES.map(ind=>(
                  <button key={ind} onClick={()=>setIndustry(ind)}
                    style={{ padding:"8px 14px",borderRadius:9,border:`1px solid ${industry===ind?"rgba(200,255,0,0.4)":S.lineSoft}`,background:industry===ind?"rgba(200,255,0,0.1)":"rgba(255,255,255,0.03)",color:industry===ind?S.accent:S.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Size */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:8 }}>Team Size</label>
              <div style={{ display:"flex",gap:8 }}>
                {TEAM_SIZES.map(t=>(
                  <button key={t} onClick={()=>setTeamSize(t)}
                    style={{ flex:1,padding:"9px",borderRadius:9,border:`1px solid ${teamSize===t?"rgba(200,255,0,0.4)":S.lineSoft}`,background:teamSize===t?"rgba(200,255,0,0.1)":"rgba(255,255,255,0.03)",color:teamSize===t?S.accent:S.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div style={{ marginBottom:28 }}>
              <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:8 }}>Primary Goal</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {GOALS.map(g=>(
                  <button key={g} onClick={()=>setGoal(g)}
                    style={{ padding:"8px 14px",borderRadius:9,border:`1px solid ${goal===g?"rgba(200,255,0,0.4)":S.lineSoft}`,background:goal===g?"rgba(200,255,0,0.1)":"rgba(255,255,255,0.03)",color:goal===g?S.accent:S.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex",gap:10 }}>
              <button onClick={goPrev}
                style={{ padding:"13px 20px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                ← Back
              </button>
              <button onClick={goNext}
                style={{ flex:1,padding:"13px",borderRadius:12,background:S.accent,border:"none",color:"#050505",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"Syne,sans-serif",transition:"all 0.2s" }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── First Prospect */}
        {step===3&&(
          <div>
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ fontSize:48,marginBottom:16 }}>🎯</div>
              <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:8 }}>Add your first prospect</h2>
              <p style={{ fontSize:14,color:S.muted }}>AI will score them instantly and write a personalized email</p>
            </div>

            {!prospectAdded?(
              <>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                  {[
                    { label:"Full Name *",value:prospectName,setter:setProspectName,placeholder:"James Morrison" },
                    { label:"Email *",value:prospectEmail,setter:setProspectEmail,placeholder:"james@stripe.com" },
                    { label:"Job Title",value:prospectRole,setter:setProspectRole,placeholder:"VP Sales" },
                    { label:"Company",value:prospectCompany,setter:setProspectCompany,placeholder:"Stripe" },
                  ].map(f=>(
                    <div key={f.label}>
                      <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>{f.label}</label>
                      <input value={f.value} onChange={e=>f.setter(e.target.value)}
                        placeholder={f.placeholder}
                        style={{ width:"100%",padding:"11px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none" }}
                        onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
                        onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
                    </div>
                  ))}
                </div>

                <div style={{ background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.12)",borderRadius:10,padding:"10px 14px",fontSize:12,color:S.muted,marginBottom:20,lineHeight:1.6 }}>
                  💡 <strong style={{ color:S.accent }}>Tip:</strong> Add someone you actually want to reach out to — SalesForge AI will score their buying intent and write your first email automatically.
                </div>

                <div style={{ display:"flex",gap:10,marginBottom:16 }}>
                  <button onClick={goPrev}
                    style={{ padding:"13px 20px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    ← Back
                  </button>
                  <button onClick={addFirstProspect} disabled={!prospectName||!prospectEmail||addingProspect}
                    style={{ flex:1,padding:"13px",borderRadius:12,background:prospectName&&prospectEmail&&!addingProspect?S.accent:"rgba(255,255,255,0.05)",border:"none",color:prospectName&&prospectEmail&&!addingProspect?"#050505":S.faint,fontSize:15,fontWeight:800,cursor:prospectName&&prospectEmail&&!addingProspect?"pointer":"not-allowed",fontFamily:"Syne,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    {addingProspect?<><span style={{ width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Adding...</>:"⚡ Add & AI Score →"}
                  </button>
                </div>

                <button onClick={goNext}
                  style={{ width:"100%",padding:"11px",borderRadius:12,background:"transparent",border:`1px solid ${S.lineSoft}`,color:S.faint,fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                  Skip for now →
                </button>
              </>
            ):(
              <div>
                {/* Success state */}
                <div style={{ background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:16,padding:24,marginBottom:24,textAlign:"center" }}>
                  <div style={{ fontSize:40,marginBottom:12 }}>✅</div>
                  <div style={{ fontSize:16,fontWeight:700,color:"#34d399",marginBottom:6 }}>{prospectName} added!</div>
                  <div style={{ fontSize:13,color:S.muted,marginBottom:16 }}>{prospectEmail} · {prospectCompany}</div>
                  <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
                    <div style={{ padding:"10px 16px",borderRadius:10,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)" }}>
                      <div style={{ fontSize:18,fontWeight:800,color:S.accent,fontFamily:"Syne,sans-serif" }}>85</div>
                      <div style={{ fontSize:10,color:S.faint }}>AI Score</div>
                    </div>
                    <div style={{ padding:"10px 16px",borderRadius:10,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)" }}>
                      <div style={{ fontSize:14,fontWeight:700,color:S.accent }}>High</div>
                      <div style={{ fontSize:10,color:S.faint }}>Intent</div>
                    </div>
                    <div style={{ padding:"10px 16px",borderRadius:10,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)" }}>
                      <div style={{ fontSize:14,fontWeight:700,color:"#34d399" }}>Email</div>
                      <div style={{ fontSize:10,color:S.faint }}>Best Channel</div>
                    </div>
                  </div>
                </div>
                <button onClick={goNext}
                  style={{ width:"100%",padding:"14px",borderRadius:12,background:S.accent,border:"none",color:"#050505",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"Syne,sans-serif" }}>
                  Meet Your AI Agents →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4 ── AI Agents Preview */}
        {step===4&&(
          <div>
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ fontSize:48,marginBottom:16 }}>⚡</div>
              <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:8 }}>Your AI team is ready</h2>
              <p style={{ fontSize:14,color:S.muted }}>10 specialized agents working 24/7 — Apollo has 1 basic assistant</p>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24 }}>
              {[
                { name:"SDR Agent Alpha",    icon:"⚡", color:"#C8FF00", desc:"Books meetings while you sleep" },
                { name:"Email Coach",         icon:"✉️", color:"#818cf8", desc:"Turns emails into reply magnets" },
                { name:"Deal Analyzer",       icon:"📊", color:"#f59e0b", desc:"Flags dying deals before too late" },
                { name:"Objection Handler",   icon:"🛡️", color:"#34d399", desc:"Turns NO into not yet" },
                { name:"Cold Call Writer",    icon:"📞", color:"#f59e0b", desc:"Perfect opening 30 seconds" },
                { name:"LinkedIn Writer",     icon:"💼", color:"#60a5fa", desc:"40%+ connection acceptance rate" },
                { name:"Meeting Summarizer",  icon:"📝", color:"#a78bfa", desc:"Never miss a follow-up" },
                { name:"Proposal Writer",     icon:"📄", color:"#a78bfa", desc:"Closes deals in 45 seconds" },
                { name:"Competitor Intel",    icon:"🎯", color:"#f472b6", desc:"Win when prospects mention Apollo" },
                { name:"Revenue Forecaster",  icon:"📈", color:"#34d399", desc:"CFO-ready forecasts" },
              ].map((agent,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,transition:"all 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=`${agent.color}44`; (e.currentTarget as HTMLDivElement).style.background=`${agent.color}08`; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)"; }}>
                  <span style={{ fontSize:20 }}>{agent.icon}</span>
                  <div>
                    <div style={{ fontSize:12,fontWeight:700,color:S.text }}>{agent.name}</div>
                    <div style={{ fontSize:10,color:agent.color,fontStyle:"italic" }}>{agent.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.15)",borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:12,color:S.muted,lineHeight:1.6 }}>
              🎉 <span style={{ color:S.accent,fontWeight:700 }}>Free plan:</span> 5 AI agent runs/day · Upgrade to Pro for unlimited runs
            </div>

            <div style={{ display:"flex",gap:10 }}>
              <button onClick={goPrev}
                style={{ padding:"13px 20px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                ← Back
              </button>
              <button onClick={goNext}
                style={{ flex:1,padding:"13px",borderRadius:12,background:S.accent,border:"none",color:"#050505",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"Syne,sans-serif" }}>
                Almost Done →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5 ── Done */}
        {step===5&&(
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:72,marginBottom:24,animation:"float 2s ease-in-out infinite" }}>🏆</div>
            <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:32,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:12 }}>
              You're all set, {firstName}!
            </h2>
            <p style={{ fontSize:15,color:S.muted,lineHeight:1.7,marginBottom:32,maxWidth:400,margin:"0 auto 32px" }}>
              SalesForge AI is configured and your agents are ready. Let's go beat Apollo.
            </p>

            {/* Quick start checklist */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:20,marginBottom:28,textAlign:"left" }}>
              <div style={{ fontSize:12,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:14 }}>Quick Start Checklist</div>
              {[
                { label:"Add prospects", done:prospectAdded, href:"/dashboard/prospects", icon:"👥" },
                { label:"Run an AI agent", done:false, href:"/dashboard/agents", icon:"⚡" },
                { label:"Create a sequence", done:false, href:"/dashboard/sequences", icon:"✉️" },
                { label:"Check analytics", done:false, href:"/dashboard/analytics", icon:"📊" },
              ].map((item,i)=>(
                <a key={i} href={item.href}
                  style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,marginBottom:6,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,textDecoration:"none",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(200,255,0,0.2)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor=S.lineSoft; }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <span style={{ flex:1,fontSize:13,color:item.done?S.text:S.muted,fontWeight:item.done?600:400 }}>{item.label}</span>
                  {item.done
                    ? <span style={{ fontSize:13,color:"#34d399",fontWeight:700 }}>✓ Done</span>
                    : <span style={{ fontSize:12,color:S.faint }}>→</span>}
                </a>
              ))}
            </div>

            <button onClick={completeOnboarding} disabled={completing}
              style={{ width:"100%",padding:"16px",borderRadius:14,background:completing?"rgba(200,255,0,0.6)":S.accent,border:"none",color:"#050505",fontSize:16,fontWeight:800,cursor:completing?"not-allowed":"pointer",fontFamily:"Syne,sans-serif",boxShadow:"0 8px 32px rgba(200,255,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all 0.2s" }}>
              {completing
                ?<><span style={{ width:18,height:18,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Taking you to dashboard...</>
                :"🚀 Go to Dashboard →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
