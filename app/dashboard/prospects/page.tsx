"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useProspects, Prospect } from "@/components/useProspects";
import LoadingScreen from "@/components/LoadingScreen";

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  bg:        "#050505",
  panel:     "#0d1018",
  panelHov:  "#131820",
  lineSoft:  "rgba(255,255,255,0.07)",
  text:      "#ffffff",           // bright white — was too dim
  muted:     "#c4c7d0",           // much brighter — was #9598a3
  faint:     "#8891a4",           // was #555a66 (unreadable)
  accent:    "#C8FF00",
  red:       "#f87171",
  green:     "#34d399",
  blue:      "#818cf8",
  amber:     "#f59e0b",
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

const STATUS_COLORS: Record<string, string> = {
  new:       S.accent,
  contacted: S.blue,
  replied:   S.green,
  meeting:   S.amber,
  closed:    "#22d3ee",
  lost:      S.red,
};

const ALL_STATUSES = ["new", "contacted", "replied", "meeting", "closed", "lost"];
const FILTER_TABS  = ["all", "new", "contacted", "replied", "meeting", "high"];

type Toast       = { msg: string; type: "success" | "error" | "warning" };
type StatusType  = "new" | "contacted" | "replied" | "meeting" | "closed" | "lost";
type ConfirmDel  = { id: string; name: string } | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProspectsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const {
    prospects, loading: dataLoading,
    addProspect, updateProspect, deleteProspect, bulkAddProspects,
  } = useProspects(user?.uid);

  // ── Search / filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ── Add form
  const [showAdd,   setShowAdd]   = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors,  setFormErrors]  = useState<Record<string,string>>({});
  const [form, setForm] = useState({
    name: "", email: "", role: "", company: "",
    industry: "", company_size: "", notes: "", phone: "",
  });

  // ── Toast
  const [toast, setToast] = useState<Toast>({ msg: "", type: "success" });

  // ── Custom confirm-delete modal
  const [confirmDel, setConfirmDel] = useState<ConfirmDel>(null);

  // ── CSV
  const fileRef    = useRef<HTMLInputElement>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  // ── Status update loading map
  const [statusLoading, setStatusLoading] = useState<Record<string,boolean>>({});

  // ── AI email modal
  const abortRef       = useRef<AbortController | null>(null);
  const [aiModal,      setAiModal]      = useState<Prospect | null>(null);
  const [aiSubject,    setAiSubject]    = useState("");
  const [aiBody,       setAiBody]       = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [sending,      setSending]      = useState(false);

  // ── Toast helper
  const showToast = useCallback((msg: string, type: Toast["type"] = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  }, []);

  // ── Add prospect ────────────────────────────────────────────────────────────
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
        avatar_init:  form.name.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
        avatar_bg:    av.bg,
        avatar_color: av.color,
      });
      setForm({ name: "", email: "", role: "", company: "", industry: "", company_size: "", notes: "", phone: "" });
      setShowAdd(false);
      showToast(`✓ ${form.name.trim()} added`);
    } catch (err: any) {
      showToast(err?.message ?? "Failed to add prospect", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = (id: string, name: string) => setConfirmDel({ id, name });
  const handleDelete  = async () => {
    if (!confirmDel) return;
    try {
      await deleteProspect(confirmDel.id);
      showToast(`${confirmDel.name} deleted`);
    } catch (err: any) {
      showToast(err?.message ?? "Delete failed", "error");
    } finally {
      setConfirmDel(null);
    }
  };

  // ── Status update ───────────────────────────────────────────────────────────
  const handleStatus = async (id: string, newStatus: StatusType) => {
    setStatusLoading(p => ({ ...p, [id]: true }));
    try {
      await updateProspect(id, { status: newStatus });
    } catch (err: any) {
      showToast(err?.message ?? "Status update failed", "error");
    } finally {
      setStatusLoading(p => ({ ...p, [id]: false }));
    }
  };

  // ── CSV import ──────────────────────────────────────────────────────────────
  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvLoading(true);
    try {
      const text    = await file.text();
      const lines   = text.split("\n").filter(Boolean);
      if (lines.length < 2) { showToast("CSV is empty or has no data rows", "error"); return; }
      const raw     = lines[0].split(",");
      const headers = raw.map((h) => h.trim().toLowerCase().replace(/['"]/g, "").replace(/\s+/g, "_"));

      const rows = lines.slice(1).map((line) => {
        // Respect quoted fields containing commas
        const vals: string[] = [];
        let cur = "", inQuote = false;
        for (const ch of line) {
          if (ch === '"') { inQuote = !inQuote; continue; }
          if (ch === "," && !inQuote) { vals.push(cur.trim()); cur = ""; continue; }
          cur += ch;
        }
        vals.push(cur.trim());
        const row: any = {};
        headers.forEach((h, i) => { row[h] = (vals[i] ?? "").replace(/['"]/g, ""); });
        row.status = "new";
        return row;
      }).filter((r) => r.email || r.name);

      await bulkAddProspects(rows);
      showToast(`✓ ${rows.length} prospects imported`);
    } catch (err: any) {
      showToast(err?.message ?? "CSV import failed", "error");
    } finally {
      setCsvLoading(false);
      e.target.value = "";
    }
  };

  // ── AI email modal ──────────────────────────────────────────────────────────
  const openAiModal = async (prospect: Prospect) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setAiModal(prospect);
    setAiBody("");
    setAiSubject("");
    setAiGenerating(true);
    try {
      const [subjectRes, bodyRes] = await Promise.all([
        fetch("/api/ai", {
          method: "POST", signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subjectLine",
            prompt: `Write 3 subject lines for a cold email to ${prospect.name ?? ""}, ${prospect.role ?? ""} at ${prospect.company ?? ""} (${prospect.industry ?? ""}).`,
          }),
        }),
        fetch("/api/ai", {
          method: "POST", signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "emailWriter",
            prompt: `Write a cold email to ${prospect.name ?? ""}, ${prospect.role ?? ""} at ${prospect.company ?? ""} in the ${prospect.industry ?? ""} industry. Notes: ${prospect.notes || "none"}.`,
          }),
        }),
      ]);

      if (signal.aborted) return;

      const [subjectData, bodyData] = await Promise.all([subjectRes.json(), bodyRes.json()]);

      if (bodyData.error || subjectData.error) {
        const msg = bodyData.error ?? subjectData.error;
        showToast(bodyData.upgrade ? "⚠️ Daily AI limit reached — upgrade your plan" : msg, "warning");
        setAiModal(null);
        return;
      }

      const lines       = (subjectData.result ?? "").split("\n").filter((l: string) => l.trim());
      const firstSubject = lines[0]?.replace(/^[0-9]+\.\s*/, "").trim() ?? `Quick note for ${prospect.name ?? "you"}`;

      setAiSubject(replaceVars(firstSubject, prospect));
      setAiBody(replaceVars(bodyData.result ?? "", prospect));
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      showToast(err?.message ?? "Generation failed", "error");
      setAiModal(null);
    } finally {
      if (!signal.aborted) setAiGenerating(false);
    }
  };

  const closeAiModal = () => {
    abortRef.current?.abort();
    setAiModal(null);
    setAiGenerating(false);
  };

  const sendEmail = async () => {
    if (!aiModal || !aiBody.trim() || !aiSubject.trim() || !user?.uid) return;
    setSending(true);
    try {
      const res  = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: aiModal.email, toName: aiModal.name,
          subject: aiSubject, emailBody: aiBody, prospectId: aiModal.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to send", "error");
      } else {
        showToast(`✓ Email sent to ${aiModal.email}`);
        await handleStatus(aiModal.id, "contacted");
        closeAiModal();
      }
    } catch (err: any) {
      showToast(err?.message ?? "Send failed", "error");
    } finally {
      setSending(false);
    }
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = prospects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || (p.name?.toLowerCase().includes(q))
      || (p.company?.toLowerCase().includes(q))
      || (p.email?.toLowerCase().includes(q));
    const matchFilter =
      filter === "all"  ? true :
      filter === "high" ? p.buying_intent === "high" :
      p.status === filter;
    return matchSearch && matchFilter;
  });

  const toastColor =
    toast.type === "error"   ? S.red  :
    toast.type === "warning" ? S.amber : S.accent;

  // ─────────────────────────────────────────────────────────────────────────
  if (authLoading || dataLoading) return <LoadingScreen text="Loading platform data..." />;
  if (!user) return <LoadingScreen text="Redirecting..." />;

  return (
    <div style={{ background: S.bg, minHeight: "100vh", fontFamily: "Inter,sans-serif" }}>

      {/* ── Keyframes for spinner ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .btn-smooth {
          transition: opacity 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
          cursor: pointer;
        }
        .btn-smooth:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn-smooth:active:not(:disabled) { transform: translateY(0); }
        .btn-smooth:disabled { opacity: 0.45; cursor: not-allowed; }
        .row-hover:hover { background: rgba(255,255,255,0.025); }
        .input-focus { transition: border-color 0.15s ease; }
        .input-focus:focus { border-color: rgba(200,255,0,0.4) !important; outline: none; }
        .status-select { transition: border-color 0.15s ease; }
        .status-select:focus { outline: none; }
      `}</style>

      {/* ── Toast ── */}
      {toast.msg && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#0d1018", border: `1px solid ${toastColor}55`,
          borderRadius: 12, padding: "12px 22px",
          fontSize: 13, fontWeight: 700, color: toastColor, zIndex: 400,
          animation: "fadeIn 0.2s ease", whiteSpace: "nowrap",
          boxShadow: `0 4px 24px ${toastColor}22`,
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 300 }}>
          <div style={{ background: "#0d1018", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", animation: "fadeIn 0.18s ease" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: S.text, marginBottom: 8 }}>Delete Prospect?</div>
            <div style={{ fontSize: 13, color: S.muted, marginBottom: 24 }}>
              <span style={{ color: S.text, fontWeight: 700 }}>{confirmDel.name}</span> will be permanently removed. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-smooth" onClick={handleDelete}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.35)", color: S.red, fontWeight: 700, fontSize: 13 }}>
                Delete
              </button>
              <button className="btn-smooth" onClick={() => setConfirmDel(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: S.muted, fontWeight: 600, fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Email Modal ── */}
      {aiModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#0d1018", border: "1px solid rgba(200,255,0,0.2)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 600, animation: "fadeIn 0.2s ease" }}>
            {aiGenerating ? (
              <div style={{ textAlign: "center", padding: "44px 0" }}>
                <div style={{ width: 40, height: 40, border: "3px solid rgba(200,255,0,0.15)", borderTopColor: S.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>Writing email for {aiModal.name ?? "prospect"}…</div>
                <div style={{ fontSize: 12, color: S.faint, marginTop: 6 }}>AI is crafting a personalised cold email</div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: S.text, marginBottom: 4 }}>Send Real Email</div>
                    <div style={{ fontSize: 12, color: S.faint }}>
                      To: <span style={{ color: S.accent, fontWeight: 700 }}>{aiModal.email}</span>
                      {aiModal.name && <span style={{ color: S.faint }}> · {aiModal.name}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="btn-smooth" onClick={() => openAiModal(aiModal)}
                      style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(200,255,0,0.07)", border: "1px solid rgba(200,255,0,0.2)", color: S.accent, fontSize: 11, fontWeight: 700 }}>
                      ↺ Regenerate
                    </button>
                    <button className="btn-smooth" onClick={closeAiModal}
                      style={{ background: "none", border: "none", color: S.faint, fontSize: 20, lineHeight: 1, padding: "2px 4px" }}>×</button>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.faint, display: "block", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" }}>Subject</label>
                  <input className="input-focus" value={aiSubject} onChange={e => setAiSubject(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: S.text, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.faint, display: "block", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" }}>Email Body</label>
                  <textarea className="input-focus" value={aiBody} onChange={e => setAiBody(e.target.value)} rows={9}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: S.text, fontSize: 13, resize: "vertical", lineHeight: 1.6 }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-smooth" onClick={sendEmail} disabled={sending || !aiBody.trim() || !aiSubject.trim()}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, background: S.accent, border: "none", color: "#050505", fontWeight: 800, fontSize: 13 }}>
                    {sending ? "Sending…" : `✉ Send to ${aiModal.email}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Hidden file input ── */}
      <input type="file" ref={fileRef} accept=".csv" onChange={handleCSV} style={{ display: "none" }} />

      <Sidebar active="prospects" user={user} onLogout={handleLogout} />

      <div style={{ marginLeft: 240, padding: "28px 32px" }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: S.text, marginBottom: 5 }}>Prospects</h1>
            <p style={{ color: S.muted, fontSize: 13 }}>
              {prospects.length} total · AI email · Direct call · Auto status tracking
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-smooth" onClick={() => fileRef.current?.click()} disabled={csvLoading}
              style={{ padding: "9px 16px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: `1px solid ${S.lineSoft}`, color: S.muted, fontSize: 13, fontWeight: 600 }}>
              {csvLoading ? "Importing…" : "↑ Import CSV"}
            </button>
            <button className="btn-smooth" onClick={() => { setShowAdd(v => !v); setFormErrors({}); }}
              style={{ padding: "9px 20px", borderRadius: 10, background: S.accent, border: "none", color: "#050505", fontWeight: 800, fontSize: 13 }}>
              {showAdd ? "✕ Cancel" : "+ Add Prospect"}
            </button>
          </div>
        </div>

        {/* ── Add form ── */}
        {showAdd && (
          <div style={{ background: S.panel, border: "1px solid rgba(200,255,0,0.18)", borderRadius: 16, padding: 24, marginBottom: 20, animation: "fadeIn 0.18s ease" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: S.text, marginBottom: 18 }}>Add New Prospect</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>
              {[
                { key: "name",     label: "Full Name *",    placeholder: "Sarah Chen",        type: "text"  },
                { key: "email",    label: "Email *",         placeholder: "sarah@company.com", type: "email" },
                { key: "phone",    label: "Phone Number",    placeholder: "+1 234 567 8900",   type: "tel"   },
                { key: "role",     label: "Job Title",       placeholder: "Head of Sales",     type: "text"  },
                { key: "company",  label: "Company",         placeholder: "Acme Inc.",         type: "text"  },
                { key: "industry", label: "Industry",        placeholder: "SaaS",              type: "text"  },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: formErrors[f.key] ? S.red : S.faint, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {f.label}
                  </label>
                  <input
                    className="input-focus"
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => {
                      setForm(p => ({ ...p, [f.key]: e.target.value }));
                      if (formErrors[f.key]) setFormErrors(p => { const n = { ...p }; delete n[f.key]; return n; });
                    }}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 9,
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${formErrors[f.key] ? "rgba(248,113,113,0.5)" : S.lineSoft}`,
                      color: S.text, fontSize: 13,
                    }}
                  />
                  {formErrors[f.key] && (
                    <div style={{ fontSize: 11, color: S.red, marginTop: 4 }}>{formErrors[f.key]}</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.faint, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Notes</label>
              <textarea
                className="input-focus"
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Any context about this prospect…"
                rows={2}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: `1px solid ${S.lineSoft}`, color: S.text, fontSize: 13, resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-smooth" onClick={handleAdd} disabled={formLoading}
                style={{ padding: "11px 28px", borderRadius: 10, background: S.accent, border: "none", color: "#050505", fontSize: 13, fontWeight: 800 }}>
                {formLoading ? "Saving…" : "Save Prospect"}
              </button>
              <button className="btn-smooth" onClick={() => { setShowAdd(false); setFormErrors({}); }}
                style={{ padding: "11px 18px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${S.lineSoft}`, color: S.muted, fontSize: 13, fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: S.faint, fontSize: 14, pointerEvents: "none" }}>🔍</span>
            <input
              className="input-focus"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search prospects, companies…"
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${S.lineSoft}`, color: S.text, fontSize: 13 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTER_TABS.map(tab => (
              <button key={tab} className="btn-smooth" onClick={() => setFilter(tab)}
                style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  background: filter === tab ? `${S.accent}18` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${filter === tab ? `${S.accent}55` : S.lineSoft}`,
                  color: filter === tab ? S.accent : S.muted,
                  textTransform: "capitalize",
                }}>
                {tab === "high" ? "🔥 High Intent" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {filtered.length !== prospects.length && (
            <div style={{ fontSize: 12, color: S.faint, marginLeft: "auto" }}>
              {filtered.length} of {prospects.length}
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{ background: S.panel, border: `1px solid ${S.lineSoft}`, borderRadius: 16, overflow: "hidden" }}>

          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 130px 150px 170px", padding: "11px 20px", borderBottom: `1px solid ${S.lineSoft}`, background: "rgba(255,255,255,0.02)" }}>
            {["Prospect", "Company", "Direct Call", "Status", "Actions"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 800, color: S.faint, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "52px", textAlign: "center", color: S.faint }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: S.muted, marginBottom: 6 }}>No prospects found</div>
              <div style={{ fontSize: 12 }}>{search ? "Try a different search" : "Add your first prospect above"}</div>
            </div>
          ) : (
            filtered.map((p, i) => (
              <div key={p.id} className="row-hover"
                style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 130px 150px 170px", padding: "13px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${S.lineSoft}` : "none", alignItems: "center", transition: "background 0.12s ease" }}>

                {/* Prospect info */}
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.avatar_bg || "#1a2035", color: p.avatar_color || S.accent, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                    {p.avatar_init || "P"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 2 }}>{p.name || "—"}</div>
                    <div style={{ fontSize: 11, color: S.accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email || "—"}</div>
                    {p.role && <div style={{ fontSize: 11, color: S.faint }}>{p.role}</div>}
                  </div>
                </div>

                {/* Company */}
                <div style={{ fontSize: 13, color: S.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.company || <span style={{ color: S.faint }}>—</span>}
                  {p.industry && <div style={{ fontSize: 11, color: S.faint }}>{p.industry}</div>}
                </div>

                {/* Direct Call */}
                <div>
                  {p.phone ? (
                    <a href={`tel:${p.phone}`}
                      onClick={() => handleStatus(p.id, "contacted")}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: S.green, fontSize: 11, fontWeight: 700, textDecoration: "none", transition: "background 0.15s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(52,211,153,0.18)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(52,211,153,0.1)")}>
                      📞 Call
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: S.faint, fontStyle: "italic" }}>No phone</span>
                  )}
                </div>

                {/* Status dropdown */}
                <div>
                  <select
                    className="status-select"
                    value={p.status || "new"}
                    disabled={statusLoading[p.id]}
                    onChange={e => handleStatus(p.id, e.target.value as StatusType)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "5px 9px", borderRadius: 8,
                      border: `1px solid ${STATUS_COLORS[p.status ?? "new"]}55`,
                      background: `${STATUS_COLORS[p.status ?? "new"]}14`,
                      color: STATUS_COLORS[p.status ?? "new"],
                      cursor: statusLoading[p.id] ? "wait" : "pointer",
                      opacity: statusLoading[p.id] ? 0.6 : 1,
                      transition: "opacity 0.15s ease",
                    }}>
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s} style={{ background: "#0d1018", color: "#ffffff" }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-smooth" onClick={() => openAiModal(p)}
                    style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(200,255,0,0.08)", border: "1px solid rgba(200,255,0,0.22)", color: S.accent, fontSize: 11, fontWeight: 700 }}>
                    ✉ AI Email
                  </button>
                  <button className="btn-smooth" onClick={() => confirmDelete(p.id, p.name || "Prospect")}
                    style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.18)", color: S.red, fontSize: 12 }}>
                    ✕
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* ── Footer count ── */}
        {filtered.length > 0 && (
          <div style={{ textAlign: "center", padding: "14px 0 4px", fontSize: 12, color: S.faint }}>
            Showing {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
          </div>
        )}

      </div>
    </div>
  );
}
