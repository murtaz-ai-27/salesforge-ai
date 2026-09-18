"use client";
import { useState, useEffect, useCallback } from "react";

export type Prospect = {
  id: string;
  name: string;
  email: string;
  company?: string;
  title?: string;
  role?: string;
  industry?: string;
  company_size?: string;
  linkedin_url?: string;
  score?: number;
  intent?: "high" | "medium" | "low" | string;
  ai_score?: number;
  buying_intent?: "high" | "medium" | "low" | string;
  status?: string;
  notes?: string;
  avatar_init?: string;
  avatar_bg?: string;
  avatar_color?: string;
  sequence_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export function useProspects(userId: string | undefined) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProspects = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/prospects?userId=${userId}`);
      const data = await res.json();
      if (!data.error) setProspects(data.prospects ?? []);
    } catch {}
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const addProspect = async (prospect: Omit<Prospect, 'id'>): Promise<Prospect | null> => {
    if (!userId) return null;
    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...prospect }),
      });
      const data = await res.json();
      if (data.prospect) {
        setProspects(prev => [data.prospect, ...prev]);
        return data.prospect;
      }
      return null;
    } catch { return null; }
  };

  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    try {
      const res = await fetch('/api/prospects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.prospect) {
        setProspects(prev => prev.map(p => p.id === id ? data.prospect : p));
      }
    } catch {}
  };

  const deleteProspect = async (id: string) => {
    try {
      await fetch(`/api/prospects?id=${id}`, { method: 'DELETE' });
      setProspects(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const bulkAddProspects = async (newProspects: Omit<Prospect, 'id'>[]) => {
    if (!userId) return;
    try {
      const res = await fetch('/api/prospects/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prospects: newProspects }),
      });
      const data = await res.json();
      if (data.prospects) setProspects(prev => [...data.prospects, ...prev]);
    } catch {}
  };

  return { prospects, loading, addProspect, updateProspect, deleteProspect, bulkAddProspects, refetch: fetchProspects };
}
