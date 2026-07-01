"use client";
import { useState, useEffect, useCallback } from "react";

export type SequenceStep = {
  id: string;
  type: "email" | "linkedin" | "call" | "sms";
  day: number;
  subject: string;
  body: string;
  aiWritten: boolean;
};

export type DbSequence = {
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

export function useSequences(userId: string | undefined) {
  const [sequences, setSequences] = useState<DbSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSequences = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/sequences?userId=${userId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSequences(data.sequences ?? []);
      setError("");
    } catch (err: any) {
      setError(err.message ?? "Failed to load sequences");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const createSequence = async (seqData: Partial<DbSequence>) => {
    if (!userId) return null;
    const res = await fetch("/api/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...seqData }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setSequences(prev => [data.sequence, ...prev]);
    return data.sequence;
  };

  const updateSequence = async (id: string, updates: Partial<DbSequence>) => {
    const res = await fetch("/api/sequences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setSequences(prev => prev.map(s => s.id === id ? data.sequence : s));
    return data.sequence;
  };

  const deleteSequence = async (id: string) => {
    const res = await fetch(`/api/sequences?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setSequences(prev => prev.filter(s => s.id !== id));
  };

  return { sequences, loading, error, createSequence, updateSequence, deleteSequence, refetch: fetchSequences };
}
