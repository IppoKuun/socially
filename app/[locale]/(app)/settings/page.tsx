import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import { Database, Shield, User } from "lucide-react";
import { Link } from "@/i18n/routing";

const settingsSections = [
  {
    key: "account",
    href: "/settings/account",
    icon: User,
  },
  {
    key: "privacySecurity",
    href: "/settings/privacy-security",
    icon: Shield,
  },
  {
    key: "data",
    href: "/settings/data",
    icon: Database,
  },
];

export default async function SettingsPage() {
  const t = await getTranslations("appShell.pages.settings");

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="flex flex-col">
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <Link key={section.key} href={section.href}>
              <article className="flex flex-row">
                <Icon />
                <div className="flex flex-col">
                  <p className="">title</p>
                  <p className="">desc</p>
                </div>
              </article>
            </Link>
          );
        })}
      </section>
    </AppPageShell>
  );
}
