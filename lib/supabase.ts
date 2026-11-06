/**
 * lib/supabase.ts — Browser-side Supabase client (anon key + RLS).
 *
 * ⚠️  This client uses the PUBLIC anon key and is subject to Row Level Security.
 *     For server-side admin operations use lib/supabaseServer.ts instead.
 *
 * All type definitions live in types/index.ts — import from there, not here.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-export types for convenience — the canonical source is types/index.ts
export type {
  Prospect,
  Sequence,
  SequenceStep,
  Agent,
  EmailLog,
  UserProfile,
} from "@/types";
