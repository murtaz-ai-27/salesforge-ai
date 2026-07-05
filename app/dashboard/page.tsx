"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

type User = { displayName:string|null; email:string|null; photoURL:string|null; uid:string; };

const NAV = [
  { id:"dashboard",  label:"Dashboard",   href:"/dashboard",             badge:null,  icon:"M3 13l2-2 7-7 7 7M5 11v9a1 1 0 001 1h3V15h4v5h3a1 1 0 001-1v-9" },
  { id:"prospects",  label:"Prospects",   href:"/dashboard/prospects",   badge:"1.2K",icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id:"sequences",  label:"Sequences",   href:"/dashboard/sequences",   badge:"3",   icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id:"agents",     label:"AI Agents",   href:"/dashboard/agents",      badge:"10",  icon:"M13 10V3L4 14h7v7l9-11h-7z" },
  { id:"automations",label:"Automations", href:"/dashboard/automations", badge:"15",  icon:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  { id:"inbox",      label:"Inbox",       href:"/dashboard/inbox",       badge:"12",  icon:"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" },
  { id:"analytics",  label:"Analytics",   href:"/dashboard/analytics",   badge:null,  icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

const FEED = [
  { icon:"⚡",label:"Intent Signal",text:"Stripe just hired 3 SDRs — 94% buying probability",time:"2 min ago",color:"#C8FF00" },
  { icon:"✓",label:"Reply Detected",text:'Sarah Chen: "Yes, interested in a demo"',time:"8 min ago",color:"#34d399" },
  { icon:"📅",label:"Meeting Booked",text:"James Morrison — Tomorrow 2PM via Calendly",time:"14 min ago",color:"#818cf8" },
  { icon:"⚡",label:"Intent Signal",text:"Figma raised Series D — expansion budget likely",time:"31 min ago",color:"#C8FF00" },
  { icon:"✓",label:"Reply Detected",text:"Marcus Johnson opened email 3 times in 10 min",time:"45 min ago",color:"#34d399" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User|null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [prospects, setProspects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    import("@/lib/firebase").then(({ onAuthChange }) => {
      const unsub = onAuthChange((u) => {
        if (u) {
          setUser({ displayName:u.displayName, email:u.email, photoURL:u.photoURL, uid:u.uid });
        } else {
          router.push("/auth/login");
        }
        setAuthLoading(false);
      });
      return () => unsub();
    }).catch(() => setAuthLoading(false));
  }, [router]);

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/prospects?userId=${user.uid}`)
      .then(r=>r.json()).then(d=>{ if(d.prospects) setProspects(d.prospects); }).catch(()=>{});
    fetch(`/api/dashboard-stats?userId=${user.uid}`)
      .then(r=>r.json()).then(d=>{ if(!d.error) setStats(d); }).catch(()=>{});
  }, [user?.uid]);

  const handleLogout = async () => {
    try { const { logOut } = await import("@/lib/firebase"); await logOut(); } catch {}
    router.push("/");
  };

  if (authLoading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center",fontFamily:"Inter,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40,height:40,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }}/>
        <div style={{ color:S.muted,fontSize:14 }}>Loading SalesForge AI...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const kpis = [
    { label:"Prospects Today",  value:(stats?.prospectsToday||prospects.length||0).toString(), delta:"+23% vs yesterday", color:S.accent },
    { label:"Emails Sent",      value:(stats?.emailsSent||0).toString(),                        delta:"94% delivered",    color:S.accent },
    { label:"Meetings Booked",  value:(stats?.meetingsBooked||0).toString(),                    delta:"AI booked 🎉",     color:"#34d399" },
    { label:"Pipeline Value",   value:"$284K",                                                  delta:"+$42K today",     color:"#818cf8" },
    { label:"Reply Rate",       value:`${stats?.replyRate||0}%`,                                delta:"+8% vs last week",color:S.accent },
    { label:"Open Rate",        value:`${stats?.openRate||0}%`,                                 delta:"Avg: 21%",        color:"#f59e0b" },
    { label:"Active Sequences", value:(stats?.activeSequences||0).toString(),                   delta:`${stats?.prospectsInSequences||0} enrolled`, color:S.accent },
    { label:"AI Agents Active", value:`${stats?.activeAgents||0}/${stats?.totalAgents||0}`,     delta:"Running 24/7",    color:"#a78bfa" },
  ];

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:S.bg,fontFamily:"Inter,sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width:240,flexShrink:0,background:"#080c14",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,bottom:0,zIndex:100 }}>
        {/* Logo */}
        <div style={{ padding:"20px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:9,background:S.accent,display:"grid",placeItems:"center",flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:S.text }}>SalesForge AI</div>
              <div style={{ fontSize:10,color:S.faint }}>Sales Platform</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <div style={{ flex:1,padding:"12px 10px",overflowY:"auto" }}>
          <div style={{ fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".1em",padding:"0 10px",marginBottom:8 }}>Main Menu</div>
          {NAV.map(item => {
            const isActive = item.id === "dashboard";
            return (
              <button key={item.id} onClick={()=>router.push(item.href)}
                style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:2,border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.15s",background:isActive?"rgba(200,255,0,0.1)":"transparent",color:isActive?S.accent:S.muted,position:"relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><path d={item.icon}/></svg>
                <span style={{ fontSize:13,fontWeight:isActive?700:500,flex:1,textAlign:"left" }}>{item.label}</span>
                {item.badge&&<span style={{ fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:999,background:isActive?"rgba(200,255,0,0.15)":"rgba(255,255,255,0.06)",color:isActive?S.accent:S.faint }}>{item.badge}</span>}
                {isActive&&<div style={{ width:3,height:16,borderRadius:2,background:S.accent,position:"absolute",right:0,top:"50%",transform:"translateY(-50%)" }}/>}
              </button>
            );
          })}
        </div>
        {/* User */}
        <div style={{ padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)" }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="" style={{ width:32,height:32,borderRadius:"50%",flexShrink:0 }}/>
              : <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(140deg,#C8FF00,#86efac)",display:"grid",placeItems:"center",fontSize:12,fontWeight:800,color:"#050505",flexShrink:0 }}>{user?.displayName?.[0]??"U"}</div>
            }
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:12,fontWeight:600,color:S.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.displayName??"User"}</div>
              <div style={{ fontSize:10,color:S.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email??""}</div>
            </div>
            <button onClick={handleLogout} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint,padding:4,flexShrink:0 }}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color="#f87171"}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color=S.faint}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft:240,flex:1,padding:"28px 32px" }}>
        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>
              Good morning, {user?.displayName?.split(" ")[0]??"there"} 👋
            </h1>
            <p style={{ color:S.muted,fontSize:14 }}>Your AI agents worked all night. Here&apos;s what happened.</p>
          </div>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"7px 14px",borderRadius:999 }}>
              <span style={{ width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block" }}/>AI Active
            </div>
            <a href="/dashboard/agents" style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Manage Agents
            </a>
          </div>
        </div>

        {/* KPI Row 1 */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14 }}>
          {kpis.slice(0,4).map(k=>(
            <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px" }}>
              <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:10 }}>{k.label}</div>
              <div style={{ fontSize:30,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:8 }}>{k.value}</div>
              <div style={{ fontSize:12,color:"#34d399",fontWeight:600 }}>▲ {k.delta}</div>
            </div>
          ))}
        </div>

        {/* KPI Row 2 */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28 }}>
          {kpis.slice(4).map(k=>(
            <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"16px 20px" }}>
              <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:8 }}>{k.label}</div>
              <div style={{ fontSize:24,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value}</div>
              <div style={{ fontSize:11,color:S.muted }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:20 }}>
          {/* Prospects Table */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${S.lineSoft}` }}>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:S.text }}>AI-Scored Prospects</div>
                <div style={{ fontSize:12,color:S.faint,marginTop:2 }}>{prospects.length>0?`${prospects.length} from Supabase ✓`:"No prospects yet — add some!"}</div>
              </div>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <span style={{ fontSize:11,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.15)",padding:"4px 10px",borderRadius:999 }}>⚡ AI Ranked</span>
                <a href="/dashboard/prospects" style={{ fontSize:12,color:S.muted,textDecoration:"none",padding:"4px 12px",borderRadius:8,border:`1px solid rgba(255,255,255,0.07)` }}>View all →</a>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 100px",padding:"10px 20px",borderBottom:`1px solid ${S.lineSoft}` }}>
              {["Prospect","Company","Score","Intent","Status"].map(h=>(
                <div key={h} style={{ fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>{h}</div>
              ))}
            </div>
            {prospects.length===0?(
              <div style={{ padding:"40px 24px",textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:10 }}>👥</div>
                <div style={{ fontSize:13,fontWeight:600,color:S.text,marginBottom:6 }}>No prospects yet</div>
                <a href="/dashboard/prospects" style={{ fontSize:12,color:S.accent,textDecoration:"none" }}>Add your first prospect →</a>
              </div>
            ):prospects.slice(0,5).map((p,i)=>(
              <div key={p.id} style={{ display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 100px",padding:"12px 20px",borderBottom:i<4?`1px solid ${S.lineSoft}`:"none",cursor:"pointer",transition:"background 0.2s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:32,height:32,borderRadius:"50%",background:p.avatar_bg,color:p.avatar_color,display:"grid",placeItems:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>{p.avatar_init}</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:S.text }}>{p.name}</div>
                    <div style={{ fontSize:11,color:S.faint }}>{p.role}</div>
                  </div>
                </div>
                <div style={{ display:"flex",alignItems:"center",fontSize:13,color:S.muted }}>{p.company}</div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:13,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.ai_score>=90?S.accent:"#f59e0b",background:p.ai_score>=90?"rgba(200,255,0,0.08)":"rgba(245,158,11,0.08)" }}>{p.ai_score}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.buying_intent==="high"?S.accent:"#f59e0b",background:p.buying_intent==="high"?"rgba(200,255,0,0.08)":"rgba(245,158,11,0.08)" }}>{p.buying_intent}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.status==="replied"?"#34d399":p.status==="contacted"?"#818cf8":"#9598a3",background:p.status==="replied"?"rgba(52,211,153,0.1)":p.status==="contacted"?"rgba(129,140,248,0.1)":"rgba(255,255,255,0.05)" }}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {/* AI Feed */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
              <div style={{ padding:"14px 16px",borderBottom:`1px solid ${S.lineSoft}`,display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:7,height:7,borderRadius:"50%",background:S.accent,display:"inline-block" }}/>
                <span style={{ fontSize:12,fontWeight:700,color:S.text,textTransform:"uppercase",letterSpacing:".08em" }}>AI Activity Feed</span>
              </div>
              {FEED.map((f,i)=>(
                <div key={i} style={{ padding:"12px 16px",borderBottom:i<FEED.length-1?`1px solid ${S.lineSoft}`:"none" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:f.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4 }}>{f.icon} {f.label}</div>
                  <div style={{ fontSize:12,color:S.muted,lineHeight:1.5,marginBottom:4 }}>{f.text}</div>
                  <div style={{ fontSize:10,color:S.faint }}>{f.time}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:16 }}>
              <div style={{ fontSize:12,fontWeight:700,color:S.text,textTransform:"uppercase",letterSpacing:".08em",marginBottom:14 }}>Quick Actions</div>
              {[
                { label:"Add Prospects",    icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", href:"/dashboard/prospects" },
                { label:"Create Sequence",  icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", href:"/dashboard/sequences" },
                { label:"Manage AI Agents", icon:"M13 10V3L4 14h7v7l9-11h-7z", href:"/dashboard/agents" },
                { label:"View Automations", icon:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", href:"/dashboard/automations" },
              ].map(a=>(
                <a key={a.label} href={a.href}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,textDecoration:"none",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(200,255,0,0.2)"; (e.currentTarget as HTMLAnchorElement).style.background="rgba(200,255,0,0.04)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.03)"; }}>
                  <div style={{ width:30,height:30,borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.15)",display:"grid",placeItems:"center",flexShrink:0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={S.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
                  </div>
                  <span style={{ fontSize:13,fontWeight:500,color:S.text,flex:1 }}>{a.label}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={S.faint} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        button:focus{outline:none}
        nav::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
