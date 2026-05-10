import { checkApiRateLimit, getRequestIp } from "@/lib/apiRateLimit";
import { myPrisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const c = await cookies();
  const hasConsent = c.get("cookie_consent")?.value;
  const visitorId = c.get("visitorId")?.value;
  const sessionActive = c.get("session_active")?.value;

  if (hasConsent !== "true" || !visitorId || sessionActive === "true") {
    return new NextResponse(null, { status: 204 });
  }

  const rateLimitResponse = await checkApiRateLimit(
    "visitorSession",
    visitorId || getRequestIp(request),
  );

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  await myPrisma.anonymousVisitor.updateMany({
    where: { visitorId },
    data: { visitCount: { increment: 1 } },
  });

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set("session_active", "true", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return response;
}
