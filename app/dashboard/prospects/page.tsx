"use client";
import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import { useProspects, Prospect } from "@/components/useProspects";
import LoadingScreen from "@/components/LoadingScreen";

const S = { 
  bg: "#050505", 
  panel: "#0d1018", 
  lineSoft: "rgba(255,255,255,0.05)", 
  text: "#f4f5f7", 
  muted: "#9598a3", 
  faint: "#555a66", 
  accent: "#C8FF00" 
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

type Toast = { msg: string; type: "success" | "error" | "warning" };
type StatusType = "new" | "contacted" | "replied" | "meeting" | "closed" | "lost";

function replaceVars(text: string, prospect: Prospect): string {
  const firstName = prospect.name?.split(" ")[0] ?? prospect.name;
  return text
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{name\}\}/g, prospect.name)
    .replace(/\{\{company\}\}/g, prospect.company ?? "")
    .replace(/\{\{role\}\}/g, prospect.role ?? "")
    .replace(/\{\{industry\}\}/g, prospect.industry ?? "")
    .replace(/\{\{sender\}\}/g, "The SalesForge Team")
    .replace(/\{\{icebreaker\}\}/g, `their work at ${prospect.company}`)
    .replace(/\{\{topic\}\}/g, "sales automation");
}

export default function ProspectsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const { prospects, loading: dataLoading, addProspect, updateProspect, deleteProspect, bulkAddProspects } = useProspects(user?.uid);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<Toast>({ msg: "", type: "success" });
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", email: "", role: "", company: "", industry: "", company_size: "", notes: "", phone: "" });

  const [aiModal, setAiModal] = useState<Prospect | null>(null);
  const [aiSubject, setAiSubject] = useState("");
  const [aiBody, setAiBody] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const showToast = (msg: string, type: Toast["type"] = "success") => {
    setToast({ msg, type }); 
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  const handleAdd = async () => {
    if (!form.name || !form.email) { showToast("Name and email required", "error"); return; }
    const av = AVATARS[form.name?.charCodeAt(0) % AVATARS.length] ?? AVATARS[0];
    try {
      await addProspect({
        ...form,
        ai_score: 50,
        buying_intent: "medium" as const,
        status: "new",
        avatar_init: form.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
        avatar_bg: av?.bg ?? "#1a2035", 
        avatar_color: av?.color ?? "#C8FF00",
      });
      setForm({ name: "", email: "", role: "", company: "", industry: "", company_size: "", notes: "", phone: "" });
      setShowAdd(false);
      showToast(`✓ ${form.name} added successfully`);
    } catch (err: any) { showToast(err.message, "error"); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await deleteProspect(id); showToast(`${name} deleted`); }
    catch (err: any) { showToast(err.message, "error"); }
  };

  const handleAutomaticStatus = async (id: string, newStatus: StatusType) => {
    try { 
      await updateProspect(id, { status: newStatus }); 
      showToast(`Status updated to: ${newStatus}`); 
    }
    catch (err: any) { showToast(err.message, "error"); }
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const rows = lines.slice(1).map((line: string) => {
        const vals = line.split(",").map((v: string) => v.trim().replace(/['"]/g, ""));
        const row: any = {};
        headers.forEach((h: string, i: number) => { row[h] = vals[i] ?? ""; });
        row.status = "new";
        return row;
      }).filter((r: any) => r.email || r.name);
      await bulkAddProspects(rows);
      showToast(`✓ ${rows.length} prospects imported`);
    } catch (err: any) { showToast(err.message, "error"); }
    e.target.value = "";
  };

  const openAiModal = async (prospect: Prospect) => {
    setAiModal(prospect);
    setAiBody(""); 
    setAiSubject("");
    setAiGenerating(true);
    try {
      const [subjectRes, bodyRes] = await Promise.all([
        fetch("/api/ai", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subjectLine",
            prompt: `Write 3 subject lines for a cold email to ${prospect.name}, ${prospect.role} at ${prospect.company} (${prospect.industry}).`,
            userId: user?.uid,
          }),
        }),
        fetch("/api/ai", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "emailWriter",
            prompt: `Write a cold email to ${prospect.name}, ${prospect.role} at ${prospect.company} in the ${prospect.industry} industry. Notes: ${prospect.notes || "none"}.`,
            userId: user?.uid,
          }),
        }),
      ]);

      const [subjectData, bodyData] = await Promise.all([subjectRes.json(), bodyRes.json()]);

      if (bodyData.error) {
        showToast(bodyData.upgrade ? "⚠️ Daily AI limit reached." : bodyData.error, "warning");
        setAiModal(null); setAiGenerating(false); return;
      }

      const subjectLines = subjectData.result?.split("\n").filter((l: string) => l.trim()) ?? [];
      const firstSubject = subjectLines[0]?.replace(/^[0-9]+\.\s*/, "").trim() ?? `Quick note for ${prospect.name}`;

      setAiSubject(replaceVars(firstSubject, prospect));
      setAiBody(replaceVars(bodyData.result ?? "", prospect));
    } catch (err: any) { 
      showToast(err.message, "error"); 
      setAiModal(null); 
    }
    setAiGenerating(false);
  };

  const sendEmail = async () => {
    if (!aiModal || !aiBody || !aiSubject || !user?.uid) return;
    setSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid, to: aiModal.email, toName: aiModal.name,
          subject: aiSubject, emailBody: aiBody, prospectId: aiModal.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to send", "error");
      } else {
        showToast(`✓ Real email sent to ${aiModal.email}!`);
        await handleAutomaticStatus(aiModal.id, "contacted");
        setAiModal(null);
      }
    } catch (err: any) { showToast(err.message, "error"); }
    setSending(false);
  };

  const filtered = prospects.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.company?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter || (filter === "high" && p.buying_intent === "high");
    return matchSearch && matchFilter;
  });

  const toastColor = toast.type === "error" ? "#f87171" : toast.type === "warning" ? "#f59e0b" : S.accent;

  if (authLoading || dataLoading) return <LoadingScreen text="Loading platform data..." />;
  if (!user) return <LoadingScreen text="Redirecting..." />;

  return (
    <div style={{ background: S.bg, minHeight: "100vh", fontFamily: "Inter,sans-serif" }}>
      {toast.msg && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#0d1018", border: `1px solid ${toastColor}44`, borderRadius: 12, padding: "12px 22px", fontSize: 13, fontWeight: 600, color: toastColor, zIndex: 300 }}>
          {toast.msg}
        </div>
      )}

      {/* AI Email Modal */}
      {aiModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#0d1018", border: "1px solid rgba(200,255,0,0.2)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 600 }}>
            {aiGenerating ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 40, height: 40, border: "3px solid rgba(200,255,0,0.2)", borderTopColor: S.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: S.text }}>Generating email for {aiModal.name}...</div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: S.text }}>Real Email Dispatch</div>
                    <div style={{ fontSize: 12, color: S.faint }}>To: <span style={{ color: S.accent }}>{aiModal.email}</span></div>
                  </div>
                  <button onClick={() => setAiModal(null)} style={{ background: "none", border: "none", color: S.faint, cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.faint, display: "block", marginBottom: 6 }}>SUBJECT</label>
                  <input value={aiSubject} onChange={e => setAiSubject(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: S.text, outline: "none" }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.faint, display: "block", marginBottom: 6 }}>BODY</label>
                  <textarea value={aiBody} onChange={e => setAiBody(e.target.value)} rows={8} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: S.text, outline: "none", resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={sendEmail} disabled={sending} style={{ flex: 1, padding: "11px", borderRadius: 10, background: S.accent, border: "none", color: "#050505", fontWeight: 700, cursor: "pointer" }}>
                    {sending ? "Sending..." : `Send Real Email to ${aiModal.email}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <input type="file" ref={fileRef} accept=".csv" onChange={handleCSV} style={{ display: "none" }} />
      <Sidebar active="prospects" user={user} onLogout={handleLogout} />
      <div style={{ marginLeft: 240, padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: S.text, marginBottom: 4 }}>Prospects Management</h1>
            <p style={{ color: S.muted, fontSize: 14 }}>Real emails integrated · Direct calling enabled · Automated status tracking</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => fileRef.current?.click()} style={{ padding: "9px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${S.lineSoft}`, color: S.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Import CSV</button>
            <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "9px 18px", borderRadius: 10, background: S.accent, border: "none", color: "#050505", fontWeight: 700, cursor: "pointer" }}>+ Add Prospect</button>
          </div>
        </div>

        {/* Add Form Panel */}
        {showAdd && (
          <div style={{ background: S.panel, border: "1px solid rgba(200,255,0,0.2)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 16 }}>Add New Prospect</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
              {[
                { key: "name", label: "Full Name *", placeholder: "Sarah Chen" },
                { key: "email", label: "Email *", placeholder: "sarah@company.com" },
                { key: "phone", label: "Phone Number", placeholder: "+1234567890" },
                { key: "role", label: "Job Title", placeholder: "CRO" },
                { key: "company", label: "Company", placeholder: "Linear" },
                { key: "industry", label: "Industry", placeholder: "SaaS" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: S.faint, display: "block", marginBottom: 5 }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${S.lineSoft}`, color: S.text, fontSize: 13, outline: "none" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleAdd} style={{ padding: "10px 24px", borderRadius: 10, background: S.accent, border: "none", color: "#050505", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Prospect</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${S.lineSoft}`, color: S.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Table Structure */}
        <div style={{ background: S.panel, border: `1px solid ${S.lineSoft}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 140px 160px", padding: "12px 20px", borderBottom: `1px solid ${S.lineSoft}`, background: "rgba(255,255,255,0.02)" }}>
            {["Prospect & Real Email", "Company", "Direct Call", "Auto Status", "Actions"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: S.faint, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: S.faint }}>No prospects found. Add one above.</div>
          ) : (
            filtered.map((p, i) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 140px 160px", padding: "13px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${S.lineSoft}` : "none", alignItems: "center" }}>
                
                {/* Real Email Display */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: p.avatar_bg || "#1a2035", color: p.avatar_color || "#C8FF00", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>{p.avatar_init || "P"}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{p.name}</div>
                    <a href={`mailto:${p.email}`} style={{ fontSize: 11, color: S.accent, textDecoration: "none" }}>{p.email}</a>
                  </div>
                </div>

                {/* Company */}
                <div style={{ fontSize: 13, color: S.muted }}>{p.company || "N/A"}</div>

                {/* Direct Call Trigger */}
                <div>
                  <a href={`tel:${p.phone || ""}`} onClick={() => handleAutomaticStatus(p.id, "contacted")} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                    📞 Call Now
                  </a>
                </div>

                {/* Auto Status Tracker */}
                <div>
                  <select value={p.status} onChange={e => handleAutomaticStatus(p.id, e.target.value as StatusType)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: p.status === "replied" ? "#34d399" : p.status === "contacted" ? "#818cf8" : p.status === "meeting" ? "#f59e0b" : S.accent, cursor: "pointer", outline: "none" }}>
                    {["new", "contacted", "replied", "meeting", "closed"].map(s => (
                      <option key={s} value={s} style={{ background: "#0d1018", color: "#f4f5f7" }}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openAiModal(p)} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(200,255,0,0.08)", border: "1px solid rgba(200,255,0,0.25)", color: S.accent, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    AI Email
                  </button>
                  <button onClick={() => handleDelete(p.id, p.name)} style={{ padding: "6px 8px", borderRadius: 8, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171", fontSize: 11, cursor: "pointer" }}>
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}