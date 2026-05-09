import { getTranslations } from "next-intl/server";

import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { getSession } from "@/lib/authSession";
import AppPageShell from "../_components/app-page-shell";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    const t = await getTranslations("settings");

    return (
      <AppPageShell title={t("title")} description={t("description")}>
        <AuthRequiredPrompt />
      </AppPageShell>
    );
  }

  return children;
}
