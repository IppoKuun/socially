"use client";

import {
  getUserRealtimeChannel,
  PUSHER_MESSAGE_CREATED_EVENT,
  type MessageCreatedEvent,
} from "@/lib/pusher/events";
import { getPusherClient } from "@/lib/pusher/client";
import markConversationAsRead from "../_actions/markConversationRead";
import type { SentMessage } from "../_actions/sendMessage";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";

type ChatMessage = {
  id: string;
  content: string;
  createdAt: Date | string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
};

type ChatWindowProps = {
  conversationId: string;
  viewerId: string;
  initialMessages: ChatMessage[];
};

export default function ChatWindow({
  conversationId,
  initialMessages,
  viewerId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [, startReadTransition] = useTransition();

  function handleMessageSent(message: SentMessage) {
    setMessages((currentMessages) => [...currentMessages, message]);
  }

  useEffect(() => {
    const pusher = getPusherClient();

    if (!pusher) {
      return;
    }

    const channelName = getUserRealtimeChannel(viewerId);
    const channel = pusher.subscribe(channelName);

    function handleMessageCreated(payload: MessageCreatedEvent) {
      if (payload.conversationId !== conversationId) {
        return;
      }

      setMessages((currentMessages) => {
        if (currentMessages.some((message) => message.id === payload.id)) {
          return currentMessages;
        }

        return [...currentMessages, payload];
      });

      if (payload.senderId !== viewerId) {
        startReadTransition(async () => {
          await markConversationAsRead(conversationId);
        });
      }
    }

    channel.bind(PUSHER_MESSAGE_CREATED_EVENT, handleMessageCreated);

    return () => {
      channel.unbind(PUSHER_MESSAGE_CREATED_EVENT, handleMessageCreated);
      pusher.unsubscribe(channelName);
    };
  }, [conversationId, viewerId]);

  return (
    <section className={cn("flex flex-col")}>
      <div className={cn("flex flex-col gap-2 overflow-y-auto p-4")}>
        {messages.map((message) => {
          const isMine = message.senderId === viewerId;

          return (
            <div
              key={message.id}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2",
                  isMine ? "bg-primary text-white" : "bg-white/10",
                )}
              >
                {message.content}
              </div>
            </div>
          );
        })}
      </div>
      <MessageInput
        conversationId={conversationId}
        onMessageSent={handleMessageSent}
      />
    </section>
  );
}
