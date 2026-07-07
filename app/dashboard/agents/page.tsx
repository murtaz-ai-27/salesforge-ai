"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useAgents, type DbAgent } from "@/components/useAgents";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const AGENT_META: Record<string,any> = {
  sdr: {
    name:"SDR Agent Alpha", color:"#C8FF00", bg:"rgba(200,255,0,0.08)",
    icon:"M13 10V3L4 14h7v7l9-11h-7z",
    tagline:"Books meetings while you sleep",
    description:"Your autonomous SDR that never takes a day off. Give it a prospect's details and it writes a hyper-personalized cold email referencing their LinkedIn activity, company news, or recent funding. Apollo's AI writes generic copy — ours sounds like it was written by your best rep.",
    capabilities:["Hyper-personalized cold emails","LinkedIn activity references","Company news hooks","Multi-touch follow-up","Objection pre-handling"],
    example:"Name: Sarah Chen\nRole: CRO\nCompany: Linear\nIndustry: SaaS\nLinkedIn: Recently posted about scaling SDR teams\nCompany news: Just raised $35M Series B",
    prompt_type:"emailWriter",
    tip:"💡 Include LinkedIn posts, recent company news, or funding rounds for best results"
  },
  email_coach: {
    name:"Email Coach", color:"#818cf8", bg:"rgba(129,140,248,0.08)",
    icon:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    tagline:"Turns average emails into reply magnets",
    description:"Paste any cold email and get 3 killer subject lines + a rewrite that sounds human. Apollo has no email coaching — your team sends generic AI slop. Our coach analyzes tone, personalization, spam triggers, and CTA strength.",
    capabilities:["3 subject line variants","Spam score check","Tone analysis","Personalization score","CTA optimization"],
    example:"Write 3 subject lines for this scenario:\nProspect: VP Sales at a 200-person Fintech company\nContext: They just hired 5 new SDRs and posted about scaling outbound\nProduct: SalesForge AI — AI-powered sales automation",
    prompt_type:"subjectLine",
    tip:"💡 Describe the prospect situation and product — get 3 subject lines with 60%+ open rate potential"
  },
  deal_analyzer: {
    name:"Deal Analyzer", color:"#f59e0b", bg:"rgba(245,158,11,0.08)",
    icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    tagline:"Flags dying deals before it's too late",
    description:"Paste your deal situation and get a health score, risk factors, and exact next actions. Apollo has basic pipeline stages — we give you AI-powered deal intelligence that tells you WHY a deal is at risk and exactly what to do about it.",
    capabilities:["Deal health score 0-100","Risk factor identification","Next action recommendations","Win probability","Stakeholder analysis"],
    example:"Deal: Figma - Enterprise License\nContact: Amy Liu, Director of Sales (not the real DM)\nDeal size: $18,000/year\nStage: Proposal sent 2 weeks ago\nLast activity: They opened email 3 times but no reply\nChallenge: Procurement involved, Q3 budget freeze mentioned",
    prompt_type:"dealAnalyzer",
    tip:"💡 Include deal stage, last activity date, deal size, and any obstacles for detailed analysis"
  },
  objection_handler: {
    name:"Objection Handler", color:"#34d399", bg:"rgba(52,211,153,0.08)",
    icon:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    tagline:"Turns NO into not yet",
    description:"Real-time objection handling in your human voice. Paste the exact objection and get a response that acknowledges, reframes, and opens dialogue — without sounding like a pushy salesperson. Apollo has nothing like this.",
    capabilities:["Price objections","Competitor mentions","Timing objections","Authority objections","Budget objections"],
    example:"Objection: We're already using Apollo.io and our team just got trained on it. Switching tools right now would be a distraction. Plus, we signed a 12-month contract 3 months ago.",
    prompt_type:"objectionHandler",
    tip:"💡 Paste the exact words the prospect used — more specific = better response"
  },
  meeting_summarizer: {
    name:"Meeting Summarizer", color:"#a78bfa", bg:"rgba(167,139,250,0.08)",
    icon:"M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
    tagline:"Never miss a follow-up again",
    description:"Dump your messy meeting notes and get a clean summary with action items, next steps, and deal sentiment. Apollo has no meeting intelligence — this saves 30 minutes of post-call admin per meeting.",
    capabilities:["Key discussion points","Action items with owners","Next steps","Deal sentiment","CRM-ready format"],
    example:"Meeting notes:\nCall with James Morrison (VP Sales, Stripe) - 30 min\nDiscussed SalesForge AI pricing. He likes the SDR agent feature.\nConcerns: integration with their existing Salesforce setup\nAsked about: onboarding timeline, dedicated support\nHis team: 12 SDRs currently doing manual outreach\nNext: wants a technical demo with their IT team\nHe mentioned budget is available but needs VP of Eng sign-off\nTone was positive, asked good questions",
    prompt_type:"meetingSummarizer",
    tip:"💡 Brain dump your messy notes — even bullet points work. The more detail, the better the summary"
  },
};

const EXTRA_AGENTS = [
  {
    id:"e1", type:"cold_caller", status:"active", meetings_booked:0, emails_sent:0, replies_handled:28,
    color:"#f59e0b", bg:"rgba(245,158,11,0.08)",
    icon:"M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    name:"Cold Call Script Writer",
    tagline:"Opens doors with the perfect first 30 seconds",
    description:"Writes complete cold call scripts tailored to your prospect. Opening hook, value prop, qualifying questions, objection handlers, and close. Apollo reps use generic scripts — yours will be customized for each prospect's situation.",
    capabilities:["Personalized opening hook","Industry-specific value prop","3 objection handlers","Qualifying questions","Meeting close script"],
    example:"Prospect: Marcus Johnson, VP Revenue at Vercel\nIndustry: DevTools / Cloud Infrastructure\nCompany size: 200-500 employees\nPain point: Their sales team of 8 reps doing manual outreach, spending 4hrs/day on research\nOur product: SalesForge AI automates prospecting and outreach",
    prompt_type:"cold_caller",
    tip:"💡 Include their role, company pain points, and your product's main benefit"
  },
  {
    id:"e2", type:"linkedin_writer", status:"active", meetings_booked:0, emails_sent:0, replies_handled:64,
    color:"#60a5fa", bg:"rgba(96,165,250,0.08)",
    icon:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z",
    name:"LinkedIn Message Writer",
    tagline:"Gets accepted by people who ignore everyone else",
    description:"Writes LinkedIn connection requests and follow-ups that actually get accepted. References their specific posts, shared connections, or recent activity. Apollo's LinkedIn is completely manual — this automates the best part.",
    capabilities:["Connection request (300 chars)","Follow-up after accept","Post-based personalization","Mutual connection references","Soft pitch follow-up"],
    example:"Prospect: Raj Patel, Head of Sales at Notion\nContext: He posted last week about how his SDR team struggles with personalization at scale\nShared connection: Both follow Jacco van der Kooij (sales thought leader)\nOur product: SalesForge AI - solves exactly the personalization problem he mentioned",
    prompt_type:"linkedin_writer",
    tip:"💡 Reference a specific post they wrote or something from their profile for 3x better response rates"
  },
  {
    id:"e3", type:"proposal_writer", status:"active", meetings_booked:0, emails_sent:0, replies_handled:12,
    color:"#a78bfa", bg:"rgba(167,139,250,0.08)",
    icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    name:"Proposal Writer",
    tagline:"Closes deals with proposals that feel personal",
    description:"Generates fully customized sales proposals with ROI calculations based on their team size and pain points. Apollo has zero proposal features — reps waste hours writing generic proposals. This takes 30 seconds.",
    capabilities:["Executive summary","ROI calculation","Custom pricing recommendation","Implementation timeline","Risk mitigation section"],
    example:"Client: TechNova Solutions\nContact: Ahmed Raza, Marketing Manager\nTeam size: 12 sales reps doing manual outreach\nCurrent tool: Manual + Apollo basic plan\nMain pain: Reps spending 3hrs/day on research, 15% reply rates\nBudget signal: Mentioned Q3 budget available, $2-5K/month range\nDecision timeline: Wants to implement before Q4",
    prompt_type:"proposal_writer",
    tip:"💡 Include team size, current pain points, and budget signals for a highly relevant proposal"
  },
  {
    id:"e4", type:"competitor_intel", status:"active", meetings_booked:0, emails_sent:0, replies_handled:19,
    color:"#f472b6", bg:"rgba(244,114,182,0.08)",
    icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    name:"Competitive Intel Agent",
    tagline:"Wins deals when prospects mention competitors",
    description:"Generates battle cards when a prospect mentions Apollo, Outreach, Salesloft, or any other competitor. Specific weaknesses, talking points, and a one-liner closer. Apollo obviously doesn't have this — and that's exactly the point.",
    capabilities:["Competitor weakness analysis","Head-to-head comparison","Winning talk track","Trap questions for prospects","One-liner closer"],
    example:"Situation: Prospect said 'We already use Apollo.io and Outreach. Why would we switch to SalesForge AI? Apollo has a massive database of 200M+ contacts.'\nOur advantages: 10 AI agents vs Apollo's 1, 15 automations, 100% data accuracy (user's own data), LinkedIn automation, free tier",
    prompt_type:"competitor_intel",
    tip:"💡 Paste exactly what the prospect said — the more specific, the sharper the battle card"
  },
  {
    id:"e5", type:"revenue_forecaster", status:"active", meetings_booked:0, emails_sent:0, replies_handled:7,
    color:"#34d399", bg:"rgba(52,211,153,0.08)",
    icon:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    name:"Revenue Forecast Agent",
    tagline:"Predicts your quarter before it happens",
    description:"Analyzes your pipeline and generates accurate forecasts with deal-by-deal probability scoring. Apollo has basic pipeline stages — this gives you a CFO-ready revenue forecast with specific actions to hit your number.",
    capabilities:["Q-over-Q forecast","Deal probability scoring","At-risk deal flags","Revenue gap analysis","Specific close actions"],
    example:"Q3 Pipeline:\n- Stripe deal: $24,000, in negotiation, champion is VP Sales, legal review ongoing\n- Linear deal: $8,400, demo done, waiting on budget approval, timeline: end of month\n- Notion deal: $15,600, proposal sent 3 weeks ago, no response, champion went cold\n- Figma deal: $18,000, just had discovery, very interested, decision in 6 weeks\n- Vercel deal: $6,000, verbal yes, just need MSA signed\nTarget: $50,000 this quarter",
    prompt_type:"revenue_forecaster",
    tip:"💡 Include all active deals with size, stage, last activity, and any obstacles"
  },
];

export default function AgentsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const { agents, loading: dataLoading, toggleAgent } = useAgents(user?.uid);
  const [extraAgents, setExtraAgents] = useState(EXTRA_AGENTS);
  const [selected, setSelected] = useState<any|null>(null);
  const [testInput, setTestInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toggling, setToggling] = useState<string|null>(null);
  const [toast, setToast] = useState("");
  const [useExample, setUseExample] = useState(false);

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const allAgents = [
    ...agents.map(a => ({ ...a, ...(AGENT_META[a.type]??AGENT_META.sdr), isDb:true })),
    ...extraAgents.map(a => ({ ...a, isDb:false })),
  ];

  const handleToggle = async (agent:any) => {
    setToggling(agent.id);
    try {
      if (agent.isDb) await toggleAgent(agent.id, agent.status);
      else setExtraAgents(prev=>prev.map(a=>a.id===agent.id?{...a,status:a.status==="active"?"paused":"active"}:a));
      if (selected?.id===agent.id) setSelected((p:any)=>p?{...p,status:p.status==="active"?"paused":"active"}:null);
      showToast(agent.status==="active"?`${agent.name} paused`:`${agent.name} activated ⚡`);
    } catch(err:any) { showToast(`Error: ${err.message}`); }
    setToggling(null);
  };

  const runAgent = async () => {
    if (!selected||!testInput.trim()) return;
    setAiLoading(true); setAiOutput("");
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          type: selected.prompt_type ?? "emailWriter",
          prompt: testInput,
          userId: user?.uid,
        }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.upgrade) {
          setAiOutput(`⚠️ ${data.error}\n\nYou've used ${data.used}/${data.limit} agent runs today.\n\n👉 Upgrade at /dashboard/pricing to get more runs.`);
        } else {
          setAiOutput(`Error: ${data.error}`);
        }
      } else {
        setAiOutput(data.result);
      }
    } catch(err:any) { setAiOutput(`Error: ${err.message}`); }
    setAiLoading(false);
  };

  if (authLoading||dataLoading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const activeCount = allAgents.filter(a=>a.status==="active").length;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:"1px solid rgba(200,255,0,0.3)",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:S.accent,zIndex:300,whiteSpace:"nowrap" }}>{toast}</div>}
      <Sidebar active="agents" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>AI Agents</h1>
            <p style={{ color:S.muted,fontSize:14 }}>
              <span style={{ color:S.accent,fontWeight:700 }}>{allAgents.length} specialized agents</span> — Apollo has 1 basic assistant. We have {allAgents.length}.
            </p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ textAlign:"center",padding:"8px 16px",background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10 }}>
              <div style={{ fontSize:20,fontWeight:800,color:S.accent,fontFamily:"Syne,sans-serif" }}>{activeCount}</div>
              <div style={{ fontSize:11,color:S.faint }}>Active</div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"8px 16px",borderRadius:999 }}>
              <span style={{ width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block",animation:"ping 1.5s infinite" }}/>{activeCount} Running 24/7
            </div>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 440px":"1fr",gap:20 }}>

          {/* Agents Grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14,alignContent:"start" }}>
            {allAgents.map(agent=>(
              <div key={agent.id}
                onClick={()=>{ setSelected(selected?.id===agent.id?null:agent); setAiOutput(""); setTestInput(""); setUseExample(false); }}
                style={{ background:S.panel,border:`1px solid ${selected?.id===agent.id?"rgba(200,255,0,0.3)":S.lineSoft}`,borderRadius:16,padding:20,cursor:"pointer",transition:"all 0.2s",boxShadow:selected?.id===agent.id?"0 0 0 1px rgba(200,255,0,0.1),0 8px 32px rgba(0,0,0,0.4)":"none" }}
                onMouseEnter={e=>{ if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"; }}
                onMouseLeave={e=>{ if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; }}>

                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:40,height:40,borderRadius:11,background:agent.bg,border:`1px solid ${agent.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={agent.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={agent.icon}/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:S.text }}>{agent.name}</div>
                      <div style={{ fontSize:11,color:agent.color,marginTop:1,fontStyle:"italic" }}>{agent.tagline}</div>
                    </div>
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); handleToggle(agent); }} disabled={toggling===agent.id}
                    style={{ width:40,height:22,borderRadius:999,border:"none",cursor:"pointer",background:agent.status==="active"?S.accent:"rgba(255,255,255,0.1)",transition:"all 0.3s",position:"relative",flexShrink:0 }}>
                    <div style={{ position:"absolute",top:2,left:agent.status==="active"?20:2,width:18,height:18,borderRadius:"50%",background:agent.status==="active"?"#050505":"rgba(255,255,255,0.4)",transition:"all 0.3s" }}/>
                  </button>
                </div>

                <p style={{ fontSize:12,color:S.muted,lineHeight:1.65,marginBottom:12 }}>{agent.description}</p>

                {/* Stats */}
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10 }}>
                  {[["Meetings",agent.meetings_booked,agent.color],["Emails",agent.emails_sent,"#818cf8"],["Replies",agent.replies_handled,"#34d399"]].map(([l,v,c])=>(
                    <div key={l as string} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:8,padding:"8px 6px",textAlign:"center" }}>
                      <div style={{ fontSize:15,fontWeight:800,color:c as string,fontFamily:"Syne,sans-serif" }}>{v as number}</div>
                      <div style={{ fontSize:9,color:S.faint,marginTop:1 }}>{l as string}</div>
                    </div>
                  ))}
                </div>

                {/* Capabilities */}
                <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                  {agent.capabilities?.slice(0,3).map((c:string)=>(
                    <span key={c} style={{ fontSize:10,color:S.muted,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,padding:"3px 8px",borderRadius:999 }}>{c}</span>
                  ))}
                  {(agent.capabilities?.length??0)>3&&<span style={{ fontSize:10,color:S.faint,padding:"3px 5px" }}>+{agent.capabilities.length-3} more</span>}
                </div>

                <div style={{ marginTop:10,fontSize:11,fontWeight:600,color:selected?.id===agent.id?S.accent:S.faint,textAlign:"right" }}>
                  {selected?.id===agent.id?"✓ Selected — test in panel →":"Click to test →"}
                </div>
              </div>
            ))}
          </div>

          {/* Test Panel */}
          {selected&&(
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24,height:"fit-content",position:"sticky",top:28,maxHeight:"calc(100vh - 56px)",overflowY:"auto" }}>

              {/* Header */}
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:selected.bg,border:`1px solid ${selected.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={selected.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={selected.icon}/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text }}>{selected.name}</div>
                  <div style={{ fontSize:11,color:selected.color,fontStyle:"italic" }}>{selected.tagline}</div>
                </div>
                <button onClick={()=>{ setSelected(null); setAiOutput(""); }} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint,padding:4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* How to use tip */}
              <div style={{ padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,fontSize:12,color:S.muted,lineHeight:1.6,marginBottom:14 }}>
                {selected.tip}
              </div>

              {/* Example button */}
              <button onClick={()=>{ setTestInput(selected.example); setUseExample(true); }}
                style={{ width:"100%",padding:"8px 14px",borderRadius:9,border:"1px solid rgba(200,255,0,0.2)",background:"rgba(200,255,0,0.04)",color:S.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                Load Example Input
              </button>

              {/* Input */}
              <textarea value={testInput} onChange={e=>setTestInput(e.target.value)}
                placeholder={`Enter details for ${selected.name}...\n\n${selected.example}`}
                style={{ width:"100%",minHeight:160,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"12px 14px",color:S.text,fontSize:12.5,fontFamily:"Inter,sans-serif",resize:"vertical",outline:"none",lineHeight:1.7,marginBottom:12 }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>

              {/* Run button */}
              <button onClick={runAgent} disabled={aiLoading||!testInput.trim()||selected.status==="paused"}
                style={{ width:"100%",padding:"13px",borderRadius:11,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"Inter,sans-serif",marginBottom:aiOutput?16:0,
                  background:selected.status==="paused"?"rgba(255,255,255,0.05)":aiLoading?"rgba(200,255,0,0.6)":!testInput.trim()?"rgba(255,255,255,0.05)":S.accent,
                  color:selected.status==="paused"||!testInput.trim()?S.faint:"#050505",
                  fontSize:14,fontWeight:700,cursor:aiLoading||selected.status==="paused"||!testInput.trim()?"not-allowed":"pointer" }}>
                {aiLoading
                  ?<><span style={{ width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Agent is working...</>
                  :selected.status==="paused"?"Agent Paused — Toggle to Activate"
                  :<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Run {selected.name}</>}
              </button>

              {/* Output */}
              {aiOutput&&(
                <div style={{ background:"rgba(0,0,0,0.35)",border:`1px solid ${aiOutput.startsWith("⚠️")||aiOutput.startsWith("Error")?"rgba(248,113,113,0.3)":S.lineSoft}`,borderRadius:12,padding:"16px" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:aiOutput.startsWith("⚠️")||aiOutput.startsWith("Error")?"#f87171":selected.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>
                    {aiOutput.startsWith("⚠️")||aiOutput.startsWith("Error")?"⚠️ Notice":"⚡ Agent Output"}
                  </div>
                  <pre style={{ fontSize:12.5,color:S.text,lineHeight:1.75,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",margin:"0 0 12px" }}>{aiOutput}</pre>
                  {!aiOutput.startsWith("⚠️")&&!aiOutput.startsWith("Error")&&(
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>navigator.clipboard.writeText(aiOutput).then(()=>showToast("Copied ✓"))}
                        style={{ flex:1,padding:"7px 14px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                        Copy Output
                      </button>
                      <button onClick={()=>{ setAiOutput(""); setTestInput(""); }}
                        style={{ padding:"7px 12px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.faint,fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ping{0%,100%{box-shadow:0 0 0 0 rgba(200,255,0,0.4)}50%{box-shadow:0 0 0 6px rgba(200,255,0,0)}}
        textarea::placeholder{color:#555a66;font-size:12px}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
