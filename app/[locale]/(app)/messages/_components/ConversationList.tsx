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
import { CircleUserRound, Search } from "lucide-react";
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
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover ring-1 ring-white/10"
      />
    );
  }

  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/65"
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
    <section className="flex min-h-[620px] flex-col gap-5 bg-white/[0.035] p-4">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {conversations.map((conv) => {
          const isActive = conv.id === activeConversationId;
          const profileLabel = conv.otherParticipant.username
            ? `@${conv.otherParticipant.username}`
            : "@profile";

          return (
            <Link key={conv.id} className="block" href={`/messages/${conv.id}`}>
              <article
                className={[
                  "group flex min-h-24 flex-row items-center gap-3 rounded-[1.25rem] border px-3 py-3 transition",
                  isActive
                    ? "border-white/18 bg-white/[0.16] shadow-[0_18px_44px_-32px_rgba(0,0,0,0.95)]"
                    : "border-white/8 bg-white/[0.075] hover:bg-white/[0.12]",
                ].join(" ")}
              >
                <ConversationAvatar
                  avatarUrl={conv.otherParticipant.avatarUrl}
                  displayname={conv.otherParticipant.displayname}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-sora text-base font-semibold leading-tight text-white">
                        {conv.otherParticipant.displayname}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-white/52">
                        {profileLabel}
                      </p>
                    </div>
                    <time className="shrink-0 text-xs font-medium text-white/50">
                      {formatConversationDate(conv.lastMessageAt, locale)}
                    </time>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm leading-5 text-white/68">
                      {conv.lastMessageText || "Aucun message pour le moment."}
                    </p>
                    {conv.unreadCount > 0 ? (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[0.68rem] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.10] text-xs text-white/42">
                        -
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
