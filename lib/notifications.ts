import { myPrisma } from "@/lib/prisma";

type NotificationType = "LIKE" | "COMMENT" | "FOLLOW";

type CreateNotificationIfMissingInput = {
  actorId: string;
  userId: string;
  type: NotificationType;
  postId?: string | null;
};

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
    select: { id: true },
  });

  if (existingNotification) {
    return;
  }

  await myPrisma.notifications.create({
    data: {
      actorId,
      userId,
      type,
      ...(postId ? { postId } : {}),
    },
  });
}
