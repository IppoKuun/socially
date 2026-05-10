import { UserRoundX } from "lucide-react";
import { getTranslations } from "next-intl/server";

import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import NotFoundState from "@/components/errors/not-found-state";

export default async function ProfileNotFound() {
  const t = await getTranslations("notFound.profile");

  return (
    <AppPageShell title={t("pageTitle")} description={t("pageDescription")}>
      <NotFoundState
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        icon={<UserRoundX className="size-6" />}
        primaryAction={{ href: "/search", label: t("primaryAction") }}
        secondaryAction={{ href: "/feed", label: t("secondaryAction") }}
      />
    </AppPageShell>
  );
}
