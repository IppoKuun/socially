"use client";

import { cookiesResponseAction } from "../actions";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  refere?: string | null;
  language?: string | null;
};
export default function CookiesConsentBanner({ refere, language }: Props) {
  const t = useTranslations("cookies");
  const sp = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const utm_source = sp.get("utm_source") as string | undefined;
  const utm_medium = sp.get("utm_medium") as string | undefined;
  const utm_campaign = sp.get("utm_campaign") as string | undefined;

  const payload = {
    utm_source,
    utm_medium,
    utm_campaign,
    refere,
    language,
  };

  async function handleConsent(consent: boolean) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await cookiesResponseAction(consent, consent ? payload : undefined);
      setIsVisible(false);
    } catch (error) {
      console.error("Failed to save cookie consent", error);
      setIsSubmitting(false);
    }
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <section
        aria-live="polite"
        className="mx-auto flex max-w-4xl flex-col gap-4 rounded-3xl border border-border-subtle bg-surface p-5 shadow-2xl ring-1 ring-white/5 backdrop-blur md:flex-row md:items-end md:justify-between"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow">
            Socially
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-text-muted">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void handleConsent(false)}
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-subtle bg-surface-light px-4 text-sm font-medium text-foreground transition hover:border-white/15 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("decline")}
          </button>

          <button
            type="button"
            onClick={() => void handleConsent(true)}
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-glow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("accept")}
          </button>
        </div>
      </section>
    </div>
  );
}
