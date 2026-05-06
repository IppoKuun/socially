"use client";

import type { SentMessage } from "../_actions/sendMessage";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

  function handleMessageSent(message: SentMessage) {
    setMessages((currentMessages) => [...currentMessages, message]);
  }

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
