"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const ALL_PROSPECTS = [
  { init:"JM",name:"James Morrison",email:"james@stripe.com",role:"VP Sales",company:"Stripe",industry:"Fintech",size:"1000-5000",score:98,intent:"high",status:"new",bg:"linear-gradient(140deg,#C8FF00,#86efac)",color:"#050505",phone:"+1 415 555 0101",linkedin:"linkedin.com/in/jmorrison" },
  { init:"SC",name:"Sarah Chen",email:"sarah@linear.app",role:"CRO",company:"Linear",industry:"SaaS",size:"100-500",score:94,intent:"high",status:"replied",bg:"linear-gradient(140deg,#818cf8,#c084fc)",color:"#fff",phone:"+1 628 555 0192",linkedin:"linkedin.com/in/sarahchen" },
  { init:"RP",name:"Raj Patel",email:"raj@notion.so",role:"Head of Sales",company:"Notion",industry:"Productivity",size:"500-1000",score:91,intent:"medium",status:"contacted",bg:"linear-gradient(140deg,#7c3aed,#9333ea)",color:"#fff",phone:"+1 510 555 0147",linkedin:"linkedin.com/in/rajpatel" },
  { init:"AL",name:"Amy Liu",email:"amy@figma.com",role:"Director Sales",company:"Figma",industry:"Design",size:"500-1000",score:88,intent:"high",status:"new",bg:"linear-gradient(140deg,#f59e0b,#ef4444)",color:"#fff",phone:"+1 415 555 0183",linkedin:"linkedin.com/in/amyliu" },
  { init:"MJ",name:"Marcus Johnson",email:"marcus@vercel.com",role:"VP Revenue",company:"Vercel",industry:"DevTools",size:"200-500",score:85,intent:"medium",status:"new",bg:"linear-gradient(140deg,#34d399,#059669)",color:"#fff",phone:"+1 628 555 0211",linkedin:"linkedin.com/in/marcusj" },
  { init:"TK",name:"Tina Kim",email:"tina@loom.com",role:"Sales Director",company:"Loom",industry:"Video",size:"200-500",score:82,intent:"medium",status:"meeting",bg:"linear-gradient(140deg,#f472b6,#ec4899)",color:"#fff",phone:"+1 415 555 0244",linkedin:"linkedin.com/in/tinakim" },
  { init:"DW",name:"David Wilson",email:"david@retool.com",role:"VP Sales",company:"Retool",industry:"DevTools",size:"100-500",score:79,intent:"low",status:"new",bg:"linear-gradient(140deg,#60a5fa,#3b82f6)",color:"#fff",phone:"+1 510 555 0199",linkedin:"linkedin.com/in/davidw" },
  { init:"NR",name:"Nina Rodriguez",email:"nina@airtable.com",role:"CRO",company:"Airtable",industry:"Productivity",size:"500-1000",score:76,intent:"medium",status:"contacted",bg:"linear-gradient(140deg,#fbbf24,#f59e0b)",color:"#050505",phone:"+1 628 555 0156",linkedin:"linkedin.com/in/ninar" },
];

const INDUSTRIES = ["All","Fintech","SaaS","Productivity","Design","DevTools","Video"];
const INTENTS = ["All","high","medium","low"];
const STATUSES = ["All","new","contacted","replied","meeting","closed"];

export default function ProspectsPage() {
  const { user, loading, handleLogout } = useAuth();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [intent, setIntent] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<typeof ALL_PROSPECTS[0] | null>(null);
  const [aiWriting, setAiWriting] = useState(false);
  const [aiEmail, setAiEmail] = useState("");

  const filtered = ALL_PROSPECTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industry === "All" || p.industry === industry;
    const matchIntent = intent === "All" || p.intent === intent;
    const matchStatus = status === "All" || p.status === status;
    return matchSearch && matchIndustry && matchIntent && matchStatus;
  });

  const writeEmail = async (p: typeof ALL_PROSPECTS[0]) => {
    setAiWriting(true);
    setAiEmail("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "emailWriter", prompt: `Prospect: ${p.name}, ${p.role} at ${p.company} (${p.industry}, ${p.size} employees). Write a hyper-personalized cold email.` }),
      });
      const data = await res.json();
      setAiEmail(data.result ?? "Could not generate email.");
    } catch { setAiEmail("Error connecting to AI."); }
    setAiWriting(false);
  };

  if (loading) return <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}><div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <Sidebar active="prospects" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>
        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Prospects</h1>
            <p style={{ color:S.muted,fontSize:14 }}><span style={{ color:S.accent,fontWeight:700 }}>{filtered.length}</span> prospects found · AI-scored & ranked</p>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:S.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Import CSV
            </button>
            <button style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Add Prospect
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap" }}>
          <div style={{ position:"relative",flex:1,minWidth:200 }}>
            <svg style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555a66" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search prospects..."
              style={{ width:"100%",padding:"10px 14px 10px 36px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none" }}
              onFocus={e=>(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"}
              onBlur={e=>(e.target as HTMLInputElement).style.borderColor="rgba(255,255,255,0.07)"}/>
          </div>
          {[["Industry",INDUSTRIES,industry,setIndustry],["Intent",INTENTS,intent,setIntent],["Status",STATUSES,status,setStatus]].map(([label,opts,val,setter]:any)=>(
            <select key={label} value={val} onChange={e=>setter(e.target.value)}
              style={{ padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:S.muted,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",cursor:"pointer",minWidth:130 }}>
              {opts.map((o:string)=><option key={o} value={o} style={{ background:"#0d1018" }}>{label}: {o}</option>)}
            </select>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 380px":"1fr",gap:20 }}>
          {/* Table */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 100px 80px 90px 100px 100px",padding:"12px 20px",borderBottom:`1px solid ${S.lineSoft}` }}>
              {["Prospect","Company","Score","Intent","Status","Action"].map(h=>(
                <div key={h} style={{ fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>{h}</div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding:40,textAlign:"center",color:S.faint,fontSize:14 }}>No prospects match your filters</div>
            ) : filtered.map((p,i)=>(
              <div key={p.name}
                onClick={()=>setSelected(selected?.name===p.name?null:p)}
                style={{ display:"grid",gridTemplateColumns:"1fr 100px 80px 90px 100px 100px",padding:"13px 20px",borderBottom:i<filtered.length-1?`1px solid ${S.lineSoft}`:"none",cursor:"pointer",transition:"background 0.2s",background:selected?.name===p.name?"rgba(200,255,0,0.04)":"transparent" }}
                onMouseEnter={e=>{ if(selected?.name!==p.name)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)"; }}
                onMouseLeave={e=>{ if(selected?.name!==p.name)(e.currentTarget as HTMLDivElement).style.background="transparent"; }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:34,height:34,borderRadius:"50%",background:p.bg,color:p.color,display:"grid",placeItems:"center",fontSize:12,fontWeight:800,flexShrink:0 }}>{p.init}</div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:S.text }}>{p.name}</div><div style={{ fontSize:11,color:S.faint }}>{p.role}</div></div>
                </div>
                <div style={{ display:"flex",alignItems:"center",fontSize:13,color:S.muted }}>{p.company}</div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:13,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.score>=90?S.accent:p.score>=80?"#f59e0b":"#9598a3",background:p.score>=90?"rgba(200,255,0,0.08)":p.score>=80?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)" }}>{p.score}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.intent==="high"?S.accent:p.intent==="medium"?"#f59e0b":"#9598a3",background:p.intent==="high"?"rgba(200,255,0,0.08)":p.intent==="medium"?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)" }}>{p.intent}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.status==="replied"?"#34d399":p.status==="meeting"?S.accent:p.status==="contacted"?"#818cf8":"#9598a3",background:p.status==="replied"?"rgba(52,211,153,0.1)":p.status==="meeting"?"rgba(200,255,0,0.08)":p.status==="contacted"?"rgba(129,140,248,0.1)":"rgba(255,255,255,0.05)" }}>{p.status}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <button onClick={e=>{e.stopPropagation();setSelected(p);writeEmail(p);}}
                    style={{ fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    ✉ AI Email
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:22,height:"fit-content",position:"sticky",top:28 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:"50%",background:selected.bg,color:selected.color,display:"grid",placeItems:"center",fontSize:15,fontWeight:800 }}>{selected.init}</div>
                  <div><div style={{ fontSize:15,fontWeight:700,color:S.text }}>{selected.name}</div><div style={{ fontSize:12,color:S.faint }}>{selected.role} · {selected.company}</div></div>
                </div>
                <button onClick={()=>setSelected(null)} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Score */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18 }}>
                {[["AI Score",`${selected.score}/100`,S.accent],[" Intent",selected.intent,selected.intent==="high"?S.accent:"#f59e0b"],["Status",selected.status,"#818cf8"]].map(([l,v,c])=>(
                  <div key={l as string} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.06)`,borderRadius:10,padding:"10px 12px",textAlign:"center" }}>
                    <div style={{ fontSize:10,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:5 }}>{l as string}</div>
                    <div style={{ fontSize:16,fontWeight:800,color:c as string,fontFamily:"Syne,sans-serif" }}>{v as string}</div>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>Contact Info</div>
                {[["📧 Email",selected.email],["📞 Phone",selected.phone],["💼 LinkedIn",selected.linkedin],["🏢 Company Size",selected.size],["🏭 Industry",selected.industry]].map(([l,v])=>(
                  <div key={l as string} style={{ display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${S.lineSoft}` }}>
                    <span style={{ fontSize:12,color:S.faint,minWidth:100 }}>{l as string}</span>
                    <span style={{ fontSize:12,color:S.text }}>{v as string}</span>
                  </div>
                ))}
              </div>

              {/* AI Email */}
              <button onClick={()=>writeEmail(selected)} disabled={aiWriting}
                style={{ width:"100%",padding:"11px",borderRadius:10,border:"none",background:aiWriting?"rgba(200,255,0,0.5)":S.accent,color:"#050505",fontSize:13,fontWeight:700,cursor:aiWriting?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:14 }}>
                {aiWriting?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Writing email...</>:"⚡ Write AI Email"}
              </button>

              {aiEmail && (
                <div style={{ background:"rgba(0,0,0,0.3)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"14px 16px" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>⚡ AI Generated Email</div>
                  <pre style={{ fontSize:12,color:S.text,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",margin:0 }}>{aiEmail}</pre>
                  <button onClick={()=>navigator.clipboard.writeText(aiEmail)}
                    style={{ marginTop:10,padding:"7px 14px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    Copy Email
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
        select option{background:#0d1018;color:#f4f5f7}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        input::placeholder{color:#555a66}
      `}</style>
    </div>
  );
}
