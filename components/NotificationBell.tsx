"use client";
import { useState, useEffect, useRef } from "react";

type Notif = { id:string; type:string; title:string; message:string|null; link:string|null; read:boolean; created_at:string; };

const TYPE_ICONS: Record<string,string> = {
  hot_lead:"🔥", reply:"✉️", meeting:"📅", deal_risk:"⚠️",
  sequence:"⚡", weekly:"📊", usage:"📈", agent_error:"🤖", general:"🔔"
};

export default function NotificationBell({ userId }: { userId:string }) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifs.filter(n => !n.read).length;

  const fetchNotifs = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const data = await res.json();
      if (data.notifications) setNotifs(data.notifications);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ userId, id }),
      });
      setNotifs(prev => prev.map(n => id ? (n.id===id ? {...n,read:true} : n) : {...n,read:true}));
    } catch {}
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff/60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      {/* Bell Button */}
      <button onClick={()=>{ setOpen(!open); if(!open&&unread>0) markRead(); }}
        style={{ position:"relative",width:34,height:34,borderRadius:9,background:open?"rgba(200,255,0,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${open?"rgba(200,255,0,0.3)":"rgba(255,255,255,0.08)"}`,cursor:"pointer",display:"grid",placeItems:"center",transition:"all 0.2s",flexShrink:0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={open?"#C8FF00":"#9598a3"} strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <div style={{ position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"#f87171",border:"2px solid #050505",display:"grid",placeItems:"center",fontSize:9,fontWeight:800,color:"#fff",lineHeight:1 }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position:"absolute",top:"calc(100% + 8px)",right:0,width:340,background:"#0d1018",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,boxShadow:"0 24px 64px rgba(0,0,0,0.6)",zIndex:200,overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ fontSize:13,fontWeight:700,color:"#f4f5f7" }}>Notifications</div>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              {unread>0&&<span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:999,background:"rgba(248,113,113,0.15)",color:"#f87171",border:"1px solid rgba(248,113,113,0.2)" }}>{unread} new</span>}
              {notifs.length>0&&<button onClick={()=>markRead()}
                style={{ fontSize:11,color:"#C8FF00",background:"none",border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:600 }}>
                Mark all read
              </button>}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight:380,overflowY:"auto" }}>
            {loading&&notifs.length===0?(
              <div style={{ padding:"32px",textAlign:"center",color:"#555a66",fontSize:13 }}>Loading...</div>
            ):notifs.length===0?(
              <div style={{ padding:"40px 24px",textAlign:"center" }}>
                <div style={{ fontSize:32,marginBottom:12 }}>🔔</div>
                <div style={{ fontSize:13,fontWeight:600,color:"#f4f5f7",marginBottom:6 }}>No notifications yet</div>
                <div style={{ fontSize:12,color:"#555a66" }}>Add prospects and send emails to see activity here</div>
              </div>
            ):notifs.map((n,i)=>(
              <div key={n.id}
                onClick={()=>{ markRead(n.id); if(n.link) window.location.href=n.link; }}
                style={{ padding:"12px 16px",borderBottom:i<notifs.length-1?"1px solid rgba(255,255,255,0.04)":"none",cursor:n.link?"pointer":"default",background:n.read?"transparent":"rgba(200,255,0,0.02)",transition:"background 0.15s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.03)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=n.read?"transparent":"rgba(200,255,0,0.02)"}>
                <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                  <span style={{ fontSize:18,flexShrink:0,marginTop:1 }}>{TYPE_ICONS[n.type]??"🔔"}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3 }}>
                      <div style={{ fontSize:13,fontWeight:n.read?500:700,color:"#f4f5f7",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{n.title}</div>
                      {!n.read&&<div style={{ width:6,height:6,borderRadius:"50%",background:"#C8FF00",flexShrink:0,marginLeft:8 }}/>}
                    </div>
                    {n.message&&<div style={{ fontSize:11,color:"#9598a3",lineHeight:1.5,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{n.message}</div>}
                    <div style={{ fontSize:10,color:"#555a66" }}>{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifs.length>0&&(
            <div style={{ padding:"10px 16px",borderTop:"1px solid rgba(255,255,255,0.05)",textAlign:"center" }}>
              <a href="/dashboard/settings" style={{ fontSize:12,color:"#555a66",textDecoration:"none" }}>
                Manage notification preferences →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
