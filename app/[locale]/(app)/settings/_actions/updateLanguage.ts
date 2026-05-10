"use server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { revalidatePath } from "next/cache";

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
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, userMsg: "Session expirée ou invalide" };
  }

  // on vérifie si la langue choisis est dans notre locales //
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return { ok: false, userMsg: "Langue invalide" };
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
        userMsg: "Nous n'avons pas pu vous identifier.",
      };
    }
  } catch (error) {
    console.error("Impossible de modifier la langue", error);
    return {
      ok: false,
      userMsg: "Impossible de modifier la langue pour le moment.",
    };
  }

  revalidatePath("/settings/account");

  return {
    ok: true,
    locale: selectedLocale,
    userMsg: "Langue modifiée avec succès.",
  };
}
