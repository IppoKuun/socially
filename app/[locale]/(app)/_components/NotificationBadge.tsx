"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { getPusherClient } from "@/lib/pusher/client";
import {
  getUserNotificationsChannel,
  PUSHER_NOTIFICATION_CREATED_EVENT,
} from "@/lib/pusher/events";

type NotificationBadgeProps = {
  initialUnreadCount: number;
  notificationProfileId: string | null;
  className?: string;
};

export default function NotificationBadge({
  initialUnreadCount,
  notificationProfileId,
  className,
}: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    if (!notificationProfileId) {
      return;
    }

    const pusher = getPusherClient();

    if (!pusher) {
      return;
    }

    const channelName = getUserNotificationsChannel(notificationProfileId);
    const channel = pusher.subscribe(channelName);
    const handleNotificationCreated = () => {
      setUnreadCount((currentCount) => currentCount + 1);
    };

    channel.bind(PUSHER_NOTIFICATION_CREATED_EVENT, handleNotificationCreated);

    // A chaque fois qu'un composant est démonté, l'écouteur d'un channel
    // reste en mémoire mais le useEffect se refait car composant remonté
    // On cleanup la fonction pour que quand user change de page, donc composant
    // démonté, l'écouteur sur le channel s'éteints et est rechargé par un nouveau
    // Pour ne pas écoutez x fois le meme evennement  //
    return () => {
      channel.unbind(
        PUSHER_NOTIFICATION_CREATED_EVENT,
        handleNotificationCreated,
      );
      pusher.unsubscribe(channelName);
    };
  }, [notificationProfileId]);

  if (unreadCount <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#2f7cff] px-1 text-[0.62rem] font-bold leading-none text-white shadow-[0_0_0_2px_#17181d]",
        className,
      )}
      aria-label={`${unreadCount} notifications non lues`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
