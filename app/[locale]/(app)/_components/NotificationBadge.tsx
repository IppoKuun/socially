"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type NotificationBadgeProps = {
  unreadCount: number;
  className?: string;
};

export default function NotificationBadge({
  unreadCount,
  className,
}: NotificationBadgeProps) {
  const t = useTranslations("appShell.pages.notifications");

  if (unreadCount <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#2f7cff] px-1 text-[0.62rem] font-bold leading-none text-white shadow-[0_0_0_2px_#17181d]",
        className,
      )}
      aria-label={t("badgeAria", { count: unreadCount })}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
