"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useAgents, type DbAgent } from "@/components/useAgents";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

// 10 AGENTS — 5 from DB + 5 extra UI agents
const EXTRA_AGENTS = [
  { id:"e1",name:"Cold Call Script Writer",type:"cold_caller",status:"active",meetings_booked:0,emails_sent:0,replies_handled:28,description:"Writes personalized cold call scripts based on prospect research. Includes opening hook, value prop, objection handlers, and close.",icon:"M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",color:"#f59e0b",bg:"rgba(245,158,11,0.08)",placeholder:"e.g. James Morrison, VP Sales at Stripe. Pain point: manual prospecting taking 4hrs/day..." },
  { id:"e2",name:"LinkedIn Message Writer",type:"linkedin_writer",status:"active",meetings_booked:0,emails_sent:0,replies_handled:64,description:"Crafts hyper-personalized LinkedIn connection requests and messages. References specific posts, achievements, and mutual connections.",icon:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z",color:"#60a5fa",bg:"rgba(96,165,250,0.08)",placeholder:"e.g. Sarah Chen, CRO at Linear. She recently posted about scaling outbound 10x. We have a solution..." },
  { id:"e3",name:"Proposal Writer",type:"proposal_writer",status:"active",meetings_booked:0,emails_sent:0,replies_handled:12,description:"Generates fully customized sales proposals with ROI calculations, case studies, pricing options, and implementation timeline.",icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",color:"#a78bfa",bg:"rgba(167,139,250,0.08)",placeholder:"e.g. Acme Corp needs 10 sales seats, budget $5K/mo, main pain is manual prospecting, 50 person sales team..." },
  { id:"e4",name:"Competitive Intel Agent",type:"competitor_intel",status:"active",meetings_booked:0,emails_sent:0,replies_handled:19,description:"Analyzes competitors mentioned by prospects and generates battle cards with specific talking points to win the comparison.",icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",color:"#f472b6",bg:"rgba(244,114,182,0.08)",placeholder:"e.g. Prospect said they're evaluating Apollo.io and Outreach. We need to win this comparison..." },
  { id:"e5",name:"Revenue Forecast Agent",type:"revenue_forecaster",status:"paused",meetings_booked:0,emails_sent:0,replies_handled:0,description:"Analyzes your pipeline and generates accurate revenue forecasts with deal-by-deal probability scoring and timeline predictions.",icon:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",color:"#34d399",bg:"rgba(52,211,153,0.08)",placeholder:"e.g. Q3 pipeline: 12 deals, total value $340K, 4 in negotiation, 3 in demo stage, 5 new..." },
];

const DB_AGENT_META: Record<string,{description:string;icon:string;color:string;bg:string;placeholder:string}> = {
  sdr:{ description:"Fully autonomous SDR that finds prospects, writes personalized emails, handles replies, and books meetings 24/7.",icon:"M13 10V3L4 14h7v7l9-11h-7z",color:"#C8FF00",bg:"rgba(200,255,0,0.08)",placeholder:"e.g. James Morrison, VP Sales at Stripe, 5000 employees, Fintech..." },
  email_coach:{ description:"Real-time AI that analyzes your emails before sending and suggests improvements to maximize reply rates.",icon:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",color:"#818cf8",bg:"rgba(129,140,248,0.08)",placeholder:"e.g. Email about SalesForge AI for a VP Sales at fintech company..." },
  deal_analyzer:{ description:"Monitors your pipeline and flags at-risk deals 14 days before they die. Suggests next best actions.",icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",color:"#f59e0b",bg:"rgba(245,158,11,0.08)",placeholder:"e.g. Figma deal, CRO is decision maker, last contact 2 weeks ago..." },
  objection_handler:{ description:"AI that handles common sales objections in real-time with personalized, contextual responses.",icon:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",color:"#34d399",bg:"rgba(52,211,153,0.08)",placeholder:"e.g. We're already using Apollo and don't have budget right now..." },
  meeting_summarizer:{ description:"Joins your sales calls, takes notes, extracts action items, and auto-updates your CRM after every meeting.",icon:"M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",color:"#a78bfa",bg:"rgba(167,139,250,0.08)",placeholder:"e.g. Call with James from Stripe. Discussed pricing, 3 seats, concerned about onboarding..." },
};

const AI_TYPES: Record<string,string> = {
  sdr:"emailWriter", email_coach:"subjectLine", deal_analyzer:"dealAnalyzer",
  objection_handler:"objectionHandler", meeting_summarizer:"meetingSummarizer",
  cold_caller:"emailWriter", linkedin_writer:"iceBreaker", proposal_writer:"dealAnalyzer",
  competitor_intel:"objectionHandler", revenue_forecaster:"dealAnalyzer",
};

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

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const allAgents = [
    ...agents.map(a => ({ ...a, ...(DB_AGENT_META[a.type]??DB_AGENT_META.sdr), isDb:true })),
    ...extraAgents.map(a => ({ ...a, isDb:false })),
  ];

  const handleToggle = async (agent: any) => {
    setToggling(agent.id);
    try {
      if (agent.isDb) {
        await toggleAgent(agent.id, agent.status);
      } else {
        setExtraAgents(prev => prev.map(a => a.id===agent.id ? {...a, status:a.status==="active"?"paused":"active"} : a));
      }
      if (selected?.id===agent.id) setSelected((prev:any) => prev ? {...prev, status:prev.status==="active"?"paused":"active"} : null);
      showToast(agent.status==="active" ? `${agent.name} paused` : `${agent.name} activated ⚡`);
    } catch (err:any) { showToast(`Error: ${err.message}`); }
    setToggling(null);
  };

  const runAgent = async () => {
    if (!selected||!testInput.trim()) return;
    setAiLoading(true); setAiOutput("");
    try {
      const type = AI_TYPES[selected.type] ?? "emailWriter";
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type, prompt:testInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiOutput(data.result ?? "No response.");
    } catch (err:any) { setAiOutput(`Error: ${err.message}`); }
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
            <p style={{ color:S.muted,fontSize:14 }}>{allAgents.length} autonomous agents · Apollo has 1 basic AI assistant — we have {allAgents.length} specialized agents</p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ fontSize:13,color:S.muted }}><span style={{ color:S.accent,fontWeight:700 }}>{activeCount}</span>/{allAgents.length} active</div>
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"7px 14px",borderRadius:999 }}>
              <span style={{ width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block",animation:"ping 1.5s infinite" }}/>{activeCount} Running
            </div>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 420px":"1fr",gap:20 }}>
          {/* Agents Grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14,alignContent:"start" }}>
            {allAgents.map(agent=>(
              <div key={agent.id}
                onClick={()=>{ setSelected(selected?.id===agent.id?null:agent); setAiOutput(""); setTestInput(""); }}
                style={{ background:S.panel,border:`1px solid ${selected?.id===agent.id?"rgba(200,255,0,0.3)":S.lineSoft}`,borderRadius:14,padding:20,cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e=>{ if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"; }}
                onMouseLeave={e=>{ if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:38,height:38,borderRadius:10,background:agent.bg,border:`1px solid ${agent.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={agent.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={agent.icon}/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:S.text }}>{agent.name}</div>
                      <div style={{ fontSize:11,fontWeight:600,marginTop:2,color:agent.status==="active"?"#34d399":S.faint }}>
                        {agent.status==="active"?"● Active":"○ Paused"}
                        {(agent as any).isDb && <span style={{ marginLeft:6,fontSize:9,color:S.faint }}>DB ✓</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); handleToggle(agent); }} disabled={toggling===agent.id}
                    style={{ width:40,height:22,borderRadius:999,border:"none",cursor:"pointer",background:agent.status==="active"?S.accent:"rgba(255,255,255,0.1)",transition:"all 0.3s",position:"relative",flexShrink:0 }}>
                    <div style={{ position:"absolute",top:2,left:agent.status==="active"?20:2,width:18,height:18,borderRadius:"50%",background:agent.status==="active"?"#050505":"rgba(255,255,255,0.4)",transition:"all 0.3s" }}/>
                  </button>
                </div>
                <p style={{ fontSize:12,color:S.muted,lineHeight:1.6,marginBottom:12 }}>{agent.description}</p>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6 }}>
                  {[["Meetings",agent.meetings_booked,agent.color],["Emails",agent.emails_sent,"#818cf8"],["Replies",agent.replies_handled,"#34d399"]].map(([l,v,c])=>(
                    <div key={l as string} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:8,padding:"8px 6px",textAlign:"center" }}>
                      <div style={{ fontSize:15,fontWeight:800,color:c as string,fontFamily:"Syne,sans-serif" }}>{v as number}</div>
                      <div style={{ fontSize:9,color:S.faint,marginTop:1 }}>{l as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Test Panel */}
          {selected&&(
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24,height:"fit-content",position:"sticky",top:28 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:selected.bg,border:`1px solid ${selected.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={selected.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={selected.icon}/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:S.text }}>Test {selected.name}</div>
                  <div style={{ fontSize:11,color:S.faint }}>OpenRouter AI · Free models</div>
                </div>
                <button onClick={()=>{ setSelected(null); setAiOutput(""); setTestInput(""); }} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div style={{ fontSize:11,color:S.faint,marginBottom:8,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}` }}>
                💡 {selected.placeholder}
              </div>

              <textarea value={testInput} onChange={e=>setTestInput(e.target.value)}
                placeholder="Enter details for the agent..."
                style={{ width:"100%",minHeight:110,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:"10px 12px",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",resize:"vertical",outline:"none",lineHeight:1.6,marginBottom:12 }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>

              <button onClick={runAgent} disabled={aiLoading||!testInput.trim()||selected.status==="paused"}
                style={{ width:"100%",padding:"11px",borderRadius:10,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"Inter,sans-serif",marginBottom:aiOutput?14:0,
                  background:selected.status==="paused"?"rgba(255,255,255,0.05)":aiLoading?"rgba(200,255,0,0.6)":S.accent,
                  color:selected.status==="paused"?S.faint:"#050505",
                  fontSize:13,fontWeight:700,cursor:aiLoading||selected.status==="paused"?"not-allowed":"pointer" }}>
                {aiLoading
                  ?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Running...</>
                  :selected.status==="paused"?"Agent Paused — Toggle to Activate"
                  :<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Run Agent</>}
              </button>

              {aiOutput&&(
                <div style={{ background:"rgba(0,0,0,0.3)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"14px 16px" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:selected.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>⚡ Agent Output</div>
                  <pre style={{ fontSize:12,color:S.text,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",margin:"0 0 10px" }}>{aiOutput}</pre>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>navigator.clipboard.writeText(aiOutput).then(()=>showToast("Copied ✓"))}
                      style={{ flex:1,padding:"6px 14px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                      Copy
                    </button>
                    <button onClick={()=>setAiOutput("")}
                      style={{ padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.faint,fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ping{0%,100%{box-shadow:0 0 0 0 rgba(200,255,0,0.4)}50%{box-shadow:0 0 0 6px rgba(200,255,0,0)}}
        textarea::placeholder{color:#555a66}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
