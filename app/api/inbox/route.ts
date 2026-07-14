import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return then.toLocaleDateString();
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Get all sent emails with prospect info
    const { data: emailLogs, error } = await supabaseAdmin
      .from("email_logs")
      .select(`
        id, prospect_id, subject, body, status, sent_at,
        prospects(name, email, company, role, avatar_init, avatar_bg, avatar_color)
      `)
      .eq("user_id", userId)
      .not("prospect_id", "is", null)
      .order("sent_at", { ascending: false });

    if (error) throw error;

    if (!emailLogs || emailLogs.length === 0) {
      return NextResponse.json({ threads: [] });
    }

    // Group by prospect — one thread per prospect
    const threadMap = new Map<string, any>();

    for (const log of emailLogs) {
      const prospect = log.prospects as any;
      if (!prospect) continue;

      const prospectId = log.prospect_id;

      if (!threadMap.has(prospectId)) {
        threadMap.set(prospectId, {
          id: prospectId,
          prospectId,
          name: prospect.name ?? "Unknown",
          email: prospect.email ?? "",
          company: prospect.company ?? "",
          role: prospect.role ?? "",
          avatarInit: prospect.avatar_init ?? "?",
          avatarBg: prospect.avatar_bg ?? "linear-gradient(140deg,#C8FF00,#86efac)",
          avatarColor: prospect.avatar_color ?? "#050505",
          subject: log.subject,
          lastMessage: log.body?.slice(0, 80) + "...",
          time: timeAgo(log.sent_at),
          unread: false,
          sentiment: "neutral" as const,
          messages: [],
        });
      }

      const thread = threadMap.get(prospectId);
      thread.messages.push({
        from: "me",
        text: log.body,
        time: timeAgo(log.sent_at),
      });
    }

    // Convert to array, newest first
    const threads = Array.from(threadMap.values());

    return NextResponse.json({ threads });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
