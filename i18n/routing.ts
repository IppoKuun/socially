import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "fr", "es"],
  defaultLocale: "en",
  localePrefix: "always",
});

// On exporte les versions localisées des fonctions de navigation
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
