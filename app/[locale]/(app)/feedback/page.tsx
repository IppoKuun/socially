import { getTranslations } from "next-intl/server";

import { noIndexMetadata } from "@/lib/seo";
import AppPageShell from "../_components/app-page-shell";
import PagePlaceholderCard from "../_components/page-placeholder-card";

export const metadata = noIndexMetadata;

export default async function FeedbackPage() {
  const t = await getTranslations("appShell.pages.feedback");

  return (
    // Page en demo pour l'instant, c'est pas grave si elle part en prod comme ça //
    <AppPageShell title={t("title")} description={t("description")}>
      <PagePlaceholderCard message={t("placeholder")} />
    </AppPageShell>
  );
}
