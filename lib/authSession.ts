import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// Fonction pour récupéré la session en SSR //
export const authSession = async () => {
  await auth.api.getSession({
    headers: await headers(),
  });
};
