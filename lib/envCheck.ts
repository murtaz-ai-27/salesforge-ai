// lib/envCheck.ts — Validate all env vars at startup
// Like enterprise SaaS — fail fast if misconfigured

const REQUIRED_ENV_VARS = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL:      { public: true,  example: "https://xxx.supabase.co" },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: { public: true,  example: "eyJhbGciOi..." },
  SUPABASE_SERVICE_ROLE_KEY:     { public: false, example: "eyJhbGciOi..." },

  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY:          { public: true, example: "AIzaSy..." },
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:      { public: true, example: "xxx.firebaseapp.com" },
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:       { public: true, example: "salevrix-ai" },
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:   { public: true, example: "xxx.appspot.com" },
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: { public: true, example: "123456789" },
  NEXT_PUBLIC_FIREBASE_APP_ID:           { public: true, example: "1:xxx:web:xxx" },

  // AI
  OPENROUTER_API_KEY: { public: false, example: "sk-or-v1-..." },

  // Email
  RESEND_API_KEY: { public: false, example: "re_..." },
} as const;

type EnvKey = keyof typeof REQUIRED_ENV_VARS;

export function checkEnvVars(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];

    if (!value) {
      if (key === "RESEND_API_KEY") {
        warnings.push(`${key} not set — email features disabled`);
      } else {
        missing.push(key);
      }
      continue;
    }

    // Validate format
    if (key === "NEXT_PUBLIC_SUPABASE_URL") {
      try { new URL(value); } catch {
        warnings.push(`${key} is not a valid URL`);
      }
    }

    if (key === "OPENROUTER_API_KEY" && !value.startsWith("sk-or-")) {
      warnings.push(`${key} format looks incorrect (should start with sk-or-)`);
    }
  }

  return { valid: missing.length === 0, missing, warnings };
}

// Run at startup in development
if (process.env.NODE_ENV === "development") {
  const { valid, missing, warnings } = checkEnvVars();
  if (!valid) {
    console.error("\n❌ [Salevrix] Missing required env vars:");
    missing.forEach(k => console.error(`   - ${k}`));
    console.error("\nAdd them to .env.local\n");
  }
  if (warnings.length > 0) {
    console.warn("\n⚠️  [Salevrix] Env var warnings:");
    warnings.forEach(w => console.warn(`   - ${w}`));
  }
  if (valid && warnings.length === 0) {
    console.log("✅ [Salevrix] All env vars configured correctly");
  }
}
