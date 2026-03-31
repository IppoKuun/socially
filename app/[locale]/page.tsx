import { getSession } from "@/lib/authSession";
import { redirect } from "next/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  } else {
    redirect(`/${locale}/feed`);
  }
  return <div className=""></div>;
}
