"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

/* ─── Design Tokens ──────────────────────────────────────────── */
const S = {
  bg: "#050505", panel: "#0c0f18", panel2: "#0f1320",
  line: "rgba(255,255,255,0.06)", lineMed: "rgba(255,255,255,0.10)",
  text: "#f0f2f5", muted: "#8a8e9b", faint: "#484d5c",
  accent: "#C8FF00",
};

/* ─── Platform colours (brand-accurate) ─────────────────────── */
type PlatformId = "claude"|"claude-code"|"chatgpt"|"codex"|"telegram"|"cli"|"cursor";

const BRAND: Record<PlatformId,{
  primary:string; bg:string; glow:string;
}> = {
  "claude":      { primary:"#CC785C", bg:"rgba(204,120,92,0.12)",  glow:"rgba(204,120,92,0.30)" },
  "claude-code": { primary:"#CC785C", bg:"rgba(204,120,92,0.12)",  glow:"rgba(204,120,92,0.30)" },
  "chatgpt":     { primary:"#10A37F", bg:"rgba(16,163,127,0.12)",  glow:"rgba(16,163,127,0.30)" },
  "codex":       { primary:"#ffffff", bg:"rgba(255,255,255,0.08)", glow:"rgba(255,255,255,0.20)" },
  "telegram":    { primary:"#2CA5E0", bg:"rgba(44,165,224,0.12)",  glow:"rgba(44,165,224,0.30)" },
  "cli":         { primary:"#C8FF00", bg:"rgba(200,255,0,0.12)",   glow:"rgba(200,255,0,0.30)"  },
  "cursor":      { primary:"#a07aff", bg:"rgba(160,122,255,0.12)", glow:"rgba(160,122,255,0.30)" },
};

/* ─── Logos ──────────────────────────────────────────────────── */
const Logos: Record<PlatformId, (c:string)=>React.ReactElement> = {
  "claude":      (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill={c==="active"?"#CC785C":"transparent"}/>
      <path d="M7 18L10.5 7 14 18M9.5 14h4.5" stroke={c==="active"?"#fff":"#CC785C"} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  "claude-code": (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill={c==="active"?"#CC785C":"transparent"}/>
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" stroke="#CC785C" strokeWidth="1.2" strokeOpacity={c==="active"?"0":"1"}/>
      <path d="M7 10l4 2-4 2m5 0h6" stroke={c==="active"?"#fff":"#CC785C"} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  "chatgpt":     (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill={c==="active"?"#10A37F":"transparent"}/>
      <path d="M12 4.5A7.5 7.5 0 1 0 19.5 12 7.5 7.5 0 0 0 12 4.5zm0 1.5a6 6 0 0 1 4.24 1.76L6.26 17.24A6 6 0 0 1 12 6zm0 12a6 6 0 0 1-4.24-1.76l9.98-9.98A6 6 0 0 1 12 18z" fill={c==="active"?"#fff":"#10A37F"}/>
    </svg>
  ),
  "codex":       (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill={c==="active"?"#333":"transparent"}/>
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeOpacity={c==="active"?"0":"1"}/>
      <path d="M7 9l4 3-4 3m5 0h6" stroke={c==="active"?"#fff":"rgba(255,255,255,0.7)"} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  "telegram":    (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill={c==="active"?"#2CA5E0":"transparent"}/>
      <path d="M5 12.5l13-5.5-3 12-4-3.5-3 3 1-5.5m-4-1 5 2" stroke={c==="active"?"#fff":"#2CA5E0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "cli":         (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill={c==="active"?"#1a2800":"transparent"}/>
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" stroke="#C8FF00" strokeWidth="1.2" strokeDasharray="3 2" strokeOpacity={c==="active"?"0.5":"1"}/>
      <path d="M7 11l3.5 1.5L7 14m5 0h5" stroke={c==="active"?"#C8FF00":"#C8FF00"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  "cursor":      (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill={c==="active"?"#2a1f4a":"transparent"}/>
      <path d="M12 4L20 20H4L12 4Z" fill={c==="active"?"#a07aff":"rgba(160,122,255,0.7)"}/>
      <path d="M12 4L20 20" stroke={c==="active"?"#2a1f4a":"transparent"} strokeWidth="2.5"/>
    </svg>
  ),
};

/* ─── Platform Data ──────────────────────────────────────────── */
type Step = { title:string; desc:string; code?:string; lang?:string };
type Platform = {
  id: PlatformId; label: string; tagline: string; badge?: string;
  endpoint?: string; steps: Step[];
  features: { icon:string; title:string; desc:string }[];
};

const SERVER = "https://salevrix-ai.vercel.app/api/mcp";

const PLATFORMS: Platform[] = [
  {
    id:"claude", label:"Claude", badge:"Popular",
    tagline:"Add Salevrix to Claude Desktop — prospect research, email drafts, pipeline insights, all inside your Claude chats.",
    endpoint: SERVER,
    features:[
      { icon:"🎯", title:"Find Prospects", desc:"Ask Claude to find leads matching your ICP" },
      { icon:"✉️", title:"Draft Outreach", desc:"AI-written cold emails, auto-personalized" },
      { icon:"📊", title:"Pipeline Intel", desc:"Real-time stats from your Salevrix pipeline" },
    ],
    steps:[
      { title:"Open Claude Desktop settings", desc:"Claude Desktop → Settings (⌘,) → Developer → Edit Config", },
      { title:"Add Salevrix MCP server", desc:"Paste into your claude_desktop_config.json:", lang:"json",
        code: `{
  "mcpServers": {
    "salevrix": {
      "command": "npx",
      "args": ["-y", "@salevrix/mcp-server"],
      "env": {
        "SALEVRIX_API_KEY": "YOUR_API_KEY",
        "SALEVRIX_SERVER_URL": "${SERVER}"
      }
    }
  }
}` },
      { title:"Restart Claude Desktop", desc:"Quit and reopen Claude. You'll see the 🔧 Salevrix tools appear in the tool picker." },
      { title:"Start prospecting with AI", desc:'Try: "Salevrix: find me 10 SaaS founders in NYC and draft outreach emails for each"' },
    ],
  },
  {
    id:"claude-code", label:"Claude Code", badge:"New",
    tagline:"Run Salevrix commands directly inside Claude Code CLI. Query your pipeline, add prospects, fire off emails — all from the terminal.",
    endpoint: SERVER,
    features:[
      { icon:"⚡", title:"CLI Native", desc:"Works inline with Claude Code commands" },
      { icon:"🔁", title:"Scriptable", desc:"Build automated prospecting workflows" },
      { icon:"🛠️", title:"Dev Friendly", desc:"Full JSON responses for piping" },
    ],
    steps:[
      { title:"Install Claude Code CLI", desc:"Make sure you have the latest version:", lang:"bash",
        code:"npm install -g @anthropic-ai/claude-code" },
      { title:"Register Salevrix MCP server", desc:"Run once in your terminal:", lang:"bash",
        code:`claude mcp add salevrix npx -- -y @salevrix/mcp-server \\
  --env SALEVRIX_API_KEY=YOUR_API_KEY \\
  --env SALEVRIX_SERVER_URL=${SERVER}` },
      { title:"Verify registration", desc:"Confirm Salevrix is listed:", lang:"bash",
        code:"claude mcp list" },
      { title:"Use Salevrix inside Claude Code", desc:"Start a session and call tools naturally:", lang:"bash",
        code:`claude
# Inside the session, type:
# > Use salevrix to list my top 5 prospects and write follow-up emails` },
    ],
  },
  {
    id:"chatgpt", label:"ChatGPT", badge:"Plugin",
    tagline:"Add Salevrix as a ChatGPT Custom GPT Action. Your AI sales assistant, powered by GPT-4.",
    endpoint: SERVER,
    features:[
      { icon:"🤖", title:"Custom GPT", desc:"Build your own Salevrix-powered GPT" },
      { icon:"🗣️", title:"Natural Language", desc:"Talk to your pipeline in plain English" },
      { icon:"📬", title:"Send Emails", desc:"Trigger outreach directly from ChatGPT" },
    ],
    steps:[
      { title:"Create or open a Custom GPT", desc:"ChatGPT → Explore GPTs → Create (or edit an existing one)" },
      { title:"Add a new Action", desc:"Under Configure → Actions → Add Action. Paste this OpenAPI schema:", lang:"yaml",
        code:`openapi: "3.1.0"
info:
  title: Salevrix AI
  description: AI sales prospecting and outreach
  version: "1.0.0"
servers:
  - url: ${SERVER}
paths:
  /prospects:
    get:
      operationId: listProspects
      summary: Get prospects
      parameters:
        - name: status
          in: query
          schema: { type: string }
        - name: limit
          in: query
          schema: { type: integer, default: 20 }
  /emails/send:
    post:
      operationId: sendEmail
      summary: Send email to prospect
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [prospectId, subject, body]
              properties:
                prospectId: { type: string }
                subject: { type: string }
                body: { type: string }` },
      { title:"Set Authentication", desc:"Authentication → API Key → Bearer Token → paste your Salevrix API key" },
      { title:"Test & publish", desc:'Click Test → Ask: "Get my leads with no reply in the last 7 days"' },
    ],
  },
  {
    id:"codex", label:"Codex / API",
    tagline:"Integrate Salevrix into any OpenAI-compatible app, agent, or Codex workflow via REST or SDK.",
    endpoint: SERVER,
    features:[
      { icon:"📦", title:"NPM SDK", desc:"@salevrix/sdk for Node.js and Python" },
      { icon:"🔧", title:"Tool / Function", desc:"Drop in as an OpenAI function call" },
      { icon:"🌐", title:"REST API", desc:"Raw HTTP — use in any language" },
    ],
    steps:[
      { title:"Install SDK", desc:"Add to your project:", lang:"bash",
        code:"npm install @salevrix/sdk" },
      { title:"Initialize the client", desc:"In your code:", lang:"typescript",
        code:`import Salevrix from "@salevrix/sdk";

const salevrix = new Salevrix({
  apiKey: process.env.SALEVRIX_API_KEY,
  baseURL: "${SERVER}",
});

const prospects = await salevrix.prospects.list({ limit: 10 });

await salevrix.emails.send({
  prospectId: prospects[0].id,
  subject: "Quick question",
  body: "Hi {{firstName}}, ...",
});` },
      { title:"Register as OpenAI tool", desc:"Use as a function call in any OpenAI-compatible model:", lang:"typescript",
        code:`const tools = [{
  type: "function",
  function: {
    name: "salevrix_get_prospects",
    description: "Fetch sales prospects from Salevrix CRM",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string" },
        limit: { type: "number" }
      }
    }
  }
}];` },
    ],
  },
  {
    id:"telegram", label:"Telegram",
    tagline:"Control your entire sales pipeline from Telegram. Add prospects, send emails, check stats — right from your phone.",
    endpoint: SERVER,
    features:[
      { icon:"📱", title:"Mobile First", desc:"Manage pipeline from anywhere" },
      { icon:"🔔", title:"Real-time Alerts", desc:"Get notified on replies and opens" },
      { icon:"🤖", title:"Bot Commands", desc:"Full set of /commands for your pipeline" },
    ],
    steps:[
      { title:"Create a Telegram Bot", desc:"Open Telegram → @BotFather → /newbot → copy the token" },
      { title:"Run the Salevrix Telegram bridge", desc:"Start the bridge in your terminal:", lang:"bash",
        code:`npx @salevrix/telegram-bridge \\
  --telegram-token YOUR_BOT_TOKEN \\
  --salevrix-key YOUR_API_KEY \\
  --server-url ${SERVER}` },
      { title:"Or deploy with Docker", desc:"One-liner for VPS or cloud:", lang:"bash",
        code:`docker run -d --name salevrix-bot \\
  -e TELEGRAM_TOKEN=YOUR_BOT_TOKEN \\
  -e SALEVRIX_API_KEY=YOUR_API_KEY \\
  salevrix/telegram-bridge:latest` },
      { title:"Available bot commands", desc:"Send these in your Telegram bot:", lang:"bash",
        code:`/prospects       – List top 10 prospects
/pipeline        – Full pipeline overview
/send @email "Subject" "Body" – Send email
/status @email contacted      – Update status
/stats           – Open rate, reply rate, etc.
/help            – All commands` },
    ],
  },
  {
    id:"cli", label:"CLI",
    tagline:"Full terminal access to your Salevrix pipeline. Import, export, search, and fire emails — all from the command line.",
    endpoint: SERVER,
    features:[
      { icon:"⚡", title:"Fast", desc:"Sub-100ms responses on all commands" },
      { icon:"🔗", title:"Pipeable", desc:"JSON output, plays nice with jq and grep" },
      { icon:"📁", title:"Import/Export", desc:"CSV, JSON, and custom formats" },
    ],
    steps:[
      { title:"Install the CLI", desc:"Global install via npm:", lang:"bash",
        code:"npm install -g @salevrix/cli" },
      { title:"Authenticate", desc:"Login with your API key:", lang:"bash",
        code:"salevrix auth login --key YOUR_API_KEY" },
      { title:"Core commands", desc:"Manage your full pipeline:", lang:"bash",
        code:`# List prospects
salevrix prospects list --status new --limit 20

# Add a prospect
salevrix prospects add \\
  --name "Sarah Chen" \\
  --email sarah@company.com \\
  --company "Acme Corp"

# Send email
salevrix email send \\
  --to prospect_123 \\
  --subject "Quick question" \\
  --template follow_up_1

# Analytics
salevrix analytics --range 30d` },
      { title:"Pipe with other tools", desc:"Compose with your terminal toolkit:", lang:"bash",
        code:`# Export as CSV
salevrix prospects list --format csv > prospects.csv

# Import leads
salevrix prospects import --file leads.csv

# Pipe to jq
salevrix prospects list --format json | jq '.[] | .email'` },
    ],
  },
  {
    id:"cursor", label:"Cursor",
    tagline:"Use Salevrix tools directly in Cursor's AI Composer. Research leads, draft emails, and update your pipeline without leaving your editor.",
    endpoint: SERVER,
    features:[
      { icon:"🖊️", title:"In-Editor", desc:"Prospect research inside your IDE" },
      { icon:"🤝", title:"AI Composer", desc:"Salevrix tools in Cursor Composer" },
      { icon:"⚙️", title:"MCP Native", desc:"Full MCP protocol support" },
    ],
    steps:[
      { title:"Open Cursor MCP settings", desc:"Cursor → Settings → Features → MCP (Beta) → Add Server" },
      { title:"Add config", desc:"In your ~/.cursor/mcp.json:", lang:"json",
        code:`{
  "mcpServers": {
    "salevrix": {
      "command": "npx",
      "args": ["-y", "@salevrix/mcp-server"],
      "env": {
        "SALEVRIX_API_KEY": "YOUR_API_KEY",
        "SALEVRIX_SERVER_URL": "${SERVER}"
      }
    }
  }
}` },
      { title:"Reload Cursor", desc:"⌘⇧P → Reload Window. Salevrix tools appear in Composer." },
      { title:"Use in Composer (⌘I)", desc:"In Cursor Composer, ask:", lang:"bash",
        code:`"Use Salevrix to find all Series A startups in my pipeline
 and generate personalized follow-up sequences for each"` },
    ],
  },
];

/* ─── CodeBlock ──────────────────────────────────────────────── */
function CodeBlock({ code, lang, accent }:{ code:string; lang:string; accent:string }) {
  const [copied,setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),1800); };
  return (
    <div style={{ borderRadius:10, overflow:"hidden", marginTop:12, border:`1px solid rgba(255,255,255,0.06)` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#07090f", padding:"7px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize:10, color:S.faint, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.08em" }}>{lang}</span>
        <button onClick={copy} style={{ background:"none", border:"none", cursor:"pointer", color:copied?accent:S.muted, fontSize:11.5, fontFamily:"Inter,sans-serif", display:"flex", alignItems:"center", gap:5, padding:"2px 6px", borderRadius:4, transition:"color 0.2s" }}>
          {copied
            ? <><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Copied!</>
            : <><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="5" y="1" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 4H2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5"/></svg> Copy</>}
        </button>
      </div>
      <pre style={{ margin:0, padding:"15px 16px", background:"#070a12", overflowX:"auto", fontSize:12.5, lineHeight:1.75, color:"#dde0ea", fontFamily:'"JetBrains Mono","Cascadia Code","Fira Code",monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MCPPage() {
  const { user, loading, handleLogout } = useAuth();
  const [active, setActive] = useState<PlatformId>("claude");
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  if (loading) return <LoadingScreen />;

  const p = PLATFORMS.find(x=>x.id===active)!;
  const brand = BRAND[active];
  const apiKeyMask = "slvx_live_••••••••••••••••••••••";
  const apiKeyReal = "slvx_live_sk_" + (user?.uid?.slice(0,24)??"xxxxxxxxxxxxxxxxxxxxxxxx") + "xx";

  const copyKey = () => { navigator.clipboard.writeText(apiKeyReal); setKeyCopied(true); setTimeout(()=>setKeyCopied(false),2000); };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:S.bg, fontFamily:"Inter,sans-serif", color:S.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .mcp-tab{background:none;border:1px solid transparent;cursor:pointer;display:flex;align-items:center;gap:9px;padding:9px 16px;border-radius:10px;color:${S.muted};font-size:13.5px;font-weight:500;transition:all 0.18s;white-space:nowrap;font-family:Inter,sans-serif;}
        .mcp-tab:hover{background:rgba(255,255,255,0.04);color:${S.text};}
        .step-card{background:${S.panel2};border:1px solid rgba(255,255,255,0.06);border-radius:13px;padding:18px 20px;transition:border-color 0.18s;}
        .step-card:hover{border-color:rgba(255,255,255,0.1);}
        .feat-card{background:${S.panel};border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 18px;flex:1;min-width:140px;}
        @media(max-width:900px){.mcp-main{margin-left:0!important;padding:20px 16px 60px!important;max-width:100%!important;}}
      `}</style>

      <Sidebar active="mcp" user={user} onLogout={handleLogout} />

      <main className="mcp-main" style={{ flex:1, marginLeft:240, padding:"28px 32px 80px", maxWidth:"calc(100% - 240px)", overflowX:"hidden" }}>

        {/* ── HERO ──────────────────────────────────────── */}
        <div style={{ background:S.panel, border:`1px solid ${S.line}`, borderRadius:18, padding:"36px 36px 32px", marginBottom:24, position:"relative", overflow:"hidden" }}>

          {/* glow orb behind hero */}
          <div style={{ position:"absolute", top:"-40%", right:"-5%", width:420, height:340, background:`radial-gradient(ellipse, ${brand.glow} 0%, transparent 65%)`, pointerEvents:"none", transition:"background 0.4s" }}/>

          {/* top row: badge + title */}
          <div style={{ position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ padding:"3px 10px", borderRadius:20, background:brand.bg, border:`1px solid ${brand.primary}22`, fontSize:11, fontWeight:700, color:brand.primary, letterSpacing:"0.07em", textTransform:"uppercase", transition:"all 0.3s" }}>
                MCP
              </div>
              <span style={{ fontSize:12, color:S.faint }}>Model Context Protocol</span>
            </div>

            <h1 style={{ fontFamily:"Syne,sans-serif", fontSize:32, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:10, maxWidth:560 }}>
              Connect Salevrix AI<br/>to{" "}
              <span style={{ color:brand.primary, transition:"color 0.3s" }}>{p.label}</span>
            </h1>
            <p style={{ fontSize:14, color:S.muted, lineHeight:1.7, maxWidth:500, marginBottom:24 }}>
              {p.tagline}
            </p>

            {/* CTA buttons */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button style={{
                background: brand.primary,
                border:"none", borderRadius:10, padding:"11px 22px",
                color: active==="cli"?"#0a1200":active==="codex"?"#111":"#fff",
                fontSize:14, fontWeight:700, cursor:"pointer",
                fontFamily:"Inter,sans-serif",
                display:"flex", alignItems:"center", gap:8,
                boxShadow:`0 0 24px ${brand.glow}`,
                transition:"all 0.3s",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Connect to {p.label}
              </button>
              <a href="#steps" style={{
                background:"rgba(255,255,255,0.06)", border:`1px solid ${S.line}`,
                borderRadius:10, padding:"11px 20px", color:S.muted,
                fontSize:14, fontWeight:500, cursor:"pointer",
                fontFamily:"Inter,sans-serif", textDecoration:"none",
                display:"flex", alignItems:"center", gap:7, transition:"all 0.2s",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M12 17v-5m0-4.01V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                How to connect?
              </a>
            </div>

            {/* Endpoint pill */}
            {p.endpoint && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:9, marginTop:20, background:"rgba(0,0,0,0.3)", border:`1px solid ${S.line}`, borderRadius:8, padding:"8px 14px" }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:brand.primary, boxShadow:`0 0 8px ${brand.primary}`, transition:"background 0.3s" }}/>
                <code style={{ fontSize:12, color:S.muted, fontFamily:"monospace" }}>{p.endpoint}</code>
              </div>
            )}
          </div>
        </div>

        {/* ── PLATFORM TABS ─────────────────────────────── */}
        <div style={{ background:S.panel, border:`1px solid ${S.line}`, borderRadius:14, padding:"10px", marginBottom:24 }}>
          <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:2 }}>
            {PLATFORMS.map(pl => {
              const isActive = pl.id === active;
              const b = BRAND[pl.id];
              return (
                <button
                  key={pl.id}
                  className="mcp-tab"
                  onClick={() => setActive(pl.id)}
                  style={{
                    background: isActive ? b.bg : "transparent",
                    border: `1px solid ${isActive ? b.primary+"44" : "transparent"}`,
                    color: isActive ? b.primary : S.muted,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {Logos[pl.id](isActive?"active":"idle")}
                  {pl.label}
                  {pl.badge && (
                    <span style={{ fontSize:9, padding:"1px 5px", borderRadius:3, background:isActive?b.primary+"22":"rgba(255,255,255,0.06)", color:isActive?b.primary:S.faint, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                      {pl.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FEATURE CARDS ─────────────────────────────── */}
        <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
          {p.features.map((f,i) => (
            <div key={i} className="feat-card">
              <div style={{ fontSize:22, marginBottom:8 }}>{f.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:S.text, marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:12, color:S.muted, lineHeight:1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* ── API KEY ───────────────────────────────────── */}
        <div style={{ background:S.panel, border:`1px solid ${S.line}`, borderRadius:14, padding:"18px 22px", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:S.text, marginBottom:2 }}>Your API Key</div>
              <div style={{ fontSize:12, color:S.muted }}>Replace <code style={{ fontFamily:"monospace", color:brand.primary }}>YOUR_API_KEY</code> in the configs below with this</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setKeyVisible(v=>!v)} style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${S.line}`, borderRadius:8, padding:"7px 13px", color:S.muted, fontSize:12, cursor:"pointer", fontFamily:"Inter,sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d={keyVisible?"M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22":"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                {keyVisible?"Hide":"Reveal"}
              </button>
              <button onClick={copyKey} style={{ background:brand.bg, border:`1px solid ${brand.primary}33`, borderRadius:8, padding:"7px 14px", color:brand.primary, fontSize:12, cursor:"pointer", fontFamily:"Inter,sans-serif", display:"flex", alignItems:"center", gap:6, fontWeight:700, transition:"all 0.2s" }}>
                {keyCopied
                  ? <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Copied!</>
                  : <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="5" y="1" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 4H2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5"/></svg> Copy Key</>}
              </button>
            </div>
          </div>
          <div style={{ background:"#07090f", border:`1px solid ${S.line}`, borderRadius:8, padding:"11px 15px", fontFamily:"monospace", fontSize:13, color:S.text, letterSpacing: keyVisible?"0.02em":"0.12em", userSelect:"all" }}>
            {keyVisible ? apiKeyReal : apiKeyMask}
          </div>
        </div>

        {/* ── SETUP STEPS ───────────────────────────────── */}
        <div id="steps">
          <div style={{ fontSize:11, color:S.faint, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:14 }}>
            Setup Guide — {p.label}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {p.steps.map((step,i)=>(
              <div key={i} className="step-card">
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:27, height:27, borderRadius:"50%", background:brand.bg, border:`1px solid ${brand.primary}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:brand.primary, flexShrink:0, transition:"all 0.3s" }}>
                    {i+1}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:S.text, marginBottom:5 }}>{step.title}</div>
                    <div style={{ fontSize:13, color:S.muted, lineHeight:1.65 }}>{step.desc}</div>
                    {step.code && step.lang && (
                      <CodeBlock code={step.code} lang={step.lang} accent={brand.primary}/>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HELP FOOTER ───────────────────────────────── */}
        <div style={{ marginTop:24, padding:"16px 20px", background:S.panel2, border:`1px solid ${S.line}`, borderRadius:12, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:brand.bg, border:`1px solid ${brand.primary}22`, display:"grid", placeItems:"center", flexShrink:0, transition:"all 0.3s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={brand.primary} strokeWidth="1.5"/><path d="M12 17v-5m0-4.01V8" stroke={brand.primary} strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.text }}>Need help connecting {p.label}?</div>
            <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>
              Email{" "}<a href="mailto:support@salevrix.ai" style={{ color:brand.primary, textDecoration:"none" }}>support@salevrix.ai</a>
              {" · "}
              <a href="https://docs.salevrix.ai/mcp" target="_blank" rel="noopener noreferrer" style={{ color:brand.primary, textDecoration:"none" }}>Read docs →</a>
            </div>
          </div>
          <div style={{ fontSize:11, color:S.faint, textAlign:"right", lineHeight:1.5 }}>
            <div>MCP v1.0</div>
            <div style={{ color:brand.primary, fontWeight:600 }}>● Live</div>
          </div>
        </div>

      </main>
    </div>
  );
}
