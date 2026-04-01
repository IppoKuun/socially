"use client";

import React, { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import createProfile from "./_actions/actions";
import { signIn } from "@/lib/authClient";
import sociallyWhiteLogo from "@/public/socially_white.png";

export default function LoginPageClient() {
  const [signMode, setSignMode] = useState<"signin" | "signup">("signup");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();
  const t = useTranslations("login");
  const pageShellClass =
    "mx-auto flex h-[100svh] w-full max-w-md flex-col justify-center overflow-hidden px-4 py-4 sm:max-w-lg sm:px-6 sm:py-5 lg:grid lg:max-w-[1500px] lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,420px)] lg:items-stretch lg:gap-6 lg:px-6 lg:py-6 xl:px-8 xl:py-8";
  const visualPanelClass =
    "relative hidden min-h-0 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,#162235_0%,#0e141d_42%,#090c12_100%)] px-8 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_28px_90px_-45px_rgba(0,0,0,0.96)] lg:flex lg:flex-col lg:justify-between before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_72%_14%,rgba(111,170,255,0.18),transparent_30%),linear-gradient(180deg,transparent_58%,rgba(6,8,12,0.42)_100%)] before:content-[''] after:pointer-events-none after:absolute after:inset-x-[10%] after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] after:content-['']";
  const formColumnClass = "flex min-h-0 w-full flex-col justify-center lg:py-2";
  const authCardClass =
    "card-premium mt-4 flex w-full flex-col items-stretch gap-2 px-5 py-4 sm:mt-5 sm:px-6 sm:py-5 lg:mt-0 lg:mx-auto lg:max-w-[420px]";
  const titleClass =
    "text-center font-manrope text-[1.72rem] leading-none text-white sm:text-[1.92rem]";
  const descriptionClass =
    "text-center text-sm leading-5 text-text-muted sm:text-[0.95rem]";
  const labelClass = "text-sm font-medium text-text-muted";
  const inputClass =
    "input-field h-10 w-full px-3 py-2 text-sm sm:h-11 sm:text-base";
  const helperTextClass =
    "self-end text-sm text-text-muted transition hover:text-text-main";
  const providerCardClass =
    " h-15 mt-5 flex w-full items-center gap-3 rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(47,124,255,0.18),transparent_34%),linear-gradient(180deg,rgba(21,26,36,0.98),rgba(16,20,29,0.94))] px-4 py-3.5 text-left shadow-[0_22px_48px_-34px_rgba(47,124,255,0.82)] transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_26px_58px_-34px_rgba(47,124,255,0.92)]";
  const providerIconWrapClass =
    "flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm";
  const providerTitleClass =
    "text-left text-base font-semibold text-white sm:text-[1.04rem]";
  const submitButtonClass =
    "btn-primary mt-1 h-11 w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:text-base";
  const sectionDividerClass =
    "my-1 flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-text-dim/80 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10";
  const emailSectionClass = "flex flex-col gap-2.5";
  const signupFieldsGridClass = "grid gap-2.5 sm:grid-cols-2 sm:gap-3";
  const fieldStackClass = "flex flex-col gap-1.5";
  const fullWidthFieldClass = "sm:col-span-2";
  const switchRowClass =
    "mt-1 flex flex-wrap items-center justify-center gap-1.5 text-sm text-text-muted";
  const switchButtonClass =
    "font-semibold text-primary transition hover:text-primary-glow";

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
    <main className={pageShellClass}>
      <section className={visualPanelClass}>
        <div className="relative z-10 flex flex-col ">
          <Image
            src={sociallyWhiteLogo}
            alt="Socially logo"
            priority
            className="h-auto w-[165px]  self-center xl:w-[390px]"
          ></Image>
          <h1 className="text-gradient mt-8 max-w-[14ch] font-manrope text-[clamp(2.1rem,5.8vw,4.5rem)] leading-[0.88] tracking-[-0.08em]">
            {t("hero")}
          </h1>
        </div>
      </section>

      <div className={formColumnClass}>
        <div className="flex flex-col items-center lg:hidden">
          <Image
            src={sociallyWhiteLogo}
            alt="Socially logo"
            priority
            className="h-auto w-36 sm:w-40"
          ></Image>
          <h1 className="text-gradient mt-3 max-w-[12ch] text-center font-manrope text-[clamp(2.3rem,7vw,3.4rem)] leading-[0.95] tracking-[-0.05em]">
            {t("hero")}
          </h1>
        </div>

        {/* On separe les 2 forms, un qui vas partir a serv action un autre par le client better auth */}
        {signMode === "signup" ? (
          <form className={authCardClass} action={formAction}>
            <h2 className={titleClass}>{t("title.signup")}</h2>
            <p className={descriptionClass}>{t("description.signup")}</p>

            <button
              type="button"
              className={providerCardClass}
              aria-label={t("google")}
              onClick={handleSocialLogin}
            >
              <span className={providerIconWrapClass}>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
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
              </span>
              <span className={providerTitleClass}>{t("google")}</span>
            </button>

            <p
              className="min-h-5 text-center text-sm text-rose-300"
              aria-live="polite"
            >
              {error ?? ""}
            </p>

            <span className={sectionDividerClass}>{t("email")}</span>
            <div className={signupFieldsGridClass}>
              <div className={fieldStackClass}>
                <label htmlFor="signup-name" className={labelClass}>
                  Nom
                </label>
                <input
                  id="signup-name"
                  name="name"
                  placeholder="name"
                  autoComplete="name"
                  className={inputClass}
                ></input>
              </div>
              <div className={fieldStackClass}>
                <label htmlFor="signup-email" className={labelClass}>
                  {t("email")}
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  className={inputClass}
                  placeholder={t("email")}
                  onChange={(e) => setEmail(e.target.value)}
                ></input>
              </div>
              <div className={`${fieldStackClass} ${fullWidthFieldClass}`}>
                <label htmlFor="signup-password" className={labelClass}>
                  {t("password")}
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className={inputClass}
                  value={password}
                  placeholder={t("password")}
                  onChange={(e) => setPassword(e.target.value)}
                ></input>
                <span className={helperTextClass}>{t("forgotPassword")}</span>
              </div>
            </div>
            <button
              disabled={loading || isPending}
              className={submitButtonClass}
              type="submit"
            >
              {t("submit.signup")}
            </button>
            <div className={switchRowClass}>
              <p>{t("loginPrompt")}</p>
              <button
                type="button"
                className={switchButtonClass}
                onClick={() => setSignMode("signin")}
              >
                {t("loginLink")}
              </button>
            </div>
          </form>
        ) : (
          <form className={authCardClass} onSubmit={handleEmailLogin}>
            <h2 className={titleClass}>{t("title.signin")}</h2>
            <p className={descriptionClass}>{t("description.signin")}</p>

            <button
              type="button"
              className={providerCardClass}
              aria-label={t("google")}
              onClick={handleSocialLogin}
            >
              <span className={providerIconWrapClass}>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
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
              </span>
              <span className={providerTitleClass}>{t("google")}</span>
            </button>

            {/* FAIRE CLASSE ERROR DANS GLOBAL.CSS */}
            <p
              className="min-h-5 text-center text-sm text-rose-300"
              aria-live="polite"
            >
              {error ?? ""}
            </p>
            {state.userMsg ? (
              <p
                className="text-center text-sm text-emerald-300"
                aria-live="polite"
              >
                {state.userMsg}
              </p>
            ) : null}

            <span className={sectionDividerClass}>{t("email")}</span>
            <div className={emailSectionClass}>
              <div className={fieldStackClass}>
                <label htmlFor="signin-email" className={labelClass}>
                  {t("email")}
                </label>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  className={inputClass}
                  placeholder={t("email")}
                  onChange={(e) => setEmail(e.target.value)}
                ></input>
              </div>
              <div className={fieldStackClass}>
                <label htmlFor="signin-password" className={labelClass}>
                  {t("password")}
                </label>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  className={inputClass}
                  placeholder={t("password")}
                  onChange={(e) => setPassword(e.target.value)}
                ></input>
              </div>
            </div>
            <button
              disabled={loading || isPending}
              className={submitButtonClass}
              type="submit"
            >
              {t("submit.signin")}
            </button>
            <div className={switchRowClass}>
              <p>{t("signupPrompt")}</p>
              <button
                type="button"
                className={switchButtonClass}
                onClick={() => setSignMode("signup")}
              >
                {t("signupLink")}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
