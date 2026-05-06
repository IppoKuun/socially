"use client";
import { Link } from "@/i18n/routing";
import { ArrowLeft, CircleUserRound } from "lucide-react";
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
        width={52}
        height={52}
        className="h-[52px] w-[52px] rounded-full object-cover ring-1 ring-white/10"
      />
    );
  }

  return (
    <span
      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/65"
      aria-label={`Avatar de ${displayname}`}
    >
      <CircleUserRound className="h-5 w-5" />
    </span>
  );
}

export default function ConversationHeader({
  otherParticipant,
}: ConversationHeaderProps) {
  const profileHref = otherParticipant.username
    ? `/profile/${otherParticipant.username}`
    : "/profile";

  return (
    <header className="flex min-h-24 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
      <Link
        href="/messages"
        className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-white/72 transition hover:bg-white/[0.12] hover:text-white md:hidden"
        aria-label="Retour aux conversations"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <Link href={profileHref} className="min-w-0">
        <section className="flex min-w-0 items-center gap-4">
          <ConversationAvatar
            avatarUrl={otherParticipant.avatarUrl}
            displayname={otherParticipant.displayname}
          />
          <div className="min-w-0">
            <p className="truncate font-sora text-xl font-semibold leading-tight text-white">
              {otherParticipant.displayname}
            </p>
            <p className="mt-1 truncate text-sm text-white/52">
              @{otherParticipant.username ?? "profile"}
            </p>
          </div>
        </section>
      </Link>
    </header>
  );
}
