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

/* ─── Brand colours ──────────────────────────────────────────── */
type PlatformId = "claude"|"claude-code"|"chatgpt"|"codex"|"cursor"|"telegram"|"cli";

const BRAND: Record<PlatformId,{ primary:string; bg:string; glow:string; textOnPrimary:string }> = {
  "claude":      { primary:"#CC785C", bg:"rgba(204,120,92,0.13)",  glow:"rgba(204,120,92,0.28)",  textOnPrimary:"#fff" },
  "claude-code": { primary:"#CC785C", bg:"rgba(204,120,92,0.13)",  glow:"rgba(204,120,92,0.28)",  textOnPrimary:"#fff" },
  "chatgpt":     { primary:"#10A37F", bg:"rgba(16,163,127,0.13)",  glow:"rgba(16,163,127,0.28)",  textOnPrimary:"#fff" },
  "codex":       { primary:"#3b82f6", bg:"rgba(59,130,246,0.13)",  glow:"rgba(59,130,246,0.28)",  textOnPrimary:"#fff" },
  "cursor":      { primary:"#a07aff", bg:"rgba(160,122,255,0.13)", glow:"rgba(160,122,255,0.28)", textOnPrimary:"#fff" },
  "telegram":    { primary:"#2AABEE", bg:"rgba(42,171,238,0.13)",  glow:"rgba(42,171,238,0.28)",  textOnPrimary:"#fff" },
  "cli":         { primary:"#C8FF00", bg:"rgba(200,255,0,0.12)",   glow:"rgba(200,255,0,0.26)",   textOnPrimary:"#0a1200" },
};

/* ─── REAL Logos (pixel-faithful SVG recreations) ───────────── */

/** Claude — always orange asterisk (Anthropic brand) */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LogoClaude({ size=22, active: _active=false }: { size?:number; active?:boolean }) {
  const c = "#CC785C"; // always orange — never white
  // 12 rounded rays rotated 30° each, like the real Claude logo
  const rays = Array.from({length:12},(_,i)=>{
    const angle = (i * 30) * Math.PI / 180;
    const inner = 3.2, outer = 10.5, w = 2.1;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const perp = { x: -sin * w/2, y: cos * w/2 };
    const p1 = { x: 12 + cos*inner + perp.x, y: 12 + sin*inner + perp.y };
    const p2 = { x: 12 + cos*inner - perp.x, y: 12 + sin*inner - perp.y };
    const p3 = { x: 12 + cos*outer - perp.x, y: 12 + sin*outer - perp.y };
    const p4 = { x: 12 + cos*outer + perp.x, y: 12 + sin*outer + perp.y };
    return `M${p1.x.toFixed(2)},${p1.y.toFixed(2)} L${p2.x.toFixed(2)},${p2.y.toFixed(2)} L${p3.x.toFixed(2)},${p3.y.toFixed(2)} L${p4.x.toFixed(2)},${p4.y.toFixed(2)}Z`;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {rays.map((d,i)=><path key={i} d={d} fill={c} rx="1"/>)}
    </svg>
  );
}

/** OpenAI / ChatGPT — white knot on green circle */
function LogoChatGPT({ size=22, active=false }: { size?:number; active?:boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 41 41" fill="none">
      {/* always show green circle bg */}
      <rect width="41" height="41" rx="10" fill={active ? "#10A37F" : "rgba(16,163,127,0.18)"}/>
      {/* knot always white */}
      <path
        d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.650-2.981 10.079 10.079 0 0 0-9.619 6.980 9.967 9.967 0 0 0-6.675 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.650 2.981 10.079 10.079 0 0 0 9.619-6.980 9.967 9.967 0 0 0 6.675-4.834 10.079 10.079 0 0 0-1.24-11.818zm-17.233 24.08a7.46 7.46 0 0 1-4.800-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.488 7.561zM4.392 33.906a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103L14.627 36.9a7.505 7.505 0 0 1-10.235-2.995zm-2.410-16.593a7.470 7.470 0 0 1 3.903-3.287c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L4.750 27.202a7.505 7.505 0 0 1-2.768-9.889zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.600a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.048-4.645a7.498 7.498 0 0 1 11.136 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.500v4.999l-4.331 2.5-4.331-2.5V21.693z"
        fill="white"
      />
    </svg>
  );
}

/** Telegram — exact blue circle + paper-plane arrow */
function LogoTelegram({ size=22, active=false }: { size?:number; active?:boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <defs>
        <linearGradient id="tg-grad" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2AABEE"/>
          <stop offset="100%" stopColor="#229ED9"/>
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#tg-grad)"/>
      <path
        d="M54 117.9c35.4-15.4 59-25.6 70.9-30.6 33.7-14.1 40.8-16.5 45.3-16.6.9 0 3.1.2 4.5 1.4 1.1 1 1.5 2.3 1.6 3.2.1.9.3 3 .2 4.6-1.6 17-8.7 58.4-12.3 77.5-1.5 8.1-4.5 10.8-7.3 11.1-6.3.6-11-4.1-17-8.1-9.5-6.2-14.8-10-24-16-10.7-7-3.7-10.8 2.3-17.1 1.6-1.7 29.5-27 30-29.3.1-.3.1-.5-.2-.7-.3-.2-.7-.1-1-.1-.4.1-7 4.5-19.8 13.1-18.8 12.9-37.7 25.6-37.7 25.6s-21.3-6.6-21.5-6.5z"
        fill="white"
      />
    </svg>
  );
}

/** Claude Code — orange cloud with >_ terminal (matches Claude brand) */
function LogoClaudeCode({ size=22, active=false }: { size?:number; active?:boolean }) {
  const fill = active ? "#CC785C" : "rgba(204,120,92,0.55)";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* cloud shape */}
      <path
        d="M75 42c0-11-9-20-20-20a20 20 0 0 0-18.4 12.2A14 14 0 0 0 22 48c0 7.7 6.3 14 14 14h37c7.7 0 14-6.3 14-14a14 14 0 0 0-12-13.9z"
        fill={fill}
      />
      {/* >_ symbols */}
      <text x="31" y="57" fontSize="20" fontWeight="700" fill="white" fontFamily="monospace">&gt;_</text>
    </svg>
  );
}

/** Cursor — 3D open-top cube / diamond (black bg, grey geometry) */
function LogoCursor({ size=22, active=false }: { size?:number; active?:boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="18" fill={active ? "#1a1a1a" : "#111"}/>
      {/* 3D cube: top face, left face, right face */}
      <polygon points="50,15 82,32 50,49 18,32" fill={active?"#d0d0d0":"#b0b0b0"}/>
      <polygon points="18,32 50,49 50,85 18,68" fill={active?"#555":"#444"}/>
      <polygon points="82,32 50,49 50,85 82,68" fill={active?"#888":"#777"}/>
      {/* inner diagonal highlight */}
      <polygon points="50,49 82,32 50,85" fill="rgba(255,255,255,0.08)"/>
    </svg>
  );
}

/** CLI — the purple cloud terminal icon user shared */
function LogoCLI({ size=22, active=false }: { size?:number; active?:boolean }) {
  const id = `cli-grad-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id={id} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={active ? "#a78bfa" : "#8b5cf6"}/>
          <stop offset="100%" stopColor={active ? "#6366f1" : "#4f46e5"}/>
        </linearGradient>
      </defs>
      {/* cloud blob */}
      <path
        d="M50 12c-10 0-19 5.5-23.5 13.7A18 18 0 0 0 14 42c0 10 8 18 18 18h36c10 0 18-8 18-18a18 18 0 0 0-14-17.5A26 26 0 0 0 50 12z"
        fill={`url(#${id})`}
      />
      {/* > symbol */}
      <path d="M34 44l10-7-10-7" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* — dash */}
      <path d="M50 44h16" stroke="white" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );
}

/** Codex — OpenAI Codex blue circuit / code icon */
function LogoCodex({ size=22, active=false }: { size?:number; active?:boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="18" fill={active ? "#3b82f6" : "rgba(59,130,246,0.18)"}/>
      {/* </> code brackets */}
      <path d="M28 38L14 50l14 12" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M72 38l14 12-14 12" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M57 28L43 72" stroke="white" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

const LogoComponents: Record<PlatformId, (props:{size?:number;active?:boolean})=>React.ReactElement> = {
  "claude":      (p) => <LogoClaude {...p}/>,
  "claude-code": (p) => <LogoClaudeCode {...p}/>,
  "chatgpt":     (p) => <LogoChatGPT {...p}/>,
  "codex":       (p) => <LogoCodex {...p}/>,
  "cursor":      (p) => <LogoCursor {...p}/>,
  "telegram":    (p) => <LogoTelegram {...p}/>,
  "cli":         (p) => <LogoCLI {...p}/>,
};

/* ─── Platform Data ──────────────────────────────────────────── */
type Step = { title:string; desc:string; code?:string; lang?:string };
type Platform = {
  id: PlatformId; label: string; tagline: string; badge?: string;
  steps: Step[];
  features: { icon:string; title:string; desc:string }[];
};

const SERVER = "https://salevrix-ai.vercel.app/api/mcp";

const PLATFORMS: Platform[] = [
  {
    id:"claude", label:"Claude", badge:"Popular",
    tagline:"Add Salevrix to Claude Desktop — prospect research, email drafts, and pipeline insights inside every Claude conversation.",
    features:[
      { icon:"🎯", title:"Find Prospects",  desc:"Ask Claude to find leads matching your ICP" },
      { icon:"✉️", title:"Draft Outreach",  desc:"AI-written cold emails, auto-personalized" },
      { icon:"📊", title:"Pipeline Intel",  desc:"Real-time stats from your Salevrix pipeline" },
    ],
    steps:[
      { title:"Get your API key",
        desc:"Your API key is your Firebase UID — copy it from the section below, then paste it in the config." },
      { title:"Open Claude Desktop config",
        desc:"Go to Claude Desktop → Settings (⌘,) → Developer → Edit Config. The file is at ~/Library/Application Support/Claude/claude_desktop_config.json", lang:"json",
        code:`{
  "mcpServers": {
    "salevrix": {
      "url": "${SERVER}",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}` },
      { title:"Fully quit and restart Claude Desktop",
        desc:"Press ⌘Q to quit (not just close the window), then reopen. The 🔧 tool icon appears in the message bar when Salevrix is connected." },
      { title:"Try it out",
        desc:'Ask Claude: "List my top prospects" or "Show me pipeline stats" — Salevrix will respond with real data from your pipeline.' },
    ],
  },
  {
    id:"claude-code", label:"Claude Code", badge:"New",
    tagline:"Register Salevrix as an MCP server in Claude Code CLI. Query your pipeline and fire off emails without leaving the terminal.",
    features:[
      { icon:"⚡", title:"CLI Native",   desc:"Works inline with every Claude Code session" },
      { icon:"🔁", title:"Scriptable",   desc:"Build automated prospecting workflows" },
      { icon:"🛠️", title:"Dev Friendly", desc:"Full JSON output for piping and scripting" },
    ],
    steps:[
      { title:"Install Claude Code",
        desc:"Requires Node.js 18+. Install globally:", lang:"bash",
        code:"npm install -g @anthropic-ai/claude-code" },
      { title:"Register Salevrix via HTTP transport",
        desc:"Run once in your terminal — replace YOUR_API_KEY_HERE with the key below:", lang:"bash",
        code:`claude mcp add --transport http salevrix ${SERVER} \\
  --header "Authorization: Bearer YOUR_API_KEY_HERE"` },
      { title:"Verify the connection",
        desc:"List registered MCP servers:", lang:"bash",
        code:`claude mcp list
# salevrix   ${SERVER}   http   ✓ connected` },
      { title:"Use Salevrix in any Claude Code session",
        desc:"Start a session and talk to your pipeline:", lang:"bash",
        code:`claude
> List my prospects with status "new"
> Add a new prospect: John Doe, john@acme.com, Acme Corp
> Show me pipeline stats` },
    ],
  },
  {
    id:"chatgpt", label:"ChatGPT",
    tagline:"Add Salevrix as a Custom GPT Action. Build your own AI sales assistant powered by GPT-4o with full pipeline access.",
    features:[
      { icon:"🤖", title:"Custom GPT",        desc:"Build your own Salevrix-powered GPT" },
      { icon:"🗣️", title:"Natural Language",  desc:"Talk to your pipeline in plain English" },
      { icon:"📬", title:"Send Emails",        desc:"Trigger outreach directly from ChatGPT" },
    ],
    steps:[
      { title:"Create or open a Custom GPT",
        desc:"ChatGPT → Explore GPTs → Create → Configure tab (or edit an existing GPT you own)" },
      { title:"Add a new Action with the Salevrix schema",
        desc:"Under Actions → Add Action, paste this OpenAPI 3.1 schema:", lang:"yaml",
        code:`openapi: "3.1.0"
info:
  title: Salevrix AI
  description: AI-powered sales prospecting and outreach automation
  version: "1.0.0"
servers:
  - url: ${SERVER}
paths:
  /prospects:
    get:
      operationId: listProspects
      summary: List prospects from pipeline
      parameters:
        - name: status
          in: query
          schema: { type: string, enum: [new, contacted, replied, closed] }
        - name: limit
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
      responses:
        "200": { description: Array of prospect objects }
  /prospects/search:
    post:
      operationId: searchProspects
      summary: Search and filter prospects
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query: { type: string, description: "Name, company, or keyword" }
                status: { type: string }
      responses:
        "200": { description: Matching prospects }
  /emails/send:
    post:
      operationId: sendEmail
      summary: Send an outreach email to a prospect
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
                body: { type: string }
      responses:
        "200": { description: Email sent confirmation }` },
      { title:"Set authentication",
        desc:"In the Action config → Authentication → API Key → Auth Type: Bearer → paste your API key (the one shown below)" },
      { title:"Save and test",
        desc:'Click Save → Test the action → Then ask your GPT: "List my prospects" or "Show pipeline stats" — it will call the real Salevrix API.' },
    ],
  },
  {
    id:"codex", label:"Codex", badge:"Beta",
    tagline:"Integrate Salevrix with OpenAI GPT-4o / Codex via function calling. Build AI sales agents that search leads, update your pipeline, and get stats autonomously.",
    features:[
      { icon:"🧠", title:"AI Agents",     desc:"Build autonomous sales agents with GPT-4o" },
      { icon:"🔧", title:"Tool Calling",  desc:"Full function-calling with Salevrix tools" },
      { icon:"🚀", title:"Streaming",     desc:"Stream results directly into your app" },
    ],
    steps:[
      { title:"Install the OpenAI SDK",
        desc:"Requires Node.js 18+. Install in your project:", lang:"bash",
        code:"npm install openai" },
      { title:"Define Salevrix as OpenAI tools",
        desc:"These tool definitions map directly to real Salevrix MCP tools:", lang:"bash",
        code:`import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_prospects",
      description: "List prospects from the Salevrix pipeline",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["new","contacted","replied","closed","all"] },
          limit:  { type: "number", minimum: 1, maximum: 100 }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_stats",
      description: "Get pipeline statistics — counts by status, average AI score",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "add_prospect",
      description: "Add a new prospect to the pipeline",
      parameters: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name:    { type: "string" },
          email:   { type: "string" },
          company: { type: "string" },
          role:    { type: "string" }
        }
      }
    }
  }
];` },
      { title:"Call the Salevrix MCP endpoint when a tool fires",
        desc:"When GPT-4o calls a tool, forward it to the real Salevrix MCP API:", lang:"bash",
        code:`async function callSalevrix(name: string, args: Record<string, unknown>) {
  // Build a proper MCP JSON-RPC request
  const mcpRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name, arguments: args }
  };

  const res = await fetch("${SERVER}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${process.env.SALEVRIX_API_KEY}\`,
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify(mcpRequest)
  });

  const json = await res.json();
  return json?.result?.content?.[0]?.text ?? JSON.stringify(json);
}

// Run the agentic loop
const response = await client.chat.completions.create({
  model: "gpt-4o",
  tools,
  messages: [{ role: "user", content: "Show me my pipeline stats and list all new prospects" }]
});

if (response.choices[0].finish_reason === "tool_calls") {
  for (const tc of response.choices[0].message.tool_calls ?? []) {
    const result = await callSalevrix(tc.function.name, JSON.parse(tc.function.arguments));
    console.log(result);
  }
}` },
    ],
  },
  {
    id:"cursor", label:"Cursor",
    tagline:"Use Salevrix tools directly inside Cursor's AI Composer. Research leads, add prospects, and get pipeline stats — right in your editor.",
    features:[
      { icon:"🖊️", title:"In-Editor",    desc:"Prospect research inside your IDE" },
      { icon:"🤝", title:"Composer",     desc:"Full Salevrix tools in Cursor Composer" },
      { icon:"⚙️", title:"MCP Native",   desc:"First-class MCP HTTP transport support" },
    ],
    steps:[
      { title:"Open Cursor MCP settings",
        desc:"Cursor → Settings (⌘,) → Features → scroll to MCP Servers → Add new MCP server" },
      { title:"Add Salevrix with HTTP transport",
        desc:"Paste this into ~/.cursor/mcp.json (create if it doesn't exist). Replace YOUR_API_KEY_HERE with the key below:", lang:"json",
        code:`{
  "mcpServers": {
    "salevrix": {
      "url": "${SERVER}",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}` },
      { title:"Reload Cursor",
        desc:"Press ⌘⇧P → Reload Window → Enter. The Salevrix tools (list_prospects, add_prospect, get_stats, etc.) will appear in Cursor Composer." },
      { title:"Try it in Composer (⌘I)",
        desc:"Open Composer and type naturally:", lang:"bash",
        code:`List my top 10 prospects with status "new"
Add a prospect: Sarah Chen, sarah@acme.com, Acme Corp, VP Engineering
Show me my pipeline stats` },
    ],
  },
  {
    id:"telegram", label:"Telegram",
    tagline:"Control your entire sales pipeline from Telegram. Add prospects, send emails, and check stats — right from your phone.",
    features:[
      { icon:"📱", title:"Mobile First",    desc:"Manage your full pipeline from anywhere" },
      { icon:"🔔", title:"Real-time Alerts", desc:"Instant notifications on replies and opens" },
      { icon:"🤖", title:"Bot Commands",    desc:"Full /command set for every pipeline action" },
    ],
    steps:[
      { title:"Create a Telegram Bot",
        desc:"Open Telegram → search @BotFather → /newbot → follow the prompts → copy the HTTP API token you receive." },
      { title:"Install the official Grammy bot framework",
        desc:"Grammy is the real, actively-maintained Telegram bot framework for Node.js:", lang:"bash",
        code:"npm install grammy node-fetch" },
      { title:"Build the Salevrix bot",
        desc:"Create bot.ts — it calls the real Salevrix MCP API on every command:", lang:"bash",
        code:`import { Bot } from "grammy";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
const SALEVRIX = "${SERVER}";
const KEY = process.env.SALEVRIX_API_KEY!;

async function mcp(tool: string, args = {}) {
  const r = await fetch(SALEVRIX, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${KEY}\`,
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({ jsonrpc:"2.0", id:1, method:"tools/call", params:{ name:tool, arguments:args } })
  });
  const j = await r.json();
  return j?.result?.content?.[0]?.text ?? "No response";
}

bot.command("start",  ctx => ctx.reply("👋 Salevrix bot active. Try /prospects or /stats"));
bot.command("stats",  async ctx => ctx.reply(await mcp("get_stats")));
bot.command("prospects", async ctx => ctx.reply(await mcp("list_prospects", { limit: 10 })));
bot.command("new",    async ctx => ctx.reply(await mcp("list_prospects", { status:"new", limit:10 })));
bot.command("search", async ctx => {
  const q = ctx.message?.text?.split(" ").slice(1).join(" ");
  if (!q) return ctx.reply("Usage: /search <name or company>");
  ctx.reply(await mcp("search_prospects", { query: q }));
});

bot.start();
console.log("Salevrix Telegram bot running");` },
      { title:"Set environment variables and run",
        desc:"Add to your .env file and start the bot:", lang:"bash",
        code:`TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
SALEVRIX_API_KEY=YOUR_API_KEY_HERE

# Run the bot
npx tsx bot.ts` },
    ],
  },
  {
    id:"cli", label:"CLI",
    tagline:"Full terminal access to your Salevrix pipeline via the MCP HTTP API. Use curl, httpie, or any HTTP client — no install required.",
    features:[
      { icon:"⚡", title:"No install",   desc:"Just curl — works anywhere Node isn't available" },
      { icon:"🔗", title:"Pipeable",    desc:"JSON output — works perfectly with jq" },
      { icon:"🔑", title:"Bearer auth",  desc:"Your Firebase UID is the API key — copy it above" },
    ],
    steps:[
      { title:"Get your pipeline stats",
        desc:"Call the MCP endpoint directly with curl. Replace YOUR_API_KEY_HERE with your key shown above:", lang:"bash",
        code:`curl -s -X POST https://salevrix-ai.vercel.app/api/mcp \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_stats",
      "arguments": {}
    }
  }' | jq '.result.content[0].text'` },
      { title:"List your prospects",
        desc:"Fetch up to 100 prospects, optionally filtered by status (new | contacted | replied | closed | all):", lang:"bash",
        code:`curl -s -X POST https://salevrix-ai.vercel.app/api/mcp \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "list_prospects",
      "arguments": { "status": "new", "limit": 20 }
    }
  }' | jq -r '.result.content[0].text'` },
      { title:"Add a prospect",
        desc:"Insert a new lead directly into your pipeline:", lang:"bash",
        code:`curl -s -X POST https://salevrix-ai.vercel.app/api/mcp \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "add_prospect",
      "arguments": {
        "name": "Sarah Chen",
        "email": "sarah@company.com",
        "company": "Acme Corp",
        "role": "VP of Engineering"
      }
    }
  }' | jq '.result.content[0].text'` },
      { title:"Discover all available tools",
        desc:"List every MCP tool the server exposes:", lang:"bash",
        code:`curl -s -X POST https://salevrix-ai.vercel.app/api/mcp \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":0,"method":"tools/list","params":{}}' \\
  | jq '[.result.tools[].name]'` },
    ],
  },
];

/* ─── CodeBlock component ────────────────────────────────────── */
function CodeBlock({ code, lang, accent }:{ code:string; lang:string; accent:string }) {
  const [copied,setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).catch(()=>{});
    setCopied(true);
    setTimeout(()=>setCopied(false),1800);
  };
  return (
    <div style={{ borderRadius:10, overflow:"hidden", marginTop:12, border:"1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#07090f", padding:"6px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize:10, color:S.faint, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.08em" }}>{lang}</span>
        <button onClick={copy} style={{ background:"none", border:"none", cursor:"pointer", color:copied?accent:S.muted, fontSize:11.5, fontFamily:"Inter,sans-serif", display:"flex", alignItems:"center", gap:5, padding:"2px 6px", borderRadius:4, transition:"color 0.2s" }}>
          {copied
            ? <><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Copied!</>
            : <><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="5" y="1" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 4H2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5"/></svg>Copy</>}
        </button>
      </div>
      <pre style={{ margin:0, padding:"15px 16px", background:"#060810", overflowX:"auto", fontSize:12.5, lineHeight:1.75, color:"#dde0ea", fontFamily:'"JetBrains Mono","Cascadia Code","Fira Code",Menlo,monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MCPPage() {
  const { user, loading, handleLogout } = useAuth();
  const [active, setActive]       = useState<PlatformId>("claude");
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyCopied, setKeyCopied]   = useState(false);

  if (loading) return null;

  const p     = PLATFORMS.find(x => x.id === active)!;
  const brand = BRAND[active];

  // The API key IS the Firebase UID — no extra key management needed.
  // The MCP backend reads: Authorization: Bearer <uid>
  const uid        = user?.uid ?? "";
  const apiKeyReal = uid;
  const apiKeyMask = uid.slice(0, 6) + "••••••••••••••••••••••" + uid.slice(-4);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKeyReal).catch(()=>{});
    setKeyCopied(true);
    setTimeout(()=>setKeyCopied(false), 2000);
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:S.bg, fontFamily:"Inter,sans-serif", color:S.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .mcp-tab{
          background:none;border:1px solid transparent;cursor:pointer;
          display:flex;align-items:center;gap:9px;padding:9px 15px;
          border-radius:10px;color:${S.muted};font-size:13px;font-weight:600;
          transition:all 0.18s;white-space:nowrap;
          font-family:'Syne',sans-serif;letter-spacing:0.01em;
        }
        .mcp-tab:hover{ background:rgba(255,255,255,0.04); color:${S.text}; }
        .step-card{
          background:${S.panel2};border:1px solid rgba(255,255,255,0.06);
          border-radius:13px;padding:18px 20px;transition:border-color 0.18s;
        }
        .step-card:hover{ border-color:rgba(255,255,255,0.11); }
        .feat-card{
          background:${S.panel};border:1px solid rgba(255,255,255,0.06);
          border-radius:12px;padding:16px 18px;flex:1;min-width:140px;
        }
        .reveal-btn, .copy-key-btn{
          border:none;border-radius:8px;padding:7px 13px;
          font-size:12px;cursor:pointer;
          font-family:'Syne',sans-serif;font-weight:600;letter-spacing:0.02em;
          display:flex;align-items:center;gap:6px;transition:all 0.2s;
        }
        @media(max-width:900px){
          .mcp-main{ margin-left:0!important; padding:20px 16px 80px!important; max-width:100%!important; }
        }
      `}</style>

      <Sidebar active="mcp" user={user} onLogout={handleLogout}/>

      <main className="mcp-main" style={{ flex:1, marginLeft:240, padding:"28px 32px 80px", maxWidth:"calc(100% - 240px)", overflowX:"hidden" }}>

        {/* ── HERO ─────────────────────────────────────── */}
        <div style={{ background:S.panel, border:`1px solid ${S.line}`, borderRadius:18, padding:"36px 36px 32px", marginBottom:20, position:"relative", overflow:"hidden" }}>
          {/* animated glow */}
          <div style={{ position:"absolute", top:"-30%", right:"-5%", width:460, height:360, background:`radial-gradient(ellipse, ${brand.glow} 0%, transparent 65%)`, pointerEvents:"none", transition:"background 0.4s ease", borderRadius:"50%" }}/>

          <div style={{ position:"relative" }}>
            {/* MCP badge */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <span style={{ padding:"3px 11px", borderRadius:20, background:brand.bg, border:`1px solid ${brand.primary}30`, fontSize:11, fontWeight:700, color:brand.primary, letterSpacing:"0.07em", textTransform:"uppercase" as const, transition:"all 0.3s" }}>
                MCP
              </span>
              <span style={{ fontSize:12, color:S.faint }}>Model Context Protocol</span>
            </div>

            {/* headline */}
            <h1 style={{ fontFamily:"Syne,sans-serif", fontSize:30, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:10, maxWidth:560 }}>
              Connect Salevrix AI to{" "}
              <span style={{ color:brand.primary, transition:"color 0.3s" }}>{p.label}</span>
            </h1>
            <p style={{ fontSize:14, color:S.muted, lineHeight:1.7, maxWidth:520, marginBottom:24 }}>
              {p.tagline}
            </p>

            {/* CTAs */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" as const, alignItems:"center" }}>
              <button style={{
                background: brand.primary, border:"none", borderRadius:10,
                padding:"11px 24px", color: brand.textOnPrimary,
                fontSize:13, fontWeight:700, cursor:"pointer",
                fontFamily:"Syne,sans-serif", letterSpacing:"0.03em",
                display:"flex", alignItems:"center", gap:8,
                boxShadow:`0 0 28px ${brand.glow}`,
                transition:"all 0.3s",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Connect to {p.label}
              </button>
              <a href="#steps" style={{
                background:"rgba(255,255,255,0.05)", border:`1px solid ${S.line}`,
                borderRadius:10, padding:"11px 20px", color:S.muted,
                fontSize:13, fontWeight:600, fontFamily:"Syne,sans-serif",
                letterSpacing:"0.02em",
                textDecoration:"none", display:"flex", alignItems:"center", gap:7,
                transition:"all 0.2s",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 17v-5m0-4.01V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                How to connect?
              </a>
            </div>

            {/* endpoint pill */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:9, marginTop:20, background:"rgba(0,0,0,0.3)", border:`1px solid ${S.line}`, borderRadius:8, padding:"8px 14px" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:brand.primary, boxShadow:`0 0 8px ${brand.primary}`, flexShrink:0, transition:"background 0.3s" }}/>
              <code style={{ fontSize:12, color:S.muted, fontFamily:"monospace" }}>{SERVER}</code>
            </div>
          </div>
        </div>

        {/* ── PLATFORM TABS ────────────────────────────── */}
        <div style={{ background:S.panel, border:`1px solid ${S.line}`, borderRadius:14, padding:"10px", marginBottom:20 }}>
          <div style={{ display:"flex", gap:4, overflowX:"auto" as const, paddingBottom:2 }}>
            {PLATFORMS.map(pl => {
              const isActive = pl.id === active;
              const b = BRAND[pl.id];
              const Logo = LogoComponents[pl.id];
              return (
                <button
                  key={pl.id}
                  className="mcp-tab"
                  onClick={() => setActive(pl.id)}
                  style={{
                    background: isActive ? b.bg : "transparent",
                    border: `1px solid ${isActive ? b.primary + "50" : "transparent"}`,
                    color: isActive ? b.primary : S.muted,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <Logo size={20} active={isActive}/>
                  {pl.label}
                  {pl.badge && (
                    <span style={{
                      fontSize:9, padding:"1px 5px", borderRadius:3,
                      background: isActive ? b.primary + "25" : "rgba(255,255,255,0.06)",
                      color: isActive ? b.primary : S.faint,
                      fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.05em",
                    }}>
                      {pl.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FEATURE CARDS ────────────────────────────── */}
        <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" as const }}>
          {p.features.map((f,i) => (
            <div key={i} className="feat-card">
              <div style={{ fontSize:22, marginBottom:8 }}>{f.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:S.text, marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:12, color:S.muted, lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* ── API KEY ──────────────────────────────────── */}
        <div style={{ background:S.panel, border:`1px solid ${S.line}`, borderRadius:14, padding:"18px 22px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap" as const, gap:10 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:S.text, marginBottom:2 }}>Your API Key (Firebase UID)</div>
              <div style={{ fontSize:12, color:S.muted }}>
                This is your Firebase UID — use it as the Bearer token. Replace{" "}
                <code style={{ fontFamily:"monospace", color:brand.primary, background:brand.bg, padding:"1px 5px", borderRadius:3 }}>YOUR_API_KEY_HERE</code> in every config below.
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="reveal-btn" onClick={()=>setKeyVisible(v=>!v)} style={{ background:"rgba(255,255,255,0.05)", color:S.muted }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d={keyVisible
                    ?"M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                    :"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z"}
                    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                {keyVisible ? "Hide" : "Reveal"}
              </button>
              <button className="copy-key-btn" onClick={copyKey} style={{ background:brand.bg, border:`1px solid ${brand.primary}30`, color:brand.primary, fontWeight:700 }}>
                {keyCopied
                  ? <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Copied!</>
                  : <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="5" y="1" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 4H2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5"/></svg>Copy Key</>}
              </button>
            </div>
          </div>
          <div style={{
            background:"#07090f", border:`1px solid ${S.line}`, borderRadius:8,
            padding:"11px 15px", fontFamily:"monospace", fontSize:13, color:S.text,
            letterSpacing: keyVisible ? "0.02em" : "0.1em", userSelect:"all" as const,
            wordBreak:"break-all" as const,
          }}>
            {keyVisible ? apiKeyReal : apiKeyMask}
          </div>
        </div>

        {/* ── SETUP STEPS ──────────────────────────────── */}
        <div id="steps">
          <div style={{ fontSize:11, color:S.faint, textTransform:"uppercase" as const, letterSpacing:"0.08em", fontWeight:700, marginBottom:14 }}>
            Setup Guide — {p.label}
          </div>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
            {p.steps.map((step,i) => (
              <div key={i} className="step-card">
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{
                    width:27, height:27, borderRadius:"50%",
                    background:brand.bg, border:`1px solid ${brand.primary}35`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:800, color:brand.primary,
                    flexShrink:0, transition:"all 0.3s",
                  }}>
                    {i + 1}
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

        {/* ── HELP FOOTER ──────────────────────────────── */}
        <div style={{ marginTop:20, padding:"16px 20px", background:S.panel2, border:`1px solid ${S.line}`, borderRadius:12, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" as const }}>
          <div style={{ width:36, height:36, borderRadius:9, background:brand.bg, border:`1px solid ${brand.primary}25`, display:"grid", placeItems:"center", flexShrink:0, transition:"all 0.3s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={brand.primary} strokeWidth="1.5"/>
              <path d="M12 17v-5m0-4.01V8" stroke={brand.primary} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.text }}>Need help connecting {p.label}?</div>
            <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>
              Email{" "}
              <a href="mailto:support@salevrix.ai" style={{ color:brand.primary, textDecoration:"none" }}>support@salevrix.ai</a>
              {" · "}
              MCP endpoint: <code style={{ fontFamily:"monospace", fontSize:11, color:brand.primary }}>POST /api/mcp</code>
            </div>
          </div>
          <div style={{ fontSize:11, color:S.faint, textAlign:"right" as const, lineHeight:1.6 }}>
            <div>MCP v1.0</div>
            <div style={{ color:brand.primary, fontWeight:700, transition:"color 0.3s" }}>● Live</div>
          </div>
        </div>

      </main>
    </div>
  );
}
