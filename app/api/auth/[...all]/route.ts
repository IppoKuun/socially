import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
// Pour que tout les requetes POST et GET sois catch par Better Auth //
export const { POST, GET } = toNextJsHandler(auth);
