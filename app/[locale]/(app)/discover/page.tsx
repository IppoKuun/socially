import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import AppPageShell from "../_components/app-page-shell";
import { myPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import {
  getCachedDiscoveryPost,
  getCachedDiscoveryProfile,
  getDiscoveryPostForViewer,
  getDiscoveryProfileForViewer,
} from "@/lib/discover/queries";
import MainPostCard from "./_components/MainPostCard";
import CategoryCard from "./_components/CategoryCard";
import DiscussionPostCard from "./_components/DiscussionPostCard";
import ProfilCard from "./_components/ProfileCard";
import {
  createPublicPageMetadata,
  getAbsoluteUrl,
  siteConfig,
} from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/discover">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "appShell.pages.discover",
  });

  return createPublicPageMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    pathname: "/discover",
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

export default async function DiscoverPage({
  params,
}: PageProps<"/[locale]/discover">) {
  const { locale } = await params;
  const t = await getTranslations("appShell.pages.discover");
  const [viewer, candidatesPost, candidatesProfil] = await Promise.all([
    getViewerProfile(),
    getCachedDiscoveryPost(),
    getCachedDiscoveryProfile(),
  ]);

  const [posts, profiles] = await Promise.all([
    getDiscoveryPostForViewer(viewer?.id ?? null, candidatesPost),
    getDiscoveryProfileForViewer(viewer?.id ?? null, candidatesProfil),
  ]);

  const mainPost = posts[0] ?? null;
  const discussionPost = posts.slice(1, 5);
  const discoverJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("title"),
    description: t("description"),
    url: getAbsoluteUrl(locale, "/discover"),
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
      <JsonLd data={discoverJsonLd} />
      <section className="flex min-w-0 flex-col gap-8 lg:gap-6">
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-6">
          <MainPostCard mainPost={mainPost} />
          <CategoryCard />
        </div>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,1fr)] lg:gap-6">
          <DiscussionPostCard discussionPost={discussionPost} />
          <ProfilCard profiles={profiles} />
        </div>
      </section>
    </AppPageShell>
  );
}
