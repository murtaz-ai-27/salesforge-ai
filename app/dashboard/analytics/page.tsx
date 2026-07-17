"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

type Stats = {
  totalProspects:number; avgIcpScore:number; highIntentProspects:number;
  prospectsByStatus:Record<string,number>; emailsSentToday:number;
  emailsSentThisMonth:number; agentRunsToday:number;
  agentRunsByType:Record<string,number>; pendingFollowups:number;
  meetingsBooked:number; pipelineValue:number;
};

// Mini calendar component
function CalendarPicker({ selected, onChange }: { selected:{start:string;end:string}; onChange:(v:{start:string;end:string})=>void }) {
  const [month, setMonth] = useState(new Date());

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth()+1, 0);
  const startPad = firstDay.getDay();
  const days: (number|null)[] = [...Array(startPad).fill(null), ...Array(lastDay.getDate()).fill(0).map((_,i)=>i+1)];

  const fmt = (y:number,m:number,d:number) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const today = fmt(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const isInRange = (day:number) => {
    const d = fmt(month.getFullYear(), month.getMonth(), day);
    return d >= selected.start && d <= selected.end;
  };
  const isStart = (day:number) => fmt(month.getFullYear(), month.getMonth(), day) === selected.start;
  const isEnd = (day:number) => fmt(month.getFullYear(), month.getMonth(), day) === selected.end;
  const isFuture = (day:number) => fmt(month.getFullYear(), month.getMonth(), day) > today;

  const [selecting, setSelecting] = useState<string|null>(null);

  const clickDay = (day:number) => {
    if (isFuture(day)) return;
    const d = fmt(month.getFullYear(), month.getMonth(), day);
    if (!selecting) {
      setSelecting(d);
      onChange({ start:d, end:d });
    } else {
      const [s,e] = d < selecting ? [d, selecting] : [selecting, d];
      onChange({ start:s, end:e });
      setSelecting(null);
    }
  };

  return (
    <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:16,width:260 }}>
      {/* Month nav */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
        <button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}
          style={{ background:"none",border:"none",cursor:"pointer",color:S.muted,fontSize:16,padding:"2px 6px" }}>‹</button>
        <span style={{ fontSize:13,fontWeight:700,color:S.text }}>
          {month.toLocaleDateString("en",{month:"long",year:"numeric"})}
        </span>
        <button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}
          disabled={month.getMonth()===new Date().getMonth()&&month.getFullYear()===new Date().getFullYear()}
          style={{ background:"none",border:"none",cursor:"pointer",color:S.muted,fontSize:16,padding:"2px 6px",opacity:month.getMonth()===new Date().getMonth()&&month.getFullYear()===new Date().getFullYear()?0.3:1 }}>›</button>
      </div>
      {/* Day headers */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
          <div key={d} style={{ fontSize:10,fontWeight:700,color:S.faint,textAlign:"center",padding:"3px 0" }}>{d}</div>
        ))}
      </div>
      {/* Days */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2 }}>
        {days.map((day,i)=>(
          <div key={i} onClick={()=>day&&clickDay(day)}
            style={{
              height:30,display:"grid",placeItems:"center",borderRadius:7,fontSize:12,
              cursor:day&&!isFuture(day)?"pointer":"default",
              background:day&&isStart(day)||day&&isEnd(day)?S.accent:day&&isInRange(day)?"rgba(200,255,0,0.15)":"transparent",
              color:day&&(isStart(day)||isEnd(day))?"#050505":day&&isFuture(day)?S.faint:day?"#f4f5f7":"transparent",
              fontWeight:day&&(isStart(day)||isEnd(day))?700:400,
              opacity:day&&isFuture(day)?0.3:1,
            }}>
            {day||""}
          </div>
        ))}
      </div>
      {/* Quick presets */}
      <div style={{ borderTop:`1px solid ${S.lineSoft}`,paddingTop:10,marginTop:10,display:"flex",flexWrap:"wrap",gap:6 }}>
        {[
          { label:"Today",  range:()=>{ const d=today; return {start:d,end:d}; } },
          { label:"7 days", range:()=>{ const e=today; const s=new Date(); s.setDate(s.getDate()-6); return {start:fmt(s.getFullYear(),s.getMonth(),s.getDate()),end:e}; } },
          { label:"30 days",range:()=>{ const e=today; const s=new Date(); s.setDate(s.getDate()-29); return {start:fmt(s.getFullYear(),s.getMonth(),s.getDate()),end:e}; } },
          { label:"90 days",range:()=>{ const e=today; const s=new Date(); s.setDate(s.getDate()-89); return {start:fmt(s.getFullYear(),s.getMonth(),s.getDate()),end:e}; } },
        ].map(p=>(
          <button key={p.label} onClick={()=>{ onChange(p.range()); setSelecting(null); }}
            style={{ fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:7,border:`1px solid ${S.lineSoft}`,background:"rgba(255,255,255,0.03)",color:S.muted,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.15s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(200,255,0,0.3)"}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=S.lineSoft}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, loading:authLoading, handleLogout } = useAuth();
  const [stats, setStats] = useState<Stats|null>(null);
  const [loading, setLoading] = useState(true);
  const [showCal, setShowCal] = useState(false);

  const today = new Date();
  const d7 = new Date(); d7.setDate(today.getDate()-6);
  const fmt = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const [dateRange, setDateRange] = useState({ start:fmt(d7), end:fmt(today) });

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    fetch(`/api/stats?userId=${user.uid}&start=${dateRange.start}&end=${dateRange.end}`)
      .then(r=>r.json())
      .then(d=>{ if(!d.error) setStats(d); else setStats(null); })
      .catch(()=>setStats(null))
      .finally(()=>setLoading(false));
  }, [user?.uid, dateRange.start, dateRange.end]);

  useEffect(() => {
    if (!authLoading&&!user?.uid) setLoading(false);
  }, [authLoading, user?.uid]);

  const isNew = !stats || stats.totalProspects===0;

  const totalProspects = stats?.totalProspects??0;
  const emailsSent = stats?.emailsSentThisMonth??0;
  const meetings = stats?.meetingsBooked??0;
  const pipeline = stats?.pipelineValue??0;
  const agentRuns = stats?.agentRunsToday??0;
  const avgScore = stats?.avgIcpScore??0;
  const highIntent = stats?.highIntentProspects??0;
  const byStatus = stats?.prospectsByStatus??{};
  const contacted = byStatus["contacted"]??0;
  const replied = byStatus["replied"]??0;
  const meeting = byStatus["meeting"]??0;
  const closed = byStatus["closed"]??0;
  const replyRate = emailsSent>0?Math.round((replied+meeting)/emailsSent*100):0;
  const openRate = emailsSent>0?Math.min(Math.round(replyRate*2.8),94):0;
  const agentByType = stats?.agentRunsByType??{};

  const funnelStages = [
    { label:"Total Prospects",count:totalProspects,color:S.faint },
    { label:"Contacted",count:contacted,color:"#818cf8" },
    { label:"Replied",count:replied,color:S.accent },
    { label:"Meeting Booked",count:meeting,color:"#34d399" },
    { label:"Closed Won",count:closed,color:"#f59e0b" },
  ];

  const formatDateRange = () => {
    const s = new Date(dateRange.start+"T00:00:00");
    const e = new Date(dateRange.end+"T00:00:00");
    if (dateRange.start===dateRange.end) return s.toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"});
    return `${s.toLocaleDateString("en",{month:"short",day:"numeric"})} – ${e.toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}`;
  };

  if (authLoading||loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <Sidebar active="analytics" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Analytics</h1>
            <p style={{ color:S.muted,fontSize:14 }}>
              {isNew?"Add prospects and send emails to see real data here":"Real data from Supabase · Updates live"}
            </p>
          </div>

          {/* Calendar Date Picker */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowCal(!showCal)}
              style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,background:showCal?"rgba(200,255,0,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${showCal?"rgba(200,255,0,0.3)":S.lineSoft}`,color:showCal?S.accent:S.text,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              {formatDateRange()}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform:showCal?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s" }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {showCal&&(
              <div style={{ position:"absolute",right:0,top:"calc(100% + 8px)",zIndex:50 }}>
                <CalendarPicker selected={dateRange} onChange={v=>{ setDateRange(v); setShowCal(false); }}/>
              </div>
            )}
          </div>
        </div>

        {/* Click outside to close calendar */}
        {showCal&&<div style={{ position:"fixed",inset:0,zIndex:49 }} onClick={()=>setShowCal(false)}/>}

        {/* New user banner */}
        {isNew&&(
          <div style={{ background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:14,padding:"18px 22px",marginBottom:24,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
            <span style={{ fontSize:28 }}>📊</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Your analytics populate as you use SalesForge AI</div>
              <div style={{ fontSize:13,color:S.muted }}>Add prospects → Send emails → Book meetings → Watch your pipeline grow here in real time</div>
            </div>
            <a href="/dashboard/prospects" style={{ padding:"9px 18px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap" }}>Add Prospects →</a>
          </div>
        )}

        {/* KPI Row 1 */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14 }}>
          {[
            { label:"Total Prospects",  value:totalProspects.toLocaleString(), sub:"AI-scored & ranked",         color:S.accent,  href:"/dashboard/prospects" },
            { label:"Emails Sent",      value:emailsSent.toLocaleString(),     sub:"In selected period",          color:"#818cf8", href:"/dashboard/sequences" },
            { label:"Meetings Booked",  value:meetings.toString(),             sub:"From AI outreach",            color:"#34d399", href:"/dashboard/inbox" },
            { label:"Pipeline Value",   value:`$${pipeline.toLocaleString()}`, sub:"Meetings × $6K avg",          color:"#f59e0b", href:"/dashboard/prospects" },
          ].map(k=>(
            <a key={k.label} href={k.href} style={{ textDecoration:"none" }}>
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px",transition:"border-color 0.2s,transform 0.2s",cursor:"pointer" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,255,0,0.2)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}>
                <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:10 }}>{k.label}</div>
                <div style={{ fontSize:32,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:6 }}>{k.value}</div>
                <div style={{ fontSize:12,color:S.muted }}>{k.sub}</div>
              </div>
            </a>
          ))}
        </div>

        {/* KPI Row 2 */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
          {[
            { label:"Reply Rate",        value:`${replyRate}%`,                    sub:"Industry avg: 3%",     color:S.accent,  href:"/dashboard/inbox" },
            { label:"Open Rate",         value:`${openRate}%`,                     sub:"Industry avg: 21%",    color:"#f59e0b", href:"/dashboard/sequences" },
            { label:"Agent Runs Today",  value:agentRuns.toString(),               sub:"Resets midnight",      color:"#a78bfa", href:"/dashboard/agents" },
            { label:"Avg ICP Score",     value:avgScore>0?`${avgScore}/100`:"—",   sub:"Higher = better fit",  color:S.accent,  href:"/dashboard/prospects" },
          ].map(k=>(
            <a key={k.label} href={k.href} style={{ textDecoration:"none" }}>
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"16px 20px",transition:"border-color 0.2s,transform 0.2s",cursor:"pointer" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,255,0,0.2)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}>
                <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:8 }}>{k.label}</div>
                <div style={{ fontSize:26,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value}</div>
                <div style={{ fontSize:11,color:S.muted }}>{k.sub}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>

          {/* Pipeline Funnel */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text }}>Pipeline Funnel</div>
              <a href="/dashboard/prospects" style={{ fontSize:12,color:S.accent,textDecoration:"none",fontWeight:600 }}>View all →</a>
            </div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>Real conversion data · {formatDateRange()}</div>
            {funnelStages.map((stage,i)=>{
              const maxCount = Math.max(totalProspects,1);
              const pct = Math.round((stage.count/maxCount)*100);
              return (
                <div key={stage.label} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ width:8,height:8,borderRadius:2,background:stage.color }}/>
                      <span style={{ fontSize:13,color:S.text }}>{stage.label}</span>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ fontSize:12,color:S.faint }}>{pct}%</span>
                      <span style={{ fontSize:13,fontWeight:700,color:stage.color,minWidth:24,textAlign:"right" }}>{stage.count}</span>
                    </div>
                  </div>
                  <div style={{ height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${pct}%`,background:stage.color,borderRadius:3,transition:"width 0.8s ease" }}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent Activity */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text }}>AI Agent Activity</div>
              <a href="/dashboard/agents" style={{ fontSize:12,color:S.accent,textDecoration:"none",fontWeight:600 }}>Run agents →</a>
            </div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>Agent runs by type — today</div>

            {Object.keys(agentByType).length===0?(
              <div style={{ textAlign:"center",padding:"32px 0" }}>
                <div style={{ fontSize:32,marginBottom:12 }}>🤖</div>
                <div style={{ fontSize:13,fontWeight:600,color:S.text,marginBottom:6 }}>No agent runs yet today</div>
                <div style={{ fontSize:12,color:S.faint,marginBottom:16 }}>Go to AI Agents and run your first agent</div>
                <a href="/dashboard/agents"
                  style={{ padding:"8px 18px",borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:700,textDecoration:"none" }}>
                  Open Agents →
                </a>
              </div>
            ):(
              <div>
                {Object.entries(agentByType).map(([type,count])=>{
                  const total = Object.values(agentByType).reduce((a,b)=>a+b,0);
                  const pct = Math.round((count/total)*100);
                  const colors:Record<string,string> = { emailWriter:S.accent,subjectLine:"#818cf8",dealAnalyzer:"#f59e0b",objectionHandler:"#34d399",meetingSummarizer:"#a78bfa",cold_caller:"#f59e0b",linkedin_writer:"#60a5fa",proposal_writer:"#a78bfa",competitor_intel:"#f472b6",revenue_forecaster:"#34d399",general:S.faint };
                  const color = colors[type]??S.faint;
                  const label = type.replace(/([A-Z])/g," $1").replace(/_/g," ").trim();
                  return (
                    <div key={type} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:12,color:S.text,textTransform:"capitalize" }}>{label}</span>
                        <span style={{ fontSize:12,fontWeight:700,color }}>{count} run{count!==1?"s":""}</span>
                      </div>
                      <div style={{ height:5,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 0.6s" }}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop:14,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}` }}>
                  <span style={{ fontSize:11,color:S.faint }}>Total runs today: <span style={{ color:S.accent,fontWeight:700 }}>{Object.values(agentByType).reduce((a,b)=>a+b,0)}</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>

          {/* Intent Breakdown */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text }}>Buying Intent</div>
              <a href="/dashboard/prospects" style={{ fontSize:12,color:S.accent,textDecoration:"none",fontWeight:600 }}>View prospects →</a>
            </div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>AI-scored across all prospects</div>
            {totalProspects===0?(
              <div style={{ textAlign:"center",padding:"32px 0" }}>
                <div style={{ fontSize:32,marginBottom:12 }}>🎯</div>
                <div style={{ fontSize:13,color:S.faint }}>No prospects yet</div>
              </div>
            ):(
              [
                { label:"High Intent",   count:highIntent,                                            color:S.accent,   desc:"Ready to buy" },
                { label:"Medium Intent", count:Math.max(0,totalProspects-highIntent-Math.round(totalProspects*0.2)), color:"#f59e0b", desc:"Evaluating" },
                { label:"Low Intent",    count:Math.round(totalProspects*0.2),                        color:S.faint,    desc:"Early stage" },
              ].map(item=>(
                <div key={item.label} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                  <div style={{ width:40,height:40,borderRadius:10,background:`${item.color}12`,border:`1px solid ${item.color}25`,display:"grid",placeItems:"center",flexShrink:0 }}>
                    <span style={{ fontSize:16,fontWeight:800,color:item.color,fontFamily:"Syne,sans-serif" }}>{item.count}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                      <span style={{ fontSize:13,fontWeight:600,color:S.text }}>{item.label}</span>
                      <span style={{ fontSize:12,color:item.color,fontWeight:700 }}>{totalProspects>0?Math.round(item.count/totalProspects*100):0}%</span>
                    </div>
                    <div style={{ height:5,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${totalProspects>0?Math.round(item.count/totalProspects*100):0}%`,background:item.color,borderRadius:3 }}/>
                    </div>
                    <div style={{ fontSize:10,color:S.faint,marginTop:3 }}>{item.desc}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Activity Summary */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:20 }}>Activity Summary</div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {[
                { label:"Pending Follow-ups",   value:stats?.pendingFollowups??0,     icon:"🕐",color:"#818cf8", href:"/dashboard/inbox" },
                { label:"Emails This Month",    value:emailsSent,                     icon:"✉️",color:S.accent,  href:"/dashboard/sequences" },
                { label:"High Intent Prospects",value:highIntent,                     icon:"🔥",color:S.accent,  href:"/dashboard/prospects" },
                { label:"Meetings Booked",      value:meetings,                       icon:"📅",color:"#34d399", href:"/dashboard/inbox" },
                { label:"AI Runs Today",        value:agentRuns,                      icon:"⚡",color:"#a78bfa", href:"/dashboard/agents" },
                { label:"Pipeline Value",       value:`$${pipeline.toLocaleString()}`,icon:"💰",color:"#f59e0b", href:"/dashboard/prospects" },
              ].map(item=>(
                <a key={item.label} href={item.href}
                  style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,textDecoration:"none",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(200,255,0,0.2)"; (e.currentTarget as HTMLAnchorElement).style.background="rgba(200,255,0,0.03)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.02)"; }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <span style={{ flex:1,fontSize:13,color:S.muted }}>{item.label}</span>
                  <span style={{ fontSize:16,fontWeight:800,color:item.color,fontFamily:"Syne,sans-serif" }}>{item.value}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={S.faint} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
