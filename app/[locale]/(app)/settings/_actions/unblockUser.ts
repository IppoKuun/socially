"use server";

import { getSession } from "@/lib/authSession";
import { captureAppException } from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export type UnblockUserActionResult = {
  ok: boolean;
  userMsg: string;
};

export default async function unblockUserAction(
  blockedProfileId: string,
): Promise<UnblockUserActionResult> {
  const t = await getTranslations("appShell.pages.settings.actions.unblock");
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, userMsg: t("invalidSession") };
  }

  if (!blockedProfileId) {
    return { ok: false, userMsg: t("missingProfile") };
  }

  const viewer = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });

  if (!viewer) {
    return { ok: false, userMsg: t("profileNotFound") };
  }

  if (viewer.id === blockedProfileId) {
    return { ok: false, userMsg: t("selfUnblock") };
  }

  try {
    const deletedBlock = await myPrisma.block.deleteMany({
      where: {
        blockerId: viewer.id,
        blockedById: blockedProfileId,
      },
    });

    if (deletedBlock.count === 0) {
      return {
        ok: false,
        userMsg: t("notBlocked"),
      };
    }
  } catch (error) {
    console.error("Impossible de débloquer ce profil", error);
    captureAppException(error, {
      feature: "settings",
      action: "unblock_user",
      extra: {
        viewerProfileId: viewer.id,
        blockedProfileId,
      },
    });
    return {
      ok: false,
      userMsg: t("error"),
    };
  }

  revalidatePath("/settings/privacy/block");

  return { ok: true, userMsg: t("success") };
}
