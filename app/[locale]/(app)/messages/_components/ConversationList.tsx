"use client";

import { Link } from "@/i18n/routing";
import { UserConversationReturnType } from "@/lib/messages/queries";
import { CircleUserRound } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";

type ConversationListProps = {
  initialConversations: UserConversationReturnType;
};

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
}: ConversationListProps) {
  const locale = useLocale();
  const [conversations, setConversations] = useState(initialConversations);

  return (
    <section className="flex flex-col">
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
