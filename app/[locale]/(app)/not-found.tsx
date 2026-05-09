import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";

import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import NotFoundState from "@/components/errors/not-found-state";

export default async function AppNotFound() {
  const t = await getTranslations("notFound.general");

  return (
    <AppPageShell title={t("pageTitle")} description={t("pageDescription")}>
      <NotFoundState
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        icon={<Compass className="size-6" />}
        primaryAction={{ href: "/feed", label: t("primaryAction") }}
        secondaryAction={{ href: "/search", label: t("secondaryAction") }}
      />
    </AppPageShell>
  );
}
