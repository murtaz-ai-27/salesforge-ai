"use client";
import { useRouter, usePathname } from "next/navigation";

const S = { bg:"#080c14",border:"rgba(255,255,255,0.06)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

type User = { displayName:string|null; email:string|null; photoURL:string|null; uid:string; };

const NAV = [
  { id:"dashboard",  label:"Dashboard",   href:"/dashboard",              badge:null,  icon:"M3 13l2-2 7-7 7 7M5 11v9a1 1 0 001 1h3V15h4v5h3a1 1 0 001-1v-9" },
  { id:"prospects",  label:"Prospects",   href:"/dashboard/prospects",    badge:"1.2K",icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id:"sequences",  label:"Sequences",   href:"/dashboard/sequences",    badge:"3",   icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id:"agents",     label:"AI Agents",   href:"/dashboard/agents",       badge:"10",  icon:"M13 10V3L4 14h7v7l9-11h-7z" },
  { id:"automations",label:"Automations", href:"/dashboard/automations",  badge:"15",  icon:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  { id:"inbox",      label:"Inbox",       href:"/dashboard/inbox",        badge:"12",  icon:"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" },
  { id:"analytics",  label:"Analytics",   href:"/dashboard/analytics",    badge:null,  icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

export default function Sidebar({ active, user, onLogout }: { active:string; user:User|null; onLogout:()=>void }) {
  const router = useRouter();

  return (
    <div style={{ position:"fixed",left:0,top:0,bottom:0,width:240,background:S.bg,borderRight:`1px solid ${S.border}`,display:"flex",flexDirection:"column",zIndex:100,fontFamily:"Inter,sans-serif" }}>
      {/* Logo */}
      <div style={{ padding:"20px 20px 16px",borderBottom:`1px solid ${S.border}`,flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:S.accent,display:"grid",placeItems:"center",boxShadow:"0 0 16px rgba(200,255,0,0.3)",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:S.text,letterSpacing:"-0.02em" }}>SalesForge AI</div>
            <div style={{ fontSize:10,color:S.faint,marginTop:1 }}>Sales Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"12px 10px",overflowY:"auto" }}>
        <div style={{ fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".1em",padding:"0 10px",marginBottom:8 }}>Main Menu</div>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id}
              onClick={() => router.push(item.href)}
              style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:2,border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.15s",background:isActive?"rgba(200,255,0,0.1)":"transparent",color:isActive?S.accent:S.muted,position:"relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d={item.icon}/>
              </svg>
              <span style={{ fontSize:13,fontWeight:isActive?700:500,flex:1,textAlign:"left" }}>{item.label}</span>
              {item.badge && (
                <span style={{ fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:999,background:isActive?"rgba(200,255,0,0.15)":"rgba(255,255,255,0.06)",color:isActive?S.accent:S.faint }}>
                  {item.badge}
                </span>
              )}
              {isActive && <div style={{ width:3,height:16,borderRadius:2,background:S.accent,position:"absolute",right:0,top:"50%",transform:"translateY(-50%)" }}/>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding:"12px 10px",borderTop:`1px solid ${S.border}`,flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)" }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="" style={{ width:32,height:32,borderRadius:"50%",flexShrink:0 }}/>
            : <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(140deg,#C8FF00,#86efac)",display:"grid",placeItems:"center",fontSize:12,fontWeight:800,color:"#050505",flexShrink:0 }}>
                {user?.displayName?.[0]??"U"}
              </div>
          }
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:600,color:S.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.displayName??"User"}</div>
            <div style={{ fontSize:10,color:S.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email??""}</div>
          </div>
          <button onClick={onLogout} title="Logout"
            style={{ background:"none",border:"none",cursor:"pointer",color:S.faint,padding:4,flexShrink:0,transition:"color 0.2s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color="#f87171"}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color=S.faint}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        button:focus{outline:none}
        nav::-webkit-scrollbar{width:3px}
        nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:2px}
      `}</style>
    </div>
  );
}
