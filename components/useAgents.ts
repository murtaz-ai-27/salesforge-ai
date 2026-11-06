"use client";
import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type {
  Agent,
  AgentsResponse,
  AgentResponse,
} from "@/types";

export type { Agent } from "@/types";

export function useAgents(userId: string | undefined) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchAgents = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await api.get<AgentsResponse>(`/api/agents?userId=${userId}`);
      setAgents(data.agents ?? []);
      setError("");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load agents";
      console.error("[useAgents]", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const toggleAgent = async (id: string, currentStatus: Agent["status"]): Promise<Agent | null> => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      const data = await api.patch<AgentResponse>("/api/agents", { id, status: newStatus });
      setAgents(prev => prev.map(a => a.id === id ? data.agent : a));
      return data.agent;
    } catch (err) {
      console.error("[useAgents] toggleAgent:", err);
      throw err;
    }
  };

  const incrementStat = async (
    id: string,
    field: "meetings_booked" | "emails_sent" | "replies_handled",
    agent: Agent
  ) => {
    try {
      const data = await api.patch<AgentResponse>("/api/agents", {
        id,
        [field]: (agent[field] ?? 0) + 1,
      });
      setAgents(prev => prev.map(a => a.id === id ? data.agent : a));
    } catch (err) {
      console.error("[useAgents] incrementStat:", err);
    }
  };

  return {
    agents,
    loading,
    error,
    toggleAgent,
    incrementStat,
    refetch: fetchAgents,
  };
}
