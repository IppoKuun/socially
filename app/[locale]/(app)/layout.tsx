import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppNavigationShell } from "./_components/navigation-shell";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const session = await getSession();

  if (!session) {
    redirect({ href: "/login", locale });
  }

  const currentSession = session!;

  const userProfile = await myPrisma.userProfile.findUnique({
    where: { userId: currentSession.user.id },
    select: {
      id: true,
      avatarUrl: true,
      displayname: true,
      username: true,
    },
  });

  const unreadNotificationCount = userProfile
    ? await myPrisma.notifications.count({
        where: {
          userId: userProfile.id,
          isRead: false,
        },
      })
    : 0;

  const navigationUser = {
    id: userProfile?.id ?? null,
    avatarUrl: userProfile?.avatarUrl ?? currentSession.user.image ?? null,
    displayName:
      userProfile?.displayname ?? currentSession.user.name ?? "Socially member",
    username: userProfile?.username ?? "pending-profile",
  };

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
      className="bg-[#050608] text-white"
    >
      <AppNavigationShell
        user={navigationUser}
        initialUnreadNotificationCount={unreadNotificationCount}
        notificationProfileId={navigationUser.id}
      >
        {children}
      </AppNavigationShell>
    </SidebarProvider>
  );
}
