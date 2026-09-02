"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

const S = {
  bg:"#050505", panel:"#0d1018", panel2:"#111827",
  lineSoft:"rgba(255,255,255,0.06)", text:"#f4f5f7",
  muted:"#9598a3", faint:"#555a66", accent:"#C8FF00"
};

const EXTRA_AGENTS = [
  { id:"e1", type:"emailWriter",      status:"active", meetings_booked:14, emails_sent:127, replies_handled:34,  color:"#C8FF00",  name:"Email Writer",        icon:"✉️",  tagline:"Hyper-personalized cold emails", placeholder:"Paste prospect info:\nName: John Smith\nCompany: Acme Corp\nTitle: VP Sales\nLinkedIn post: [paste their recent post]\nCompany news: [any recent funding/launch]", description:"Write a hyper-personalized cold email for this prospect. Reference their specific LinkedIn activity, company news, or recent milestone. Under 120 words.", badge:"35%+ Reply Rate" },
  { id:"e2", type:"subjectLine",      status:"active", meetings_booked:0,  emails_sent:89,  replies_handled:21,  color:"#818cf8",  name:"Subject Line",        icon:"📌", tagline:"3 high-open subject lines",     placeholder:"Paste your email body or prospect info to generate killer subject lines...", description:"Generate 3 subject lines under 7 words each. Data-backed. No fluff.", badge:"40% Open Rate" },
  { id:"e3", type:"dealAnalyzer",     status:"active", meetings_booked:0,  emails_sent:0,   replies_handled:19,  color:"#f59e0b",  name:"Deal Analyzer",       icon:"📊", tagline:"Deal health score + next steps", placeholder:"Paste your deal notes:\n- Company: \n- Deal size: \n- Stage: \n- Last contact: \n- Champion: \n- Decision maker: \n- Key objections: \n- Timeline: \n- Competitors: ", description:"Analyze this deal and give a health score 0-100, risk factors, and exact next actions.", badge:"Spots Dying Deals" },
  { id:"e4", type:"objectionHandler", status:"active", meetings_booked:0,  emails_sent:0,   replies_handled:67,  color:"#ef4444",  name:"Objection Handler",   icon:"🛡️", tagline:"Turn NO into not yet",           placeholder:"Paste the exact objection you received:\n\nExample: 'We already have Apollo and we're happy with it'\n\nOr: 'Not the right time, maybe next quarter'\n\nOr: 'Your price is too high'", description:"Give me 3 battle-tested responses to this objection. Each under 75 words. Different angles.", badge:"3 Response Frameworks" },
  { id:"e5", type:"meetingSummarizer",status:"active", meetings_booked:0,  emails_sent:0,   replies_handled:31,  color:"#a78bfa",  name:"Meeting Summarizer",  icon:"📝", tagline:"Raw notes → CRM-ready intel",    placeholder:"Paste your raw meeting notes or transcript:\n\nWho attended:\nWhat they said about their situation:\nPain points mentioned:\nObjections:\nNext steps discussed:\nBudget/timeline signals:", description:"Turn these meeting notes into structured CRM intelligence — pain points, buying signals, action items, deal assessment.", badge:"90-Second Intel" },
  { id:"e6", type:"cold_caller",      status:"active", meetings_booked:28, emails_sent:0,   replies_handled:28,  color:"#f97316",  name:"Cold Call Script",    icon:"📞", tagline:"Perfect 8-second openers",      placeholder:"Prospect info:\nName:\nTitle:\nCompany:\nIndustry:\nPain point you're solving:\nYour best proof point:", description:"Write a complete cold call script — opener, bridge, value prop, objection handlers, and close.", badge:"Full Script" },
  { id:"e7", type:"linkedin_writer",  status:"active", meetings_booked:0,  emails_sent:45,  replies_handled:45,  color:"#60a5fa",  name:"LinkedIn Writer",     icon:"💼", tagline:"45%+ acceptance rates",         placeholder:"Paste their LinkedIn profile details:\nName:\nTitle:\nCompany:\nRecent post or activity:\nMutual connections:\nWhy you're reaching out:", description:"Write a connection request (under 280 chars) and a follow-up message after acceptance.", badge:"Peer-to-Peer Tone" },
  { id:"e8", type:"proposal_writer",  status:"active", meetings_booked:0,  emails_sent:12,  replies_handled:12,  color:"#34d399",  name:"Proposal Writer",     icon:"📄", tagline:"Win-ready proposals in minutes", placeholder:"Paste your discovery call notes:\nCompany:\nContact:\nTheir pain points (exact words they used):\nCurrent situation:\nDesired outcome:\nTimeline:\nBudget signals:\nCompetitors they mentioned:", description:"Turn these discovery notes into a polished, client-ready proposal with ROI calculations.", badge:"Closes Faster" },
  { id:"e9", type:"competitor_intel", status:"active", meetings_booked:0,  emails_sent:0,   replies_handled:8,   color:"#e879f9",  name:"Competitor Intel",    icon:"🔍", tagline:"Battle cards that win deals",    placeholder:"Competitor you're up against:\nCompetitor name:\nWhat the prospect said about them:\nDeal size:\nProspect's main concern:\nYour key differentiators:", description:"Create a battle card with their weaknesses, trap questions, and displacement strategy.", badge:"Win More Deals" },
  { id:"e10",type:"revenue_forecaster",status:"active",meetings_booked:0, emails_sent:0,   replies_handled:0,   color:"#f472b6",  name:"Revenue Forecaster",  icon:"📈", tagline:"CFO-ready pipeline forecasts",  placeholder:"Paste your pipeline data:\nTotal pipeline value:\nDeals by stage:\n  - Late stage deals (name, value, close prob):\n  - Mid stage deals:\n  - Early stage:\nQuota this quarter:\nWeeks remaining:", description:"Generate a board-ready revenue forecast with best/base/worst scenarios and specific actions to hit quota.", badge:"3% Accuracy" },
];

export default function AgentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<any>(null);
  const [testInput, setTestInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{msg:string;color:string}>({msg:"",color:S.accent});

  const handleLogout = async () => {
    const { signOut } = await import("@/lib/firebase");
    await signOut();
    router.push("/auth/login");
  };

  const showToast = (msg:string, color=S.accent) => {
    setToast({msg,color});
    setTimeout(()=>setToast({msg:"",color:S.accent}),3000);
  };

  const runAgent = async () => {
    if (!selected || !(testInput||"").trim()) return;
    setAiLoading(true); setAiOutput(""); setCopied(false);
    try {
      const res = await fetch("/api/ai", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type: selected.type, prompt: testInput, userId: user?.uid }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.upgrade) {
          setAiOutput(`⚠️ ${data.error}`);
          showToast("Daily limit reached — upgrade to continue", "#f59e0b");
        } else {
          setAiOutput(`❌ ${data.error}`);
          showToast("Error — try again", "#ef4444");
        }
      } else {
        setAiOutput(data.result);
        showToast("✓ Output ready!", S.accent);
      }
    } catch(e:any) {
      setAiOutput("Connection error. Try again.");
      showToast("Connection error", "#ef4444");
    }
    setAiLoading(false);
  };

  const copyOutput = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
    showToast("Copied to clipboard!", S.accent);
  };

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [user, authLoading]);

  if (authLoading) return <LoadingScreen/>;

  return (
    <div style={{background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif"}}>
      {toast.msg&&<div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:`1px solid ${toast.color}44`,borderRadius:12,padding:"12px 22px",fontSize:13,fontWeight:600,color:toast.color,zIndex:300,whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>{toast.msg}</div>}

      <Sidebar active="agents" user={user} onLogout={handleLogout}/>

      <div style={{marginLeft:240,padding:"28px 32px",minHeight:"100vh"}}>

        {/* Header */}
        <div style={{marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <div style={{fontSize:28}}>🤖</div>
            <h1 style={{fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text,letterSpacing:"-0.03em"}}>
              AI Sales Agents
            </h1>
            <div style={{padding:"3px 10px",borderRadius:999,background:"rgba(200,255,0,0.1)",border:"1px solid rgba(200,255,0,0.2)",fontSize:11,fontWeight:700,color:S.accent}}>
              10 AGENTS
            </div>
          </div>
          <p style={{fontSize:14,color:S.muted}}>
            Click any agent → paste your data → get expert-level output in seconds
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 1fr":"repeat(5,1fr)",gap:16,transition:"all 0.3s"}}>

          {/* LEFT — Agent Grid */}
          <div style={{display:"grid",gridTemplateColumns:selected?"1fr 1fr":"repeat(5,1fr)",gap:12,gridColumn:"1",alignContent:"start"}}>
            {EXTRA_AGENTS.map(agent=>(
              <div key={agent.id}
                onClick={()=>{ setSelected(selected?.id===agent.id?null:agent); setAiOutput(""); setTestInput(""); }}
                style={{
                  background: selected?.id===agent.id ? `${agent.color}10` : S.panel,
                  border: `1px solid ${selected?.id===agent.id ? agent.color+"44" : S.lineSoft}`,
                  borderRadius:16, padding:20, cursor:"pointer",
                  transition:"all 0.2s",
                  boxShadow: selected?.id===agent.id ? `0 0 0 1px ${agent.color}22, 0 8px 32px rgba(0,0,0,0.4)` : "none",
                  transform: selected?.id===agent.id ? "translateY(-2px)" : "none",
                }}
                onMouseEnter={e=>{ if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.12)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; if(selected?.id!==agent.id)(e.currentTarget as HTMLDivElement).style.transform="none"; }}
              >
                {/* Icon + Status */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`${agent.color}15`,border:`1px solid ${agent.color}30`,display:"grid",placeItems:"center",fontSize:20}}>
                    {agent.icon}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:agent.status==="active"?"#34d399":"#555a66",boxShadow:agent.status==="active"?"0 0 8px rgba(52,211,153,0.6)":"none"}}/>
                    <div style={{fontSize:9,fontWeight:700,color:agent.color,padding:"2px 7px",borderRadius:999,background:`${agent.color}12`,border:`1px solid ${agent.color}25`}}>{agent.badge}</div>
                  </div>
                </div>

                <div style={{fontSize:14,fontWeight:700,color:S.text,marginBottom:4,letterSpacing:"-0.01em"}}>{agent.name}</div>
                <div style={{fontSize:11,color:S.muted,lineHeight:1.5,marginBottom:12}}>{agent.tagline}</div>

                {/* Stats */}
                <div style={{display:"flex",gap:10,paddingTop:12,borderTop:`1px solid ${S.lineSoft}`}}>
                  {agent.emails_sent > 0 && (
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:700,color:agent.color}}>{agent.emails_sent}</div>
                      <div style={{fontSize:9,color:S.faint}}>emails</div>
                    </div>
                  )}
                  {agent.replies_handled > 0 && (
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:700,color:agent.color}}>{agent.replies_handled}</div>
                      <div style={{fontSize:9,color:S.faint}}>replies</div>
                    </div>
                  )}
                  {agent.meetings_booked > 0 && (
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:700,color:agent.color}}>{agent.meetings_booked}</div>
                      <div style={{fontSize:9,color:S.faint}}>meetings</div>
                    </div>
                  )}
                  {agent.emails_sent === 0 && agent.replies_handled === 0 && agent.meetings_booked === 0 && (
                    <div style={{fontSize:10,color:S.faint}}>Ready to use</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — Agent Detail Panel */}
          {selected && (
            <div style={{gridColumn:"2",background:S.panel,border:`1px solid ${selected.color}33`,borderRadius:20,padding:28,height:"fit-content",position:"sticky",top:28,boxShadow:`0 0 0 1px ${selected.color}11, 0 24px 60px rgba(0,0,0,0.5)`}}>

              {/* Agent Header */}
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24,paddingBottom:20,borderBottom:`1px solid ${S.lineSoft}`}}>
                <div style={{width:52,height:52,borderRadius:14,background:`${selected.color}15`,border:`1px solid ${selected.color}33`,display:"grid",placeItems:"center",fontSize:24}}>
                  {selected.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:18,fontWeight:800,color:S.text,fontFamily:"Syne,sans-serif",marginBottom:3}}>{selected.name}</div>
                  <div style={{fontSize:12,color:selected.color,fontWeight:600}}>{selected.tagline}</div>
                </div>
                <button onClick={()=>{setSelected(null);setAiOutput("");setTestInput("");}}
                  style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,cursor:"pointer",fontSize:16,display:"grid",placeItems:"center",fontFamily:"inherit"}}>
                  ✕
                </button>
              </div>

              {/* What it does */}
              <div style={{background:"rgba(255,255,255,0.02)",borderRadius:12,padding:"12px 14px",marginBottom:20,border:`1px solid ${S.lineSoft}`}}>
                <div style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>What this agent does</div>
                <div style={{fontSize:13,color:S.muted,lineHeight:1.6}}>{selected.description}</div>
              </div>

              {/* Input */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>
                  Your Input
                </div>
                <textarea
                  value={testInput}
                  onChange={e=>setTestInput(e.target.value)}
                  placeholder={selected.placeholder}
                  rows={8}
                  style={{
                    width:"100%", padding:"14px 16px",
                    background:"rgba(255,255,255,0.03)",
                    border:`1px solid ${(testInput||"").trim() ? selected.color+"44" : S.lineSoft}`,
                    borderRadius:12, color:S.text, fontSize:13,
                    fontFamily:"Inter,sans-serif", lineHeight:1.6,
                    outline:"none", resize:"vertical",
                    transition:"border-color 0.2s",
                    boxSizing:"border-box",
                  }}
                  onFocus={e=>(e.target.style.borderColor=selected.color+"66")}
                  onBlur={e=>(e.target.style.borderColor=(testInput||"").trim()?selected.color+"44":S.lineSoft)}
                />
              </div>

              {/* Run Button */}
              <button onClick={runAgent}
                disabled={aiLoading||!(testInput||"").trim()}
                style={{
                  width:"100%", padding:"14px",
                  borderRadius:12, border:"none",
                  background: aiLoading ? "rgba(200,255,0,0.5)" : !(testInput||"").trim() ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`,
                  color: !(testInput||"").trim() ? S.faint : "#050505",
                  fontSize:14, fontWeight:800,
                  cursor: aiLoading||!(testInput||"").trim() ? "not-allowed" : "pointer",
                  fontFamily:"Syne,sans-serif",
                  transition:"all 0.2s",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  marginBottom:20,
                  boxShadow: (testInput||"").trim() && !aiLoading ? `0 8px 24px ${selected.color}33` : "none",
                }}>
                {aiLoading ? (
                  <>
                    <div style={{width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                    Running Agent...
                  </>
                ) : (
                  <>⚡ Run {selected.name}</>
                )}
              </button>

              {/* Output */}
              {aiOutput && (
                <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${selected.color}33`,borderRadius:14,padding:20,animation:"fadeIn 0.3s ease"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:selected.color,textTransform:"uppercase",letterSpacing:".08em",display:"flex",alignItems:"center",gap:6}}>
                      <span>✓</span> Agent Output
                    </div>
                    <button onClick={copyOutput}
                      style={{padding:"5px 12px",borderRadius:8,background:copied?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${copied?"rgba(52,211,153,0.3)":S.lineSoft}`,color:copied?"#34d399":S.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
                      {copied?"✓ Copied!":"Copy"}
                    </button>
                  </div>
                  <div style={{fontSize:13,color:S.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto"}}>
                    {aiOutput}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}