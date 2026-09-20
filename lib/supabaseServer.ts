import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "[Salevrix] Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check Vercel settings."
  );
}

// Validate URL format
try { new URL(supabaseUrl); } catch {
  throw new Error("[Salevrix] NEXT_PUBLIC_SUPABASE_URL is not a valid URL.");
}

// Server-side admin client
// IMPORTANT: Never expose this client to the browser
// It bypasses Row Level Security — only use in API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      "x-application-name": "salevrix-ai",
    },
  },
});
