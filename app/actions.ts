"use server";
import { cookies } from "next/headers";
import { myPrisma } from "@/lib/prisma";

export async function cookiesResponseAction(consent: boolean) {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get("visitorId");

  if (visitorId) {
    await myPrisma.anonymousVisitor.update({
      where: { visitorId: String(visitorId) },
      data: { hasAcceptedCookies: consent },
    });
  }
}
