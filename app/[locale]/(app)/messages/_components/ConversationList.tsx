"use client";

import { Link } from "@/i18n/routing";
import { UserConversationReturnType } from "@/lib/messages/queries";
import { getPusherClient } from "@/lib/pusher/client";
import {
  getUserRealtimeChannel,
  MESSAGE_CONVERSATION_UPDATED_EVENT,
  PUSHER_MESSAGE_CREATED_EVENT,
  type MessageCreatedEvent,
} from "@/lib/pusher/events";
import { CircleUserRound } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ConversationListProps = {
  initialConversations: UserConversationReturnType;
  viewerId: string;
};

type ConversationItem = UserConversationReturnType[number];

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

function getStartOfDay(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

function formatConversationDate(date: Date, locale: string) {
  const today = getStartOfDay(new Date());
  const conversationDay = getStartOfDay(date);
  const diffInDays = Math.round(
    (conversationDay.getTime() - today.getTime()) / ONE_DAY_IN_MS,
  );

  if (diffInDays === 0) {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (diffInDays === -1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -1,
      "day",
    );
  }

  if (diffInDays > -7) {
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(date);
}

function ConversationAvatar({
  avatarUrl,
  displayname,
}: {
  avatarUrl: string | null;
  displayname: string;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`Avatar de ${displayname}`}
        width={44}
        height={44}
        className="h-11 w-11 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/65"
      aria-label={`Avatar de ${displayname}`}
    >
      <CircleUserRound className="h-5 w-5" />
    </span>
  );
}

export function ConversationList({
  initialConversations,
  viewerId,
}: ConversationListProps) {
  const locale = useLocale();
  const params = useParams<{ conversationId?: string }>();
  const [conversations, setConversations] = useState(initialConversations);
  const activeConversationId =
    typeof params.conversationId === "string" ? params.conversationId : null;

  function updateConversationFromMessage(message: MessageCreatedEvent) {
    setConversations((currentConversations) => {
      let updatedConversation: ConversationItem | null = null;
      const nextConversations: ConversationItem[] = [];

      for (const conversation of currentConversations) {
        if (conversation.id !== message.conversationId) {
          nextConversations.push(conversation);
          continue;
        }

        updatedConversation = {
          ...conversation,
          lastMessageAt: new Date(message.createdAt),
          lastMessageText: message.content,
          unreadCount:
            message.senderId !== viewerId &&
            message.conversationId !== activeConversationId
              ? conversation.unreadCount + 1
              : conversation.unreadCount,
        };
      }

      if (!updatedConversation) {
        return currentConversations;
      }

      return [updatedConversation, ...nextConversations];
    });
  }

  useEffect(() => {
    function handleConversationUpdated(event: Event) {
      const customEvent = event as CustomEvent<MessageCreatedEvent>;
      updateConversationFromMessage(customEvent.detail);
    }

    window.addEventListener(
      MESSAGE_CONVERSATION_UPDATED_EVENT,
      handleConversationUpdated,
    );

    return () => {
      window.removeEventListener(
        MESSAGE_CONVERSATION_UPDATED_EVENT,
        handleConversationUpdated,
      );
    };
  }, [activeConversationId, viewerId]);

  useEffect(() => {
    const pusher = getPusherClient();

    if (!pusher) {
      return;
    }

    const channelName = getUserRealtimeChannel(viewerId);
    const channel = pusher.subscribe(channelName);

    function handleMessageCreated(payload: MessageCreatedEvent) {
      updateConversationFromMessage(payload);
    }

    channel.bind(PUSHER_MESSAGE_CREATED_EVENT, handleMessageCreated);

    return () => {
      channel.unbind(PUSHER_MESSAGE_CREATED_EVENT, handleMessageCreated);
    };
  }, [activeConversationId, viewerId]);

  return (
    <section className="flex flex-col md:hidden ">
      {conversations.map((conv) => (
        <Link key={conv.id} href={`conversations/${conv.id}`}>
          <article className="flex flex-row items-center gap-3">
            <ConversationAvatar
              avatarUrl={conv.otherParticipant.avatarUrl}
              displayname={conv.otherParticipant.displayname}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="">{conv.otherParticipant.displayname}</p>
              <p className="">{conv.lastMessageText}</p>
            </div>
            <span className="">
              {formatConversationDate(conv.lastMessageAt, locale)}
            </span>
          </article>
        </Link>
      ))}
    </section>
  );
}
