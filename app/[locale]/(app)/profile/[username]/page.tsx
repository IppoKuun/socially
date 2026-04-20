import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CircleUserRound, Settings, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/routing";
import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function PublicProfilePage({
  params,
}: PageProps<"/[locale]/profile/[username]">) {
  const { locale, username } = await params;
  const t = await getTranslations("profilePublic");
  const tNav = await getTranslations("appShell.navigation");
  const session = await getSession();

  if (!session) {
    notFound();
  }

  const viewer = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!viewer) {
    notFound();
  }

  const profile = await myPrisma.userProfile.findFirst({
    where: {
      username,
      deletedAt: null,
      blocked: {
        none: {
          blockerId: viewer.id,
        },
      },
      blocker: {
        none: {
          blockedById: viewer.id,
        },
      },
    },
    select: {
      id: true,
      avatarUrl: true,
      bio: true,
      displayname: true,
      username: true,
      isAi: true,
      isPro: true,
      post: {
        where: {
          deletedAt: null,
        },
        orderBy: [{ createdAt: "desc" }],
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <>
      {viewer.id === profile.id && (
        <Link
          href="/settings"
          aria-label={tNav("settings")}
          className="fixed right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[rgba(18,21,28,0.88)] text-white/78 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.95)] backdrop-blur-xl transition hover:bg-white/[0.08] hover:text-white md:hidden"
        >
          <Settings className="h-5 w-5" />
        </Link>
      )}

      <AppPageShell
        title={profile.displayname}
        description={`@${profile.username}`}
        className="max-w-[880px]"
      >
        <section className="space-y-5 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,26,33,0.98),rgba(20,22,29,0.98))] p-6 shadow-[0_28px_80px_-52px_rgba(0,0,0,0.98)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayname}
                width={88}
                height={88}
                className="h-22 w-22 rounded-[26px] object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-22 w-22 items-center justify-center rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(47,124,255,0.18))] text-white/75">
                <CircleUserRound className="h-9 w-9" />
              </div>
            )}

            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-manrope text-[1.75rem] leading-none tracking-[-0.04em] text-white">
                  {profile.displayname}
                </p>
                {profile.isPro ? (
                  <Badge className="bg-amber-400/10 text-amber-200">
                    <Sparkles className="size-3" />
                    {t("proBadge")}
                  </Badge>
                ) : null}
                {profile.isAi ? (
                  <Badge
                    variant="outline"
                    className="border-sky-400/30 bg-sky-400/10 text-sky-200"
                  >
                    {t("aiBadge")}
                  </Badge>
                ) : null}
              </div>

              <p className="truncate text-sm text-white/45">
                @{profile.username}
              </p>
              <p className="max-w-2xl text-sm leading-7 text-white/58">
                {profile.bio?.trim() || t("bioFallback")}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-manrope text-[1.35rem] tracking-[-0.03em] text-white">
            {t("recentPostsTitle")}
          </h2>

          <div className="space-y-3">
            {profile.post.length > 0 ? (
              profile.post.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="block rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(14,17,24,0.98))] px-5 py-4 text-white transition hover:bg-white/[0.03]"
                >
                  <p className="font-manrope text-lg tracking-[-0.03em] text-white">
                    {post.title}
                  </p>
                  <p className="mt-2 text-sm text-white/45">
                    {new Intl.DateTimeFormat(locale, {
                      day: "numeric",
                      month: "short",
                    }).format(post.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(14,17,24,0.98))] px-5 py-5 text-sm leading-7 text-white/56">
                {t("recentPostsEmpty")}
              </div>
            )}
          </div>
        </section>
      </AppPageShell>
    </>
  );
}
