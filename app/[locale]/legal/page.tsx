import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link, routing } from "@/i18n/routing";
import { createPublicPageMetadata, type AppLocale } from "@/lib/seo";
import { getLegalDocuments } from "@/lib/legal/documents";

type Props = {
  params: Promise<{ locale: string }>;
};

function resolveLocale(locale: string): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const appLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: appLocale, namespace: "legal" });

  return createPublicPageMetadata({
    title: t("hubTitle"),
    description: t("hubDescription"),
    locale: appLocale,
    pathname: "/legal",
  });
}

export default async function LegalIndexPage({ params }: Props) {
  const { locale } = await params;
  const appLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: appLocale, namespace: "legal" });
  const documents = getLegalDocuments(appLocale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-glow">
            {t("eyebrow")}
          </p>
          <div className="max-w-3xl space-y-3">
            <h1 className="font-manrope text-4xl leading-tight text-white sm:text-5xl">
              {t("hubTitle")}
            </h1>
            <p className="text-base leading-7 text-white/58">
              {t("hubDescription")}
            </p>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((document) => (
            <Link
              key={document.slug}
              href={`/legal/${document.slug}`}
              className="group rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <article className="flex h-full flex-col gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/38">
                    {t("updatedLabel")} {document.updatedAt}
                  </p>
                  <h2 className="font-manrope text-xl font-semibold text-white">
                    {document.title}
                  </h2>
                  <p className="text-sm leading-6 text-white/56">
                    {document.description}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary-glow">
                  {t("readDocument")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
