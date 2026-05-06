"use server";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { triggerMessageRead } from "@/lib/pusher/server";
import { getTranslations } from "next-intl/server";

export type markConversationAsReadResponseType = {
  ok: boolean;
  userMsg: string;
};

// pour la v1, tous les messages reçus seront marqués comme lus en une fois.//
export default async function markConversationAsRead(
  conversationId: string,
): Promise<markConversationAsReadResponseType> {
  const t = await getTranslations("appShell.pages.messages.actions");

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

  const conversation = await myPrisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantOneId: viewer.id }, { participantTwoId: viewer.id }],
    },
    select: {
      id: true,
      participantOneId: true,
      participantTwoId: true,
    },
  });

  if (!conversation) {
    return { ok: false, userMsg: t("conversationNotFound") };
  }

  try {
    const updatedMessages = await myPrisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        receiverId: viewer.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    if (updatedMessages.count > 0) {
      const senderId =
        conversation.participantOneId === viewer.id
          ? conversation.participantTwoId
          : conversation.participantOneId;

      try {
        await triggerMessageRead(senderId, {
          conversationId: conversation.id,
          readerId: viewer.id,
          readAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Impossible d'envoyer le read receipt Pusher", error);
      }
    }
  } catch (error) {
    console.error("Impossible de marqué la conversation comme read", error);
    return {
      ok: false,
      userMsg: t("failedToMarkAsRead"),
    };
  }

  return { ok: true, userMsg: "" };
}
