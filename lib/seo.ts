import type { Metadata } from "next";

import { routing } from "@/i18n/routing";

export const siteConfig = {
  name: "Socially",
  description:
    "Discover public conversations, profiles and trending posts on Socially.",
};

export type AppLocale = (typeof routing.locales)[number];

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return (configuredUrl ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getLocalizedPath(locale: string, pathname: string) {
  const normalizedPathname = pathname.startsWith("/")
    ? // Cette partie est essentiel pour l'URL car sinon ont peut se retrouvé avec
      // des frprofile/jhon au lieu de fr/profile/jhon //
      pathname
    : `/${pathname}`;

  return `/${locale}${normalizedPathname === "/" ? "" : normalizedPathname}`;
}

export function getAbsoluteUrl(locale: string, pathname: string) {
  return `${getSiteUrl()}${getLocalizedPath(locale, pathname)}`;
}

export function getLanguageAlternates(pathname: string) {
  const entries = routing.locales.map((locale) => [
    locale,
    getAbsoluteUrl(locale, pathname),
  ]);

  return {
    // Création d'un objets avec local + lien pour le SEO international //

    ...Object.fromEntries(entries),
    "x-default": getAbsoluteUrl(routing.defaultLocale, pathname),
  };
}

// Des objets pour définir les règles pour google //
export const indexRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large", // Robot google peut afficher en grands les images //
    "max-snippet": -1, //Snippet veut dire extrait d'un texte, -1 veut dire aucune limite //
    "max-video-preview": -1, // mm logique pour les vidéo, meme si pas présent pour v1//
  },
} satisfies Metadata["robots"];

export const noIndexRobots = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} satisfies Metadata["robots"];

export const noIndexMetadata = {
  robots: noIndexRobots,
} satisfies Metadata;

export function truncateDescription(value: string | null | undefined) {
  const fallback = siteConfig.description;
  const normalized = value?.replace(/\s+/g, " ").trim() || fallback;

  return normalized.length > 160
    ? `${normalized.slice(0, 157).trim()}...`
    : normalized;
}

type PublicPageMetadataInput = {
  title: string;
  description: string;
  locale: string;
  pathname: string;
  images?: string[];
  type?: "website" | "article" | "profile";
};

export function createPublicPageMetadata({
  title,
  description,
  locale,
  pathname,
  images,
  type = "website",
}: PublicPageMetadataInput): Metadata {
  const url = getAbsoluteUrl(locale, pathname);
  const alternates = getLanguageAlternates(pathname);

  return {
    title,
    description,
    robots: indexRobots,
    alternates: {
      canonical: url,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale,
      type,
      images,
    },
    twitter: {
      card: images?.length ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
  };
}
