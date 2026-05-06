import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import {
  getMessagesViewer,
  getUserConversations,
} from "@/lib/messages/queries";
import { ConversationList } from "./_components/ConversationList";

export default async function MessagesPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("appShell.pages.messages");

  // Pas de tansack dans ce flow car ont gère le dynamise avec Pusher //
  const [viewer, conversations] = await Promise.all([
    getMessagesViewer(),
    getUserConversations(),
  ]);

  return (
    <AppPageShell
      title={t("title")}
      description={t("description")}
      className="h-full min-h-0"
    >
      <section className="grid min-h-[620px] overflow-hidden rounded-[1.65rem] border border-white/10 bg-[rgba(15,18,25,0.72)] shadow-[0_26px_90px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl lg:grid-cols-[360px_minmax(0,1fr)]">
        <ConversationList
          initialConversations={conversations}
          viewerId={viewer.id}
        />
        <main className="min-w-0 border-t border-white/10 lg:border-l lg:border-t-0">
          {children}
        </main>
      </section>
    </AppPageShell>
  );
}
