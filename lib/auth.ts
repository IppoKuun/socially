import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { myPrisma } from "./prisma";
import { i18n } from "@better-auth/i18n";
import { authTranslations } from "./auth-i18n";
// Fonction pour récupéré de l'Instance better auth //
const createAuth = () =>
  betterAuth({
    appName: "socially",
    baseURL: process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000",
    database: prismaAdapter(myPrisma, { provider: "postgresql" }),
    // AVEC RESEND AJOUTEZ EMAIL VERIFICATIONS //
    emailAndPassword: { enabled: true },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID!,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        tenantId: process.env.MICROSOFT_TENANT_ID!,
      },
      // ICI ONT RAJOUEZ UN CHAMPS A USER DANS BETTER AUTH POUR SAVOIR SI USER DEVRAS ETRE CREER DANS BACKOFFICE OU PUBLIC //
    },
    user: {
      additionalFields: {
        accountType: {
          type: ["public", "backoffice"],
          required: true,
          input: true,
        },
        trackingData: {
          type: "json",
          required: false,
          input: true,
        },
      },
    },
    rateLimit: {
      window: 60 * 60,
      max: 5,
    },
    // Hooks avant qu'un user sois créer, User sera placé sois dans StaffProfil
    // sois dans User Profile selon le account type affecté lors de le création
    //  de son compte. //
    databaseHooks: {
      user: {
        create: {
          // The app profile must be created after the auth user exists so we can reuse its id.
          after: async (user) => {
            // TS N'arrive pas a reconnaitres les extra fields dans ce Hooks, ont doit donc l'aidez//

            // Ont type les datas Tracké //
            type TrackingData = {
              utm_source?: string | null;
              utm_medium?: string | null;
              utm_campaign?: string | null;
              referrer_domain?: string | null;
              language?: string | undefined;
              hasAcceptedCookies?: boolean;
              visitCount?: number | null;
              createdAt?: string | null;
            };

            // ICI Ont type les fields supplémentaires //
            type userExtraFieldsTyped = {
              accountType: "public" | "backoffice";
              trackingData?: TrackingData | null;
            };

            // ET la ont fusionne le type de User avec les types des fields supplémentaires //
            const typedUser = user as typeof user & userExtraFieldsTyped;
            // typedUser est donc User mais avec tout les champs bien typé car TS ne pouvais pas le faire //

            if (typedUser.accountType === "public") {
              await myPrisma.userProfile.create({
                data: {
                  userId: user.id,
                  displayName: user.name,
                  avatarUrl: user.image,
                  hasAcceptedCookies:
                    typedUser?.trackingData?.hasAcceptedCookies,
                  visitCountBeforeLogin: typedUser?.trackingData?.visitCount,
                  language: typedUser?.trackingData?.language ?? "unknonw",
                  utm_source: typedUser?.trackingData?.utm_source,
                  utm_campaign: typedUser?.trackingData?.utm_medium,
                  utm_medium: typedUser?.trackingData?.utm_campaign,
                  referrer_domain: typedUser?.trackingData?.referrer_domain,
                  anonymeCreatedAt: typedUser?.trackingData?.createdAt,
                },
              });
            }
            // Il faut mettre une jointure avec la table User de better auth //
            if (typedUser.accountType === "backoffice") {
              await myPrisma.staffProfile.create({
                data: { displayName: user.name },
              });
            }
          },
        },
      },
    },
    plugins: [
      i18n({
        translations: authTranslations,
        defaultLocale: "fr",
        detection: ["header", "cookie"],
        localeCookie: "NEXT_LOCALE",
      }),
      nextCookies(),
    ],
  });

type AuthInstance = ReturnType<typeof createAuth>;

// SINGLETON POUR BETTER AUTH //
const globalForAuth = globalThis as unknown as {
  auth?: AuthInstance;
};

export const auth = globalForAuth.auth ?? createAuth();

if (process.env.NODE_ENV !== "production") {
  globalForAuth.auth = auth;
}
