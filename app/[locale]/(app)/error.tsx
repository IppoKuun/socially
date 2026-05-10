"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import AppPageShell from "./_components/app-page-shell";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorBoundary.app");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <AppPageShell title={t("pageTitle")} description={t("pageDescription")}>
      <section className="mx-auto flex min-h-[55svh] w-full max-w-2xl items-center justify-center px-1 py-8">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-8 text-center shadow-[0_26px_90px_-58px_rgba(0,0,0,0.95)] sm:px-8 sm:py-10">
          <span
            className="mx-auto flex size-13 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive"
            aria-hidden="true"
          >
            <AlertTriangle className="size-6" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/38">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 font-manrope text-3xl leading-none tracking-[-0.05em] text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/58">
            {t("description")}
          </p>

          <Button
            type="button"
            className="mt-6 rounded-full bg-[linear-gradient(180deg,#2f7cff_0%,#6e63ff_100%)] px-5 text-white shadow-[0_20px_40px_-24px_rgba(47,124,255,0.78)] hover:opacity-95"
            onClick={reset}
          >
            <RefreshCw className="size-4" />
            {t("retry")}
          </Button>
        </div>
      </section>
    </AppPageShell>
  );
}
