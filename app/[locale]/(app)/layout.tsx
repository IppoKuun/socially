import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  DesktopAppSidebar,
  MobileBottomBar,
} from "./_components/navigation-shell";
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
      <DesktopAppSidebar
        user={navigationUser}
        unreadNotificationCount={unreadNotificationCount}
      />

      <SidebarInset className="app-shell-background">
        <div className="flex min-h-screen flex-1 flex-col pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:pb-0">
          {/* padding bas pour la bottom bar mobile sur 2 lignes + safe area iPhone / flex-1 : le conteneur grandit pour prendre l'espace vertical disponible */}

          <div className="mx-auto flex w-full lg:max-w-[1100px]   flex-1 flex-col px-4 py-6 sm:px-8 lg:px-6 lg:py-8">
            {children}
          </div>
        </div>

        <MobileBottomBar
          username={navigationUser.username}
          unreadNotificationCount={unreadNotificationCount}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
