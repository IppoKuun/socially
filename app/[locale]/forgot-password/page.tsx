"use client";

import { requestPasswordReset } from "@/lib/authClient";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasRequestedReset, setHasRequestedReset] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("passwordReset.request");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(t("emptyEmail"));
      return;
    }

    setIsPending(true);

    const { error } = await requestPasswordReset({
      email: cleanEmail,
      redirectTo: `/${locale}/reset-password`,
    });

    setIsPending(false);

    if (error) {
      setError(error.message || t("fallbackError"));
      return;
    }

    setHasRequestedReset(true);
  }

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col justify-center px-4 py-8 sm:max-w-lg">
      <section className="card-premium flex w-full flex-col gap-5 px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
            Socially
          </span>
          <h1 className="font-manrope text-[1.9rem] leading-tight text-white">
            {t("title")}
          </h1>
          <p className="text-sm leading-5 text-text-muted">
            {hasRequestedReset ? t("successDescription") : t("description")}
          </p>
        </div>

        {hasRequestedReset ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm leading-5 text-emerald-100">
            {t("success")}
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-email" className="text-sm text-text-muted">
                {t("emailLabel")}
              </label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                className="input-field h-11 w-full px-3 py-2 text-base"
                value={email}
                placeholder={t("emailPlaceholder")}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {error ? (
              <p className="text-sm leading-5 text-rose-300" aria-live="polite">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-primary h-11 w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? t("pending") : t("submit")}
            </button>
          </form>
        )}

        <div className="flex justify-center">
          {hasRequestedReset ? (
            <button
              type="button"
              className="text-sm font-semibold text-primary transition hover:text-primary-glow"
              onClick={() => router.push("/login")}
            >
              {t("backToLogin")}
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-primary transition hover:text-primary-glow"
            >
              {t("backToLogin")}
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
