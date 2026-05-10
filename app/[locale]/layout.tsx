import { myPrisma } from "@/lib/prisma";
import { redirect, routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";

import CookiesConsentBanner from "../components/CookiesConsentBanner";
import AnonymousSessionTracker from "../components/AnonymousSessionTracker";

import { getSession } from "@/lib/authSession";

type AppLocale = (typeof routing.locales)[number];

function isAppLocale(value: string | null | undefined): value is AppLocale {
  return routing.locales.includes(value as AppLocale);
}

function getPathnameWithoutLocale(pathname: string, locale: string) {
  const localePrefix = `/${locale}`;

  if (pathname === localePrefix) {
    return "/";
  }

  if (pathname.startsWith(`${localePrefix}/`)) {
    return pathname.slice(localePrefix.length);
  }

  return pathname;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const { children, params } = props;
  const { locale } = await params;

  const h = await headers();
  const pathname = h.get("x-pathname");

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // CHECK si user a onboarded ou pas //
  // A changer de logique/emplacement si ça ruine performance //
  const session = await getSession();
  if (session) {
    const id = session.user.id;
    const user = await myPrisma.userProfile.findUnique({
      where: { userId: id },
      select: { hasOnboarded: true, language: true },
    });

    const preferredLocale = isAppLocale(user?.language) ? user.language : null;

    if (pathname && preferredLocale && preferredLocale !== locale) {
      redirect({
        href: getPathnameWithoutLocale(pathname, locale),
        locale: preferredLocale,
      });
    }

    if (!user?.hasOnboarded && !pathname?.includes("/onboarding")) {
      redirect({ href: "/onboarding", locale: preferredLocale ?? locale });
    }
  }

  const messages = await getMessages();
  let cookiesBanner: React.ReactNode = null;
  let anonymousSessionTracker: React.ReactNode = null;

  // Si User est pas connecté, on regarde si il a vu cookiesBanner //
  // Si non on lui envoie le composant Banner avec le serv Action avec tout les infos dont ont a besoin //
  // Si oui on regarde si il a accepté Cookies Banner, si il a accepté on regarde si sa session est active //
  // Si elle est pas active User vient de se reconnecter //
  const c = await cookies();

  const hasConsent = c.get("cookie_consent");
  const language = h.get("accept-language");
  const refere = h.get("referer");

  if (!hasConsent) {
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
        // On envoie a un composant qui vas déclencher une requete API Pour mettre cookies session_active
        // CAR Impossible de mettre des cookies dans layout.tsx. Et aussi incrementer le nombre de visiste

        anonymousSessionTracker = <AnonymousSessionTracker />;
      }
    }
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {cookiesBanner}
      {anonymousSessionTracker}
      {children}
    </NextIntlClientProvider>
  );
}
