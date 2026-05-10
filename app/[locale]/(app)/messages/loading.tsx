import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import { MessagesShellSkeleton } from "@/components/loading/app-skeletons";

export default async function MessagesLoading() {
  const t = await getTranslations("appShell.pages.messages");

  return (
    <AppPageShell
      title={t("title")}
      description={t("description")}
      className="h-full min-h-0"
    >
      <MessagesShellSkeleton />
    </AppPageShell>
  );
}
