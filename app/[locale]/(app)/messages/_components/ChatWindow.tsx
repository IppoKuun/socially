"use client";

import {
  getConversationRealtimeChannel,
  getUserRealtimeChannel,
  MESSAGE_CONVERSATION_READ_EVENT,
  MESSAGE_CONVERSATION_UPDATED_EVENT,
  PUSHER_MESSAGE_CREATED_EVENT,
  PUSHER_MESSAGE_READ_EVENT,
  PUSHER_MESSAGE_TYPING_EVENT,
  type MessageCreatedEvent,
  type MessageReadEvent,
  type MessageTypingEvent,
} from "@/lib/pusher/events";
import { getPusherClient } from "@/lib/pusher/client";
import markConversationAsRead from "../_actions/markConversationRead";
import type { SentMessage } from "../_actions/sendMessage";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

type ChatMessage = {
  id: string;
  content: string;
  createdAt: Date | string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
};

function getMessageTimestamp(createdAt: Date | string) {
  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

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
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startReadTransition] = useTransition();

  function handleMessageSent(message: SentMessage) {
    setMessages((currentMessages) => [...currentMessages, message]);

    window.dispatchEvent(
      new CustomEvent<MessageCreatedEvent>(MESSAGE_CONVERSATION_UPDATED_EVENT, {
        detail: message,
      }),
    );
  }

  const triggerTypingState = useCallback((isTyping: boolean) => {
    const pusher = getPusherClient();

    if (!pusher) {
      return;
    }

    const channelName = getConversationRealtimeChannel(conversationId);
    const channel = pusher.channel(channelName) || pusher.subscribe(channelName);

    // Typing indicator V1: l'auth du channel bloque les non-participants.
    // Un participant peut toujours faker son propre typing depuis DevTools,
    // mais c'est un etat ephemere sans impact metier, donc accepte pour cette scope.
    channel.trigger(PUSHER_MESSAGE_TYPING_EVENT, {
      conversationId,
      senderId: viewerId,
      isTyping,
    } satisfies MessageTypingEvent);
  }, [conversationId, viewerId]);

  useEffect(() => {
    const pusher = getPusherClient();

    if (!pusher) {
      return;
    }

    const channelName = getUserRealtimeChannel(viewerId);
    const channel = pusher.subscribe(channelName);
    const conversationChannelName =
      getConversationRealtimeChannel(conversationId);
    const conversationChannel = pusher.subscribe(conversationChannelName);

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

      const readAtTimestamp = getMessageTimestamp(payload.readAt);

      if (readAtTimestamp === null) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) => {
          const messageTimestamp = getMessageTimestamp(message.createdAt);

          if (
            message.senderId !== viewerId ||
            message.receiverId !== payload.readerId ||
            messageTimestamp === null ||
            messageTimestamp > readAtTimestamp
          ) {
            return message;
          }

          return { ...message, isRead: true };
        }),
      );
    }

    function handleMessageTyping(payload: MessageTypingEvent) {
      if (
        payload.conversationId !== conversationId ||
        payload.senderId === viewerId
      ) {
        return;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setIsOtherTyping(payload.isTyping);

      if (payload.isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherTyping(false);
        }, 3000);
      }
    }

    channel.bind(PUSHER_MESSAGE_CREATED_EVENT, handleMessageCreated);
    channel.bind(PUSHER_MESSAGE_READ_EVENT, handleMessageRead);
    conversationChannel.bind(
      PUSHER_MESSAGE_TYPING_EVENT,
      handleMessageTyping,
    );

    return () => {
      channel.unbind(PUSHER_MESSAGE_CREATED_EVENT, handleMessageCreated);
      channel.unbind(PUSHER_MESSAGE_READ_EVENT, handleMessageRead);
      conversationChannel.unbind(
        PUSHER_MESSAGE_TYPING_EVENT,
        handleMessageTyping,
      );

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, viewerId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(MESSAGE_CONVERSATION_READ_EVENT, {
          detail: { conversationId },
        }),
      );
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [conversationId]);

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

        {isOtherTyping ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-[1.15rem] rounded-bl-md border border-white/8 bg-white/[0.11] px-4 py-3 text-white/72 shadow-[0_14px_34px_-28px_rgba(0,0,0,0.95)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/62" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/62 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/62 [animation-delay:240ms]" />
            </div>
          </div>
        ) : null}
      </div>
      <MessageInput
        conversationId={conversationId}
        onMessageSent={handleMessageSent}
        onTypingChange={triggerTypingState}
      />
    </section>
  );
}
