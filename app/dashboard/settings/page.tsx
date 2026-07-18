"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };
const TABS = ["Profile","Plan & Usage","Integrations","Notifications","Team","Danger Zone"];

type Profile = { name:string; company:string; role:string; timezone:string; phone:string; linkedin:string; avatar_url:string; };
type Notifs = { hotLead:boolean; replyReceived:boolean; meetingBooked:boolean; dealAtRisk:boolean; sequenceComplete:boolean; weeklyReport:boolean; usageWarning:boolean; agentErrors:boolean; };

const DEFAULT_NOTIFS: Notifs = {
  hotLead:true, replyReceived:true, meetingBooked:true, dealAtRisk:true,
  sequenceComplete:false, weeklyReport:true, usageWarning:true, agentErrors:false,
};

export default function SettingsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [tab, setTab] = useState("Profile");
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"|"warning"}>({msg:"",type:"success"});
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [timezone, setTimezone] = useState("UTC+5 (Pakistan)");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<Notifs>(DEFAULT_NOTIFS);

  // Usage
  const [usage, setUsage] = useState<any>(null);
  const [plan, setPlan] = useState("free");

  const showToast = (msg:string, type:"success"|"error"|"warning"="success") => {
    setToast({msg,type}); setTimeout(()=>setToast({msg:"",type:"success"}),3500);
  };

  // Load profile from Supabase
  useEffect(() => {
    if (!user?.uid) return;
    setProfileLoading(true);

    // Load profile
    fetch(`/api/profile?userId=${user.uid}`)
      .then(r=>r.json())
      .then(d=>{
        if (d.profile) {
          setName(d.profile.name ?? user.displayName ?? "");
          setCompany(d.profile.company ?? "");
          setRole(d.profile.role ?? "");
          setTimezone(d.profile.timezone ?? "UTC+5 (Pakistan)");
          setPhone(d.profile.phone ?? "");
          setLinkedin(d.profile.linkedin ?? "");
          setAvatarUrl(d.profile.avatar_url ?? user.photoURL ?? "");
          if (d.profile.notifications && Object.keys(d.profile.notifications).length > 0) {
            setNotifs({...DEFAULT_NOTIFS,...d.profile.notifications});
          }
        } else {
          // First time — use Firebase data
          setName(user.displayName ?? "");
          setAvatarUrl(user.photoURL ?? "");
        }
      })
      .catch(()=>{ setName(user.displayName ?? ""); setAvatarUrl(user.photoURL ?? ""); })
      .finally(()=>setProfileLoading(false));

    // Load usage
    fetch(`/api/usage?userId=${user.uid}`)
      .then(r=>r.json())
      .then(d=>{ if(!d.error){ setUsage(d); setPlan(d.plan ?? "free"); } })
      .catch(()=>{});
  }, [user?.uid]);

  const saveProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ userId:user.uid, name, company, role, timezone, phone, linkedin, notifications:notifs }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error??"Error saving","error");
      else showToast("✓ Profile saved successfully!");
    } catch { showToast("Error saving profile","error"); }
    setSaving(false);
  };

  const saveNotifications = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ userId:user.uid, name, company, role, timezone, notifications:notifs }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error??"Error saving","error");
      else showToast("✓ Notification preferences saved!");
    } catch { showToast("Error saving","error"); }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Image must be under 2MB","error"); return; }
    setAvatarUploading(true);
    try {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.uid);
      const res = await fetch("/api/profile", { method:"PUT", body:formData });
      const data = await res.json();
      if (!res.ok) { showToast(data.error??"Upload failed","error"); }
      else { setAvatarUrl(data.avatar_url); showToast("✓ Profile photo updated!"); window.dispatchEvent(new Event("avatar-updated")); }
    } catch { showToast("Error uploading photo","error"); }
    setAvatarUploading(false);
    e.target.value = "";
  };

  const clearAllData = async () => {
    if (!confirm("Delete ALL your prospects, sequences, and data? This CANNOT be undone!")) return;
    if (!confirm("Are you absolutely sure? Type YES to confirm.")) return;
    showToast("⚠️ Contact support to clear data for security reasons","warning");
  };

  const toastColor = toast.type==="error"?"#f87171":toast.type==="warning"?"#f59e0b":S.accent;

  if (authLoading || profileLoading) return <LoadingScreen text="Loading your settings"/>;

  const PLAN_LIMITS: Record<string,any> = {
    free:     { prospects:50,  agentRuns:5,  sequences:2,  emails:0      },
    starter:  { prospects:500, agentRuns:50, sequences:10, emails:1000   },
    pro:      { prospects:-1,  agentRuns:-1, sequences:-1, emails:10000  },
    enterprise:{ prospects:-1, agentRuns:-1, sequences:-1, emails:-1     },
  };
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const used = usage?.usage ?? {};

  const displayVal = (v:number, max:number) => max===-1 ? `${v} / ∞` : `${v} / ${max}`;
  const pct = (v:number, max:number) => max===-1 ? 0 : Math.min((v/max)*100, 100);

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast.msg&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:`1px solid ${toastColor}44`,borderRadius:12,padding:"12px 22px",fontSize:13,fontWeight:600,color:toastColor,zIndex:300,whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center" }}>{toast.msg}</div>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:"none" }}/>
      <Sidebar active="settings" user={user} onLogout={handleLogout}/>

      <div style={{ marginLeft:240,padding:"28px 32px",maxWidth:860 }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Settings</h1>
          <p style={{ color:S.muted,fontSize:14 }}>Manage your account, plan, and preferences · All changes save to Supabase</p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",gap:2,marginBottom:24,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:4,overflowX:"auto" }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ flex:1,padding:"8px 10px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:12,fontWeight:tab===t?700:500,transition:"all 0.15s",background:tab===t?S.accent:"transparent",color:tab===t?"#050505":S.faint,whiteSpace:"nowrap" }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {tab==="Profile"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            {/* Avatar */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:16 }}>Profile Photo</div>
              <div style={{ display:"flex",alignItems:"center",gap:20 }}>
                {/* Avatar preview */}
                <div style={{ position:"relative",flexShrink:0 }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar"
                      style={{ width:72,height:72,borderRadius:"50%",border:"2px solid rgba(200,255,0,0.3)",objectFit:"cover" }}/>
                  ) : (
                    <div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(140deg,#C8FF00,#86efac)",display:"grid",placeItems:"center",fontSize:26,fontWeight:800,color:"#050505",border:"2px solid rgba(200,255,0,0.3)" }}>
                      {name?.[0]?.toUpperCase() ?? user?.displayName?.[0] ?? "U"}
                    </div>
                  )}
                  {avatarUploading&&(
                    <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.6)",display:"grid",placeItems:"center" }}>
                      <div style={{ width:20,height:20,border:"2px solid rgba(200,255,0,0.3)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize:15,fontWeight:700,color:S.text,marginBottom:4 }}>{name || user?.displayName || "Your Name"}</div>
                  <div style={{ fontSize:13,color:S.faint,marginBottom:12 }}>{user?.email}</div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>fileRef.current?.click()} disabled={avatarUploading}
                      style={{ padding:"7px 14px",borderRadius:9,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                      {avatarUploading?"Uploading...":"Upload Photo"}
                    </button>
                    {avatarUrl&&<button onClick={()=>setAvatarUrl("")}
                      style={{ padding:"7px 14px",borderRadius:9,background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.15)",color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                      Remove
                    </button>}
                  </div>
                  <div style={{ fontSize:11,color:S.faint,marginTop:6 }}>JPG, PNG or GIF · Max 2MB</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:20 }}>Personal Information</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                {[
                  { label:"Full Name",value:name,setter:setName,placeholder:"Your full name",disabled:false },
                  { label:"Email",value:user?.email??"",setter:null,placeholder:"",disabled:true },
                  { label:"Company",value:company,setter:setCompany,placeholder:"Your company name" },
                  { label:"Role / Title",value:role,setter:setRole,placeholder:"VP Sales, Founder, SDR..." },
                  { label:"Phone",value:phone,setter:setPhone,placeholder:"+1 (555) 000-0000" },
                  { label:"LinkedIn URL",value:linkedin,setter:setLinkedin,placeholder:"linkedin.com/in/yourname" },
                ].map(f=>(
                  <div key={f.label}>
                    <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>{f.label}</label>
                    <input value={f.value} onChange={e=>f.setter?.(e.target.value)} disabled={f.disabled}
                      placeholder={f.placeholder}
                      style={{ width:"100%",padding:"10px 14px",borderRadius:10,background:f.disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:f.disabled?S.faint:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",cursor:f.disabled?"not-allowed":"text",transition:"border-color 0.2s" }}
                      onFocus={e=>{ if(!f.disabled)(e.target as HTMLInputElement).style.borderColor="rgba(200,255,0,0.3)"; }}
                      onBlur={e=>(e.target as HTMLInputElement).style.borderColor=S.lineSoft}/>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12,fontWeight:600,color:S.faint,display:"block",marginBottom:6 }}>Timezone</label>
                <select value={timezone} onChange={e=>setTimezone(e.target.value)}
                  style={{ width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",cursor:"pointer" }}>
                  {["UTC+5 (Pakistan)","UTC+0 (London)","UTC-5 (New York)","UTC-8 (Los Angeles)","UTC+1 (Paris)","UTC+5:30 (India)","UTC+8 (Singapore)","UTC+3 (Dubai)","UTC+4 (Abu Dhabi)","UTC+9 (Tokyo)"].map(tz=>(
                    <option key={tz} value={tz} style={{ background:"#0d1018" }}>{tz}</option>
                  ))}
                </select>
              </div>
              <button onClick={saveProfile} disabled={saving}
                style={{ padding:"10px 24px",borderRadius:10,background:saving?"rgba(200,255,0,0.6)":S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:8 }}>
                {saving?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Saving...</>:"Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* ── PLAN & USAGE TAB ── */}
        {tab==="Plan & Usage"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:6 }}>Current Plan</div>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text,textTransform:"capitalize" }}>{plan}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.1)",border:"1px solid rgba(200,255,0,0.2)",padding:"3px 10px",borderRadius:999 }}>Active</span>
                  </div>
                </div>
                <a href="/dashboard/pricing"
                  style={{ padding:"10px 20px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:8 }}>
                  ⚡ Upgrade Plan
                </a>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                {[
                  { label:"Prospects",        used:used.prospects??0,       max:limits.prospects,  color:S.accent },
                  { label:"AI Agent Runs/Day",used:used.agentRunsToday??0,  max:limits.agentRuns,  color:"#818cf8" },
                  { label:"Active Sequences", used:used.sequences??0,       max:limits.sequences,  color:"#34d399" },
                  { label:"Emails This Month",used:used.emailsThisMonth??0, max:limits.emails,     color:"#f59e0b" },
                ].map(u=>(
                  <div key={u.label} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:16 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                      <span style={{ fontSize:12,color:S.muted }}>{u.label}</span>
                      <span style={{ fontSize:12,fontWeight:700,color:u.color }}>{displayVal(u.used, u.max)}</span>
                    </div>
                    {u.max!==-1&&(
                      <>
                        <div style={{ height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:6 }}>
                          <div style={{ height:"100%",width:`${pct(u.used,u.max)}%`,background:u.color,borderRadius:3,transition:"width 0.6s ease" }}/>
                        </div>
                        {u.used>=u.max*0.8&&u.max>0&&(
                          <div style={{ fontSize:11,color:"#f59e0b" }}>⚠ Approaching limit — <a href="/dashboard/pricing" style={{ color:S.accent }}>Upgrade</a></div>
                        )}
                      </>
                    )}
                    {u.max===-1&&<div style={{ fontSize:11,color:"#34d399" }}>✓ Unlimited</div>}
                  </div>
                ))}
              </div>
            </div>

            {plan==="free"&&(
              <div style={{ background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24 }}>
                <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:14 }}>Upgrade to Pro — $79/month</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
                  {["Unlimited prospects","Unlimited AI agent runs","All 15 automations","Email sending (10K/mo)","LinkedIn automation","Priority support","Custom AI prompts","5 team members"].map(f=>(
                    <div key={f} style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ color:S.accent }}>✓</span>
                      <span style={{ fontSize:12,color:S.muted }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/dashboard/pricing"
                  style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none" }}>
                  View All Plans →
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── INTEGRATIONS TAB ── */}
        {tab==="Integrations"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {[
              { name:"OpenRouter AI",  desc:"Powers all 10 AI agents and automations",        icon:"⚡",status:"connected",   color:"#34d399" },
              { name:"Supabase",       desc:"Your database — prospects, emails, sequences",   icon:"🗄️",status:"connected",   color:"#34d399" },
              { name:"Firebase Auth",  desc:"Google & GitHub OAuth sign-in",                  icon:"🔥",status:"connected",   color:"#34d399" },
              { name:"Resend",         desc:"Email sending for outreach (Starter plan+)",     icon:"✉️",status:process.env.NEXT_PUBLIC_RESEND_CONFIGURED==="true"?"connected":"not_connected", color:"#818cf8" },
              { name:"Calendly",       desc:"Meeting booking — share your Calendly link",     icon:"📅",status:"not_connected",color:"#f59e0b" },
              { name:"HubSpot CRM",    desc:"Sync prospects and deals to HubSpot",            icon:"🔄",status:"not_connected",color:"#f59e0b" },
              { name:"Salesforce",     desc:"Enterprise CRM integration",                     icon:"☁️",status:"not_connected",color:"#60a5fa" },
              { name:"LinkedIn",       desc:"LinkedIn automation (Pro plan)",                  icon:"💼",status:"not_connected",color:"#60a5fa" },
              { name:"Slack",          desc:"Get alerts and deal notifications in Slack",     icon:"💬",status:"not_connected",color:"#818cf8" },
            ].map(intg=>(
              <div key={intg.name} style={{ background:S.panel,border:`1px solid ${intg.status==="connected"?"rgba(52,211,153,0.15)":S.lineSoft}`,borderRadius:14,padding:"18px 20px",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,display:"grid",placeItems:"center",fontSize:22,flexShrink:0 }}>{intg.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:3 }}>{intg.name}</div>
                  <div style={{ fontSize:12,color:S.faint }}>{intg.desc}</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999,color:intg.status==="connected"?"#34d399":"#9598a3",background:intg.status==="connected"?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.05)" }}>
                    {intg.status==="connected"?"● Connected":"○ Not Connected"}
                  </span>
                  <button onClick={()=>{ if(intg.status!=="connected") window.open("https://"+intg.name.toLowerCase().replace(" ","")+".com","_blank"); }}
                    style={{ padding:"7px 14px",borderRadius:9,border:`1px solid ${intg.status==="connected"?"rgba(248,113,113,0.2)":"rgba(200,255,0,0.2)"}`,background:intg.status==="connected"?"rgba(248,113,113,0.06)":"rgba(200,255,0,0.06)",color:intg.status==="connected"?"#f87171":S.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    {intg.status==="connected"?"Disconnect":"Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab==="Notifications"&&(
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
            <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:6 }}>Notification Preferences</div>
            <div style={{ fontSize:12,color:S.faint,marginBottom:20 }}>Changes save to Supabase — your preferences sync across devices</div> }}>
            {([
              { key:"hotLead",          label:"Hot Lead Alert",         desc:"When a prospect AI score exceeds 85" },
              { key:"replyReceived",    label:"Reply Received",         desc:"When a prospect replies to your email" },
              { key:"meetingBooked",    label:"Meeting Booked",         desc:"When AI books a meeting for you" },
              { key:"dealAtRisk",       label:"Deal at Risk",           desc:"When a deal has no activity for 7 days" },
              { key:"sequenceComplete", label:"Sequence Completed",     desc:"When a prospect completes a sequence" },
              { key:"weeklyReport",     label:"Weekly Report",          desc:"Weekly performance summary every Monday" },
              { key:"usageWarning",     label:"Usage Limit Warning",    desc:"When approaching your plan limits" },
              { key:"agentErrors",      label:"AI Agent Errors",        desc:"When an agent encounters an error" },
            ] as { key:keyof Notifs; label:string; desc:string }[]).map((n,i,arr)=>(
              <div key={n.key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${S.lineSoft}`:"none" }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:S.text,marginBottom:3 }}>{n.label}</div>
                  <div style={{ fontSize:12,color:S.faint }}>{n.desc}</div>
                </div>
                <button onClick={()=>setNotifs(prev=>({...prev,[n.key]:!prev[n.key]}))}
                  style={{ width:44,height:24,borderRadius:999,border:"none",cursor:"pointer",background:notifs[n.key]?S.accent:"rgba(255,255,255,0.1)",position:"relative",flexShrink:0,transition:"background 0.3s" }}>
                  <div style={{ position:"absolute",top:3,left:notifs[n.key]?22:3,width:18,height:18,borderRadius:"50%",background:notifs[n.key]?"#050505":"rgba(255,255,255,0.5)",transition:"left 0.3s" }}/>
                </button>
              </div>
            ))}
            <button onClick={saveNotifications} disabled={saving}
              style={{ marginTop:20,padding:"10px 24px",borderRadius:10,background:saving?"rgba(200,255,0,0.6)":S.accent,border:"none",color:"#050505",fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:8 }}>
              {saving?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Saving...</>:"Save Preferences"}
            </button>
          </div>
        )}

        {/* ── TEAM TAB ── */}
        {tab==="Team"&&(
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
              <div style={{ fontSize:14,fontWeight:700,color:S.text }}>Team Members</div>
              <span style={{ fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"6px 14px",borderRadius:999 }}>Pro plan required</span>
            </div>
            <div style={{ textAlign:"center",padding:"40px 24px" }}>
              <div style={{ fontSize:40,marginBottom:16 }}>👥</div>
              <div style={{ fontSize:15,fontWeight:700,color:S.text,marginBottom:8 }}>Team features on Pro plan</div>
              <div style={{ fontSize:13,color:S.muted,marginBottom:24,lineHeight:1.6,maxWidth:360,margin:"0 auto 24px" }}>
                Upgrade to Pro to add up to 5 team members. Each gets their own prospects, sequences, and AI agent access.
              </div>
              <a href="/dashboard/pricing" style={{ padding:"11px 24px",borderRadius:10,background:S.accent,color:"#050505",fontSize:13,fontWeight:700,textDecoration:"none" }}>
                Upgrade to Pro →
              </a>
            </div>
          </div>
        )}

        {/* ── DANGER ZONE TAB ── */}
        {tab==="Danger Zone"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {[
              { title:"Export All Data", desc:"Download all prospects, sequences, and settings as CSV", btn:"Export Data", color:"#818cf8", border:"rgba(129,140,248,0.2)", bg:"rgba(129,140,248,0.06)",
                action:()=>window.open(`/api/export?userId=${user?.uid}`,"_blank") },
              { title:"Clear All Prospects", desc:"Permanently delete all prospects. Cannot be undone.", btn:"Clear Prospects", color:"#f87171", border:"rgba(248,113,113,0.2)", bg:"rgba(248,113,113,0.06)",
                action:clearAllData },
              { title:"Delete Account", desc:"Permanently delete your account and all data. Cannot be undone.", btn:"Delete Account", color:"#f87171", border:"rgba(248,113,113,0.3)", bg:"rgba(248,113,113,0.08)",
                action:()=>showToast("Contact support@salesforge.ai to delete your account","warning") },
            ].map(d=>(
              <div key={d.title} style={{ background:S.panel,border:"1px solid rgba(248,113,113,0.15)",borderRadius:16,padding:24,display:"flex",alignItems:"center",justifyContent:"space-between",gap:20 }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>{d.title}</div>
                  <div style={{ fontSize:12,color:S.faint }}>{d.desc}</div>
                </div>
                <button onClick={d.action}
                  style={{ padding:"9px 18px",borderRadius:10,background:d.bg,border:`1px solid ${d.border}`,color:d.color,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",flexShrink:0 }}>
                  {d.btn}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder{color:#555a66}
        select option{background:#0d1018;color:#f4f5f7}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
