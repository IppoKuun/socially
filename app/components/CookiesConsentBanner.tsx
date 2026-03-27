"use client";

import { cookiesResponseAction } from "../actions";
import { useTranslations } from "next-intl";

type Props = {
  utm_medium?: string;
  utm_campaign?: string;
  utm_source?: string;
  refere?: string | null;
  language?: string | null;
};
export default function CookiesConsentBanner({
  utm_medium,
  utm_campaign,
  utm_source,
  refere,
  language,
}: Props) {
  const payload = {
    utm_source,
    utm_medium,
    utm_campaign,
    refere,
    language,
  };

  const t = useTranslations("cookies");
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
