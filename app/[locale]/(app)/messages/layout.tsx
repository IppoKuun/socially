import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import {
  getMessagesViewer,
  getUserConversations,
} from "@/lib/messages/queries";
import { MessagesShell } from "./_components/MessagesShell";
import { getSession } from "@/lib/authSession";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default async function MessagesPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("appShell.pages.messages");
  const session = await getSession();

  if (!session) {
    return (
      <AppPageShell
        title={t("title")}
        description={t("description")}
        className="h-full min-h-0"
      >
        <AuthRequiredPrompt />
      </AppPageShell>
    );
  }

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
