import { SidebarProvider } from "@/components/ui/sidebar";
import { AppNavigationShell } from "./_components/navigation-shell";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { RestoreAccountModal } from "@/app/components/RestoreAccountModal";
import { touchUserLastSeen } from "@/lib/user-activity";

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
          last_seen_at: true,
        },
      })
    : null;

  const isSoftDelete = userProfile?.deletedAt;

  let unreadNotificationCount = 0;

  if (userProfile) {
    const [notificationCount] = await Promise.all([
      myPrisma.notifications.count({
        where: {
          userId: userProfile.id,
          isRead: false,
          actor: { deletedAt: null },
        },
      }),
      isSoftDelete
        ? Promise.resolve()
        : touchUserLastSeen({
            profileId: userProfile.id,
            lastSeenAt: userProfile.last_seen_at,
          }),
    ]);

    unreadNotificationCount = notificationCount;
  }

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
