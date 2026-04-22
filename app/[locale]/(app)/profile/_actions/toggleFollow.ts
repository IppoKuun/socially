import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

export default async function toggleFollow(username: string) {
  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: "Vous n'etes pas connecté" };
  }

  const viewer = await myPrisma.userProfile.findFirst({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!viewer) {
    return {
      ok: false,
      userMsg: "Impossible de trouver votre compte veuillez ressayé",
    };
  }

  const usernameId = await myPrisma.userProfile.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!usernameId) {
    return {
      ok: false,
      userMsg: "Le profil que vous essayé de follow n'as pas été trouvé",
    };
  }

  const isFollow = await myPrisma.follow.findUnique({
    where: {
      followedProfileId_followerProfileId: {
        followedProfileId: viewer.id,
        followerProfileId: usernameId.id,
      },
    },
  });

  if (isFollow) {
    await myPrisma.follow.delete({
      where: { id: isFollow.id },
    });
  } else {
    await myPrisma.follow.create({
      data: { followedProfileId: viewer.id, followerProfileId: usernameId.id },
    });
  }

  return { ok: true, userMsg: "" };
}
