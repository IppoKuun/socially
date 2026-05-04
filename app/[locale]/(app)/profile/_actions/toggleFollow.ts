"use server";
import { getSession } from "@/lib/authSession";
import { createNotificationIfMissing } from "@/lib/notifications";
import { myPrisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function toggleFollow(username: string) {
  const t = await getTranslations("profilePublic.actions");
  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }

  const viewer = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!viewer) {
    return {
      ok: false,
      userMsg: t("viewerProfileNotFound"),
    };
  }

  const usernameTarget = await myPrisma.userProfile.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!usernameTarget) {
    return {
      ok: false,
      userMsg: t("targetProfileNotFound"),
    };
  }

  if (usernameTarget.id === viewer.id) {
    return { ok: false, userMsg: t("cannotFollowSelf") };
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
      userMsg: t("blocked"),
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

      try {
        await createNotificationIfMissing({
          actorId: viewer.id,
          userId: usernameTarget.id,
          type: "FOLLOW",
        });
      } catch (error) {
        console.error("Unable to create follow notification", error);
      }
    }
  } catch {
    return {
      ok: false,
      userMsg: t("databaseError"),
    };
  }

  return { ok: true, userMsg: "" };
}
