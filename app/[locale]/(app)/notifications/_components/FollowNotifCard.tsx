"use client";

import { useTransition } from "react";
import { FollowNotificationType } from "../page";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { markFollowNotificationsAsRead } from "../_actions/readNotifs";
import Image from "next/image";
import { User2Icon } from "lucide-react";

type FollowListCardProps = {
  followList: FollowNotificationType[];
  unreadFollowCount: number;
  isActive: boolean;
};

export default function FollowNotifCard({
  followList,
  unreadFollowCount,
  isActive,
}: FollowListCardProps) {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();

  const handleFollowButtonClick = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        await markFollowNotificationsAsRead();
      } catch (e) {
        console.error("Échec silencieux du marquage :", e);
      }
    });
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    params.set("followView", "true");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  return isActive ? (
    <section className="grid grid-cols-3 sm:grid-cols-5">
      {followList.map((follow) => (
        <Link key={follow.id} href={`/profile/${follow.actor.username}`}>
          <article className="flex min-h-48 flex-col p-5 shadow">
            {follow.actor.avatarUrl ? (
              <Image
                src={follow.actor.avatarUrl}
                alt="photoimage"
                width={50}
                height={50}
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">
                <User2Icon className="size-5" />
              </div>
            )}

            <p className="">{follow.actor.displayname}</p>
            <p className="">@{follow.actor.username}</p>
          </article>
        </Link>
      ))}
    </section>
  ) : (
    <>
      <button
        className="flex p-4"
        onClick={async () => {
          handleFollowButtonClick();
          handleFilterChange();
        }}
      >
        Vous avez {unreadFollowCount} nouveaux abonnées
      </button>
    </>
  );
}
