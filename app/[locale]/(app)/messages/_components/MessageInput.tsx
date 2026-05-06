"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { sendMessage, SentMessage } from "../_actions/sendMessage";

type MessageInputProps = {
  conversationId: string;
  onMessageSent: (message: SentMessage) => void;
};

export function MessageInput({
  conversationId,
  onMessageSent,
}: MessageInputProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<string>("");
  const [servMsg, setServMsg] = useState<string>("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    const trimmedContent = content.trim();

    if (!trimmedContent) return;

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
        "flex w-full flex-row rounded-full",
        isPending && "opacity-70",
      )}
    >
      {servMsg && <p className="">{servMsg}</p>}
      <Input
        name="content"
        disabled={isPending}
        autoComplete="off"
        autoFocus
        placeholder="Ecrivez un message"
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button type="submit" disabled={isPending || content.trim().length === 0}>
        {isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight />
        )}
      </Button>
    </form>
  );
}
