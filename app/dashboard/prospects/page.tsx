"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useProspects, Prospect } from "@/components/useProspects";
import LoadingScreen from "@/components/LoadingScreen";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const S = {
  bg:       "#050505",
  panel:    "#0d1018",
  panelHov: "#111720",
  line:     "rgba(255,255,255,0.07)",
  text:     "#ffffff",
  muted:    "#c4c7d0",
  faint:    "#8891a4",
  accent:   "#C8FF00",
  red:      "#f87171",
  green:    "#34d399",
  blue:     "#818cf8",
  amber:    "#f59e0b",
  cyan:     "#22d3ee",
};

const AVATARS = [
  { bg: "linear-gradient(140deg,#C8FF00,#86efac)", color: "#050505" },
  { bg: "linear-gradient(140deg,#818cf8,#c084fc)", color: "#fff" },
  { bg: "linear-gradient(140deg,#f59e0b,#ef4444)", color: "#fff" },
  { bg: "linear-gradient(140deg,#34d399,#059669)", color: "#fff" },
  { bg: "linear-gradient(140deg,#60a5fa,#3b82f6)", color: "#fff" },
  { bg: "linear-gradient(140deg,#f472b6,#ec4899)", color: "#fff" },
  { bg: "linear-gradient(140deg,#7c3aed,#9333ea)", color: "#fff" },
  { bg: "linear-gradient(140deg,#14b8a6,#0d9488)", color: "#fff" },
];

const STATUS_META: Record<string, { color: string; label: string; emoji: string }> = {
  new:       { color: S.accent, label: "New",       emoji: "✦" },
  contacted: { color: S.blue,   label: "Contacted",  emoji: "📨" },
  replied:   { color: S.green,  label: "Replied",    emoji: "💬" },
  meeting:   { color: S.amber,  label: "Meeting",    emoji: "📅" },
  closed:    { color: S.cyan,   label: "Closed",     emoji: "✓" },
  lost:      { color: S.red,    label: "Lost",       emoji: "✕" },
};

const ALL_STATUSES  = ["new","contacted","replied","meeting","closed","lost"];
const FILTER_TABS   = ["all","new","contacted","replied","meeting","high"];

type Toast      = { msg: string; type: "success"|"error"|"warning" };
type StatusType = "new"|"contacted"|"replied"|"meeting"|"closed"|"lost";
type ConfirmDel = { id: string; name: string } | null;

// ─── Smart auto-status engine ────────────────────────────────────────────────
// Rules: action taken → what status SHOULD be set
function autoStatus(current: string | undefined, action: "call"|"email_sent"|"email_replied"|"meeting_booked"|"deal_closed"|"deal_lost"): StatusType {
  const c = current ?? "new";
  switch (action) {
    case "call":
      // new → contacted; if already further along, don't downgrade
      return (c === "new") ? "contacted" : c as StatusType;
    case "email_sent":
      return (c === "new") ? "contacted" : c as StatusType;
    case "email_replied":
      // upgrade to replied if not already past it
      return (c === "new" || c === "contacted") ? "replied" : c as StatusType;
    case "meeting_booked":
      return (c !== "closed" && c !== "lost") ? "meeting" : c as StatusType;
    case "deal_closed":
      return "closed";
    case "deal_lost":
      return "lost";
    default:
      return c as StatusType;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function replaceVars(text: string, p: Prospect, sender = "The SalesForge Team"): string {
  const name      = p.name      ?? "";
  const firstName = name.split(" ")[0] || name;
  return text
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{name\}\}/g,      name)
    .replace(/\{\{company\}\}/g,   p.company  ?? "")
    .replace(/\{\{role\}\}/g,      p.role     ?? "")
    .replace(/\{\{industry\}\}/g,  p.industry ?? "")
    .replace(/\{\{sender\}\}/g,    sender)
    .replace(/\{\{icebreaker\}\}/g, p.company ? `their work at ${p.company}` : "their recent work")
    .replace(/\{\{topic\}\}/g, "sales automation");
}

function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function initials(name: string)  { return (name || "P").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase(); }

function IntentBadge({ intent }: { intent?: string }) {
  const map: Record<string,{color:string;bg:string;label:string}> = {
    high:   { color:"#f59e0b", bg:"rgba(245,158,11,0.12)", label:"🔥 High"   },
    medium: { color:"#818cf8", bg:"rgba(129,140,248,0.12)", label:"⚡ Medium" },
    low:    { color:"#8891a4", bg:"rgba(136,145,164,0.10)", label:"— Low"    },
  };
  const m = map[intent ?? "medium"] ?? map.medium;
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
      background:m.bg, color:m.color, border:`1px solid ${m.color}33` }}>
      {m.label}
    </span>
  );
}

// ─── Prospect Detail Drawer ───────────────────────────────────────────────────
function ProspectDrawer({
  prospect, onClose, onCall, onEmail, onStatusChange,
}: {
  prospect: Prospect;
  onClose: () => void;
  onCall: (p: Prospect) => void;
  onEmail: (p: Prospect) => void;
  onStatusChange: (id: string, s: StatusType) => void;
}) {
  const sm = STATUS_META[prospect.status ?? "new"] ?? STATUS_META.new;
  const fields = [
    { icon:"✉", label:"Email",    val: prospect.email   },
    { icon:"📞", label:"Phone",    val: prospect.phone   },
    { icon:"💼", label:"Role",     val: prospect.role    },
    { icon:"🏢", label:"Company",  val: prospect.company },
    { icon:"🌐", label:"Industry", val: prospect.industry},
    { icon:"👥", label:"Team size",val: prospect.company_size },
  ].filter(f => f.val);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose}
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:300,
          animation:"fadeIn 0.2s ease" }} />

      {/* Drawer */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0, width:"min(480px, 100vw)",
        background:"#0a0e16", borderLeft:"1px solid rgba(200,255,0,0.15)",
        zIndex:301, display:"flex", flexDirection:"column",
        animation:"slideIn 0.25s cubic-bezier(0.16,1,0.3,1)",
        overflowY:"auto",
      }}>
        {/* Header */}
        <div style={{ padding:"24px 24px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ width:52, height:52, borderRadius:"50%",
              background: prospect.avatar_bg || "#1a2035",
              color: prospect.avatar_color || S.accent,
              display:"grid", placeItems:"center", fontSize:16, fontWeight:800, flexShrink:0 }}>
              {prospect.avatar_init || initials(prospect.name)}
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:S.text, marginBottom:3 }}>{prospect.name}</div>
              {prospect.role && <div style={{ fontSize:13, color:S.muted }}>{prospect.role}</div>}
              {prospect.company && <div style={{ fontSize:12, color:S.faint }}>{prospect.company}</div>}
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8, color:S.faint, width:32, height:32, cursor:"pointer",
              fontSize:16, display:"grid", placeItems:"center" }}>×</button>
        </div>

        {/* Status + Intent */}
        <div style={{ padding:"16px 24px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:12, fontWeight:800, padding:"5px 12px", borderRadius:99,
            background:`${sm.color}18`, color:sm.color, border:`1px solid ${sm.color}44` }}>
            {sm.emoji} {sm.label}
          </span>
          <IntentBadge intent={prospect.buying_intent} />
          {prospect.ai_score !== undefined && (
            <span style={{ fontSize:11, fontWeight:700, color:S.faint }}>
              AI Score: <span style={{ color:S.accent }}>{prospect.ai_score}</span>
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ padding:"0 24px 20px", display:"flex", gap:10 }}>
          {prospect.phone ? (
            <a href={`tel:${prospect.phone}`} onClick={() => {
                // onCall already handles autoStatus + Supabase log — don't double-update
                onCall(prospect);
              }}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                padding:"11px", borderRadius:10, textDecoration:"none",
                background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.35)",
                color:S.green, fontWeight:800, fontSize:13, position:"relative" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:S.green,
                boxShadow:`0 0 0 0 ${S.green}`, animation:"livePulse 1.8s infinite" }} />
              📞 Call Now
            </a>
          ) : (
            <div style={{ flex:1, display:"grid", placeItems:"center", padding:"11px",
              borderRadius:10, background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.06)", color:S.faint, fontSize:12 }}>
              No phone number
            </div>
          )}
          <button onClick={() => onEmail(prospect)} className="btn-smooth"
            style={{ flex:1, padding:"11px", borderRadius:10,
              background:"rgba(200,255,0,0.08)", border:"1px solid rgba(200,255,0,0.25)",
              color:S.accent, fontWeight:800, fontSize:13, cursor:"pointer" }}>
            ✉ AI Email
          </button>
        </div>

        <div style={{ height:1, background:S.line, margin:"0 24px" }} />

        {/* Contact fields */}
        <div style={{ padding:"20px 24px" }}>
          <div style={{ fontSize:11, fontWeight:800, color:S.faint, textTransform:"uppercase",
            letterSpacing:"0.6px", marginBottom:14 }}>Contact Details</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {fields.map(f => (
              <div key={f.label} style={{ display:"flex", gap:12, alignItems:"center" }}>
                <span style={{ fontSize:15, width:24, textAlign:"center" }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:S.faint, textTransform:"uppercase",
                    letterSpacing:"0.4px", marginBottom:1 }}>{f.label}</div>
                  <div style={{ fontSize:13, color:S.text, fontWeight:500 }}>{f.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {prospect.notes && (
          <>
            <div style={{ height:1, background:S.line, margin:"0 24px" }} />
            <div style={{ padding:"20px 24px" }}>
              <div style={{ fontSize:11, fontWeight:800, color:S.faint, textTransform:"uppercase",
                letterSpacing:"0.6px", marginBottom:10 }}>Notes</div>
              <div style={{ fontSize:13, color:S.muted, lineHeight:1.7, whiteSpace:"pre-wrap",
                background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"12px 14px",
                border:"1px solid rgba(255,255,255,0.06)" }}>
                {prospect.notes}
              </div>
            </div>
          </>
        )}

        <div style={{ height:1, background:S.line, margin:"0 24px" }} />

        {/* Change status manually */}
        <div style={{ padding:"20px 24px" }}>
          <div style={{ fontSize:11, fontWeight:800, color:S.faint, textTransform:"uppercase",
            letterSpacing:"0.6px", marginBottom:12 }}>Update Status</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {ALL_STATUSES.map(s => {
              const m = STATUS_META[s];
              const active = (prospect.status ?? "new") === s;
              return (
                <button key={s} className="btn-smooth"
                  onClick={() => onStatusChange(prospect.id, s as StatusType)}
                  style={{ padding:"6px 14px", borderRadius:99, fontSize:11, fontWeight:700,
                    background: active ? `${m.color}22` : "rgba(255,255,255,0.04)",
                    border:`1px solid ${active ? m.color+"66" : S.line}`,
                    color: active ? m.color : S.faint, cursor:"pointer" }}>
                  {m.emoji} {m.label}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize:11, color:S.faint, marginTop:10, lineHeight:1.6 }}>
            Status auto-updates when you call or send emails. Use buttons above to override manually.
          </div>
        </div>

        {/* Timestamps */}
        {(prospect.created_at || prospect.updated_at) && (
          <div style={{ padding:"0 24px 28px", marginTop:"auto" }}>
            <div style={{ height:1, background:S.line, marginBottom:16 }} />
            {prospect.created_at && (
              <div style={{ fontSize:11, color:S.faint }}>
                Added: {new Date(prospect.created_at).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"})}
              </div>
            )}
            {prospect.updated_at && (
              <div style={{ fontSize:11, color:S.faint, marginTop:4 }}>
                Last updated: {new Date(prospect.updated_at).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"})}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProspectsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const {
    prospects, loading: dataLoading,
    addProspect, updateProspect, deleteProspect, bulkAddProspects,
  } = useProspects(user?.uid);

  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("all");
  const [showAdd,     setShowAdd]     = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors,  setFormErrors]  = useState<Record<string,string>>({});
  const [form, setForm] = useState({
    name:"", email:"", role:"", company:"", industry:"", company_size:"", notes:"", phone:"",
  });
  const [toast,         setToast]         = useState<Toast>({ msg:"", type:"success" });
  const [confirmDel,    setConfirmDel]    = useState<ConfirmDel>(null);
  const [csvLoading,    setCsvLoading]    = useState(false);
  const [statusLoading, setStatusLoading] = useState<Record<string,boolean>>({});
  const [drawer,        setDrawer]        = useState<Prospect | null>(null);

  // AI email
  const abortRef       = useRef<AbortController | null>(null);
  const [aiModal,      setAiModal]      = useState<Prospect | null>(null);
  const [aiSubject,    setAiSubject]    = useState("");
  const [aiBody,       setAiBody]       = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [sending,      setSending]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Helpers
  const showToast = useCallback((msg: string, type: Toast["type"] = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"success" }), 4000);
  }, []);

  // ── Keep drawer in sync when prospects array updates (e.g. after any PATCH)
  useEffect(() => {
    if (!drawer) return;
    const fresh = prospects.find(p => p.id === drawer.id);
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(drawer)) setDrawer(fresh);
  }, [prospects]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Status update (with auto-sync to open drawer)
  const handleStatus = useCallback(async (id: string, newStatus: StatusType) => {
    setStatusLoading(p => ({ ...p, [id]: true }));
    try {
      await updateProspect(id, { status: newStatus });
      setDrawer(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
    } catch (err: any) {
      showToast(err?.message ?? "Status update failed", "error");
    } finally {
      setStatusLoading(p => ({ ...p, [id]: false }));
    }
  }, [updateProspect, showToast]);

  // ── Add prospect
  const handleAdd = async () => {
    const errs: Record<string,string> = {};
    if (!form.name.trim())              errs.name  = "Name is required";
    if (!form.email.trim())             errs.email = "Email is required";
    else if (!isValidEmail(form.email)) errs.email = "Enter a valid email address";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setFormLoading(true);
    try {
      const code = form.name.charCodeAt(0);
      const av   = AVATARS[isNaN(code) ? 0 : code % AVATARS.length] ?? AVATARS[0];
      await addProspect({
        ...form,
        name:         form.name.trim(),
        email:        form.email.trim().toLowerCase(),
        ai_score:     50,
        buying_intent: "medium" as const,
        status:        "new",
        avatar_init:  initials(form.name.trim()),
        avatar_bg:    av.bg,
        avatar_color: av.color,
      });
      setForm({ name:"", email:"", role:"", company:"", industry:"", company_size:"", notes:"", phone:"" });
      setShowAdd(false);
      showToast(`✓ ${form.name.trim()} added`);
    } catch (err: any) {
      showToast(err?.message ?? "Failed to add", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete
  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await deleteProspect(confirmDel.id);
      showToast(`${confirmDel.name} deleted`);
      if (drawer?.id === confirmDel.id) setDrawer(null);
    } catch (err: any) {
      showToast(err?.message ?? "Delete failed", "error");
    } finally { setConfirmDel(null); }
  };

  // ── CSV
  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCsvLoading(true);
    try {
      const text  = await file.text();
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) { showToast("CSV is empty", "error"); return; }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g,"").replace(/\s+/g,"_"));
      const rows = lines.slice(1).map(line => {
        const vals: string[] = []; let cur = "", inQ = false;
        for (const ch of line) {
          if (ch==='"'){ inQ=!inQ; continue; }
          if (ch===','&&!inQ){ vals.push(cur.trim()); cur=""; continue; }
          cur+=ch;
        }
        vals.push(cur.trim());
        const row: any = {};
        headers.forEach((h,i) => { row[h] = (vals[i]??"").replace(/['"]/g,""); });
        row.status = "new";
        return row;
      }).filter(r => r.email || r.name);
      await bulkAddProspects(rows);
      showToast(`✓ ${rows.length} prospects imported`);
    } catch (err: any) {
      showToast(err?.message ?? "Import failed", "error");
    } finally { setCsvLoading(false); e.target.value=""; }
  };

  // ── AI email
  const openAiModal = async (prospect: Prospect) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    setAiModal(prospect); setAiBody(""); setAiSubject(""); setAiGenerating(true);
    try {
      const [sRes, bRes] = await Promise.all([
        fetch("/api/ai", { method:"POST", signal, headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ type:"subjectLine", prompt:`Write 3 subject lines for a cold email to ${prospect.name??""}, ${prospect.role??""} at ${prospect.company??""} (${prospect.industry??""}).` }) }),
        fetch("/api/ai", { method:"POST", signal, headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ type:"emailWriter", prompt:`Write a cold email to ${prospect.name??""}, ${prospect.role??""} at ${prospect.company??""} in ${prospect.industry??""} industry. Notes: ${prospect.notes||"none"}.` }) }),
      ]);
      if (signal.aborted) return;
      const [sData, bData] = await Promise.all([sRes.json(), bRes.json()]);
      if (bData.error || sData.error) {
        showToast(bData.upgrade ? "⚠️ Daily AI limit reached" : (bData.error ?? sData.error), "warning");
        setAiModal(null); return;
      }
      const lines = (sData.result??"").split("\n").filter((l:string) => l.trim());
      setAiSubject(replaceVars((lines[0]?.replace(/^[0-9]+\.\s*/,"").trim()) ?? `Quick note for ${prospect.name??"you"}`, prospect));
      setAiBody(replaceVars(bData.result??"", prospect));
    } catch (err: any) {
      if (err?.name==="AbortError") return;
      showToast(err?.message??"Generation failed","error"); setAiModal(null);
    } finally { if (!abortRef.current?.signal.aborted) setAiGenerating(false); }
  };

  const closeAiModal = () => { abortRef.current?.abort(); setAiModal(null); setAiGenerating(false); };

  const sendEmail = async () => {
    if (!aiModal || !aiBody.trim() || !aiSubject.trim()) return;
    setSending(true);
    try {
      const res  = await fetch("/api/send-email", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          userId: user?.uid,
          to: aiModal.email, toName: aiModal.name,
          subject: aiSubject, emailBody: aiBody,
          prospectId: aiModal.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to send", "error");
      } else {
        showToast(`✓ Email sent to ${aiModal.email}`);
        // Auto-status: email sent → contacted (if still new)
        const next = autoStatus(aiModal.status, "email_sent");
        if (next !== aiModal.status) await handleStatus(aiModal.id, next);
        closeAiModal();
      }
    } catch (err: any) {
      showToast(err?.message??"Send failed","error");
    } finally { setSending(false); }
  };

  // ── Handle call click (auto-status + Supabase log)
  const handleCallClick = useCallback(async (p: Prospect) => {
    // 1. Auto-update status
    const next = autoStatus(p.status, "call");
    if (next !== p.status) {
      await handleStatus(p.id, next);
    }
    showToast(`📞 Calling ${p.name}…`);

    // 2. Log call to Supabase (fire-and-forget; don't block the tel: link)
    if (user?.uid) {
      fetch("/api/call-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:       user.uid,
          prospectId:   p.id,
          prospectName: p.name,
          phone:        p.phone ?? null,
          status:       "attempted",
        }),
      }).catch(() => {}); // silent — call still works even if log fails
    }
  }, [handleStatus, showToast, user]);

  // ── Filtering
  const filtered = prospects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || (p.name?.toLowerCase().includes(q)) || (p.company?.toLowerCase().includes(q)) || (p.email?.toLowerCase().includes(q));
    const matchFilter = filter==="all" ? true : filter==="high" ? p.buying_intent==="high" : p.status===filter;
    return matchSearch && matchFilter;
  });

  const toastColor = toast.type==="error" ? S.red : toast.type==="warning" ? S.amber : S.accent;

  if (authLoading || dataLoading) return <LoadingScreen text="Loading platform data..." />;
  if (!user) return <LoadingScreen text="Redirecting..." />;

  return (
    <div style={{ background:S.bg, minHeight:"100vh", fontFamily:"Inter,sans-serif" }}>
      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes fadeIn    { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn   { from { transform:translateX(100%); } to { transform:translateX(0); } }
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.7); }
          60%  { box-shadow: 0 0 0 7px rgba(52,211,153,0); }
          100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }
        .btn-smooth { transition: opacity 0.15s ease, transform 0.1s ease; cursor:pointer; }
        .btn-smooth:hover:not(:disabled) { opacity:0.85; transform:translateY(-1px); }
        .btn-smooth:active:not(:disabled){ transform:translateY(0px); }
        .btn-smooth:disabled { opacity:0.4; cursor:not-allowed; }
        .row-hover { transition: background 0.12s ease; cursor:pointer; }
        .row-hover:hover { background: rgba(255,255,255,0.025) !important; }
        .input-focus { transition: border-color 0.15s ease; }
        .input-focus:focus { outline:none; border-color:rgba(200,255,0,0.45) !important; }
        @media (max-width:768px) { .prospects-main { margin-left:0 !important; padding:16px !important; } }
        .input-focus:focus { border-color: rgba(200,255,0,0.4) !important; outline:none; }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
          background:"#0d1018", border:`1px solid ${toastColor}55`, borderRadius:12,
          padding:"12px 22px", fontSize:13, fontWeight:700, color:toastColor,
          zIndex:500, animation:"fadeIn 0.2s ease", whiteSpace:"nowrap",
          boxShadow:`0 4px 24px ${toastColor}22` }}>
          {toast.msg}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"grid",
          placeItems:"center", zIndex:400 }}>
          <div style={{ background:"#0d1018", border:"1px solid rgba(248,113,113,0.3)",
            borderRadius:16, padding:28, maxWidth:380, width:"90%", animation:"fadeIn 0.18s ease" }}>
            <div style={{ fontSize:16, fontWeight:800, color:S.text, marginBottom:8 }}>Delete Prospect?</div>
            <div style={{ fontSize:13, color:S.muted, marginBottom:24 }}>
              <span style={{ color:S.text, fontWeight:700 }}>{confirmDel.name}</span> will be permanently deleted.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn-smooth" onClick={handleDelete}
                style={{ flex:1, padding:"10px", borderRadius:10, background:"rgba(248,113,113,0.12)",
                  border:"1px solid rgba(248,113,113,0.35)", color:S.red, fontWeight:700, fontSize:13 }}>
                Delete
              </button>
              <button className="btn-smooth" onClick={() => setConfirmDel(null)}
                style={{ flex:1, padding:"10px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                  border:`1px solid ${S.line}`, color:S.muted, fontWeight:600, fontSize:13 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Email modal */}
      {aiModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"grid",
          placeItems:"center", zIndex:200, padding:20 }}>
          <div style={{ background:"#0d1018", border:"1px solid rgba(200,255,0,0.2)", borderRadius:18,
            padding:28, width:"100%", maxWidth:600, animation:"fadeIn 0.2s ease" }}>
            {aiGenerating ? (
              <div style={{ textAlign:"center", padding:"44px 0" }}>
                <div style={{ width:40, height:40, border:"3px solid rgba(200,255,0,0.15)",
                  borderTopColor:S.accent, borderRadius:"50%",
                  animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
                <div style={{ fontSize:14, fontWeight:700, color:S.text }}>Writing email for {aiModal.name ?? "prospect"}…</div>
                <div style={{ fontSize:12, color:S.faint, marginTop:6 }}>AI is crafting a personalised cold email</div>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color:S.text, marginBottom:4 }}>Send Real Email</div>
                    <div style={{ fontSize:12, color:S.faint }}>To: <span style={{ color:S.accent, fontWeight:700 }}>{aiModal.email}</span></div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="btn-smooth" onClick={() => openAiModal(aiModal)}
                      style={{ padding:"6px 12px", borderRadius:8, background:"rgba(200,255,0,0.07)",
                        border:"1px solid rgba(200,255,0,0.2)", color:S.accent, fontSize:11, fontWeight:700 }}>
                      ↺ Regenerate
                    </button>
                    <button className="btn-smooth" onClick={closeAiModal}
                      style={{ background:"none", border:"none", color:S.faint, fontSize:20, cursor:"pointer" }}>×</button>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:S.faint, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Subject</label>
                  <input className="input-focus" value={aiSubject} onChange={e => setAiSubject(e.target.value)}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)", color:S.text, fontSize:13 }} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:S.faint, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Body</label>
                  <textarea className="input-focus" value={aiBody} onChange={e => setAiBody(e.target.value)} rows={9}
                    style={{ width:"100%", padding:"12px 14px", borderRadius:10, background:"rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.08)", color:S.text, fontSize:13, resize:"vertical", lineHeight:1.65 }} />
                </div>
                <button className="btn-smooth" onClick={sendEmail} disabled={sending || !aiBody.trim() || !aiSubject.trim()}
                  style={{ width:"100%", padding:"12px", borderRadius:10, background:S.accent,
                    border:"none", color:"#050505", fontWeight:800, fontSize:13 }}>
                  {sending ? "Sending…" : `✉ Send to ${aiModal.email}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Prospect detail drawer */}
      {drawer && (
        <ProspectDrawer
          prospect={drawer}
          onClose={() => setDrawer(null)}
          onCall={handleCallClick}
          onEmail={p => { setDrawer(null); openAiModal(p); }}
          onStatusChange={handleStatus}
        />
      )}

      <input type="file" ref={fileRef} accept=".csv" onChange={handleCSV} style={{ display:"none" }} />
      <Sidebar active="prospects" user={user} onLogout={handleLogout} />

      <div className="prospects-main" style={{ marginLeft:240, padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:S.text, marginBottom:5 }}>Prospects</h1>
            <p style={{ color:S.muted, fontSize:13 }}>
              {prospects.length} total · AI email · Live call · Auto-status tracking
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-smooth" onClick={() => fileRef.current?.click()} disabled={csvLoading}
              style={{ padding:"9px 16px", borderRadius:10, background:"rgba(255,255,255,0.06)",
                border:`1px solid ${S.line}`, color:S.muted, fontSize:13, fontWeight:600 }}>
              {csvLoading ? "Importing…" : "↑ Import CSV"}
            </button>
            <button className="btn-smooth" onClick={() => { setShowAdd(v=>!v); setFormErrors({}); }}
              style={{ padding:"9px 20px", borderRadius:10, background:S.accent,
                border:"none", color:"#050505", fontWeight:800, fontSize:13 }}>
              {showAdd ? "✕ Cancel" : "+ Add Prospect"}
            </button>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ background:S.panel, border:"1px solid rgba(200,255,0,0.18)", borderRadius:16,
            padding:24, marginBottom:20, animation:"fadeIn 0.18s ease" }}>
            <div style={{ fontSize:14, fontWeight:800, color:S.text, marginBottom:18 }}>Add New Prospect</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:14 }}>
              {[
                { key:"name",     label:"Full Name *",  placeholder:"Sarah Chen",        type:"text"  },
                { key:"email",    label:"Email *",       placeholder:"sarah@company.com", type:"email" },
                { key:"phone",    label:"Phone",         placeholder:"+1 234 567 8900",   type:"tel"   },
                { key:"role",     label:"Job Title",     placeholder:"Head of Sales",     type:"text"  },
                { key:"company",  label:"Company",       placeholder:"Acme Inc.",         type:"text"  },
                { key:"industry", label:"Industry",      placeholder:"SaaS",              type:"text"  },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:11, fontWeight:700, display:"block", marginBottom:5,
                    textTransform:"uppercase", letterSpacing:"0.4px",
                    color: formErrors[f.key] ? S.red : S.faint }}>
                    {f.label}
                  </label>
                  <input className="input-focus" type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => { setForm(p=>({...p,[f.key]:e.target.value})); if(formErrors[f.key]) setFormErrors(p=>{const n={...p};delete n[f.key];return n;}); }}
                    placeholder={f.placeholder}
                    style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                      background:"rgba(255,255,255,0.05)",
                      border:`1px solid ${formErrors[f.key]?"rgba(248,113,113,0.5)":S.line}`,
                      color:S.text, fontSize:13 }}
                  />
                  {formErrors[f.key] && <div style={{ fontSize:11, color:S.red, marginTop:4 }}>{formErrors[f.key]}</div>}
                </div>
              ))}
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:11, fontWeight:700, color:S.faint, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.4px" }}>Notes</label>
              <textarea className="input-focus" value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))}
                placeholder="Any context about this prospect…" rows={2}
                style={{ width:"100%", padding:"10px 12px", borderRadius:9, background:"rgba(255,255,255,0.05)",
                  border:`1px solid ${S.line}`, color:S.text, fontSize:13, resize:"vertical" }} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn-smooth" onClick={handleAdd} disabled={formLoading}
                style={{ padding:"11px 28px", borderRadius:10, background:S.accent,
                  border:"none", color:"#050505", fontSize:13, fontWeight:800 }}>
                {formLoading ? "Saving…" : "Save Prospect"}
              </button>
              <button className="btn-smooth" onClick={() => { setShowAdd(false); setFormErrors({}); }}
                style={{ padding:"11px 18px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                  border:`1px solid ${S.line}`, color:S.muted, fontSize:13 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div style={{ display:"flex", gap:12, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 200px", maxWidth:320 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
              color:S.faint, fontSize:14, pointerEvents:"none" }}>🔍</span>
            <input className="input-focus" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search prospects, companies…"
              style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:10,
                background:"rgba(255,255,255,0.05)", border:`1px solid ${S.line}`,
                color:S.text, fontSize:13 }} />
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {FILTER_TABS.map(tab => (
              <button key={tab} className="btn-smooth" onClick={() => setFilter(tab)}
                style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:700,
                  background: filter===tab ? `${S.accent}18` : "rgba(255,255,255,0.04)",
                  border:`1px solid ${filter===tab ? S.accent+"55" : S.line}`,
                  color: filter===tab ? S.accent : S.muted, textTransform:"capitalize" }}>
                {tab==="high" ? "🔥 High Intent" : tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
          </div>
          {filtered.length !== prospects.length && (
            <div style={{ fontSize:12, color:S.faint, marginLeft:"auto" }}>
              {filtered.length} of {prospects.length}
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ background:S.panel, border:`1px solid ${S.line}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1.4fr 140px 150px 170px",
            padding:"11px 20px", borderBottom:`1px solid ${S.line}`, background:"rgba(255,255,255,0.02)" }}>
            {["Prospect","Company","Live Call","Status","Actions"].map(h => (
              <div key={h} style={{ fontSize:10, fontWeight:800, color:S.faint, textTransform:"uppercase", letterSpacing:"0.6px" }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            prospects.length === 0 ? (
              /* ── True empty state: brand new user, no prospects at all ── */
              <div style={{ padding:"64px 32px", textAlign:"center" }}>
                <div style={{ width:72, height:72, borderRadius:20,
                  background:"linear-gradient(140deg,rgba(200,255,0,0.12),rgba(200,255,0,0.04))",
                  border:"1px solid rgba(200,255,0,0.18)",
                  display:"grid", placeItems:"center", margin:"0 auto 20px", fontSize:28 }}>
                  🎯
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:S.text, marginBottom:8 }}>
                  No prospects yet
                </div>
                <div style={{ fontSize:13, color:S.muted, marginBottom:24, maxWidth:340, margin:"0 auto 24px" }}>
                  Add your first prospect manually or import a CSV file to get started. Every great pipeline starts somewhere.
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <button className="btn-smooth" onClick={() => setShowAdd(true)}
                    style={{ padding:"11px 24px", borderRadius:10, background:S.accent,
                      border:"none", color:"#050505", fontWeight:800, fontSize:13 }}>
                    + Add First Prospect
                  </button>
                  <button className="btn-smooth" onClick={() => fileRef.current?.click()}
                    style={{ padding:"11px 20px", borderRadius:10, background:"rgba(255,255,255,0.06)",
                      border:`1px solid ${S.line}`, color:S.muted, fontWeight:700, fontSize:13 }}>
                    📥 Import CSV
                  </button>
                </div>
              </div>
            ) : (
              /* ── Search/filter returned nothing ── */
              <div style={{ padding:52, textAlign:"center", color:S.faint }}>
                <div style={{ fontSize:28, marginBottom:10 }}>🔍</div>
                <div style={{ fontSize:14, fontWeight:600, color:S.muted, marginBottom:6 }}>No prospects found</div>
                <div style={{ fontSize:12 }}>
                  {search ? `No results for "${search}" — try a different term` : "No prospects match this filter"}
                </div>
                {(search || filter !== "all") && (
                  <button className="btn-smooth" onClick={() => { setSearch(""); setFilter("all"); }}
                    style={{ marginTop:14, padding:"7px 16px", borderRadius:8,
                      background:"rgba(255,255,255,0.05)", border:`1px solid ${S.line}`,
                      color:S.muted, fontSize:12, fontWeight:600 }}>
                    Clear filters
                  </button>
                )}
              </div>
            )
          ) : filtered.map((p, i) => {
            const sm = STATUS_META[p.status ?? "new"] ?? STATUS_META.new;
            return (
              <div key={p.id} className="row-hover"
                style={{ display:"grid", gridTemplateColumns:"2fr 1.4fr 140px 150px 170px",
                  padding:"13px 20px", alignItems:"center",
                  borderBottom: i < filtered.length-1 ? `1px solid ${S.line}` : "none" }}>

                {/* Prospect — click to open drawer */}
                <div style={{ display:"flex", alignItems:"center", gap:11 }}
                  onClick={() => setDrawer(p)}>
                  <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0,
                    background:p.avatar_bg||"#1a2035", color:p.avatar_color||S.accent,
                    display:"grid", placeItems:"center", fontSize:11, fontWeight:800 }}>
                    {p.avatar_init || initials(p.name)}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:S.text, marginBottom:2 }}>{p.name || "—"}</div>
                    <div style={{ fontSize:11, color:S.accent, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.email || "—"}</div>
                    {p.role && <div style={{ fontSize:11, color:S.faint }}>{p.role}</div>}
                  </div>
                </div>

                {/* Company */}
                <div onClick={() => setDrawer(p)}>
                  <div style={{ fontSize:13, color:S.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.company || <span style={{ color:S.faint }}>—</span>}</div>
                  {p.industry && <div style={{ fontSize:11, color:S.faint }}>{p.industry}</div>}
                </div>

                {/* Live call button */}
                <div>
                  {p.phone ? (
                    <a href={`tel:${p.phone}`}
                      onClick={e => { e.stopPropagation(); handleCallClick(p); }}
                      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 13px",
                        borderRadius:8, textDecoration:"none",
                        background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)",
                        color:S.green, fontSize:11, fontWeight:800, transition:"background 0.15s ease" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="rgba(52,211,153,0.2)")}
                      onMouseLeave={e=>(e.currentTarget.style.background="rgba(52,211,153,0.1)")}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:S.green,
                        animation:"livePulse 1.8s infinite", flexShrink:0 }} />
                      📞 Call
                    </a>
                  ) : (
                    <span style={{ fontSize:11, color:S.faint, fontStyle:"italic" }}>No phone</span>
                  )}
                </div>

                {/* Status pill */}
                <div onClick={() => setDrawer(p)}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5,
                    fontSize:11, fontWeight:700, padding:"5px 10px", borderRadius:99,
                    background:`${sm.color}18`, color:sm.color, border:`1px solid ${sm.color}44`,
                    opacity: statusLoading[p.id] ? 0.5 : 1, transition:"opacity 0.15s ease",
                    whiteSpace:"nowrap" }}>
                    {sm.emoji} {sm.label}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:6 }}>
                  <button className="btn-smooth" onClick={e => { e.stopPropagation(); openAiModal(p); }}
                    style={{ padding:"6px 12px", borderRadius:8, background:"rgba(200,255,0,0.08)",
                      border:"1px solid rgba(200,255,0,0.22)", color:S.accent, fontSize:11, fontWeight:700 }}>
                    ✉ Email
                  </button>
                  <button className="btn-smooth" onClick={e => { e.stopPropagation(); setDrawer(p); }}
                    style={{ padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.05)",
                      border:`1px solid ${S.line}`, color:S.muted, fontSize:11 }}>
                    ···
                  </button>
                  <button className="btn-smooth" onClick={e => { e.stopPropagation(); setConfirmDel({id:p.id, name:p.name||"Prospect"}); }}
                    style={{ padding:"6px 10px", borderRadius:8, background:"rgba(248,113,113,0.06)",
                      border:"1px solid rgba(248,113,113,0.18)", color:S.red, fontSize:12 }}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length > 0 && (
          <div style={{ textAlign:"center", padding:"14px 0 4px", fontSize:12, color:S.faint }}>
            {filtered.length} prospect{filtered.length!==1?"s":""} · Click any row to view full details
          </div>
        )}
      </div>
    </div>
  );
}
