"use server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UnblockUserActionResult = {
  ok: boolean;
  userMsg: string;
};

export default async function unblockUserAction(
  blockedProfileId: string,
): Promise<UnblockUserActionResult> {
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, userMsg: "Session expirée ou invalide" };
  }

  if (!blockedProfileId) {
    return { ok: false, userMsg: "Profil à débloquer introuvable." };
  }

  const viewer = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!viewer) {
    return { ok: false, userMsg: "Nous n'avons pas pu vous identifier." };
  }

  if (viewer.id === blockedProfileId) {
    return { ok: false, userMsg: "Vous ne pouvez pas vous débloquer vous-même." };
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
        userMsg: "Ce profil n'est pas dans votre liste de blocage.",
      };
    }
  } catch (error) {
    console.error("Impossible de débloquer ce profil", error);
    return {
      ok: false,
      userMsg: "Impossible de débloquer ce profil pour le moment.",
    };
  }

  revalidatePath("/settings/privacy/block");

  return { ok: true, userMsg: "Profil débloqué avec succès." };
}
