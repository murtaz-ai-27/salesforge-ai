"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const THREADS = [
  { id:"1",init:"JM",name:"James Morrison",company:"Stripe",bg:"linear-gradient(140deg,#C8FF00,#86efac)",color:"#050505",subject:"Re: Quick question about Stripe",preview:"Thanks for reaching out! I'd be happy to learn more about SalesForge.",time:"2m ago",unread:true,sentiment:"positive",lastMsg:"Thanks for reaching out! I'd be happy to learn more about SalesForge. Can we schedule a 30-min call?",thread:[{from:"me",text:"Hi James, I noticed Stripe recently hired 3 new SDRs. SalesForge AI helps VP Sales like yourself book 3x more meetings...",time:"2h ago"},{from:"them",text:"Thanks for reaching out! I'd be happy to learn more about SalesForge. Can we schedule a 30-min call?",time:"2m ago"}] },
  { id:"2",init:"SC",name:"Sarah Chen",company:"Linear",bg:"linear-gradient(140deg,#818cf8,#c084fc)",color:"#fff",subject:"Re: SalesForge for Linear",preview:"Interesting! We've been looking for something like this.",time:"18m ago",unread:true,sentiment:"positive",lastMsg:"Interesting! We've been looking for something like this. What does onboarding look like?",thread:[{from:"me",text:"Hi Sarah, saw your LinkedIn post about scaling Linear's sales team. We help CROs automate top-of-funnel completely...",time:"1h ago"},{from:"them",text:"Interesting! We've been looking for something like this. What does onboarding look like?",time:"18m ago"}] },
  { id:"3",init:"RP",name:"Raj Patel",company:"Notion",bg:"linear-gradient(140deg,#7c3aed,#9333ea)",color:"#fff",subject:"Re: AI-powered sales for Notion",preview:"We're evaluating a few tools. Can you send a comparison?",time:"45m ago",unread:false,sentiment:"neutral",lastMsg:"We're actually evaluating a few tools. Can you send over a comparison?",thread:[{from:"me",text:"Hi Raj, congratulations on Notion's Series C! SalesForge AI can help your sales team scale...",time:"3h ago"},{from:"them",text:"We're actually evaluating a few tools. Can you send over a comparison?",time:"45m ago"}] },
  { id:"4",init:"AL",name:"Amy Liu",company:"Figma",bg:"linear-gradient(140deg,#f59e0b,#ef4444)",color:"#fff",subject:"Re: Your outreach",preview:"Not the right time for us right now. Maybe Q3?",time:"2h ago",unread:false,sentiment:"negative",lastMsg:"Not the right time for us right now. Maybe reach back out in Q3?",thread:[{from:"me",text:"Hi Amy, I saw Figma's design community grew 40% this year...",time:"5h ago"},{from:"them",text:"Not the right time for us right now. Maybe reach back out in Q3?",time:"2h ago"}] },
  { id:"5",init:"MJ",name:"Marcus Johnson",company:"Vercel",bg:"linear-gradient(140deg,#34d399,#059669)",color:"#fff",subject:"Re: SalesForge for DevTools",preview:"Looks interesting! Forwarded to our VP of Sales.",time:"3h ago",unread:false,sentiment:"positive",lastMsg:"Looks interesting! I forwarded this to our VP of Sales. He'll follow up.",thread:[{from:"me",text:"Hi Marcus, saw Vercel just hit 1M deployments per day. Impressive! SalesForge helps DevTool companies scale outbound...",time:"6h ago"},{from:"them",text:"Looks interesting! I forwarded this to our VP of Sales. He'll follow up.",time:"3h ago"}] },
];

export default function InboxPage() {
  const { user, loading, handleLogout } = useAuth();
  const [selected, setSelected] = useState<typeof THREADS[0]|null>(THREADS[0]);
  const [reply, setReply] = useState("");
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [threads, setThreads] = useState(THREADS);
  const [toast, setToast] = useState("");

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const getAiReply = async () => {
    if (!selected) return;
    setAiSuggesting(true);
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type:"objectionHandler", prompt:`Prospect ${selected.name} from ${selected.company} replied: "${selected.lastMsg}". Write perfect follow-up to move deal forward.` }),
      });
      const data = await res.json();
      if (data.result) setReply(data.result);
    } catch {}
    setAiSuggesting(false);
  };

  const sendReply = () => {
    if (!reply.trim()||!selected) return;
    const newMsg = { from:"me", text:reply, time:"Just now" };
    setThreads(prev => prev.map(t => t.id===selected.id ? {...t, thread:[...t.thread,newMsg], unread:false} : t));
    setSelected(prev => prev ? {...prev, thread:[...prev.thread,newMsg]} : null);
    setReply("");
    showToast("Reply sent ✓");
  };

  const filtered = threads.filter(t => {
    if (filter==="unread") return t.unread;
    if (filter==="positive") return t.sentiment==="positive";
    if (filter==="negative") return t.sentiment==="negative";
    return true;
  });

  if (loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:"1px solid rgba(200,255,0,0.3)",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:S.accent,zIndex:300,whiteSpace:"nowrap" }}>{toast}</div>}

      <Sidebar active="inbox" user={user} onLogout={handleLogout}/>

      <div style={{ marginLeft:240,display:"grid",gridTemplateColumns:"340px 1fr",height:"100vh",overflow:"hidden" }}>
        {/* Thread List */}
        <div style={{ borderRight:`1px solid ${S.lineSoft}`,display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden" }}>
          <div style={{ padding:"20px 16px 14px",borderBottom:`1px solid ${S.lineSoft}`,flexShrink:0 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
              <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:800,color:S.text,letterSpacing:"-0.03em" }}>Inbox</h1>
              <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,background:"rgba(200,255,0,0.1)",color:S.accent }}>
                {threads.filter(t=>t.unread).length} new
              </span>
            </div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {[["all","All"],["unread","Unread"],["positive","Positive"],["negative","Objections"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)}
                  style={{ fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:8,border:`1px solid ${filter===v?"rgba(200,255,0,0.3)":S.lineSoft}`,background:filter===v?"rgba(200,255,0,0.08)":"transparent",color:filter===v?S.accent:S.faint,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex:1,overflowY:"auto" }}>
            {filtered.map(t=>(
              <div key={t.id} onClick={()=>setSelected(t)}
                style={{ padding:"14px 16px",borderBottom:`1px solid ${S.lineSoft}`,cursor:"pointer",transition:"background 0.2s",background:selected?.id===t.id?"rgba(200,255,0,0.04)":t.unread?"rgba(255,255,255,0.02)":"transparent",borderLeft:selected?.id===t.id?"3px solid #C8FF00":"3px solid transparent" }}
                onMouseEnter={e=>{ if(selected?.id!==t.id)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)"; }}
                onMouseLeave={e=>{ if(selected?.id!==t.id)(e.currentTarget as HTMLDivElement).style.background=t.unread?"rgba(255,255,255,0.02)":"transparent"; }}>
                <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",background:t.bg,color:t.color,display:"grid",placeItems:"center",fontSize:12,fontWeight:800,flexShrink:0 }}>{t.init}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3 }}>
                      <span style={{ fontSize:13,fontWeight:t.unread?700:600,color:S.text }}>{t.name}</span>
                      <span style={{ fontSize:10,color:S.faint }}>{t.time}</span>
                    </div>
                    <div style={{ fontSize:12,color:S.muted,marginBottom:4,fontWeight:t.unread?600:400 }}>{t.subject}</div>
                    <div style={{ fontSize:11,color:S.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.preview}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:5 }}>
                      <span style={{ fontSize:10,color:S.faint }}>{t.company}</span>
                      <span style={{ fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:999,
                        color:t.sentiment==="positive"?"#34d399":t.sentiment==="negative"?"#f87171":"#f59e0b",
                        background:t.sentiment==="positive"?"rgba(52,211,153,0.1)":t.sentiment==="negative"?"rgba(248,113,113,0.1)":"rgba(245,158,11,0.1)" }}>
                        {t.sentiment==="positive"?"✓ Interested":t.sentiment==="negative"?"✗ Not now":"~ Neutral"}
                      </span>
                      {t.unread&&<span style={{ width:6,height:6,borderRadius:"50%",background:S.accent,display:"inline-block",marginLeft:"auto" }}/>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thread View */}
        {selected ? (
          <div style={{ display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden" }}>
            {/* Thread Header */}
            <div style={{ padding:"16px 24px",borderBottom:`1px solid ${S.lineSoft}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:selected.bg,color:selected.color,display:"grid",placeItems:"center",fontSize:13,fontWeight:800 }}>{selected.init}</div>
                <div>
                  <div style={{ fontSize:15,fontWeight:700,color:S.text }}>{selected.name}</div>
                  <div style={{ fontSize:12,color:S.faint }}>{selected.company} · {selected.subject}</div>
                </div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <span style={{ fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:999,
                  color:selected.sentiment==="positive"?"#34d399":selected.sentiment==="negative"?"#f87171":"#f59e0b",
                  background:selected.sentiment==="positive"?"rgba(52,211,153,0.1)":selected.sentiment==="negative"?"rgba(248,113,113,0.1)":"rgba(245,158,11,0.1)",
                  border:`1px solid ${selected.sentiment==="positive"?"rgba(52,211,153,0.2)":selected.sentiment==="negative"?"rgba(248,113,113,0.2)":"rgba(245,158,11,0.2)"}` }}>
                  {selected.sentiment==="positive"?"✓ Interested":selected.sentiment==="negative"?"✗ Not now":"~ Neutral"}
                </span>
                <button style={{ padding:"7px 14px",borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                  📅 Book Meeting
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1,overflowY:"auto",padding:"24px" }}>
              {selected.thread.map((msg,i)=>(
                <div key={i} style={{ display:"flex",gap:12,marginBottom:20,flexDirection:msg.from==="me"?"row-reverse":"row" }}>
                  <div style={{ width:32,height:32,borderRadius:"50%",background:msg.from==="me"?"linear-gradient(140deg,#C8FF00,#86efac)":selected.bg,color:msg.from==="me"?"#050505":selected.color,display:"grid",placeItems:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>
                    {msg.from==="me"?user?.displayName?.[0]??"U":selected.init}
                  </div>
                  <div style={{ maxWidth:"70%" }}>
                    <div style={{ fontSize:11,color:S.faint,marginBottom:4,textAlign:msg.from==="me"?"right":"left" }}>
                      {msg.from==="me"?user?.displayName??"You":selected.name} · {msg.time}
                    </div>
                    <div style={{ padding:"12px 16px",borderRadius:12,background:msg.from==="me"?"rgba(200,255,0,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${msg.from==="me"?"rgba(200,255,0,0.15)":"rgba(255,255,255,0.06)"}`,fontSize:13,color:S.text,lineHeight:1.65 }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div style={{ padding:"16px 24px",borderTop:`1px solid ${S.lineSoft}`,flexShrink:0 }}>
              <textarea value={reply} onChange={e=>setReply(e.target.value)}
                placeholder="Write your reply..."
                style={{ width:"100%",minHeight:90,padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",resize:"none",lineHeight:1.65,marginBottom:10 }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(255,255,255,0.08)"}/>
              <div style={{ display:"flex",gap:10,justifyContent:"space-between" }}>
                <button onClick={getAiReply} disabled={aiSuggesting}
                  style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:700,cursor:aiSuggesting?"not-allowed":"pointer",fontFamily:"Inter,sans-serif" }}>
                  {aiSuggesting?<><span style={{ width:12,height:12,border:"2px solid rgba(200,255,0,0.3)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Thinking...</>:"⚡ AI Suggest Reply"}
                </button>
                <button onClick={sendReply} disabled={!reply.trim()}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 20px",borderRadius:10,background:reply.trim()?S.accent:"rgba(255,255,255,0.05)",border:"none",color:reply.trim()?"#050505":S.faint,fontSize:13,fontWeight:700,cursor:reply.trim()?"pointer":"not-allowed",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:"grid",placeItems:"center",color:S.faint,fontSize:14 }}>Select a conversation</div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea::placeholder{color:#555a66}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
