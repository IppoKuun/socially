import { getSession } from "@/lib/authSession";
import { redirect } from "@/i18n/routing";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) {
    redirect({ href: "/login", locale });
  } else {
    redirect({ href: "/feed", locale });
  }
  return <div className=""></div>;
}
