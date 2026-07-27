"use client";
import Link from "next/link";


const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

export default function ColdEmailGuidePage() {
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

      {/* Nav */}
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
          <span style={{ color:S.muted }}>Cold Email Automation Guide</span>
        </div>

        <div style={{ display:"inline-block",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:999,background:"rgba(129,140,248,0.1)",color:"#818cf8",border:"1px solid rgba(129,140,248,0.2)",marginBottom:20 }}>Guide</div>

        <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:42,fontWeight:900,letterSpacing:"-0.04em",lineHeight:1.1,marginBottom:20,color:S.text }}>
          Cold Email Automation: The Complete 2026 Guide
        </h1>

        <div style={{ display:"flex",gap:16,fontSize:12,color:S.faint,marginBottom:32,paddingBottom:24,borderBottom:`1px solid ${S.lineSoft}` }}>
          <span>By Salevrix AI Team</span><span>·</span><span>July 2026</span><span>·</span><span>12 min read</span>
        </div>

        <div style={{ background:"rgba(129,140,248,0.05)",border:"1px solid rgba(129,140,248,0.2)",borderRadius:14,padding:"20px 24px",marginBottom:32 }}>
          <div style={{ fontSize:12,fontWeight:700,color:"#818cf8",marginBottom:8,textTransform:"uppercase",letterSpacing:".08em" }}>What you'll learn</div>
          <ul style={{ marginBottom:0 }}>
            <li>Why most cold email automation fails (and how to fix it)</li>
            <li>The 5-step framework for 28%+ reply rates</li>
            <li>Exact email templates that work in 2026</li>
            <li>How to set up AI-powered cold email automation</li>
            <li>The tools top SDR teams use</li>
          </ul>
        </div>

        <p>The average cold email reply rate is <strong>3%</strong>. Top performers hit <strong>28%+</strong>. The difference isn't the tool — it's the system.</p>
        <p>This guide covers the exact framework that B2B sales teams use to automate cold email outreach at scale while keeping reply rates above 20%.</p>

        <h2>Why Cold Email Automation Usually Fails</h2>
        <p>Most teams automate the wrong things. They automate the sending — but not the personalization, the timing, or the follow-up logic. The result: higher volume, same bad results.</p>
        <p>The top 3 reasons cold email automation fails:</p>
        <ul>
          <li><strong>Generic copy:</strong> AI writes "I noticed you're in the SaaS space" — prospects delete instantly.</li>
          <li><strong>Bad data:</strong> 35% of emails bounce because contact databases are outdated.</li>
          <li><strong>No personalization at scale:</strong> Manual research doesn't scale, so reps skip it.</li>
        </ul>

        <h2>The 5-Step Cold Email Automation Framework</h2>

        {[
          { step:1, title:"Build a Verified Prospect List", color:"#C8FF00", content:"Never buy a list. Build your own verified data from LinkedIn, company websites, and intent signals. Verified data = 0% bounce rate. Bought data = 20-35% bounce rate that destroys your sender reputation." },
          { step:2, title:"AI-Score Every Prospect", color:"#818cf8", content:"Not all prospects are equal. Use AI to score each prospect on buying intent (recent hiring, funding, competitor switching) before writing a single email. Only contact high-intent prospects first — your reply rates will 3x immediately." },
          { step:3, title:"Write Hyper-Personalized Openers", color:"#34d399", content:"The first line of your email determines everything. It must be so specific that the prospect thinks 'how did they know that?' — reference a LinkedIn post they wrote, a funding round they closed, or a hire they just made. AI can do this research automatically." },
          { step:4, title:"Automate the Follow-Up Sequence", color:"#f59e0b", content:"80% of replies come from follow-ups 2-5. Most reps give up after 1 email. Automate 4-5 touches over 14 days, each with a different angle: social proof, competitor angle, breakup email. Never say 'just following up'." },
          { step:5, title:"Handle Replies with AI", color:"#f472b6", content:"When prospects reply with objections, AI can draft the perfect response in seconds — referencing their specific concern, reframing it with data, and ending with the next step. Speed to reply is a massive conversion factor." },
        ].map(s=>(
          <div key={s.step} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:22,marginBottom:14,display:"flex",gap:16 }}>
            <div style={{ width:40,height:40,borderRadius:11,background:`${s.color}15`,border:`1px solid ${s.color}30`,display:"grid",placeItems:"center",fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:18,color:s.color,flexShrink:0 }}>{s.step}</div>
            <div>
              <h3 style={{ margin:"0 0 8px",fontSize:17,color:S.text }}>{s.title}</h3>
              <p style={{ marginBottom:0,fontSize:13 }}>{s.content}</p>
            </div>
          </div>
        ))}

        <h2>Cold Email Template That Gets 31% Reply Rate</h2>
        <div style={{ background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:22,marginBottom:24,fontFamily:"monospace" }}>
          <div style={{ fontSize:12,fontWeight:700,color:S.faint,marginBottom:12,textTransform:"uppercase",letterSpacing:".08em" }}>Subject: Saw your post about {"{{topic}}"}</div>
          <pre style={{ fontSize:13,color:S.muted,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif" }}>{`Hi {{firstName}},

Your post about {{specific_topic}} hit close to home — especially {{specific_insight}}.

Most {{role}}s I talk to at {{company_stage}} companies hit the same wall: {{pain_point}}. The research alone eats 2-3 hours per rep per day.

We helped {{similar_company}} cut that to 20 minutes using AI that does the research automatically. They went from 3 meetings/week to 14 in 30 days.

Worth 15 minutes to see if the same applies to {{company}}?

{{name}}`}</pre>
        </div>

        <h2>The Tools Stack for Cold Email Automation in 2026</h2>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24 }}>
          {[
            { tool:"Salevrix AI", use:"AI agents + sequences + scoring", cost:"Free → $79/mo", best:true },
            { tool:"Apollo.io", use:"Contact database (65% accurate)", cost:"$49-$119/user", best:false },
            { tool:"Instantly.ai", use:"Email sending + warmup", cost:"$37/mo", best:false },
            { tool:"Clay", use:"Data enrichment", cost:"$149/mo", best:false },
          ].map(t=>(
            <div key={t.tool} style={{ background:S.panel,border:`1px solid ${t.best?"rgba(200,255,0,0.25)":S.lineSoft}`,borderRadius:12,padding:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontSize:14,fontWeight:700,color:t.best?S.accent:S.text }}>{t.tool}</span>
                {t.best&&<span style={{ fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:999,background:"rgba(200,255,0,0.1)",color:S.accent }}>RECOMMENDED</span>}
              </div>
              <div style={{ fontSize:12,color:S.muted,marginBottom:6 }}>{t.use}</div>
              <div style={{ fontSize:11,color:S.faint }}>{t.cost}</div>
            </div>
          ))}
        </div>

        <h2>How to Set Up Cold Email Automation in 5 Minutes</h2>
        <ol>
          <li>Sign up for Salevrix AI (free)</li>
          <li>Import your prospect list via CSV — AI scores each one automatically</li>
          <li>Go to AI Agents → Email Writer — paste prospect info → get personalized email in seconds</li>
          <li>Create a Sequence — add 4-5 email steps with different angles</li>
          <li>Enroll prospects — sequences send automatically based on your timing rules</li>
        </ol>
        <p>Total setup time: under 5 minutes. First email out in under 10.</p>

        <div style={{ background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:28,marginTop:32,textAlign:"center" }}>
          <div style={{ fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:800,color:S.text,marginBottom:10 }}>Start automating cold email today</div>
          <p style={{ marginBottom:20 }}>Salevrix AI writes, sends, and follows up — automatically. Free to start.</p>
          <Link href="/auth/signup" style={{ display:"inline-block",padding:"13px 28px",borderRadius:12,background:S.accent,color:"#050505",fontSize:14,fontWeight:800,fontFamily:"Syne,sans-serif" }}>
            Start Free →
          </Link>
        </div>
      </article>
    </div>
  );
}
