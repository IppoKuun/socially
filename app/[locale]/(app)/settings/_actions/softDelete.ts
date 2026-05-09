"use server";

import { getSession } from "@/lib/authSession";
import { captureAppException } from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function softDeleteAction() {
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, userMsg: "Session expirée ou invalide" };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, deletedAt: true },
  });
  if (!user) {
    return { ok: false, userMsg: "Nous n'avons pas pu vous identifié" };
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
      userMsg: "Impossible d'annulez la suppresion du compte'",
    };
  }

  const successMsg = isRestoring
    ? "Suppression annulée avec succès !"
    : "Votre compte sera définitivement supprimé dans 30 jours.";

  revalidatePath("/");
  revalidatePath("/settings/account");

  if (!isRestoring) {
    redirect("/");
  }
  return { ok: true, userMsg: successMsg };
}
