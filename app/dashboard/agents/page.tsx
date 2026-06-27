"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange, logOut, type User } from "@/lib/firebase";
import { callAI, AI_SYSTEM_PROMPTS } from "@/lib/openrouter";

const S = {
  bg: "#050505", panel: "#0d1018", line: "rgba(255,255,255,0.07)",
  lineSoft: "rgba(255,255,255,0.04)", text: "#f4f5f7", muted: "#9598a3",
  faint: "#555a66", accent: "#C8FF00", violet: "#7c3aed",
};

type AgentStatus = "active" | "paused" | "training";

type Agent = {
  id: string;
  name: string;
  type: string;
  description: string;
  status: AgentStatus;
  icon: string;
  color: string;
  bgColor: string;
  stats: { label: string; value: string }[];
  capabilities: string[];
};

const AGENTS: Agent[] = [
  {
    id: "sdr",
    name: "SDR Agent Alpha",
    type: "sdr",
    description: "Fully autonomous SDR that finds prospects, writes personalized emails, handles replies, and books meetings 24/7.",
    status: "active",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "#C8FF00",
    bgColor: "rgba(200,255,0,0.08)",
    stats: [{ label: "Meetings Booked", value: "47" }, { label: "Emails Sent", value: "1,284" }, { label: "Reply Rate", value: "31%" }],
    capabilities: ["Prospect discovery", "Email personalization", "Reply handling", "Meeting booking", "Follow-up sequences", "CRM sync"],
  },
  {
    id: "email_coach",
    name: "Email Coach",
    type: "email_coach",
    description: "Real-time AI that analyzes your emails before sending and suggests improvements to maximize reply rates.",
    status: "active",
    icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    color: "#818cf8",
    bgColor: "rgba(129,140,248,0.08)",
    stats: [{ label: "Emails Improved", value: "234" }, { label: "Avg Score Boost", value: "+42%" }, { label: "Reply Lift", value: "+18%" }],
    capabilities: ["Email scoring", "Subject line optimization", "Personalization suggestions", "Spam check", "Tone analysis"],
  },
  {
    id: "deal_analyzer",
    name: "Deal Analyzer",
    type: "deal_analyzer",
    description: "Monitors your pipeline and flags at-risk deals 14 days before they die. Suggests next best actions.",
    status: "active",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.08)",
    stats: [{ label: "Deals Analyzed", value: "89" }, { label: "At-Risk Flagged", value: "12" }, { label: "Deals Saved", value: "7" }],
    capabilities: ["Deal health scoring", "Risk detection", "Next action suggestions", "Stakeholder mapping", "Win probability"],
  },
  {
    id: "objection_handler",
    name: "Objection Handler",
    type: "objection_handler",
    description: "AI that handles common sales objections in real-time with personalized, contextual responses.",
    status: "active",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    color: "#34d399",
    bgColor: "rgba(52,211,153,0.08)",
    stats: [{ label: "Objections Handled", value: "67" }, { label: "Conversion Rate", value: "43%" }, { label: "Avg Response", value: "1.2s" }],
    capabilities: ["Price objections", "Competitor comparisons", "Timing objections", "Authority objections", "Custom responses"],
  },
  {
    id: "meeting_summarizer",
    name: "Meeting Summarizer",
    type: "meeting_summarizer",
    description: "Joins your sales calls, takes notes, extracts action items, and auto-updates your CRM after every meeting.",
    status: "paused",
    icon: "M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.08)",
    stats: [{ label: "Meetings Joined", value: "0" }, { label: "Action Items", value: "0" }, { label: "CRM Updates", value: "0" }],
    capabilities: ["Call transcription", "Action item extraction", "CRM auto-update", "Sentiment analysis", "Follow-up drafts"],
  },
];

function Sidebar({ active, user }: { active: string; user: User | null }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "prospects", label: "Prospects", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { id: "sequences", label: "Sequences", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "agents", label: "AI Agents", icon: "M13 10V3L4 14h7v7l9-11h-7z", highlight: true },
    { id: "inbox", label: "Inbox", icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" },
    { id: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ];
  return (
    <div style={{ width: 220, background: S.panel, borderRight: `1px solid ${S.lineSoft}`,
      display: "flex", flexDirection: "column", height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 50 }}>
      <div style={{ padding: "20px 16px", borderBottom: `1px solid ${S.lineSoft}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: S.accent, display: "grid", placeItems: "center", boxShadow: "0 0 16px rgba(200,255,0,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, background: "linear-gradient(120deg,#C8FF00,#fff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>SalesForge AI</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.faint, letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 8px 8px" }}>Main</div>
        {nav.map(item => (
          <a key={item.id} href={`/dashboard${item.id === "dashboard" ? "" : "/" + item.id}`}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, marginBottom: 2, textDecoration: "none", transition: "all 0.2s",
              background: active === item.id ? (item.highlight ? "rgba(200,255,0,0.1)" : "rgba(255,255,255,0.06)") : "transparent",
              border: active === item.id ? (item.highlight ? "1px solid rgba(200,255,0,0.2)" : "1px solid rgba(255,255,255,0.06)") : "1px solid transparent",
              color: active === item.id ? S.text : S.muted }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: active === item.id && item.highlight ? S.accent : active === item.id ? S.text : S.faint }}>
              <path d={item.icon}/>
            </svg>
            <span style={{ fontSize: 13.5, fontWeight: active === item.id ? 600 : 400 }}>{item.label}</span>
          </a>
        ))}
      </nav>
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${S.lineSoft}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}/>
            : <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(140deg,#C8FF00,#86efac)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: "#050505" }}>{user?.displayName?.[0] ?? "U"}</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.displayName ?? "User"}</div>
            <div style={{ fontSize: 10, color: S.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          </div>
          <button onClick={() => logOut().then(() => window.location.href = "/")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: S.faint }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) router.push("/auth/login");
    });
    return () => unsub();
  }, [router]);

  const toggleAgent = async (agentId: string) => {
    setTogglingId(agentId);
    await new Promise(r => setTimeout(r, 800));
    setAgents(prev => prev.map(a =>
      a.id === agentId ? { ...a, status: a.status === "active" ? "paused" : "active" } : a
    ));
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(prev => prev ? { ...prev, status: prev.status === "active" ? "paused" : "active" } : null);
    }
    setTogglingId(null);
  };

  const testAgent = async () => {
    if (!selectedAgent || !testInput.trim()) return;
    setAiLoading(true);
    setAiOutput("");
    try {
      let prompt = "";
      let system = "";
      switch (selectedAgent.type) {
        case "sdr":
          system = AI_SYSTEM_PROMPTS.emailWriter;
          prompt = `Write a cold email for this prospect: ${testInput}`;
          break;
        case "email_coach":
          system = AI_SYSTEM_PROMPTS.subjectLine;
          prompt = `Generate subject lines for this email context: ${testInput}`;
          break;
        case "deal_analyzer":
          system = AI_SYSTEM_PROMPTS.prospectAnalyzer;
          prompt = `Analyze this prospect/deal: ${testInput}`;
          break;
        case "objection_handler":
          system = AI_SYSTEM_PROMPTS.objectionHandler;
          prompt = `Handle this sales objection: ${testInput}`;
          break;
        case "meeting_summarizer":
          system = "You are a meeting summarizer. Extract key points, action items, and next steps from the meeting notes provided. Format as a clean summary.";
          prompt = `Summarize this meeting: ${testInput}`;
          break;
        default:
          prompt = testInput;
      }
      const result = await callAI(prompt, system);
      setAiOutput(result);
    } catch {
      setAiOutput("Error: Could not connect to AI. Check your OpenRouter API key.");
    }
    setAiLoading(false);
  };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(200,255,0,0.2)", borderTopColor: "#C8FF00", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: S.muted, fontSize: 14 }}>Loading...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  const activeCount = agents.filter(a => a.status === "active").length;

  return (
    <div style={{ background: S.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Sidebar active="agents" user={user} />
      <div style={{ marginLeft: 220, padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: S.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
              AI Agents
            </h1>
            <p style={{ color: S.muted, fontSize: 14 }}>Deploy autonomous agents that work your pipeline 24/7</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, color: S.muted }}>
              <span style={{ color: S.accent, fontWeight: 700 }}>{activeCount}</span>/{agents.length} active
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: S.accent,
              background: "rgba(200,255,0,0.08)", border: "1px solid rgba(200,255,0,0.2)", padding: "6px 14px", borderRadius: 999 }}>
              <span style={{ width: 7, height: 7, background: S.accent, borderRadius: "50%", animation: "ping 1.5s infinite" }} />
              {activeCount} Running
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedAgent ? "1fr 420px" : "1fr", gap: 20 }}>
          {/* Agents Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, alignContent: "start" }}>
            {agents.map(agent => (
              <div key={agent.id}
                onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                style={{ background: S.panel, border: `1px solid ${selectedAgent?.id === agent.id ? "rgba(200,255,0,0.3)" : S.lineSoft}`,
                  borderRadius: 16, padding: 22, cursor: "pointer", transition: "all 0.2s",
                  boxShadow: selectedAgent?.id === agent.id ? "0 0 0 1px rgba(200,255,0,0.15), 0 8px 32px rgba(0,0,0,0.3)" : "none" }}
                onMouseEnter={e => { if (selectedAgent?.id !== agent.id) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { if (selectedAgent?.id !== agent.id) (e.currentTarget as HTMLDivElement).style.borderColor = S.lineSoft; }}>

                {/* Agent Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: agent.bgColor,
                      border: `1px solid ${agent.color}33`, display: "grid", placeItems: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={agent.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={agent.icon}/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: agent.status === "active" ? "#34d399" : S.faint, fontWeight: 600, marginTop: 2 }}>
                        {agent.status === "active" ? "● Active" : agent.status === "training" ? "◌ Training" : "○ Paused"}
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button onClick={e => { e.stopPropagation(); toggleAgent(agent.id); }}
                    disabled={togglingId === agent.id}
                    style={{ width: 44, height: 24, borderRadius: 999, border: "none", cursor: togglingId === agent.id ? "not-allowed" : "pointer",
                      background: agent.status === "active" ? S.accent : "rgba(255,255,255,0.1)",
                      transition: "all 0.3s", position: "relative", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 3, left: agent.status === "active" ? 23 : 3,
                      width: 18, height: 18, borderRadius: "50%",
                      background: agent.status === "active" ? "#050505" : "rgba(255,255,255,0.5)",
                      transition: "all 0.3s" }} />
                  </button>
                </div>

                <p style={{ fontSize: 12.5, color: S.muted, lineHeight: 1.6, marginBottom: 16 }}>{agent.description}</p>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
                  {agent.stats.map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${S.lineSoft}`,
                      borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: agent.color, fontFamily: "Syne, sans-serif" }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: S.faint, marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Capabilities */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {agent.capabilities.slice(0,4).map(c => (
                    <span key={c} style={{ fontSize: 11, color: S.muted, background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${S.lineSoft}`, padding: "3px 9px", borderRadius: 999 }}>{c}</span>
                  ))}
                  {agent.capabilities.length > 4 && (
                    <span style={{ fontSize: 11, color: S.faint, padding: "3px 9px" }}>+{agent.capabilities.length - 4} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Agent Test Panel */}
          {selectedAgent && (
            <div style={{ background: S.panel, border: "1px solid rgba(200,255,0,0.2)", borderRadius: 16,
              padding: 24, height: "fit-content", position: "sticky", top: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: selectedAgent.bgColor,
                  border: `1px solid ${selectedAgent.color}33`, display: "grid", placeItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={selectedAgent.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={selectedAgent.icon}/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>Test {selectedAgent.name}</div>
                  <div style={{ fontSize: 11, color: S.faint }}>Live OpenRouter AI</div>
                </div>
                <button onClick={() => setSelectedAgent(null)}
                  style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: S.faint, padding: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Input hint */}
              <div style={{ fontSize: 11, color: S.faint, marginBottom: 8 }}>
                {selectedAgent.type === "sdr" && "💡 Enter: prospect name, company, role, any details"}
                {selectedAgent.type === "email_coach" && "💡 Enter: email context or topic you're writing about"}
                {selectedAgent.type === "deal_analyzer" && "💡 Enter: company name, industry, size, situation"}
                {selectedAgent.type === "objection_handler" && "💡 Enter: the objection (e.g. 'Your price is too high')"}
                {selectedAgent.type === "meeting_summarizer" && "💡 Enter: meeting notes or transcript"}
              </div>

              <textarea
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                placeholder={
                  selectedAgent.type === "sdr" ? "e.g. James Morrison, VP Sales at Stripe, 5000 employees, Fintech, recently raised Series D..." :
                  selectedAgent.type === "objection_handler" ? "e.g. We're already using Apollo and don't have budget for another tool..." :
                  selectedAgent.type === "deal_analyzer" ? "e.g. Figma, Design SaaS, 1000 employees, Series E, buying committee of 3..." :
                  "Enter details for the agent to process..."
                }
                style={{ width: "100%", minHeight: 120, background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${S.line}`, borderRadius: 12, padding: "12px 14px",
                  color: S.text, fontSize: 13, fontFamily: "Inter, sans-serif", resize: "vertical",
                  outline: "none", lineHeight: 1.6, marginBottom: 12 }}
                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "rgba(200,255,0,0.3)"}
                onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = S.line}
              />

              <button onClick={testAgent} disabled={aiLoading || !testInput.trim() || selectedAgent.status === "paused"}
                style={{ width: "100%", padding: "12px", borderRadius: 11, border: "none",
                  background: selectedAgent.status === "paused" ? "rgba(255,255,255,0.05)" : aiLoading ? "rgba(200,255,0,0.6)" : S.accent,
                  color: selectedAgent.status === "paused" ? S.faint : "#050505",
                  fontSize: 14, fontWeight: 700, cursor: aiLoading || selectedAgent.status === "paused" ? "not-allowed" : "pointer",
                  transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                {aiLoading ? (
                  <><span style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#050505",
                    borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Running Agent...</>
                ) : selectedAgent.status === "paused" ? (
                  "Agent is Paused — Toggle to Activate"
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Run Agent</>
                )}
              </button>

              {/* Output */}
              {(aiOutput || aiLoading) && (
                <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${S.lineSoft}`,
                  borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: selectedAgent.color, textTransform: "uppercase",
                    letterSpacing: ".08em", marginBottom: 10 }}>⚡ Agent Output</div>
                  {aiLoading ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: S.accent,
                          animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite` }} />
                      ))}
                      <span style={{ fontSize: 12, color: S.faint, marginLeft: 4 }}>AI is thinking...</span>
                    </div>
                  ) : (
                    <pre style={{ fontSize: 12.5, color: S.text, lineHeight: 1.7, whiteSpace: "pre-wrap",
                      fontFamily: "Inter, sans-serif", margin: 0 }}>{aiOutput}</pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0%,100%{box-shadow:0 0 0 0 rgba(200,255,0,0.4)}50%{box-shadow:0 0 0 6px rgba(200,255,0,0)}}
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        textarea::placeholder { color: #555a66; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
