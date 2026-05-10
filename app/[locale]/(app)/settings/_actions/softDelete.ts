"use server";

import { getSession } from "@/lib/authSession";
import { captureAppException } from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function softDeleteAction() {
  const t = await getTranslations("settings.actions.deleteAccount");
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, userMsg: t("invalidSession") };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, deletedAt: true },
  });
  if (!user) {
    return { ok: false, userMsg: t("profileNotFound") };
  }

  const isRestoring = !!user.deletedAt;
  const newDeleteStatus = user.deletedAt ? null : new Date();

  try {
    await myPrisma.userProfile.update({
      where: { id: user.id },
      data: { deletedAt: newDeleteStatus },
    });
  } catch (error) {
    console.error("Impossible d'annulez la suppression du compte", error);
    captureAppException(error, {
      feature: "settings",
      action: isRestoring ? "restore_soft_deleted_account" : "soft_delete_account",
      extra: {
        userProfileId: user.id,
        authUserId: session.user.id,
      },
    });
    return {
      ok: false,
      userMsg: isRestoring ? t("restoreError") : t("deleteError"),
    };
  }

  const successMsg = isRestoring
    ? t("restoreSuccess")
    : t("deleteSuccess");

  revalidatePath("/");
  revalidatePath("/settings/account");

  if (!isRestoring) {
    redirect("/");
  }
  return { ok: true, userMsg: successMsg };
}
