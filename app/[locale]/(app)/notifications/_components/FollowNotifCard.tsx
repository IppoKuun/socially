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
        router.refresh();
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

  const haveNewFollow = unreadFollowCount > 0;
  return (
    <>
      <div
        className={cn(
          "flex p-4 bg-white/5 border text-center justify-center items-center cursor-pointer rounded-lg  w-[350px] md:max-w-[250px] md:text-ls text-xs ",
          isActive && "bg-white/30",
          haveNewFollow &&
            "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/40 transition-colors",
        )}
        onClick={async () => {
          handleFollowButtonClick();
        }}
      >
        Vous avez {unreadFollowCount} nouveaux abonnées
      </div>
    </>
  );
}
