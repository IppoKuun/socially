import { getSession } from "@/lib/authSession";
import { redirect } from "@/i18n/routing";
import { myPrisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";

export default async function ProfilePage() {
  const locale = await getLocale();
  const session = await getSession();
  const userProfile = session;
  const username = await myPrisma.userProfile.findUnique({
    where: { userId: session?.user.id },
    select: {
      username: true,
    },
  });

  if (!userProfile) {
    redirect({
      href: "/login",
      locale,
    });
  }

  redirect({
    href: `/profile/${username?.username}`,
    locale,
  });
}
