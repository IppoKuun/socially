"use client";

import {
  getUserRealtimeChannel,
  MESSAGE_CONVERSATION_UPDATED_EVENT,
  PUSHER_MESSAGE_CREATED_EVENT,
  PUSHER_MESSAGE_READ_EVENT,
  type MessageCreatedEvent,
  type MessageReadEvent,
} from "@/lib/pusher/events";
import { getPusherClient } from "@/lib/pusher/client";
import markConversationAsRead from "../_actions/markConversationRead";
import type { SentMessage } from "../_actions/sendMessage";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
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

    window.dispatchEvent(
      new CustomEvent<MessageCreatedEvent>(MESSAGE_CONVERSATION_UPDATED_EVENT, {
        detail: message,
      }),
    );
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

    function handleMessageRead(payload: MessageReadEvent) {
      if (payload.conversationId !== conversationId) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) => {
          if (
            message.senderId !== viewerId ||
            message.receiverId !== payload.readerId
          ) {
            return message;
          }

          return { ...message, isRead: true };
        }),
      );
    }

    channel.bind(PUSHER_MESSAGE_CREATED_EVENT, handleMessageCreated);
    channel.bind(PUSHER_MESSAGE_READ_EVENT, handleMessageRead);

    return () => {
      channel.unbind(PUSHER_MESSAGE_CREATED_EVENT, handleMessageCreated);
      channel.unbind(PUSHER_MESSAGE_READ_EVENT, handleMessageRead);
    };
  }, [conversationId, viewerId]);

  return (
    <section className={cn("flex min-h-[526px] flex-1 flex-col")}>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-6",
        )}
      >
        {messages.map((message) => {
          const isMine = message.senderId === viewerId;

          return (
            <div
              key={message.id}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-[1.15rem] px-4 py-3 text-sm leading-6 shadow-[0_14px_34px_-28px_rgba(0,0,0,0.95)]",
                  isMine
                    ? "rounded-br-md bg-primary text-white"
                    : "rounded-bl-md border border-white/8 bg-white/[0.11] text-white/92",
                )}
              >
                {message.content}
              </div>
              {isMine ? (
                <CheckCheck
                  className={cn(
                    "ml-2 mt-auto h-4 w-4 shrink-0",
                    message.isRead ? "text-sky-300" : "text-white/32",
                  )}
                  aria-label={message.isRead ? "Message lu" : "Message envoyé"}
                />
              ) : null}
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
