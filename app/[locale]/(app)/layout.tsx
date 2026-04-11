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
      avatarUrl: true,
      displayname: true,
      username: true,
    },
  });

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
      <DesktopAppSidebar user={navigationUser} />

      <SidebarInset className="app-shell-background">
        <div className="flex min-h-screen flex-1 flex-col pb-22 md:pb-0">
          {/* pb-22 padding pour bottom bar / flex-1 : éléments prendre littéralement tout la place restante laisser par sidebar */}

          <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            {children}
          </div>
        </div>

        <MobileBottomBar />
      </SidebarInset>
    </SidebarProvider>
  );
}
