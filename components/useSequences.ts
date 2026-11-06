"use client";
import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type {
  Sequence,
  SequencesResponse,
  SequenceResponse,
} from "@/types";

export type { Sequence, SequenceStep } from "@/types";

export function useSequences(userId: string | undefined) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchSequences = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await api.get<SequencesResponse>(`/api/sequences?userId=${userId}`);
      setSequences(data.sequences ?? []);
      setError("");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load sequences";
      console.error("[useSequences]", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const createSequence = async (seqData: Partial<Sequence>): Promise<Sequence | null> => {
    if (!userId) return null;
    try {
      const data = await api.post<SequenceResponse>("/api/sequences", { userId, ...seqData });
      setSequences(prev => [data.sequence, ...prev]);
      return data.sequence;
    } catch (err) {
      console.error("[useSequences] createSequence:", err);
      throw err; // rethrow so callers can show feedback
    }
  };

  const updateSequence = async (id: string, updates: Partial<Sequence>): Promise<Sequence | null> => {
    try {
      const data = await api.patch<SequenceResponse>("/api/sequences", { id, ...updates });
      setSequences(prev => prev.map(s => s.id === id ? data.sequence : s));
      return data.sequence;
    } catch (err) {
      console.error("[useSequences] updateSequence:", err);
      throw err;
    }
  };

  const deleteSequence = async (id: string) => {
    try {
      await api.delete(`/api/sequences?id=${id}`);
      setSequences(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("[useSequences] deleteSequence:", err);
      throw err;
    }
  };

  return {
    sequences,
    loading,
    error,
    createSequence,
    updateSequence,
    deleteSequence,
    refetch: fetchSequences,
  };
}
