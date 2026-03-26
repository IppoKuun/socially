import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const authSession = async () => {
  await auth.api.getSession({
    headers: await headers(),
  });
};
