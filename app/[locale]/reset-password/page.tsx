"use client";

import { resetPassword } from "@/lib/authClient";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function ResetPasswordPage() {
  const t = useTranslations("passwordReset.reset");

  return (
    <Suspense fallback={<ResetPasswordShell title={t("title")} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordShell({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col justify-center px-4 py-8 sm:max-w-lg">
      <section className="card-premium flex w-full flex-col gap-5 px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
            Socially
          </span>
          <h1 className="font-manrope text-[1.9rem] leading-tight text-white">
            {title}
          </h1>
        </div>
      </section>
    </main>
  );
}

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");
  const t = useTranslations("passwordReset.reset");

  const hasValidToken = Boolean(token) && tokenError !== "INVALID_TOKEN";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(t("invalidToken"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setIsPending(true);

    const { error } = await resetPassword({
      newPassword: password,
      token,
    });

    setIsPending(false);

    if (error) {
      setError(error.message || t("fallbackError"));
      return;
    }

    router.push("/login");
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
            {hasValidToken ? t("description") : t("invalidTokenDescription")}
          </p>
        </div>

        {hasValidToken ? (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-password" className="text-sm text-text-muted">
                {t("passwordLabel")}
              </label>
              <input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="input-field h-11 w-full px-3 py-2 text-base"
                value={password}
                placeholder={t("passwordPlaceholder")}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm-password"
                className="text-sm text-text-muted"
              >
                {t("confirmPasswordLabel")}
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="input-field h-11 w-full px-3 py-2 text-base"
                value={confirmPassword}
                placeholder={t("confirmPasswordPlaceholder")}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
        ) : (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-5 text-rose-100">
            {t("invalidToken")}
          </div>
        )}

        <div className="flex justify-center">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-primary transition hover:text-primary-glow"
          >
            {t("requestNewLink")}
          </Link>
        </div>
      </section>
    </main>
  );
}
