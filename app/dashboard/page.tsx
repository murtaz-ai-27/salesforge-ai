"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { displayName: string | null; email: string | null; photoURL: string | null; };

const S = { bg:"#050505",panel:"#0d1018",panel2:"#111520",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00",violet:"#7c3aed" };

const NAV = [
  { id:"dashboard", label:"Dashboard", badge:null, hl:false, icon:"M3 13l2-2 7-7 7 7M5 11v9a1 1 0 001 1h3V15h4v5h3a1 1 0 001-1v-9" },
  { id:"prospects", label:"Prospects", badge:"1.2K", hl:false, icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id:"sequences", label:"Sequences", badge:"3", hl:false, icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id:"agents", label:"AI Agents", badge:"5", hl:true, icon:"M13 10V3L4 14h7v7l9-11h-7z" },
  { id:"inbox", label:"Inbox", badge:"12", hl:false, icon:"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" },
  { id:"analytics", label:"Analytics", badge:null, hl:false, icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

function Sidebar({ active, user, onLogout }: { active:string; user:User|null; onLogout:()=>void }) {
  return (
    <div style={{ width:240,minWidth:240,background:S.panel,borderRight:`1px solid ${S.lineSoft}`,display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:50 }}>
      <div style={{ padding:"20px 18px 16px",borderBottom:`1px solid ${S.lineSoft}`,flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ width:30,height:30,borderRadius:9,background:S.accent,display:"grid",placeItems:"center",boxShadow:"0 0 16px rgba(200,255,0,0.3)",flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,background:"linear-gradient(120deg,#C8FF00,#fff)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",whiteSpace:"nowrap" }}>SalesForge AI</div>
            <div style={{ fontSize:10,color:S.faint,marginTop:1 }}>Sales Platform</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1,padding:"14px 10px",overflowY:"auto",display:"flex",flexDirection:"column",gap:2 }}>
        <div style={{ fontSize:10,fontWeight:700,color:S.faint,letterSpacing:".1em",textTransform:"uppercase",padding:"2px 10px 10px" }}>Main Menu</div>
        {NAV.map(item => {
          const on = active === item.id;
          return (
            <a key={item.id} href={`/dashboard${item.id==="dashboard"?"":"/"+item.id}`}
              style={{ display:"flex",flexDirection:"row",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,textDecoration:"none",transition:"all 0.2s",whiteSpace:"nowrap",border:`1px solid ${on?(item.hl?"rgba(200,255,0,0.2)":"rgba(255,255,255,0.07)"):"transparent"}`,background:on?(item.hl?"rgba(200,255,0,0.08)":"rgba(255,255,255,0.06)"):"transparent",color:on?S.text:S.muted }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={on&&item.hl?S.accent:on?S.text:S.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d={item.icon}/>
              </svg>
              <span style={{ fontSize:13.5,fontWeight:on?600:400,flex:1,fontFamily:"Inter,sans-serif",color:on?S.text:S.muted }}>{item.label}</span>
              {item.badge && <span style={{ fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:999,background:item.hl?"rgba(200,255,0,0.15)":"rgba(255,255,255,0.08)",color:item.hl?S.accent:S.muted,flexShrink:0 }}>{item.badge}</span>}
            </a>
          );
        })}
      </nav>
      <div style={{ padding:"12px 10px",borderTop:`1px solid ${S.lineSoft}`,flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)" }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="" style={{ width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>
            : <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(140deg,#C8FF00,#86efac)",display:"grid",placeItems:"center",fontSize:13,fontWeight:800,color:"#050505",flexShrink:0 }}>{user?.displayName?.[0]??"U"}</div>
          }
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:600,color:S.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.displayName??"User"}</div>
            <div style={{ fontSize:10,color:S.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email??""}</div>
          </div>
          <button onClick={onLogout} style={{ background:"none",border:"none",cursor:"pointer",padding:4,color:S.faint,flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const PROSPECTS = [
  { init:"JM",name:"James Morrison",role:"VP Sales",company:"Stripe",score:98,intent:"high",status:"hot",bg:"linear-gradient(140deg,#C8FF00,#86efac)",color:"#050505" },
  { init:"SC",name:"Sarah Chen",role:"CRO",company:"Linear",score:94,intent:"high",status:"replied",bg:"linear-gradient(140deg,#818cf8,#c084fc)",color:"#fff" },
  { init:"RP",name:"Raj Patel",role:"Head of Sales",company:"Notion",score:91,intent:"medium",status:"contacted",bg:"linear-gradient(140deg,#7c3aed,#9333ea)",color:"#fff" },
  { init:"AL",name:"Amy Liu",role:"Director Sales",company:"Figma",score:88,intent:"high",status:"new",bg:"linear-gradient(140deg,#f59e0b,#ef4444)",color:"#fff" },
  { init:"MJ",name:"Marcus Johnson",role:"VP Revenue",company:"Vercel",score:85,intent:"medium",status:"new",bg:"linear-gradient(140deg,#34d399,#059669)",color:"#fff" },
];

const FEED = [
  { icon:"⚡",label:"Intent Signal",text:"Stripe just hired 3 SDRs — 94% buying probability",time:"2 min ago",color:S.accent },
  { icon:"✓",label:"Reply Detected",text:'Sarah Chen: "Yes, interested in a demo"',time:"8 min ago",color:"#34d399" },
  { icon:"📅",label:"Meeting Booked",text:"James Morrison — Tomorrow 2PM via Calendly",time:"14 min ago",color:"#818cf8" },
  { icon:"⚡",label:"Intent Signal",text:"Figma raised Series D — expansion budget likely",time:"31 min ago",color:S.accent },
  { icon:"✓",label:"Reply Detected",text:"Marcus Johnson opened email 3 times in 10 min",time:"45 min ago",color:"#34d399" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [lc1, setLc1] = useState(12847);

  useEffect(() => {
    import("@/lib/firebase").then(({ onAuthChange }) => {
      const unsub = onAuthChange((u) => {
        if (u) setUser({ displayName:u.displayName,email:u.email,photoURL:u.photoURL });
        else setUser(null);
        setLoading(false);
      });
      return () => unsub();
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLc1(n => n + Math.floor(Math.random()*8)+1), 2800);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    try { const { logOut } = await import("@/lib/firebase"); await logOut(); } catch {}
    router.push("/");
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40,height:40,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }}/>
        <div style={{ color:S.muted,fontSize:14,fontFamily:"Inter,sans-serif" }}>Loading...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const kpis = [
    { label:"Prospects Today",value:lc1.toLocaleString(),delta:"+23% vs yesterday",color:S.accent },
    { label:"Emails Sent",value:"3,817",delta:"94% delivered",color:S.accent },
    { label:"Meetings Booked",value:"47",delta:"Best day ever 🎉",color:"#34d399" },
    { label:"Revenue Pipeline",value:"$284K",delta:"+$42K today",color:"#818cf8" },
    { label:"Reply Rate",value:"31%",delta:"+8% vs last week",color:S.accent },
    { label:"Open Rate",value:"67%",delta:"Industry avg: 21%",color:"#f59e0b" },
    { label:"Active Sequences",value:"3",delta:"847 prospects enrolled",color:S.accent },
    { label:"AI Agents Active",value:"4/5",delta:"SDR running 24/7",color:"#a78bfa" },
  ];

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <Sidebar active="dashboard" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:6 }}>Good morning, {user?.displayName?.split(" ")[0]??"there"} 👋</h1>
            <p style={{ color:S.muted,fontSize:14 }}>Your AI agents worked all night. Here&apos;s what happened.</p>
          </div>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"7px 14px",borderRadius:999 }}>
              <span style={{ width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block" }}/>AI Active
            </div>
            <a href="/dashboard/agents" style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Manage Agents
            </a>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14 }}>
          {kpis.slice(0,4).map(k=>(
            <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px" }}>
              <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:10 }}>{k.label}</div>
              <div style={{ fontSize:30,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:8 }}>{k.value}</div>
              <div style={{ fontSize:12,color:"#34d399",fontWeight:600 }}>▲ {k.delta}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28 }}>
          {kpis.slice(4).map(k=>(
            <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"16px 20px" }}>
              <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:8 }}>{k.label}</div>
              <div style={{ fontSize:24,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value}</div>
              <div style={{ fontSize:11,color:S.muted }}>{k.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:20 }}>
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${S.lineSoft}` }}>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:S.text }}>AI-Scored Prospects</div>
                <div style={{ fontSize:12,color:S.faint,marginTop:2 }}>Ranked by buying intent & ICP fit</div>
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
            {PROSPECTS.map((p,i)=>(
              <div key={p.name} style={{ display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 100px",padding:"14px 20px",borderBottom:i<PROSPECTS.length-1?`1px solid ${S.lineSoft}`:"none",cursor:"pointer",transition:"background 0.2s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:34,height:34,borderRadius:"50%",background:p.bg,color:p.color,display:"grid",placeItems:"center",fontSize:12,fontWeight:800,flexShrink:0 }}>{p.init}</div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:S.text }}>{p.name}</div><div style={{ fontSize:11,color:S.faint }}>{p.role}</div></div>
                </div>
                <div style={{ display:"flex",alignItems:"center",fontSize:13,color:S.muted }}>{p.company}</div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:13,fontWeight:700,padding:"3px 10px",borderRadius:999,color:p.score>=95?S.accent:p.score>=85?"#f59e0b":S.muted,background:p.score>=95?"rgba(200,255,0,0.08)":p.score>=85?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)" }}>{p.score}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:999,color:p.intent==="high"?S.accent:p.intent==="medium"?"#f59e0b":S.muted,background:p.intent==="high"?"rgba(200,255,0,0.08)":p.intent==="medium"?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)" }}>{p.intent}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:999,color:p.status==="hot"?"#fbbf24":p.status==="replied"?"#34d399":p.status==="contacted"?"#818cf8":S.muted,background:p.status==="hot"?"rgba(251,191,36,0.1)":p.status==="replied"?"rgba(52,211,153,0.1)":p.status==="contacted"?"rgba(129,140,248,0.1)":"rgba(255,255,255,0.05)" }}>
                    {p.status==="hot"?"🔥 Hot":p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
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
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:16 }}>
              <div style={{ fontSize:12,fontWeight:700,color:S.text,textTransform:"uppercase",letterSpacing:".08em",marginBottom:14 }}>Quick Actions</div>
              {[
                { label:"Find New Prospects",icon:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",href:"/dashboard/prospects" },
                { label:"Create Sequence",icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",href:"/dashboard/sequences" },
                { label:"Deploy AI Agent",icon:"M13 10V3L4 14h7v7l9-11h-7z",href:"/dashboard/agents" },
              ].map(a=>(
                <a key={a.label} href={a.href} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:10,marginBottom:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,textDecoration:"none",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(200,255,0,0.2)"; (e.currentTarget as HTMLAnchorElement).style.background="rgba(200,255,0,0.04)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.03)"; }}>
                  <div style={{ width:32,height:32,borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.15)",display:"grid",placeItems:"center",flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
                  </div>
                  <span style={{ fontSize:13,fontWeight:500,color:S.text,flex:1 }}>{a.label}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.faint} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
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
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
