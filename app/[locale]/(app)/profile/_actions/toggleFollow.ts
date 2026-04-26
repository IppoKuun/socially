"use server";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

// Ajoutez après succes un revalidateTag a chaque follow qui vas invalidé cache follow de discover //

export default async function toggleFollow(username: string) {
  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: "Vous n'etes pas connecté" };
  }

  const viewer = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!viewer) {
    return {
      ok: false,
      userMsg: "Impossible de trouver votre compte veuillez ressayé",
    };
  }

  const usernameTarget = await myPrisma.userProfile.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!usernameTarget) {
    return {
      ok: false,
      userMsg: "Le profil que vous essayé de follow n'as pas été trouvé",
    };
  }

  if (usernameTarget.id === viewer.id) {
    return { ok: false, userMsg: "Vous ne pouvez pas vous suivre vous meme" };
  }

  const searchBlock = await myPrisma.block.findFirst({
    where: {
      OR: [
        {
          blockerId: viewer.id,
          blockedById: usernameTarget.id,
        },
        {
          blockerId: usernameTarget.id,
          blockedById: viewer.id,
        },
      ],
    },
  });

  if (searchBlock) {
    return {
      ok: false,
      userMsg:
        "L'utilisateur vous a bloqué ou vous avez bloqué l'utilisateur, impossible de vous abonnez a ce compte",
    };
  }

  try {
    const isFollow = await myPrisma.follow.findUnique({
      where: {
        followedProfileId_followerProfileId: {
          followedProfileId: usernameTarget.id,
          followerProfileId: viewer.id,
        },
      },
    });

    if (isFollow) {
      await myPrisma.follow.delete({
        where: { id: isFollow.id },
      });
    } else {
      await myPrisma.follow.create({
        data: {
          followedProfileId: usernameTarget.id,
          followerProfileId: viewer.id,
        },
      });
    }
  } catch {
    return {
      ok: false,
      userMsg:
        "Impossible d'enregistrer en base de données, veuillez recommencer",
    };
  }

  return { ok: true, userMsg: "" };
}
