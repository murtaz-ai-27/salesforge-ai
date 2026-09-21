import { NextRequest, NextResponse } from "next/server";

// Rate limiting store (in-memory, resets on cold start)
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();
const IP_LIMIT = 200; // requests per minute per IP
const IP_WINDOW = 60 * 1000;

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkIPLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + IP_WINDOW });
    return true;
  }
  if (entry.count >= IP_LIMIT) return false;
  entry.count++;
  return true;
}

// Security headers added to every response
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // IP rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = getIP(req);
    if (!checkIPLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Block suspicious patterns
    const url = req.nextUrl.toString();
    const suspicious = [
      "../", "..\\", "<script", "javascript:",
      "eval(", "DROP TABLE", "SELECT *", "UNION SELECT",
      "/etc/passwd", "cmd.exe", "powershell",
    ];
    if (suspicious.some((p) => url.toLowerCase().includes(p.toLowerCase()))) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
