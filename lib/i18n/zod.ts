import "server-only";

import i18next from "i18next";
import { getLocale } from "next-intl/server";
import type { ZodErrorMap } from "zod";

import { routing } from "@/i18n/routing";
import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";
import frMessages from "@/messages/fr.json";

// On prends tout les types de nos langues dans routing, et on en fait un Union Types (d'ou le number qui parcours les index) //
type AppLocale = (typeof routing.locales)[number];

// On créer un obj immuable qui est un dicsgtionnaire de nos traduction. On s'assure qu'il est bien typé comme AppLocale et que l'objets qu'il contiient est bien en string, unknown ? //
const appMessages = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
} as const satisfies Record<AppLocale, Record<string, unknown>>;

// Petit Helper pour vérifié que la local qu'on reçoit existe bien //
function resolveLocale(locale: string): AppLocale {
  if (routing.locales.includes(locale as AppLocale)) {
    return locale as AppLocale;
  }

  return routing.defaultLocale;
}

// Création de l'instance i18nnext pour zod //
async function createZodI18n(locale: AppLocale) {
  const instance = i18next.createInstance();

  await instance.init({
    lng: locale,
    fallbackLng: routing.defaultLocale,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: appMessages.en,
      es: appMessages.es,
      fr: appMessages.fr,
    },
  });

  return instance;
}

// Helper
// la fonction reçois une valeur inconnue, renvoie en obj string, unknonw //

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getCustomI18nConfig(param: unknown): {
  key: string;
  values: Record<string, unknown>;
} | null {
  if (typeof param === "string") {
    return { key: param, values: {} };
  }

  if (isRecord(param) && typeof param.key === "string") {
    return {
      key: param.key,
      values: isRecord(param.values) ? param.values : {},
    };
  }

  return null;
}

export async function getZodErrorMapForLocale(
  locale: string,
  namespace = "onboarding",
): Promise<ZodErrorMap> {
  const i18n = await createZodI18n(resolveLocale(locale));

  // zod-i18n-map 2.x depends on Zod 3 internals, so we keep a small local
  // adapter for the validation codes used by this project on Zod 4.
  return (issue) => {
    const t = i18n.t.bind(i18n);

    if (issue.code === "custom") {
      const customConfig = getCustomI18nConfig(
        issue.params && "i18n" in issue.params ? issue.params.i18n : undefined,
      );

      if (customConfig) {
        return {
          message: t(customConfig.key, {
            ns: namespace,
            ...customConfig.values,
          }),
        };
      }
    }

    switch (issue.code) {
      case "invalid_type":
        return {
          message: t("validation.required", { ns: namespace }),
        };
      case "too_small":
        if (issue.origin === "string") {
          return {
            message: t("validation.tooSmallString", {
              ns: namespace,
              minimum: issue.minimum,
            }),
          };
        }
        break;
      case "too_big":
        if (issue.origin === "string") {
          return {
            message: t("validation.tooBigString", {
              ns: namespace,
              maximum: issue.maximum,
            }),
          };
        }
        break;
      case "invalid_format":
        if (issue.format === "url") {
          return {
            message: t("validation.invalidUrl", { ns: namespace }),
          };
        }
        break;
      case "invalid_value":
        return {
          message: t("validation.invalidSelection", { ns: namespace }),
        };
      default:
        break;
    }

    return {
      message: t("validation.invalidInput", { ns: namespace }),
    };
  };
}

export async function getZodErrorMapForRequest(
  namespace = "onboarding",
): Promise<ZodErrorMap> {
  const locale = await getLocale();
  return getZodErrorMapForLocale(locale, namespace);
}
