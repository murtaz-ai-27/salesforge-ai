"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

type User = { displayName:string|null; email:string|null; photoURL:string|null; uid:string; };
type Stats = {
  prospectsToday:number; emailsSent:number; meetingsBooked:number;
  replyRate:number; openRate:number; activeSequences:number;
  activeAgents:number; totalAgents:number; prospectsInSequences:number;
  topProspects:any[];
};

const FEED = [
  { icon:"⚡",label:"Intent Signal",text:"Stripe just hired 3 SDRs — 94% buying probability",time:"2 min ago",color:"#C8FF00" },
  { icon:"✓",label:"Reply Detected",text:'Sarah Chen: "Yes, interested in a demo"',time:"8 min ago",color:"#34d399" },
  { icon:"📅",label:"Meeting Booked",text:"James Morrison — Tomorrow 2PM via Calendly",time:"14 min ago",color:"#818cf8" },
  { icon:"⚡",label:"Intent Signal",text:"Figma raised Series D — expansion budget likely",time:"31 min ago",color:"#C8FF00" },
  { icon:"✓",label:"Reply Detected",text:"Marcus Johnson opened email 3 times in 10 min",time:"45 min ago",color:"#34d399" },
];

const NAV=[
  {id:"dashboard",label:"Dashboard",badge:null,hl:false,icon:"M3 13l2-2 7-7 7 7M5 11v9a1 1 0 001 1h3V15h4v5h3a1 1 0 001-1v-9"},
  {id:"prospects",label:"Prospects",badge:null,hl:false,icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"},
  {id:"sequences",label:"Sequences",badge:null,hl:false,icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"},
  {id:"agents",label:"AI Agents",badge:"5",hl:true,icon:"M13 10V3L4 14h7v7l9-11h-7z"},
  {id:"inbox",label:"Inbox",badge:"12",hl:false,icon:"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"},
  {id:"analytics",label:"Analytics",badge:null,hl:false,icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"},
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats|null>(null);
  const [liveCount, setLiveCount] = useState(12847);

  useEffect(()=>{
    import("@/lib/firebase").then(({onAuthChange})=>{
      const unsub = onAuthChange((u)=>{
        if(u){ setUser({displayName:u.displayName,email:u.email,photoURL:u.photoURL,uid:u.uid}); }
        else { setUser(null); setLoading(false); router.push("/auth/login"); }
        setLoading(false);
      });
      return ()=>unsub();
    }).catch(()=>setLoading(false));
  },[router]);

  useEffect(()=>{
    if(!user?.uid) return;
    fetch(`/api/dashboard-stats?userId=${user.uid}`)
      .then(r=>r.json())
      .then(d=>{ if(!d.error) setStats(d); })
      .catch(()=>{});
  },[user?.uid]);

  useEffect(()=>{
    const t = setInterval(()=>setLiveCount(n=>n+Math.floor(Math.random()*8)+1),2800);
    return ()=>clearInterval(t);
  },[]);

  const handleLogout = async()=>{
    try{ const {logOut}=await import("@/lib/firebase"); await logOut(); }catch{}
    router.push("/");
  };

  if(loading) return(
    <div style={{minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
        <div style={{color:S.muted,fontSize:14,fontFamily:"Inter,sans-serif"}}>Loading SalesForge AI...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const kpis = [
    {label:"Prospects Today",value:(stats?.prospectsToday??liveCount).toLocaleString(),delta:"+23% vs yesterday",color:S.accent},
    {label:"Emails Sent",value:(stats?.emailsSent??3817).toLocaleString(),delta:"94% delivered",color:S.accent},
    {label:"Meetings Booked",value:String(stats?.meetingsBooked??47),delta:"Best day ever 🎉",color:"#34d399"},
    {label:"Pipeline Value",value:"$284K",delta:"+$42K today",color:"#818cf8"},
    {label:"Reply Rate",value:`${stats?.replyRate??31}%`,delta:"+8% vs last week",color:S.accent},
    {label:"Open Rate",value:`${stats?.openRate??67}%`,delta:"Industry avg: 21%",color:"#f59e0b"},
    {label:"Active Sequences",value:String(stats?.activeSequences??3),delta:`${stats?.prospectsInSequences??847} prospects enrolled`,color:S.accent},
    {label:"AI Agents Active",value:`${stats?.activeAgents??4}/${stats?.totalAgents??5}`,delta:"SDR running 24/7",color:"#a78bfa"},
  ];

  const topProspects = stats?.topProspects?.length ? stats.topProspects : [
    {id:"1",avatar_init:"JM",name:"James Morrison",role:"VP Sales",company:"Stripe",ai_score:98,buying_intent:"high",status:"new",avatar_bg:"linear-gradient(140deg,#C8FF00,#86efac)",avatar_color:"#050505"},
    {id:"2",avatar_init:"SC",name:"Sarah Chen",role:"CRO",company:"Linear",ai_score:94,buying_intent:"high",status:"replied",avatar_bg:"linear-gradient(140deg,#818cf8,#c084fc)",avatar_color:"#fff"},
    {id:"3",avatar_init:"RP",name:"Raj Patel",role:"Head of Sales",company:"Notion",ai_score:91,buying_intent:"medium",status:"contacted",avatar_bg:"linear-gradient(140deg,#7c3aed,#9333ea)",avatar_color:"#fff"},
    {id:"4",avatar_init:"AL",name:"Amy Liu",role:"Director Sales",company:"Figma",ai_score:88,buying_intent:"high",status:"new",avatar_bg:"linear-gradient(140deg,#f59e0b,#ef4444)",avatar_color:"#fff"},
    {id:"5",avatar_init:"MJ",name:"Marcus Johnson",role:"VP Revenue",company:"Vercel",ai_score:85,buying_intent:"medium",status:"new",avatar_bg:"linear-gradient(140deg,#34d399,#059669)",avatar_color:"#fff"},
  ];

  return(
    <div style={{background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif"}}>
      <Sidebar active="dashboard" user={user} onLogout={handleLogout}/>
      <div style={{marginLeft:240,padding:"28px 32px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4}}>
              Good morning, {user?.displayName?.split(" ")[0]??"there"} 👋
            </h1>
            <p style={{color:S.muted,fontSize:14}}>Your AI agents worked all night. Here&apos;s what happened.</p>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"7px 14px",borderRadius:999}}>
              <span style={{width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block"}}/>AI Active
            </div>
            <a href="/dashboard/agents" style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Manage Agents
            </a>
          </div>
        </div>

        {/* KPIs Row 1 */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14}}>
          {kpis.slice(0,4).map(k=>(
            <div key={k.label} style={{background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px"}}>
              <div style={{fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:10}}>{k.label}</div>
              <div style={{fontSize:30,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:8}}>{k.value}</div>
              <div style={{fontSize:12,color:"#34d399",fontWeight:600}}>▲ {k.delta}</div>
            </div>
          ))}
        </div>

        {/* KPIs Row 2 */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
          {kpis.slice(4).map(k=>(
            <div key={k.label} style={{background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"16px 20px"}}>
              <div style={{fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:8}}>{k.label}</div>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:4}}>{k.value}</div>
              <div style={{fontSize:11,color:S.muted}}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20}}>

          {/* Prospects Table */}
          <div style={{background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${S.lineSoft}`}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:S.text}}>AI-Scored Prospects</div>
                <div style={{fontSize:12,color:S.faint,marginTop:2}}>Ranked by buying intent & ICP fit</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.15)",padding:"4px 10px",borderRadius:999}}>⚡ AI Ranked</span>
                <a href="/dashboard/prospects" style={{fontSize:12,color:S.muted,textDecoration:"none",padding:"4px 12px",borderRadius:8,border:`1px solid rgba(255,255,255,0.07)`}}>View all →</a>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 100px",padding:"10px 20px",borderBottom:`1px solid ${S.lineSoft}`}}>
              {["Prospect","Company","Score","Intent","Status"].map(h=>(
                <div key={h} style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em"}}>{h}</div>
              ))}
            </div>
            {topProspects.map((p:any,i:number)=>(
              <div key={p.id||i} style={{display:"grid",gridTemplateColumns:"1fr 110px 70px 90px 100px",padding:"13px 20px",borderBottom:i<topProspects.length-1?`1px solid ${S.lineSoft}`:"none",cursor:"pointer",transition:"background 0.2s"}}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:p.avatar_bg||p.bg,color:p.avatar_color||p.color,display:"grid",placeItems:"center",fontSize:12,fontWeight:800,flexShrink:0}}>{p.avatar_init||p.init}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:S.text}}>{p.name}</div>
                    <div style={{fontSize:11,color:S.faint}}>{p.role}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",fontSize:13,color:S.muted}}>{p.company}</div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.ai_score>=90?S.accent:p.ai_score>=80?"#f59e0b":"#9598a3",background:p.ai_score>=90?"rgba(200,255,0,0.08)":p.ai_score>=80?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)"}}>{p.ai_score}</span>
                </div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.buying_intent==="high"?S.accent:p.buying_intent==="medium"?"#f59e0b":"#9598a3",background:p.buying_intent==="high"?"rgba(200,255,0,0.08)":p.buying_intent==="medium"?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.04)"}}>{p.buying_intent||p.intent}</span>
                </div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,color:p.status==="hot"?"#fbbf24":p.status==="replied"?"#34d399":p.status==="contacted"?"#818cf8":"#9598a3",background:p.status==="hot"?"rgba(251,191,36,0.1)":p.status==="replied"?"rgba(52,211,153,0.1)":p.status==="contacted"?"rgba(129,140,248,0.1)":"rgba(255,255,255,0.05)"}}>
                    {p.status==="hot"?"🔥 Hot":p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: AI Feed + Quick Actions */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${S.lineSoft}`,display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:S.accent,display:"inline-block"}}/>
                <span style={{fontSize:12,fontWeight:700,color:S.text,textTransform:"uppercase",letterSpacing:".08em"}}>AI Activity Feed</span>
              </div>
              {FEED.map((f,i)=>(
                <div key={i} style={{padding:"12px 16px",borderBottom:i<FEED.length-1?`1px solid ${S.lineSoft}`:"none"}}>
                  <div style={{fontSize:10,fontWeight:700,color:f.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{f.icon} {f.label}</div>
                  <div style={{fontSize:12,color:S.muted,lineHeight:1.5,marginBottom:4}}>{f.text}</div>
                  <div style={{fontSize:10,color:S.faint}}>{f.time}</div>
                </div>
              ))}
            </div>

            <div style={{background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:16}}>
              <div style={{fontSize:12,fontWeight:700,color:S.text,textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Quick Actions</div>
              {[
                {label:"Find New Prospects",icon:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",href:"/dashboard/prospects"},
                {label:"Create Sequence",icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",href:"/dashboard/sequences"},
                {label:"Deploy AI Agent",icon:"M13 10V3L4 14h7v7l9-11h-7z",href:"/dashboard/agents"},
              ].map(a=>(
                <a key={a.label} href={a.href}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:10,marginBottom:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,textDecoration:"none",transition:"all 0.2s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(200,255,0,0.2)";(e.currentTarget as HTMLAnchorElement).style.background="rgba(200,255,0,0.04)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor=S.lineSoft;(e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.03)";}}>
                  <div style={{width:32,height:32,borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.15)",display:"grid",placeItems:"center",flexShrink:0}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
                  </div>
                  <span style={{fontSize:13,fontWeight:500,color:S.text,flex:1}}>{a.label}</span>
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
