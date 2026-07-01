"use client";
import { useState, useEffect, useCallback } from "react";

export type DbAgent = {
  id: string;
  user_id: string;
  name: string;
  type: "sdr" | "email_coach" | "deal_analyzer" | "objection_handler" | "meeting_summarizer";
  status: "active" | "paused" | "training";
  config: Record<string, any>;
  meetings_booked: number;
  emails_sent: number;
  replies_handled: number;
  created_at: string;
};

export function useAgents(userId: string | undefined) {
  const [agents, setAgents] = useState<DbAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAgents = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/agents?userId=${userId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAgents(data.agents ?? []);
      setError("");
    } catch (err: any) {
      setError(err.message ?? "Failed to load agents");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const toggleAgent = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    const res = await fetch("/api/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setAgents(prev => prev.map(a => a.id === id ? data.agent : a));
    return data.agent;
  };

  const incrementStat = async (id: string, field: "meetings_booked"|"emails_sent"|"replies_handled", agent: DbAgent) => {
    const res = await fetch("/api/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: (agent[field] ?? 0) + 1 }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setAgents(prev => prev.map(a => a.id === id ? data.agent : a));
  };

  return { agents, loading, error, toggleAgent, incrementStat, refetch: fetchAgents };
}
