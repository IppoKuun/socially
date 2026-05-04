export const PUSHER_NOTIFICATION_CREATED_EVENT = "notification:new";

export type NotificationCreatedEvent = {
  notificationId: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  postId: string | null;
};

export function getUserNotificationsChannel(userProfileId: string) {
  return `private-user-${userProfileId}`;
}
