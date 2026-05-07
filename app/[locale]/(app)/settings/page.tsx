import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import { ArrowRight, Database, Shield, User } from "lucide-react";
import { Link } from "@/i18n/routing";

const settingsSections = [
  {
    key: "account",
    href: "/settings/account",
    icon: User,
  },
  {
    key: "privacySecurity",
    href: "/settings/privacy",
    icon: Shield,
  },
  {
    key: "data",
    href: "/settings/data",
    icon: Database,
  },
] as const;

export default async function SettingsPage() {
  const t = await getTranslations("appShell.pages.settings");

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="grid gap-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <Link key={section.key} href={section.href} className="group">
              <article className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-white">
                      {t(`menu.${section.key}.title`)}
                    </p>
                    <p className="max-w-xl text-sm leading-6 text-white/50">
                      {t(`menu.${section.key}.description`)}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="size-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70"
                  aria-hidden="true"
                />
              </article>
            </Link>
          );
        })}
      </section>
    </AppPageShell>
  );
}
