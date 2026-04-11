import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CircleUserRound } from "lucide-react";

import AppPageShell from "../_components/app-page-shell";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const t = await getTranslations("appShell.pages.profile");
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
  );
}
