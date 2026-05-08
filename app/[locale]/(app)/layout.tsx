import { SidebarProvider } from "@/components/ui/sidebar";
import { AppNavigationShell } from "./_components/navigation-shell";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { RestoreAccountModal } from "@/app/components/RestoreAccountModal";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  const userProfile = session
    ? await myPrisma.userProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          avatarUrl: true,
          displayname: true,
          username: true,
          deletedAt: true,
        },
      })
    : null;

  const isSoftDelete = userProfile?.deletedAt;

  const unreadNotificationCount = userProfile
    ? await myPrisma.notifications.count({
        where: {
          userId: userProfile.id,
          isRead: false,
          actor: { deletedAt: null },
        },
      })
    : 0;

  const navigationUser = {
    id: userProfile?.id ?? null,
    avatarUrl: userProfile?.avatarUrl ?? session?.user.image ?? null,
    displayName:
      userProfile?.displayname ?? session?.user.name ?? "Socially visitor",
    username: userProfile?.username ?? null,
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
        {isSoftDelete && <RestoreAccountModal />}
      </AppNavigationShell>
    </SidebarProvider>
  );
}
