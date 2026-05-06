"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { UserConversationReturnType } from "@/lib/messages/queries";
import { ConversationList } from "./ConversationList";

type MessagesShellProps = {
  children: ReactNode;
  conversations: UserConversationReturnType;
  viewerId: string;
};

export function MessagesShell({
  children,
  conversations,
  viewerId,
}: MessagesShellProps) {
  const selectedSegment = useSelectedLayoutSegment();
  const hasSelectedConversation = selectedSegment !== null;

  return (
    <section className="grid min-h-[calc(100svh-11rem)] overflow-hidden rounded-[1.65rem] border border-white/10 bg-[rgba(15,18,25,0.72)] shadow-[0_26px_90px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl md:min-h-[620px] md:grid-cols-[340px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside
        className={cn(
          "min-w-0",
          hasSelectedConversation ? "hidden md:block" : "block",
        )}
      >
        <ConversationList
          initialConversations={conversations}
          viewerId={viewerId}
        />
      </aside>

      <main
        className={cn(
          "min-w-0 border-white/10 md:border-l",
          hasSelectedConversation ? "block" : "hidden md:block",
        )}
      >
        {children}
      </main>
    </section>
  );
}
