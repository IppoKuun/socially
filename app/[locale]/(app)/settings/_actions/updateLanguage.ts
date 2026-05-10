"use server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export type UpdateLanguageResult =
  | {
      ok: true;
      locale: (typeof routing.locales)[number];
      userMsg: string;
    }
  | {
      ok: false;
      userMsg: string;
    };

export default async function updateLanguageAction(
  locale: string,
): Promise<UpdateLanguageResult> {
  const t = await getTranslations("appShell.pages.settings.actions.language");
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, userMsg: t("invalidSession") };
  }

  // on vérifie si la langue choisis est dans notre locales //
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return { ok: false, userMsg: t("invalidLocale") };
  }

  const selectedLocale = locale as (typeof routing.locales)[number];

  try {
    const updatedProfile = await myPrisma.userProfile.updateMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      data: {
        language: selectedLocale,
      },
    });

    if (updatedProfile.count === 0) {
      return {
        ok: false,
        userMsg: t("profileNotFound"),
      };
    }
  } catch (error) {
    console.error("Impossible de modifier la langue", error);
    return {
      ok: false,
      userMsg: t("updateError"),
    };
  }

  revalidatePath("/settings/account");

  return {
    ok: true,
    locale: selectedLocale,
    userMsg: t("success"),
  };
}
