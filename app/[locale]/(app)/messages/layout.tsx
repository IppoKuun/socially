import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import { makeQueryClient } from "@/lib/query-client";
import { getUserConversations } from "@/lib/messages/queries";
import { ConversationList } from "./_components/ConversationList";

export default async function MessagesPage() {
  const t = await getTranslations("appShell.pages.messages");

  const queryClient = makeQueryClient();

  const conversations = await queryClient.fetchQuery({
    queryKey: ["conversationLists"],
    queryFn: () => {
      return getUserConversations();
    },
  });

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <ConversationList initialConversations={conversations} />
    </AppPageShell>
  );
}
