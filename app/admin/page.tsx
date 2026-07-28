"use client";
import { useState, useEffect, useRef } from "react";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

// !! CHANGE THIS TO YOUR UID !!
const ADMIN_PASS = "salevrix@admin2026"; // ← apna password yahan change karo

type Stats = {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeUsersToday: number;
  totalProspects: number;
  totalAgentRuns: number;
  agentRunsToday: number;
  totalEmailsSent: number;
  emailsSentToday: number;
  totalSequences: number;
  planBreakdown: Record<string,number>;
  recentSignups: { uid:string; email:string; created_at:string; plan:string }[];
  agentsByType: Record<string,number>;
  dailySignups: { date:string; count:number }[];
};

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<Stats|null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date|null>(null);
  const [liveUsers, setLiveUsers] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout|null>(null);

  // Simple password check
  useEffect(() => {
    const saved = localStorage.getItem("salevrix_admin");
    if (saved === ADMIN_PASS) {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!data.error) {
        setStats(data);
        setLastUpdated(new Date());
        setLiveUsers(data.activeUsersToday ?? 0);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchStats();
    // Auto refresh every 30 seconds
    intervalRef.current = setInterval(fetchStats, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [authed]);

  if (checking) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:32,height:32,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );



  const handleLogin = () => {
    if (pass === ADMIN_PASS) {
      localStorage.setItem("salevrix_admin", pass);
      setAuthed(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  if (!authed) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center",fontFamily:"Inter,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}input:focus{outline:none}`}</style>
      <div style={{ width:360,background:"#0d1018",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:32,textAlign:"center" }}>
        <div style={{ width:52,height:52,borderRadius:14,background:"rgba(200,255,0,0.1)",border:"1px solid rgba(200,255,0,0.2)",display:"grid",placeItems:"center",margin:"0 auto 20px",fontSize:24 }}>🔐</div>
        <div style={{ fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:800,color:S.text,marginBottom:6 }}>Admin Access</div>
        <div style={{ fontSize:13,color:S.faint,marginBottom:28 }}>Salevrix AI — Owner Dashboard</div>
        <input
          type="password"
          value={pass}
          onChange={e=>{ setPass(e.target.value); setPassError(false); }}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="Enter admin password"
          autoFocus
          style={{ width:"100%",padding:"12px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${passError?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.1)"}`,color:S.text,fontSize:14,fontFamily:"Inter,sans-serif",marginBottom:passError?8:16,textAlign:"center",letterSpacing:"0.1em" }}
        />
        {passError&&<div style={{ fontSize:12,color:"#f87171",marginBottom:12 }}>Wrong password. Try again.</div>}
        <button onClick={handleLogin}
          style={{ width:"100%",padding:"12px",borderRadius:10,background:S.accent,border:"none",color:"#050505",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Syne,sans-serif" }}>
          Enter Dashboard →
        </button>
      </div>
    </div>
  );

  const timeAgo = (d:string) => {
    const diff = Date.now()-new Date(d).getTime();
    const m = Math.floor(diff/60000);
    if (m<1) return "just now";
    if (m<60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h<24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  const maxDaily = Math.max(...(stats?.dailySignups?.map(d=>d.count)??[1]),1);

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif",color:S.text }}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}`}</style>

      {/* Header */}
      <div style={{ padding:"20px 32px",borderBottom:`1px solid ${S.lineSoft}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"rgba(5,5,5,0.95)",backdropFilter:"blur(12px)",zIndex:100 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:S.accent,display:"grid",placeItems:"center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:S.text }}>Salevrix AI — Admin</div>
            <div style={{ fontSize:11,color:S.faint }}>Real-time analytics dashboard</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          {/* Live indicator */}
          <div style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:999,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)" }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#34d399",animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:11,fontWeight:700,color:"#34d399" }}>LIVE</span>
          </div>
          {lastUpdated&&<span style={{ fontSize:11,color:S.faint }}>Updated {timeAgo(lastUpdated.toISOString())}</span>}
          <button onClick={fetchStats}
            style={{ padding:"7px 14px",borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
            ↻ Refresh
          </button>
          <a href="/dashboard" style={{ fontSize:12,color:S.faint,textDecoration:"none" }}>← Dashboard</a>
        </div>
      </div>

      <div style={{ padding:"24px 32px" }}>

        {loading?(
          <div style={{ display:"grid",placeItems:"center",height:400 }}>
            <div>
              <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }}/>
              <div style={{ fontSize:13,color:S.faint,textAlign:"center" }}>Loading real-time data...</div>
            </div>
          </div>
        ):(
          <>
            {/* KPI Row 1 — Users */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14 }}>
              {[
                { label:"Total Users",      value:stats?.totalUsers??0,        color:S.accent,    icon:"👥", sub:"All time signups" },
                { label:"New Today",        value:stats?.newUsersToday??0,     color:"#34d399",   icon:"🆕", sub:"Signed up today" },
                { label:"New This Week",    value:stats?.newUsersThisWeek??0,  color:"#818cf8",   icon:"📅", sub:"Last 7 days" },
                { label:"Active Today",     value:stats?.activeUsersToday??0,  color:"#f59e0b",   icon:"⚡", sub:"Used app today" },
              ].map(k=>(
                <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                    <span style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700 }}>{k.label}</span>
                    <span style={{ fontSize:18 }}>{k.icon}</span>
                  </div>
                  <div style={{ fontSize:38,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value.toLocaleString()}</div>
                  <div style={{ fontSize:11,color:S.muted }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* KPI Row 2 — Activity */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
              {[
                { label:"Total Prospects",  value:stats?.totalProspects??0,    color:S.accent,    icon:"🎯", sub:"Across all users" },
                { label:"Agent Runs Today", value:stats?.agentRunsToday??0,    color:"#a78bfa",   icon:"🤖", sub:"AI runs today" },
                { label:"Total Agent Runs", value:stats?.totalAgentRuns??0,    color:"#818cf8",   icon:"⚡", sub:"All time" },
                { label:"Emails Sent",      value:stats?.totalEmailsSent??0,   color:"#34d399",   icon:"✉️", sub:"All time" },
              ].map(k=>(
                <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"16px 20px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                    <span style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700 }}>{k.label}</span>
                    <span style={{ fontSize:16 }}>{k.icon}</span>
                  </div>
                  <div style={{ fontSize:28,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value.toLocaleString()}</div>
                  <div style={{ fontSize:11,color:S.muted }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,marginBottom:20 }}>

              {/* Daily Signups Chart */}
              <div style={{ gridColumn:"1/3",background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:3 }}>Daily Signups</div>
                    <div style={{ fontSize:12,color:S.faint }}>Last 14 days</div>
                  </div>
                  <div style={{ fontSize:22,fontWeight:800,fontFamily:"Syne,sans-serif",color:S.accent }}>{stats?.newUsersThisWeek??0} <span style={{ fontSize:12,color:S.faint,fontFamily:"Inter,sans-serif",fontWeight:400 }}>this week</span></div>
                </div>
                {/* Bar chart */}
                <div style={{ display:"flex",gap:6,alignItems:"flex-end",height:120 }}>
                  {(stats?.dailySignups??[]).map((d,i)=>{
                    const h = Math.max((d.count/maxDaily)*100,2);
                    const isToday = i===((stats?.dailySignups?.length??1)-1);
                    return (
                      <div key={d.date} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                        <div style={{ fontSize:9,color:S.faint,height:16 }}>{d.count>0?d.count:""}</div>
                        <div style={{ width:"100%",height:`${h}%`,background:isToday?S.accent:"rgba(200,255,0,0.25)",borderRadius:"3px 3px 0 0",minHeight:3,transition:"height 0.5s ease",boxShadow:isToday?"0 0 8px rgba(200,255,0,0.4)":"none" }}/>
                        <div style={{ fontSize:8,color:S.faint,whiteSpace:"nowrap" }}>{new Date(d.date+"T00:00:00").toLocaleDateString("en",{month:"short",day:"numeric"})}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plan Breakdown */}
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
                <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Plan Breakdown</div>
                <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>Users by plan</div>
                {[
                  { plan:"Free",       color:S.faint,    icon:"🆓" },
                  { plan:"Starter",    color:"#818cf8",  icon:"⚡" },
                  { plan:"Pro",        color:S.accent,   icon:"🔥" },
                  { plan:"Enterprise", color:"#f59e0b",  icon:"👑" },
                ].map(p=>{
                  const count = stats?.planBreakdown?.[p.plan.toLowerCase()]??0;
                  const total = Math.max(stats?.totalUsers??1,1);
                  return (
                    <div key={p.plan} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:12,color:S.muted,display:"flex",alignItems:"center",gap:6 }}><span>{p.icon}</span>{p.plan}</span>
                        <span style={{ fontSize:13,fontWeight:700,color:p.color }}>{count}</span>
                      </div>
                      <div style={{ height:5,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${(count/total)*100}%`,background:p.color,borderRadius:3,transition:"width 0.6s" }}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop:16,padding:"10px 12px",borderRadius:10,background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.15)" }}>
                  <div style={{ fontSize:11,color:S.faint,marginBottom:4 }}>MRR Estimate</div>
                  <div style={{ fontSize:20,fontWeight:800,color:S.accent,fontFamily:"Syne,sans-serif" }}>
                    ${(
                      ((stats?.planBreakdown?.starter??0)*29) +
                      ((stats?.planBreakdown?.pro??0)*79) +
                      ((stats?.planBreakdown?.enterprise??0)*199)
                    ).toLocaleString()}<span style={{ fontSize:11,color:S.faint,fontFamily:"Inter,sans-serif",fontWeight:400 }}>/mo</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>

              {/* Recent Signups */}
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
                <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Recent Signups</div>
                <div style={{ fontSize:12,color:S.faint,marginBottom:16 }}>Latest users — real time</div>
                {!stats?.recentSignups?.length?(
                  <div style={{ textAlign:"center",padding:"32px 0",color:S.faint,fontSize:13 }}>No signups yet</div>
                ):(
                  stats.recentSignups.map((u,i)=>(
                    <div key={u.uid} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,marginBottom:4,background:"rgba(255,255,255,0.02)" }}>
                      <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(140deg,#C8FF00,#86efac)",display:"grid",placeItems:"center",fontSize:12,fontWeight:800,color:"#050505",flexShrink:0 }}>
                        {u.email?.[0]?.toUpperCase()??"?"}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,color:S.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.email}</div>
                        <div style={{ fontSize:10,color:S.faint }}>{timeAgo(u.created_at)}</div>
                      </div>
                      <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:999,
                        background:u.plan==="pro"?"rgba(200,255,0,0.1)":u.plan==="starter"?"rgba(129,140,248,0.1)":"rgba(255,255,255,0.05)",
                        color:u.plan==="pro"?S.accent:u.plan==="starter"?"#818cf8":S.faint }}>
                        {u.plan?.toUpperCase()??"FREE"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Agent Usage */}
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
                <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Most Used AI Agents</div>
                <div style={{ fontSize:12,color:S.faint,marginBottom:16 }}>All time agent runs by type</div>
                {!Object.keys(stats?.agentsByType??{}).length?(
                  <div style={{ textAlign:"center",padding:"32px 0",color:S.faint,fontSize:13 }}>No agent runs yet</div>
                ):(
                  Object.entries(stats?.agentsByType??{})
                    .sort(([,a],[,b])=>b-a)
                    .slice(0,8)
                    .map(([type,count])=>{
                      const total = Object.values(stats?.agentsByType??{}).reduce((a,b)=>a+b,0);
                      const pct = Math.round((count/total)*100);
                      const colors:Record<string,string> = { emailWriter:S.accent,subjectLine:"#818cf8",dealAnalyzer:"#f59e0b",objectionHandler:"#34d399",meetingSummarizer:"#a78bfa",cold_caller:"#f59e0b",linkedin_writer:"#60a5fa",proposal_writer:"#a78bfa",competitor_intel:"#f472b6",revenue_forecaster:"#34d399" };
                      const color = colors[type]??S.faint;
                      const label = type.replace(/([A-Z])/g," $1").replace(/_/g," ").trim();
                      return (
                        <div key={type} style={{ marginBottom:12 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                            <span style={{ fontSize:12,color:S.text,textTransform:"capitalize" }}>{label}</span>
                            <span style={{ fontSize:12,fontWeight:700,color }}>{count}</span>
                          </div>
                          <div style={{ height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:2 }}/>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}