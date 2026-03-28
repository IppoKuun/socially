"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import createProfile from "./_actions/actions";

export default function LoginPage() {
  const [signMode, setSignMode] = useState<"signin" | "signup">("signup");
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations("login");
  return (
    <main className="">
      <form action={createProfile} className="">
        <h1 className="">
          {signMode === "signin" ? t("title.signin") : t("title.signup")}
        </h1>
        <p className="">
          {signMode === "signin"
            ? t("description.signin")
            : t("description.signup")}
        </p>
        {signMode === "signup" && <input name="name" className=""></input>}
        <input name="email" placeholder="Email" className=""></input>
        <input name="password" placeholder="password" className=""></input>
        <span className="">{t("forgotPassword")}</span>

        <span className="">{t("divider")}</span>
        <div className="">{/*METTRE PROVIDERS */}</div>
        <div className="">
          {signMode === "signin" ? (
            <>
              <p className="">{t("signupPrompt")}</p>
              <button onClick={() => setSignMode("signin")} className="">
                {t("signupLink")}
              </button>
            </>
          ) : (
            <>
              <p className="">{t("loginPrompt")}</p>
              <button onClick={() => setSignMode("signup")} className="">
                {t("loginLink")}
              </button>
            </>
          )}
        </div>
      </form>
    </main>
  );
}
