"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

const S = {
  bg:"#050505", panel:"#0d1018", lineSoft:"rgba(255,255,255,0.05)",
  text:"#f4f5f7", muted:"#9598a3", faint:"#555a66", accent:"#C8FF00",
  red:"#f87171", green:"#34d399",
};

type Toast = { msg:string; type:"success"|"error"|"warning" };

const TABS = ["Profile","Account","Notifications","Integrations","Danger"] as const;
type Tab = typeof TABS[number];

export default function SettingsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [tab, setTab] = useState<Tab>("Profile");
  const [toast, setToast] = useState<Toast>({ msg:"", type:"success" });
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany]         = useState("");
  const [role, setRole]               = useState("");
  const [timezone, setTimezone]       = useState("UTC");

  // Notification prefs
  const [notifEmail,  setNotifEmail]  = useState(true);
  const [notifHotLead,setNotifHotLead]= useState(true);
  const [notifReply,  setNotifReply]  = useState(true);
  const [notifMeeting,setNotifMeeting]= useState(true);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    // Load profile from API
    fetch(`/api/profile?userId=${user.uid}`)
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          setCompany(d.profile.company ?? "");
          setRole(d.profile.role ?? "");
          setTimezone(d.profile.timezone ?? "UTC");
        }
      })
      .catch(() => {});
  }, [user]);

  const showToast = (msg:string, type:Toast["type"]="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"success" }), 4000);
  };

  const saveProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ userId: user.uid, displayName, company, role, timezone }),
      });
      showToast("✓ Profile saved");
    } catch {
      showToast("Failed to save profile","error");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <LoadingScreen text="Loading settings…" />;

  const toastColor = toast.type==="error" ? S.red : toast.type==="warning" ? "#f59e0b" : S.accent;

  return (
    <div style={{ background:S.bg, minHeight:"100vh", fontFamily:"Inter,sans-serif" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        input,select,textarea{font-family:inherit}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .sf-input{width:100%;padding:11px 14px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#f4f5f7;font-size:13px;outline:none;transition:border-color 0.15s}
        .sf-input:focus{border-color:rgba(200,255,0,0.4)}
        .sf-label{font-size:12px;font-weight:600;color:#555a66;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em}
        .sf-row{margin-bottom:18px}
        .toggle{width:40px;height:22px;border-radius:999px;border:none;cursor:pointer;position:relative;transition:background .2s}
        .toggle::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
        .toggle.on{background:rgba(200,255,0,0.9)}
        .toggle.on::after{transform:translateX(18px)}
        .toggle.off{background:rgba(255,255,255,0.1)}
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",
          background:"#0d1018",border:`1px solid ${toastColor}55`,borderRadius:12,
          padding:"12px 22px",fontSize:13,fontWeight:700,color:toastColor,
          zIndex:500,whiteSpace:"nowrap",boxShadow:`0 4px 24px ${toastColor}22` }}>
          {toast.msg}
        </div>
      )}

      <Sidebar active="settings" user={user} onLogout={handleLogout} />

      <div className="sf-main">
        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,
            color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>
            Settings
          </h1>
          <p style={{ color:S.muted,fontSize:14 }}>Manage your account, profile, and preferences</p>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"200px 1fr",gap:24,alignItems:"start" }}>

          {/* Sidebar nav */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:8,position:"sticky",top:24 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ display:"block",width:"100%",textAlign:"left",padding:"9px 14px",
                  borderRadius:9,border:"none",cursor:"pointer",
                  background: tab===t ? (t==="Danger" ? "rgba(248,113,113,0.1)" : "rgba(200,255,0,0.08)") : "transparent",
                  color: tab===t ? (t==="Danger" ? S.red : S.accent) : S.muted,
                  fontSize:13,fontWeight: tab===t ? 700 : 500,fontFamily:"Inter,sans-serif",
                  transition:"all 0.15s",marginBottom:2 }}>
                {t}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:14,padding:28,animation:"fadeUp 0.3s ease" }}>

            {/* ── PROFILE ── */}
            {tab==="Profile" && (
              <div>
                <div style={{ fontSize:16,fontWeight:800,color:S.text,marginBottom:4 }}>Profile</div>
                <p style={{ fontSize:13,color:S.muted,marginBottom:24 }}>How you appear in outreach and reports</p>

                {/* Avatar */}
                <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:28 }}>
                  <div style={{ width:60,height:60,borderRadius:"50%",background:"linear-gradient(140deg,#C8FF00,#86efac)",
                    display:"grid",placeItems:"center",fontSize:22,fontWeight:800,color:"#050505" }}>
                    {(displayName||user?.email||"?")[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:15,fontWeight:700,color:S.text }}>{displayName || user?.email}</div>
                    <div style={{ fontSize:12,color:S.faint,marginTop:2 }}>{user?.email}</div>
                  </div>
                </div>

                <div className="sf-row">
                  <label className="sf-label">Display Name</label>
                  <input className="sf-input" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your full name" />
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  <div className="sf-row">
                    <label className="sf-label">Company</label>
                    <input className="sf-input" value={company} onChange={e => setCompany(e.target.value)}
                      placeholder="Your company name" />
                  </div>
                  <div className="sf-row">
                    <label className="sf-label">Role</label>
                    <input className="sf-input" value={role} onChange={e => setRole(e.target.value)}
                      placeholder="VP Sales, Founder…" />
                  </div>
                </div>
                <div className="sf-row">
                  <label className="sf-label">Timezone</label>
                  <select className="sf-input" value={timezone} onChange={e => setTimezone(e.target.value)}>
                    {["UTC","America/New_York","America/Los_Angeles","America/Chicago","Europe/London",
                      "Europe/Berlin","Asia/Dubai","Asia/Karachi","Asia/Kolkata","Asia/Tokyo","Australia/Sydney"]
                      .map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>

                <button onClick={saveProfile} disabled={saving}
                  style={{ padding:"11px 28px",borderRadius:10,background:saving?"rgba(200,255,0,0.5)":S.accent,
                    border:"none",color:"#050505",fontSize:13,fontWeight:800,cursor:saving?"not-allowed":"pointer",
                    fontFamily:"Syne,sans-serif",display:"flex",alignItems:"center",gap:8 }}>
                  {saving ? "Saving…" : "Save Profile"}
                </button>
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {tab==="Account" && (
              <div>
                <div style={{ fontSize:16,fontWeight:800,color:S.text,marginBottom:4 }}>Account</div>
                <p style={{ fontSize:13,color:S.muted,marginBottom:24 }}>Email, password, and billing plan</p>

                <div style={{ background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:18,marginBottom:16 }}>
                  <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8 }}>Email Address</div>
                  <div style={{ fontSize:14,color:S.text,fontWeight:600 }}>{user?.email ?? "—"}</div>
                  <div style={{ fontSize:11,color:S.faint,marginTop:4 }}>Email changes require re-authentication. Contact support.</div>
                </div>

                <div style={{ background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:18,marginBottom:16 }}>
                  <div style={{ fontSize:11,color:S.faint,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8 }}>User ID</div>
                  <div style={{ fontSize:12,color:S.muted,fontFamily:"monospace",wordBreak:"break-all" }}>{user?.uid ?? "—"}</div>
                </div>

                <a href="/dashboard/pricing"
                  style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:10,
                    background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.25)",
                    color:S.accent,fontSize:13,fontWeight:700,textDecoration:"none" }}>
                  ⚡ Upgrade Plan →
                </a>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {tab==="Notifications" && (
              <div>
                <div style={{ fontSize:16,fontWeight:800,color:S.text,marginBottom:4 }}>Notifications</div>
                <p style={{ fontSize:13,color:S.muted,marginBottom:24 }}>Choose what alerts you receive</p>

                {[
                  { label:"Email digests",     desc:"Daily summary of activity",          val:notifEmail,   set:setNotifEmail },
                  { label:"Hot lead alerts",   desc:"When a prospect signals buying intent", val:notifHotLead, set:setNotifHotLead },
                  { label:"Reply notifications",desc:"When a prospect replies",             val:notifReply,   set:setNotifReply },
                  { label:"Meeting reminders", desc:"Upcoming meeting reminders",           val:notifMeeting, set:setNotifMeeting },
                ].map(item => (
                  <div key={item.label}
                    style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"14px 0",borderBottom:`1px solid ${S.lineSoft}` }}>
                    <div>
                      <div style={{ fontSize:13,fontWeight:600,color:S.text,marginBottom:2 }}>{item.label}</div>
                      <div style={{ fontSize:12,color:S.faint }}>{item.desc}</div>
                    </div>
                    <button className={`toggle ${item.val?"on":"off"}`}
                      onClick={() => item.set(!item.val)}
                      aria-label={item.label} />
                  </div>
                ))}
              </div>
            )}

            {/* ── INTEGRATIONS ── */}
            {tab==="Integrations" && (
              <div>
                <div style={{ fontSize:16,fontWeight:800,color:S.text,marginBottom:4 }}>Integrations</div>
                <p style={{ fontSize:13,color:S.muted,marginBottom:24 }}>Connect your tools and data sources</p>

                {[
                  { name:"Resend", desc:"Email delivery — connected via RESEND_API_KEY", icon:"✉️", connected:true },
                  { name:"OpenRouter AI", desc:"AI agents — connected via OPENROUTER_API_KEY", icon:"⚡", connected:true },
                  { name:"Supabase", desc:"Database — connected via SUPABASE_URL", icon:"🗄️", connected:true },
                  { name:"Calendly", desc:"Meeting scheduling", icon:"📅", connected:false },
                  { name:"Slack", desc:"Notifications in Slack", icon:"💬", connected:false },
                  { name:"HubSpot", desc:"CRM sync", icon:"🔗", connected:false },
                ].map(item => (
                  <div key={item.name}
                    style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"14px 0",borderBottom:`1px solid ${S.lineSoft}` }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <span style={{ fontSize:22 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:S.text }}>{item.name}</div>
                        <div style={{ fontSize:12,color:S.faint }}>{item.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:99,
                      background: item.connected ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                      color: item.connected ? S.green : S.faint,
                      border: `1px solid ${item.connected ? "rgba(52,211,153,0.3)" : S.lineSoft}` }}>
                      {item.connected ? "✓ Connected" : "Not connected"}
                    </span>
                  </div>
                ))}

                <div style={{ marginTop:20,padding:"14px 16px",background:"rgba(200,255,0,0.04)",
                  border:"1px solid rgba(200,255,0,0.12)",borderRadius:10,fontSize:12,color:S.muted }}>
                  💡 New integrations are added regularly. Check back soon or{" "}
                  <a href="mailto:support@salevrix.ai" style={{ color:S.accent,fontWeight:600 }}>contact us</a> to request one.
                </div>
              </div>
            )}

            {/* ── DANGER ZONE ── */}
            {tab==="Danger" && (
              <div>
                <div style={{ fontSize:16,fontWeight:800,color:S.red,marginBottom:4 }}>Danger Zone</div>
                <p style={{ fontSize:13,color:S.muted,marginBottom:24 }}>Irreversible actions — proceed with care</p>

                <div style={{ border:`1px solid rgba(248,113,113,0.2)`,borderRadius:12,padding:20,marginBottom:16 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Sign out of all devices</div>
                  <div style={{ fontSize:12,color:S.faint,marginBottom:14 }}>Revoke all active sessions on other devices</div>
                  <button onClick={handleLogout}
                    style={{ padding:"9px 20px",borderRadius:9,background:"rgba(248,113,113,0.1)",
                      border:"1px solid rgba(248,113,113,0.3)",color:S.red,
                      fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    Sign Out
                  </button>
                </div>

                <div style={{ border:`1px solid rgba(248,113,113,0.2)`,borderRadius:12,padding:20 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text,marginBottom:4 }}>Delete account</div>
                  <div style={{ fontSize:12,color:S.faint,marginBottom:14 }}>
                    Permanently deletes your account, all prospects, sequences, and data. This cannot be undone.
                  </div>
                  <a href="mailto:support@salevrix.ai?subject=Account%20deletion%20request"
                    style={{ display:"inline-block",padding:"9px 20px",borderRadius:9,
                      background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",
                      color:S.red,fontSize:13,fontWeight:700,textDecoration:"none" }}>
                    Request Account Deletion →
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
