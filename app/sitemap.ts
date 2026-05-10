import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import {
  DISCOVER_CATEGORIES,
  getCategorySlug,
} from "@/lib/discover/categories";
import { LEGAL_DOCUMENT_SLUGS } from "@/lib/legal/documents";
import { myPrisma } from "@/lib/prisma";
import { getAbsoluteUrl, getLanguageAlternates } from "@/lib/seo";

export const revalidate = 3600;

function createLocalizedEntries(input: {
  pathname: string;
  lastModified?: Date;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}) {
  return routing.locales.map((locale) => ({
    url: getAbsoluteUrl(locale, input.pathname),
    lastModified: input.lastModified,
    changeFrequency: input.changeFrequency,
    priority: input.priority,
    alternates: {
      languages: getLanguageAlternates(input.pathname),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, profiles] = await Promise.all([
    myPrisma.post.findMany({
      where: {
        deletedAt: null,
        moderationStatus: { not: "UNSAFE" },
        author: {
          deletedAt: null,
          username: { not: null },
        },
      },
      select: {
        slug: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5000,
    }),
    myPrisma.userProfile.findMany({
      where: {
        deletedAt: null,
        username: { not: null },
      },
      select: {
        username: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5000,
    }),
  ]);

  const staticEntries = [
    ...createLocalizedEntries({
      pathname: "/legal",
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    ...LEGAL_DOCUMENT_SLUGS.flatMap((document) =>
      createLocalizedEntries({
        pathname: `/legal/${document}`,
        changeFrequency: "monthly",
        priority: 0.5,
      }),
    ),
    ...createLocalizedEntries({
      pathname: "/discover",
      changeFrequency: "daily",
      priority: 0.8,
    }),
    ...createLocalizedEntries({
      pathname: "/trending",
      changeFrequency: "hourly",
      priority: 0.8,
    }),
    ...DISCOVER_CATEGORIES.flatMap((category) =>
      createLocalizedEntries({
        pathname: `/discover/${getCategorySlug(category)}`,
        changeFrequency: "daily",
        priority: 0.7,
      }),
    ),
  ];

  const postEntries = posts.flatMap((post) =>
    createLocalizedEntries({
      pathname: `/post/${post.slug}`,
      lastModified: post.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  const profileEntries = profiles.flatMap((profile) =>
    createLocalizedEntries({
      pathname: `/profile/${profile.username}`,
      lastModified: profile.createdAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );

  return [...staticEntries, ...postEntries, ...profileEntries];
}
