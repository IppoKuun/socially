import { getSession } from "../authSession";
import { myError } from "../myError";
import { myPrisma } from "../prisma";

async function getUser() {
  const session = await getSession();

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session?.user.id },
    select: { id: true },
  });

  if (!user) {
    throw new myError("Not found");
  }

  return user;
}

export async function getMessagesViewer() {
  return getUser();
}

export async function getUserConversations() {
  const user = await getUser();

  const conversations = await myPrisma.conversation.findMany({
    where: {
      OR: [{ participantOneId: user.id }, { participantTwoId: user.id }],
    },
    orderBy: { lastMessageAt: "desc" },
    select: {
      id: true,
      updatedAt: true,
      lastMessageText: true,
      lastMessageAt: true,
      participantOne: {
        select: {
          id: true,
          avatarUrl: true,
          displayname: true,
          username: true,
        },
      },
      participantTwo: {
        select: {
          id: true,
          avatarUrl: true,
          displayname: true,
          username: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              receiverId: user.id,
              isRead: false,
            },
          },
        },
      },
    },
  });

  return conversations.map((conversation) => {
    const otherParticipant =
      conversation.participantOne.id === user.id
        ? conversation.participantTwo
        : conversation.participantOne;

    return {
      id: conversation.id,
      updatedAt: conversation.updatedAt,
      lastMessageAt: conversation.lastMessageAt,
      lastMessageText: conversation.lastMessageText,
      otherParticipant,
      unreadCount: conversation._count.messages,
    };
  });
}

export type UserConversationReturnType = Awaited<
  ReturnType<typeof getUserConversations>
>;

export async function getConversationMessages(conversationId: string) {
  const user = await getUser();

  const conversation = await myPrisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantOneId: user.id }, { participantTwoId: user.id }],
    },
    select: {
      id: true,
      participantOne: {
        select: {
          id: true,
          avatarUrl: true,
          displayname: true,
          username: true,
        },
      },
      participantTwo: {
        select: {
          id: true,
          avatarUrl: true,
          displayname: true,
          username: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
          receiverId: true,
          conversationId: true,
          isRead: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new myError("Conversation not found");
  }

  const otherParticipant =
    conversation.participantOne.id === user.id
      ? conversation.participantTwo
      : conversation.participantOne;

  return {
    id: conversation.id,
    viewerId: user.id,
    otherParticipant,
    messages: conversation.messages,
  };
}

export type UserConversationsMessagesReturnType = Awaited<
  ReturnType<typeof getConversationMessages>
>;
