import { noIndexMetadata } from "@/lib/seo";
import LoginPageClient from "./LoginPageClient";

export const metadata = noIndexMetadata;

export default async function LoginPage() {
  return <LoginPageClient />;
}
