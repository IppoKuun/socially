import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import { getUserConversations } from "@/lib/messages/queries";
import { ConversationList } from "./_components/ConversationList";

export default async function MessagesPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("appShell.pages.messages");

  // Pas de tansack dans ce flow car ont gère le dynamise avec Pusher //
  const conversations = await getUserConversations();

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="flex flex-row">
        <ConversationList initialConversations={conversations} />
        <main className="min-w-0">{children}</main>
      </section>
    </AppPageShell>
  );
}
