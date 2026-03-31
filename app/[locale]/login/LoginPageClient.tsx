"use client";

import React, { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import createProfile from "./_actions/actions";
import { signIn } from "@/lib/authClient";
import Image from "next/image";

export default function LoginPageClient() {
  const [signMode, setSignMode] = useState<"signin" | "signup">("signup");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();
  const t = useTranslations("login");

  const initialState = { ok: false, userMsg: "" };
  const [state, formAction, isPending] = useActionState<
    typeof initialState,
    FormData
  >(createProfile, initialState);

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();

    await signIn.email(
      {
        email,
        password,
        rememberMe: true,
        callbackURL: "/feed",
      },
      {
        onSuccess: () => {
          router.push("/feed");
        },
        onError: (ctx) => {
          if (ctx.error) {
            setError(ctx.error.message || t("error.email"));
            setLoading(false);
          }
        },
      },
    );

    setLoading(false);
  }

  async function handleSocialLogin() {
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: "/feed",
    });

    if (error) {
      setError(error.message || t("error.social"));
    }
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-5 overflow-hidden px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,540px)] lg:items-stretch lg:gap-6 xl:px-8 xl:py-8 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_14%_20%,rgba(79,141,255,0.12),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.05),transparent_16%),radial-gradient(circle_at_76%_76%,rgba(47,124,255,0.1),transparent_22%)] before:content-['']">
      <div className="relative z-10 flex min-h-[360px] w-full min-w-0 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,#162235_0%,#0e141d_42%,#090c12_100%)] px-6 pb-0 pt-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_28px_90px_-45px_rgba(0,0,0,0.96)] sm:min-h-[430px] sm:px-8 sm:pt-8 lg:min-h-[calc(100vh-3rem)] lg:px-10 lg:pt-10 xl:min-h-[calc(100vh-4rem)] xl:px-14 xl:pt-12 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_72%_14%,rgba(111,170,255,0.18),transparent_30%),linear-gradient(180deg,transparent_58%,rgba(6,8,12,0.42)_100%)] before:content-[''] after:pointer-events-none after:absolute after:inset-x-[10%] after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] after:content-['']">
        <Image
          src={"/socially_white.png"}
          alt="logo"
          width={360}
          height={150}
          priority
          className="relative z-10 h-auto w-[160px] sm:w-[190px] xl:w-[220px]"
        ></Image>
        <h1 className="relative z-10 mt-10 max-w-[10ch] font-space-grotesk text-[clamp(2.75rem,8vw,6.25rem)] font-bold leading-[0.88] tracking-[-0.08em] text-white sm:mt-14 lg:mt-16">
          {t("hero")}
        </h1>
        <Image
          src={"/hero_socially.png"}
          width={700}
          height={700}
          alt="image_hero"
          className="relative z-10 mt-8 h-auto w-full max-w-[34rem] self-center object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.42)] sm:mt-10 lg:mt-auto lg:max-w-[44rem] xl:max-w-[48rem]"
        ></Image>
      </div>
      {/* On sépare les 2 forms, un qui vas partir a serv action un autre par le client better auth */}

      {signMode === "signup" ? (
        <form
          action={formAction}
          className="relative z-10 flex w-full max-w-none flex-col self-center overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,34,0.96)_0%,rgba(13,17,24,0.94)_100%)] p-6 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.92)] backdrop-blur-xl sm:max-w-[560px] sm:p-8 lg:max-w-none lg:self-stretch lg:justify-center lg:p-9 xl:p-10 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] before:content-['']"
        >
          <h1 className="relative text-[2.35rem] font-space-grotesk font-bold leading-[0.95] tracking-[-0.06em] text-white sm:text-[2.9rem] xl:text-[3.2rem]">
            {t("title.signup")}
          </h1>
          <p className="mt-3 max-w-[32ch] text-[0.98rem] leading-7 text-text-muted sm:text-base">
            {t("description.signup")}
          </p>
          <input
            name="name"
            className="input-field mt-6 h-14 w-full rounded-[18px] border-white/10 bg-white/[0.03] px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-text-dim sm:h-[58px] sm:text-[1.02rem]"
          ></input>
          <input
            name="email"
            value={email}
            placeholder={t("email")}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-3.5 h-14 w-full rounded-[18px] border-white/10 bg-white/[0.03] px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-text-dim sm:h-[58px] sm:text-[1.02rem]"
          ></input>
          <input
            name="password"
            value={password}
            placeholder={t("password")}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field mt-3.5 h-14 w-full rounded-[18px] border-white/10 bg-white/[0.03] px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-text-dim sm:h-[58px] sm:text-[1.02rem]"
          ></input>
          <span className="mt-3 inline-flex cursor-pointer self-end text-sm font-semibold text-text-muted transition hover:text-white">
            {t("forgotPassword")}
          </span>

          {error ?? <p className="mt-3 min-h-5 text-sm text-rose-300">{error}</p>}
          <button
            disabled={loading || isPending}
            type="submit"
            className="btn-primary mt-8 h-14 w-full justify-center rounded-[18px] text-base font-semibold shadow-[0_22px_46px_-26px_rgba(47,124,255,0.9)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[58px] sm:text-[1.02rem]"
          >
            {t("submit.signup")}
          </button>

          <span className="mt-7 flex items-center gap-4 text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-text-dim/80 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            {t("divider")}
          </span>
          <button
            type="button"
            onClick={handleSocialLogin}
            className="mt-4 flex h-14 w-full items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/20 hover:bg-white/[0.06] sm:h-[58px]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </button>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-sm text-text-muted sm:text-base">
            <p className="text-center text-sm text-text-muted sm:text-base">
              {t("loginPrompt")}
            </p>
            <button
              type="button"
              onClick={() => setSignMode("signin")}
              className="font-semibold text-white transition hover:text-primary-glow"
            >
              {t("loginLink")}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleEmailLogin}
          className="relative z-10 flex w-full max-w-none flex-col self-center overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,34,0.96)_0%,rgba(13,17,24,0.94)_100%)] p-6 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.92)] backdrop-blur-xl sm:max-w-[560px] sm:p-8 lg:max-w-none lg:self-stretch lg:justify-center lg:p-9 xl:p-10 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] before:content-['']"
        >
          <h1 className="relative text-[2.35rem] font-space-grotesk font-bold leading-[0.95] tracking-[-0.06em] text-white sm:text-[2.9rem] xl:text-[3.2rem]">
            {t("title.signin")}
          </h1>
          <p className="mt-3 max-w-[32ch] text-[0.98rem] leading-7 text-text-muted sm:text-base">
            {t("description.signin")}
          </p>
          <input
            name="email"
            value={email}
            placeholder={t("email")}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-6 h-14 w-full rounded-[18px] border-white/10 bg-white/[0.03] px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-text-dim sm:h-[58px] sm:text-[1.02rem]"
          ></input>
          <input
            name="password"
            value={password}
            placeholder={t("password")}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field mt-3.5 h-14 w-full rounded-[18px] border-white/10 bg-white/[0.03] px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-text-dim sm:h-[58px] sm:text-[1.02rem]"
          ></input>
          <span className="mt-3 inline-flex cursor-pointer self-end text-sm font-semibold text-text-muted transition hover:text-white">
            {t("forgotPassword")}
          </span>

          {/*FAIRE CLASSE ERROR DANS GLOBAL.CSS */}
          {error ?? <p className="mt-3 min-h-5 text-sm text-rose-300">{error}</p>}
          {state.userMsg ?? <p className="mt-3 min-h-5 text-sm text-emerald-300"></p>}
          <button
            disabled={loading || isPending}
            type="submit"
            className="btn-primary mt-8 h-14 w-full justify-center rounded-[18px] text-base font-semibold shadow-[0_22px_46px_-26px_rgba(47,124,255,0.9)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[58px] sm:text-[1.02rem]"
          >
            {t("submit.signin")}
          </button>

          <span className="mt-7 flex items-center gap-4 text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-text-dim/80 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            {t("divider")}
          </span>
          <button
            type="button"
            onClick={handleSocialLogin}
            className="mt-4 flex h-14 w-full items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/20 hover:bg-white/[0.06] sm:h-[58px]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </button>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-sm text-text-muted sm:text-base">
            <p className="text-center text-sm text-text-muted sm:text-base">
              {t("signupPrompt")}
            </p>
            <button
              type="button"
              onClick={() => setSignMode("signup")}
              className="font-semibold text-white transition hover:text-primary-glow"
            >
              {t("signupLink")}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
