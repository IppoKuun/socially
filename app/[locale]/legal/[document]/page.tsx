import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Link, routing } from "@/i18n/routing";
import {
  createPublicPageMetadata,
  type AppLocale,
} from "@/lib/seo";
import {
  getLegalDocument,
  getLegalDocuments,
  LEGAL_DOCUMENT_SLUGS,
} from "@/lib/legal/documents";

type Props = {
  params: Promise<{ locale: string; document: string }>;
};

function resolveLocale(locale: string): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LEGAL_DOCUMENT_SLUGS.map((document) => ({ locale, document })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, document } = await params;
  const appLocale = resolveLocale(locale);
  const legalDocument = getLegalDocument(appLocale, document);

  if (!legalDocument) {
    return {};
  }

  return createPublicPageMetadata({
    title: legalDocument.title,
    description: legalDocument.description,
    locale: appLocale,
    pathname: `/legal/${legalDocument.slug}`,
  });
}

export default async function LegalDocumentPage({ params }: Props) {
  const { locale, document } = await params;
  const appLocale = resolveLocale(locale);
  const legalDocument = getLegalDocument(appLocale, document);

  if (!legalDocument) {
    notFound();
  }

  const t = await getTranslations({ locale: appLocale, namespace: "legal" });
  const documents = getLegalDocuments(appLocale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-8 lg:py-14">
        <div className="min-w-0 space-y-8">
          <Link
            href="/legal"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t("backToIndex")}
          </Link>

          <header className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-glow">
              {t("eyebrow")}
            </p>
            <div className="max-w-3xl space-y-3">
              <h1 className="font-manrope text-4xl leading-tight text-white sm:text-5xl">
                {legalDocument.title}
              </h1>
              <p className="text-base leading-7 text-white/58">
                {legalDocument.description}
              </p>
              <p className="text-sm text-white/40">
                {t("updatedLabel")} {legalDocument.updatedAt}
              </p>
            </div>
          </header>

          <div className="space-y-5">
            {legalDocument.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-5"
              >
                <h2 className="font-manrope text-xl font-semibold text-white">
                  {section.title}
                </h2>

                {section.paragraphs ? (
                  <div className="mt-3 space-y-3">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-white/58"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}

                {section.items ? (
                  <ul className="mt-3 space-y-2.5">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm leading-7 text-white/58"
                      >
                        <span className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">
            {t("documentsLabel")}
          </p>
          <nav className="mt-3 grid gap-1">
            {documents.map((item) => (
              <Link
                key={item.slug}
                href={`/legal/${item.slug}`}
                className={
                  item.slug === legalDocument.slug
                    ? "rounded-md bg-white/[0.08] px-3 py-2 text-sm font-medium text-white"
                    : "rounded-md px-3 py-2 text-sm text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
                }
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
      </article>
    </main>
  );
}
