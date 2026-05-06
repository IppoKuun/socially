"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { sendMessage, SentMessage } from "../_actions/sendMessage";

type MessageInputProps = {
  conversationId: string;
  onMessageSent: (message: SentMessage) => void;
  onTypingChange?: (isTyping: boolean) => void;
};

export function MessageInput({
  conversationId,
  onMessageSent,
  onTypingChange,
}: MessageInputProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<string>("");
  const [servMsg, setServMsg] = useState<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (!isTypingRef.current) {
      return;
    }

    isTypingRef.current = false;
    onTypingChange?.(false);
  }, [onTypingChange]);

  const clearTypingTimeout = useCallback(() => {
    if (!typingTimeoutRef.current) {
      return;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  }, []);

  function handleContentChange(value: string) {
    setContent(value);
    clearTypingTimeout();

    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingChange?.(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2500);
  }

  useEffect(() => {
    return () => {
      clearTypingTimeout();
      stopTyping();
    };
  }, [clearTypingTimeout, stopTyping]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    clearTypingTimeout();
    stopTyping();

    startTransition(async () => {
      setServMsg("");

      const result = await sendMessage({
        conversationId,
        content: trimmedContent,
      });

      if (!result.ok) {
        setServMsg(
          result.userMsg ?? "Erreur serveur impossible d'envoyez le message",
        );
        return;
      }

      onMessageSent(result.messageQuery);
      setContent("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full items-center gap-3 border-t border-white/10 bg-[rgba(18,21,28,0.86)] px-5 py-4 backdrop-blur-xl",
        isPending && "opacity-70",
      )}
    >
      <div className="relative min-w-0 flex-1">
        {servMsg && (
          <p className="absolute -top-7 left-4 text-xs text-destructive">
            {servMsg}
          </p>
        )}
        <Input
          name="content"
          disabled={isPending}
          autoComplete="off"
          autoFocus
          placeholder="Write a message..."
          required
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="h-[52px] rounded-full border-white/18 bg-black/12 px-5 pr-14 text-white placeholder:text-white/42 focus-visible:border-white/32 focus-visible:ring-white/12"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || content.trim().length === 0}
        className="h-11 w-11 rounded-full bg-white/18 p-0 text-white hover:bg-primary disabled:bg-white/10 disabled:text-white/38"
      >
        {isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
