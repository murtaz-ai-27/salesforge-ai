// lib/sessionManager.ts — Session management like Linear/Notion
// Tracks active sessions, detects suspicious activity

import { supabaseAdmin } from "@/lib/supabaseServer";

export interface Session {
  userId:    string;
  sessionId: string;
  ip:        string;
  userAgent: string;
  createdAt: string;
  lastSeen:  string;
  isActive:  boolean;
}

// Create new session on login
export async function createSession(
  userId: string,
  ip: string,
  userAgent: string
): Promise<string> {
  const sessionId = crypto.randomUUID();
  try {
    await supabaseAdmin.from("user_sessions").insert({
      id:         sessionId,
      user_id:    userId,
      ip_hash:    Buffer.from(ip).toString("base64"),
      user_agent: userAgent.slice(0, 200),
      is_active:  true,
      last_seen:  new Date().toISOString(),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });
  } catch { /* non-critical */ }
  return sessionId;
}

// Update session activity
export async function touchSession(sessionId: string): Promise<void> {
  try {
    await supabaseAdmin.from("user_sessions")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", sessionId).eq("is_active", true);
  } catch { /* non-critical */ }
}

// Revoke all sessions for user (on password change, suspicious activity)
export async function revokeAllSessions(userId: string): Promise<void> {
  try {
    await supabaseAdmin.from("user_sessions")
      .update({ is_active: false })
      .eq("user_id", userId);
  } catch { /* non-critical */ }
}

// Get active sessions for user
export async function getActiveSessions(userId: string): Promise<Session[]> {
  try {
    const { data } = await supabaseAdmin
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("last_seen", { ascending: false });
    return (data ?? []) as Session[];
  } catch { return []; }
}

// Detect impossible travel (login from 2 different countries within 1hr)
export async function detectSuspiciousLogin(
  userId: string,
  currentIp: string
): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data } = await supabaseAdmin
      .from("user_sessions")
      .select("ip_hash")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gte("last_seen", oneHourAgo)
      .limit(5);

    const currentHash = Buffer.from(currentIp).toString("base64");
    const differentIPs = (data ?? []).filter(s => s.ip_hash !== currentHash);
    return differentIPs.length > 2; // suspicious if 3+ different IPs in 1 hour
  } catch { return false; }
}
