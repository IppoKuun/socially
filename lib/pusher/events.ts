export const PUSHER_NOTIFICATION_CREATED_EVENT = "notification:new";
export const NOTIFICATION_UNREAD_COUNT_CHANGED_EVENT =
  "notification-unread-count:changed";

export type NotificationCreatedEvent = {
  notificationId: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  postId: string | null;
  unreadCountDelta: number;
};

export function getUserNotificationsChannel(userProfileId: string) {
  return `private-user-${userProfileId}`;
}
