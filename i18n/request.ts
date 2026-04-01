import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // hasLocale permet de voir si oui ou non la requete a bien les langues qu'on a chargé //

  const locale = hasLocale(routing.locales, requested)
    ? // Si oui ont la prends sinon ont prends la valeur routing par default //
      requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
