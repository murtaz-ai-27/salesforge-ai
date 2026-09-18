"use client";
import { useState, useEffect, useCallback } from "react";

export type Prospect = {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  linkedin_url?: string;
  score?: number;
  intent?: string;
  status?: string;
  notes?: string;
  created_at?: string;
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

  const addProspect = async (prospect: Omit<Prospect, 'id'>) => {
    if (!userId) return;
    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...prospect }),
      });
      const data = await res.json();
      if (data.prospect) setProspects(prev => [data.prospect, ...prev]);
    } catch {}
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
