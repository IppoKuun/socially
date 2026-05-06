import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import {
  getMessagesViewer,
  getUserConversations,
} from "@/lib/messages/queries";
import { MessagesShell } from "./_components/MessagesShell";

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
      <MessagesShell conversations={conversations} viewerId={viewer.id}>
        {children}
      </MessagesShell>
    </AppPageShell>
  );
}
