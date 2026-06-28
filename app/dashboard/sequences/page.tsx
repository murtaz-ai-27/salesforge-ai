"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",panel2:"#111520",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00",violet:"#7c3aed" };

const SEQUENCES = [
  { id:"1",name:"Cold Outreach — VP Sales",status:"active",prospects:284,steps:5,openRate:67,replyRate:31,meetingRate:12,channel:"email+linkedin" },
  { id:"2",name:"SaaS Decision Makers",status:"active",prospects:156,steps:4,openRate:54,replyRate:24,meetingRate:9,channel:"email" },
  { id:"3",name:"Fintech Series B+",status:"paused",prospects:98,steps:6,openRate:71,replyRate:38,meetingRate:16,channel:"email+call" },
];

const STEP_TYPES = [
  { type:"email", label:"Email", icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color:"#818cf8" },
  { type:"linkedin", label:"LinkedIn", icon:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z", color:"#60a5fa" },
  { type:"call", label:"Call", icon:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.62 3.38 2 2 0 013.62 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z", color:"#34d399" },
  { type:"sms", label:"SMS", icon:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", color:"#f59e0b" },
];

type Step = { id:string; type:string; day:number; subject:string; body:string; aiWritten:boolean; };

export default function SequencesPage() {
  const { user, loading, handleLogout } = useAuth();
  const [selected, setSelected] = useState<typeof SEQUENCES[0]|null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [steps, setSteps] = useState<Step[]>([
    { id:"1",type:"email",day:1,subject:"Quick question about {{company}}",body:"Hi {{firstName}},\n\nI noticed {{company}} recently {{icebreaker}}. I wanted to reach out because...\n\nWould you be open to a 15-min call this week?\n\nBest,\n{{sender}}",aiWritten:false },
    { id:"2",type:"linkedin",day:3,subject:"",body:"Hi {{firstName}}, sent you an email earlier about {{topic}}. Would love to connect!",aiWritten:false },
    { id:"3",type:"email",day:7,subject:"Re: Quick question about {{company}}",body:"Hi {{firstName}},\n\nJust following up on my earlier email. Did you get a chance to review it?\n\nBest,\n{{sender}}",aiWritten:false },
  ]);
  const [activeStep, setActiveStep] = useState<Step|null>(steps[0]);
  const [aiGenerating, setAiGenerating] = useState(false);

  const addStep = (type: string) => {
    const newStep: Step = { id: Date.now().toString(), type, day: steps.length > 0 ? steps[steps.length-1].day + 3 : 1, subject: "", body: "", aiWritten: false };
    setSteps([...steps, newStep]);
    setActiveStep(newStep);
  };

  const generateAIStep = async () => {
    if (!activeStep) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "emailWriter", prompt: `Write step ${activeStep.day} of a sales sequence. Type: ${activeStep.type}. This is day ${activeStep.day} of the sequence. Write personalized content with {{firstName}} and {{company}} placeholders.` }),
      });
      const data = await res.json();
      setSteps(prev => prev.map(s => s.id === activeStep.id ? { ...s, body: data.result ?? s.body, aiWritten: true } : s));
      setActiveStep(prev => prev ? { ...prev, body: data.result ?? prev.body, aiWritten: true } : null);
    } catch {}
    setAiGenerating(false);
  };

  if (loading) return <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}><div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <Sidebar active="sequences" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>
        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Sequences</h1>
            <p style={{ color:S.muted,fontSize:14 }}>Build multi-channel outreach sequences with AI-written steps</p>
          </div>
          <button onClick={()=>setCreating(true)}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:10,background:S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New Sequence
          </button>
        </div>

        {/* Sequence Cards */}
        {!creating && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:28 }}>
            {SEQUENCES.map(seq => (
              <div key={seq.id} onClick={()=>setSelected(selected?.id===seq.id?null:seq)}
                style={{ background:S.panel,border:`1px solid ${selected?.id===seq.id?"rgba(200,255,0,0.3)":S.lineSoft}`,borderRadius:16,padding:22,cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e=>{ if(selected?.id!==seq.id)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"; }}
                onMouseLeave={e=>{ if(selected?.id!==seq.id)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>{seq.name}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999,background:seq.status==="active"?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.05)",color:seq.status==="active"?"#34d399":S.faint }}>
                        {seq.status==="active"?"● Active":"○ Paused"}
                      </span>
                      <span style={{ fontSize:11,color:S.faint }}>{seq.steps} steps · {seq.channel}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
                  {[["Open Rate",`${seq.openRate}%`,S.accent],["Reply Rate",`${seq.replyRate}%`,"#818cf8"],["Meeting Rate",`${seq.meetingRate}%`,"#34d399"]].map(([l,v,c])=>(
                    <div key={l as string} style={{ background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 8px",textAlign:"center" }}>
                      <div style={{ fontSize:16,fontWeight:800,color:c as string,fontFamily:"Syne,sans-serif" }}>{v as string}</div>
                      <div style={{ fontSize:10,color:S.faint,marginTop:3 }}>{l as string}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,color:S.faint }}>
                  <span><span style={{ color:S.text,fontWeight:600 }}>{seq.prospects}</span> prospects enrolled</span>
                  <span style={{ color:S.accent,fontWeight:600 }}>Edit →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sequence Builder */}
        <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
          <div style={{ padding:"16px 20px",borderBottom:`1px solid ${S.lineSoft}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:S.text }}>Sequence Builder</div>
              <div style={{ fontSize:12,color:S.faint,marginTop:2 }}>AI writes each step — you review & send</div>
            </div>
            {creating && (
              <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Sequence name..."
                  style={{ padding:"8px 14px",borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",width:220 }}/>
                <button onClick={()=>setCreating(false)} style={{ padding:"8px 14px",borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:S.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>Cancel</button>
                <button style={{ padding:"8px 14px",borderRadius:9,background:S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>Save</button>
              </div>
            )}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"260px 1fr",minHeight:480 }}>
            {/* Steps List */}
            <div style={{ borderRight:`1px solid ${S.lineSoft}`,padding:16 }}>
              <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:12 }}>Steps</div>
              {steps.map((step,i) => {
                const st = STEP_TYPES.find(t=>t.type===step.type)!;
                return (
                  <div key={step.id} onClick={()=>setActiveStep(step)}
                    style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:6,cursor:"pointer",transition:"all 0.2s",border:`1px solid ${activeStep?.id===step.id?"rgba(200,255,0,0.2)":S.lineSoft}`,background:activeStep?.id===step.id?"rgba(200,255,0,0.05)":"rgba(255,255,255,0.02)" }}>
                    <div style={{ width:32,height:32,borderRadius:8,background:`${st.color}18`,border:`1px solid ${st.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={st.icon}/></svg>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,fontWeight:600,color:S.text }}>Day {step.day} — {st.label}</div>
                      <div style={{ fontSize:11,color:S.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{step.subject||step.body.slice(0,30)+"..."}</div>
                    </div>
                    {step.aiWritten && <span style={{ fontSize:9,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.1)",padding:"2px 6px",borderRadius:999,flexShrink:0 }}>AI</span>}
                  </div>
                );
              })}

              {/* Add Step */}
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8 }}>Add Step</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                  {STEP_TYPES.map(st=>(
                    <button key={st.type} onClick={()=>addStep(st.type)}
                      style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderRadius:9,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}
                      onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=st.color+"55"}
                      onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=S.lineSoft}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={st.icon}/></svg>
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Editor */}
            {activeStep ? (
              <div style={{ padding:24 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:15,fontWeight:700,color:S.text,marginBottom:4 }}>
                      Day {activeStep.day} — {STEP_TYPES.find(t=>t.type===activeStep.type)?.label}
                    </div>
                    <div style={{ fontSize:12,color:S.faint }}>Use {"{{firstName}}"}, {"{{company}}"}, {"{{icebreaker}}"} as variables</div>
                  </div>
                  <button onClick={generateAIStep} disabled={aiGenerating}
                    style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:aiGenerating?"rgba(200,255,0,0.5)":S.accent,border:"none",color:"#050505",fontSize:12,fontWeight:700,cursor:aiGenerating?"not-allowed":"pointer",fontFamily:"Inter,sans-serif" }}>
                    {aiGenerating?<><span style={{ width:13,height:13,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Writing...</>:"⚡ AI Write Step"}
                  </button>
                </div>

                {activeStep.type==="email" && (
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>Subject Line</label>
                    <input value={activeStep.subject} onChange={e=>{ const v=e.target.value; setSteps(prev=>prev.map(s=>s.id===activeStep.id?{...s,subject:v}:s)); setActiveStep(prev=>prev?{...prev,subject:v}:null); }}
                      style={{ width:"100%",padding:"11px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none" }}
                      onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
                      onBlur={e=>(e.target as HTMLInputElement).style.borderColor="rgba(255,255,255,0.08)"}/>
                  </div>
                )}

                <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>Message Body</label>
                <textarea value={activeStep.body}
                  onChange={e=>{ const v=e.target.value; setSteps(prev=>prev.map(s=>s.id===activeStep.id?{...s,body:v}:s)); setActiveStep(prev=>prev?{...prev,body:v}:null); }}
                  style={{ width:"100%",minHeight:240,padding:"14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",resize:"vertical",lineHeight:1.7 }}
                  onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                  onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(255,255,255,0.08)"}/>

                <div style={{ display:"flex",gap:10,marginTop:14 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <label style={{ fontSize:12,color:S.faint }}>Send on Day:</label>
                    <input type="number" value={activeStep.day} min={1}
                      onChange={e=>{ const v=parseInt(e.target.value); setSteps(prev=>prev.map(s=>s.id===activeStep.id?{...s,day:v}:s)); setActiveStep(prev=>prev?{...prev,day:v}:null); }}
                      style={{ width:60,padding:"7px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",textAlign:"center" }}/>
                  </div>
                  <button onClick={()=>{ setSteps(prev=>prev.filter(s=>s.id!==activeStep.id)); setActiveStep(steps[0]??null); }}
                    style={{ marginLeft:"auto",padding:"8px 14px",borderRadius:9,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    Delete Step
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:"grid",placeItems:"center",height:"100%",color:S.faint,fontSize:14 }}>Select a step to edit or add a new one</div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea::placeholder,input::placeholder{color:#555a66}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
