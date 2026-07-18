"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

type EmailLog = {
  id: string;
  prospect_id: string;
  subject: string;
  body: string;
  status: string;
  sent_at: string;
  prospects?: {
    name: string;
    email: string;
    company: string;
    role: string;
    avatar_init: string;
    avatar_bg: string;
    avatar_color: string;
  };
};

type Thread = {
  id: string;
  prospectId: string;
  name: string;
  email: string;
  company: string;
  role: string;
  avatarInit: string;
  avatarBg: string;
  avatarColor: string;
  subject: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  sentiment: "positive"|"neutral"|"negative";
  messages: { from:"me"|"them"; text:string; time:string }[];
};

export default function InboxPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Thread|null>(null);
  const [reply, setReply] = useState("");
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [scheduleDate, setScheduleDate] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"|"warning"}>({msg:"",type:"success"});

  const showToast = (msg:string, type:"success"|"error"|"warning"="success") => {
    setToast({msg,type}); setTimeout(()=>setToast({msg:"",type:"success"}),4000);
  };

  // Load real email logs from Supabase
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    fetch(`/api/inbox?userId=${user.uid}`)
      .then(r => r.json())
      .then(d => {
        if (d.threads) setThreads(d.threads);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const getAiReply = async () => {
    if (!selected) return;
    setAiSuggesting(true);
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          type:"objectionHandler",
          prompt:`I sent a cold email to ${selected.name} (${selected.role} at ${selected.company}). Subject: "${selected.subject}". Write a perfect follow-up reply to continue the conversation and move toward booking a meeting. Under 100 words. Human tone. No filler phrases.`,
          userId: user?.uid,
        }),
      });
      const data = await res.json();
      if (data.error) showToast(data.upgrade?"⚠️ Daily AI limit reached. Upgrade for more.":data.error,"warning");
      else setReply(data.result ?? "");
    } catch { showToast("AI error. Try again.","error"); }
    setAiSuggesting(false);
  };

  const sendReply = async () => {
    if (!reply.trim()||!selected||!user?.uid) return;
    setSending(true);
    const res = await fetch("/api/send-email", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        userId: user.uid,
        to: selected.email,
        toName: selected.name,
        subject: `Re: ${selected.subject.replace(/^Re:\s*/i,"")}`,
        emailBody: reply,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.upgrade) showToast("⚠️ Upgrade to Starter plan to send real emails","warning");
      else showToast(data.error??"Failed to send","error");
    } else {
      const newMsg = { from:"me" as const, text:reply, time:"Just now" };
      setThreads(prev=>prev.map(t=>t.id===selected.id?{...t,messages:[...t.messages,newMsg]}:t));
      setSelected(prev=>prev?{...prev,messages:[...prev.messages,newMsg]}:null);
      showToast(`✓ Email sent to ${selected.name}!`);
      setReply("");
    }
    setSending(false);
  };

  const scheduleFollowup = async () => {
    if (!reply.trim()||!selected||!user?.uid||!scheduleDate) return;
    const res = await fetch("/api/schedule-followup", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        userId:user.uid, prospectId:selected.prospectId,
        subject:`Re: ${selected.subject}`, emailBody:reply,
        scheduledAt:new Date(scheduleDate).toISOString(), touchNumber:2, angle:"follow-up",
      }),
    });
    const data = await res.json();
    if (data.followup) {
      showToast(`✓ Follow-up scheduled for ${new Date(scheduleDate).toLocaleDateString()}`);
      setShowSchedule(false); setReply("");
    } else showToast(data.error??"Error scheduling","error");
  };

  const filtered = threads.filter(t=>{
    if (filter==="unread") return t.unread;
    if (filter==="positive") return t.sentiment==="positive";
    if (filter==="negative") return t.sentiment==="negative";
    return true;
  });

  const toastColor = toast.type==="error"?"#f87171":toast.type==="warning"?"#f59e0b":S.accent;
  const toastBorder = toast.type==="error"?"rgba(248,113,113,0.3)":toast.type==="warning"?"rgba(245,158,11,0.3)":"rgba(200,255,0,0.3)";

  if (authLoading) return <LoadingScreen text="Loading inbox"/>;

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast.msg&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:`1px solid ${toastBorder}`,borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:toastColor,zIndex:300,whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center" }}>{toast.msg}</div>}
      <Sidebar active="inbox" user={user} onLogout={handleLogout}/>

      <div style={{ marginLeft:240,display:"grid",gridTemplateColumns:"340px 1fr",height:"100vh",overflow:"hidden" }}>

        {/* Thread List */}
        <div style={{ borderRight:`1px solid ${S.lineSoft}`,display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden" }}>
          <div style={{ padding:"20px 16px 14px",borderBottom:`1px solid ${S.lineSoft}`,flexShrink:0 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
              <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:800,color:S.text }}>Inbox</h1> }}>
              {threads.length>0&&(
                <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,background:"rgba(200,255,0,0.1)",color:S.accent }}>
                  {threads.filter(t=>t.unread).length > 0 ? `${threads.filter(t=>t.unread).length} new` : `${threads.length} sent`}
                </span>
              )}
            </div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {[["all","All"],["unread","Unread"],["positive","Positive"],["negative","Objections"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)}
                  style={{ fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:8,border:`1px solid ${filter===v?"rgba(200,255,0,0.3)":S.lineSoft}`,background:filter===v?"rgba(200,255,0,0.08)":"transparent",color:filter===v?S.accent:S.faint,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex:1,overflowY:"auto" }}>
            {loading?(
              <div style={{ padding:"32px",textAlign:"center" }}>
                <div style={{ width:28,height:28,border:"2px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto" }}/>
              </div>
            ):filtered.length===0?(
              <div style={{ padding:"48px 20px",textAlign:"center" }}>
                <div style={{ fontSize:40,marginBottom:16 }}>📭</div>
                <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:8 }}>
                  {threads.length===0?"Inbox is empty":"No threads match filter"}
                </div>
                <div style={{ fontSize:12,color:S.faint,lineHeight:1.6,marginBottom:20 }}>
                  {threads.length===0
                    ?"Your inbox fills up when you send emails to prospects. Go to Prospects and hit ⚡ AI Email to send your first one."
                    :"Try a different filter"}
                </div>
                {threads.length===0&&(
                  <a href="/dashboard/prospects"
                    style={{ padding:"9px 18px",borderRadius:10,background:S.accent,color:"#050505",fontSize:12,fontWeight:700,textDecoration:"none" }}>
                    Go to Prospects →
                  </a>
                )}
              </div>
            ):(
              filtered.map(t=>(
                <div key={t.id}
                  onClick={()=>{ setSelected(t); setReply(""); setShowSchedule(false); }}
                  style={{ padding:"14px 16px",borderBottom:`1px solid ${S.lineSoft}`,cursor:"pointer",background:selected?.id===t.id?"rgba(200,255,0,0.04)":t.unread?"rgba(255,255,255,0.02)":"transparent",borderLeft:selected?.id===t.id?"3px solid #C8FF00":"3px solid transparent",transition:"background 0.15s" }}
                  onMouseEnter={e=>{ if(selected?.id!==t.id)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)"; }}
                  onMouseLeave={e=>{ if(selected?.id!==t.id)(e.currentTarget as HTMLDivElement).style.background=t.unread?"rgba(255,255,255,0.02)":"transparent"; }}>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:t.avatarBg,color:t.avatarColor,display:"grid",placeItems:"center",fontSize:12,fontWeight:800,flexShrink:0 }}>{t.avatarInit}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                        <span style={{ fontSize:13,fontWeight:t.unread?700:600,color:S.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.name}</span>
                        <span style={{ fontSize:10,color:S.faint,flexShrink:0,marginLeft:6 }}>{t.time}</span>
                      </div>
                      <div style={{ fontSize:12,color:S.muted,marginBottom:3,fontWeight:t.unread?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.subject}</div>
                      <div style={{ fontSize:11,color:S.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.lastMessage}</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:5 }}>
                        <span style={{ fontSize:10,color:S.faint }}>{t.company}</span>
                        <span style={{ fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:999,
                          color:t.sentiment==="positive"?"#34d399":t.sentiment==="negative"?"#f87171":"#f59e0b",
                          background:t.sentiment==="positive"?"rgba(52,211,153,0.1)":t.sentiment==="negative"?"rgba(248,113,113,0.1)":"rgba(245,158,11,0.1)" }}>
                          {t.sentiment==="positive"?"✓ Sent":"○ Awaiting reply"}
                        </span>
                        {t.unread&&<span style={{ width:6,height:6,borderRadius:"50%",background:S.accent,display:"inline-block",marginLeft:"auto" }}/>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thread View */}
        {selected?(
          <div style={{ display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden" }}>
            {/* Header */}
            <div style={{ padding:"14px 20px",borderBottom:`1px solid ${S.lineSoft}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:selected.avatarBg,color:selected.avatarColor,display:"grid",placeItems:"center",fontSize:12,fontWeight:800 }}>{selected.avatarInit}</div>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text }}>{selected.name} · {selected.company}</div>
                  <div style={{ fontSize:11,color:S.faint }}>{selected.email} · {selected.role}</div>
                </div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer"
                  style={{ padding:"7px 12px",borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:700,textDecoration:"none" }}>
                  📅 Book Meeting
                </a>
                <a href={`/dashboard/prospects`}
                  style={{ padding:"7px 12px",borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:12,fontWeight:600,textDecoration:"none" }}>
                  View Prospect
                </a>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1,overflowY:"auto",padding:"20px" }}>
              <div style={{ fontSize:11,color:S.faint,textAlign:"center",marginBottom:20,padding:"6px 16px",background:"rgba(255,255,255,0.02)",borderRadius:20,display:"inline-block",marginLeft:"50%",transform:"translateX(-50%)" }}>
                Subject: {selected.subject}
              </div>
              {selected.messages.map((msg,i)=>(
                <div key={i} style={{ display:"flex",gap:10,marginBottom:20,flexDirection:msg.from==="me"?"row-reverse":"row" }}>
                  <div style={{ width:30,height:30,borderRadius:"50%",background:msg.from==="me"?"linear-gradient(140deg,#C8FF00,#86efac)":selected.avatarBg,color:msg.from==="me"?"#050505":selected.avatarColor,display:"grid",placeItems:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>
                    {msg.from==="me"?user?.displayName?.[0]??"U":selected.avatarInit}
                  </div>
                  <div style={{ maxWidth:"72%" }}>
                    <div style={{ fontSize:10,color:S.faint,marginBottom:4,textAlign:msg.from==="me"?"right":"left" }}>
                      {msg.from==="me"?user?.displayName??"You":selected.name} · {msg.time}
                    </div>
                    <div style={{ padding:"12px 14px",borderRadius:12,background:msg.from==="me"?"rgba(200,255,0,0.07)":"rgba(255,255,255,0.04)",border:`1px solid ${msg.from==="me"?"rgba(200,255,0,0.14)":"rgba(255,255,255,0.06)"}`,fontSize:13,color:S.text,lineHeight:1.7,whiteSpace:"pre-wrap" }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div style={{ padding:"14px 20px",borderTop:`1px solid ${S.lineSoft}`,flexShrink:0 }}>
              <textarea value={reply} onChange={e=>setReply(e.target.value)}
                placeholder={`Write a follow-up to ${selected.name}... or click ⚡ AI Reply`}
                rows={3}
                style={{ width:"100%",padding:"11px 14px",borderRadius:11,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",resize:"none",lineHeight:1.65,marginBottom:10 }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(255,255,255,0.08)"}/>

              {showSchedule&&(
                <div style={{ display:"flex",gap:8,marginBottom:10,alignItems:"center",padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}` }}>
                  <span style={{ fontSize:12,color:S.faint,flexShrink:0 }}>Schedule for:</span>
                  <input type="datetime-local" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)}
                    style={{ flex:1,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:12,fontFamily:"Inter,sans-serif",outline:"none" }}/>
                  <button onClick={scheduleFollowup} disabled={!scheduleDate||!reply.trim()}
                    style={{ padding:"7px 14px",borderRadius:8,background:S.accent,border:"none",color:"#050505",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",flexShrink:0 }}>
                    Schedule
                  </button>
                  <button onClick={()=>setShowSchedule(false)} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint,padding:4,fontSize:16 }}>✕</button>
                </div>
              )}

              <div style={{ display:"flex",gap:8,justifyContent:"space-between",flexWrap:"wrap" }}>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={getAiReply} disabled={aiSuggesting}
                    style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:700,cursor:aiSuggesting?"not-allowed":"pointer",fontFamily:"Inter,sans-serif" }}>
                    {aiSuggesting
                      ?<><span style={{ width:12,height:12,border:"2px solid rgba(200,255,0,0.3)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Thinking...</>
                      :"⚡ AI Reply"}
                  </button>
                  <button onClick={()=>setShowSchedule(!showSchedule)}
                    style={{ padding:"8px 14px",borderRadius:9,background:showSchedule?"rgba(129,140,248,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${showSchedule?"rgba(129,140,248,0.3)":S.lineSoft}`,color:showSchedule?"#818cf8":S.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    🕐 Schedule
                  </button>
                </div>
                <button onClick={sendReply} disabled={!reply.trim()||sending}
                  style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 18px",borderRadius:9,background:reply.trim()&&!sending?S.accent:"rgba(255,255,255,0.05)",border:"none",color:reply.trim()&&!sending?"#050505":S.faint,fontSize:13,fontWeight:700,cursor:reply.trim()&&!sending?"pointer":"not-allowed",fontFamily:"Inter,sans-serif" }}>
                  {sending
                    ?<><span style={{ width:13,height:13,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Sending...</>
                    :<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>Send Email</>}
                </button>
              </div>
            </div>
          </div>
        ):(
          <div style={{ display:"grid",placeItems:"center" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:40,marginBottom:16 }}>✉️</div>
              <div style={{ fontSize:14,fontWeight:600,color:S.text,marginBottom:8 }}>Select a conversation</div>
              <div style={{ fontSize:12,color:S.faint }}>Click any thread on the left to view and reply</div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea::placeholder{color:#555a66}
        input[type="datetime-local"]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:0.5}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
