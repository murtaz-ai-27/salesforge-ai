"use client";
import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type {
  Prospect,
  ProspectsResponse,
  ProspectResponse,
} from "@/types";

export type { Prospect } from "@/types";

export function useProspects(userId: string | undefined) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchProspects = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await api.get<ProspectsResponse>(`/api/prospects?userId=${userId}`);
      setProspects(data.prospects ?? []);
      setError("");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load prospects";
      console.error("[useProspects]", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchProspects(); }, [fetchProspects]);

  const addProspect = async (prospect: Omit<Prospect, "id" | "created_at" | "user_id">): Promise<Prospect | null> => {
    if (!userId) return null;
    try {
      const data = await api.post<ProspectResponse>("/api/prospects", { userId, ...prospect });
      setProspects(prev => [data.prospect, ...prev]);
      return data.prospect;
    } catch (err) {
      console.error("[useProspects] addProspect:", err);
      return null;
    }
  };

  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    try {
      const data = await api.patch<ProspectResponse>("/api/prospects", { id, ...updates });
      setProspects(prev => prev.map(p => p.id === id ? data.prospect : p));
    } catch (err) {
      console.error("[useProspects] updateProspect:", err);
    }
  };

  const deleteProspect = async (id: string) => {
    try {
      await api.delete(`/api/prospects?id=${id}`);
      setProspects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("[useProspects] deleteProspect:", err);
    }
  };

  const bulkAddProspects = async (newProspects: Omit<Prospect, "id" | "created_at">[]) => {
    if (!userId) return;
    try {
      const data = await api.post<ProspectsResponse>("/api/prospects/import", {
        userId,
        prospects: newProspects,
      });
      if (data.prospects) setProspects(prev => [...data.prospects, ...prev]);
    } catch (err) {
      console.error("[useProspects] bulkAddProspects:", err);
    }
  };

  return {
    prospects,
    loading,
    error,
    addProspect,
    updateProspect,
    deleteProspect,
    bulkAddProspects,
    refetch: fetchProspects,
  };
}
