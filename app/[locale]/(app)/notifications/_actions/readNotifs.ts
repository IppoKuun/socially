"use server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

// ont renvoie updateCount pour décrémentez le badge et affichez un pop-up. //
async function getCurrentProfileId() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const userProfile = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return userProfile?.id ?? null;
}

export async function markAllNotificationsAsRead() {
  const userId = await getCurrentProfileId();

  if (!userId) {
    return { ok: false, updatedCount: 0 };
  }

  const result = await myPrisma.notifications.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { ok: true, updatedCount: result.count };
}

export async function markFollowNotificationsAsRead() {
  const userId = await getCurrentProfileId();

  if (!userId) {
    return { ok: false, updatedCount: 0 };
  }

  const result = await myPrisma.notifications.updateMany({
    where: {
      userId,
      type: "FOLLOW",
      isRead: false,
    },
    data: { isRead: true },
  });

  return { ok: true, updatedCount: result.count };
}

export async function markPostNotificationsAsRead(postId: string) {
  const userId = await getCurrentProfileId();

  if (!userId || !postId) {
    return { ok: false, updatedCount: 0 };
  }

  const result = await myPrisma.notifications.updateMany({
    where: {
      userId,
      postId,
      type: { in: ["LIKE", "COMMENT"] },
      isRead: false,
    },
    data: { isRead: true },
  });

  return { ok: true, updatedCount: result.count };
}
