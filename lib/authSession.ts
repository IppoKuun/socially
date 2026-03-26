import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// Fonction pour récupéré la session en SSR //
export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};
