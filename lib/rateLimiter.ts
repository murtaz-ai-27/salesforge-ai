// lib/rateLimiter.ts — Advanced Rate Limiter (like Apollo, Linear, Notion)
// Sliding window algorithm — more accurate than fixed window

interface RateLimitEntry {
  requests: number[];  // timestamps of requests
  blocked: boolean;
  blockedUntil?: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    const recent = entry.requests.filter(t => now - t < 60000);
    if (recent.length === 0 && !entry.blocked) store.delete(key);
    else entry.requests = recent;
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;   // time window in ms
  max: number;        // max requests in window
  blockDuration?: number; // how long to block after exceeding (ms)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key) ?? { requests: [], blocked: false };

  // Check if currently blocked
  if (entry.blocked && entry.blockedUntil) {
    if (now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      };
    }
    entry.blocked = false;
    entry.blockedUntil = undefined;
  }

  // Sliding window — keep only requests within window
  const windowStart = now - config.windowMs;
  entry.requests = entry.requests.filter(t => t > windowStart);

  const remaining = Math.max(0, config.max - entry.requests.length);
  const resetAt = entry.requests.length > 0
    ? entry.requests[0] + config.windowMs
    : now + config.windowMs;

  if (entry.requests.length >= config.max) {
    // Block if configured
    if (config.blockDuration) {
      entry.blocked = true;
      entry.blockedUntil = now + config.blockDuration;
    }
    store.set(key, entry);
    return { allowed: false, remaining: 0, resetAt, retryAfter: Math.ceil(config.windowMs / 1000) };
  }

  entry.requests.push(now);
  store.set(key, entry);
  return { allowed: true, remaining: remaining - 1, resetAt };
}

// Pre-configured limiters
export const limiters = {
  // Global — 100 req/min platform-wide
  global: (key = "global") => rateLimit(key, { windowMs: 60000, max: 100 }),

  // Per IP — 200 req/min
  ip: (ip: string) => rateLimit(`ip:${ip}`, { windowMs: 60000, max: 200 }),

  // Per user per plan
  user: (userId: string, plan: string) => {
    const limits: Record<string, number> = { free: 2, starter: 5, pro: 20, enterprise: 50 };
    const max = limits[plan] ?? 2;
    return rateLimit(`user:${userId}`, { windowMs: 60000, max });
  },

  // Auth — strict for login attempts (5 per 15 min)
  auth: (ip: string) => rateLimit(`auth:${ip}`, {
    windowMs: 15 * 60000,
    max: 5,
    blockDuration: 30 * 60000, // block 30 min after 5 failed attempts
  }),

  // AI endpoints — 10 per minute per user
  ai: (userId: string) => rateLimit(`ai:${userId}`, { windowMs: 60000, max: 10 }),
};
