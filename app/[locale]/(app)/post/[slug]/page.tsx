import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { readPostComments, readPostDetail } from "@/app/actions/feed";
import JsonLd from "@/components/seo/json-ld";
import PostDetailClient from "@/components/post/post-detail-client";
import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import { feedQueryKeys } from "@/lib/feed/query-keys";
import { getSession } from "@/lib/authSession";
import { makeQueryClient } from "@/lib/query-client";
import {
  createPublicPageMetadata,
  getAbsoluteUrl,
  noIndexMetadata,
  truncateDescription,
} from "@/lib/seo";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const postDetail = await readPostDetail(slug);

  if (!postDetail?.post) {
    return noIndexMetadata;
  }

  const post = postDetail.post;
  const description = truncateDescription(post.content);

  return createPublicPageMetadata({
    title: post.title,
    description,
    locale,
    pathname: `/post/${post.slug}`,
    images: post.images,
    type: "article",
  });
}

export default async function PostPage({
  params,
}: PageProps<"/[locale]/post/[slug]">) {
  const { locale, slug } = await params;
  const t = await getTranslations("postDetail");
  const session = await getSession();
  const isAuthenticated = Boolean(session);
  const queryClient = makeQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: feedQueryKeys.postDetail(slug),
      queryFn: () => readPostDetail(slug),
    }),
    queryClient.prefetchQuery({
      queryKey: feedQueryKeys.postComments(slug, "recent"),
      queryFn: () => readPostComments({ slug, sort: "recent" }),
    }),
  ]);

  // Grosse Syntaxe juste pour dire qu'on prends ce qu'on a trouvé la requete TanSackQuery //
  const postDetail = queryClient.getQueryData<
    Awaited<ReturnType<typeof readPostDetail>>
  >(feedQueryKeys.postDetail(slug));

  if (!postDetail?.post) {
    notFound();
  }

  const post = postDetail.post;
  const postUrl = getAbsoluteUrl(locale, `/post/${post.slug}`);
  const authorUrl = getAbsoluteUrl(locale, `/profile/${post.author.username}`);
  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: post.content ?? post.title,
    image: post.images,
    url: postUrl,
    datePublished: post.createdAt,
    author: {
      "@type": "Person",
      name: post.author.displayName,
      alternateName: `@${post.author.username}`,
      url: authorUrl,
      image: post.author.avatarUrl ?? undefined,
    },

    // InteractionStatistic parle juse des interaction//
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.likeCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.commentCount,
      },
    ],
  };

  return (
    <AppPageShell
      title={postDetail.post.title}
      description={t("pageDescription")}
      className="max-w-[880px]"
    >
      <JsonLd data={postJsonLd} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PostDetailClient slug={slug} isAuthenticated={isAuthenticated} />
      </HydrationBoundary>
    </AppPageShell>
  );
}
