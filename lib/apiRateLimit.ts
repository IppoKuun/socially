import { NextResponse } from "next/server";

import { rateLimits, type RateLimitKey } from "@/lib/rateLimits";

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();

  return firstForwardedIp || realIp || "unknown-ip";
}

export async function checkApiRateLimit(
  key: RateLimitKey,
  identifier: string,
) {
  const result = await rateLimits[key].limit(identifier);

  if (result.success) {
    return null;
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  return NextResponse.json(
    {
      ok: false,
      error: "RATE_LIMITED",
      userMsg: "Too many requests. Please try again later.",
      resetAt: new Date(result.reset).toISOString(),
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}
