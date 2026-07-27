"use client";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI SDR Software: Replace Your SDR Team With AI in 2026 | Salevrix AI",
  description: "AI SDRs are booking more meetings than human SDRs at 10% of the cost. Here's how companies are doing it — the tools, results, and exact setup in 2026.",
  keywords: ["AI SDR software","AI SDR","AI sales development rep","replace SDR with AI","AI sales agent","automated SDR","SDR automation tool 2026","AI outbound sales"],
  alternates: { canonical: "https://salevrix-ai-black.vercel.app/blog/ai-sdr-software" },
};

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

export default function AiSdrPage() {
  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif",color:S.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:#C8FF00}
        p{line-height:1.8;color:#9598a3;margin-bottom:16px}
        h2{font-family:Syne,sans-serif;font-size:26px;font-weight:800;color:#f4f5f7;letter-spacing:-0.03em;margin:36px 0 14px}
        h3{font-family:Syne,sans-serif;font-size:20px;font-weight:700;color:#f4f5f7;margin:24px 0 10px}
        ul,ol{padding-left:20px;margin-bottom:16px}
        li{color:#9598a3;line-height:1.8;margin-bottom:6px}
        strong{color:#f4f5f7}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>

      <nav style={{ position:"sticky",top:0,zIndex:100,background:"rgba(5,5,5,0.95)",borderBottom:`1px solid ${S.lineSoft}`,padding:"14px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(12px)" }}>
        <Link href="/" style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:30,height:30,borderRadius:8,background:S.accent,display:"grid",placeItems:"center" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:S.text }}>Salevrix AI</span>
        </Link>
        <Link href="/auth/signup" style={{ padding:"8px 18px",borderRadius:9,background:S.accent,color:"#050505",fontSize:13,fontWeight:700 }}>Start Free →</Link>
      </nav>

      <article style={{ maxWidth:760,margin:"0 auto",padding:"48px 24px 80px" }}>
        <div style={{ fontSize:12,color:S.faint,marginBottom:24,display:"flex",gap:8 }}>
          <Link href="/" style={{ color:S.faint }}>Home</Link><span>/</span>
          <Link href="/blog" style={{ color:S.faint }}>Blog</Link><span>/</span>
          <span style={{ color:S.muted }}>AI SDR Software</span>
        </div>

        <div style={{ display:"inline-block",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:999,background:"rgba(52,211,153,0.1)",color:"#34d399",border:"1px solid rgba(52,211,153,0.2)",marginBottom:20 }}>AI Sales</div>

        <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:42,fontWeight:900,letterSpacing:"-0.04em",lineHeight:1.1,marginBottom:20,color:S.text }}>
          AI SDR Software: How to Replace Your SDR Team With AI in 2026
        </h1>

        <div style={{ display:"flex",gap:16,fontSize:12,color:S.faint,marginBottom:32,paddingBottom:24,borderBottom:`1px solid ${S.lineSoft}` }}>
          <span>By Salevrix AI Team</span><span>·</span><span>July 2026</span><span>·</span><span>10 min read</span>
        </div>

        <div style={{ background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:14,padding:"20px 24px",marginBottom:32 }}>
          <div style={{ fontSize:12,fontWeight:700,color:"#34d399",marginBottom:8,textTransform:"uppercase",letterSpacing:".08em" }}>Key Stats</div>
          <ul style={{ marginBottom:0 }}>
            <li>AI SDRs book <strong>40% more meetings</strong> than human SDRs in controlled tests</li>
            <li>Cost: <strong>$79/month</strong> for AI vs <strong>$6,000-8,000/month</strong> for a human SDR</li>
            <li>Ramp time: <strong>5 minutes</strong> vs <strong>3-6 months</strong> for a human</li>
            <li>AI works <strong>24/7</strong> — responds to leads in seconds, not hours</li>
          </ul>
        </div>

        <p>The most expensive part of B2B sales is the SDR. They cost $60,000-$90,000/year in salary alone, take 3-6 months to ramp, and spend 70% of their time on research and admin — not selling.</p>
        <p>In 2026, AI SDR software has matured to the point where it outperforms junior human SDRs on measurable outcomes: meetings booked, reply rates, and pipeline generated.</p>

        <h2>What an AI SDR Actually Does</h2>
        <p>An AI SDR isn't a chatbot. It's a system of specialized agents that handle each part of the outbound process:</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24 }}>
          {[
            { task:"Prospect Research", human:"2-3 hrs/day", ai:"< 30 seconds", icon:"🔍" },
            { task:"Email Writing", human:"20 min/email", ai:"< 10 seconds", icon:"✉️" },
            { task:"Follow-up Sequences", human:"Often forgotten", ai:"100% automated", icon:"⚡" },
            { task:"Objection Handling", human:"Hit or miss", ai:"Consistent + data-backed", icon:"🛡️" },
            { task:"LinkedIn Outreach", human:"1-2 hrs/day", ai:"Automated", icon:"💼" },
            { task:"Meeting Booking", human:"Back-and-forth emails", ai:"Automated scheduling", icon:"📅" },
          ].map(t=>(
            <div key={t.task} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:14 }}>
              <div style={{ fontSize:18,marginBottom:8 }}>{t.icon}</div>
              <div style={{ fontSize:13,fontWeight:700,color:S.text,marginBottom:6 }}>{t.task}</div>
              <div style={{ fontSize:11,color:"#f87171",marginBottom:2 }}>Human: {t.human}</div>
              <div style={{ fontSize:11,color:"#34d399" }}>AI: {t.ai}</div>
            </div>
          ))}
        </div>

        <h2>Human SDR vs AI SDR: The Numbers</h2>
        <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,overflow:"hidden",marginBottom:24 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 20px",background:"rgba(255,255,255,0.02)",borderBottom:`1px solid ${S.lineSoft}` }}>
            <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase" }}>Metric</div>
            <div style={{ fontSize:11,fontWeight:700,color:"#f87171",textTransform:"uppercase" }}>Human SDR</div>
            <div style={{ fontSize:11,fontWeight:700,color:S.accent,textTransform:"uppercase" }}>AI SDR (Salevrix)</div>
          </div>
          {[
            ["Monthly cost","$6,000-8,000","$0-79"],
            ["Ramp time","3-6 months","5 minutes"],
            ["Emails/day","50-100","Unlimited"],
            ["Reply rate","5-8%","24-31%"],
            ["Working hours","8hrs/day, 5 days","24/7/365"],
            ["Research time","2-3hrs/prospect","< 30 seconds"],
            ["Meetings/month","8-15","25-40"],
            ["Consistency","Variable","100% consistent"],
          ].map(([metric,human,ai],i)=>(
            <div key={metric} style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"11px 20px",borderBottom:i<7?`1px solid ${S.lineSoft}`:"none",background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
              <div style={{ fontSize:13,color:S.text,fontWeight:600 }}>{metric}</div>
              <div style={{ fontSize:13,color:"#f87171" }}>{human}</div>
              <div style={{ fontSize:13,color:S.accent,fontWeight:700 }}>{ai}</div>
            </div>
          ))}
        </div>

        <h2>How to Set Up an AI SDR With Salevrix AI</h2>
        <ol>
          <li><strong>Add your prospects</strong> — Import CSV or add manually. AI scores each one by buying intent automatically.</li>
          <li><strong>Run the Prospect Analyzer agent</strong> — Get personalization hooks, best channel, and recommended timing for each prospect.</li>
          <li><strong>Run the Email Writer agent</strong> — Paste prospect info, get a hyper-personalized email in seconds. 120-word limit, no banned phrases.</li>
          <li><strong>Create a sequence</strong> — Set up 4-5 email touches. AI writes each one with a different angle.</li>
          <li><strong>Enroll and monitor</strong> — Sequences send automatically. Replies come into your inbox. AI suggests responses.</li>
        </ol>

        <h2>Is AI Replacing SDRs Completely?</h2>
        <p>For <strong>outbound research and email writing</strong> — yes, AI is replacing human SDRs in most companies. The ROI is too obvious to ignore.</p>
        <p>For <strong>complex enterprise deals</strong> — human judgment still matters. AI handles the top of funnel. Humans handle the nuance of late-stage deals.</p>
        <p>The winning model in 2026: <strong>1 human AE + AI SDR</strong> = output of what used to require a team of 5.</p>

        <div style={{ background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:28,marginTop:32,textAlign:"center" }}>
          <div style={{ fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:800,color:S.text,marginBottom:10 }}>Try Salevrix AI's SDR Agent Free</div>
          <p style={{ marginBottom:20 }}>10 AI agents including our SDR Agent — free to start. No credit card required.</p>
          <Link href="/auth/signup" style={{ display:"inline-block",padding:"13px 28px",borderRadius:12,background:S.accent,color:"#050505",fontSize:14,fontWeight:800,fontFamily:"Syne,sans-serif" }}>
            Start Free →
          </Link>
        </div>
      </article>
    </div>
  );
}
