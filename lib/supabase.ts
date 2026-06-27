// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Prospect = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  company: string;
  company_size?: string;
  industry?: string;
  linkedin_url?: string;
  ai_score: number;
  buying_intent: "high" | "medium" | "low";
  status: "new" | "contacted" | "replied" | "meeting" | "closed" | "lost";
  sequence_id?: string;
  notes?: string;
  created_at: string;
};

export type Sequence = {
  id: string;
  user_id: string;
  name: string;
  status: "active" | "paused" | "draft";
  steps: SequenceStep[];
  prospect_count: number;
  open_rate: number;
  reply_rate: number;
  meeting_rate: number;
  created_at: string;
};

export type SequenceStep = {
  id: string;
  type: "email" | "linkedin" | "call" | "sms";
  day: number;
  subject?: string;
  body: string;
  ai_written: boolean;
};

export type Agent = {
  id: string;
  user_id: string;
  name: string;
  type: "sdr" | "email_coach" | "deal_analyzer" | "meeting_summarizer" | "objection_handler";
  status: "active" | "paused" | "training";
  config: Record<string, any>;
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
  status: "sent" | "opened" | "clicked" | "replied" | "bounced";
  opened_at?: string;
  replied_at?: string;
  sent_at: string;
};

// DB Helper functions
export const db = {
  // Prospects
  async getProspects(userId: string) {
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("user_id", userId)
      .order("ai_score", { ascending: false });
    if (error) throw error;
    return data as Prospect[];
  },

  async addProspect(prospect: Omit<Prospect, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("prospects")
      .insert(prospect)
      .select()
      .single();
    if (error) throw error;
    return data as Prospect;
  },

  async updateProspect(id: string, updates: Partial<Prospect>) {
    const { data, error } = await supabase
      .from("prospects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Prospect;
  },

  // Sequences
  async getSequences(userId: string) {
    const { data, error } = await supabase
      .from("sequences")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Sequence[];
  },

  // Agents
  async getAgents(userId: string) {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data as Agent[];
  },

  async updateAgent(id: string, updates: Partial<Agent>) {
    const { data, error } = await supabase
      .from("agents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Agent;
  },

  // Analytics
  async getDashboardStats(userId: string) {
    const [prospects, sequences, agents, emails] = await Promise.all([
      supabase.from("prospects").select("id, status, ai_score, buying_intent").eq("user_id", userId),
      supabase.from("sequences").select("id, status, open_rate, reply_rate, meeting_rate").eq("user_id", userId),
      supabase.from("agents").select("id, meetings_booked, emails_sent").eq("user_id", userId),
      supabase.from("email_logs").select("id, status, sent_at").eq("user_id", userId),
    ]);
    return {
      prospects: prospects.data ?? [],
      sequences: sequences.data ?? [],
      agents: agents.data ?? [],
      emails: emails.data ?? [],
    };
  },
};
