"use server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    return {
      ok: false,
      userMsg: "Impossible d'annulez la suppresion du compte'",
    };
  }

  const successMsg = isRestoring
    ? "Suppression annulée avec succès !"
    : "Votre compte sera définitivement supprimé dans 30 jours.";

  revalidatePath("/settings/account");

  return { ok: true, userMsg: successMsg };
}
