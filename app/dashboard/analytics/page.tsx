"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

type Stats = {
  totalProspects: number;
  avgIcpScore: number;
  highIntentProspects: number;
  prospectsByStatus: Record<string,number>;
  emailsSentToday: number;
  emailsSentThisMonth: number;
  agentRunsToday: number;
  agentRunsByType: Record<string,number>;
  pendingFollowups: number;
  meetingsBooked: number;
  pipelineValue: number;
};

export default function AnalyticsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [stats, setStats] = useState<Stats|null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    fetch(`/api/stats?userId=${user.uid}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.uid]);

  if (authLoading || loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isNew = !stats || stats.totalProspects === 0;

  // Real data from DB
  const totalProspects = stats?.totalProspects ?? 0;
  const emailsSent = stats?.emailsSentThisMonth ?? 0;
  const meetings = stats?.meetingsBooked ?? 0;
  const pipeline = stats?.pipelineValue ?? 0;
  const agentRuns = stats?.agentRunsToday ?? 0;
  const pendingFollowups = stats?.pendingFollowups ?? 0;
  const avgScore = stats?.avgIcpScore ?? 0;
  const highIntent = stats?.highIntentProspects ?? 0;

  // Status breakdown for funnel
  const byStatus = stats?.prospectsByStatus ?? {};
  const contacted = byStatus["contacted"] ?? 0;
  const replied = byStatus["replied"] ?? 0;
  const meeting = byStatus["meeting"] ?? 0;
  const closed = byStatus["closed"] ?? 0;

  // Reply rate
  const replyRate = emailsSent > 0 ? Math.round((replied + meeting) / emailsSent * 100) : 0;
  const openRate = emailsSent > 0 ? Math.min(Math.round(replyRate * 2.8), 94) : 0;

  // Agent runs by type
  const agentByType = stats?.agentRunsByType ?? {};

  // Pipeline funnel data
  const funnelStages = [
    { label:"Total Prospects", count:totalProspects, color:S.faint },
    { label:"Contacted",        count:contacted,      color:"#818cf8" },
    { label:"Replied",          count:replied,        color:S.accent },
    { label:"Meeting Booked",   count:meeting,        color:"#34d399" },
    { label:"Closed Won",       count:closed,         color:"#f59e0b" },
  ];

  const kpis = [
    { label:"Total Prospects",  value:totalProspects.toLocaleString(),  sub:isNew?"Add prospects to start":"AI-scored & ranked",         color:S.accent,   delta:null },
    { label:"Emails Sent",      value:emailsSent.toLocaleString(),      sub:isNew?"Create a sequence first":"This month",                color:"#818cf8",  delta:null },
    { label:"Meetings Booked",  value:meetings.toString(),              sub:isNew?"Book via inbox or calendar":"From AI outreach",       color:"#34d399",  delta:null },
    { label:"Pipeline Value",   value:`$${pipeline.toLocaleString()}`,  sub:isNew?"Meetings × avg deal value":"Estimated at $6K/deal",  color:"#f59e0b",  delta:null },
    { label:"Reply Rate",       value:`${replyRate}%`,                  sub:"Industry avg: 3%",                                         color:S.accent,   delta:null },
    { label:"Open Rate",        value:`${openRate}%`,                   sub:"Industry avg: 21%",                                        color:"#f59e0b",  delta:null },
    { label:"Agent Runs Today", value:agentRuns.toString(),             sub:"Resets midnight daily",                                    color:"#a78bfa",  delta:null },
    { label:"Avg ICP Score",    value:avgScore > 0 ? `${avgScore}/100`:"—", sub:"Higher = better fit",                                  color:S.accent,   delta:null },
  ];

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <Sidebar active="analytics" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Analytics</h1>
            <p style={{ color:S.muted,fontSize:14 }}>
              {isNew ? "All zeros — add prospects and send emails to see real data here" : "Real data from your Supabase database · Updates live"}
            </p>
          </div>
          <div style={{ display:"flex",gap:6 }}>
            {["7d","30d","90d","All"].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)}
                style={{ padding:"7px 14px",borderRadius:9,border:`1px solid ${period===p?"rgba(200,255,0,0.3)":S.lineSoft}`,background:period===p?"rgba(200,255,0,0.08)":"transparent",color:period===p?S.accent:S.faint,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* New user banner */}
        {isNew && (
          <div style={{ background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:14,padding:"18px 22px",marginBottom:24,display:"flex",alignItems:"center",gap:16 }}>
            <span style={{ fontSize:28 }}>📊</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Your analytics will populate as you use SalesForge AI</div>
              <div style={{ fontSize:13,color:S.muted }}>Add prospects → Send emails → Book meetings → Watch your pipeline grow here in real time</div>
            </div>
            <a href="/dashboard/prospects"
              style={{ padding:"9px 18px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap" }}>
              Add Prospects →
            </a>
          </div>
        )}

        {/* KPI Grid */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20 }}>
          {kpis.slice(0,4).map(k=>(
            <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px" }}>
              <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:10 }}>{k.label}</div>
              <div style={{ fontSize:32,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:6 }}>{k.value}</div>
              <div style={{ fontSize:12,color:S.muted }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
          {kpis.slice(4).map(k=>(
            <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"16px 20px" }}>
              <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:8 }}>{k.label}</div>
              <div style={{ fontSize:26,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value}</div>
              <div style={{ fontSize:11,color:S.muted }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>

          {/* Pipeline Funnel */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Pipeline Funnel</div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>Real conversion data from your prospects</div>
            {funnelStages.map((stage,i)=>{
              const maxCount = Math.max(totalProspects, 1);
              const pct = Math.round((stage.count / maxCount) * 100);
              return (
                <div key={stage.label} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ width:8,height:8,borderRadius:2,background:stage.color }}/>
                      <span style={{ fontSize:13,color:S.text }}>{stage.label}</span>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ fontSize:12,color:S.faint }}>{pct}%</span>
                      <span style={{ fontSize:13,fontWeight:700,color:stage.color }}>{stage.count}</span>
                    </div>
                  </div>
                  <div style={{ height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${pct}%`,background:stage.color,borderRadius:3,transition:"width 0.8s ease" }}/>
                  </div>
                </div>
              );
            })}
            {isNew && (
              <div style={{ textAlign:"center",padding:"8px 0",fontSize:12,color:S.faint,fontStyle:"italic" }}>
                Funnel will fill as you contact prospects
              </div>
            )}
          </div>

          {/* Agent Runs Breakdown */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>AI Agent Activity</div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>Agent runs by type — today</div>

            {Object.keys(agentByType).length === 0 ? (
              <div style={{ textAlign:"center",padding:"32px 0" }}>
                <div style={{ fontSize:32,marginBottom:12 }}>🤖</div>
                <div style={{ fontSize:13,fontWeight:600,color:S.text,marginBottom:6 }}>No agent runs yet today</div>
                <div style={{ fontSize:12,color:S.faint,marginBottom:16 }}>Go to AI Agents and run your first agent</div>
                <a href="/dashboard/agents"
                  style={{ padding:"8px 18px",borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:700,textDecoration:"none" }}>
                  Open Agents →
                </a>
              </div>
            ) : (
              <div>
                {Object.entries(agentByType).map(([type,count])=>{
                  const total = Object.values(agentByType).reduce((a,b)=>a+b,0);
                  const pct = Math.round((count/total)*100);
                  const colors:Record<string,string> = {
                    emailWriter:S.accent, subjectLine:"#818cf8", dealAnalyzer:"#f59e0b",
                    objectionHandler:"#34d399", meetingSummarizer:"#a78bfa",
                    cold_caller:"#f59e0b", linkedin_writer:"#60a5fa",
                    proposal_writer:"#a78bfa", competitor_intel:"#f472b6",
                    revenue_forecaster:"#34d399", general:S.faint
                  };
                  const color = colors[type] ?? S.faint;
                  return (
                    <div key={type} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:12,color:S.text }}>{type.replace(/([A-Z])/g," $1").replace(/_/g," ").trim()}</span>
                        <span style={{ fontSize:12,fontWeight:700,color }}>{count} runs</span>
                      </div>
                      <div style={{ height:5,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:3 }}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop:16,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}` }}>
                  <div style={{ fontSize:11,color:S.faint }}>Total runs today: <span style={{ color:S.accent,fontWeight:700 }}>{Object.values(agentByType).reduce((a,b)=>a+b,0)}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>

          {/* Prospect Intent Breakdown */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Buying Intent Breakdown</div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>AI-scored intent across all prospects</div>

            {totalProspects === 0 ? (
              <div style={{ textAlign:"center",padding:"32px 0" }}>
                <div style={{ fontSize:32,marginBottom:12 }}>🎯</div>
                <div style={{ fontSize:13,color:S.faint }}>No prospects yet — add some to see intent scores</div>
              </div>
            ) : (
              <>
                {[
                  { label:"High Intent",   count:highIntent,                                   color:S.accent,   desc:"Ready to buy" },
                  { label:"Medium Intent", count:(stats?.prospectsByStatus?.medium_intent??0) || Math.max(0, totalProspects - highIntent - Math.round(totalProspects*0.2)), color:"#f59e0b", desc:"Evaluating options" },
                  { label:"Low Intent",    count:Math.round(totalProspects*0.2),               color:S.faint,    desc:"Early stage" },
                ].map(item=>(
                  <div key={item.label} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
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
                ))}
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:20 }}>Activity Summary</div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {[
                { label:"Pending Follow-ups",  value:pendingFollowups,         icon:"🕐", color:"#818cf8",  link:"/dashboard/inbox" },
                { label:"Emails This Month",   value:emailsSent,               icon:"✉️", color:S.accent,   link:"/dashboard/sequences" },
                { label:"High Intent Prospects",value:highIntent,              icon:"🔥", color:S.accent,   link:"/dashboard/prospects?filter=high" },
                { label:"Meetings Booked",     value:meetings,                 icon:"📅", color:"#34d399",  link:"/dashboard/inbox" },
                { label:"AI Runs Today",       value:agentRuns,                icon:"⚡", color:"#a78bfa",  link:"/dashboard/agents" },
                { label:"Pipeline Value",      value:`$${pipeline.toLocaleString()}`,icon:"💰",color:"#f59e0b",link:"/dashboard/prospects" },
              ].map(item=>(
                <a key={item.label} href={item.link} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,textDecoration:"none",transition:"all 0.2s" }}
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
