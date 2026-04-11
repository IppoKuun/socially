import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import PagePlaceholderCard from "../_components/page-placeholder-card";

export default async function SearchPage() {
  const t = await getTranslations("appShell.pages.search");

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <PagePlaceholderCard message={t("placeholder")} />
    </AppPageShell>
  );
}
