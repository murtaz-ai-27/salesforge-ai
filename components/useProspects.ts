"use client";
import { useState, useEffect, useCallback } from "react";

export type DbProspect = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  industry: string;
  company_size: string;
  linkedin_url: string;
  ai_score: number;
  buying_intent: "high" | "medium" | "low";
  status: "new" | "contacted" | "replied" | "meeting" | "closed" | "lost";
  notes: string;
  avatar_init: string;
  avatar_bg: string;
  avatar_color: string;
  created_at: string;
};

export function useProspects(userId: string | undefined) {
  const [prospects, setProspects] = useState<DbProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProspects = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/prospects?userId=${userId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProspects(data.prospects ?? []);
      setError("");
    } catch (err: any) {
      setError(err.message ?? "Failed to load prospects");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProspects(); }, [fetchProspects]);

  const addProspect = async (prospect: Partial<DbProspect>) => {
    if (!userId) return null;
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...prospect }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setProspects(prev => [data.prospect, ...prev]);
    return data.prospect;
  };

  const bulkAddProspects = async (newProspects: Partial<DbProspect>[]) => {
    if (!userId) return [];
    const res = await fetch("/api/prospects/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, prospects: newProspects }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setProspects(prev => [...(data.prospects ?? []), ...prev]);
    return data.prospects;
  };

  const updateProspect = async (id: string, updates: Partial<DbProspect>) => {
    const res = await fetch("/api/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setProspects(prev => prev.map(p => p.id === id ? data.prospect : p));
    return data.prospect;
  };

  const deleteProspect = async (id: string) => {
    const res = await fetch(`/api/prospects?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setProspects(prev => prev.filter(p => p.id !== id));
  };

  return { prospects, loading, error, addProspect, bulkAddProspects, updateProspect, deleteProspect, refetch: fetchProspects };
}
