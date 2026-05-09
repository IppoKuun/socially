import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";

import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import NotFoundState from "@/components/errors/not-found-state";

export default async function PostNotFound() {
  const t = await getTranslations("notFound.post");

  return (
    <AppPageShell title={t("pageTitle")} description={t("pageDescription")}>
      <NotFoundState
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        icon={<FileQuestion className="size-6" />}
        primaryAction={{ href: "/feed", label: t("primaryAction") }}
        secondaryAction={{ href: "/trending", label: t("secondaryAction") }}
      />
    </AppPageShell>
  );
}
