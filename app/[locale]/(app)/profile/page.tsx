import { getSession } from "@/lib/authSession";
import { redirect } from "@/i18n/routing";
import { myPrisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";

export default async function ProfilePage() {
  const locale = await getLocale();
  const session = await getSession();
  const userProfile = session
    ? await myPrisma.userProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          username: true,
        },
      })
    : null;

  redirect({
    href: `/profile/${userProfile?.username ?? "pending-profile"}`,
    locale,
  });
}
