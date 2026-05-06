export const PUSHER_NOTIFICATION_CREATED_EVENT = "notification:new";
export const PUSHER_MESSAGE_CREATED_EVENT = "message:new";
export const MESSAGE_CONVERSATION_UPDATED_EVENT =
  "message-conversation:updated";
export const NOTIFICATION_UNREAD_COUNT_CHANGED_EVENT =
  "notification-unread-count:changed";

export type NotificationCreatedEvent = {
  notificationId: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  postId: string | null;
  unreadCountDelta: number;
};

export type MessageCreatedEvent = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  isRead: boolean;
};

export function getUserRealtimeChannel(userProfileId: string) {
  return `private-user-${userProfileId}`;
}

export function getUserNotificationsChannel(userProfileId: string) {
  return getUserRealtimeChannel(userProfileId);
}
