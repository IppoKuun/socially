"use server";

import { getTranslations } from "next-intl/server";

import { getSession } from "@/lib/authSession";
import { captureAppException } from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";
import { triggerMessageCreated } from "@/lib/pusher/server";
import { rateLimits } from "@/lib/rateLimits";

const MESSAGE_MAX_LENGTH = 2000;

function getRateLimitMinutes(reset: number) {
  return Math.max(1, Math.ceil((reset - Date.now()) / (1000 * 60)));
}

type SendMessageInput = {
  conversationId: string;
  content: string;
};

export type SentMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  isRead: boolean;
};

type SendMessageResult =
  | {
      ok: true;
      messageQuery: SentMessage;
      userMsg: "";
    }
  | {
      ok: false;
      messageQuery: null;
      userMsg: string;
    };

export async function sendMessage(
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const t = await getTranslations("appShell.pages.messages.actions");
  const session = await getSession();

  if (!session) {
    return { ok: false, messageQuery: null, userMsg: t("authRequired") };
  }

  if (
    !input ||
    typeof input.conversationId !== "string" ||
    typeof input.content !== "string"
  ) {
    return { ok: false, messageQuery: null, userMsg: t("invalidInput") };
  }

  const content = input.content.trim();

  if (content.length === 0) {
    return { ok: false, messageQuery: null, userMsg: t("emptyMessage") };
  }

  if (content.length > MESSAGE_MAX_LENGTH) {
    return { ok: false, messageQuery: null, userMsg: t("messageTooLong") };
  }

  const viewer = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });

  if (!viewer) {
    return {
      ok: false,
      messageQuery: null,
      userMsg: t("viewerProfileNotFound"),
    };
  }

  const { success, reset } = await rateLimits.messageSend.limit(viewer.id);

  if (!success) {
    return {
      ok: false,
      messageQuery: null,
      userMsg: t("rateLimited", { minutes: getRateLimitMinutes(reset) }),
    };
  }

  const conversation = await myPrisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      OR: [{ participantOneId: viewer.id }, { participantTwoId: viewer.id }],
    },
    select: {
      id: true,
      participantOneId: true,
      participantOne: {
        select: {
          deletedAt: true,
          defineltyDeleted: true,
        },
      },
      participantTwoId: true,
      participantTwo: {
        select: {
          deletedAt: true,
          defineltyDeleted: true,
        },
      },
    },
  });

  if (!conversation) {
    return {
      ok: false,
      messageQuery: null,
      userMsg: t("conversationNotFound"),
    };
  }

  const receiverId =
    conversation.participantOneId === viewer.id
      ? conversation.participantTwoId
      : conversation.participantOneId;

  const receiver =
    conversation.participantOneId === receiverId
      ? conversation.participantOne
      : conversation.participantTwo;

  if (receiver.deletedAt || receiver.defineltyDeleted) {
    return {
      ok: false,
      messageQuery: null,
      userMsg: t("receiverProfileUnavailable"),
    };
  }

  const existingBlock = await myPrisma.block.findFirst({
    where: {
      OR: [
        {
          blockerId: viewer.id,
          blockedById: receiverId,
        },
        {
          blockerId: receiverId,
          blockedById: viewer.id,
        },
      ],
    },
    select: { id: true },
  });

  if (existingBlock) {
    return {
      ok: false,
      messageQuery: null,
      userMsg: t("blocked"),
    };
  }

  try {
    const sentAt = new Date();

    const messageQuery = await myPrisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          content,
          createdAt: sentAt,
          senderId: viewer.id,
          receiverId,
          conversationId: conversation.id,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
          receiverId: true,
          conversationId: true,
          isRead: true,
        },
      });

      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageText: createdMessage.content,
          lastMessageAt: sentAt,
        },
        select: { id: true },
      });

      return createdMessage;
    });

    const serializedMessage = {
      ...messageQuery,
      createdAt: messageQuery.createdAt.toISOString(),
    };

    try {
      await triggerMessageCreated(receiverId, serializedMessage);
    } catch (error) {
      console.error("Unable to trigger realtime message", error);
      captureAppException(error, {
        feature: "messages",
        action: "trigger_message_created_realtime",
        level: "warning",
        extra: {
          conversationId: conversation.id,
          messageId: serializedMessage.id,
          senderProfileId: viewer.id,
          receiverProfileId: receiverId,
        },
      });
    }

    return {
      ok: true,
      messageQuery: serializedMessage,
      userMsg: "",
    };
  } catch (error) {
    console.error("Unable to send messageQuery", error);
    captureAppException(error, {
      feature: "messages",
      action: "send_message",
      extra: {
        conversationId: conversation.id,
        senderProfileId: viewer.id,
        receiverProfileId: receiverId,
      },
    });

    return {
      ok: false,
      messageQuery: null,
      userMsg: t("sendFailed"),
    };
  }
}
