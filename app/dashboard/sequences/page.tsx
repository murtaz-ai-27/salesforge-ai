"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const STEP_TYPES = [
  { type:"email",   label:"Email",    color:"#818cf8", icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { type:"linkedin",label:"LinkedIn", color:"#60a5fa", icon:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" },
  { type:"call",    label:"Call",     color:"#34d399", icon:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.62 3.38 2 2 0 013.62 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" },
  { type:"sms",     label:"SMS",      color:"#f59e0b", icon:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
];

type Step = { id:string; type:string; day:number; subject:string; body:string; aiWritten:boolean; };
type Sequence = { id:string; name:string; status:string; steps:Step[]; prospect_count:number; open_rate:number; reply_rate:number; meeting_rate:number; };
type Prospect = { id:string; name:string; email:string; role:string; company:string; ai_score:number; buying_intent:string; status:string; avatar_init:string; avatar_bg:string; avatar_color:string; sequence_id?:string; };

export default function SequencesPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selected, setSelected] = useState<Sequence|null>(null);
  const [activeStep, setActiveStep] = useState<Step|null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [view, setView] = useState<"list"|"builder"|"assign"|"send">("list");
  const [newName, setNewName] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [sending, setSending] = useState<string|null>(null);
  const [assigning, setAssigning] = useState(false);
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"|"warning"}>({msg:"",type:"success"});
  const [dbLoading, setDbLoading] = useState(true);
  const [sendResults, setSendResults] = useState<any[]>([]);

  const showToast = (msg:string, type:"success"|"error"|"warning"="success") => {
    setToast({msg,type}); setTimeout(()=>setToast({msg:"",type:"success"}),4000);
  };

  // Load sequences from DB
  useEffect(() => {
    if (!user?.uid) return;
    setDbLoading(true);
    fetch(`/api/sequences?userId=${user.uid}`)
      .then(r=>r.json())
      .then(d=>{ if(d.sequences) setSequences(d.sequences); })
      .catch(()=>{})
      .finally(()=>setDbLoading(false));
  }, [user?.uid]);

  // Load prospects from DB
  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/prospects?userId=${user.uid}`)
      .then(r=>r.json())
      .then(d=>{ if(d.prospects) setProspects(d.prospects); })
      .catch(()=>{});
  }, [user?.uid]);

  const createSequence = async () => {
    if (!newName.trim()||!user?.uid) return;
    const defaultSteps: Step[] = [
      { id:"1", type:"email", day:1, subject:"Quick question about {{company}}", body:"Hi {{firstName}},\n\nI noticed {{company}} recently — wanted to reach out because SalesForge AI helps {{role}}s like yourself book 3x more meetings with less manual work.\n\nWould you be open to a 15-min call this week?\n\nBest,\n{{sender}}", aiWritten:false },
      { id:"2", type:"email", day:4, subject:"Re: Quick question about {{company}}", body:"Hi {{firstName}},\n\nJust following up on my last email. Wanted to share that we recently helped a similar company reduce their SDR research time by 70%.\n\nStill worth a quick chat?\n\n{{sender}}", aiWritten:false },
      { id:"3", type:"linkedin", day:7, subject:"", body:"Hi {{firstName}} — sent you a couple emails about automating outreach at {{company}}. Would love to connect here too!", aiWritten:false },
      { id:"4", type:"email", day:10, subject:"Last note — {{company}}", body:"Hi {{firstName}},\n\nI'll keep this short — if automating your outreach and booking more meetings is a priority this quarter, happy to share how.\n\nIf the timing isn't right, no worries at all.\n\n{{sender}}", aiWritten:false },
    ];

    const res = await fetch("/api/sequences", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ userId:user.uid, name:newName.trim(), status:"draft", steps:defaultSteps, prospect_count:0, open_rate:0, reply_rate:0, meeting_rate:0 }),
    });
    const data = await res.json();
    if (data.sequence) {
      setSequences(prev=>[data.sequence,...prev]);
      setSelected(data.sequence);
      setSteps(defaultSteps);
      setActiveStep(defaultSteps[0]);
      setView("builder");
      setNewName("");
      showToast(`✓ "${data.sequence.name}" created with 4 default steps`);
    } else showToast(data.error??"Error creating","error");
  };

  const saveSequence = async () => {
    if (!selected||!user?.uid) return;
    const res = await fetch("/api/sequences", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ id:selected.id, steps, updated_at:new Date().toISOString() }),
    });
    const data = await res.json();
    if (data.sequence) {
      setSequences(prev=>prev.map(s=>s.id===selected.id?data.sequence:s));
      setSelected(data.sequence);
      showToast("✓ Sequence saved to database!");
    } else showToast(data.error??"Error saving","error");
  };

  const deleteSequence = async (id:string) => {
    await fetch(`/api/sequences?id=${id}`, { method:"DELETE" });
    setSequences(prev=>prev.filter(s=>s.id!==id));
    if (selected?.id===id) { setSelected(null); setView("list"); }
    showToast("Sequence deleted");
  };

  const generateAIStep = async () => {
    if (!activeStep||!user?.uid) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          type:"emailWriter",
          prompt:`Write touch #${steps.indexOf(activeStep)+1} of ${steps.length} in a B2B sales sequence. Type: ${activeStep.type}. Day ${activeStep.day}. Previous touches were about introducing our product. This touch should use a DIFFERENT angle. Use {{firstName}} and {{company}} placeholders. Under 100 words. Human tone.`,
          userId:user.uid,
        }),
      });
      const data = await res.json();
      if (data.result) {
        const updated = { ...activeStep, body:data.result, aiWritten:true };
        setSteps(prev=>prev.map(s=>s.id===activeStep.id?updated:s));
        setActiveStep(updated);
        showToast("⚡ AI wrote this step!");
      } else showToast(data.error??"AI error","error");
    } catch { showToast("AI error","error"); }
    setAiGenerating(false);
  };

  const assignToProspects = async () => {
    if (!selected||!selectedProspects.length||!user?.uid) return;
    setAssigning(true);
    const res = await fetch("/api/sequences/assign", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ userId:user.uid, sequenceId:selected.id, prospectIds:selectedProspects }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`✓ ${data.assigned} prospect(s) enrolled! ${selected.steps?.length??0} emails scheduled each.`);
      setSelectedProspects([]);
      setView("list");
      // Refresh sequences
      fetch(`/api/sequences?userId=${user.uid}`).then(r=>r.json()).then(d=>{ if(d.sequences) setSequences(d.sequences); });
    } else showToast(data.error??"Error assigning","error");
    setAssigning(false);
  };

  const sendToProspect = async (prospectId:string, stepIndex:number=0) => {
    if (!selected||!user?.uid) return;
    setSending(prospectId);
    const res = await fetch("/api/sequences/send", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ userId:user.uid, prospectId, sequenceId:selected.id, stepIndex }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`✓ ${data.message}. ${data.nextStep}`);
      setSendResults(prev=>[...prev,{ prospectId, ...data }]);
    } else {
      if (data.upgrade) showToast("⚠️ Upgrade to Starter plan to send emails","warning");
      else showToast(data.error??"Error sending","error");
    }
    setSending(null);
  };

  const addStep = (type:string) => {
    const lastDay = steps.length>0?steps[steps.length-1].day:0;
    const newStep:Step = { id:Date.now().toString(), type, day:lastDay+3, subject:"", body:"", aiWritten:false };
    setSteps(prev=>[...prev,newStep]);
    setActiveStep(newStep);
  };

  const openBuilder = (seq:Sequence) => {
    setSelected(seq);
    setSteps(seq.steps??[]);
    setActiveStep((seq.steps??[])[0]??null);
    setView("builder");
  };

  if (authLoading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const toastColor = toast.type==="error"?"#f87171":toast.type==="warning"?"#f59e0b":S.accent;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast.msg&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:`1px solid ${toastColor}44`,borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:toastColor,zIndex:300,whiteSpace:"nowrap" }}>{toast.msg}</div>}
      <Sidebar active="sequences" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>
              {view==="list"?"Sequences":view==="builder"?`Building: ${selected?.name}`:view==="assign"?`Enroll Prospects: ${selected?.name}`:"Send Emails"}
            </h1>
            <p style={{ color:S.muted,fontSize:14 }}>
              {view==="list"?"Multi-channel sequences that actually send emails via Resend":
               view==="builder"?"Build your sequence — AI writes each step":
               view==="assign"?"Select prospects to enroll in this sequence":
               "Send sequence emails to enrolled prospects"}
            </p>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            {view!=="list"&&(
              <button onClick={()=>setView("list")}
                style={{ padding:"9px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                ← Back
              </button>
            )}
            {view==="list"&&(
              <div style={{ display:"flex",gap:8 }}>
                <input value={newName} onChange={e=>setNewName(e.target.value)}
                  placeholder="New sequence name..."
                  onKeyDown={e=>e.key==="Enter"&&createSequence()}
                  style={{ padding:"9px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",width:220 }}
                  onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
                  onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
                <button onClick={createSequence} disabled={!newName.trim()}
                  style={{ padding:"9px 18px",borderRadius:10,background:newName.trim()?S.accent:"rgba(255,255,255,0.05)",border:"none",color:newName.trim()?"#050505":S.faint,fontSize:13,fontWeight:700,cursor:newName.trim()?"pointer":"not-allowed",fontFamily:"Inter,sans-serif" }}>
                  + Create
                </button>
              </div>
            )}
            {view==="builder"&&(
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>{ setView("assign"); setSelectedProspects([]); }}
                  style={{ padding:"9px 16px",borderRadius:10,background:"rgba(129,140,248,0.1)",border:"1px solid rgba(129,140,248,0.3)",color:"#818cf8",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                  👥 Enroll Prospects
                </button>
                <button onClick={saveSequence}
                  style={{ padding:"9px 18px",borderRadius:10,background:S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                  💾 Save
                </button>
              </div>
            )}
            {view==="assign"&&(
              <button onClick={assignToProspects} disabled={!selectedProspects.length||assigning}
                style={{ padding:"9px 18px",borderRadius:10,background:selectedProspects.length&&!assigning?S.accent:"rgba(255,255,255,0.05)",border:"none",color:selectedProspects.length&&!assigning?"#050505":S.faint,fontSize:13,fontWeight:700,cursor:selectedProspects.length&&!assigning?"pointer":"not-allowed",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:8 }}>
                {assigning?<><span style={{ width:13,height:13,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Enrolling...</>:`⚡ Enroll ${selectedProspects.length} Prospect${selectedProspects.length!==1?"s":""}`}
              </button>
            )}
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {view==="list"&&(
          <>
            {dbLoading?(
              <div style={{ padding:"48px",textAlign:"center",color:S.faint }}>Loading sequences...</div>
            ):sequences.length===0?(
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:"48px 24px",textAlign:"center" }}>
                <div style={{ fontSize:48,marginBottom:16 }}>✉️</div>
                <div style={{ fontSize:16,fontWeight:700,color:S.text,marginBottom:8 }}>No sequences yet</div>
                <div style={{ fontSize:13,color:S.muted,marginBottom:24 }}>Create a sequence, add AI-written steps, enroll prospects, and watch emails send automatically.</div>
                <div style={{ fontSize:12,color:S.faint }}>Type a name above and press Enter to create your first sequence</div>
              </div>
            ):(
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16 }}>
                {sequences.map(seq=>(
                  <div key={seq.id} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22,transition:"border-color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft}>
                    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
                      <div>
                        <div style={{ fontSize:15,fontWeight:700,color:S.text,marginBottom:6 }}>{seq.name}</div>
                        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                          <span style={{ fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999,background:seq.status==="active"?"rgba(52,211,153,0.1)":seq.status==="draft"?"rgba(255,255,255,0.05)":"rgba(245,158,11,0.1)",color:seq.status==="active"?"#34d399":seq.status==="draft"?S.faint:"#f59e0b" }}>
                            {seq.status==="active"?"● Active":seq.status==="draft"?"○ Draft":"○ Paused"}
                          </span>
                          <span style={{ fontSize:11,color:S.faint }}>{seq.steps?.length??0} steps</span>
                          <span style={{ fontSize:11,color:S.faint }}>{seq.prospect_count??0} enrolled</span>
                        </div>
                      </div>
                      <button onClick={()=>deleteSequence(seq.id)}
                        style={{ background:"none",border:"none",cursor:"pointer",color:S.faint,padding:4,fontSize:16 }}
                        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color="#f87171"}
                        onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color=S.faint}>
                        ✕
                      </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16 }}>
                      {[["Open Rate",`${seq.open_rate??0}%`,S.accent],["Reply Rate",`${seq.reply_rate??0}%`,"#818cf8"],["Meeting Rate",`${seq.meeting_rate??0}%`,"#34d399"]].map(([l,v,c])=>(
                        <div key={l} style={{ background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 8px",textAlign:"center",border:`1px solid ${S.lineSoft}` }}>
                          <div style={{ fontSize:16,fontWeight:800,color:c,fontFamily:"Syne,sans-serif" }}>{v}</div>
                          <div style={{ fontSize:10,color:S.faint,marginTop:2 }}>{l}</div>
                        </div>
                      ))}
                    </div>

                    {/* Step preview */}
                    <div style={{ display:"flex",gap:4,marginBottom:16,flexWrap:"wrap" }}>
                      {(seq.steps??[]).map((step:Step,i:number)=>{
                        const st = STEP_TYPES.find(t=>t.type===step.type)??STEP_TYPES[0];
                        return (
                          <div key={i} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:8,background:`${st.color}12`,border:`1px solid ${st.color}30` }}>
                            <span style={{ fontSize:10,fontWeight:700,color:st.color }}>D{step.day}</span>
                            <span style={{ fontSize:10,color:S.faint }}>{st.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                      <button onClick={()=>openBuilder(seq)}
                        style={{ padding:"8px",borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                        ✏️ Edit
                      </button>
                      <button onClick={()=>{ setSelected(seq); setView("assign"); setSelectedProspects([]); }}
                        style={{ padding:"8px",borderRadius:9,background:"rgba(129,140,248,0.08)",border:"1px solid rgba(129,140,248,0.2)",color:"#818cf8",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                        👥 Enroll
                      </button>
                      <button onClick={()=>{ setSelected(seq); setSteps(seq.steps??[]); setView("send"); }}
                        style={{ padding:"8px",borderRadius:9,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",color:"#34d399",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                        📤 Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── BUILDER VIEW ── */}
        {view==="builder"&&selected&&(
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
            <div style={{ display:"grid",gridTemplateColumns:"280px 1fr",minHeight:500 }}>
              {/* Steps sidebar */}
              <div style={{ borderRight:`1px solid ${S.lineSoft}`,padding:16 }}>
                <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:12 }}>Steps ({steps.length})</div>
                {steps.map((step,i)=>{
                  const st = STEP_TYPES.find(t=>t.type===step.type)??STEP_TYPES[0];
                  const isActive = activeStep?.id===step.id;
                  return (
                    <div key={step.id} onClick={()=>setActiveStep(step)}
                      style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:6,cursor:"pointer",border:`1px solid ${isActive?"rgba(200,255,0,0.25)":S.lineSoft}`,background:isActive?"rgba(200,255,0,0.05)":"rgba(255,255,255,0.02)" }}>
                      <div style={{ width:30,height:30,borderRadius:8,background:`${st.color}15`,border:`1px solid ${st.color}30`,display:"grid",placeItems:"center",flexShrink:0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={st.icon}/></svg>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:S.text }}>Day {step.day} — {st.label}</div>
                        <div style={{ fontSize:10,color:S.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                          {step.subject||step.body.slice(0,35)||"Empty step"}
                        </div>
                      </div>
                      {step.aiWritten&&<span style={{ fontSize:9,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.1)",padding:"2px 5px",borderRadius:999 }}>AI</span>}
                    </div>
                  );
                })}
                {/* Add step buttons */}
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8 }}>Add Step</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5 }}>
                    {STEP_TYPES.map(st=>(
                      <button key={st.type} onClick={()=>addStep(st.type)}
                        style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 8px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2" strokeLinecap="round"><path d={st.icon}/></svg>
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step editor */}
              {activeStep?(
                <div style={{ padding:24 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                    <div>
                      <div style={{ fontSize:15,fontWeight:700,color:S.text }}>
                        Day {activeStep.day} — {STEP_TYPES.find(t=>t.type===activeStep.type)?.label}
                      </div>
                      <div style={{ fontSize:12,color:S.faint,marginTop:2 }}>
                        Variables: {"{{firstName}}"} {"{{company}}"} {"{{role}}"} {"{{sender}}"}
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={generateAIStep} disabled={aiGenerating}
                        style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:9,background:aiGenerating?"rgba(200,255,0,0.5)":S.accent,border:"none",color:"#050505",fontSize:12,fontWeight:700,cursor:aiGenerating?"not-allowed":"pointer",fontFamily:"Inter,sans-serif" }}>
                        {aiGenerating?<><span style={{ width:12,height:12,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Writing...</>:"⚡ AI Write"}
                      </button>
                      <button onClick={()=>{setSteps(prev=>prev.filter(s=>s.id!==activeStep.id));setActiveStep(steps.find(s=>s.id!==activeStep.id)??null);}}
                        style={{ padding:"8px 12px",borderRadius:9,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Day selector */}
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                    <label style={{ fontSize:12,color:S.faint }}>Send on Day:</label>
                    <input type="number" value={activeStep.day} min={1}
                      onChange={e=>{const v=parseInt(e.target.value);const u={...activeStep,day:v};setSteps(prev=>prev.map(s=>s.id===activeStep.id?u:s));setActiveStep(u);}}
                      style={{ width:60,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",textAlign:"center" }}/>
                    <span style={{ fontSize:12,color:S.faint }}>after enrollment</span>
                  </div>

                  {activeStep.type==="email"&&(
                    <div style={{ marginBottom:14 }}>
                      <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>Subject Line</label>
                      <input value={activeStep.subject}
                        onChange={e=>{const v=e.target.value;const u={...activeStep,subject:v};setSteps(prev=>prev.map(s=>s.id===activeStep.id?u:s));setActiveStep(u);}}
                        placeholder="Quick question about {{company}}"
                        style={{ width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none" }}
                        onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
                        onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
                    </div>
                  )}

                  <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>Message Body</label>
                  <textarea value={activeStep.body}
                    onChange={e=>{const v=e.target.value;const u={...activeStep,body:v};setSteps(prev=>prev.map(s=>s.id===activeStep.id?u:s));setActiveStep(u);}}
                    placeholder="Write your message here or click ⚡ AI Write..."
                    style={{ width:"100%",minHeight:220,padding:"14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",resize:"vertical",lineHeight:1.7 }}
                    onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                    onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>
                </div>
              ):(
                <div style={{ display:"grid",placeItems:"center",color:S.faint,fontSize:14 }}>
                  Select a step to edit or add a new one
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ASSIGN VIEW ── */}
        {view==="assign"&&selected&&(
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
            <div style={{ padding:"16px 20px",borderBottom:`1px solid ${S.lineSoft}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text }}>Select prospects to enroll in "{selected.name}"</div>
              <button onClick={()=>setSelectedProspects(prospects.filter(p=>!p.sequence_id).map(p=>p.id))}
                style={{ fontSize:12,color:S.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:600 }}>
                Select All Available
              </button>
            </div>
            {prospects.length===0?(
              <div style={{ padding:"48px",textAlign:"center" }}>
                <div style={{ fontSize:13,color:S.faint }}>No prospects yet. <a href="/dashboard/prospects" style={{ color:S.accent }}>Add prospects first →</a></div>
              </div>
            ):(
              <div>
                {prospects.map((p,i)=>{
                  const isSelected = selectedProspects.includes(p.id);
                  const alreadyEnrolled = !!p.sequence_id;
                  return (
                    <div key={p.id}
                      onClick={()=>{ if(alreadyEnrolled) return; setSelectedProspects(prev=>isSelected?prev.filter(id=>id!==p.id):[...prev,p.id]); }}
                      style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:i<prospects.length-1?`1px solid ${S.lineSoft}`:"none",cursor:alreadyEnrolled?"not-allowed":"pointer",transition:"background 0.2s",background:isSelected?"rgba(200,255,0,0.04)":alreadyEnrolled?"rgba(255,255,255,0.01)":"transparent",opacity:alreadyEnrolled?0.5:1 }}
                      onMouseEnter={e=>{ if(!alreadyEnrolled)(e.currentTarget as HTMLDivElement).style.background=isSelected?"rgba(200,255,0,0.06)":"rgba(255,255,255,0.02)"; }}
                      onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.background=isSelected?"rgba(200,255,0,0.04)":alreadyEnrolled?"rgba(255,255,255,0.01)":"transparent"; }}>
                      {/* Checkbox */}
                      <div style={{ width:18,height:18,borderRadius:5,border:`2px solid ${isSelected?S.accent:S.lineSoft}`,background:isSelected?S.accent:"transparent",display:"grid",placeItems:"center",flexShrink:0,transition:"all 0.15s" }}>
                        {isSelected&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <div style={{ width:34,height:34,borderRadius:"50%",background:p.avatar_bg,color:p.avatar_color,display:"grid",placeItems:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>{p.avatar_init}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13,fontWeight:600,color:S.text }}>{p.name}</div>
                        <div style={{ fontSize:11,color:S.faint }}>{p.role} · {p.company}</div>
                      </div>
                      <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                        <span style={{ fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:999,color:p.ai_score>=85?S.accent:"#f59e0b",background:p.ai_score>=85?"rgba(200,255,0,0.08)":"rgba(245,158,11,0.08)" }}>{p.ai_score}</span>
                        {alreadyEnrolled?(
                          <span style={{ fontSize:11,color:S.faint,fontStyle:"italic" }}>Already enrolled</span>
                        ):(
                          <span style={{ fontSize:11,color:isSelected?S.accent:S.faint }}>{isSelected?"Selected ✓":"Click to select"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SEND VIEW ── */}
        {view==="send"&&selected&&(
          <div>
            <div style={{ background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12 }}>
              <span style={{ fontSize:20 }}>📤</span>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:S.text }}>Send "{selected.name}" emails to prospects</div>
                <div style={{ fontSize:12,color:S.muted }}>Each prospect gets the next step in the sequence. Requires Starter plan to actually send.</div>
              </div>
            </div>

            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
              <div style={{ padding:"14px 20px",borderBottom:`1px solid ${S.lineSoft}` }}>
                <div style={{ fontSize:14,fontWeight:700,color:S.text }}>Prospects ({prospects.length})</div>
              </div>
              {prospects.length===0?(
                <div style={{ padding:"48px",textAlign:"center",color:S.faint,fontSize:13 }}>
                  No prospects. <a href="/dashboard/prospects" style={{ color:S.accent }}>Add prospects first →</a>
                </div>
              ):(
                prospects.map((p,i)=>{
                  const result = sendResults.find(r=>r.prospectId===p.id);
                  return (
                    <div key={p.id} style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:i<prospects.length-1?`1px solid ${S.lineSoft}`:"none" }}>
                      <div style={{ width:34,height:34,borderRadius:"50%",background:p.avatar_bg,color:p.avatar_color,display:"grid",placeItems:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>{p.avatar_init}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13,fontWeight:600,color:S.text }}>{p.name}</div>
                        <div style={{ fontSize:11,color:S.faint }}>{p.role} · {p.company} · {p.email}</div>
                        {result&&<div style={{ fontSize:11,color:"#34d399",marginTop:3 }}>✓ {result.message}</div>}
                      </div>
                      <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                        <span style={{ fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:999,color:p.status==="contacted"?"#818cf8":p.status==="replied"?"#34d399":"#9598a3",background:p.status==="contacted"?"rgba(129,140,248,0.1)":p.status==="replied"?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.05)" }}>{p.status}</span>
                        <button onClick={()=>sendToProspect(p.id, 0)} disabled={sending===p.id||!!result}
                          style={{ padding:"7px 14px",borderRadius:9,background:result?"rgba(52,211,153,0.1)":sending===p.id?"rgba(200,255,0,0.5)":"rgba(200,255,0,0.08)",border:`1px solid ${result?"rgba(52,211,153,0.3)":"rgba(200,255,0,0.2)"}`,color:result?"#34d399":S.accent,fontSize:12,fontWeight:700,cursor:sending===p.id||!!result?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:6,minWidth:100 }}>
                          {sending===p.id?<><span style={{ width:11,height:11,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Sending...</>:result?"✓ Sent":"📤 Send Step 1"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea::placeholder,input::placeholder{color:#555a66}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
