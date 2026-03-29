"use client";
import React, { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import createProfile from "./_actions/actions";
import { useRouter } from "next/router";
import { signIn } from "@/lib/authClient";

export default function LoginPage() {
  const [signMode, setSignMode] = useState<"signin" | "signup">("signup");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

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
            setError(ctx.error.message || t("login.error.email"));
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
      setError(error.message || t("login.error.social"));
    }
  }

  const t = useTranslations("login");
  return (
    <main className="">
      {/* On sépare les 2 forms, un qui vas partir a serv action un autre par le client better auth */}
      {signMode === "signup" ? (
        <form action={formAction} className="">
          <h1 className="">{t("title.signup")}</h1>
          <p className="">{t("description.signup")}</p>
          <input name="name" className=""></input>
          <input
            name="email"
            value={email}
            placeholder="youremail@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
            className=""
          ></input>
          <input
            name="password"
            value={password}
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            className=""
          ></input>
          <span className="">{t("forgotPassword")}</span>

          {error ?? <p className="">{error}</p>}
          <button disabled={loading || isPending} type="submit">
            {t("submit.signup")}
          </button>

          <span className="">{t("divider")}</span>
          <div className="">{/*METTRE PROVIDERS */}</div>
          <div className="">
            <p className="">{t("loginPrompt")}</p>
            <button onClick={() => setSignMode("signin")} className="">
              {t("loginLink")}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleEmailLogin} className="">
          <h1 className="">{t("title.signin")}</h1>
          <p className="">{t("description.signin")}</p>
          <input
            name="email"
            value={email}
            placeholder="youremail@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
            className=""
          ></input>
          <input
            name="password"
            value={password}
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            className=""
          ></input>
          <span className="">{t("forgotPassword")}</span>

          {error ?? <p className="">{error}</p>}
          <button disabled={loading || isPending} type="submit">
            {t("submit.signin")}
          </button>

          <span className="">{t("divider")}</span>
          <div className="">{/*METTRE PROVIDERS */}</div>
          <div className="">
            <p className="">{t("signupPrompt")}</p>
            <button onClick={() => setSignMode("signup")} className="">
              {t("signupLink")}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
