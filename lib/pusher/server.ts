import Pusher from "pusher";

import {
  getUserNotificationsChannel,
  getUserRealtimeChannel,
  PUSHER_MESSAGE_CREATED_EVENT,
  PUSHER_NOTIFICATION_CREATED_EVENT,
  type MessageCreatedEvent,
  type NotificationCreatedEvent,
} from "@/lib/pusher/events";

let pusherServer: Pusher | null = null;

export function getPusherServer() {
  if (pusherServer) {
    return pusherServer;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    console.error("Pusher server is not configured", {
      hasAppId: Boolean(appId),
      hasKey: Boolean(key),
      hasSecret: Boolean(secret),
      hasCluster: Boolean(cluster),
    });

    return null;
  }

  pusherServer = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherServer;
}

export async function triggerNotificationCreated(
  receiverProfileId: string,
  payload: NotificationCreatedEvent,
) {
  const pusher = getPusherServer();

  if (!pusher) {
    return;
  }

  await pusher.trigger(
    getUserNotificationsChannel(receiverProfileId),
    PUSHER_NOTIFICATION_CREATED_EVENT,
    payload,
  );
}

export async function triggerMessageCreated(
  receiverProfileId: string,
  payload: MessageCreatedEvent,
) {
  const pusher = getPusherServer();

  if (!pusher) {
    return;
  }

  await pusher.trigger(
    getUserRealtimeChannel(receiverProfileId),
    PUSHER_MESSAGE_CREATED_EVENT,
    payload,
  );
}
