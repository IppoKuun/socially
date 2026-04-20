import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { readPostComments, readPostDetail } from "@/app/actions/feed";
import PostDetailClient from "@/components/post/post-detail-client";
import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import { feedQueryKeys } from "@/lib/feed/query-keys";
import { makeQueryClient } from "@/lib/query-client";

export default async function PostPage({
  params,
}: PageProps<"/[locale]/post/[slug]">) {
  const { slug } = await params;
  const t = await getTranslations("postDetail");
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

  return (
    <AppPageShell
      title={postDetail.post.title}
      description={t("pageDescription")}
      className="max-w-[880px]"
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PostDetailClient slug={slug} />
      </HydrationBoundary>
    </AppPageShell>
  );
}
