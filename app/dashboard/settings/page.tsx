"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const TABS = ["Profile","Plan & Usage","Integrations","Notifications","Team","Danger Zone"];

export default function SettingsPage() {
  const { user, loading, handleLogout } = useAuth();
  const [tab, setTab] = useState("Profile");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  // Profile form
  const [name, setName] = useState(user?.displayName ?? "");
  const [email] = useState(user?.email ?? "");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [timezone, setTimezone] = useState("UTC+5 (Pakistan)");

  // Plan state
  const currentPlan = { name:"Free", prospects:5, maxProspects:50, agentRuns:3, maxAgentRuns:5, sequences:0, maxSequences:2, emailsSent:0, maxEmails:0 };

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r=>setTimeout(r,800));
    setSaving(false);
    showToast("Settings saved ✓");
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:"1px solid rgba(200,255,0,0.3)",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:S.accent,zIndex:300,whiteSpace:"nowrap" }}>{toast}</div>}
      <Sidebar active="settings" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px",maxWidth:900 }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Settings</h1>
          <p style={{ color:S.muted,fontSize:14 }}>Manage your account, plan, and integrations</p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",gap:2,marginBottom:24,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:4 }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ flex:1,padding:"8px 12px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:12,fontWeight:tab===t?700:500,transition:"all 0.15s",background:tab===t?S.accent:"transparent",color:tab===t?"#050505":S.faint }}>
              {t}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab==="Profile" && (
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            {/* Avatar */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:16 }}>Profile Photo</div>
              <div style={{ display:"flex",alignItems:"center",gap:16 }}>
                {user?.photoURL
                  ? <img src={user.photoURL} alt="" style={{ width:64,height:64,borderRadius:"50%",border:"2px solid rgba(200,255,0,0.3)" }}/>
                  : <div style={{ width:64,height:64,borderRadius:"50%",background:"linear-gradient(140deg,#C8FF00,#86efac)",display:"grid",placeItems:"center",fontSize:24,fontWeight:800,color:"#050505" }}>{user?.displayName?.[0]??"U"}</div>
                }
                <div>
                  <div style={{ fontSize:16,fontWeight:700,color:S.text }}>{user?.displayName}</div>
                  <div style={{ fontSize:13,color:S.faint }}>{user?.email}</div>
                  <div style={{ fontSize:11,fontWeight:700,color:S.accent,marginTop:4,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"2px 8px",borderRadius:999,display:"inline-block" }}>Free Plan</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:20 }}>Personal Information</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                {[
                  { label:"Full Name",value:name,setter:setName,placeholder:"Your full name" },
                  { label:"Email",value:email,setter:null,placeholder:"your@email.com",disabled:true },
                  { label:"Company",value:company,setter:setCompany,placeholder:"Your company name" },
                  { label:"Role",value:role,setter:setRole,placeholder:"e.g. VP Sales, Founder" },
                ].map(f=>(
                  <div key={f.label}>
                    <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>{f.label}</label>
                    <input value={f.value} onChange={e=>f.setter?.(e.target.value)} disabled={f.disabled}
                      placeholder={f.placeholder}
                      style={{ width:"100%",padding:"10px 14px",borderRadius:10,background:f.disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:f.disabled?S.faint:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",cursor:f.disabled?"not-allowed":"text" }}
                      onFocus={e=>{ if(!f.disabled)(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"; }}
                      onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>Timezone</label>
                <select value={timezone} onChange={e=>setTimezone(e.target.value)}
                  style={{ width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",cursor:"pointer" }}>
                  {["UTC+5 (Pakistan)","UTC+0 (London)","UTC-5 (New York)","UTC-8 (Los Angeles)","UTC+1 (Paris)","UTC+5:30 (India)","UTC+8 (Singapore)"].map(tz=>(
                    <option key={tz} value={tz} style={{ background:"#0d1018" }}>{tz}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSave} disabled={saving}
                style={{ padding:"10px 24px",borderRadius:10,background:saving?"rgba(200,255,0,0.6)":S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:8 }}>
                {saving?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Saving...</>:"Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Plan & Usage Tab */}
        {tab==="Plan & Usage" && (
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            {/* Current Plan */}
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Current Plan</div>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text }}>{currentPlan.name}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.1)",border:"1px solid rgba(200,255,0,0.2)",padding:"3px 10px",borderRadius:999 }}>Active</span>
                  </div>
                </div>
                <a href="/dashboard/pricing"
                  style={{ padding:"10px 20px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Upgrade Plan
                </a>
              </div>

              {/* Usage Bars */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                {[
                  { label:"Prospects",used:currentPlan.prospects,max:currentPlan.maxProspects,color:S.accent },
                  { label:"AI Agent Runs Today",used:currentPlan.agentRuns,max:currentPlan.maxAgentRuns,color:"#818cf8" },
                  { label:"Active Sequences",used:currentPlan.sequences,max:currentPlan.maxSequences,color:"#34d399" },
                  { label:"Emails Sent This Month",used:currentPlan.emailsSent,max:currentPlan.maxEmails||0,color:"#f59e0b",noLimit:true },
                ].map(u=>(
                  <div key={u.label} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:16 }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                      <span style={{ fontSize:12,color:S.muted }}>{u.label}</span>
                      <span style={{ fontSize:12,fontWeight:700,color:u.color }}>{u.noLimit?"N/A (Free)":`${u.used} / ${u.max}`}</span>
                    </div>
                    {!u.noLimit&&(
                      <>
                        <div style={{ height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:6 }}>
                          <div style={{ height:"100%",width:`${Math.min((u.used/u.max)*100,100)}%`,background:u.color,borderRadius:3,transition:"width 0.5s" }}/>
                        </div>
                        {u.used>=u.max*0.8&&(
                          <div style={{ fontSize:11,color:"#f59e0b" }}>⚠ Approaching limit — <a href="/dashboard/pricing" style={{ color:S.accent }}>Upgrade</a></div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Benefits */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:16 }}>Upgrade to Pro — $79/month</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
                {["Unlimited prospects","Unlimited AI agent runs","All 15 automations","Email sending (10K/mo)","LinkedIn automation","Priority support","Custom AI prompts","5 team members"].map(f=>(
                  <div key={f} style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:16,height:16,borderRadius:"50%",background:"rgba(200,255,0,0.1)",border:"1px solid rgba(200,255,0,0.3)",display:"grid",placeItems:"center",flexShrink:0 }}>
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#C8FF00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span style={{ fontSize:12,color:S.muted }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="/dashboard/pricing"
                style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none" }}>
                View All Plans →
              </a>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {tab==="Integrations" && (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {[
              { name:"OpenRouter AI",desc:"Powers all AI agents and automations",icon:"⚡",status:"connected",color:"#C8FF00" },
              { name:"Supabase",desc:"Your database and authentication",icon:"🗄️",status:"connected",color:"#34d399" },
              { name:"Firebase",desc:"Google & GitHub OAuth authentication",icon:"🔥",status:"connected",color:"#f59e0b" },
              { name:"Resend",desc:"Email sending for outreach sequences",icon:"✉️",status:"not_connected",color:"#818cf8" },
              { name:"HubSpot CRM",desc:"Sync prospects and deals to HubSpot",icon:"🔄",status:"not_connected",color:"#f59e0b" },
              { name:"Salesforce",desc:"Enterprise CRM integration",icon:"☁️",status:"not_connected",color:"#60a5fa" },
              { name:"LinkedIn",desc:"LinkedIn automation and prospecting",icon:"💼",status:"not_connected",color:"#60a5fa" },
              { name:"Slack",desc:"Get alerts and notifications in Slack",icon:"💬",status:"not_connected",color:"#818cf8" },
            ].map(intg=>(
              <div key={intg.name} style={{ background:S.panel,border:`1px solid ${intg.status==="connected"?"rgba(52,211,153,0.15)":S.lineSoft}`,borderRadius:14,padding:"18px 20px",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:42,height:42,borderRadius:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,display:"grid",placeItems:"center",fontSize:20,flexShrink:0 }}>{intg.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:3 }}>{intg.name}</div>
                  <div style={{ fontSize:12,color:S.faint }}>{intg.desc}</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999,color:intg.status==="connected"?"#34d399":"#9598a3",background:intg.status==="connected"?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.05)" }}>
                    {intg.status==="connected"?"● Connected":"○ Not Connected"}
                  </span>
                  <button style={{ padding:"7px 14px",borderRadius:9,border:`1px solid ${intg.status==="connected"?"rgba(248,113,113,0.2)":"rgba(200,255,0,0.2)"}`,background:intg.status==="connected"?"rgba(248,113,113,0.06)":"rgba(200,255,0,0.06)",color:intg.status==="connected"?"#f87171":S.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    {intg.status==="connected"?"Disconnect":"Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notifications Tab */}
        {tab==="Notifications" && (
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:20 }}>Notification Preferences</div>
            {[
              { label:"Hot Lead Alert",desc:"When a prospect score exceeds 85",enabled:true },
              { label:"Reply Received",desc:"When a prospect replies to your email",enabled:true },
              { label:"Meeting Booked",desc:"When AI books a meeting",enabled:true },
              { label:"Deal at Risk",desc:"When a deal has no activity for 7 days",enabled:true },
              { label:"Sequence Completed",desc:"When a prospect completes a sequence",enabled:false },
              { label:"Weekly Report",desc:"Weekly performance summary every Monday",enabled:true },
              { label:"Usage Limit Warning",desc:"When approaching plan limits",enabled:true },
              { label:"AI Agent Errors",desc:"When an agent encounters an error",enabled:false },
            ].map((n,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:i<7?`1px solid ${S.lineSoft}`:"none" }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:S.text,marginBottom:3 }}>{n.label}</div>
                  <div style={{ fontSize:12,color:S.faint }}>{n.desc}</div>
                </div>
                <div style={{ width:44,height:24,borderRadius:999,background:n.enabled?S.accent:"rgba(255,255,255,0.1)",position:"relative",cursor:"pointer",flexShrink:0,transition:"background 0.3s" }}>
                  <div style={{ position:"absolute",top:3,left:n.enabled?23:3,width:18,height:18,borderRadius:"50%",background:n.enabled?"#050505":"rgba(255,255,255,0.5)",transition:"left 0.3s" }}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Team Tab */}
        {tab==="Team" && (
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text }}>Team Members</div>
              <div style={{ fontSize:12,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"6px 14px",borderRadius:999,color:S.accent,fontWeight:700 }}>
                Pro plan required
              </div>
            </div>
            <div style={{ textAlign:"center",padding:"40px 24px" }}>
              <div style={{ fontSize:40,marginBottom:16 }}>👥</div>
              <div style={{ fontSize:15,fontWeight:700,color:S.text,marginBottom:8 }}>Team features on Pro plan</div>
              <div style={{ fontSize:13,color:S.muted,marginBottom:24,lineHeight:1.6,maxWidth:360,margin:"0 auto 24px" }}>
                Upgrade to Pro to add up to 5 team members. Each member gets their own prospects, sequences, and AI agent access.
              </div>
              <a href="/dashboard/pricing" style={{ padding:"11px 24px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none" }}>
                Upgrade to Pro →
              </a>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {tab==="Danger Zone" && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {[
              { title:"Export All Data",desc:"Download all your prospects, sequences, and settings as CSV",btn:"Export Data",btnColor:"#818cf8",btnBorder:"rgba(129,140,248,0.2)",btnBg:"rgba(129,140,248,0.08)" },
              { title:"Clear All Prospects",desc:"Permanently delete all prospects from your account. This cannot be undone.",btn:"Clear Prospects",btnColor:"#f87171",btnBorder:"rgba(248,113,113,0.2)",btnBg:"rgba(248,113,113,0.08)" },
              { title:"Delete Account",desc:"Permanently delete your account and all associated data. This cannot be undone.",btn:"Delete Account",btnColor:"#f87171",btnBorder:"rgba(248,113,113,0.3)",btnBg:"rgba(248,113,113,0.1)" },
            ].map(d=>(
              <div key={d.title} style={{ background:S.panel,border:`1px solid rgba(248,113,113,0.15)`,borderRadius:16,padding:24,display:"flex",alignItems:"center",justifyContent:"space-between",gap:20 }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>{d.title}</div>
                  <div style={{ fontSize:12,color:S.faint }}>{d.desc}</div>
                </div>
                <button style={{ padding:"9px 18px",borderRadius:10,background:d.btnBg,border:`1px solid ${d.btnBorder}`,color:d.btnColor,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",flexShrink:0 }}>
                  {d.btn}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        button:focus{outline:none}
        input::placeholder{color:#555a66}
        select option{background:#0d1018;color:#f4f5f7}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
