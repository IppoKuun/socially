"use client";
import { Link } from "@/i18n/routing";
import { CircleUserRound } from "lucide-react";
import Image from "next/image";

type ConversationHeaderProps = {
  otherParticipant: {
    id: string;
    displayname: string;
    username: string | null;
    avatarUrl: string | null;
  };
};

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

export default function ConversationHeader({
  otherParticipant,
}: ConversationHeaderProps) {
  return (
    <Link href={`profile/${otherParticipant.username}`} className="">
      <section className="">
        <ConversationAvatar
          avatarUrl={otherParticipant.avatarUrl}
          displayname={otherParticipant.displayname}
        />
        <p className="">{otherParticipant.displayname}</p>
        <p className="">@{otherParticipant.username}</p>
      </section>
    </Link>
  );
}
