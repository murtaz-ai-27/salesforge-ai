"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useAgents, type DbAgent } from "@/components/useAgents";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const AGENT_META: Record<string,{description:string;icon:string;color:string;bg:string;capabilities:string[];placeholder:string}> = {
  sdr:{ description:"Fully autonomous SDR that finds prospects, writes personalized emails, handles replies, and books meetings 24/7.",icon:"M13 10V3L4 14h7v7l9-11h-7z",color:"#C8FF00",bg:"rgba(200,255,0,0.08)",capabilities:["Prospect discovery","Email personalization","Reply handling","Meeting booking","Follow-up sequences","CRM sync"],placeholder:"e.g. James Morrison, VP Sales at Stripe, 5000 employees, Fintech, recently raised Series D..." },
  email_coach:{ description:"Real-time AI that analyzes your emails before sending and suggests improvements to maximize reply rates.",icon:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",color:"#818cf8",bg:"rgba(129,140,248,0.08)",capabilities:["Email scoring","Subject line optimization","Personalization suggestions","Spam check","Tone analysis"],placeholder:"e.g. Email context about SalesForge AI for a VP Sales at a fintech company..." },
  deal_analyzer:{ description:"Monitors your pipeline and flags at-risk deals 14 days before they die. Suggests next best actions.",icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",color:"#f59e0b",bg:"rgba(245,158,11,0.08)",capabilities:["Deal health scoring","Risk detection","Next action suggestions","Stakeholder mapping","Win probability"],placeholder:"e.g. Figma, Design SaaS, 1000 employees, Series E, CRO is decision maker, last contact 2 weeks ago..." },
  objection_handler:{ description:"AI that handles common sales objections in real-time with personalized, contextual responses.",icon:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",color:"#34d399",bg:"rgba(52,211,153,0.08)",capabilities:["Price objections","Competitor comparisons","Timing objections","Authority objections","Custom responses"],placeholder:"e.g. We're already using Apollo and don't have budget for another tool right now..." },
  meeting_summarizer:{ description:"Joins your sales calls, takes notes, extracts action items, and auto-updates your CRM after every meeting.",icon:"M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",color:"#a78bfa",bg:"rgba(167,139,250,0.08)",capabilities:["Call transcription","Action item extraction","CRM auto-update","Sentiment analysis","Follow-up drafts"],placeholder:"e.g. Call with James from Stripe. Discussed pricing, they want 3 seats, concerned about onboarding time..." },
};

export default function AgentsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const { agents, loading: dataLoading, toggleAgent } = useAgents(user?.uid);
  const [selected, setSelected] = useState<DbAgent|null>(null);
  const [testInput, setTestInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toggling, setToggling] = useState<string|null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""), 3000); };

  const handleToggle = async (agent: DbAgent) => {
    setToggling(agent.id);
    try {
      await toggleAgent(agent.id, agent.status);
      if (selected?.id === agent.id) {
        setSelected(prev => prev ? { ...prev, status: prev.status === "active" ? "paused" : "active" } : null);
      }
      showToast(agent.status === "active" ? `${agent.name} paused` : `${agent.name} activated ⚡`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
    setToggling(null);
  };

  const runAgent = async () => {
    if (!selected || !testInput.trim()) return;
    setAiLoading(true);
    setAiOutput("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selected.type, prompt: testInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiOutput(data.result ?? "No response.");
    } catch (err: any) {
      setAiOutput(`Error: ${err.message}`);
    }
    setAiLoading(false);
  };

  const loading = authLoading || dataLoading;
  if (loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const activeCount = agents.filter(a => a.status === "active").length;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast && <div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:"1px solid rgba(200,255,0,0.3)",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:S.accent,zIndex:300,whiteSpace:"nowrap" }}>{toast}</div>}
      <Sidebar active="agents" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>AI Agents</h1>
            <p style={{ color:S.muted,fontSize:14 }}>Autonomous agents working your pipeline 24/7 · Saved in Supabase ✓</p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ fontSize:13,color:S.muted }}><span style={{ color:S.accent,fontWeight:700 }}>{activeCount}</span>/{agents.length} active</div>
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"7px 14px",borderRadius:999 }}>
              <span style={{ width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block",animation:"ping 1.5s infinite" }}/>{activeCount} Running
            </div>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 420px":"1fr",gap:20 }}>

          {/* Agents Grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16,alignContent:"start" }}>
            {agents.map(agent => {
              const meta = AGENT_META[agent.type] ?? AGENT_META.sdr;
              const isSelected = selected?.id === agent.id;
              return (
                <div key={agent.id}
                  onClick={()=>{ setSelected(isSelected?null:agent); setAiOutput(""); setTestInput(""); }}
                  style={{ background:S.panel,border:`1px solid ${isSelected?"rgba(200,255,0,0.3)":S.lineSoft}`,borderRadius:16,padding:22,cursor:"pointer",transition:"all 0.2s",boxShadow:isSelected?"0 0 0 1px rgba(200,255,0,0.1),0 8px 32px rgba(0,0,0,0.3)":"none" }}
                  onMouseEnter={e=>{ if(!isSelected)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e=>{ if(!isSelected)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; }}>

                  <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:42,height:42,borderRadius:12,background:meta.bg,border:`1px solid ${meta.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={meta.icon}/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize:14,fontWeight:700,color:S.text }}>{agent.name}</div>
                        <div style={{ fontSize:11,fontWeight:600,marginTop:2,color:agent.status==="active"?"#34d399":S.faint }}>
                          {agent.status==="active"?"● Active":"○ Paused"}
                        </div>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button onClick={e=>{ e.stopPropagation(); handleToggle(agent); }} disabled={toggling===agent.id}
                      style={{ width:44,height:24,borderRadius:999,border:"none",cursor:toggling===agent.id?"not-allowed":"pointer",background:agent.status==="active"?S.accent:"rgba(255,255,255,0.1)",transition:"all 0.3s",position:"relative",flexShrink:0 }}>
                      <div style={{ position:"absolute",top:3,left:agent.status==="active"?23:3,width:18,height:18,borderRadius:"50%",background:agent.status==="active"?"#050505":"rgba(255,255,255,0.5)",transition:"all 0.3s" }}/>
                    </button>
                  </div>

                  <p style={{ fontSize:12.5,color:S.muted,lineHeight:1.6,marginBottom:16 }}>{meta.description}</p>

                  {/* Stats from DB */}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
                    {[["Meetings",agent.meetings_booked,meta.color],["Emails",agent.emails_sent,"#818cf8"],["Replies",agent.replies_handled,"#34d399"]].map(([l,v,c])=>(
                      <div key={l as string} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:"10px 8px",textAlign:"center" }}>
                        <div style={{ fontSize:16,fontWeight:800,color:c as string,fontFamily:"Syne,sans-serif" }}>{v as number}</div>
                        <div style={{ fontSize:10,color:S.faint,marginTop:2 }}>{l as string}</div>
                      </div>
                    ))}
                  </div>

                  {/* Capabilities */}
                  <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                    {meta.capabilities.slice(0,4).map(c=>(
                      <span key={c} style={{ fontSize:11,color:S.muted,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,padding:"3px 9px",borderRadius:999 }}>{c}</span>
                    ))}
                    {meta.capabilities.length>4&&<span style={{ fontSize:11,color:S.faint,padding:"3px 6px" }}>+{meta.capabilities.length-4}</span>}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {agents.length===0&&(
              <div style={{ gridColumn:"1/-1",padding:"48px 24px",textAlign:"center",background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16 }}>
                <div style={{ fontSize:32,marginBottom:12 }}>🤖</div>
                <div style={{ fontSize:14,fontWeight:600,color:S.text,marginBottom:6 }}>Loading AI Agents...</div>
                <div style={{ fontSize:12,color:S.faint }}>Agents are being created for your account</div>
              </div>
            )}
          </div>

          {/* Test Panel */}
          {selected && (() => {
            const meta = AGENT_META[selected.type] ?? AGENT_META.sdr;
            return (
              <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24,height:"fit-content",position:"sticky",top:28 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:meta.bg,border:`1px solid ${meta.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={meta.icon}/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:S.text }}>Test {selected.name}</div>
                    <div style={{ fontSize:11,color:S.faint }}>Powered by OpenRouter AI · Results NOT saved</div>
                  </div>
                  <button onClick={()=>{ setSelected(null); setAiOutput(""); setTestInput(""); }} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint,padding:4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                <div style={{ fontSize:11,color:S.faint,marginBottom:8,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}` }}>
                  💡 {meta.placeholder}
                </div>

                <textarea value={testInput} onChange={e=>setTestInput(e.target.value)}
                  placeholder="Enter details for the agent to process..."
                  style={{ width:"100%",minHeight:120,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"12px 14px",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",resize:"vertical",outline:"none",lineHeight:1.6,marginBottom:12 }}
                  onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                  onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>

                <button onClick={runAgent} disabled={aiLoading||!testInput.trim()||selected.status==="paused"}
                  style={{ width:"100%",padding:"12px",borderRadius:11,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"Inter,sans-serif",marginBottom:aiOutput?16:0,
                    background:selected.status==="paused"?"rgba(255,255,255,0.05)":aiLoading?"rgba(200,255,0,0.6)":S.accent,
                    color:selected.status==="paused"?S.faint:"#050505",
                    fontSize:14,fontWeight:700,cursor:aiLoading||selected.status==="paused"?"not-allowed":"pointer",transition:"all 0.2s" }}>
                  {aiLoading
                    ?<><span style={{ width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Running Agent...</>
                    :selected.status==="paused"
                    ?"Agent Paused — Toggle to Activate"
                    :<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Run Agent</>}
                </button>

                {(aiOutput||aiLoading)&&(
                  <div style={{ background:"rgba(0,0,0,0.35)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"14px 16px" }}>
                    <div style={{ fontSize:10,fontWeight:700,color:meta.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>⚡ Agent Output</div>
                    {aiLoading
                      ?<div style={{ display:"flex",gap:6,alignItems:"center" }}>
                          {[0,1,2].map(i=><div key={i} style={{ width:8,height:8,borderRadius:"50%",background:S.accent,animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>)}
                          <span style={{ fontSize:12,color:S.faint,marginLeft:4 }}>AI is thinking...</span>
                        </div>
                      :<>
                          <pre style={{ fontSize:12.5,color:S.text,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",margin:"0 0 12px" }}>{aiOutput}</pre>
                          <button onClick={()=>navigator.clipboard.writeText(aiOutput).then(()=>showToast("Copied ✓"))}
                            style={{ padding:"6px 14px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                            Copy Output
                          </button>
                        </>
                    }
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ping{0%,100%{box-shadow:0 0 0 0 rgba(200,255,0,0.4)}50%{box-shadow:0 0 0 6px rgba(200,255,0,0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        textarea::placeholder{color:#555a66}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
