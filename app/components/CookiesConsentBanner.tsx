"use client";

import { cookiesResponseAction } from "../actions";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

type Props = {
  refere?: string | null;
  language?: string | null;
};
export default function CookiesConsentBanner({ refere, language }: Props) {
  const t = useTranslations("cookies");
  const sp = useSearchParams();

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

  return (
    <div className="">
      <section className="">
        <h1 className="">{t("title")}</h1>
        <p className="">{t("description")}</p>
        <input type="submit"></input>
        <button
          onClick={() => cookiesResponseAction(true, payload)}
          className=""
        >
          {t("accept")}
        </button>
        <button onClick={() => cookiesResponseAction(false)} className="">
          {t("decline")}
        </button>
      </section>
    </div>
  );
}
