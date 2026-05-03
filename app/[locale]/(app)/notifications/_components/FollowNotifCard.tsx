"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { markFollowNotificationsAsRead } from "../_actions/readNotifs";

import { cn } from "@/lib/utils";

type FollowListCardProps = {
  unreadFollowCount: number;
  isActive: boolean;
};

export default function FollowNotifCard({
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
        handleFilterChange();
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
  return (
    <>
      <button
        className={cn("flex p-4", isActive && "bg-white/30")}
        onClick={async () => {
          handleFollowButtonClick();
        }}
      >
        Vous avez {unreadFollowCount} nouveaux abonnées
      </button>
    </>
  );
}
