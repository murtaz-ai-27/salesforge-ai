"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };
type User = { displayName:string|null; email:string|null; photoURL:string|null; uid:string; };

const FEED = [
  { icon:"⚡",label:"Intent Signal",text:"Your AI SDR Agent is ready to find prospects",time:"Just now",color:"#C8FF00" },
  { icon:"🤖",label:"Agent Ready",text:"5 AI Agents activated — waiting for your first prospect",time:"Just now",color:"#818cf8" },
  { icon:"📋",label:"Getting Started",text:"Add prospects manually or import CSV to begin",time:"Just now",color:"#34d399" },
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
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:40,height:40,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Real stats from DB — 0 for new users
  const totalProspects = stats?.prospectsToday ?? prospects.length ?? 0;
  const emailsSent = stats?.emailsSent ?? 0;
  const meetingsBooked = stats?.meetingsBooked ?? 0;
  const replyRate = stats?.replyRate ?? 0;
  const openRate = stats?.openRate ?? 0;
  const activeSequences = stats?.activeSequences ?? 0;
  const activeAgents = stats?.activeAgents ?? 0;
  const totalAgents = stats?.totalAgents ?? 0;
  const isNewUser = totalProspects === 0 && emailsSent === 0;

  const kpis = [
    { label:"Prospects",        value:totalProspects.toLocaleString(), sub:isNewUser?"Add your first prospect →":"AI-scored & ranked",      color:S.accent,   href:"/dashboard/prospects" },
    { label:"Emails Sent",      value:emailsSent.toLocaleString(),     sub:isNewUser?"Create a sequence →":"94% delivered",                  color:S.accent,   href:"/dashboard/sequences" },
    { label:"Meetings Booked",  value:meetingsBooked.toString(),       sub:isNewUser?"Activate AI agents →":"Booked by AI SDR",             color:"#34d399",  href:"/dashboard/agents" },
    { label:"Pipeline Value",   value:meetingsBooked>0?"$"+((meetingsBooked*6000)).toLocaleString():"$0", sub:isNewUser?"Start outreach →":"Estimated value", color:"#818cf8",  href:"/dashboard/prospects" },
    { label:"Reply Rate",       value:`${replyRate}%`,                 sub:"Industry avg: 3%",                                              color:S.accent,   href:"/dashboard/analytics" },
    { label:"Open Rate",        value:`${openRate}%`,                  sub:"Industry avg: 21%",                                             color:"#f59e0b",  href:"/dashboard/analytics" },
    { label:"Active Sequences", value:activeSequences.toString(),      sub:isNewUser?"Create sequence →":`${stats?.prospectsInSequences??0} enrolled`, color:S.accent, href:"/dashboard/sequences" },
    { label:"AI Agents",        value:`${activeAgents}/${totalAgents}`,sub:isNewUser?"Configure agents →":"Running 24/7",                   color:"#a78bfa",  href:"/dashboard/agents" },
  ];

  return (
    <div style={{ background:S.bg,minHeight:"100vh" }}>
      <Sidebar active="dashboard" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>
              {isNewUser ? `Welcome to SalesForge AI, ${user?.displayName?.split(" ")[0]??"there"}! 🚀` : `Good morning, ${user?.displayName?.split(" ")[0]??"there"} 👋`}
            </h1>
            <p style={{ color:S.muted,fontSize:14 }}>
              {isNewUser ? "Let's set up your AI-powered sales machine. Start by adding prospects." : "Your AI agents worked all night. Here's what happened."}
            </p>
          </div>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"7px 14px",borderRadius:999 }}>
              <span style={{ width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block" }}/>AI Ready
            </div>
            <a href="/dashboard/prospects" style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              {isNewUser ? "Add First Prospect" : "Add Prospects"}
            </a>
          </div>
        </div>

        {/* Onboarding Banner for new users */}
        {isNewUser && (
          <div style={{ background:"rgba(200,255,0,0.05)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:"20px 24px",marginBottom:24,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" }}>
            <div style={{ flex:1,minWidth:200 }}>
              <div style={{ fontSize:15,fontWeight:700,color:S.text,marginBottom:4 }}>🎯 Quick Start — 3 steps to your first meeting</div>
              <div style={{ fontSize:13,color:S.muted }}>SalesForge AI will handle the rest automatically</div>
            </div>
            <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
              {[
                { step:"1",label:"Add Prospects",href:"/dashboard/prospects",done:false },
                { step:"2",label:"Create Sequence",href:"/dashboard/sequences",done:false },
                { step:"3",label:"Activate Agents",href:"/dashboard/agents",done:false },
              ].map(s=>(
                <a key={s.step} href={s.href}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:10,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",textDecoration:"none",transition:"all 0.2s" }}
                  onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(200,255,0,0.15)"}
                  onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(200,255,0,0.08)"}>
                  <span style={{ width:22,height:22,borderRadius:"50%",background:S.accent,color:"#050505",display:"grid",placeItems:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>{s.step}</span>
                  <span style={{ fontSize:12,fontWeight:600,color:S.text }}>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* KPI Row 1 */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14 }}>
          {kpis.slice(0,4).map(k=>(
            <a key={k.label} href={k.href} style={{ textDecoration:"none" }}>
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px",transition:"border-color 0.2s",cursor:"pointer" }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,255,0,0.2)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft}>
                <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:10 }}>{k.label}</div>
                <div style={{ fontSize:32,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:8 }}>{k.value}</div>
                <div style={{ fontSize:12,color:isNewUser&&k.value==="0"?"#C8FF00":S.muted,fontWeight:isNewUser&&k.value==="0"?600:400 }}>{k.sub}</div>
              </div>
            </a>
          ))}
        </div>

        {/* KPI Row 2 */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28 }}>
          {kpis.slice(4).map(k=>(
            <a key={k.label} href={k.href} style={{ textDecoration:"none" }}>
              <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"16px 20px",transition:"border-color 0.2s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,255,0,0.2)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft}>
                <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:8 }}>{k.label}</div>
                <div style={{ fontSize:26,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4 }}>{k.value}</div>
                <div style={{ fontSize:11,color:S.muted }}>{k.sub}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:20 }}>
          {/* Prospects Table */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${S.lineSoft}` }}>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:S.text }}>
                  {isNewUser ? "Your Prospects" : "AI-Scored Prospects"}
                </div>
                <div style={{ fontSize:12,color:S.faint,marginTop:2 }}>
                  {isNewUser ? "No prospects yet — add your first one!" : `${prospects.length} prospects from Supabase ✓`}
                </div>
              </div>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                {!isNewUser && <span style={{ fontSize:11,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.15)",padding:"4px 10px",borderRadius:999 }}>⚡ AI Ranked</span>}
                <a href="/dashboard/prospects" style={{ fontSize:12,color:S.muted,textDecoration:"none",padding:"4px 12px",borderRadius:8,border:`1px solid rgba(255,255,255,0.07)` }}>
                  {isNewUser ? "+ Add Prospect" : "View all →"}
                </a>
              </div>
            </div>

            {isNewUser ? (
              // Empty state for new users
              <div style={{ padding:"48px 24px",textAlign:"center" }}>
                <div style={{ fontSize:48,marginBottom:16 }}>👥</div>
                <div style={{ fontSize:16,fontWeight:700,color:S.text,marginBottom:8 }}>No prospects yet</div>
                <div style={{ fontSize:13,color:S.muted,marginBottom:24,lineHeight:1.6 }}>
                  Add prospects manually, import a CSV, or let our AI SDR Agent find them for you.<br/>
                  Every prospect gets an AI score and buying intent rating automatically.
                </div>
                <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
                  <a href="/dashboard/prospects" style={{ padding:"11px 20px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none" }}>
                    ⚡ Add Prospects
                  </a>
                  <a href="/dashboard/agents" style={{ padding:"11px 20px",borderRadius:10,background:"rgba(255,255,255,0.05)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontWeight:600,textDecoration:"none" }}>
                    🤖 Activate AI SDR
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 100px",padding:"10px 20px",borderBottom:`1px solid ${S.lineSoft}` }}>
                  {["Prospect","Company","Score","Intent","Status"].map(h=>(
                    <div key={h} style={{ fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em" }}>{h}</div>
                  ))}
                </div>
                {prospects.slice(0,5).map((p,i)=>(
                  <div key={p.id} style={{ display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 100px",padding:"12px 20px",borderBottom:i<4?`1px solid ${S.lineSoft}`:"none",cursor:"pointer",transition:"background 0.2s" }}
                    onClick={()=>router.push("/dashboard/prospects")}
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
              </>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {/* AI Feed */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden" }}>
              <div style={{ padding:"14px 16px",borderBottom:`1px solid ${S.lineSoft}`,display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:7,height:7,borderRadius:"50%",background:S.accent,display:"inline-block" }}/>
                <span style={{ fontSize:12,fontWeight:700,color:S.text,textTransform:"uppercase",letterSpacing:".08em" }}>AI Activity Feed</span>
              </div>
              {(isNewUser ? FEED : [
                { icon:"⚡",label:"Intent Signal",text:"Stripe just hired 3 SDRs — 94% buying probability",time:"2 min ago",color:"#C8FF00" },
                { icon:"✓",label:"Reply Detected",text:'Sarah Chen: "Yes, interested in a demo"',time:"8 min ago",color:"#34d399" },
                { icon:"📅",label:"Meeting Booked",text:"James Morrison — Tomorrow 2PM",time:"14 min ago",color:"#818cf8" },
                { icon:"⚡",label:"Intent Signal",text:"Figma raised Series D — expansion budget likely",time:"31 min ago",color:"#C8FF00" },
              ]).map((f,i,arr)=>(
                <div key={i} style={{ padding:"12px 16px",borderBottom:i<arr.length-1?`1px solid ${S.lineSoft}`:"none" }}>
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
                { label:"Add Prospects",     icon:"M12 5v14M5 12h14",                                                                                                               href:"/dashboard/prospects" },
                { label:"Create Sequence",   icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",                       href:"/dashboard/sequences" },
                { label:"Manage AI Agents",  icon:"M13 10V3L4 14h7v7l9-11h-7z",                                                                                                    href:"/dashboard/agents" },
                { label:"View Automations",  icon:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",               href:"/dashboard/automations" },
              ].map(a=>(
                <a key={a.label} href={a.href}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,textDecoration:"none",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(200,255,0,0.2)"; (e.currentTarget as HTMLAnchorElement).style.background="rgba(200,255,0,0.04)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.03)"; }}>
                  <div style={{ width:30,height:30,borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.15)",display:"grid",placeItems:"center",flexShrink:0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
                  </div>
                  <span style={{ fontSize:13,fontWeight:500,color:S.text,flex:1 }}>{a.label}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={S.faint} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
