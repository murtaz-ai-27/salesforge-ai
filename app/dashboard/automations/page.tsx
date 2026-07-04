"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00",violet:"#7c3aed" };

const AUTOMATIONS = [
  { id:"1",name:"New Lead Auto-Enrichment",category:"Prospecting",status:"active",trigger:"New prospect added",action:"AI enriches data + scores ICP fit",runs:1284,saved:"4.2 hrs/day",icon:"M13 10V3L4 14h7v7l9-11h-7z",color:"#C8FF00",bg:"rgba(200,255,0,0.08)",description:"When a new prospect is added, AI automatically researches their LinkedIn, company news, recent funding, and tech stack. Scores them 0-100 against your ICP and assigns buying intent." },
  { id:"2",name:"Hot Lead Instant Alert",category:"Alerts",status:"active",trigger:"Lead score > 85",action:"Instant notification + AI email drafted",runs:47,saved:"2.1 hrs/day",icon:"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",color:"#f59e0b",bg:"rgba(245,158,11,0.08)",description:"When any prospect's AI score crosses 85, instantly sends you an alert with AI-drafted personalized email ready to send. Never miss a hot lead again." },
  { id:"3",name:"Auto Follow-Up Sequence",category:"Outreach",status:"active",trigger:"No reply in 3 days",action:"AI sends follow-up with new angle",runs:892,saved:"6.8 hrs/day",icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",color:"#818cf8",bg:"rgba(129,140,248,0.08)",description:"If a prospect hasn't replied in 3 days, AI automatically sends a follow-up with a completely different angle, value proposition, and CTA. Runs up to 5 touches before marking as cold." },
  { id:"4",name:"Meeting Prep Briefing",category:"Meetings",status:"active",trigger:"Meeting scheduled",action:"AI generates full briefing doc",runs:47,saved:"1.5 hrs/day",icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",color:"#34d399",bg:"rgba(52,211,153,0.08)",description:"30 minutes before every sales call, AI generates a complete briefing: prospect background, company news, pain points, suggested questions, objection responses, and competitor intel." },
  { id:"5",name:"Deal Risk Monitor",category:"Pipeline",status:"active",trigger:"No activity for 7 days",action:"AI flags deal + suggests rescue action",runs:23,saved:"3.2 hrs/day",icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",color:"#f87171",bg:"rgba(248,113,113,0.08)",description:"Continuously monitors every deal in your pipeline. If there's no activity for 7 days, AI analyzes the situation and generates a personalized rescue strategy with specific next actions." },
  { id:"6",name:"LinkedIn Intent Tracker",category:"Prospecting",status:"active",trigger:"Prospect visits your LinkedIn",action:"AI sends personalized connection message",runs:284,saved:"2.8 hrs/day",icon:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z",color:"#60a5fa",bg:"rgba(96,165,250,0.08)",description:"Tracks when prospects from your list view your LinkedIn profile or company page. Automatically sends a perfectly-timed, personalized connection request within minutes of the visit." },
  { id:"7",name:"Reply Sentiment Router",category:"Inbox",status:"active",trigger:"New email reply received",action:"AI categorizes + routes to right action",runs:156,saved:"1.9 hrs/day",icon:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",color:"#a78bfa",bg:"rgba(167,139,250,0.08)",description:"Every inbound reply is instantly analyzed for sentiment (positive/negative/neutral), categorized (interested/objection/timing/referral), and routed to the right AI response template." },
  { id:"8",name:"CRM Auto-Update",category:"CRM",status:"active",trigger:"Any sales activity happens",action:"AI updates all records automatically",runs:3847,saved:"5.4 hrs/day",icon:"M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",color:"#34d399",bg:"rgba(52,211,153,0.08)",description:"Every email sent, reply received, meeting booked, or call made is automatically logged and categorized. CRM stays 100% up-to-date without any manual data entry." },
  { id:"9",name:"Competitor Mention Alert",category:"Intelligence",status:"paused",trigger:"Prospect mentions competitor",action:"AI generates competitive battle card",runs:0,saved:"0 hrs/day",icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",color:"#f59e0b",bg:"rgba(245,158,11,0.08)",description:"When a prospect mentions Apollo, Outreach, Salesloft, or any competitor in an email, AI instantly generates a battle card with specific talking points to win the comparison." },
  { id:"10",name:"Win/Loss Analysis",category:"Analytics",status:"active",trigger:"Deal closed (won or lost)",action:"AI generates full analysis report",runs:18,saved:"2.1 hrs/day",icon:"M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z",color:"#818cf8",bg:"rgba(129,140,248,0.08)",description:"After every deal closes, AI analyzes the entire conversation history, identifies what worked and what didn't, and generates a report with specific improvements for future deals." },
  { id:"11",name:"Email Deliverability Guard",category:"Outreach",status:"active",trigger:"Before every email send",action:"AI checks spam score + optimizes",runs:4891,saved:"1.2 hrs/day",icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",color:"#34d399",bg:"rgba(52,211,153,0.08)",description:"Before any email goes out, AI checks spam score, validates deliverability, rewrites spam-trigger words, and optimizes subject line. Ensures 94%+ inbox placement rate." },
  { id:"12",name:"ICP Drift Detection",category:"Analytics",status:"active",trigger:"Weekly analysis",action:"AI identifies changing ICP patterns",runs:4,saved:"3.5 hrs/week",icon:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",color:"#C8FF00",bg:"rgba(200,255,0,0.08)",description:"Every week, AI analyzes your won deals and identifies patterns in your best customers. Automatically updates your ICP scoring model to improve prospect targeting over time." },
  { id:"13",name:"Multi-Channel Coordinator",category:"Outreach",status:"active",trigger:"Prospect doesn't open email",action:"AI switches to LinkedIn or phone",runs:634,saved:"4.7 hrs/day",icon:"M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0",color:"#f472b6",bg:"rgba(244,114,182,0.08)",description:"If a prospect doesn't open 2 emails in a row, AI automatically switches channels — tries LinkedIn message, then phone call reminder, then SMS. Never gets stuck on one channel." },
  { id:"14",name:"Referral Request Automator",category:"Growth",status:"paused",trigger:"Deal closed won",action:"AI sends personalized referral request",runs:0,saved:"0 hrs/day",icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",color:"#60a5fa",bg:"rgba(96,165,250,0.08)",description:"3 days after a deal closes won, AI sends a perfectly-timed, personalized referral request to the new customer. Includes specific people to refer based on their network." },
  { id:"15",name:"AI Proposal Generator",category:"Closing",status:"active",trigger:"Prospect requests proposal",action:"AI generates custom proposal doc",runs:12,saved:"6.2 hrs/deal",icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",color:"#a78bfa",bg:"rgba(167,139,250,0.08)",description:"When a prospect asks for a proposal, AI instantly generates a fully customized proposal document with their specific pain points, ROI calculations, case studies, and pricing." },
];

const CATEGORIES = ["All","Prospecting","Outreach","Alerts","Meetings","Pipeline","Inbox","CRM","Intelligence","Analytics","Growth","Closing"];

export default function AutomationsPage() {
  const { user, loading, handleLogout } = useAuth();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<typeof AUTOMATIONS[0]|null>(null);
  const [running, setRunning] = useState<string|null>(null);
  const [aiOutput, setAiOutput] = useState("");
  const [testInput, setTestInput] = useState("");
  const [automations, setAutomations] = useState(AUTOMATIONS);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""), 3000); };

  const filtered = automations.filter(a => filter === "All" || a.category === filter);
  const activeCount = automations.filter(a => a.status === "active").length;
  const totalRuns = automations.reduce((s,a) => s+a.runs, 0);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id===id ? {...a, status: a.status==="active"?"paused":"active"} : a));
    const a = automations.find(x=>x.id===id);
    showToast(a?.status==="active" ? `${a.name} paused` : `${a?.name} activated ⚡`);
  };

  const runTest = async () => {
    if (!selected) return;
    setRunning(selected.id);
    setAiOutput("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "emailWriter",
          prompt: `Automation: "${selected.name}". Trigger: "${selected.trigger}". Action: "${selected.action}". Input: ${testInput || "James Morrison, VP Sales at Stripe, 1000 employees, Fintech. Score: 98. Intent: high."}. Execute this automation and show the output.`
        }),
      });
      const data = await res.json();
      setAiOutput(data.result ?? "No output.");
    } catch { setAiOutput("Error: Could not connect to AI."); }
    setRunning(null);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast && <div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:"1px solid rgba(200,255,0,0.3)",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:S.accent,zIndex:300,whiteSpace:"nowrap" }}>{toast}</div>}
      <Sidebar active="automations" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Automation Workflows</h1>
            <p style={{ color:S.muted,fontSize:14 }}>15 AI-powered automations running 24/7 — powered by OpenRouter</p>
          </div>
          <div style={{ display:"flex",gap:12,alignItems:"center" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:20,fontWeight:800,color:S.accent,fontFamily:"Syne,sans-serif" }}>{activeCount}</div>
              <div style={{ fontSize:11,color:S.faint }}>Active</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:20,fontWeight:800,color:"#818cf8",fontFamily:"Syne,sans-serif" }}>{totalRuns.toLocaleString()}</div>
              <div style={{ fontSize:11,color:S.faint }}>Total Runs</div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"8px 16px",borderRadius:999 }}>
              <span style={{ width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block",animation:"ping 1.5s infinite" }}/>
              {activeCount} Running
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24 }}>
          {[
            { label:"Time Saved Today",value:"38.4 hrs",color:S.accent },
            { label:"Emails Automated",value:"4,891",color:"#818cf8" },
            { label:"Leads Enriched",value:"1,284",color:"#34d399" },
            { label:"Deals Rescued",value:"23",color:"#f59e0b" },
          ].map(s=>(
            <div key={s.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ fontSize:12,color:S.faint }}>{s.label}</span>
              <span style={{ fontSize:18,fontWeight:800,color:s.color,fontFamily:"Syne,sans-serif" }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:20 }}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setFilter(c)}
              style={{ fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:999,border:`1px solid ${filter===c?"rgba(200,255,0,0.3)":S.lineSoft}`,background:filter===c?"rgba(200,255,0,0.08)":"transparent",color:filter===c?S.accent:S.faint,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 420px":"1fr",gap:20 }}>

          {/* Automations Grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14,alignContent:"start" }}>
            {filtered.map(auto=>(
              <div key={auto.id}
                onClick={()=>{ setSelected(selected?.id===auto.id?null:auto); setAiOutput(""); setTestInput(""); }}
                style={{ background:S.panel,border:`1px solid ${selected?.id===auto.id?"rgba(200,255,0,0.3)":S.lineSoft}`,borderRadius:14,padding:20,cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e=>{ if(selected?.id!==auto.id)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"; }}
                onMouseLeave={e=>{ if(selected?.id!==auto.id)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; }}>

                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:38,height:38,borderRadius:10,background:auto.bg,border:`1px solid ${auto.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={auto.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={auto.icon}/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:S.text }}>{auto.name}</div>
                      <span style={{ fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:999,background:"rgba(255,255,255,0.05)",color:S.faint }}>{auto.category}</span>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button onClick={e=>{ e.stopPropagation(); toggleAutomation(auto.id); }}
                    style={{ width:40,height:22,borderRadius:999,border:"none",cursor:"pointer",background:auto.status==="active"?S.accent:"rgba(255,255,255,0.1)",transition:"all 0.3s",position:"relative",flexShrink:0 }}>
                    <div style={{ position:"absolute",top:2,left:auto.status==="active"?20:2,width:18,height:18,borderRadius:"50%",background:auto.status==="active"?"#050505":"rgba(255,255,255,0.4)",transition:"all 0.3s" }}/>
                  </button>
                </div>

                <div style={{ display:"flex",gap:6,marginBottom:10 }}>
                  <div style={{ flex:1,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,borderRadius:8,padding:"8px 10px" }}>
                    <div style={{ fontSize:9,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3 }}>TRIGGER</div>
                    <div style={{ fontSize:11,color:S.muted }}>{auto.trigger}</div>
                  </div>
                  <div style={{ flex:1,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,borderRadius:8,padding:"8px 10px" }}>
                    <div style={{ fontSize:9,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3 }}>ACTION</div>
                    <div style={{ fontSize:11,color:S.muted }}>{auto.action}</div>
                  </div>
                </div>

                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div style={{ display:"flex",gap:12 }}>
                    <span style={{ fontSize:11,color:S.faint }}><span style={{ color:auto.color,fontWeight:700 }}>{auto.runs.toLocaleString()}</span> runs</span>
                    <span style={{ fontSize:11,color:S.faint }}><span style={{ color:"#34d399",fontWeight:700 }}>{auto.saved}</span> saved</span>
                  </div>
                  <span style={{ fontSize:11,fontWeight:700,color:auto.status==="active"?"#34d399":S.faint }}>
                    {auto.status==="active"?"● Active":"○ Paused"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Test Panel */}
          {selected && (
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24,height:"fit-content",position:"sticky",top:28 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:selected.bg,border:`1px solid ${selected.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={selected.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={selected.icon}/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text }}>{selected.name}</div>
                  <div style={{ fontSize:11,color:S.faint }}>{selected.category} · OpenRouter AI</div>
                </div>
                <button onClick={()=>{ setSelected(null); setAiOutput(""); }} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Description */}
              <div style={{ padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,fontSize:12,color:S.muted,lineHeight:1.7,marginBottom:14 }}>
                {selected.description}
              </div>

              {/* Trigger → Action */}
              <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:14 }}>
                <div style={{ flex:1,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}` }}>
                  <div style={{ fontSize:9,fontWeight:700,color:S.faint,textTransform:"uppercase",marginBottom:4 }}>TRIGGER</div>
                  <div style={{ fontSize:12,color:S.text }}>{selected.trigger}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.accent} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <div style={{ flex:1,padding:"10px 12px",borderRadius:10,background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.15)" }}>
                  <div style={{ fontSize:9,fontWeight:700,color:S.accent,textTransform:"uppercase",marginBottom:4 }}>ACTION</div>
                  <div style={{ fontSize:12,color:S.text }}>{selected.action}</div>
                </div>
              </div>

              <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>Test Input (optional)</label>
              <textarea value={testInput} onChange={e=>setTestInput(e.target.value)}
                placeholder="e.g. James Morrison, VP Sales at Stripe, score 98, high intent..."
                style={{ width:"100%",minHeight:90,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:"10px 12px",color:S.text,fontSize:12,fontFamily:"Inter,sans-serif",outline:"none",resize:"vertical",lineHeight:1.6,marginBottom:12 }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>

              <button onClick={runTest} disabled={!!running||selected.status==="paused"}
                style={{ width:"100%",padding:"12px",borderRadius:10,border:"none",background:selected.status==="paused"?"rgba(255,255,255,0.05)":running?"rgba(200,255,0,0.6)":S.accent,color:selected.status==="paused"?S.faint:"#050505",fontSize:13,fontWeight:700,cursor:running||selected.status==="paused"?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:aiOutput?14:0 }}>
                {running
                  ?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Running Automation...</>
                  :selected.status==="paused"?"Paused — Toggle to Activate"
                  :<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Run Automation Test</>}
              </button>

              {aiOutput && (
                <div style={{ background:"rgba(0,0,0,0.3)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"14px 16px" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>⚡ Automation Output</div>
                  <pre style={{ fontSize:12,color:S.text,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",margin:"0 0 10px" }}>{aiOutput}</pre>
                  <button onClick={()=>navigator.clipboard.writeText(aiOutput).then(()=>showToast("Copied ✓"))}
                    style={{ padding:"6px 14px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    Copy Output
                  </button>
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
