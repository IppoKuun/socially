"use server";

import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { myPrisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { APIError } from "better-auth";
import { myError } from "@/lib/myError";
import { getLocale, getTranslations } from "next-intl/server";

export type FormState = {
  userMsg: string | null;
  ok: boolean;
};

type TrackingData = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer_domain?: string | null;
  language?: string | null;
  hasAcceptedCookies?: boolean;
  visitCount?: number | null;
  createdAt?: Date | null;
};

// Cette fonction vas etre appellée par component, et permettra lors du signIn social, la reception des data Trackée pour better auth //

export async function getTrackingDataForAuth(): Promise<
  TrackingData | undefined
> {
  const c = await cookies();
  const visitorId = c.get("visitorId")?.value;

  if (!visitorId) {
    return undefined;
  }

  const visitor = await myPrisma.anonymousVisitor
    .findUnique({
      where: { visitorId },
    })
    .catch(() => null);

  if (!visitor) {
    return undefined;
  }

  return {
    utm_source: visitor.utm_source,
    utm_campaign: visitor.utm_campaign,
    utm_medium: visitor.utm_medium,
    referrer_domain: visitor.referrer_domain,
    hasAcceptedCookies: visitor.hasAcceptedCookies,
    visitCount: visitor.visitCount,
    language: visitor.language,
    createdAt: visitor.createdAt,
  };
}

export default async function createProfile(
  _prevState: FormState,
  FormData: FormData,
) {
  const t = await getTranslations();

  try {
    const trackingData = await getTrackingDataForAuth();

    await auth.api.signUpEmail({
      body: {
        email: FormData.get("email") as string,
        password: FormData.get("password") as string,
        name: FormData.get("name") as string,
        accountType: "public",
        trackingData,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    if (error instanceof APIError) {
      return { ok: false, userMsg: error.message };
    }
    if (error instanceof myError) {
      return { ok: false, userMsg: error.message };
    } else {
      return { ok: false, userMsg: t("login.error.userMsg") };
    }
  }
  const locale = await getLocale();
  redirect({ href: "/onboarding", locale });
  return { ok: true, userMsg: "" };
}
