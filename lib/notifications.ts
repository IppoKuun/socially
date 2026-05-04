import { myPrisma } from "@/lib/prisma";
import { triggerNotificationCreated } from "@/lib/pusher/server";

type NotificationType = "LIKE" | "COMMENT" | "FOLLOW";

type CreateNotificationIfMissingInput = {
  actorId: string;
  userId: string;
  type: NotificationType;
  postId?: string | null;
};

type SavedNotification = {
  id: string;
  type: NotificationType;
  postId: string | null;
};

async function triggerRealtimeNotification(
  receiverProfileId: string,
  notification: SavedNotification,
  unreadCountDelta: number,
) {
  await triggerNotificationCreated(receiverProfileId, {
    notificationId: notification.id,
    type: notification.type,
    postId: notification.postId,
    unreadCountDelta,
  });
}

// Les notifications ne sont pas en transaction, c'est normal, si une notif ne passe pas
// Ont veut pas que l'action entiere sois annulé//
export async function createNotificationIfMissing({
  actorId,
  userId,
  type,
  postId = null,
}: CreateNotificationIfMissingInput) {
  if (actorId === userId) {
    return;
  }

  const existingNotification = await myPrisma.notifications.findFirst({
    where: {
      actorId,
      userId,
      type,
      postId,
    },
    select: { id: true, isRead: true },
  });

  if (existingNotification) {
    const notification = await myPrisma.notifications.update({
      // On remets date de la notif a jour pour qu'elle sois considérée comme nouvelle  //
      where: { id: existingNotification.id },
      data: {
        createdAt: new Date(),
        isRead: false,
      },
      select: {
        id: true,
        type: true,
        postId: true,
      },
    });

    try {
      await triggerRealtimeNotification(
        userId,
        notification,
        existingNotification.isRead ? 1 : 0,
      );
    } catch (error) {
      console.error("Unable to trigger realtime notification", error);
    }

    return;
  }

  const notification = await myPrisma.notifications.create({
    data: {
      actorId,
      userId,
      type,
      ...(postId ? { postId } : {}),
    },
    select: {
      id: true,
      type: true,
      postId: true,
    },
  });

  try {
    await triggerRealtimeNotification(userId, notification, 1);
  } catch (error) {
    console.error("Unable to trigger realtime notification", error);
  }
}
