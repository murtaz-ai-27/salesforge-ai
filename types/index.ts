/**
 * types/index.ts — Single source of truth for all app types.
 *
 * Rules:
 *  - All DB-shape types live here. Never redefine them in hooks or pages.
 *  - Import from "@/types" everywhere.
 *  - API route return shapes also live here so request/response stay in sync.
 */

// ─── Enums / Union literals ───────────────────────────────────────────────────

export type ProspectStatus =
  | "new"
  | "contacted"
  | "replied"
  | "meeting"
  | "closed"
  | "lost";

export type BuyingIntent = "high" | "medium" | "low";

export type SequenceStepType = "email" | "linkedin" | "call" | "sms";

export type SequenceStatus = "active" | "paused" | "draft";

export type AgentType =
  | "sdr"
  | "email_coach"
  | "deal_analyzer"
  | "objection_handler"
  | "meeting_summarizer";

export type AgentStatus = "active" | "paused" | "training";

export type EmailLogStatus =
  | "sent"
  | "opened"
  | "clicked"
  | "replied"
  | "bounced";

export type Plan = "free" | "starter" | "pro" | "enterprise";

// ─── Core domain types ────────────────────────────────────────────────────────

export type Prospect = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  company?: string;
  company_size?: string;
  industry?: string;
  linkedin_url?: string;
  /** UI alias for title — kept for backwards compat with existing pages */
  role?: string;
  ai_score: number;
  buying_intent: BuyingIntent;
  status: ProspectStatus;
  sequence_id?: string;
  notes?: string;
  /** Display-only — computed client-side, not stored in DB */
  avatar_init?: string;
  avatar_bg?: string;
  avatar_color?: string;
  created_at: string;
  updated_at?: string;
};

export type SequenceStep = {
  id: string;
  type: SequenceStepType;
  day: number;
  subject?: string;
  body: string;
  aiWritten: boolean;
};

export type Sequence = {
  id: string;
  user_id: string;
  name: string;
  status: SequenceStatus;
  steps: SequenceStep[];
  prospect_count: number;
  open_rate: number;
  reply_rate: number;
  meeting_rate: number;
  created_at: string;
};

export type Agent = {
  id: string;
  user_id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  config: Record<string, unknown>;
  meetings_booked: number;
  emails_sent: number;
  replies_handled: number;
  created_at: string;
};

export type EmailLog = {
  id: string;
  user_id: string;
  prospect_id: string;
  sequence_id?: string;
  subject: string;
  body: string;
  status: EmailLogStatus;
  opened_at?: string;
  replied_at?: string;
  sent_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  display_name?: string;
  company?: string;
  role?: string;
  timezone?: string;
  avatar_url?: string;
  notif_email?: boolean;
  notif_hot_lead?: boolean;
  notif_reply?: boolean;
  notif_meeting?: boolean;
  plan: Plan;
  created_at: string;
  updated_at?: string;
};

// ─── API response shapes ──────────────────────────────────────────────────────

export type ApiErrorResponse = { error: string; code?: string };

export type ProspectsResponse = { prospects: Prospect[] };
export type ProspectResponse = { prospect: Prospect };

export type SequencesResponse = { sequences: Sequence[] };
export type SequenceResponse = { sequence: Sequence };

export type AgentsResponse = { agents: Agent[] };
export type AgentResponse = { agent: Agent };

export type ProfileResponse = { profile: UserProfile | null };

export type DashboardStatsResponse = {
  totalProspects: number;
  hotLeads: number;
  emailsSent: number;
  meetingsBooked: number;
  openRate: number;
  replyRate: number;
  pipelineValue: number;
  activeSequences: number;
};
