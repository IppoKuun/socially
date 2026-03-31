import { getSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import LoginPageClient from "./LoginPageClient";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/feed");
  }

  return <LoginPageClient />;
}
