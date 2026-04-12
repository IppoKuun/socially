import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CircleUserRound, Settings } from "lucide-react";

import AppPageShell from "../_components/app-page-shell";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";

export default async function ProfilePage() {
  const t = await getTranslations("appShell.pages.profile");
  const tNav = await getTranslations("appShell.navigation");
  const session = await getSession();
  const userProfile = session
    ? await myPrisma.userProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          avatarUrl: true,
          bio: true,
          displayname: true,
          username: true,
        },
      })
    : null;

  const displayName = userProfile?.displayname ?? session?.user.name ?? "Socially member";
  const username = userProfile?.username ?? "pending-profile";
  const avatarUrl = userProfile?.avatarUrl ?? session?.user.image ?? null;

  return (
    <>
      <Link
        href="/settings"
        aria-label={tNav("settings")}
        className="fixed right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[rgba(18,21,28,0.88)] text-white/78 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.95)] backdrop-blur-xl transition hover:bg-white/[0.08] hover:text-white md:hidden"
      >
        <Settings className="h-5 w-5" />
      </Link>

      <AppPageShell title={t("title")} description={t("description")}>
        <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,26,33,0.98),rgba(20,22,29,0.98))] p-6 shadow-[0_28px_80px_-52px_rgba(0,0,0,0.98)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={88}
                height={88}
                className="h-22 w-22 rounded-[26px] object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-22 w-22 items-center justify-center rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(47,124,255,0.18))] text-white/75">
                <CircleUserRound className="h-9 w-9" />
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate font-manrope text-[1.75rem] leading-none tracking-[-0.04em] text-white">
                {displayName}
              </p>
              <p className="mt-2 truncate text-sm text-white/45">@{username}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
                {userProfile?.bio?.trim() || t("placeholder")}
              </p>
            </div>
          </div>
        </section>
      </AppPageShell>
    </>
  );
}
