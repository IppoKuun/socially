import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Ont fait un rateLimite pour chaque type de requete //
export const rateLimits = {
  login: new Ratelimit({
    redis,
    // Prefix c'est la nom de la "base" ou redis vas stocké les rateLimits"
    prefix: "ratelimit:login",
    limiter: Ratelimit.slidingWindow(15, "10 m"),
    analytics: true,
  }),
  auth: new Ratelimit({
    redis,
    prefix: "ratelimit:auth",
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    analytics: true,
  }),
  admin: new Ratelimit({
    redis,
    prefix: "ratelimit:admin",
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
  }),
  global: new Ratelimit({
    redis,
    prefix: "ratelimit:global",
    limiter: Ratelimit.slidingWindow(240, "1 m"),
    analytics: true,
  }),
  postPublish: new Ratelimit({
    redis,
    prefix: "ratelimit:post-publish",
    limiter: Ratelimit.slidingWindow(20, "35 m"),
  }),
  comment: new Ratelimit({
    redis,
    prefix: "ratelimit:comment",
    limiter: Ratelimit.slidingWindow(20, "30 m"),
  }),
  dataExport: new Ratelimit({
    redis,
    prefix: "ratelimit:data-export",
    limiter: Ratelimit.slidingWindow(1, "7 d"),
    analytics: true,
  }),
  pusherAuth: new Ratelimit({
    redis,
    prefix: "ratelimit:pusher-auth",
    limiter: Ratelimit.slidingWindow(120, "5 m"),
    analytics: true,
  }),
  visitorSession: new Ratelimit({
    redis,
    prefix: "ratelimit:visitor-session",
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: true,
  }),
  cron: new Ratelimit({
    redis,
    prefix: "ratelimit:cron",
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
  }),
  likeToggle: new Ratelimit({
    redis,
    prefix: "ratelimit:like-toggle",
    limiter: Ratelimit.slidingWindow(100, "5 m"),
    analytics: true,
  }),
  followToggle: new Ratelimit({
    redis,
    prefix: "ratelimit:follow-toggle",
    limiter: Ratelimit.slidingWindow(40, "10 m"),
    analytics: true,
  }),
  messageSend: new Ratelimit({
    redis,
    prefix: "ratelimit:message-send",
    limiter: Ratelimit.slidingWindow(60, "5 m"),
    analytics: true,
  }),
} as const;

export type RateLimitKey = keyof typeof rateLimits;

export const rateLimit = rateLimits.global;
