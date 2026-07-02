"use client";
import { useState, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useProspects, type DbProspect } from "@/components/useProspects";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00",violet:"#7c3aed" };

const GRADIENTS = [
  "linear-gradient(140deg,#C8FF00,#86efac)","linear-gradient(140deg,#818cf8,#c084fc)",
  "linear-gradient(140deg,#7c3aed,#9333ea)","linear-gradient(140deg,#f59e0b,#ef4444)",
  "linear-gradient(140deg,#34d399,#059669)","linear-gradient(140deg,#60a5fa,#3b82f6)",
  "linear-gradient(140deg,#f472b6,#ec4899)","linear-gradient(140deg,#a78bfa,#7c3aed)",
];
const INDUSTRIES = ["All","Fintech","SaaS","Productivity","Design","DevTools","Video","eCommerce","Healthcare","Other"];
const INTENTS = ["All","high","medium","low"];
const STATUSES = ["All","new","contacted","replied","meeting","closed","lost"];

function getInit(name:string){ return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"??"; }
function scoreProspect(p:any):number{
  let s=50;
  const role=(p.role||"").toLowerCase();
  if(role.includes("vp")||role.includes("cro")||role.includes("chief")) s+=20;
  else if(role.includes("director")||role.includes("head")) s+=12;
  if(["Fintech","DevTools","SaaS"].includes(p.industry||"")) s+=10;
  if((p.company_size||"").includes("1000")||(p.company_size||"").includes("5000")) s+=10;
  else if((p.company_size||"").includes("500")) s+=6;
  if(p.email&&p.phone) s+=5;
  if(p.linkedin_url) s+=5;
  return Math.min(100,s);
}

// ── ADD MODAL ──────────────────────────────────────────────────────────────
function AddModal({onClose,onAdd}:{onClose:()=>void;onAdd:(p:Partial<DbProspect>)=>Promise<void>}){
  const [form,setForm]=useState({name:"",email:"",role:"",company:"",industry:"SaaS",company_size:"100-500",phone:"",linkedin_url:"",notes:"",buying_intent:"medium" as "high"|"medium"|"low",status:"new" as DbProspect["status"]});
  const [saving,setSaving]=useState(false);
  const [errors,setErrors]=useState<Record<string,string>>({});

  const validate=()=>{
    const e:Record<string,string>={};
    if(!form.name.trim()) e.name="Name required";
    if(!form.email.trim()) e.email="Email required";
    else if(!/\S+@\S+\.\S+/.test(form.email)) e.email="Invalid email";
    if(!form.role.trim()) e.role="Role required";
    if(!form.company.trim()) e.company="Company required";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleAdd=async()=>{
    if(!validate()) return;
    setSaving(true);
    const score=scoreProspect(form);
    const gi=Math.floor(Math.random()*GRADIENTS.length);
    await onAdd({
      name:form.name.trim(), email:form.email.trim(), role:form.role.trim(),
      company:form.company.trim(), industry:form.industry, company_size:form.company_size,
      phone:form.phone.trim(), linkedin_url:form.linkedin_url.trim(), notes:form.notes.trim(),
      buying_intent:form.buying_intent, status:form.status, ai_score:score,
      avatar_init:getInit(form.name),
      avatar_bg:GRADIENTS[gi],
      avatar_color:gi===0||gi===7?"#050505":"#fff",
    });
    setSaving(false);
    onClose();
  };

  const F=({label,field,placeholder,type="text",required=false}:any)=>(
    <div>
      <label style={{fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:5}}>{label}{required&&<span style={{color:"#f87171",marginLeft:3}}>*</span>}</label>
      <input type={type} value={form[field as keyof typeof form] as string}
        onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
        placeholder={placeholder}
        style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${errors[field]?"rgba(248,113,113,0.5)":S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none"}}
        onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
        onBlur={e=>(e.target as HTMLInputElement).style.borderColor=errors[field]?"rgba(248,113,113,0.5)":S.lineSoft}/>
      {errors[field]&&<div style={{fontSize:11,color:"#f87171",marginTop:3}}>⚠ {errors[field]}</div>}
    </div>
  );
  const Sel=({label,field,opts}:any)=>(
    <div>
      <label style={{fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:5}}>{label}</label>
      <select value={form[field as keyof typeof form] as string} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
        style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",cursor:"pointer"}}>
        {opts.map((o:string)=><option key={o} value={o} style={{background:"#0d1018"}}>{o}</option>)}
      </select>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:20}}>
      <div style={{background:"#0d1018",border:"1px solid rgba(200,255,0,0.2)",borderRadius:20,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px",borderBottom:`1px solid ${S.lineSoft}`}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:S.text,fontFamily:"Syne,sans-serif"}}>Add New Prospect</div>
            <div style={{fontSize:12,color:S.faint,marginTop:2}}>AI will auto-score based on your ICP</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:S.faint,padding:6}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><F label="Full Name" field="name" placeholder="James Morrison" required/><F label="Email" field="email" placeholder="james@company.com" type="email" required/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><F label="Job Title" field="role" placeholder="VP Sales" required/><F label="Company" field="company" placeholder="Stripe" required/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Sel label="Industry" field="industry" opts={["Fintech","SaaS","Productivity","Design","DevTools","Video","eCommerce","Healthcare","Other"]}/>
            <Sel label="Company Size" field="company_size" opts={["1-10","10-50","50-200","200-500","500-1000","1000-5000","5000+"]}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><F label="Phone" field="phone" placeholder="+1 415 555 0101"/><F label="LinkedIn URL" field="linkedin_url" placeholder="linkedin.com/in/name"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Sel label="Buying Intent" field="buying_intent" opts={["high","medium","low"]}/>
            <Sel label="Status" field="status" opts={["new","contacted","replied","meeting","closed","lost"]}/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:5}}>Notes</label>
            <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Any context about this prospect..."
              style={{width:"100%",minHeight:68,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",resize:"vertical"}}
              onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
              onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>
          </div>
          <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.12)",fontSize:12,color:S.muted,display:"flex",alignItems:"center",gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.accent} strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            AI will analyze and assign an ICP score automatically
          </div>
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Cancel</button>
            <button onClick={handleAdd} disabled={saving}
              style={{flex:2,padding:"11px",borderRadius:10,background:saving?"rgba(200,255,0,0.6)":S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {saving?<><span style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>Saving...</>:"⚡ Add & Score Prospect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── IMPORT MODAL ───────────────────────────────────────────────────────────
function ImportModal({onClose,onImport}:{onClose:()=>void;onImport:(ps:Partial<DbProspect>[])=>Promise<void>}){
  const fileRef=useRef<HTMLInputElement>(null);
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState<string[][]>([]);
  const [importing,setImporting]=useState(false);
  const [done,setDone]=useState(false);
  const [count,setCount]=useState(0);
  const [error,setError]=useState("");
  const [mapping,setMapping]=useState<Record<string,string>>({});
  const FIELDS=["name","email","role","company","industry","company_size","phone","linkedin_url"];

  const parseCSV=(text:string)=>{
    return text.trim().split(/\r?\n/).map(r=>{
      const cells:string[]=[]; let cur="",inQ=false;
      for(let i=0;i<r.length;i++){
        if(r[i]==='"'){inQ=!inQ;continue;}
        if(r[i]===','&&!inQ){cells.push(cur.trim());cur="";continue;}
        cur+=r[i];
      }
      cells.push(cur.trim()); return cells;
    });
  };

  const handleFile=(f:File)=>{
    if(!f.name.endsWith(".csv")){setError("Please upload a .csv file");return;}
    setError(""); setFile(f);
    const reader=new FileReader();
    reader.onload=(e)=>{
      const rows=parseCSV(e.target?.result as string);
      setPreview(rows.slice(0,6));
      if(rows[0]){
        const auto:Record<string,string>={};
        rows[0].forEach((h,i)=>{
          const l=h.toLowerCase();
          if(l.includes("name")&&!l.includes("company")) auto.name=String(i);
          else if(l.includes("email")) auto.email=String(i);
          else if(l.includes("title")||l.includes("role")||l.includes("position")) auto.role=String(i);
          else if(l.includes("company")||l.includes("organization")) auto.company=String(i);
          else if(l.includes("industry")) auto.industry=String(i);
          else if(l.includes("size")||l.includes("employee")) auto.company_size=String(i);
          else if(l.includes("phone")||l.includes("mobile")) auto.phone=String(i);
          else if(l.includes("linkedin")) auto.linkedin_url=String(i);
        });
        setMapping(auto);
      }
    };
    reader.readAsText(f);
  };

  const handleDrop=useCallback((e:React.DragEvent)=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);},[]);

  const doImport=async()=>{
    if(!file||!preview.length) return;
    setImporting(true);
    const reader=new FileReader();
    reader.onload=async(e)=>{
      const rows=parseCSV(e.target?.result as string);
      const dataRows=rows.slice(1).filter(r=>r.some(c=>c.trim()));
      const prospects:Partial<DbProspect>[]=dataRows.map((row,i)=>{
        const get=(field:string)=>{const idx=parseInt(mapping[field]??"999");return idx<row.length?row[idx]?.trim()||"":"";};
        const name=get("name")||`Prospect ${i+1}`;
        const gi=i%GRADIENTS.length;
        return{
          name, email:get("email"), role:get("role"), company:get("company"),
          industry:get("industry")||"Other", company_size:get("company_size")||"Unknown",
          phone:get("phone"), linkedin_url:get("linkedin_url"),
          ai_score:scoreProspect({name,role:get("role"),company:get("company"),industry:get("industry"),company_size:get("company_size"),phone:get("phone"),linkedin_url:get("linkedin_url")}),
          buying_intent:"medium" as const, status:"new" as const,
          avatar_init:getInit(name), avatar_bg:GRADIENTS[gi],
          avatar_color:gi===0||gi===7?"#050505":"#fff", notes:"",
        };
      });
      setCount(prospects.length);
      await onImport(prospects);
      setImporting(false); setDone(true);
      setTimeout(()=>onClose(),1500);
    };
    reader.readAsText(file);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:20}}>
      <div style={{background:"#0d1018",border:"1px solid rgba(200,255,0,0.2)",borderRadius:20,width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px",borderBottom:`1px solid ${S.lineSoft}`}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:S.text,fontFamily:"Syne,sans-serif"}}>Import CSV</div>
            <div style={{fontSize:12,color:S.faint,marginTop:2}}>Upload prospect list — saves directly to your database</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:S.faint,padding:6}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:16}}>
          {done?(
            <div style={{textAlign:"center",padding:"32px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>✅</div>
              <div style={{fontSize:20,fontWeight:800,color:S.accent,fontFamily:"Syne,sans-serif",marginBottom:6}}>{count} Prospects Saved!</div>
              <div style={{fontSize:13,color:S.muted}}>Data saved to your Supabase database</div>
            </div>
          ):(
            <>
              <div onDrop={handleDrop} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()}
                style={{border:`2px dashed ${file?"rgba(200,255,0,0.4)":S.lineSoft}`,borderRadius:14,padding:"32px 24px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",background:file?"rgba(200,255,0,0.03)":"rgba(255,255,255,0.01)"}}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,255,0,0.3)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=file?"rgba(200,255,0,0.4)":S.lineSoft}>
                <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>{if(e.target.files?.[0])handleFile(e.target.files[0]);}}/>
                {file?(
                  <><div style={{fontSize:32,marginBottom:8}}>📄</div><div style={{fontSize:14,fontWeight:700,color:S.accent}}>{file.name}</div><div style={{fontSize:12,color:S.faint,marginTop:4}}>{(file.size/1024).toFixed(1)} KB · {preview.length-1} rows</div></>
                ):(
                  <><div style={{fontSize:32,marginBottom:10}}>📥</div><div style={{fontSize:14,fontWeight:700,color:S.text,marginBottom:4}}>Drop CSV here or click to browse</div><div style={{fontSize:12,color:S.faint}}>Supports any column order</div></>
                )}
              </div>
              {error&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",fontSize:12,color:"#f87171"}}>⚠ {error}</div>}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`}}>
                <div style={{fontSize:12,color:S.muted}}>💡 Need a template?</div>
                <button onClick={()=>{const csv="name,email,role,company,industry,company_size,phone,linkedin_url\nJohn Smith,john@company.com,VP Sales,Acme Inc,SaaS,100-500,+1 415 555 0100,linkedin.com/in/johnsmith";const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="salesforge-template.csv";a.click();}}
                  style={{fontSize:11,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"5px 12px",borderRadius:8,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                  Download Template
                </button>
              </div>
              {preview.length>0&&(
                <>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Column Mapping</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {FIELDS.map(field=>(
                        <div key={field} style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:11,color:S.muted,minWidth:80,textTransform:"capitalize"}}>{field.replace("_"," ")}</span>
                          <select value={mapping[field]||""} onChange={e=>setMapping(p=>({...p,[field]:e.target.value}))}
                            style={{flex:1,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:12,fontFamily:"Inter,sans-serif",outline:"none"}}>
                            <option value="" style={{background:"#0d1018"}}>— skip —</option>
                            {preview[0]?.map((h,i)=><option key={i} value={String(i)} style={{background:"#0d1018"}}>Col {i+1}: {h}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{overflowX:"auto",borderRadius:10,border:`1px solid ${S.lineSoft}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",padding:"10px 12px",borderBottom:`1px solid ${S.lineSoft}`}}>Preview (first 5 rows)</div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead><tr>{preview[0]?.map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:"left",color:S.faint,fontWeight:600,borderBottom:`1px solid ${S.lineSoft}`,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                      <tbody>{preview.slice(1).map((row,i)=><tr key={i}>{row.map((c,j)=><td key={j} style={{padding:"7px 10px",color:S.muted,borderBottom:`1px solid ${S.lineSoft}`,whiteSpace:"nowrap",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis"}}>{c}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </>
              )}
              <div style={{display:"flex",gap:10}}>
                <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Cancel</button>
                <button onClick={doImport} disabled={!file||importing}
                  style={{flex:2,padding:"11px",borderRadius:10,background:!file?"rgba(255,255,255,0.05)":importing?"rgba(200,255,0,0.6)":S.accent,border:"none",color:!file?S.faint:"#050505",fontSize:13,fontWeight:700,cursor:!file||importing?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {importing?<><span style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>Saving to DB...</>:`Import ${file?preview.length-1:0} Prospects`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function ProspectsPage(){
  const {user,loading:authLoading,handleLogout}=useAuth();
  const {prospects,loading:dataLoading,addProspect,bulkAddProspects,updateProspect,deleteProspect}=useProspects(user?.uid);
  const [search,setSearch]=useState("");
  const [industry,setIndustry]=useState("All");
  const [intent,setIntent]=useState("All");
  const [status,setStatus]=useState("All");
  const [selected,setSelected]=useState<DbProspect|null>(null);
  const [aiWriting,setAiWriting]=useState(false);
  const [aiEmail,setAiEmail]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [showImport,setShowImport]=useState(false);
  const [toast,setToast]=useState("");
  const [editingNote,setEditingNote]=useState(false);
  const [noteVal,setNoteVal]=useState("");

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(""),3000);};

  const filtered=prospects.filter(p=>{
    const q=search.toLowerCase();
    return(!q||p.name.toLowerCase().includes(q)||p.company.toLowerCase().includes(q)||p.role.toLowerCase().includes(q)||p.email.toLowerCase().includes(q))
      &&(industry==="All"||p.industry===industry)
      &&(intent==="All"||p.buying_intent===intent)
      &&(status==="All"||p.status===status);
  }).sort((a,b)=>b.ai_score-a.ai_score);

  const writeEmail=async(p:DbProspect)=>{
    setAiWriting(true);setAiEmail("");
    try{
      const res=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"emailWriter",prompt:`Prospect: ${p.name}, ${p.role} at ${p.company} (${p.industry}, ${p.company_size} employees). Email: ${p.email}. Write hyper-personalized cold email.`})});
      const data=await res.json();
      setAiEmail(data.result??"Could not generate email.");
    }catch{setAiEmail("Error connecting to AI.");}
    setAiWriting(false);
  };

  const handleAdd=async(p:Partial<DbProspect>)=>{
    try{await addProspect(p);showToast(`✓ ${p.name} added with AI score ${p.ai_score}`);}
    catch(err:any){showToast(`Error: ${err.message}`);}
  };

  const handleBulkImport=async(ps:Partial<DbProspect>[])=>{
    try{await bulkAddProspects(ps);showToast(`✓ ${ps.length} prospects imported & saved!`);}
    catch(err:any){showToast(`Error: ${err.message}`);}
  };

  const handleStatusChange=async(id:string,newStatus:DbProspect["status"])=>{
    try{
      await updateProspect(id,{status:newStatus});
      setSelected(prev=>prev?.id===id?{...prev,status:newStatus}:prev);
      showToast("Status updated ✓");
    }catch(err:any){showToast(`Error: ${err.message}`);}
  };

  const handleDelete=async(id:string)=>{
    try{await deleteProspect(id);setSelected(null);showToast("Prospect deleted");}
    catch(err:any){showToast(`Error: ${err.message}`);}
  };

  const handleSaveNote=async(id:string)=>{
    try{
      await updateProspect(id,{notes:noteVal});
      setSelected(prev=>prev?.id===id?{...prev,notes:noteVal}:prev);
      setEditingNote(false);showToast("Note saved ✓");
    }catch(err:any){showToast(`Error: ${err.message}`);}
  };

  const pageLoading=authLoading||dataLoading;
  if(pageLoading) return(
    <div style={{minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
        <div style={{color:S.muted,fontSize:14,fontFamily:"Inter,sans-serif"}}>Loading prospects...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif"}}>
      {showAdd&&<AddModal onClose={()=>setShowAdd(false)} onAdd={handleAdd}/>}
      {showImport&&<ImportModal onClose={()=>setShowImport(false)} onImport={handleBulkImport}/>}
      {toast&&<div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:"1px solid rgba(200,255,0,0.3)",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:S.accent,zIndex:300,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",whiteSpace:"nowrap"}}>{toast}</div>}

      <Sidebar active="prospects" user={user} onLogout={handleLogout}/>
      <div style={{marginLeft:240,padding:"28px 32px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <h1 style={{fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4}}>Prospects</h1>
            <p style={{color:S.muted,fontSize:14}}><span style={{color:S.accent,fontWeight:700}}>{filtered.length}</span> of {prospects.length} · Saved in Supabase ✓</p>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowImport(true)}
              style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(200,255,0,0.2)";(e.currentTarget as HTMLButtonElement).style.color=S.accent;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=S.lineSoft;(e.currentTarget as HTMLButtonElement).style.color=S.muted;}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Import CSV
            </button>
            <button onClick={()=>setShowAdd(true)}
              style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Add Prospect
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555a66" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, company, role, email..."
              style={{width:"100%",padding:"10px 14px 10px 36px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none"}}
              onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
              onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
          </div>
          {[["Industry",INDUSTRIES,industry,setIndustry],["Intent",INTENTS,intent,setIntent],["Status",STATUSES,status,setStatus]].map(([lbl,opts,val,setter]:any)=>(
            <select key={lbl} value={val} onChange={e=>setter(e.target.value)}
              style={{padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:val==="All"?S.faint:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",cursor:"pointer",minWidth:140}}>
              {(opts as string[]).map(o=><option key={o} value={o} style={{background:"#0d1018"}}>{lbl}: {o}</option>)}
            </select>
          ))}
          {(search||industry!=="All"||intent!=="All"||status!=="All")&&(
            <button onClick={()=>{setSearch("");setIndustry("All");setIntent("All");setStatus("All");}}
              style={{padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
              Clear ✕
            </button>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 380px":"1fr",gap:20}}>
          {/* Table */}
          <div style={{background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 110px 90px",padding:"12px 20px",borderBottom:`1px solid ${S.lineSoft}`}}>
              {["Prospect","Company","Score","Intent","Status","Action"].map(h=>(
                <div key={h} style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em"}}>{h}</div>
              ))}
            </div>
            {filtered.length===0?(
              <div style={{padding:"48px 24px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:12}}>🔍</div>
                <div style={{fontSize:14,fontWeight:600,color:S.text,marginBottom:6}}>{prospects.length===0?"No prospects yet — add your first one!":"No prospects match filters"}</div>
                <div style={{fontSize:12,color:S.faint}}>{prospects.length===0?"Click \"Add Prospect\" or \"Import CSV\" to get started":"Try adjusting your filters"}</div>
              </div>
            ):filtered.map((p,i)=>(
              <div key={p.id} onClick={()=>{setSelected(selected?.id===p.id?null:p);setAiEmail("");}}
                style={{display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 110px 90px",padding:"13px 20px",borderBottom:i<filtered.length-1?`1px solid ${S.lineSoft}`:"none",cursor:"pointer",transition:"background 0.2s",background:selected?.id===p.id?"rgba(200,255,0,0.03)":"transparent"}}
                onMouseEnter={e=>{if(selected?.id!==p.id)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)";}}
                onMouseLeave={e=>{if(selected?.id!==p.id)(e.currentTarget as HTMLDivElement).style.background="transparent";}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:p.avatar_bg,color:p.avatar_color,display:"grid",placeItems:"center",fontSize:12,fontWeight:800,flexShrink:0}}>{p.avatar_init}</div>
                  <div><div style={{fontSize:13,fontWeight:600,color:S.text}}>{p.name}</div><div style={{fontSize:11,color:S.faint}}>{p.role}</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",fontSize:13,color:S.muted}}>{p.company}</div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.ai_score>=90?S.accent:p.ai_score>=75?"#f59e0b":"#9598a3",background:p.ai_score>=90?"rgba(200,255,0,0.08)":p.ai_score>=75?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)"}}>{p.ai_score}</span>
                </div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.buying_intent==="high"?S.accent:p.buying_intent==="medium"?"#f59e0b":"#9598a3",background:p.buying_intent==="high"?"rgba(200,255,0,0.08)":p.buying_intent==="medium"?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)"}}>{p.buying_intent}</span>
                </div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <select value={p.status} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();handleStatusChange(p.id,e.target.value as DbProspect["status"]);}}
                    style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:999,border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",outline:"none",
                      color:p.status==="replied"?"#34d399":p.status==="meeting"?S.accent:p.status==="contacted"?"#818cf8":p.status==="closed"?"#34d399":p.status==="lost"?"#f87171":"#9598a3",
                      background:p.status==="replied"?"rgba(52,211,153,0.1)":p.status==="meeting"?"rgba(200,255,0,0.08)":p.status==="contacted"?"rgba(129,140,248,0.1)":p.status==="closed"?"rgba(52,211,153,0.12)":p.status==="lost"?"rgba(248,113,113,0.1)":"rgba(255,255,255,0.05)"}}>
                    {["new","contacted","replied","meeting","closed","lost"].map(s=><option key={s} value={s} style={{background:"#0d1018",color:"#f4f5f7"}}>{s}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <button onClick={e=>{e.stopPropagation();setSelected(p);writeEmail(p);}}
                    style={{fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    ✉ Email
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected&&(
            <div style={{background:S.panel,border:"1px solid rgba(200,255,0,0.18)",borderRadius:16,padding:22,height:"fit-content",position:"sticky",top:28,maxHeight:"calc(100vh - 56px)",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:selected.avatar_bg,color:selected.avatar_color,display:"grid",placeItems:"center",fontSize:15,fontWeight:800,flexShrink:0}}>{selected.avatar_init}</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:S.text}}>{selected.name}</div>
                    <div style={{fontSize:12,color:S.faint}}>{selected.role} · {selected.company}</div>
                  </div>
                </div>
                <button onClick={()=>{setSelected(null);setAiEmail("");}} style={{background:"none",border:"none",cursor:"pointer",color:S.faint,padding:4}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
                {[["Score",`${selected.ai_score}`,S.accent],["Intent",selected.buying_intent,selected.buying_intent==="high"?S.accent:"#f59e0b"],["Status",selected.status,"#818cf8"]].map(([l,v,c])=>(
                  <div key={l} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:S.faint,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>{l}</div>
                    <div style={{fontSize:15,fontWeight:800,color:c,fontFamily:"Syne,sans-serif",textTransform:"capitalize"}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Contact Info</div>
                {[["📧",selected.email,"mailto:"+selected.email],["📞",selected.phone||"—",selected.phone?"tel:"+selected.phone:null],["💼",selected.linkedin_url||"—",selected.linkedin_url?"https://"+selected.linkedin_url:null],["🏢",`${selected.company_size} employees`,null],["🏭",selected.industry,null]].map(([icon,val,href])=>(
                  <div key={icon as string} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${S.lineSoft}`}}>
                    <span style={{fontSize:12,color:S.faint,minWidth:22}}>{icon as string}</span>
                    {href?<a href={href as string} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:S.accent,textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{val as string}</a>
                      :<span style={{fontSize:12,color:S.text}}>{val as string}</span>}
                  </div>
                ))}
              </div>
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em"}}>Notes</div>
                  <button onClick={()=>{setEditingNote(!editingNote);setNoteVal(selected.notes||"");}} style={{fontSize:11,color:S.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:600}}>
                    {editingNote?"Cancel":"Edit"}
                  </button>
                </div>
                {editingNote?(
                  <>
                    <textarea value={noteVal} onChange={e=>setNoteVal(e.target.value)} placeholder="Add notes..."
                      style={{width:"100%",minHeight:80,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(200,255,0,0.3)",color:S.text,fontSize:12,fontFamily:"Inter,sans-serif",outline:"none",resize:"vertical",lineHeight:1.6}}/>
                    <button onClick={()=>handleSaveNote(selected.id)}
                      style={{marginTop:6,width:"100%",padding:"8px",borderRadius:9,background:S.accent,border:"none",color:"#050505",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                      Save to Database
                    </button>
                  </>
                ):(
                  <div style={{fontSize:12,color:selected.notes?S.muted:S.faint,lineHeight:1.6,padding:"8px 10px",borderRadius:9,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,minHeight:44}}>
                    {selected.notes||"No notes yet. Click Edit to add."}
                  </div>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <button onClick={()=>writeEmail(selected)} disabled={aiWriting}
                  style={{width:"100%",padding:"11px",borderRadius:10,border:"none",background:aiWriting?"rgba(200,255,0,0.5)":S.accent,color:"#050505",fontSize:13,fontWeight:700,cursor:aiWriting?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {aiWriting?<><span style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>Writing email...</>:"⚡ Write AI Email"}
                </button>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <button onClick={()=>handleStatusChange(selected.id,"meeting")}
                    style={{padding:"9px",borderRadius:9,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",color:"#34d399",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>📅 Book Meeting</button>
                  <button onClick={()=>handleDelete(selected.id)}
                    style={{padding:"9px",borderRadius:9,background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.15)",color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>🗑 Delete</button>
                </div>
              </div>
              {(aiEmail||aiWriting)&&(
                <div style={{marginTop:14,background:"rgba(0,0,0,0.3)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>⚡ AI Generated Email</div>
                  {aiWriting
                    ?<div style={{display:"flex",gap:6,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:S.accent,animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite`}}/>)}<span style={{fontSize:12,color:S.faint,marginLeft:4}}>Writing...</span></div>
                    :<><pre style={{fontSize:12,color:S.text,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",margin:"0 0 12px"}}>{aiEmail}</pre>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>navigator.clipboard.writeText(aiEmail).then(()=>showToast("Copied ✓"))}
                          style={{flex:1,padding:"7px 14px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Copy</button>
                        <button onClick={()=>setAiEmail("")}
                          style={{padding:"7px 12px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.faint,fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Clear</button>
                      </div>
                    </>
                  }
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
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        input::placeholder,textarea::placeholder{color:#555a66}
        select option{background:#0d1018;color:#f4f5f7}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
