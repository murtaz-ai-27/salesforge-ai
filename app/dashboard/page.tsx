"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";
import NotificationBell from "@/components/NotificationBell";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

type Stats = {
  totalProspects:number; avgIcpScore:number; highIntentProspects:number;
  prospectsByStatus:Record<string,number>; emailsSentToday:number;
  emailsSentThisMonth:number; agentRunsToday:number;
  agentRunsByType:Record<string,number>; pendingFollowups:number;
  meetingsBooked:number; pipelineValue:number;
};

type ActivityItem = {
  id:string; icon:string; color:string; title:string; sub:string; time:string;
};

export default function DashboardPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [stats, setStats] = useState<Stats|null>(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    // Fetch stats
    fetch(`/api/stats?userId=${user.uid}`)
      .then(r=>r.json())
      .then(d=>{ if(!d.error) setStats(d); })
      .catch(()=>{})
      .finally(()=>setLoading(false));

    // Fetch activity feed from multiple sources
    Promise.all([
      fetch(`/api/prospects?userId=${user.uid}&limit=5`).then(r=>r.json()).catch(()=>({prospects:[]})),
      fetch(`/api/inbox?userId=${user.uid}&limit=5`).then(r=>r.json()).catch(()=>({threads:[]})),
      fetch(`/api/notifications?userId=${user.uid}`).then(r=>r.json()).catch(()=>({notifications:[]})),
    ]).then(([prospectsData, inboxData, notifsData]) => {
      const items: ActivityItem[] = [];

      // From notifications
      const notifs = notifsData.notifications ?? [];
      notifs.slice(0,5).forEach((n:any) => {
        const icons:Record<string,string> = { hot_lead:"🔥",reply:"✉️",meeting:"📅",deal_risk:"⚠️",general:"🔔",sequence:"⚡" };
        const colors:Record<string,string> = { hot_lead:"#C8FF00",reply:"#818cf8",meeting:"#34d399",deal_risk:"#f59e0b",general:S.faint,sequence:"#a78bfa" };
        items.push({
          id:`notif-${n.id}`, icon:icons[n.type]??"🔔", color:colors[n.type]??S.faint,
          title:n.title, sub:n.message??"", time:n.created_at,
        });
      });

      // From recent prospects
      const prospects = prospectsData.prospects ?? [];
      prospects.slice(0,3).forEach((p:any) => {
        items.push({
          id:`prospect-${p.id}`, icon:"👤", color:"#60a5fa",
          title:`New prospect: ${p.name}`, sub:`${p.role??""} at ${p.company??""} · Score: ${p.ai_score??0}`,
          time:p.created_at,
        });
      });

      // From inbox
      const threads = inboxData.threads ?? [];
      threads.slice(0,3).forEach((t:any) => {
        items.push({
          id:`inbox-${t.id}`, icon:"✉️", color:"#818cf8",
          title:`Email sent to ${t.prospect_name??t.prospect_email??"prospect"}`,
          sub:`Subject: ${t.last_subject??""}`,
          time:t.last_sent_at??t.created_at,
        });
      });

      // Sort by time desc
      items.sort((a,b)=>new Date(b.time).getTime()-new Date(a.time).getTime());
      setActivity(items.slice(0,8));
    });
  }, [user?.uid]);

  useEffect(() => {
    if (!authLoading && !user?.uid) setLoading(false);
  }, [authLoading, user?.uid]);

  const isNew = !stats || stats.totalProspects===0;
  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  const timeAgo = (dateStr:string) => {
    const diff = Date.now()-new Date(dateStr).getTime();
    const mins = Math.floor(diff/60000);
    if (mins<1) return "just now";
    if (mins<60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs<24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };

  if (authLoading||loading) return <LoadingScreen text="Loading your dashboard"/>;

  const kpis = [
    { label:"Total Prospects",   value:stats?.totalProspects??0,          suffix:"",   color:S.accent,  href:"/dashboard/prospects", icon:"👥", sub:"AI-scored" },
    { label:"Emails This Month", value:stats?.emailsSentThisMonth??0,     suffix:"",   color:"#818cf8", href:"/dashboard/sequences", icon:"✉️", sub:"via Resend" },
    { label:"Meetings Booked",   value:stats?.meetingsBooked??0,          suffix:"",   color:"#34d399", href:"/dashboard/inbox",     icon:"📅", sub:"from outreach" },
    { label:"Pipeline Value",    value:`$${(stats?.pipelineValue??0).toLocaleString()}`,suffix:"",color:"#f59e0b",href:"/dashboard/prospects",icon:"💰",sub:"estimated" },
    { label:"High Intent",       value:stats?.highIntentProspects??0,     suffix:"",   color:S.accent,  href:"/dashboard/prospects", icon:"🔥", sub:"ready to buy" },
    { label:"Agent Runs Today",  value:stats?.agentRunsToday??0,         suffix:"",   color:"#a78bfa", href:"/dashboard/agents",    icon:"⚡", sub:"resets midnight" },
    { label:"Avg ICP Score",     value:stats?.avgIcpScore??0,            suffix:"/100",color:S.accent,  href:"/dashboard/analytics", icon:"🎯", sub:"quality score" },
    { label:"Pending Follow-ups",value:stats?.pendingFollowups??0,       suffix:"",   color:"#f59e0b", href:"/dashboard/inbox",     icon:"🕐", sub:"need attention" },
  ];

  const quickActions = [
    { label:"Add Prospect",     href:"/dashboard/prospects", icon:"👤", color:"#C8FF00", bg:"rgba(200,255,0,0.08)" },
    { label:"Run AI Agent",     href:"/dashboard/agents",    icon:"⚡", color:"#818cf8", bg:"rgba(129,140,248,0.08)" },
    { label:"New Sequence",     href:"/dashboard/sequences", icon:"✉️", color:"#34d399", bg:"rgba(52,211,153,0.08)" },
    { label:"View Analytics",   href:"/dashboard/analytics", icon:"📊", color:"#f59e0b", bg:"rgba(245,158,11,0.08)" },
    { label:"Email Templates",  href:"/dashboard/templates", icon:"📄", color:"#a78bfa", bg:"rgba(167,139,250,0.08)" },
    { label:"Check Inbox",      href:"/dashboard/inbox",     icon:"📬", color:"#60a5fa", bg:"rgba(96,165,250,0.08)" },
  ];

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <Sidebar active="dashboard" user={user} onLogout={handleLogout}/>
      <div className="sf-main">

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>
              Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {firstName} 👋
            </h1>
            <p style={{ color:S.muted,fontSize:14 }}>
              {isNew?"Welcome to Salevrix — let's set up your sales machine!":"Here's your sales pipeline overview"}
            </p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {user?.uid&&<NotificationBell userId={user.uid}/>}
            <a href="/dashboard/prospects/new"
              style={{ padding:"9px 18px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:6 }}>
              <span>+</span> Add Prospect
            </a>
          </div>
        </div>

        {/* New user banner */}
        {isNew&&(
          <div style={{ background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:14,padding:"18px 22px",marginBottom:24,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
            <span style={{ fontSize:28 }}>🚀</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Start your first outreach campaign</div>
              <div style={{ fontSize:13,color:S.muted }}>Add prospects → Run AI agents → Send sequences → Book meetings</div>
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              <a href="/dashboard/prospects" style={{ padding:"8px 16px",borderRadius:9,background:S.accent,color:"#050505",fontSize:12,fontWeight:700,textDecoration:"none" }}>Add Prospects →</a>
              <a href="/dashboard/agents" style={{ padding:"8px 16px",borderRadius:9,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:S.text,fontSize:12,fontWeight:600,textDecoration:"none" }}>Try AI Agents →</a>
            </div>
          </div>
        )}

        {/* KPI Row 1 */}
        <div className="sf-grid-4" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14 }}>
          {kpis.slice(0,4).map(k=>(
            <a key={k.label} href={k.href} style={{ textDecoration:"none" }}>
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px",transition:"all 0.2s",cursor:"pointer" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,255,0,0.2)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                  <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700 }}>{k.label}</div>
                  <span style={{ fontSize:18 }}>{k.icon}</span>
                </div>
                <div style={{ fontSize:32,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value}{k.suffix}</div>
                <div style={{ fontSize:11,color:S.muted }}>{k.sub}</div>
              </div>
            </a>
          ))}
        </div>

        {/* KPI Row 2 */}
        <div className="sf-grid-4" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
          {kpis.slice(4).map(k=>(
            <a key={k.label} href={k.href} style={{ textDecoration:"none" }}>
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"16px 20px",transition:"all 0.2s",cursor:"pointer" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,255,0,0.2)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                  <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700 }}>{k.label}</div>
                  <span style={{ fontSize:16 }}>{k.icon}</span>
                </div>
                <div style={{ fontSize:26,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value}{k.suffix}</div>
                <div style={{ fontSize:11,color:S.muted }}>{k.sub}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="sf-grid-2" style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:20 }}>

          {/* Activity Feed */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:3 }}>Activity Feed</div>
                <div style={{ fontSize:12,color:S.faint }}>Real-time sales activity · Updates every 30s</div>
              </div>
              <div style={{ width:8,height:8,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 8px rgba(52,211,153,0.6)",animation:"pulse 2s infinite" }}/>
            </div>

            {activity.length===0?(
              <div style={{ textAlign:"center",padding:"40px 20px" }}>
                <div style={{ fontSize:40,marginBottom:16 }}>📡</div>
                <div style={{ fontSize:14,fontWeight:600,color:S.text,marginBottom:8 }}>No activity yet</div>
                <div style={{ fontSize:12,color:S.faint,marginBottom:20,lineHeight:1.6 }}>Add your first prospect to start seeing real-time activity here</div>
                <a href="/dashboard/prospects" style={{ padding:"9px 20px",borderRadius:9,background:S.accent,color:"#050505",fontSize:12,fontWeight:700,textDecoration:"none" }}>Add Prospects →</a>
              </div>
            ):(
              <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
                {activity.map((item,i)=>(
                  <div key={item.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,transition:"background 0.15s",cursor:"default" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.03)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                    <div style={{ width:36,height:36,borderRadius:10,background:`${item.color}12`,border:`1px solid ${item.color}25`,display:"grid",placeItems:"center",fontSize:16,flexShrink:0 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:S.text,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.title}</div>
                      {item.sub&&<div style={{ fontSize:11,color:S.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.sub}</div>}
                    </div>
                    <div style={{ fontSize:10,color:S.faint,flexShrink:0 }}>{timeAgo(item.time)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

            {/* Quick Actions */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:18 }}>
              <div style={{ fontSize:13,fontWeight:700,color:S.text,marginBottom:14 }}>Quick Actions</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {quickActions.map(a=>(
                  <a key={a.label} href={a.href}
                    style={{ padding:"10px 12px",borderRadius:10,background:a.bg,border:`1px solid ${a.color}22`,textDecoration:"none",transition:"all 0.2s",display:"flex",alignItems:"center",gap:8 }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.transform="translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.borderColor=`${a.color}44`; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.transform="translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.borderColor=`${a.color}22`; }}>
                    <span style={{ fontSize:16 }}>{a.icon}</span>
                    <span style={{ fontSize:11,fontWeight:600,color:a.color,lineHeight:1.3 }}>{a.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Pipeline Summary */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:18 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                <div style={{ fontSize:13,fontWeight:700,color:S.text }}>Pipeline</div>
                <a href="/dashboard/analytics" style={{ fontSize:11,color:S.accent,textDecoration:"none",fontWeight:600 }}>Full analytics →</a>
              </div>
              {[
                { label:"New",       count:stats?.prospectsByStatus?.["new"]??0,       color:S.faint },
                { label:"Contacted", count:stats?.prospectsByStatus?.["contacted"]??0, color:"#818cf8" },
                { label:"Replied",   count:stats?.prospectsByStatus?.["replied"]??0,   color:S.accent },
                { label:"Meeting",   count:stats?.prospectsByStatus?.["meeting"]??0,   color:"#34d399" },
                { label:"Closed",    count:stats?.prospectsByStatus?.["closed"]??0,    color:"#f59e0b" },
              ].map(stage=>{
                const total = Math.max(stats?.totalProspects??1,1);
                const pct = Math.round((stage.count/total)*100);
                return (
                  <div key={stage.label} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                      <span style={{ fontSize:12,color:S.muted }}>{stage.label}</span>
                      <span style={{ fontSize:12,fontWeight:700,color:stage.color }}>{stage.count}</span>
                    </div>
                    <div style={{ height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${pct}%`,background:stage.color,borderRadius:2,transition:"width 0.6s ease" }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apollo Comparison */}
            <div style={{ background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.15)",borderRadius:16,padding:18 }}>
              <div style={{ fontSize:13,fontWeight:700,color:S.text,marginBottom:12 }}>🔥 vs Apollo.io Today</div>
              {[
                { metric:"Data Accuracy",  ours:"100%",   theirs:"65%",   win:true },
                { metric:"AI Agents",      ours:"10",     theirs:"1",     win:true },
                { metric:"Your Cost/mo",   ours:"$0",     theirs:"$119",  win:true },
              ].map(r=>(
                <div key={r.metric} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                  <span style={{ fontSize:11,color:S.faint }}>{r.metric}</span>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <span style={{ fontSize:12,fontWeight:700,color:S.accent }}>{r.ours}</span>
                    <span style={{ fontSize:10,color:S.faint }}>vs</span>
                    <span style={{ fontSize:12,color:"#f87171",textDecoration:"line-through" }}>{r.theirs}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes pulse{0%,100%{opacity:0.4;transform:scale(0.95)}50%{opacity:1;transform:scale(1.05)}}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
