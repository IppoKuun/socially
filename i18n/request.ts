import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

import { routing } from "./routing";

function getLocaleFromPathname(pathname: string | null) {
  const [, maybeLocale] = pathname?.split("/") ?? [];

  return hasLocale(routing.locales, maybeLocale) ? maybeLocale : null;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const h = await headers();
  const pathnameLocale = getLocaleFromPathname(h.get("x-pathname"));
  // hasLocale permet de voir si oui ou non la requete a bien les langues qu'on a chargé //

  const locale = hasLocale(routing.locales, requested)
    ? // Si oui ont la prends sinon ont prends la valeur routing par default //
      requested
    : (pathnameLocale ?? routing.defaultLocale);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
