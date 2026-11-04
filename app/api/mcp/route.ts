/**
 * Salevrix MCP Server — real Model Context Protocol endpoint
 *
 * Uses the official @modelcontextprotocol/sdk with the Web Standard
 * StreamableHTTP transport, which runs natively on Vercel/Next.js (Node 18+).
 *
 * Authentication: Bearer token in Authorization header.
 * The token is the user's Firebase UID (available on the client via user.uid).
 *
 * Tools exposed:
 *  • list_prospects   — fetch prospects from Supabase
 *  • add_prospect     — insert a new prospect
 *  • update_prospect  — change status / notes
 *  • delete_prospect  — remove a prospect
 *  • get_stats        — pipeline summary counts
 *  • search_prospects — full-text search by name/company/email
 */

import { NextRequest, NextResponse } from "next/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { z } from "zod";

/* ── Auth helper ──────────────────────────────────────────────────── */
function extractUserId(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim() || null;
  return null;
}

/* ── Build a fresh McpServer for each request (stateless) ─────────── */
function buildServer(userId: string): McpServer {
  const server = new McpServer({
    name: "salevrix",
    version: "1.0.0",
  });

  /* ── list_prospects ─────────────────────────────────────────── */
  server.tool(
    "list_prospects",
    "List prospects from your Salevrix pipeline. Optionally filter by status.",
    {
      status: z
        .enum(["new", "contacted", "replied", "closed", "all"])
        .optional()
        .default("all")
        .describe("Filter by prospect status"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .default(20)
        .describe("Maximum number of prospects to return"),
    },
    async ({ status, limit }) => {
      let query = supabaseAdmin
        .from("prospects")
        .select("id, name, email, role, company, status, ai_score, buying_intent, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit ?? 20);

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }

      const rows = (data ?? []).map((p) =>
        `• ${p.name} <${p.email}> | ${p.company ?? "—"} | ${p.role ?? "—"} | Status: ${p.status} | AI Score: ${p.ai_score ?? "N/A"}`
      );
      return {
        content: [
          {
            type: "text",
            text:
              rows.length === 0
                ? "No prospects found."
                : `Found ${rows.length} prospect(s):\n\n${rows.join("\n")}`,
          },
        ],
      };
    }
  );

  /* ── search_prospects ───────────────────────────────────────── */
  server.tool(
    "search_prospects",
    "Search prospects by name, email, or company name.",
    {
      query: z.string().min(1).describe("Search term — matches name, email, or company"),
      limit: z.number().int().min(1).max(50).optional().default(10),
    },
    async ({ query, limit }) => {
      // Supabase ilike search across name, email, company
      const term = `%${query}%`;
      const { data, error } = await supabaseAdmin
        .from("prospects")
        .select("id, name, email, role, company, status, ai_score")
        .eq("user_id", userId)
        .or(`name.ilike.${term},email.ilike.${term},company.ilike.${term}`)
        .limit(limit ?? 10);

      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }

      const rows = (data ?? []).map((p) =>
        `• [${p.id}] ${p.name} <${p.email}> | ${p.company ?? "—"} | Status: ${p.status}`
      );
      return {
        content: [
          {
            type: "text",
            text:
              rows.length === 0
                ? `No prospects matching "${query}".`
                : `${rows.length} result(s) for "${query}":\n\n${rows.join("\n")}`,
          },
        ],
      };
    }
  );

  /* ── add_prospect ───────────────────────────────────────────── */
  server.tool(
    "add_prospect",
    "Add a new prospect to your Salevrix pipeline.",
    {
      name:    z.string().min(1).describe("Full name"),
      email:   z.string().email().describe("Email address"),
      company: z.string().optional().describe("Company name"),
      role:    z.string().optional().describe("Job title / role"),
      notes:   z.string().optional().describe("Any notes about this prospect"),
    },
    async ({ name, email, company, role, notes }) => {
      // Check for duplicate email
      const { data: existing } = await supabaseAdmin
        .from("prospects")
        .select("id")
        .eq("user_id", userId)
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (existing) {
        return {
          content: [{ type: "text", text: `A prospect with email ${email} already exists (id: ${existing.id}).` }],
          isError: true,
        };
      }

      const initials = name.trim().split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
      const colors = ["#CC785C","#10A37F","#a07aff","#2AABEE","#C8FF00","#f97316","#ec4899"];
      const bg = colors[Math.floor(Math.random() * colors.length)];

      const { data, error } = await supabaseAdmin
        .from("prospects")
        .insert({
          user_id:      userId,
          name:         name.trim(),
          email:        email.trim().toLowerCase(),
          company:      company ?? null,
          role:         role ?? null,
          notes:        notes ?? null,
          status:       "new",
          avatar_init:  initials,
          avatar_bg:    bg,
          avatar_color: "#fff",
        })
        .select("id, name, email")
        .single();

      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Added prospect: ${data.name} <${data.email}> (id: ${data.id})`,
          },
        ],
      };
    }
  );

  /* ── update_prospect ────────────────────────────────────────── */
  server.tool(
    "update_prospect",
    "Update a prospect's status or notes.",
    {
      id:     z.string().uuid().describe("Prospect ID (UUID)"),
      status: z
        .enum(["new", "contacted", "replied", "closed"])
        .optional()
        .describe("New status"),
      notes:  z.string().optional().describe("Updated notes"),
    },
    async ({ id, status, notes }) => {
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;

      if (Object.keys(updates).length === 0) {
        return {
          content: [{ type: "text", text: "Nothing to update — provide status and/or notes." }],
          isError: true,
        };
      }

      const { data, error } = await supabaseAdmin
        .from("prospects")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select("id, name, status")
        .single();

      if (error || !data) {
        return {
          content: [{ type: "text", text: error ? `Error: ${error.message}` : "Prospect not found." }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Updated prospect ${data.name}: status = ${data.status}`,
          },
        ],
      };
    }
  );

  /* ── delete_prospect ────────────────────────────────────────── */
  server.tool(
    "delete_prospect",
    "Permanently delete a prospect from your pipeline.",
    {
      id: z.string().uuid().describe("Prospect ID (UUID) to delete"),
    },
    async ({ id }) => {
      const { data, error } = await supabaseAdmin
        .from("prospects")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("name, email")
        .single();

      if (error || !data) {
        return {
          content: [{ type: "text", text: error ? `Error: ${error.message}` : "Prospect not found or already deleted." }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `🗑️ Deleted prospect: ${data.name} <${data.email}>`,
          },
        ],
      };
    }
  );

  /* ── get_stats ──────────────────────────────────────────────── */
  server.tool(
    "get_stats",
    "Get pipeline statistics — total prospects, counts by status, average AI score.",
    {},
    async () => {
      const { data, error } = await supabaseAdmin
        .from("prospects")
        .select("status, ai_score")
        .eq("user_id", userId);

      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }

      const all = data ?? [];
      const counts: Record<string, number> = { new: 0, contacted: 0, replied: 0, closed: 0 };
      let scoreSum = 0, scoredCount = 0;

      for (const p of all) {
        counts[p.status] = (counts[p.status] ?? 0) + 1;
        if (p.ai_score != null) { scoreSum += p.ai_score; scoredCount++; }
      }

      const avgScore = scoredCount > 0 ? (scoreSum / scoredCount).toFixed(1) : "N/A";

      return {
        content: [
          {
            type: "text",
            text: [
              `📊 Salevrix Pipeline Stats`,
              `─────────────────────────`,
              `Total prospects : ${all.length}`,
              `  New           : ${counts.new}`,
              `  Contacted     : ${counts.contacted}`,
              `  Replied       : ${counts.replied}`,
              `  Closed        : ${counts.closed}`,
              `Avg AI Score    : ${avgScore}`,
            ].join("\n"),
          },
        ],
      };
    }
  );

  return server;
}

/* ── Route handler ────────────────────────────────────────────────── */
async function handler(req: NextRequest): Promise<Response> {
  // Auth check
  const userId = extractUserId(req);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid Authorization header. Use: Bearer <your-firebase-uid>" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const mcpServer = buildServer(userId);
    // Stateless mode — a new transport per request, no session state needed
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
      enableJsonResponse: false,
    });

    await mcpServer.connect(transport);
    const response = await transport.handleRequest(req);
    await mcpServer.close();
    return response;
  } catch (err: unknown) {
    console.error("[MCP] Handler error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const GET  = handler;
export const POST = handler;
export const DELETE = handler;

// Required for Vercel streaming responses
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
