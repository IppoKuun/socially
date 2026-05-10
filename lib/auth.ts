import { betterAuth } from "better-auth";
import { getOAuthState } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { myPrisma } from "./prisma";
import { i18n } from "@better-auth/i18n";
import { authTranslations } from "./auth-i18n";
import { sendEmail } from "./mail/sendMaill";

type TrackingData = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer_domain?: string | null;
  language?: string | null;
  hasAcceptedCookies?: boolean;
  visitCount?: number | null;
  createdAt?: string | Date | null;
};

// Fonction pour récupéré de l'Instance better auth //
const createAuth = () =>
  betterAuth({
    appName: "socially",
    baseURL: process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000",
    database: prismaAdapter(myPrisma, { provider: "postgresql" }),
    // AVEC RESEND AJOUTEZ EMAIL VERIFICATIONS //
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      // Déconnecte toutes les sessions après changement MDP

      revokeSessionsOnPasswordReset: true,

      sendResetPassword: async ({ user, url }) => {
        const result = await sendEmail({
          to: user.email,
          subject: "Reset your password",
          html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h1>Password reset</h1>

            <p>
              You requested a password reset.
            </p>

            <p>
              Click the button below to choose a new password:
            </p>

            <a
              href="${url}"
              style="
                display: inline-block;
                margin-top: 16px;
                padding: 12px 20px;
                background: black;
                color: white;
                text-decoration: none;
                border-radius: 999px;
              "
            >
              Reset my password
            </a>

            <p style="margin-top: 24px;">
              This link expires in 1 hour.
            </p>

            <p>
              If you did not request this, you can ignore this email.
            </p>
          </div>
        `,
          text: `
Password reset

Open this link to choose a new password:

${url}

This link expires in 1 hour.
        `,
        });

        if (!result.ok) {
          console.error(
            "Impossible d'envoyer l'email de reset password",
            result.error,
          );

          throw new Error("RESET_PASSWORD_EMAIL_FAILED");
        }
      },

      onPasswordReset: async ({ user }) => {
        console.log(`Password reset successful for user ${user.id}`);
      },
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

        // Cette fonction permet de prendre les trackingDatas qu'on a passé lors du signin.social pour créer l'utilisateur avec les bon champs//
        mapProfileToUser: async () => {
          const oauthState = await getOAuthState();

          return {
            accountType: "public",

            trackingData: oauthState?.trackingData as TrackingData | undefined,
          };
        },
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
          fieldName: "AccountType",
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
          after: async (user) => {
            // TS N'arrive pas a reconnaitres les extra fields dans ce Hooks, ont doit donc l'aidez//

            // ICI Ont type les fields supplémentaires //
            type userExtraFieldsTyped = {
              accountType: "public" | "backoffice";
              trackingData?: TrackingData | null;
            };

            // ET la ont fusionne le type de User avec les types des fields supplémentaires //
            const typedUser = user as typeof user & userExtraFieldsTyped;
            // typedUser est donc User mais avec tout les champs bien typé car TS ne pouvais pas le faire //
            const anonymousCreatedAt = typedUser.trackingData?.createdAt
              ? new Date(typedUser.trackingData.createdAt)
              : undefined;

            if (typedUser.accountType === "public") {
              await myPrisma.userProfile.create({
                data: {
                  userId: user.id,

                  displayname: user.name,
                  avatarUrl: user.image,
                  hasAcceptedCookies:
                    typedUser?.trackingData?.hasAcceptedCookies,
                  visitCountBeforeLogin: typedUser?.trackingData?.visitCount,

                  language: typedUser?.trackingData?.language ?? "unknown",
                  utm_source: typedUser?.trackingData?.utm_source,
                  utm_campaign: typedUser?.trackingData?.utm_campaign,
                  utm_medium: typedUser?.trackingData?.utm_medium,
                  referrer_domain: typedUser?.trackingData?.referrer_domain,
                  anonymeCreatedAt: anonymousCreatedAt,
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
        defaultLocale: "en",
        detection: ["header", "cookie"],
        localeCookie: "NEXT_LOCALE", // next_locale est un cookies de next-intl pour la langue"
      }),
      nextCookies(),
    ],
  });
export type User = typeof auth.$Infer.Session.user;
type AuthInstance = ReturnType<typeof createAuth>;

// SINGLETON POUR BETTER AUTH //
const globalForAuth = globalThis as unknown as {
  auth?: AuthInstance;
};

export const auth = globalForAuth.auth ?? createAuth();

if (process.env.NODE_ENV !== "production") {
  globalForAuth.auth = auth;
}
