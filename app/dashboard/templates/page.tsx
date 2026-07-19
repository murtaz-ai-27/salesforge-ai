"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const TEMPLATES = [
  {
    id:"1", category:"Cold Outreach", industry:"SaaS", name:"The LinkedIn Post Hook",
    subject:"Saw your post about {{topic}}",
    body:`Hi {{firstName}},

Your post about {{topic}} caught my attention — especially the part about {{specific_insight}}.

Most {{role}}s I talk to are hitting the same wall: {{pain_point}}. The research phase alone eats 2-3 hours per rep per day.

We helped {{similar_company}} cut that to 20 minutes using AI that does the research automatically.

Worth a 15-min call to see if the same approach fits your team?

{{sender}}`,
    tags:["LinkedIn","Personalization","SaaS"],
    color:"#C8FF00", bg:"rgba(200,255,0,0.08)",
    stats:{ openRate:67, replyRate:31, meetings:12 },
    tip:"Best for prospects who post actively on LinkedIn. Replace {{topic}} with their actual post topic."
  },
  {
    id:"2", category:"Cold Outreach", industry:"Fintech", name:"The Funding Round Angle",
    subject:"Congrats on the {{round}} — a thought",
    body:`Hi {{firstName}},

Congrats on {{company}}'s {{round}} — that's a significant milestone.

Companies at your stage typically face the same challenge: scaling outbound fast enough to justify the raise without hiring 10 SDRs overnight.

We helped {{similar_company}} go from 3 meetings/week to 14 — in 30 days — using AI agents that handle prospecting, personalization, and follow-ups autonomously.

Open to a quick call this week?

{{sender}}`,
    tags:["Funding","Fintech","Scale"],
    color:"#818cf8", bg:"rgba(129,140,248,0.08)",
    stats:{ openRate:71, replyRate:38, meetings:16 },
    tip:"Use within 48 hours of funding announcement for best results. Check Crunchbase for exact round details."
  },
  {
    id:"3", category:"Cold Outreach", industry:"DevTools", name:"The SDR Hire Signal",
    subject:"{{company}} hiring SDRs — a thought",
    body:`Hi {{firstName}},

Noticed {{company}} just posted {{number}} SDR roles on LinkedIn.

Before those reps ramp up (which takes 3-6 months), there's usually a window where AI can cover the gap — and honestly, perform better than a junior SDR from day one.

We're working with a few DevTool companies in your space where one AI agent is producing more qualified meetings than their first 2 SDR hires combined.

Worth 15 minutes to explore before your next hire starts?

{{sender}}`,
    tags:["Hiring Signal","DevTools","SDR"],
    color:"#60a5fa", bg:"rgba(96,165,250,0.08)",
    stats:{ openRate:58, replyRate:27, meetings:9 },
    tip:"Monitor LinkedIn job posts. When a company posts 2+ SDR roles, send this within 24 hours."
  },
  {
    id:"4", category:"Follow-Up", industry:"All", name:"The Different Angle Follow-Up",
    subject:"Re: {{company}} — different angle",
    body:`Hi {{firstName}},

Tried a different approach after my last email didn't land.

Instead of telling you what we do, here's what happened at {{similar_company}} (same size, similar challenge):

Their SDRs were spending 3 hours/day on research. After 30 days with us: 22 minutes/day. They booked 40% more meetings with the same team.

If that gap exists at {{company}} too, happy to show you exactly how — 15 minutes.

{{sender}}`,
    tags:["Follow-Up","Social Proof","All Industries"],
    color:"#34d399", bg:"rgba(52,211,153,0.08)",
    stats:{ openRate:54, replyRate:24, meetings:8 },
    tip:"Send 4-5 days after first email with no reply. Never say 'just following up'."
  },
  {
    id:"5", category:"Follow-Up", industry:"All", name:"The Competitor Mention",
    subject:"How you compare to {{competitor}}",
    body:`Hi {{firstName}},

Quick thought before I stop bugging you —

{{competitor}} just {{competitor_news}}. Companies like {{company}} are usually affected when that happens.

If it opens a gap in your outbound motion, that's exactly where we help. Two of our customers switched from {{competitor}} in the last quarter and saw reply rates go from 8% to 28%+ within 6 weeks.

Worth 15 minutes?

{{sender}}`,
    tags:["Competitor","FOMO","Follow-Up"],
    color:"#f472b6", bg:"rgba(244,114,182,0.08)",
    stats:{ openRate:61, replyRate:29, meetings:11 },
    tip:"Research recent competitor news (pricing changes, feature removals, outages) before sending."
  },
  {
    id:"6", category:"Follow-Up", industry:"All", name:"The Breakup Email",
    subject:"Closing your file, {{firstName}}",
    body:`Hi {{firstName}},

I've reached out a few times and haven't heard back — totally understand, timing might just be off.

I'll stop reaching out after this. But before I close your file, one last thought:

If {{pain_point}} ever becomes a priority, we've helped {{number}} similar companies solve it in under 30 days.

Whenever the timing is right — my calendar is at {{calendar_link}}.

All the best,
{{sender}}`,
    tags:["Breakup","Final Touch","Urgency"],
    color:"#f59e0b", bg:"rgba(245,158,11,0.08)",
    stats:{ openRate:74, replyRate:18, meetings:6 },
    tip:"Send as the final touch (touch 4 or 5). The psychology of 'closing the file' often triggers replies."
  },
  {
    id:"7", category:"LinkedIn", industry:"All", name:"Post-Based Connection Request",
    subject:"",
    body:`{{firstName}} — your post about {{topic}} hit close to home. I work with {{role}}s solving exactly that problem using AI. Worth connecting?`,
    tags:["LinkedIn","Connection","Short"],
    color:"#60a5fa", bg:"rgba(96,165,250,0.08)",
    stats:{ openRate:0, replyRate:42, meetings:14 },
    tip:"Keep under 280 characters. Reference their SPECIFIC post topic, not a generic comment."
  },
  {
    id:"8", category:"LinkedIn", industry:"All", name:"LinkedIn Follow-Up After Connect",
    subject:"",
    body:`Thanks for connecting, {{firstName}}.

Saw you're focused on {{focus_area}} at {{company}} — that's exactly the challenge I help {{role}}s tackle.

Quick context: we help sales teams like yours book 3x more meetings by automating the research and personalization step that currently takes 2-3 hours/day.

Worth a 15-min call to see if it's relevant?`,
    tags:["LinkedIn","Follow-Up","After Connect"],
    color:"#818cf8", bg:"rgba(129,140,248,0.08)",
    stats:{ openRate:0, replyRate:34, meetings:11 },
    tip:"Send within 24 hours of connection acceptance. Reference something from their profile."
  },
  {
    id:"9", category:"Re-Engagement", industry:"All", name:"The 90-Day Re-Engage",
    subject:"{{company}} — checking back in",
    body:`Hi {{firstName}},

We spoke about {{topic}} back in {{month}}. The timing wasn't right then — totally understood.

A few things have changed since: {{what_changed}}.

Given that, I thought it was worth reaching back out. We're now helping {{number}} companies in your space with this specifically.

Still relevant? Happy to show you what's new in 15 minutes.

{{sender}}`,
    tags:["Re-Engagement","Cold Lead","Nurture"],
    color:"#a78bfa", bg:"rgba(167,139,250,0.08)",
    stats:{ openRate:48, replyRate:19, meetings:7 },
    tip:"Best for leads that went cold 60-90 days ago. Always reference the specific reason they said no."
  },
  {
    id:"10", category:"Cold Outreach", industry:"E-commerce", name:"The Q4 Urgency Play",
    subject:"{{company}}'s Q4 outbound — a thought",
    body:`Hi {{firstName}},

Q4 is when outbound ROI either compounds or collapses depending on how well-prepared your SDR motion is going into October.

The companies we're seeing win this Q4 all have one thing in common: they automated the research and personalization step so reps spend 100% of their time in conversations, not prep.

We can have your team set up and running in under a week.

Worth 15 minutes before Q4 kicks off?

{{sender}}`,
    tags:["Q4","Urgency","Seasonal"],
    color:"#f59e0b", bg:"rgba(245,158,11,0.08)",
    stats:{ openRate:63, replyRate:26, meetings:10 },
    tip:"Most effective July-September. Replace Q4 with relevant quarter based on your timing."
  },
  {
    id:"11", category:"Cold Outreach", industry:"All", name:"The Mutual Connection Drop",
    subject:"{{mutual}} suggested I reach out",
    body:`Hi {{firstName}},

{{mutual}} mentioned you're the right person to talk to about {{topic}} at {{company}}.

We recently helped {{mutual}}'s team {{result}} — they thought there might be a fit here too.

Happy to share exactly how we did it in 15 minutes. Does {{day}} work?

{{sender}}`,
    tags:["Referral","Warm","Trust"],
    color:"#34d399", bg:"rgba(52,211,153,0.08)",
    stats:{ openRate:82, replyRate:47, meetings:22 },
    tip:"Highest converting template. Only use when you have a real mutual connection who has given permission."
  },
  {
    id:"12", category:"Cold Outreach", industry:"Healthcare", name:"The Compliance Pain Point",
    subject:"{{company}}'s sales compliance — a thought",
    body:`Hi {{firstName}},

Healthcare sales teams face a unique challenge: compliance requirements make generic outreach both ineffective and risky.

We built an AI outreach system specifically for healthcare companies — every email is reviewed for compliance signals before sending, and personalization is based on verified public data only.

{{similar_company}} reduced their compliance review time by 80% while increasing reply rates from 6% to 24%.

Worth exploring? Happy to share the specifics.

{{sender}}`,
    tags:["Healthcare","Compliance","Niche"],
    color:"#f87171", bg:"rgba(248,113,113,0.08)",
    stats:{ openRate:55, replyRate:22, meetings:8 },
    tip:"Healthcare-specific. Emphasize compliance and data privacy throughout the conversation."
  },
];

const CATEGORIES = ["All","Cold Outreach","Follow-Up","LinkedIn","Re-Engagement"];
const INDUSTRIES = ["All","SaaS","Fintech","DevTools","E-commerce","Healthcare"];

export default function TemplatesPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [category, setCategory] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [selected, setSelected] = useState<typeof TEMPLATES[0]|null>(null);
  const [copied, setCopied] = useState<"subject"|"body"|null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [customized, setCustomized] = useState("");
  const [prospectInfo, setProspectInfo] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const filtered = TEMPLATES.filter(t => {
    const matchCat = category==="All" || t.category===category;
    const matchInd = industry==="All" || t.industry===industry || t.industry==="All";
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag=>tag.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchInd && matchSearch;
  });

  const copyText = (text:string, type:"subject"|"body") => {
    navigator.clipboard.writeText(text).then(()=>{
      setCopied(type); showToast(`✓ ${type==="subject"?"Subject":"Body"} copied!`);
      setTimeout(()=>setCopied(null),2000);
    });
  };

  const customizeWithAI = async () => {
    if (!selected||!user?.uid) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          type:"emailWriter",
          prompt:`Take this email template and customize it for this specific prospect.

TEMPLATE:
Subject: ${selected.subject}
Body: ${selected.body}

PROSPECT INFO:
${prospectInfo}

Rewrite the email filling in all {{variables}} with relevant, specific information based on the prospect info. Keep the same structure and tone but make it hyper-personalized. Return just the email body, no subject line.`,
          userId: user.uid,
        }),
      });
      const data = await res.json();
      if (data.result) { setCustomized(data.result); showToast("✓ AI customized this template!"); }
      else showToast(data.error??"AI error");
    } catch { showToast("AI error"); }
    setAiGenerating(false);
  };

  if (authLoading) return <LoadingScreen text="Loading templates"/>;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:"1px solid rgba(200,255,0,0.3)",borderRadius:12,padding:"12px 22px",fontSize:13,fontWeight:600,color:S.accent,zIndex:300,whiteSpace:"nowrap" }}>{toast}</div>}
      <Sidebar active="templates" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Email Templates</h1>
            <p style={{ color:S.muted,fontSize:14 }}><span style={{ color:S.accent,fontWeight:700 }}>{TEMPLATES.length} proven templates</span> · Click any to preview + AI customize</p>
          </div>
          {/* Search */}
          <div style={{ position:"relative",width:240 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.faint} strokeWidth="2" strokeLinecap="round" style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search templates..."
              style={{ width:"100%",padding:"9px 12px 9px 34px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none" }}
              onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
              onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCategory(c)}
                style={{ padding:"7px 14px",borderRadius:9,border:`1px solid ${category===c?"rgba(200,255,0,0.3)":S.lineSoft}`,background:category===c?"rgba(200,255,0,0.08)":"transparent",color:category===c?S.accent:S.faint,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ width:1,background:S.lineSoft }}/>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {INDUSTRIES.map(i=>(
              <button key={i} onClick={()=>setIndustry(i)}
                style={{ padding:"7px 14px",borderRadius:9,border:`1px solid ${industry===i?"rgba(129,140,248,0.3)":S.lineSoft}`,background:industry===i?"rgba(129,140,248,0.08)":"transparent",color:industry===i?"#818cf8":S.faint,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 460px":"1fr",gap:20 }}>
          {/* Template Grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14,alignContent:"start" }}>
            {filtered.length===0?(
              <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"48px",color:S.faint }}>
                <div style={{ fontSize:32,marginBottom:12 }}>🔍</div>
                <div style={{ fontSize:14,color:S.text,marginBottom:6 }}>No templates found</div>
                <div style={{ fontSize:12 }}>Try a different search or filter</div>
              </div>
            ):filtered.map(t=>(
              <div key={t.id}
                onClick={()=>{ setSelected(selected?.id===t.id?null:t); setCustomized(""); setProspectInfo(""); }}
                style={{ background:S.panel,border:`1px solid ${selected?.id===t.id?"rgba(200,255,0,0.3)":S.lineSoft}`,borderRadius:14,padding:20,cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e=>{ if(selected?.id!==t.id)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"; }}
                onMouseLeave={e=>{ if(selected?.id!==t.id)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; }}>

                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10 }}>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:999,background:t.bg,color:t.color,border:`1px solid ${t.color}33` }}>{t.category}</span>
                    <span style={{ fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:999,background:"rgba(255,255,255,0.04)",color:S.faint,border:`1px solid ${S.lineSoft}` }}>{t.industry}</span>
                  </div>
                </div>

                <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:8 }}>{t.name}</div>

                {t.subject&&<div style={{ fontSize:11,color:S.muted,marginBottom:10,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  Subject: {t.subject}
                </div>}

                <div style={{ fontSize:11,color:S.faint,lineHeight:1.5,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>
                  {t.body.split('\n')[2]||t.body.split('\n')[0]}
                </div>

                {/* Stats */}
                {t.category!=="LinkedIn"&&(
                  <div style={{ display:"flex",gap:12,marginBottom:10 }}>
                    {[["Open",`${t.stats.openRate}%`,S.accent],["Reply",`${t.stats.replyRate}%`,"#818cf8"],["Meetings",t.stats.meetings,"#34d399"]].map(([l,v,c])=>(
                      <div key={l as string} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:13,fontWeight:700,color:c as string }}>{v}</div>
                        <div style={{ fontSize:9,color:S.faint }}>{l}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                  {t.tags.map(tag=>(
                    <span key={tag} style={{ fontSize:9,padding:"2px 7px",borderRadius:999,background:"rgba(255,255,255,0.04)",color:S.faint,border:`1px solid ${S.lineSoft}` }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Preview Panel */}
          {selected&&(
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24,height:"fit-content",position:"sticky",top:28,maxHeight:"calc(100vh - 56px)",overflowY:"auto" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:15,fontWeight:700,color:S.text,marginBottom:4 }}>{selected.name}</div>
                  <div style={{ display:"flex",gap:6 }}>
                    <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:999,background:selected.bg,color:selected.color }}>{selected.category}</span>
                    <span style={{ fontSize:10,padding:"2px 8px",borderRadius:999,background:"rgba(255,255,255,0.04)",color:S.faint }}>{selected.industry}</span>
                  </div>
                </div>
                <button onClick={()=>{ setSelected(null); setCustomized(""); }}
                  style={{ background:"none",border:"none",cursor:"pointer",color:S.faint,padding:4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Tip */}
              <div style={{ padding:"10px 12px",borderRadius:9,background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.12)",fontSize:12,color:S.muted,lineHeight:1.6,marginBottom:14 }}>
                💡 {selected.tip}
              </div>

              {/* Subject */}
              {selected.subject&&(
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                    <label style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>Subject Line</label>
                    <button onClick={()=>copyText(selected.subject,"subject")}
                      style={{ fontSize:11,padding:"3px 10px",borderRadius:7,background:copied==="subject"?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${copied==="subject"?"rgba(52,211,153,0.3)":S.lineSoft}`,color:copied==="subject"?"#34d399":S.faint,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                      {copied==="subject"?"✓ Copied":"Copy"}
                    </button>
                  </div>
                  <div style={{ padding:"10px 12px",borderRadius:9,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,fontSize:13,color:S.text }}>
                    {selected.subject}
                  </div>
                </div>
              )}

              {/* Body */}
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>Email Body</label>
                  <button onClick={()=>copyText(selected.body,"body")}
                    style={{ fontSize:11,padding:"3px 10px",borderRadius:7,background:copied==="body"?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${copied==="body"?"rgba(52,211,153,0.3)":S.lineSoft}`,color:copied==="body"?"#34d399":S.faint,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    {copied==="body"?"✓ Copied":"Copy"}
                  </button>
                </div>
                <pre style={{ padding:"12px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,fontSize:12,color:S.text,lineHeight:1.75,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",maxHeight:200,overflowY:"auto" }}>
                  {selected.body}
                </pre>
              </div>

              {/* Stats */}
              {selected.category!=="LinkedIn"&&(
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
                  {[["Open Rate",`${selected.stats.openRate}%`,S.accent],["Reply Rate",`${selected.stats.replyRate}%`,"#818cf8"],["Meetings",selected.stats.meetings,"#34d399"]].map(([l,v,c])=>(
                    <div key={l as string} style={{ background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"10px 8px",textAlign:"center",border:`1px solid ${S.lineSoft}` }}>
                      <div style={{ fontSize:16,fontWeight:800,color:c as string,fontFamily:"Syne,sans-serif" }}>{v}</div>
                      <div style={{ fontSize:10,color:S.faint,marginTop:2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Customizer */}
              <div style={{ borderTop:`1px solid ${S.lineSoft}`,paddingTop:14,marginTop:4 }}>
                <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8 }}>⚡ AI Customize for Your Prospect</div>
                <textarea value={prospectInfo} onChange={e=>setProspectInfo(e.target.value)}
                  placeholder="Paste prospect details here...&#10;Name: John Smith&#10;Role: VP Sales&#10;Company: Stripe&#10;Recent news: Just raised $100M"
                  style={{ width:"100%",minHeight:90,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:9,padding:"10px 12px",color:S.text,fontSize:12,fontFamily:"Inter,sans-serif",outline:"none",resize:"none",lineHeight:1.6,marginBottom:10 }}
                  onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                  onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>
                <button onClick={customizeWithAI} disabled={!prospectInfo.trim()||aiGenerating}
                  style={{ width:"100%",padding:"11px",borderRadius:10,background:prospectInfo.trim()&&!aiGenerating?S.accent:"rgba(255,255,255,0.05)",border:"none",color:prospectInfo.trim()&&!aiGenerating?"#050505":S.faint,fontSize:13,fontWeight:700,cursor:prospectInfo.trim()&&!aiGenerating?"pointer":"not-allowed",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:customized?12:0 }}>
                  {aiGenerating?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Customizing...</>:"⚡ AI Customize This Template"}
                </button>

                {customized&&(
                  <div style={{ background:"rgba(0,0,0,0.3)",border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:"12px 14px" }}>
                    <div style={{ fontSize:10,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8 }}>⚡ Customized Version</div>
                    <pre style={{ fontSize:12,color:S.text,lineHeight:1.75,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",marginBottom:10,maxHeight:180,overflowY:"auto" }}>{customized}</pre>
                    <button onClick={()=>{ navigator.clipboard.writeText(customized); showToast("✓ Customized email copied!"); }}
                      style={{ width:"100%",padding:"8px",borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                      Copy Customized Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea::placeholder{color:#555a66;font-size:11px}
        input::placeholder{color:#555a66}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}