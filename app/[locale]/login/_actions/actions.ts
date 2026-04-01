"use server";

import { auth } from "@/lib/auth";
import { myPrisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { APIError } from "better-auth";
import { myError } from "@/lib/myError";
import { getTranslations } from "next-intl/server";

export type FormState = {
  userMsg: string | null;
  ok: boolean;
};

const t = await getTranslations();
export default async function createProfile(
  _prevState: FormState,
  FormData: FormData,
) {
  const c = await cookies();
  const visitorId = c.get("visitorId")?.value;
  try {
    // variable null comme ça si prisma le trouve pas, il reste null et renvoie pas ne renvoie pas err 500 pour ça. //
    let visitor = null;

    visitor = await myPrisma.anonymousVisitor
      .findUnique({
        where: { visitorId },
      })
      .catch(() => null);

    await auth.api.signUpEmail({
      body: {
        email: FormData.get("email") as string,
        password: FormData.get("password") as string,
        name: FormData.get("name") as string,
        accountType: "public",
        trackingData: {
          utm_source: visitor?.utm_source,
          utm_campaign: visitor?.utm_campaign,
          utm_medium: visitor?.utm_medium,
          referrer_domain: visitor?.referrer_domain,
          // AJOUTEZ LES AUTRES CHAMPS //
        },
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
      // METTRE i18n TRADUCTIONS //
      return { ok: false, userMsg: t("login.error.userMsg") };
    }
  }
  redirect("/onboarding");
}
