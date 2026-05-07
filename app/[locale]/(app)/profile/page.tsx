import { getSession } from "@/lib/authSession";
import { redirect } from "@/i18n/routing";
import { myPrisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";

export default async function ProfilePage() {
  const locale = await getLocale();
  const session = await getSession();
  const userProfile = session;
  const username = await myPrisma.userProfile.findFirst({
    where: { userId: session?.user.id, deletedAt: null },
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

  const profileUsername = username?.username;

  if (!profileUsername) {
    redirect({
      href: "/settings/account",
      locale,
    });
  }

  redirect({
    href: `/profile/${profileUsername}`,
    locale,
  });
}
