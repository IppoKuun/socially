export const PUSHER_NOTIFICATION_CREATED_EVENT = "notification:new";
export const PUSHER_MESSAGE_CREATED_EVENT = "message:new";
export const PUSHER_MESSAGE_READ_EVENT = "message:read";
export const PUSHER_MESSAGE_TYPING_EVENT = "client-message:typing";
export const MESSAGE_CONVERSATION_UPDATED_EVENT =
  "message-conversation:updated";
export const NOTIFICATION_UNREAD_COUNT_CHANGED_EVENT =
  "notification-unread-count:changed";
export const CONVERSATION_REALTIME_CHANNEL_PREFIX = "private-conversation-";

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

export type MessageReadEvent = {
  conversationId: string;
  readerId: string;
  readAt: string;
};

export type MessageTypingEvent = {
  conversationId: string;
  senderId: string;
  isTyping: boolean;
};

export function getUserRealtimeChannel(userProfileId: string) {
  return `private-user-${userProfileId}`;
}

export function getUserNotificationsChannel(userProfileId: string) {
  return getUserRealtimeChannel(userProfileId);
}

export function getConversationRealtimeChannel(conversationId: string) {
  return `${CONVERSATION_REALTIME_CHANNEL_PREFIX}${conversationId}`;
}
