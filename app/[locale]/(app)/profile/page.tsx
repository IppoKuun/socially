import { getSession } from "@/lib/authSession";
import { redirect } from "@/i18n/routing";
import { myPrisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import AppPageShell from "../_components/app-page-shell";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";

export default async function ProfilePage() {
  const locale = await getLocale();
  const t = await getTranslations("appShell.navigation");
  const session = await getSession();

  if (!session) {
    return (
      <AppPageShell title={t("profile")} description="">
        <AuthRequiredPrompt />
      </AppPageShell>
    );
  }

  const username = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: {
      username: true,
    },
  });

  const profileUsername = username?.username;

  if (!profileUsername) {
    redirect({
      href: "/settings/account",
      locale,
    });
  }

  redirect({
    href: `/profile/${profileUsername}`,
    locale,
  });
}
