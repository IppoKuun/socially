import { SidebarProvider } from "@/components/ui/sidebar";
import { AppNavigationShell } from "./_components/navigation-shell";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { RestoreAccountModal } from "@/app/components/RestoreAccountModal";
import { touchUserLastSeen } from "@/lib/user-activity";
import { redirect, routing } from "@/i18n/routing";
import { headers } from "next/headers";

type AppLocale = (typeof routing.locales)[number];

function isAppLocale(value: string | null | undefined): value is AppLocale {
  return routing.locales.includes(value as AppLocale);
}

function getPathnameWithoutLocale(pathname: string, locale: string) {
  const localePrefix = `/${locale}`;

  if (pathname === localePrefix) {
    return "/";
  }

  if (pathname.startsWith(`${localePrefix}/`)) {
    return pathname.slice(localePrefix.length);
  }

  return pathname;
}

export default async function AuthenticatedAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = await headers();
  const pathname = h.get("x-pathname");
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
          hasOnboarded: true,
          language: true,
        },
      })
    : null;

  const preferredLocale = isAppLocale(userProfile?.language)
    ? userProfile.language
    : null;

  if (pathname && preferredLocale && preferredLocale !== locale) {
    redirect({
      href: getPathnameWithoutLocale(pathname, locale),
      locale: preferredLocale,
    });
  }

  if (session && !userProfile?.hasOnboarded) {
    redirect({ href: "/onboarding", locale: preferredLocale ?? locale });
  }

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
