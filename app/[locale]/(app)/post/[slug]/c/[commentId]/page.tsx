import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { readCommentThread } from "@/app/actions/feed";
import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import CommentThreadClient from "@/components/comment/comment-thread-client";
import { feedQueryKeys } from "@/lib/feed/query-keys";
import { makeQueryClient } from "@/lib/query-client";

export default async function CommentThreadPage({
  params,
}: PageProps<"/[locale]/post/[slug]/c/[commentId]">) {
  const { commentId, slug } = await params;
  const t = await getTranslations("commentThread");
  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: feedQueryKeys.commentThread(slug, commentId),
    queryFn: () => readCommentThread({ slug, commentId }),
  });

  const thread = queryClient.getQueryData<Awaited<ReturnType<typeof readCommentThread>>>(
    feedQueryKeys.commentThread(slug, commentId),
  );

  if (!thread) {
    notFound();
  }

  return (
    <AppPageShell
      title={t("pageTitle")}
      description={t("pageDescription")}
      className="max-w-[880px]"
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CommentThreadClient slug={slug} commentId={commentId} />
      </HydrationBoundary>
    </AppPageShell>
  );
}
