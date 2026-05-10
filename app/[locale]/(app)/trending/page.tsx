// IA: Next.js Data Cache
import { getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";
import type { Metadata } from "next";

import QueryProvider from "@/components/providers/query-provider";
import PostCard from "@/components/post/post-card";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import {
  getCachedTrendingPostCandidates,
  getTrendingFeedPostsForViewer,
} from "@/lib/trending/queries";
import AppPageShell from "../_components/app-page-shell";
import {
  createPublicPageMetadata,
  getAbsoluteUrl,
  siteConfig,
} from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/trending">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "appShell.pages.trending",
  });

  return createPublicPageMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    pathname: "/trending",
  });
}

async function getViewerProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const profile = await myPrisma.userProfile.findFirst({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    return null;
  }

  return profile;
}

export default async function TrendingPage({
  params,
}: PageProps<"/[locale]/trending">) {
  const { locale } = await params;
  const t = await getTranslations("appShell.pages.trending");
  const [viewer, candidates] = await Promise.all([
    getViewerProfile(),
    getCachedTrendingPostCandidates(),
  ]);

  const posts = await getTrendingFeedPostsForViewer({
    candidates,
    viewerId: viewer?.id,
  });
  const isAuthenticated = Boolean(viewer);
  const trendingJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("title"),
    description: t("description"),
    url: getAbsoluteUrl(locale, "/trending"),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: getAbsoluteUrl(locale, "/"),
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getAbsoluteUrl(locale, `/post/${post.slug}`),
        name: post.title,
      })),
    },
  };

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <JsonLd data={trendingJsonLd} />
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
                  isAuthenticated={isAuthenticated}
                />
              </li>
            ))}
          </ol>
        </QueryProvider>
      )}
    </AppPageShell>
  );
}
