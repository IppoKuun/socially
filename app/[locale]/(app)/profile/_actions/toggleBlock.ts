"use server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ToggleBlockActionResult = {
  ok: boolean;
  status?: "blocked" | "unblocked";
  userMsg: string;
};

export default async function toggleBlockAction(
  targetProfileId: string,
): Promise<ToggleBlockActionResult> {
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, userMsg: "Session expirée ou invalide." };
  }

  if (!targetProfileId) {
    return { ok: false, userMsg: "Profil ciblé introuvable." };
  }

  const viewer = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });

  if (!viewer) {
    return { ok: false, userMsg: "Nous n'avons pas pu vous identifier." };
  }

  if (viewer.id === targetProfileId) {
    return { ok: false, userMsg: "Vous ne pouvez pas vous bloquer vous-même." };
  }

  const target = await myPrisma.userProfile.findFirst({
    where: { id: targetProfileId, deletedAt: null },
    select: { id: true, username: true },
  });

  if (!target) {
    return { ok: false, userMsg: "Profil ciblé introuvable." };
  }

  try {
    const existingBlock = await myPrisma.block.findUnique({
      where: {
        blockerId_blockedById: {
          blockerId: viewer.id,
          blockedById: target.id,
        },
      },
      select: { id: true },
    });

    if (existingBlock) {
      await myPrisma.block.delete({
        where: { id: existingBlock.id },
      });

      revalidatePath("/settings/privacy/block");

      if (target.username) {
        revalidatePath(`/profile/${target.username}`);
      }

      return {
        ok: true,
        status: "unblocked",
        userMsg: "Utilisateur débloqué avec succès.",
      };
    }

    await myPrisma.$transaction([
      myPrisma.block.create({
        data: {
          blockerId: viewer.id,
          blockedById: target.id,
        },
      }),
      myPrisma.follow.deleteMany({
        where: {
          OR: [
            {
              followerProfileId: viewer.id,
              followedProfileId: target.id,
            },
            {
              followerProfileId: target.id,
              followedProfileId: viewer.id,
            },
          ],
        },
      }),
    ]);

    revalidatePath("/settings/privacy/block");

    if (target.username) {
      revalidatePath(`/profile/${target.username}`);
    }

    return {
      ok: true,
      status: "blocked",
      userMsg: "Utilisateur bloqué avec succès.",
    };
  } catch (error) {
    console.error("Impossible de modifier le blocage", error);
    return {
      ok: false,
      userMsg: "Impossible de modifier le blocage pour le moment.",
    };
  }
}
