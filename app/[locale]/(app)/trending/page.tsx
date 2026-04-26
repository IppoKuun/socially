// IA: Next.js Data Cache
import { getTranslations } from "next-intl/server";
import { Flame, Heart, RefreshCw, Trophy } from "lucide-react";

import QueryProvider from "@/components/providers/query-provider";
import PostCard from "@/components/post/post-card";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import {
  getCachedTrendingPostCandidates,
  getTrendingFeedPostsForViewer,
} from "@/lib/trending/queries";
import AppPageShell from "../_components/app-page-shell";
import { revalidateTag } from "next/cache";

async function requireViewerProfile() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const profile = await myPrisma.userProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
}

export default async function TrendingPage() {
  const t = await getTranslations("appShell.pages.trending");
  const [viewer, candidates] = await Promise.all([
    requireViewerProfile(),
    getCachedTrendingPostCandidates(),
  ]);

  const posts = await getTrendingFeedPostsForViewer({
    candidates,
    viewerId: viewer.id,
  });

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      {posts.length === 0 ? (
        <section className="rounded-lg border border-dashed border-white/12 bg-white/[0.025] px-5 py-10 text-center">
          <Heart className="mx-auto size-8 text-white/30" />
          <h2 className="mt-4 font-manrope text-xl font-semibold text-white">
            {t("emptyTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
            {t("emptyDescription")}
          </p>
        </section>
      ) : (
        <QueryProvider>
          <ol className="grid gap-4">
            {posts.map((post, index) => (
              <li
                key={post.id}
                className="grid gap-3 sm:grid-cols-[4.5rem_minmax(0,1fr)]"
              >
                <div className="flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] font-manrope text-lg font-semibold text-white sm:sticky sm:top-6">
                  <span className="sr-only">
                    {t("rankLabel", { rank: index + 1 })}
                  </span>
                  <span aria-hidden="true">#{index + 1}</span>
                </div>

                <PostCard
                  post={post}
                  commentHref={`/post/${post.slug}#post-comment-compose`}
                />
              </li>
            ))}
          </ol>
        </QueryProvider>
      )}
    </AppPageShell>
  );
}
