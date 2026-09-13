import { NextRequest, NextResponse } from "next/server";

// Protected routes — require authentication
const PROTECTED = ["/dashboard"];
const PUBLIC = ["/login", "/signup", "/", "/blog"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow public routes
  if (PUBLIC.some(p => pathname === p || pathname.startsWith("/blog"))) {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith("/_next/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // For dashboard routes - let client handle auth redirect
  // Firebase auth is client-side, so we just pass through
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
