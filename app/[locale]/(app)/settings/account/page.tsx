import { Link } from "@/i18n/routing";
import { getUserInfo } from "@/lib/settings/account/queries";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import UserField from "./_components/UserField";
import UserDeleteArea from "./_components/UserDeleteArea";

export default async function SettingsAccountPage() {
  const t = await getTranslations("settings");
  const userInfo = await getUserInfo();

  if (!userInfo) {
    return notFound();
  }

  //Pas de AppPageShell dans le TSX ici c'est normal //
  return (
    <main className="space-y-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("backToSettings")}
      </Link>
      <UserField userInfo={userInfo} />
      <UserDeleteArea />
    </main>
  );
}
