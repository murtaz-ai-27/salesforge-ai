"use client";
import { useRouter } from "next/navigation";

type User = { displayName: string | null; email: string | null; photoURL: string | null; };

const NAV = [
  { id:"dashboard", label:"Dashboard", badge:null, hl:false, icon:"M3 13l2-2 7-7 7 7M5 11v9a1 1 0 001 1h3V15h4v5h3a1 1 0 001-1v-9" },
  { id:"prospects", label:"Prospects", badge:"1.2K", hl:false, icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id:"sequences", label:"Sequences", badge:"3", hl:false, icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id:"agents", label:"AI Agents", badge:"5", hl:true, icon:"M13 10V3L4 14h7v7l9-11h-7z" },
  { id:"inbox", label:"Inbox", badge:"12", hl:false, icon:"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" },
  { id:"analytics", label:"Analytics", badge:null, hl:false, icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

export default function Sidebar({ active, user, onLogout }: { active: string; user: User | null; onLogout: () => void }) {
  return (
    <div style={{ width:240,minWidth:240,background:"#0d1018",borderRight:"1px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:50,overflow:"hidden" }}>
      {/* Logo */}
      <div style={{ padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",flexShrink:0 }}>
        <a href="/" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
          <span style={{ width:30,height:30,borderRadius:9,background:"#C8FF00",display:"grid",placeItems:"center",boxShadow:"0 0 16px rgba(200,255,0,0.3)",flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,background:"linear-gradient(120deg,#C8FF00,#fff)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",whiteSpace:"nowrap" }}>SalesForge AI</div>
            <div style={{ fontSize:10,color:"#555a66",marginTop:1 }}>Sales Platform</div>
          </div>
        </a>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"14px 10px",overflowY:"auto",display:"flex",flexDirection:"column",gap:3 }}>
        <div style={{ fontSize:10,fontWeight:700,color:"#555a66",letterSpacing:".1em",textTransform:"uppercase",padding:"2px 10px 10px",flexShrink:0 }}>Main Menu</div>
        {NAV.map(item => {
          const on = active === item.id;
          return (
            <a key={item.id}
              href={`/dashboard${item.id==="dashboard"?"":"/"+item.id}`}
              style={{
                display:"flex",flexDirection:"row",alignItems:"center",gap:10,
                padding:"10px 12px",borderRadius:10,textDecoration:"none",
                transition:"all 0.2s",whiteSpace:"nowrap",flexShrink:0,
                border:`1px solid ${on?(item.hl?"rgba(200,255,0,0.22)":"rgba(255,255,255,0.08)"):"transparent"}`,
                background:on?(item.hl?"rgba(200,255,0,0.08)":"rgba(255,255,255,0.06)"):"transparent",
                color:on?"#f4f5f7":"#9598a3",
              }}
              onMouseEnter={e=>{ if(!on)(e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.04)"; }}
              onMouseLeave={e=>{ if(!on)(e.currentTarget as HTMLAnchorElement).style.background="transparent"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={on&&item.hl?"#C8FF00":on?"#f4f5f7":"#555a66"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d={item.icon}/>
              </svg>
              <span style={{ fontSize:13.5,fontWeight:on?600:400,flex:1,fontFamily:"Inter,sans-serif",overflow:"hidden",textOverflow:"ellipsis" }}>
                {item.label}
              </span>
              {item.badge && (
                <span style={{ fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:999,flexShrink:0,
                  background:item.hl?"rgba(200,255,0,0.15)":"rgba(255,255,255,0.08)",
                  color:item.hl?"#C8FF00":"#9598a3" }}>
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.05)",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)" }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="" style={{ width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>
            : <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(140deg,#C8FF00,#86efac)",display:"grid",placeItems:"center",fontSize:13,fontWeight:800,color:"#050505",flexShrink:0 }}>{user?.displayName?.[0]??"U"}</div>
          }
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:600,color:"#f4f5f7",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.displayName??"User"}</div>
            <div style={{ fontSize:10,color:"#555a66",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email??""}</div>
          </div>
          <button onClick={onLogout} style={{ background:"none",border:"none",cursor:"pointer",padding:4,color:"#555a66",flexShrink:0 }} title="Sign out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
