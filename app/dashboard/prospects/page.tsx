"use client";
import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useProspects } from "@/components/useProspects";
import LoadingScreen from "@/components/LoadingScreen";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const AVATARS = [
  { bg:"linear-gradient(140deg,#C8FF00,#86efac)",color:"#050505" },
  { bg:"linear-gradient(140deg,#818cf8,#c084fc)",color:"#fff" },
  { bg:"linear-gradient(140deg,#f59e0b,#ef4444)",color:"#fff" },
  { bg:"linear-gradient(140deg,#34d399,#059669)",color:"#fff" },
  { bg:"linear-gradient(140deg,#60a5fa,#3b82f6)",color:"#fff" },
  { bg:"linear-gradient(140deg,#f472b6,#ec4899)",color:"#fff" },
  { bg:"linear-gradient(140deg,#7c3aed,#9333ea)",color:"#fff" },
  { bg:"linear-gradient(140deg,#14b8a6,#0d9488)",color:"#fff" },
];

type Prospect = {
  id:string; name:string; email:string; role:string; company:string;
  industry:string; company_size:string; ai_score:number; buying_intent:"high"|"medium"|"low";
  status:"new"|"contacted"|"replied"|"meeting"|"closed"|"lost"; notes:string; avatar_init:string; avatar_bg:string; avatar_color:string;
};

type Toast = { msg:string; type:"success"|"error"|"warning" };

// Smart variable replacement
function replaceVars(text:string, prospect:Prospect):string {
  const firstName = prospect.name?.split(" ")[0] ?? prospect.name;
  return text
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{name\}\}/g, prospect.name)
    .replace(/\{\{company\}\}/g, prospect.company ?? "")
    .replace(/\{\{role\}\}/g, prospect.role ?? "")
    .replace(/\{\{industry\}\}/g, prospect.industry ?? "")
    .replace(/\{\{sender\}\}/g, "The SalesForge Team")
    .replace(/\{\{icebreaker\}\}/g, `their work at ${prospect.company}`)
    .replace(/\{\{topic\}\}/g, "sales automation");
}

export default function ProspectsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const { prospects, loading: dataLoading, addProspect, updateProspect, deleteProspect, bulkAddProspects } = useProspects(user?.uid);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Prospect|null>(null);
  const [toast, setToast] = useState<Toast>({msg:"",type:"success"});
  const fileRef = useRef<HTMLInputElement>(null);

  // Add form
  const [form, setForm] = useState({ name:"", email:"", role:"", company:"", industry:"", company_size:"", notes:"" });

  // AI Email modal
  const [aiModal, setAiModal] = useState<Prospect|null>(null);
  const [aiSubject, setAiSubject] = useState("");
  const [aiBody, setAiBody] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState<"generate"|"review">("generate");
  const [sending, setSending] = useState(false);

  const showToast = (msg:string, type:Toast["type"]="success") => {
    setToast({msg,type}); setTimeout(()=>setToast({msg:"",type:"success"}),4000);
  };

  const handleAdd = async () => {
    if (!form.name||!form.email) { showToast("Name and email required","error"); return; }
    const av = AVATARS[Math.floor(Math.random()*AVATARS.length)];
    try {
      await addProspect({
        ...form,
        ai_score: Math.floor(Math.random()*30)+65,
        buying_intent: (["high","medium","low"] as const)[Math.floor(Math.random()*3)],
        status:"new",
        avatar_init: form.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase(),
        avatar_bg: av.bg, avatar_color: av.color,
      });
      setForm({ name:"",email:"",role:"",company:"",industry:"",company_size:"",notes:"" });
      setShowAdd(false);
      showToast(`✓ ${form.name} added successfully`);
    } catch(err:any) { showToast(err.message,"error"); }
  };

  const handleDelete = async (id:string, name:string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await deleteProspect(id); showToast(`${name} deleted`); }
    catch(err:any) { showToast(err.message,"error"); }
  };

  const handleStatusChange = async (id:string, status:"new"|"contacted"|"replied"|"meeting"|"closed"|"lost") => {
    try { await updateProspect(id,{status}); showToast(`Status updated to ${status}`); }
    catch(err:any) { showToast(err.message,"error"); }
  };

  const handleCSV = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h:string)=>h.trim().toLowerCase().replace(/['"]/g,""));
      const rows = lines.slice(1).map((line:string)=>{
        const vals = line.split(",").map((v:string)=>v.trim().replace(/['"]/g,""));
        const row:any = {};
        headers.forEach((h:string,i:number)=>{ row[h]=vals[i]??""; });
        return row;
      }).filter((r:any)=>r.email||r.name);
      await bulkAddProspects(rows);
      showToast(`✓ ${rows.length} prospects imported`);
    } catch(err:any) { showToast(err.message,"error"); }
    e.target.value="";
  };

  // Generate AI email for prospect
  const openAiModal = async (prospect:Prospect) => {
    setAiModal(prospect);
    setAiStep("generate");
    setAiBody(""); setAiSubject("");
    setAiGenerating(true);
    try {
      // Generate subject + body in parallel
      const [subjectRes, bodyRes] = await Promise.all([
        fetch("/api/ai", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            type:"subjectLine",
            prompt:`Write 3 subject lines for a cold email to ${prospect.name}, ${prospect.role} at ${prospect.company} (${prospect.industry}). AI score: ${prospect.ai_score}/100. Buying intent: ${prospect.buying_intent}.`,
            userId:user?.uid,
          }),
        }),
        fetch("/api/ai", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            type:"emailWriter",
            prompt:`Write a cold email to ${prospect.name}, ${prospect.role} at ${prospect.company} in the ${prospect.industry} industry. Company size: ${prospect.company_size}. Buying intent: ${prospect.buying_intent}. AI score: ${prospect.ai_score}/100. Notes: ${prospect.notes||"none"}. Reference their specific role and company situation. Make it hyper-personalized and professional.`,
            userId:user?.uid,
          }),
        }),
      ]);

      const [subjectData, bodyData] = await Promise.all([subjectRes.json(), bodyRes.json()]);

      if (bodyData.error) {
        showToast(bodyData.upgrade?"⚠️ Daily AI limit reached. Upgrade to continue.":bodyData.error,"warning");
        setAiModal(null); setAiGenerating(false); return;
      }

      // Pick first subject line
      const subjectLines = subjectData.result?.split("\n").filter((l:string)=>l.trim()) ?? [];
      const firstSubject = subjectLines[0]?.replace(/^[0-9]+\.\s*/,"").trim() ?? `Quick note for ${prospect.name}`;

      // Replace variables in output
      const finalBody = replaceVars(bodyData.result ?? "", prospect);
      const finalSubject = replaceVars(firstSubject, prospect);

      setAiSubject(finalSubject);
      setAiBody(finalBody);
      setAiStep("review");
    } catch(err:any) { showToast(err.message,"error"); setAiModal(null); }
    setAiGenerating(false);
  };

  // Send email via Resend
  const sendEmail = async () => {
    if (!aiModal||!aiBody||!aiSubject||!user?.uid) return;
    setSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          userId:user.uid, to:aiModal.email, toName:aiModal.name,
          subject:aiSubject, emailBody:aiBody, prospectId:aiModal.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.upgrade) showToast("⚠️ Upgrade to Starter plan ($29/mo) to send real emails","warning");
        else showToast(data.error??"Failed to send","error");
      } else {
        showToast(`✓ Email sent to ${aiModal.name} at ${aiModal.email}!`);
        await updateProspect(aiModal.id,{status:"contacted"});
        setAiModal(null);
      }
    } catch(err:any) { showToast(err.message,"error"); }
    setSending(false);
  };

  const filtered = prospects.filter(p=>{
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.company?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || p.status===filter || (filter==="high"&&p.buying_intent==="high");
    return matchSearch && matchFilter;
  });

  const toastColor = toast.type==="error"?"#f87171":toast.type==="warning"?"#f59e0b":S.accent;

  if (authLoading || dataLoading) return <LoadingScreen text="Loading your prospects"/>;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast.msg&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:`1px solid ${toastColor}44`,borderRadius:12,padding:"12px 22px",fontSize:13,fontWeight:600,color:toastColor,zIndex:300,whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center" }}>{toast.msg}</div>}

      {/* AI Email Modal */}
      {aiModal&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"grid",placeItems:"center",zIndex:200,padding:20 }}>
          <div style={{ background:"#0d1018",border:"1px solid rgba(200,255,0,0.2)",borderRadius:18,padding:28,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto" }}>
            {aiGenerating?(
              <div style={{ textAlign:"center",padding:"40px 0" }}>
                <div style={{ width:40,height:40,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }}/>
                <div style={{ fontSize:14,fontWeight:600,color:S.text,marginBottom:6 }}>AI is writing for {aiModal.name}...</div>
                <div style={{ fontSize:12,color:S.faint }}>Researching {aiModal.company} · Personalizing email · Replacing variables</div>
              </div>
            ):(
              <>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
                  <div>
                    <div style={{ fontSize:16,fontWeight:800,color:S.text,fontFamily:"Syne,sans-serif" }}>AI Email — Ready to Send</div>
                    <div style={{ fontSize:12,color:S.faint,marginTop:2 }}>To: {aiModal.name} · {aiModal.email}</div>
                  </div>
                  <button onClick={()=>setAiModal(null)} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint,fontSize:20 }}>✕</button>
                </div>

                {/* Subject */}
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6 }}>Subject Line</label>
                  <input value={aiSubject} onChange={e=>setAiSubject(e.target.value)}
                    style={{ width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none" }}
                    onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
                    onBlur={e=>(e.target as HTMLInputElement).style.borderColor="rgba(255,255,255,0.08)"}/>
                </div>

                {/* Body */}
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6 }}>Email Body</label>
                  <textarea value={aiBody} onChange={e=>setAiBody(e.target.value)} rows={10}
                    style={{ width:"100%",padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",resize:"vertical",lineHeight:1.75 }}
                    onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                    onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(255,255,255,0.08)"}/>
                </div>

                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={()=>openAiModal(aiModal)}
                    style={{ padding:"10px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    ↺ Regenerate
                  </button>
                  <button onClick={sendEmail} disabled={sending}
                    style={{ flex:1,padding:"11px",borderRadius:10,background:sending?"rgba(200,255,0,0.6)":S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:sending?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    {sending
                      ?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Sending via Resend...</>
                      :<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>Send Email via Resend</>}
                  </button>
                </div>

                <div style={{ marginTop:10,fontSize:11,color:S.faint,textAlign:"center" }}>
                  Free plan = draft only · Starter plan = real email sent via Resend
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <input type="file" ref={fileRef} accept=".csv" onChange={handleCSV} style={{ display:"none" }}/>
      <Sidebar active="prospects" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Prospects</h1>
            <p style={{ color:S.muted,fontSize:14 }}><span style={{ color:S.accent,fontWeight:700 }}>{prospects.length} prospects</span> · AI-scored · Click "AI Email" to generate + send instantly</p>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>fileRef.current?.click()}
              style={{ padding:"9px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Import CSV
            </button>
            <button onClick={()=>setShowAdd(!showAdd)}
              style={{ padding:"9px 18px",borderRadius:10,background:S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add Prospect
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAdd&&(
          <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24,marginBottom:20 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:16 }}>Add New Prospect</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14 }}>
              {[
                { key:"name",label:"Full Name *",placeholder:"Sarah Chen" },
                { key:"email",label:"Email *",placeholder:"sarah@company.com" },
                { key:"role",label:"Job Title",placeholder:"CRO" },
                { key:"company",label:"Company",placeholder:"Linear" },
                { key:"industry",label:"Industry",placeholder:"SaaS" },
                { key:"company_size",label:"Company Size",placeholder:"50-200" },
              ].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:11,fontWeight:600,color:S.faint,display:"block",marginBottom:5 }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    placeholder={f.placeholder}
                    style={{ width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none" }}
                    onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
                    onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11,fontWeight:600,color:S.faint,display:"block",marginBottom:5 }}>Notes / Context</label>
              <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                placeholder="Recent LinkedIn post, company news, pain points — the more detail, the better the AI email"
                rows={2}
                style={{ width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",resize:"none" }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={handleAdd}
                style={{ padding:"10px 24px",borderRadius:10,background:S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                Add Prospect
              </button>
              <button onClick={()=>setShowAdd(false)}
                style={{ padding:"10px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap" }}>
          <div style={{ flex:1,minWidth:200,position:"relative" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.faint} strokeWidth="2" strokeLinecap="round" style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search prospects, companies..."
              style={{ width:"100%",padding:"9px 12px 9px 36px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none" }}
              onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
              onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
          </div>
          <div style={{ display:"flex",gap:6 }}>
            {[["all","All"],["high","🔥 High Intent"],["new","New"],["contacted","Contacted"],["replied","Replied"],["meeting","Meeting"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)}
                style={{ padding:"8px 14px",borderRadius:9,border:`1px solid ${filter===v?"rgba(200,255,0,0.3)":S.lineSoft}`,background:filter===v?"rgba(200,255,0,0.08)":"transparent",color:filter===v?S.accent:S.faint,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18 }}>
          {[
            { label:"Total",value:prospects.length,color:S.text },
            { label:"High Intent",value:prospects.filter(p=>p.buying_intent==="high").length,color:S.accent },
            { label:"Contacted",value:prospects.filter(p=>p.status==="contacted").length,color:"#818cf8" },
            { label:"Replied",value:prospects.filter(p=>p.status==="replied").length,color:"#34d399" },
            { label:"Meeting",value:prospects.filter(p=>p.status==="meeting").length,color:"#f59e0b" },
          ].map(s=>(
            <div key={s.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:"12px 14px",textAlign:"center" }}>
              <div style={{ fontSize:22,fontWeight:800,color:s.color,fontFamily:"Syne,sans-serif" }}>{s.value}</div>
              <div style={{ fontSize:11,color:S.faint,marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
          {/* Table Header */}
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1.2fr 80px 90px 110px 200px",padding:"12px 20px",borderBottom:`1px solid ${S.lineSoft}`,background:"rgba(255,255,255,0.02)" }}>
            {["Prospect","Company","Score","Intent","Status","Actions"].map(h=>(
              <div key={h} style={{ fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>{h}</div>
            ))}
          </div>

          {dataLoading?(
            <div style={{ padding:"48px",textAlign:"center",color:S.faint }}>Loading prospects...</div>
          ):filtered.length===0?(
            <div style={{ padding:"48px 24px",textAlign:"center" }}>
              <div style={{ fontSize:40,marginBottom:14 }}>👥</div>
              <div style={{ fontSize:15,fontWeight:700,color:S.text,marginBottom:8 }}>
                {prospects.length===0?"No prospects yet":"No prospects match your filter"}
              </div>
              <div style={{ fontSize:13,color:S.muted,marginBottom:20 }}>
                {prospects.length===0?"Add your first prospect or import a CSV file":"Try a different search or filter"}
              </div>
              {prospects.length===0&&(
                <button onClick={()=>setShowAdd(true)}
                  style={{ padding:"11px 24px",borderRadius:10,background:S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                  + Add First Prospect
                </button>
              )}
            </div>
          ):(
            filtered.map((p,i)=>(
              <div key={p.id}
                style={{ display:"grid",gridTemplateColumns:"2fr 1.2fr 80px 90px 110px 200px",padding:"13px 20px",borderBottom:i<filtered.length-1?`1px solid ${S.lineSoft}`:"none",transition:"background 0.15s",alignItems:"center" }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.015)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>

                {/* Prospect */}
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:34,height:34,borderRadius:"50%",background:p.avatar_bg,color:p.avatar_color,display:"grid",placeItems:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>{p.avatar_init}</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:S.text }}>{p.name}</div>
                    <div style={{ fontSize:11,color:S.faint }}>{p.role} · {p.email}</div>
                  </div>
                </div>

                {/* Company */}
                <div style={{ fontSize:13,color:S.muted }}>{p.company}</div>

                {/* Score */}
                <div>
                  <span style={{ fontSize:13,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.ai_score>=85?S.accent:p.ai_score>=70?"#f59e0b":"#9598a3",background:p.ai_score>=85?"rgba(200,255,0,0.08)":p.ai_score>=70?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)" }}>
                    {p.ai_score}
                  </span>
                </div>

                {/* Intent */}
                <div>
                  <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.buying_intent==="high"?S.accent:p.buying_intent==="medium"?"#f59e0b":"#9598a3",background:p.buying_intent==="high"?"rgba(200,255,0,0.08)":p.buying_intent==="medium"?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)" }}>
                    {p.buying_intent}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <select value={p.status} onChange={e=>handleStatusChange(p.id, e.target.value as "new"|"contacted"|"replied"|"meeting"|"closed"|"lost")}
                    style={{ fontSize:11,fontWeight:700,padding:"4px 8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:p.status==="replied"?"#34d399":p.status==="contacted"?"#818cf8":p.status==="meeting"?"#f59e0b":"#9598a3",fontFamily:"Inter,sans-serif",cursor:"pointer",outline:"none" }}>
                    {["new","contacted","replied","meeting","closed"].map(s=>(
                      <option key={s} value={s} style={{ background:"#0d1018",color:"#f4f5f7" }}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                  {/* AI Email + Send button */}
                  <button onClick={()=>openAiModal(p)}
                    style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.25)",color:S.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap",transition:"all 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(200,255,0,0.15)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(200,255,0,0.08)"}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    AI Email
                  </button>
                  <button onClick={()=>setSelected(selected?.id===p.id?null:p)}
                    style={{ padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.faint,fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    View
                  </button>
                  <button onClick={()=>handleDelete(p.id,p.name)}
                    style={{ padding:"6px 8px",borderRadius:8,background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.15)",color:"#f87171",fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder,textarea::placeholder{color:#555a66}
        select option{background:#0d1018;color:#f4f5f7}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}