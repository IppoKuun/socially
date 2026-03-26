import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { myPrisma } from "./prisma";

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
    },
    plugins: [nextCookies()],
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
