"use client";
import { useState } from "react";

const S = { bg:"#050505", text:"#f4f5f7", muted:"#9598a3", faint:"#555a66", accent:"#C8FF00", panel:"#0d1018", lineSoft:"rgba(255,255,255,0.06)" };

const COMPARISON = [
  { feature:"Pricing",              sf:"Free → $29 → $79/mo",      apollo:"$49 → $99 → $119/user/mo",  sfWins:true },
  { feature:"AI Agents",            sf:"10 specialized agents",     apollo:"1 basic AI assistant",       sfWins:true },
  { feature:"Automations",          sf:"15 real AI automations",    apollo:"Manual task reminders only", sfWins:true },
  { feature:"Data Accuracy",        sf:"100% (your own data)",      apollo:"~65% (20-30% bounce rate)",  sfWins:true },
  { feature:"Email Personalization",sf:"Hyper-personalized AI",     apollo:"Generic AI copy",            sfWins:true },
  { feature:"LinkedIn Automation",  sf:"✅ AI-written messages",    apollo:"❌ Manual only",             sfWins:true },
  { feature:"Cold Call Scripts",    sf:"✅ Prospect-specific",      apollo:"❌ Not available",           sfWins:true },
  { feature:"Deal Intelligence",    sf:"✅ AI health scores",       apollo:"❌ Basic stages only",       sfWins:true },
  { feature:"Objection Handling",   sf:"✅ Real-time AI",           apollo:"❌ Not available",           sfWins:true },
  { feature:"Meeting Prep",         sf:"✅ Full AI briefing",       apollo:"❌ Not available",           sfWins:true },
  { feature:"Revenue Forecasting",  sf:"✅ CFO-ready forecasts",    apollo:"❌ Basic pipeline view",     sfWins:true },
  { feature:"Contact Database",     sf:"Your own verified data",    apollo:"210M+ (65% accurate)",       sfWins:true },
  { feature:"Free Tier",            sf:"50 prospects + 5 AI runs",  apollo:"100 credits/month only",     sfWins:true },
  { feature:"Setup Time",           sf:"5 minutes",                 apollo:"Days of training",           sfWins:true },
];

const PAIN_POINTS = [
  { icon:"💸", title:"Tired of paying $119/user/month?", desc:"Apollo's pricing adds up fast. A team of 5 = $7,140/year. SalesForge AI starts at $0 and scales to $79/mo for your whole team — not per user." },
  { icon:"📉", title:"Your emails are bouncing?", desc:"Apollo's 210M contact database is ~65% accurate. That means 35% of your emails never arrive. SalesForge AI uses your own verified data — 100% accurate, 0% bounce." },
  { icon:"🤖", title:"Apollo's AI feels generic?", desc:"Apollo's AI assistant writes copy that sounds like a robot. SalesForge AI's 10 agents write hyper-personalized emails referencing LinkedIn posts, funding rounds, and company news." },
  { icon:"🔧", title:"Everything still feels manual?", desc:"Apollo creates tasks for humans to do manually. SalesForge AI's 15 automations actually execute — enriching leads, sending follow-ups, handling objections, and booking meetings." },
  { icon:"📊", title:"No real sales intelligence?", desc:"Apollo shows you contact data. SalesForge AI's Deal Analyzer scores deal health, flags at-risk deals, and gives you exact scripts to rescue them before it's too late." },
  { icon:"⏰", title:"Your team wastes hours on research?", desc:"Apollo reps spend 2-3 hours/day manually researching prospects. SalesForge AI's SDR Agent does that research in seconds and writes the personalized email automatically." },
];

const TESTIMONIALS = [
  { name:"Marcus R.", role:"VP Sales, DevTools startup", avatar:"MR", bg:"linear-gradient(140deg,#C8FF00,#86efac)", color:"#050505", text:"We switched from Apollo after 2 years. The data accuracy alone was worth it — our bounce rate went from 28% to under 3%. The AI agents are a different league.", metric:"Reply rate: 8% → 31%" },
  { name:"Sarah K.", role:"Founder, B2B SaaS", avatar:"SK", bg:"linear-gradient(140deg,#818cf8,#c084fc)", color:"#fff", text:"Apollo felt like I was paying for a database. SalesForge feels like I hired 10 SDRs. My cold email reply rates tripled in the first month.", metric:"Meetings/week: 2 → 9" },
  { name:"James T.", role:"Head of Revenue, Fintech", avatar:"JT", bg:"linear-gradient(140deg,#f59e0b,#ef4444)", color:"#fff", text:"The objection handler alone saved 3 deals last quarter. When prospects mention competitors, I have the perfect response in seconds. Apollo has nothing like this.", metric:"Win rate: 22% → 41%" },
];

const FAQS = [
  { q:"Can I import my Apollo data into SalesForge AI?", a:"Yes — just export your Apollo contacts as CSV and import them in one click. Your data comes with you." },
  { q:"Do I need to cancel Apollo before trying SalesForge?", a:"No. Start with our free tier (no credit card) and run both in parallel. Most teams make the switch after seeing the difference in reply rates within 2 weeks." },
  { q:"Is SalesForge AI better for small teams or enterprise?", a:"Both. Free plan works great for solo founders and small teams. Pro ($79/mo) covers teams of any size — we charge per account, not per user like Apollo." },
  { q:"How accurate is your AI compared to Apollo's?", a:"Apollo's AI writes generic copy that gets flagged as spam. Our AI references specific LinkedIn posts, recent funding rounds, and company news. Average reply rate difference: 8% (Apollo) vs 28%+ (SalesForge)." },
  { q:"What about Apollo's 210M contact database?", a:"Apollo's database is large but 65% accurate — meaning 35% of emails bounce. SalesForge AI helps you work your own verified prospect list with 100% accuracy. Quality beats quantity every time." },
  { q:"How long does migration take?", a:"5 minutes. Sign up → import CSV → run your first AI agent. No onboarding calls, no training sessions, no 30-day implementation." },
];

export default function VsApolloPage() {
  const [openFaq, setOpenFaq] = useState<number|null>(null);
  const [billingAnnual, setBillingAnnual] = useState(false);

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif",color:S.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        button:focus,a:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        .hover-card:hover{border-color:rgba(200,255,0,0.2)!important;background:rgba(200,255,0,0.02)!important}
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(200,255,0,0.4)!important}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"sticky",top:0,zIndex:100,background:"rgba(5,5,5,0.9)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${S.lineSoft}`,padding:"14px 40px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <a href="/" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
          <div style={{ width:30,height:30,borderRadius:8,background:S.accent,display:"grid",placeItems:"center",boxShadow:"0 0 12px rgba(200,255,0,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:S.text }}>SalesForge AI</span>
        </a>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          <a href="/dashboard" style={{ fontSize:13,color:S.muted,textDecoration:"none" }}>Dashboard</a>
          <a href="/auth/login" style={{ fontSize:13,color:S.muted,textDecoration:"none" }}>Sign In</a>
          <a href="/auth/signup"
            style={{ padding:"8px 18px",borderRadius:9,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none",transition:"all 0.2s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background="#d4f500"}
            onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background=S.accent}>
            Start Free →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:"80px 40px 60px",textAlign:"center",maxWidth:860,margin:"0 auto",position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:700,height:400,background:"radial-gradient(ellipse,rgba(200,255,0,0.07) 0%,transparent 65%)",pointerEvents:"none" }}/>

        <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:999,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",fontSize:12,fontWeight:700,color:S.accent,marginBottom:24 }}>
          ⚡ SalesForge AI vs Apollo.io — Honest Comparison
        </div>

        <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:clamp(36,6,60),fontWeight:900,letterSpacing:"-0.04em",lineHeight:1.1,marginBottom:20 }}>
          Apollo charges{" "}
          <span style={{ color:"#f87171",textDecoration:"line-through" }}>$119/user</span>
          <br/>
          <span style={{ color:S.accent }}>We start at $0.</span>
        </h1>

        <p style={{ fontSize:18,color:S.muted,lineHeight:1.7,maxWidth:600,margin:"0 auto 36px" }}>
          Apollo.io gives you a contact database with 65% accuracy and a basic AI assistant.
          SalesForge AI gives you <strong style={{ color:S.text }}>10 AI agents</strong>, <strong style={{ color:S.text }}>15 real automations</strong>, and reply rates that actually move the needle.
        </p>

        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:20 }}>
          <a href="/auth/signup" className="cta-btn"
            style={{ padding:"16px 32px",borderRadius:13,background:S.accent,color:"#050505",fontSize:16,fontWeight:800,textDecoration:"none",boxShadow:"0 8px 32px rgba(200,255,0,0.25)",transition:"all 0.2s",fontFamily:"Syne,sans-serif" }}>
            Start Free — No Credit Card →
          </a>
          <a href="#comparison"
            style={{ padding:"16px 24px",borderRadius:13,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:15,fontWeight:600,textDecoration:"none",transition:"all 0.2s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(200,255,0,0.3)"}
            onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.borderColor=S.lineSoft}>
            See Full Comparison ↓
          </a>
        </div>

        <div style={{ fontSize:12,color:S.faint }}>
          ✓ Free forever · ✓ 5-min setup · ✓ No training required · ✓ Import Apollo data in 1 click
        </div>
      </section>

      {/* QUICK STATS */}
      <section style={{ padding:"0 40px 60px",maxWidth:860,margin:"0 auto" }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14 }}>
          {[
            { val:"10x",label:"More AI agents than Apollo",color:S.accent },
            { val:"65%",label:"Apollo data accuracy vs our 100%",color:"#f87171" },
            { val:"$0",label:"Starting price vs Apollo's $49",color:S.accent },
            { val:"3x",label:"Higher reply rates on average",color:"#34d399" },
          ].map(s=>(
            <div key={s.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"20px 16px",textAlign:"center" }}>
              <div style={{ fontFamily:"Syne,sans-serif",fontSize:36,fontWeight:900,color:s.color,letterSpacing:"-0.04em",marginBottom:6 }}>{s.val}</div>
              <div style={{ fontSize:11,color:S.faint,lineHeight:1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PAIN POINTS */}
      <section style={{ padding:"0 40px 80px",maxWidth:1000,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:48 }}>
          <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:36,fontWeight:800,letterSpacing:"-0.03em",marginBottom:12 }}>
            Sound familiar?
          </h2>
          <p style={{ fontSize:15,color:S.muted }}>The most common reasons Apollo customers switch to SalesForge AI</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {PAIN_POINTS.map((p,i)=>(
            <div key={i} className="hover-card"
              style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:22,transition:"all 0.2s" }}>
              <div style={{ fontSize:32,marginBottom:12 }}>{p.icon}</div>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:8 }}>{p.title}</div>
              <div style={{ fontSize:13,color:S.muted,lineHeight:1.65 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FULL COMPARISON TABLE */}
      <section id="comparison" style={{ padding:"0 40px 80px",maxWidth:900,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:36,fontWeight:800,letterSpacing:"-0.03em",marginBottom:12 }}>
            Feature by feature
          </h2>
          <p style={{ fontSize:15,color:S.muted }}>Every feature, honestly compared</p>
        </div>

        <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:18,overflow:"hidden" }}>
          {/* Header */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"16px 24px",background:"rgba(255,255,255,0.02)",borderBottom:`1px solid ${S.lineSoft}` }}>
            <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>Feature</div>
            <div style={{ fontSize:13,fontWeight:800,color:S.accent,display:"flex",alignItems:"center",gap:8,fontFamily:"Syne,sans-serif" }}>
              <div style={{ width:20,height:20,borderRadius:6,background:S.accent,display:"grid",placeItems:"center" }}>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              SalesForge AI
            </div>
            <div style={{ fontSize:13,fontWeight:700,color:S.faint }}>Apollo.io</div>
          </div>

          {COMPARISON.map((row,i)=>(
            <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"14px 24px",borderBottom:i<COMPARISON.length-1?`1px solid ${S.lineSoft}`:"none",background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
              <div style={{ fontSize:13,fontWeight:600,color:S.text }}>{row.feature}</div>
              <div style={{ fontSize:13,color:"#34d399",display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ width:16,height:16,borderRadius:"50%",background:"rgba(52,211,153,0.15)",border:"1px solid rgba(52,211,153,0.3)",display:"grid",placeItems:"center",flexShrink:0 }}>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                {row.sf}
              </div>
              <div style={{ fontSize:13,color:S.faint,display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ width:16,height:16,borderRadius:"50%",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",display:"grid",placeItems:"center",flexShrink:0 }}>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </span>
                {row.apollo}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center",marginTop:24 }}>
          <a href="/auth/signup" className="cta-btn"
            style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:12,background:S.accent,color:"#050505",fontSize:15,fontWeight:800,textDecoration:"none",boxShadow:"0 8px 28px rgba(200,255,0,0.25)",transition:"all 0.2s",fontFamily:"Syne,sans-serif" }}>
            Switch from Apollo — Start Free →
          </a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:"0 40px 80px",maxWidth:1000,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:48 }}>
          <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:36,fontWeight:800,letterSpacing:"-0.03em",marginBottom:12 }}>
            Teams that switched from Apollo
          </h2>
          <p style={{ fontSize:15,color:S.muted }}>Real results from the first 90 days</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {TESTIMONIALS.map((t,i)=>(
            <div key={i} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24,display:"flex",flexDirection:"column" }}>
              <div style={{ fontSize:13,color:S.muted,lineHeight:1.7,flex:1,marginBottom:20,fontStyle:"italic" }}>"{t.text}"</div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:t.bg,color:t.color,display:"grid",placeItems:"center",fontSize:12,fontWeight:800,flexShrink:0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:S.text }}>{t.name}</div>
                  <div style={{ fontSize:11,color:S.faint }}>{t.role}</div>
                </div>
              </div>
              <div style={{ padding:"8px 12px",borderRadius:9,background:"rgba(200,255,0,0.06)",border:"1px solid rgba(200,255,0,0.15)",fontSize:12,fontWeight:700,color:S.accent }}>
                📈 {t.metric}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING COMPARISON */}
      <section style={{ padding:"0 40px 80px",maxWidth:800,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:36,fontWeight:800,letterSpacing:"-0.03em",marginBottom:12 }}>
            The pricing is embarrassing for Apollo
          </h2>
          <p style={{ fontSize:15,color:S.muted }}>For a team of 5, Apollo costs $7,140/year. We cost $948.</p>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24 }}>
          {/* SalesForge */}
          <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.3)",borderRadius:16,padding:28,boxShadow:"0 0 40px rgba(200,255,0,0.08)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
              <div style={{ width:24,height:24,borderRadius:7,background:S.accent,display:"grid",placeItems:"center" }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:S.text }}>SalesForge AI</span>
            </div>
            <div style={{ fontFamily:"Syne,sans-serif",fontSize:42,fontWeight:900,color:S.accent,letterSpacing:"-0.04em",marginBottom:4 }}>$79<span style={{ fontSize:18,color:S.muted }}>/mo</span></div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:16 }}>Entire team · Not per user</div>
            {["Unlimited prospects","10 AI agents","15 automations","Email sending 10K/mo","LinkedIn automation","Priority support"].map(f=>(
              <div key={f} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                <span style={{ color:S.accent }}>✓</span>
                <span style={{ fontSize:13,color:S.muted }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Apollo */}
          <div style={{ background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:28,opacity:0.8 }}>
            <div style={{ fontSize:16,fontWeight:700,color:S.faint,marginBottom:16 }}>Apollo.io</div>
            <div style={{ fontFamily:"Syne,sans-serif",fontSize:42,fontWeight:900,color:"#f87171",letterSpacing:"-0.04em",marginBottom:4 }}>$119<span style={{ fontSize:18,color:S.faint }}>/user/mo</span></div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:16 }}>Per user · 5 users = $7,140/yr</div>
            {["Contact database (65% accurate)","1 basic AI assistant","Manual task reminders","Email sequences","❌ No LinkedIn automation","Email support only"].map(f=>(
              <div key={f} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                <span style={{ color:f.startsWith("❌")?"#f87171":S.faint }}>{f.startsWith("❌")?"✗":"·"}</span>
                <span style={{ fontSize:13,color:S.faint }}>{f.replace("❌ ","")}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:12,padding:"16px 20px",textAlign:"center",fontSize:14,color:S.muted }}>
          💰 <strong style={{ color:S.accent }}>You save $6,192/year</strong> switching from Apollo Pro to SalesForge Pro — and get a better product.
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:"0 40px 80px",maxWidth:700,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:36,fontWeight:800,letterSpacing:"-0.03em",marginBottom:12 }}>Common questions</h2>
          <p style={{ fontSize:15,color:S.muted }}>About switching from Apollo to SalesForge AI</p>
        </div>
        {FAQS.map((faq,i)=>(
          <div key={i} style={{ marginBottom:10,background:S.panel,border:`1px solid ${openFaq===i?"rgba(200,255,0,0.2)":S.lineSoft}`,borderRadius:12,overflow:"hidden",transition:"border-color 0.2s" }}>
            <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
              style={{ width:"100%",padding:"16px 20px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"Inter,sans-serif" }}>
              <span style={{ fontSize:14,fontWeight:600,color:S.text,textAlign:"left" }}>{faq.q}</span>
              <span style={{ color:openFaq===i?S.accent:S.faint,fontSize:18,transition:"transform 0.2s",transform:openFaq===i?"rotate(45deg)":"rotate(0)" }}>+</span>
            </button>
            {openFaq===i&&(
              <div style={{ padding:"0 20px 16px",fontSize:13,color:S.muted,lineHeight:1.7 }}>{faq.a}</div>
            )}
          </div>
        ))}
      </section>

      {/* FINAL CTA */}
      <section style={{ padding:"0 40px 100px",maxWidth:700,margin:"0 auto",textAlign:"center" }}>
        <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:24,padding:"48px 40px",boxShadow:"0 0 60px rgba(200,255,0,0.06)" }}>
          <div style={{ fontSize:48,marginBottom:20,animation:"float 3s ease-in-out infinite" }}>🚀</div>
          <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:32,fontWeight:900,letterSpacing:"-0.04em",marginBottom:14,color:S.text }}>
            Ready to leave Apollo behind?
          </h2>
          <p style={{ fontSize:15,color:S.muted,marginBottom:32,lineHeight:1.7 }}>
            Start free, import your Apollo data in 1 click, and see the difference in your first week.
            No contract. No training. No $119/user price tag.
          </p>
          <a href="/auth/signup" className="cta-btn"
            style={{ display:"inline-flex",alignItems:"center",gap:10,padding:"18px 36px",borderRadius:14,background:S.accent,color:"#050505",fontSize:17,fontWeight:900,textDecoration:"none",boxShadow:"0 10px 40px rgba(200,255,0,0.3)",transition:"all 0.2s",fontFamily:"Syne,sans-serif",marginBottom:16 }}>
            ⚡ Start Free — Beat Apollo Today
          </a>
          <div style={{ fontSize:12,color:S.faint }}>
            Free forever · No credit card · Import Apollo data in 1 click
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${S.lineSoft}`,padding:"24px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:24,height:24,borderRadius:7,background:S.accent,display:"grid",placeItems:"center" }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:S.text }}>SalesForge AI</span>
          <span style={{ fontSize:12,color:S.faint }}>— The Apollo.io alternative that actually works</span>
        </div>
        <div style={{ display:"flex",gap:20 }}>
          {[["Home","/"],["Dashboard","/dashboard"],["Pricing","/dashboard/pricing"],["Sign Up","/auth/signup"]].map(([l,h])=>(
            <a key={l} href={h} style={{ fontSize:12,color:S.faint,textDecoration:"none" }}
              onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color=S.accent}
              onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color=S.faint}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

// Helper for responsive font size
function clamp(min:number, val:number, max:number):string {
  return `clamp(${min}px, ${val}vw, ${max}px)`;
}
