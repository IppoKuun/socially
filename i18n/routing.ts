import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "fr", "es"],
  defaultLocale: "en",
  // Langue par défault n'as pas de prefixes //
  localePrefix: "always",

  // A FAIRE QUAND PROJETS FINI : TRADUIRE TOUTES LES URL AVEC PROPRIETER PATH //
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
