// lib/csrf.ts — CSRF Protection for API routes
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const SECRET = process.env.CSRF_SECRET ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "salevrix-csrf-secret";

// Generate CSRF token
export function generateCsrfToken(userId: string): string {
  const timestamp = Date.now().toString();
  const hmac = createHmac("sha256", SECRET)
    .update(`${userId}:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

// Validate CSRF token
export function validateCsrfToken(token: string, userId: string): boolean {
  if (!token || !userId) return false;
  const [timestamp, hmac] = token.split(".");
  if (!timestamp || !hmac) return false;

  // Token expires in 1 hour
  const age = Date.now() - parseInt(timestamp);
  if (age > 3600000) return false;

  const expected = createHmac("sha256", SECRET)
    .update(`${userId}:${timestamp}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  return hmac.length === expected.length &&
    hmac.split("").every((c, i) => c === expected[i]);
}

// Middleware helper — use in sensitive API routes
export function withCsrf(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    // Skip GET requests (safe methods)
    if (req.method === "GET") return handler(req);

    // Check CSRF token from header
    const csrfToken = req.headers.get("x-csrf-token");
    const userId = req.headers.get("x-user-id");

    if (!csrfToken || !userId) {
      return NextResponse.json({ error: "CSRF token required" }, { status: 403 });
    }

    if (!validateCsrfToken(csrfToken, userId)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    return handler(req);
  };
}
