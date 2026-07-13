"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useAgents, type DbAgent } from "@/components/useAgents";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const AGENT_META: Record<string,any> = {
  sdr:{ name:"SDR Agent Alpha",color:"#C8FF00",bg:"rgba(200,255,0,0.08)",icon:"M13 10V3L4 14h7v7l9-11h-7z",tagline:"Books meetings while you sleep",description:"Your autonomous SDR that never takes a day off. Give it prospect details and it writes a hyper-personalized cold email referencing their LinkedIn activity, company news, or recent funding. Apollo's AI writes generic copy — ours sounds like it was written by your best rep.",capabilities:["Hyper-personalized cold emails","LinkedIn activity references","Company news hooks","Proof points with real numbers","Soft CTA that converts"],example:"Name: Sarah Chen\nRole: CRO\nCompany: Linear\nIndustry: SaaS\nRecent news: Just raised $35M Series B, hiring 10 new SDRs\nLinkedIn: Posted last week about challenges of scaling outbound while keeping personalization",prompt_type:"emailWriter",tip:"💡 Include recent news, LinkedIn posts, or funding rounds — the more specific, the better the email" },
  email_coach:{ name:"Email Coach",color:"#818cf8",bg:"rgba(129,140,248,0.08)",icon:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",tagline:"Turns average emails into reply magnets",description:"Paste any cold email scenario and get 3 killer subject lines that get 55-70% open rates. Apollo has no email coaching feature — your team sends generic AI copy. Our coach analyzes tone, personalization, and CTA strength.",capabilities:["3 high-converting subject lines","Pattern interrupt techniques","Curiosity-based openers","Prospect-specific references","Inbox placement optimization"],example:"Write 3 subject lines for this scenario:\nProspect: VP Sales at a 200-person Fintech company\nContext: They just hired 5 new SDRs and posted on LinkedIn about scaling outbound\nOur product: SalesForge AI — automates SDR research and personalization\nGoal: Get them to open the email and reply",prompt_type:"subjectLine",tip:"💡 Describe the prospect situation and your product — get 3 subject lines optimized for 55-70% open rates" },
  deal_analyzer:{ name:"Deal Analyzer",color:"#f59e0b",bg:"rgba(245,158,11,0.08)",icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",tagline:"Flags dying deals before it's too late",description:"Paste your deal situation and get a health score, risk factors, and exact next actions with scripts. Apollo has basic pipeline stages — we give you AI-powered deal intelligence that tells you WHY a deal is at risk and exactly what to say.",capabilities:["Deal health score 0-100","Risk factor identification","Exact scripts for next actions","Win probability calculation","Stakeholder analysis"],example:"Deal: Figma - Enterprise License\nContact: Amy Liu, Director of Sales (not the real DM — real DM is VP of Revenue)\nDeal size: $18,000/year\nStage: Proposal sent 2 weeks ago\nLast activity: Email opened 3 times, no reply\nObstacles: Procurement involved, Q3 budget freeze mentioned in last call\nChampion strength: Medium — Amy likes us but hasn't introduced us to VP",prompt_type:"dealAnalyzer",tip:"💡 Include deal stage, last activity date, deal size, champion strength, and any obstacles — the more detail, the sharper the analysis" },
  objection_handler:{ name:"Objection Handler",color:"#34d399",bg:"rgba(52,211,153,0.08)",icon:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",tagline:"Turns NO into not yet",description:"Real-time objection handling in your human voice. Paste the exact objection and get a response that acknowledges, reframes, and opens dialogue — without sounding like a pushy salesperson. Apollo has nothing like this.",capabilities:["Price objection responses","Competitor comparison handlers","Timing objection reframes","Budget objection pivots","Authority objection scripts"],example:"Objection from prospect: We're already using Apollo.io and our team just got trained on it 3 months ago. We're locked in for another 9 months on the contract. Switching tools right now would be a major distraction for my SDR team.",prompt_type:"objectionHandler",tip:"💡 Paste the exact words the prospect used — more specific = sharper response. Include context like their role and company." },
  meeting_summarizer:{ name:"Meeting Summarizer",color:"#a78bfa",bg:"rgba(167,139,250,0.08)",icon:"M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",tagline:"Never miss a follow-up again",description:"Dump your messy meeting notes and get a clean summary with action items, next steps, and deal sentiment in 30 seconds. Apollo has no meeting intelligence — this saves 30 minutes of post-call admin per meeting.",capabilities:["Key discussion points","Action items with owners","Deal sentiment analysis","CRM-ready format","Follow-up email draft"],example:"Call with James Morrison (VP Sales, Stripe) - 35 min\nDiscussed SalesForge AI platform. He liked the SDR automation angle a lot.\nMain concern: Integration with their existing Salesforce setup — wants to make sure data syncs\nAsked about: Onboarding timeline, dedicated support, can we handle 24 reps\nHis team: 12 SDRs doing manual outreach currently, 3 new ones starting next month\nNext: Wants a technical demo with their Head of RevOps (Marcus, who wasn't on this call)\nBudget: Available, but needs VP of Eng and Marcus to sign off\nTone: Positive, engaged, asked good questions. Not price sensitive.\nCompetitors mentioned: Looked at Outreach last year, didn't buy — felt too complex",prompt_type:"meetingSummarizer",tip:"💡 Brain dump your raw notes — even bullet points work. The messier the input, the more impressive the clean output." },
};

const EXTRA_AGENTS = [
  { id:"e1",type:"cold_caller",status:"active",meetings_booked:0,emails_sent:0,replies_handled:28,color:"#f59e0b",bg:"rgba(245,158,11,0.08)",icon:"M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",name:"Cold Call Script Writer",tagline:"Opens doors with the perfect first 30 seconds",description:"Writes complete cold call scripts tailored to your prospect. Opening hook, value prop, qualifying questions, objection handlers, and close. Apollo reps use generic scripts — yours is customized for each prospect's situation.",capabilities:["Personalized 8-second opener","Industry-specific value prop","4 objection handlers with scripts","Qualifying discovery questions","Two-option meeting close"],example:"Prospect: Marcus Johnson, VP Revenue at Vercel\nIndustry: DevTools / Cloud Infrastructure\nCompany size: 200-500 employees\nPain: Sales team of 8 reps doing 3hrs/day manual research before outreach\nOur solution: SalesForge AI cuts research to 20min and personalizes automatically\nContext: Vercel just hit 1M deployments/day — scaling fast, sales team needs to scale too",prompt_type:"cold_caller",tip:"💡 Include their role, company context, specific pain point, and what makes your solution relevant to THEM specifically" },
  { id:"e2",type:"linkedin_writer",status:"active",meetings_booked:0,emails_sent:0,replies_handled:64,color:"#60a5fa",bg:"rgba(96,165,250,0.08)",icon:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z",name:"LinkedIn Message Writer",tagline:"Gets accepted by people who ignore everyone else",description:"Writes LinkedIn connection requests and follow-ups that actually get accepted. References their specific posts, shared connections, or recent activity. Apollo's LinkedIn is completely manual — this automates the best-converting channel.",capabilities:["Connection request (280 chars max)","Post-based personalization","Follow-up after acceptance","Mutual connection references","Soft value prop follow-up"],example:"Prospect: Raj Patel, Head of Sales at Notion\nContext: He posted 3 days ago about how his SDR team struggles with personalization at scale — specifically mentioned it takes reps 2.5hrs to research each account\nShared: Both follow Jacco van der Kooij (sales thought leader)\nNote: He's very active on LinkedIn (posts 3-4x per week)\nOur product: SalesForge AI solves exactly the personalization-at-scale problem he described",prompt_type:"linkedin_writer",tip:"💡 Reference a specific post they wrote with the exact topic — this gets 3x better acceptance rates than generic connection requests" },
  { id:"e3",type:"proposal_writer",status:"active",meetings_booked:0,emails_sent:0,replies_handled:12,color:"#a78bfa",bg:"rgba(167,139,250,0.08)",icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",name:"Proposal Writer",tagline:"Closes deals with proposals that feel personal",description:"Generates fully customized sales proposals with ROI calculations based on their team size and pain points. Apollo has zero proposal features — reps waste hours on generic decks. This takes 45 seconds.",capabilities:["Cost of inaction calculation","Custom ROI with their numbers","Implementation timeline","Risk mitigation section","Single clear next step"],example:"Client: TechNova Solutions\nContact: Ahmed Raza, Marketing Manager\nTeam: 12 sales reps doing manual outreach\nCurrent tool: Manual prospecting + basic Apollo plan\nMain pain: Reps spending 3hrs/day on research → only 2hrs actual selling → 15% reply rates\nBudget signal: $2-5K/month range mentioned, Q3 budget available\nDecision: Needs to implement before Q4 (mentioned twice)\nWhat resonated in demo: The AI email personalization and the follow-up automation",prompt_type:"proposal_writer",tip:"💡 Include team size, current pain with numbers, budget signals, and what resonated in your demo — the output will mirror their exact situation" },
  { id:"e4",type:"competitor_intel",status:"active",meetings_booked:0,emails_sent:0,replies_handled:19,color:"#f472b6",bg:"rgba(244,114,182,0.08)",icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",name:"Competitive Intel Agent",tagline:"Wins deals when prospects mention competitors",description:"Generates battle cards when a prospect mentions Apollo, Outreach, Salesloft, or any other competitor. Specific weaknesses, talking points, and a one-liner closer. Apollo obviously doesn't have this feature.",capabilities:["Competitor weakness analysis","Trap questions that expose pain","Head-to-head comparison","Winning talk track","One-liner closer"],example:"Prospect said exactly this: 'We already use Apollo.io and Outreach together. Apollo for the database, Outreach for sequences. Why would we add a third tool? We're trying to consolidate, not expand our tech stack.'\nOur advantages to highlight: 10 AI agents vs Apollo's basic AI, 15 automations vs manual workflows, 100% data accuracy (user's own verified data), LinkedIn automation included, all-in-one vs needing both Apollo + Outreach",prompt_type:"competitor_intel",tip:"💡 Paste exactly what the prospect said — word for word. The more precise the quote, the sharper the battle card." },
  { id:"e5",type:"revenue_forecaster",status:"active",meetings_booked:0,emails_sent:0,replies_handled:7,color:"#34d399",bg:"rgba(52,211,153,0.08)",icon:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",name:"Revenue Forecast Agent",tagline:"Predicts your quarter before it happens",description:"Analyzes your pipeline and generates accurate revenue forecasts with deal-by-deal probability scoring and specific actions to close the gap. Apollo has basic pipeline stages — this gives you a CFO-ready forecast.",capabilities:["Q-over-Q revenue forecast","Deal probability scoring","At-risk deal identification","Revenue gap analysis","Time-bound close actions"],example:"Q3 Pipeline — Target: $120,000\n\nStripe deal: $24,000 — in legal review, champion is strong, been dark 5 days\nLinear deal: $8,400 — verbal yes, waiting on MSA, decision maker is engaged\nNotion deal: $15,600 — proposal sent 3 weeks ago, champion went quiet after budget freeze announcement\nFigma deal: $18,000 — discovery done, very interested, decision in 6 weeks\nVercel deal: $6,000 — signed verbally, just need paperwork\nTechNova deal: $12,000 — demo went well, evaluation ongoing, 2 competitors in play\nAcme Corp: $36,000 — new, just had first discovery call, too early to tell",prompt_type:"revenue_forecaster",tip:"💡 Include every active deal with size, stage, last activity, and any obstacles — the more deals you list, the more accurate the forecast" },
];

// Smart variable replacement from input text
function replaceVariables(text: string, input: string): string {
  if (!text || !input) return text;

  // Extract values from input
  const get = (patterns: RegExp[]): string => {
    for (const p of patterns) {
      const m = input.match(p);
      if (m?.[1]) return m[1].trim().replace(/[,.]$/, "");
    }
    return "";
  };

  const fullName = get([/(?:Name:|Prospect:)\s*([^\n,]+)/i, /^([A-Z][a-z]+ [A-Z][a-z]+)/m]);
  const firstName = fullName.split(" ")[0] || get([/(?:Hi|Dear)\s+([A-Z][a-z]+)/i]);
  const company = get([/(?:Company:|at\s+)([A-Za-z][A-Za-z\s]+?)(?:\n|,|\.|$)/i, /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)\s+(?:deal|Inc|Corp|Ltd)/]);
  const role = get([/(?:Role:|Title:|Job Title:|Position:)\s*([^\n,]+)/i]);

  let result = text;
  if (firstName) result = result.replace(/\{\{firstName\}\}/g, firstName);
  if (fullName) result = result.replace(/\{\{name\}\}/g, fullName);
  if (company) result = result.replace(/\{\{company\}\}/g, company);
  if (role) result = result.replace(/\{\{role\}\}/g, role);
  result = result.replace(/\{\{sender\}\}/g, "The SalesForge Team");
  result = result.replace(/\{\{icebreaker\}\}/g, "your recent company news");
  result = result.replace(/\{\{topic\}\}/g, "sales automation");
  return result;
}

export default function AgentsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const { agents, loading: dataLoading, toggleAgent } = useAgents(user?.uid);
  const [extraAgents, setExtraAgents] = useState(EXTRA_AGENTS);
  const [selected, setSelected] = useState<any|null>(null);
  const [testInput, setTestInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toggling, setToggling] = useState<string|null>(null);
  const [toast, setToast] = useState<{msg:string;color:string}>({msg:"",color:S.accent});
  const [copied, setCopied] = useState(false);

  const showToast = (msg:string, color=S.accent) => { setToast({msg,color}); setTimeout(()=>setToast({msg:"",color:S.accent}),3500); };

  const allAgents = [
    ...agents.map(a=>({...a,...(AGENT_META[a.type]??AGENT_META.sdr),isDb:true})),
    ...extraAgents.map(a=>({...a,isDb:false})),
  ];

  const handleToggle = async (agent:any) => {
    setToggling(agent.id);
    try {
      if (agent.isDb) await toggleAgent(agent.id, agent.status);
      else setExtraAgents(prev=>prev.map(a=>a.id===agent.id?{...a,status:a.status==="active"?"paused":"active"}:a));
      if (selected?.id===agent.id) setSelected((p:any)=>p?{...p,status:p.status==="active"?"paused":"active"}:null);
      showToast(agent.status==="active"?`${agent.name} paused`:`${agent.name} activated ⚡`);
    } catch(err:any) { showToast(`Error: ${err.message}`,"#f87171"); }
    setToggling(null);
  };

  const runAgent = async () => {
    if (!selected||!testInput.trim()) return;
    setAiLoading(true); setAiOutput("");
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type:selected.prompt_type??"emailWriter", prompt:testInput, userId:user?.uid }),
      });
      const data = await res.json();
      if (data.error) {
        setAiOutput(data.upgrade
          ? `⚠️ ${data.error}\n\nYou've used ${data.used}/${data.limit} AI runs today.\n\nUpgrade at /dashboard/pricing`
          : `Error: ${data.error}`);
      } else {
        // Auto-replace variables from input
        const cleaned = replaceVariables(data.result, testInput);
        setAiOutput(cleaned);
      }
    } catch(err:any) { setAiOutput(`Error: ${err.message}`); }
    setAiLoading(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(aiOutput).then(()=>{
      setCopied(true);
      showToast("Copied to clipboard ✓");
      setTimeout(()=>setCopied(false),2000);
    });
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
      {toast.msg&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:`1px solid ${toast.color}44`,borderRadius:12,padding:"12px 22px",fontSize:13,fontWeight:600,color:toast.color,zIndex:300,whiteSpace:"nowrap" }}>{toast.msg}</div>}
      <Sidebar active="agents" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>AI Agents</h1>
            <p style={{ color:S.muted,fontSize:14 }}>
              <span style={{ color:S.accent,fontWeight:700 }}>{allAgents.length} specialized agents</span> · Apollo has 1 basic assistant · Variables auto-replaced from your input ✓
            </p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ padding:"8px 16px",background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,textAlign:"center" }}>
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
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14,alignContent:"start" }}>
            {allAgents.map(agent=>(
              <div key={agent.id}
                onClick={()=>{ setSelected(selected?.id===agent.id?null:agent); setAiOutput(""); setTestInput(""); }}
                style={{ background:S.panel,border:`1px solid ${selected?.id===agent.id?"rgba(200,255,0,0.3)":S.lineSoft}`,borderRadius:14,padding:20,cursor:"pointer",transition:"all 0.2s",boxShadow:selected?.id===agent.id?"0 0 0 1px rgba(200,255,0,0.1),0 8px 32px rgba(0,0,0,0.4)":"none" }}
                onMouseEnter={e=>{ if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"; }}
                onMouseLeave={e=>{ if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:40,height:40,borderRadius:11,background:agent.bg,border:`1px solid ${agent.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={agent.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={agent.icon}/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:S.text }}>{agent.name}</div>
                      <div style={{ fontSize:11,color:agent.color,fontStyle:"italic",marginTop:1 }}>{agent.tagline}</div>
                    </div>
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); handleToggle(agent); }} disabled={toggling===agent.id}
                    style={{ width:40,height:22,borderRadius:999,border:"none",cursor:"pointer",background:agent.status==="active"?S.accent:"rgba(255,255,255,0.1)",transition:"all 0.3s",position:"relative",flexShrink:0 }}>
                    <div style={{ position:"absolute",top:2,left:agent.status==="active"?20:2,width:18,height:18,borderRadius:"50%",background:agent.status==="active"?"#050505":"rgba(255,255,255,0.4)",transition:"all 0.3s" }}/>
                  </button>
                </div>
                <p style={{ fontSize:12,color:S.muted,lineHeight:1.65,marginBottom:12 }}>{agent.description}</p>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10 }}>
                  {[["Meetings",agent.meetings_booked,agent.color],["Emails",agent.emails_sent,"#818cf8"],["Replies",agent.replies_handled,"#34d399"]].map(([l,v,c])=>(
                    <div key={l as string} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:8,padding:"8px 6px",textAlign:"center" }}>
                      <div style={{ fontSize:15,fontWeight:800,color:c as string,fontFamily:"Syne,sans-serif" }}>{v as number}</div>
                      <div style={{ fontSize:9,color:S.faint,marginTop:1 }}>{l as string}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                  {agent.capabilities?.slice(0,3).map((c:string)=>(
                    <span key={c} style={{ fontSize:10,color:S.muted,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,padding:"3px 8px",borderRadius:999 }}>{c}</span>
                  ))}
                  {(agent.capabilities?.length??0)>3&&<span style={{ fontSize:10,color:S.faint,padding:"3px 5px" }}>+{agent.capabilities.length-3} more</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Test Panel */}
          {selected&&(
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24,height:"fit-content",position:"sticky",top:28,maxHeight:"calc(100vh - 56px)",overflowY:"auto" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
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

              {/* Auto-replace notice */}
              <div style={{ padding:"8px 12px",borderRadius:9,background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.12)",fontSize:11,color:S.muted,marginBottom:10,display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ color:S.accent }}>✓</span>
                {"{{firstName}}"}, {"{{company}}"}, {"{{role}}"} auto-replaced from your input
              </div>

              {/* Tip */}
              <div style={{ padding:"9px 12px",borderRadius:9,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,fontSize:11,color:S.faint,marginBottom:10,lineHeight:1.5 }}>
                {selected.tip}
              </div>

              {/* Load Example */}
              <button onClick={()=>setTestInput(selected.example)}
                style={{ width:"100%",padding:"8px 14px",borderRadius:9,border:"1px solid rgba(200,255,0,0.2)",background:"rgba(200,255,0,0.04)",color:S.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                📋 Load Example Input
              </button>

              <textarea value={testInput} onChange={e=>setTestInput(e.target.value)}
                placeholder={`Paste prospect details here...\n\n${selected.example}`}
                style={{ width:"100%",minHeight:160,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"12px 14px",color:S.text,fontSize:12.5,fontFamily:"Inter,sans-serif",resize:"vertical",outline:"none",lineHeight:1.7,marginBottom:12 }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>

              <button onClick={runAgent} disabled={aiLoading||!testInput.trim()||selected.status==="paused"}
                style={{ width:"100%",padding:"13px",borderRadius:11,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"Inter,sans-serif",marginBottom:aiOutput?14:0,
                  background:selected.status==="paused"?"rgba(255,255,255,0.05)":aiLoading?"rgba(200,255,0,0.6)":!testInput.trim()?"rgba(255,255,255,0.05)":S.accent,
                  color:selected.status==="paused"||!testInput.trim()?S.faint:"#050505",
                  fontSize:14,fontWeight:700,cursor:aiLoading||selected.status==="paused"||!testInput.trim()?"not-allowed":"pointer" }}>
                {aiLoading
                  ?<><span style={{ width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Agent working...</>
                  :selected.status==="paused"?"Agent Paused — Toggle to Activate"
                  :<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Run {selected.name}</>}
              </button>

              {aiOutput&&(
                <div style={{ background:"rgba(0,0,0,0.35)",border:`1px solid ${aiOutput.startsWith("⚠️")||aiOutput.startsWith("Error")?"rgba(248,113,113,0.3)":S.lineSoft}`,borderRadius:12,padding:"16px" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:aiOutput.startsWith("⚠️")||aiOutput.startsWith("Error")?"#f87171":selected.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>
                    {aiOutput.startsWith("⚠️")||aiOutput.startsWith("Error")?"⚠️ Notice":"⚡ Agent Output — Variables Replaced"}
                  </div>
                  <pre style={{ fontSize:13,color:S.text,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",margin:"0 0 14px" }}>{aiOutput}</pre>
                  {!aiOutput.startsWith("⚠️")&&!aiOutput.startsWith("Error")&&(
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={copyOutput}
                        style={{ flex:1,padding:"8px 14px",borderRadius:9,background:copied?"rgba(52,211,153,0.1)":"rgba(200,255,0,0.08)",border:`1px solid ${copied?"rgba(52,211,153,0.3)":"rgba(200,255,0,0.2)"}`,color:copied?"#34d399":S.accent,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
                        {copied?"✓ Copied!":"Copy Output"}
                      </button>
                      <button onClick={()=>{ setAiOutput(""); setTestInput(""); }}
                        style={{ padding:"8px 14px",borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.faint,fontSize:12,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
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
