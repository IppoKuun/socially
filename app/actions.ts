"use server";
import { myPrisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

type Payload = {
  utm_source: string | undefined;
  utm_medium: string | undefined;
  utm_campaign: string | undefined;
  language: string | null | undefined;
  refere: string | null | undefined;
};

// ICI on créer Anonyme Visitor uniquement si il a consent //
export async function cookiesResponseAction(
  consent: boolean,
  payload?: Payload,
) {
  // User a Consent ont lui redemande plus pendant 1 ans //
  const c = await cookies();
  c.set("cookie_consent", `${consent}`, {
    path: "/",
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  // Ont lui mets une session pour qu'on ne lui compte pas comme déconnecté lors de sa session //
  if (consent) {
    c.set("session_active", "true", {
      path: "/",
      httpOnly: true,
      // PAS DE MAX AGE : Le cookies se supprime lors de la déconnexion //
    });

    const visitorId = createId();
    await myPrisma.anonymousVisitor.create({
      data: {
        visitorId,
        hasAcceptedCookies: true,
        language: payload?.language ?? "unknown",
        utm_source: payload?.utm_source,
        utm_campaign: payload?.utm_campaign,
        utm_medium: payload?.utm_medium,
      },
    });
  }
}
