"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const WEEKLY = [
  { day:"Mon",emails:420,replies:89,meetings:6 },
  { day:"Tue",emails:380,replies:102,meetings:8 },
  { day:"Wed",emails:510,replies:134,meetings:11 },
  { day:"Thu",emails:460,replies:98,meetings:7 },
  { day:"Fri",emails:390,replies:87,meetings:9 },
  { day:"Sat",emails:120,replies:24,meetings:2 },
  { day:"Sun",emails:80,replies:18,meetings:1 },
];

const PIPELINE = [
  { stage:"New Prospects",count:1284,color:"#555a66" },
  { stage:"Contacted",count:847,color:"#818cf8" },
  { stage:"Replied",count:263,color:"#C8FF00" },
  { stage:"Meeting Booked",count:47,color:"#34d399" },
  { stage:"Proposal Sent",count:18,color:"#f59e0b" },
  { stage:"Closed Won",count:7,color:"#C8FF00" },
];

const TOP_REPS = [
  { name:"AI SDR Agent",init:"AI",meetings:47,emails:1284,revenue:284000,rate:"31%",bg:"linear-gradient(140deg,#C8FF00,#86efac)",color:"#050505" },
  { name:"James T.",init:"JT",meetings:12,emails:340,revenue:96000,rate:"28%",bg:"linear-gradient(140deg,#818cf8,#c084fc)",color:"#fff" },
  { name:"Maria K.",init:"MK",meetings:9,emails:280,revenue:72000,rate:"24%",bg:"linear-gradient(140deg,#f59e0b,#ef4444)",color:"#fff" },
  { name:"Sam R.",init:"SR",meetings:7,emails:220,revenue:56000,rate:"21%",bg:"linear-gradient(140deg,#34d399,#059669)",color:"#fff" },
];

export default function AnalyticsPage() {
  const { user, loading, handleLogout } = useAuth();
  const [period, setPeriod] = useState("7d");

  const maxEmails = Math.max(...WEEKLY.map(d=>d.emails));
  const maxMeetings = Math.max(...WEEKLY.map(d=>d.meetings));

  if (loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <Sidebar active="analytics" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Analytics</h1>
            <p style={{ color:S.muted,fontSize:14 }}>Pipeline intelligence & performance metrics</p>
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

        {/* KPIs */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
          {[
            { label:"Total Emails Sent",value:"3,817",delta:"+24%",color:S.accent },
            { label:"Total Replies",value:"1,184",delta:"+31%",color:"#818cf8" },
            { label:"Meetings Booked",value:"47",delta:"+18%",color:"#34d399" },
            { label:"Pipeline Value",value:"$284K",delta:"+42%",color:"#f59e0b" },
          ].map(k=>(
            <div key={k.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:"18px 20px" }}>
              <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:10 }}>{k.label}</div>
              <div style={{ fontSize:30,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-0.04em",color:k.color,marginBottom:6 }}>{k.value}</div>
              <div style={{ fontSize:12,color:"#34d399",fontWeight:700 }}>▲ {k.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
          {/* Email Chart */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Email Activity</div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>Emails sent vs replies this week</div>
            <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:140,marginBottom:12 }}>
              {WEEKLY.map(d=>(
                <div key={d.day} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%" }}>
                  <div style={{ flex:1,width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end",gap:3 }}>
                    <div style={{ width:"100%",borderRadius:"4px 4px 0 0",background:"linear-gradient(180deg,#818cf8,rgba(129,140,248,0.2))",height:`${(d.replies/maxEmails)*100}%`,minHeight:4 }}/>
                    <div style={{ width:"100%",borderRadius:"4px 4px 0 0",background:"linear-gradient(180deg,#C8FF00,rgba(200,255,0,0.2))",height:`${(d.emails/maxEmails)*100}%`,minHeight:8 }}/>
                  </div>
                  <div style={{ fontSize:10,color:S.faint,marginTop:6 }}>{d.day}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:16 }}>
              {[["Emails Sent","#C8FF00"],["Replies","#818cf8"]].map(([l,c])=>(
                <div key={l} style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:10,height:10,borderRadius:2,background:c }}/>
                  <span style={{ fontSize:11,color:S.faint }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meetings Chart */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Meetings Booked</div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>Daily meetings booked by AI + team</div>
            <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:140,marginBottom:12 }}>
              {WEEKLY.map(d=>(
                <div key={d.day} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",height:"100%" }}>
                  <div style={{ flex:1,width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end" }}>
                    <div style={{ width:"100%",borderRadius:"4px 4px 0 0",background:"linear-gradient(180deg,#34d399,rgba(52,211,153,0.15))",height:`${(d.meetings/maxMeetings)*100}%`,minHeight:8 }}/>
                  </div>
                  <div style={{ fontSize:10,color:S.faint,marginTop:6 }}>{d.day}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:10,height:10,borderRadius:2,background:"#34d399" }}/>
              <span style={{ fontSize:11,color:S.faint }}>Meetings · Weekly Total: <span style={{ color:"#34d399",fontWeight:700 }}>{WEEKLY.reduce((a,d)=>a+d.meetings,0)}</span></span>
            </div>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
          {/* Pipeline */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:20 }}>Pipeline Funnel</div>
            {PIPELINE.map((stage,i)=>(
              <div key={stage.stage} style={{ marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ width:8,height:8,borderRadius:2,background:stage.color }}/>
                    <span style={{ fontSize:13,color:S.text }}>{stage.stage}</span>
                  </div>
                  <span style={{ fontSize:13,fontWeight:700,color:stage.color }}>{stage.count}</span>
                </div>
                <div style={{ height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${Math.round((stage.count/PIPELINE[0].count)*100)}%`,background:stage.color,borderRadius:3 }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Top Performers */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:22 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:20 }}>Top Performers</div>
            {TOP_REPS.map((rep,i)=>(
              <div key={rep.name} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<TOP_REPS.length-1?`1px solid ${S.lineSoft}`:"none" }}>
                <div style={{ width:16,height:16,borderRadius:4,background:"rgba(255,255,255,0.06)",display:"grid",placeItems:"center",fontSize:10,fontWeight:700,color:S.faint,flexShrink:0 }}>#{i+1}</div>
                <div style={{ width:36,height:36,borderRadius:"50%",background:rep.bg,color:rep.color,display:"grid",placeItems:"center",fontSize:12,fontWeight:800,flexShrink:0 }}>{rep.init}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:S.text,display:"flex",alignItems:"center",gap:6 }}>
                    {rep.name}
                    {i===0&&<span style={{ fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:999,background:"rgba(200,255,0,0.1)",color:S.accent }}>AI</span>}
                  </div>
                  <div style={{ fontSize:11,color:S.faint }}>{rep.emails} emails · {rep.rate} reply rate</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:14,fontWeight:700,color:i===0?S.accent:S.text }}>{rep.meetings}</div>
                  <div style={{ fontSize:10,color:S.faint }}>meetings</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:i===0?S.accent:"#f59e0b" }}>${(rep.revenue/1000).toFixed(0)}K</div>
                  <div style={{ fontSize:10,color:S.faint }}>pipeline</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
