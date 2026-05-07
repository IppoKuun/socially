import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Shield, UserX } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function SettingsPrivacyPage() {
  const t = await getTranslations("settings");

  return (
    <section className="space-y-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("backToSettings")}
      </Link>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
            <Shield className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h1 className="font-manrope text-xl font-semibold text-white">
              {t("privacy.title")}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-white/55">
              {t("privacy.description")}
            </p>
          </div>
        </div>
      </div>

      <Link href={"/settings/privacy/block"} className="block">
        <article className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
              <UserX className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-white">
                {t("privacy.blockListCard.title")}
              </p>
              <p className="text-sm leading-6 text-white/50">
                {t("privacy.blockListCard.description")}
              </p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0">
            {t("privacy.blockListCard.button")}
          </Button>
        </article>
      </Link>
    </section>
  );
}
