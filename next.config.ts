import type { NextConfig } from "next";

// Content Security Policy — blocks XSS, clickjacking, data injection
const CSP = [
  "default-src 'self'",
  // Scripts — only our domain + Google Fonts + CDN
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://*.firebaseapp.com https://*.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
  // Styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com",
  // Images
  "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://*.googleusercontent.com",
  // API connections
  "connect-src 'self' https://*.supabase.co https://openrouter.ai https://api.anthropic.com https://accounts.google.com https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
  // Frames — Google OAuth popup needs this
  "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com blob: data:",
  // No plugins
  "object-src 'none'",
  // Upgrade HTTP to HTTPS
  "upgrade-insecure-requests",
  // Base URI
  "base-uri 'self'",
  // Form submissions only to our domain
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy
          { key: "Content-Security-Policy",       value: CSP },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options",         value: "nosniff" },
          // Prevent clickjacking
          { key: "X-Frame-Options",                value: "DENY" },
          // XSS Protection (legacy browsers)
          { key: "X-XSS-Protection",               value: "1; mode=block" },
          // Referrer policy
          { key: "Referrer-Policy",                value: "strict-origin-when-cross-origin" },
          // Disable browser features we don't use
          { key: "Permissions-Policy",             value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Force HTTPS for 1 year
          { key: "Strict-Transport-Security",      value: "max-age=31536000; includeSubDomains; preload" },
          // Prevent cross-origin info leaks
          { key: "Cross-Origin-Opener-Policy",     value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy",   value: "same-origin" },
          // Hide server info
          { key: "X-Powered-By",                   value: "" },
        ],
      },
      {
        // API routes — no caching ever
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, max-age=0, must-revalidate" },
          { key: "Pragma",        value: "no-cache" },
          { key: "Expires",       value: "0" },
        ],
      },
      {
        // Static assets — long cache
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Image optimization — whitelist only trusted domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },

  // Remove console.log in production (keep error/warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // Hide Next.js powered-by header
  poweredByHeader: false,

  // Strict React mode — catches bugs early
  reactStrictMode: true,

  // Compress responses
  compress: true,
};

export default nextConfig;
