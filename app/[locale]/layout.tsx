import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";

import CookiesConsentBanner from "../components/CookiesConsentBanner";

import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const { children, params } = props;
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  let cookiesBanner: React.ReactNode = null;

  // Si User est pas connecté, on regarde si il a vu cookiesBanner //
  // Si non on lui envoie le composant Banner avec le serv Action avec tout les infos dont ont a besoin //
  // Si oui on regarde si il a accepté Cookies Banner, si il a accepté on regarde si sa session est active //
  // Si elle est pas active User vient de se reconnecter //
  const session = await getSession();
  if (!session) {
    const c = await cookies();
    const h = await headers();
    const hasConsent = c.get("cookie_consent");
    const language = h.get("accept-language");
    const refere = h.get("referer");

    if (!hasConsent) {
      console.log("redirect COOKIE banner");
      cookiesBanner = (
        <CookiesConsentBanner refere={refere} language={language} />
      );
    }

    // Si user a accepté les cookies, on regarde si il a deja une session, si non ont lui increment sont visitCount //
    if (hasConsent?.value === "true") {
      const visitorId = c.get("visitorId")?.value;
      const sessionActive = c.get("session_active");
      if (sessionActive?.value !== "true") {
        if (visitorId) {
          await myPrisma.anonymousVisitor.update({
            where: { visitorId },
            data: { visitCount: { increment: 1 } },
          });
        }
      }
    }
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {cookiesBanner}
      {children}
    </NextIntlClientProvider>
  );
}
