"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

const S = {
  bg:"#050505", panel:"#0c0e14", panel2:"#111520",
  lineSoft:"rgba(255,255,255,0.06)", text:"#f4f5f7",
  muted:"#8a8d9a", faint:"#3d4150", accent:"#C8FF00"
};

const AGENTS = [
  {
    id:"a1", type:"emailWriter", color:"#C8FF00",
    name:"SDR Agent", icon:"⚡",
    tagline:"Books meetings while you sleep",
    badge:"Most Used",
    stats:{runs:1284, meetings:47, rate:"34%"},
    description:"Your autonomous SDR. Paste prospect info and get a hyper-personalized cold email that references their LinkedIn activity, company news, or recent funding. Reads like your best rep wrote it.",
    placeholder:"Paste prospect details:\n\nName: \nTitle: \nCompany: \nIndustry: \nLinkedIn post or activity: \nCompany news (funding, launch, hire): \nYour value prop: ",
    tips:["Reference their exact LinkedIn post topic","Mention company milestone within 30 days","Keep it under 120 words","One soft CTA only"],
  },
  {
    id:"a2", type:"prospectAnalyzer", color:"#818cf8",
    name:"Prospect Enricher", icon:"🔍",
    tagline:"ICP score + personalization hooks",
    badge:"Apollo Killer",
    stats:{runs:892, meetings:0, rate:"98% accuracy"},
    description:"Paste any prospect's details and get an AI ICP score (0-100), buying intent level, best channel to reach them, and 3 specific personalization hooks. What Apollo charges $8,400/yr to do.",
    placeholder:"Paste prospect info to enrich:\n\nName: \nTitle: \nCompany: \nIndustry: \nCompany size: \nRecent activity or news: \nTech stack (if known): ",
    tips:["More context = higher accuracy","Include recent LinkedIn or news","Add tech stack for better scoring","Check intent signals section"],
  },
  {
    id:"a3", type:"dealAnalyzer", color:"#f59e0b",
    name:"Deal Analyzer", icon:"📊",
    tagline:"Spot dying deals before it's too late",
    badge:"Saves Deals",
    stats:{runs:445, meetings:0, rate:"3 deals saved/mo avg"},
    description:"Paste your deal notes and get a health score 0-100, risk flags ranked by severity, what's actually blocking the deal, and exact next actions with deadlines. Gong charges $1,600/user/yr for this.",
    placeholder:"Paste deal details:\n\nCompany: \nDeal size: $\nStage: \nDays in current stage: \nChampion name/title: \nDecision maker: \nLast meaningful contact: \nKey objections heard: \nCompetitors mentioned: \nTimeline they gave: \nBudget confirmed: Yes/No",
    tips:["Include days in stage — critical signal","Name all stakeholders you know","List exact objections word-for-word","Be honest about missing info"],
  },
  {
    id:"a4", type:"objectionHandler", color:"#ef4444",
    name:"Objection Handler", icon:"🛡️",
    tagline:"Turn NO into not yet",
    badge:"3 Frameworks",
    stats:{runs:2341, meetings:0, rate:"67% conversion"},
    description:"Paste the exact objection and get 3 battle-tested responses — each a different psychological angle. The feel-felt-found, the reframe, and the curiosity pivot. Under 75 words each.",
    placeholder:"Paste the exact objection:\n\nExamples:\n• 'We already use Apollo and we're happy'\n• 'Not the right time, maybe Q2'\n• 'Your price is too high'\n• 'Send me an email'\n• 'We don't have budget right now'\n• 'I need to talk to my team first'\n\nYour objection: ",
    tips:["Use their exact words","Add context about deal stage","Note which framework worked","Never argue — redirect"],
  },
  {
    id:"a5", type:"meetingSummarizer", color:"#a78bfa",
    name:"Meeting Summarizer", icon:"📝",
    tagline:"Raw notes → CRM-ready intel",
    badge:"Saves 45 min/call",
    stats:{runs:678, meetings:0, rate:"90-sec intel"},
    description:"Paste raw meeting notes or transcript. Get structured CRM intelligence — pain points with business impact, buying signals, objections, stakeholder map, action items, and deal assessment. What Gong does for $1,600/user/yr.",
    placeholder:"Paste meeting notes or transcript:\n\nWho attended (names + titles): \nDuration: \nWhat they said about their current situation: \nPain points they mentioned: \nBudget signals: \nTimeline signals: \nObjections or concerns: \nNext steps discussed: \nCompetitors mentioned: \nOverall sentiment (positive/neutral/skeptical): ",
    tips:["More detail = better summary","Include exact quotes when possible","Note tone and sentiment","Always list who said what"],
  },
  {
    id:"a6", type:"cold_caller", color:"#f97316",
    name:"Cold Call Script", icon:"📞",
    tagline:"Perfect 8-second opener every time",
    badge:"Full Script",
    stats:{runs:334, meetings:28, rate:"12% connect rate"},
    description:"Get a complete cold call script — power opener, bridge, value prop, 5 objection handlers, and a two-option close. The first 8 seconds determine everything. Stop winging it.",
    placeholder:"Prospect details for script:\n\nProspect name: \nTitle: \nCompany: \nIndustry: \nSize: \nPain point you're solving: \nYour strongest proof point (number + timeframe): \nCTA you want (demo / call / meeting): ",
    tips:["Memorize the opener — practice it","Customize objection scripts to your style","Time your value prop under 15 seconds","Two-option close always beats open-ended"],
  },
  {
    id:"a7", type:"linkedin_writer", color:"#60a5fa",
    name:"LinkedIn Writer", icon:"💼",
    tagline:"45%+ connection acceptance rates",
    badge:"Peer-to-Peer",
    stats:{runs:567, meetings:0, rate:"45% acceptance"},
    description:"Write a connection request under 280 characters that sounds peer-to-peer, not vendor-to-prospect. Plus a follow-up message after acceptance. References their specific profile, not generic copy.",
    placeholder:"LinkedIn profile details:\n\nName: \nTitle: \nCompany: \nRecent post (copy/paste it): \nMutual connection or group: \nWhy you're connecting (honest): \nYour company/role: ",
    tips:["Never say 'I came across your profile'","Reference ONE specific post","Connection request: 280 chars MAX","Follow-up: 100 words max"],
  },
  {
    id:"a8", type:"proposal_writer", color:"#34d399",
    name:"Proposal Writer", icon:"📄",
    tagline:"Discovery notes → winning proposal",
    badge:"Closes Faster",
    stats:{runs:189, meetings:0, rate:"28% faster close"},
    description:"Turn your discovery call notes into a polished, client-ready proposal with executive summary, cost of inaction, solution, ROI calculation, timeline, and next step. In their language, not yours.",
    placeholder:"Discovery call notes:\n\nCompany: \nContact name + title: \nTheir pain points (exact words they used): \nCurrent situation: \nWhat they've tried before: \nDesired outcome they mentioned: \nTimeline they gave: \nBudget signals: \nCompetitors they mentioned: \nWhat would make this a win for them: ",
    tips:["Use their exact words — mirror language","Always include cost of inaction math","ROI section wins deals","One clear next step only"],
  },
  {
    id:"a9", type:"competitor_intel", color:"#e879f9",
    name:"Competitor Intel", icon:"🎯",
    tagline:"Battle cards that win deals",
    badge:"Win Rate +23%",
    stats:{runs:234, meetings:0, rate:"23% win rate lift"},
    description:"Create a complete battle card — their core weakness, trap questions that expose it, head-to-head comparison, displacement strategy for existing customers, and a one-line closer.",
    placeholder:"Competitive deal details:\n\nCompetitor you're up against: \nWhat the prospect said about them: \nHow long prospect has used them (if existing): \nProspect's main concern about switching: \nYour key differentiators: \nDeal size: \nProspect's role: ",
    tips:["Never badmouth competitors directly","Ask questions that reveal their weakness","Parallel pilot beats rip-and-replace","One-line closer must be memorable"],
  },
  {
    id:"a10", type:"revenue_forecaster", color:"#f472b6",
    name:"Revenue Forecaster", icon:"📈",
    tagline:"Board-ready pipeline forecasts",
    badge:"3% Accuracy",
    stats:{runs:156, meetings:0, rate:"CFO-approved"},
    description:"Input your pipeline stages and deal data. Get a board-ready forecast with conservative/base/upside scenarios, at-risk deals needing intervention, leading indicators to watch, and 3 actions to hit quota.",
    placeholder:"Pipeline data:\n\nTotal pipeline value: $\nQuota this quarter: $\nWeeks remaining in quarter: \n\nDeal breakdown:\nLate stage deals (name, value, close prob %): \nMid stage deals: \nEarly stage: \n\nBiggest risk deals: \nDeals that could pull forward: ",
    tips:["Be honest about close probabilities","Flag deals stuck in stage too long","Conservative scenario = most likely","3 actions must be specific and time-bound"],
  },
  {
    id:"a11", type:"subjectLine", color:"#fb923c",
    name:"Sequence Builder", icon:"🔄",
    tagline:"Multi-touch sequences that convert",
    badge:"#5 Most Used",
    stats:{runs:423, meetings:31, rate:"40% open rate"},
    description:"The #5 most used AI sales feature (Apollo, Outreach). Paste your ICP and goal — get a complete 5-touch sequence: cold email, follow-up 1, follow-up 2, LinkedIn touch, and breakup email. Each step timed and personalized.",
    placeholder:"Sequence details:\n\nTarget ICP (role + industry + company size): \nYour product/service: \nMain pain point you solve: \nBest proof point (number + timeframe): \nGoal of sequence (demo / call / content download): \nTone (formal / casual / direct): \nSequence length (5 or 7 touches): ",
    tips:["Touch 1: Cold email — personalized hook","Touch 2: Day 3 — different angle, shorter","Touch 3: Day 7 — value add (insight/resource)","Touch 4: LinkedIn connection request","Touch 5: Day 14 — breakup email"],
  },
];

export default function AgentsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [selected, setSelected] = useState<typeof AGENTS[0]|null>(null);
  const [testInput, setTestInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState({msg:"",color:S.accent});

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
        setAiOutput(data.upgrade ? `⚠️ ${data.error}` : `❌ ${data.error}`);
        showToast(data.upgrade ? "Upgrade to continue" : "Error — try again", "#ef4444");
      } else {
        setAiOutput(data.result);
        showToast(`✓ ${selected.name} complete!`, selected.color);
      }
    } catch {
      setAiOutput("Connection error. Check your internet and try again.");
      showToast("Connection error", "#ef4444");
    }
    setAiLoading(false);
  };

  const copyOutput = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
    showToast("Copied!", S.accent);
  };

  if (authLoading) return <LoadingScreen/>;

  const totalRuns = AGENTS.reduce((s,a)=>s+a.stats.runs,0);

  return (
    <div style={{background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif"}}>
      {toast.msg&&(
        <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0c0e14",border:`1px solid ${toast.color}55`,borderRadius:14,padding:"12px 24px",fontSize:13,fontWeight:600,color:toast.color,zIndex:300,whiteSpace:"nowrap",boxShadow:"0 12px 40px rgba(0,0,0,0.6)",backdropFilter:"blur(12px)"}}>
          {toast.msg}
        </div>
      )}

      <Sidebar active="agents" user={user} onLogout={handleLogout}/>

      <div style={{marginLeft:240,padding:"32px",minHeight:"100vh"}}>

        {/* ── Header ── */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:32}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
              <h1 style={{fontFamily:"Syne,sans-serif",fontSize:30,fontWeight:900,color:S.text,letterSpacing:"-0.04em"}}>
                AI Sales Agents
              </h1>
              <div style={{padding:"4px 12px",borderRadius:999,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",fontSize:11,fontWeight:800,color:S.accent,letterSpacing:".05em"}}>
                11 AGENTS
              </div>
            </div>
            <p style={{fontSize:14,color:S.muted,lineHeight:1.5}}>
              Specialized AI copilots trained for every sales task — click any agent and paste your data
            </p>
          </div>
          {/* Global stats */}
          <div style={{display:"flex",gap:12,flexShrink:0}}>
            {[
              {label:"Total Runs",val:totalRuns.toLocaleString(),color:S.accent},
              {label:"Meetings Booked",val:"75",color:"#34d399"},
              {label:"Active",val:"11/11",color:"#818cf8"},
            ].map(s=>(
              <div key={s.label} style={{textAlign:"center",padding:"10px 18px",background:S.panel,borderRadius:12,border:`1px solid ${S.lineSoft}`}}>
                <div style={{fontSize:20,fontWeight:900,color:s.color,fontFamily:"Syne,sans-serif",letterSpacing:"-0.03em"}}>{s.val}</div>
                <div style={{fontSize:10,color:S.faint,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 440px":"1fr",gap:20,alignItems:"start",transition:"all 0.3s"}}>

          {/* ── Agent Grid ── */}
          <div style={{display:"grid",gridTemplateColumns:selected?"repeat(2,1fr)":"repeat(5,1fr)",gap:12,transition:"all 0.3s"}}>
            {AGENTS.map(agent=>{
              const isSelected = selected?.id===agent.id;
              return (
                <div key={agent.id}
                  onClick={()=>{setSelected(isSelected?null:agent);setAiOutput("");setTestInput("");}}
                  style={{
                    background: isSelected ? `${agent.color}0d` : S.panel,
                    border:`1px solid ${isSelected?agent.color+"55":S.lineSoft}`,
                    borderRadius:18, padding:20, cursor:"pointer",
                    transition:"all 0.2s ease",
                    transform:isSelected?"translateY(-3px)":"none",
                    boxShadow:isSelected?`0 0 0 1px ${agent.color}22, 0 12px 40px rgba(0,0,0,0.5)`:"none",
                    position:"relative",overflow:"hidden",
                  }}
                  onMouseEnter={e=>{
                    if(!isSelected){
                      (e.currentTarget as HTMLDivElement).style.borderColor=`${agent.color}33`;
                      (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)";
                      (e.currentTarget as HTMLDivElement).style.background=`${agent.color}06`;
                    }
                  }}
                  onMouseLeave={e=>{
                    if(!isSelected){
                      (e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft;
                      (e.currentTarget as HTMLDivElement).style.transform="none";
                      (e.currentTarget as HTMLDivElement).style.background=S.panel;
                    }
                  }}>

                  {/* Glow top-right */}
                  {isSelected&&<div style={{position:"absolute",top:-30,right:-30,width:80,height:80,borderRadius:"50%",background:`${agent.color}15`,filter:"blur(20px)",pointerEvents:"none"}}/>}

                  {/* Icon row */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                    <div style={{
                      width:46,height:46,borderRadius:13,
                      background:`${agent.color}12`,
                      border:`1px solid ${agent.color}25`,
                      display:"grid",placeItems:"center",
                      fontSize:22,
                      boxShadow:isSelected?`0 4px 16px ${agent.color}22`:"none",
                    }}>
                      {agent.icon}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 8px rgba(52,211,153,0.7)"}}/>
                      <div style={{fontSize:9,fontWeight:800,color:agent.color,padding:"2px 8px",borderRadius:999,background:`${agent.color}10`,border:`1px solid ${agent.color}22`,whiteSpace:"nowrap"}}>
                        {agent.badge}
                      </div>
                    </div>
                  </div>

                  {/* Name + tagline */}
                  <div style={{fontSize:14,fontWeight:800,color:S.text,marginBottom:4,letterSpacing:"-0.02em",fontFamily:"Syne,sans-serif"}}>
                    {agent.name}
                  </div>
                  <div style={{fontSize:11,color:S.muted,lineHeight:1.5,marginBottom:14}}>
                    {agent.tagline}
                  </div>

                  {/* Stats */}
                  <div style={{display:"flex",gap:12,paddingTop:12,borderTop:`1px solid ${S.lineSoft}`}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:agent.color,fontFamily:"Syne,sans-serif"}}>{agent.stats.runs.toLocaleString()}</div>
                      <div style={{fontSize:9,color:S.faint}}>runs</div>
                    </div>
                    {agent.stats.meetings>0&&(
                      <div>
                        <div style={{fontSize:15,fontWeight:800,color:"#34d399",fontFamily:"Syne,sans-serif"}}>{agent.stats.meetings}</div>
                        <div style={{fontSize:9,color:S.faint}}>meetings</div>
                      </div>
                    )}
                    <div style={{marginLeft:"auto",textAlign:"right"}}>
                      <div style={{fontSize:11,fontWeight:700,color:agent.color}}>{agent.stats.rate}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Detail Panel ── */}
          {selected&&(
            <div style={{
              background:S.panel,
              border:`1px solid ${selected.color}33`,
              borderRadius:22,padding:28,
              position:"sticky",top:28,
              boxShadow:`0 0 0 1px ${selected.color}11,0 32px 80px rgba(0,0,0,0.6)`,
              animation:"slideIn 0.2s ease",
            }}>

              {/* Panel header */}
              <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:24,paddingBottom:20,borderBottom:`1px solid ${S.lineSoft}`}}>
                <div style={{width:52,height:52,borderRadius:15,background:`${selected.color}12`,border:`1px solid ${selected.color}30`,display:"grid",placeItems:"center",fontSize:24,flexShrink:0,boxShadow:`0 4px 20px ${selected.color}20`}}>
                  {selected.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:18,fontWeight:900,color:S.text,fontFamily:"Syne,sans-serif",letterSpacing:"-0.03em"}}>{selected.name}</div>
                  <div style={{fontSize:12,color:selected.color,fontWeight:600,marginTop:2}}>{selected.tagline}</div>
                </div>
                <button
                  onClick={()=>{setSelected(null);setAiOutput("");setTestInput("");}}
                  style={{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,cursor:"pointer",fontSize:18,display:"grid",placeItems:"center",fontFamily:"inherit",flexShrink:0,transition:"all 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.08)"}
                  onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.04)"}
                >✕</button>
              </div>

              {/* Description */}
              <p style={{fontSize:13,color:S.muted,lineHeight:1.75,marginBottom:18}}>
                {selected.description}
              </p>

              {/* Tips */}
              <div style={{background:"rgba(255,255,255,0.02)",borderRadius:12,padding:"14px",marginBottom:20,border:`1px solid ${S.lineSoft}`}}>
                <div style={{fontSize:10,fontWeight:800,color:selected.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>
                  Pro Tips
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {selected.tips.map((tip,i)=>(
                    <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <span style={{color:selected.color,fontSize:12,marginTop:1,flexShrink:0}}>→</span>
                      <span style={{fontSize:12,color:S.muted,lineHeight:1.5}}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>
                  Your Input
                </div>
                <textarea
                  value={testInput}
                  onChange={e=>setTestInput(e.target.value)}
                  placeholder={selected.placeholder}
                  rows={9}
                  style={{
                    width:"100%",padding:"14px 16px",
                    background:"rgba(255,255,255,0.025)",
                    border:`1px solid ${(testInput||"").trim()?selected.color+"44":S.lineSoft}`,
                    borderRadius:13,color:S.text,fontSize:13,
                    fontFamily:"Inter,sans-serif",lineHeight:1.65,
                    outline:"none",resize:"vertical",
                    transition:"border-color 0.2s",
                    boxSizing:"border-box",
                  }}
                  onFocus={e=>(e.target.style.borderColor=selected.color+"66")}
                  onBlur={e=>(e.target.style.borderColor=(testInput||"").trim()?selected.color+"44":S.lineSoft)}
                />
              </div>

              {/* Run button */}
              <button
                onClick={runAgent}
                disabled={aiLoading||!(testInput||"").trim()}
                style={{
                  width:"100%",padding:"15px",borderRadius:13,border:"none",
                  background: aiLoading?"rgba(200,255,0,0.4)":!(testInput||"").trim()?"rgba(255,255,255,0.04)":`linear-gradient(135deg,${selected.color},${selected.color}bb)`,
                  color:!(testInput||"").trim()?S.faint:"#050505",
                  fontSize:14,fontWeight:900,
                  cursor:aiLoading||!(testInput||"").trim()?"not-allowed":"pointer",
                  fontFamily:"Syne,sans-serif",letterSpacing:"-0.01em",
                  transition:"all 0.2s",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  marginBottom:18,
                  boxShadow:(testInput||"").trim()&&!aiLoading?`0 8px 28px ${selected.color}30`:"none",
                }}>
                {aiLoading?(
                  <>
                    <div style={{width:16,height:16,border:"2px solid rgba(0,0,0,0.15)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                    Agent running...
                  </>
                ):(
                  <>⚡ Run {selected.name}</>
                )}
              </button>

              {/* Output */}
              {aiOutput&&(
                <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${selected.color}33`,borderRadius:15,padding:20,animation:"fadeIn 0.25s ease"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:selected.color,boxShadow:`0 0 8px ${selected.color}`}}/>
                      <span style={{fontSize:10,fontWeight:800,color:selected.color,textTransform:"uppercase",letterSpacing:".08em"}}>Output Ready</span>
                    </div>
                    <button
                      onClick={copyOutput}
                      style={{padding:"5px 14px",borderRadius:9,background:copied?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.05)",border:`1px solid ${copied?"rgba(52,211,153,0.4)":S.lineSoft}`,color:copied?"#34d399":S.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
                      {copied?"✓ Copied!":"Copy"}
                    </button>
                  </div>
                  <div style={{fontSize:13,color:S.text,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:420,overflowY:"auto",paddingRight:4}}>
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
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.12)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
    </div>
  );
}
