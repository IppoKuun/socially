import { i18nClient } from "@better-auth/i18n/client";
import { createAuthClient } from "better-auth/react";

// Client qu'on vas utilisé dans les CSR //
export const { signIn, signUp, useSession } = createAuthClient({
  plugins: [i18nClient()],
});
