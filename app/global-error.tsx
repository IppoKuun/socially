"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050608] text-white antialiased">
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <section className="w-full max-w-xl rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-8 text-center shadow-[0_26px_90px_-58px_rgba(0,0,0,0.95)] sm:px-8 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/38">
              Critical error
            </p>
            <h1 className="mt-3 font-sans text-3xl font-semibold leading-none tracking-[-0.04em] text-white sm:text-4xl">
              Socially cannot load
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/58">
              A critical error occurred before the app could render. The issue
              has been reported.
            </p>
            <button
              type="button"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#2f7cff] px-5 text-sm font-medium text-white transition hover:bg-[#2568d8]"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
