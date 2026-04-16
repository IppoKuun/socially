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
    limiter: Ratelimit.slidingWindow(30, "15 m"),
  }),
  comment: new Ratelimit({
    redis,
    prefix: "ratelimit:post-publish",
    limiter: Ratelimit.slidingWindow(20, "30 m"),
  }),
} as const;

export type RateLimitKey = keyof typeof rateLimits;

export const rateLimit = rateLimits.global;
