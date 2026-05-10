"use client";
//Components/post/post-detail-clients.tsx//
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { readPostComments, readPostDetail } from "@/app/actions/feed";
import CommentCard from "@/components/comment/comment-card";
import CommentComposeForm from "@/components/comment/comment-compose-form";
import PostCard from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { feedQueryKeys } from "@/lib/feed/query-keys";
import type { CommentSort } from "@/lib/feed/shared";

type PostDetailClientProps = {
  slug: string;
  isAuthenticated: boolean;
};

export default function PostDetailClient({
  slug,
  isAuthenticated,
}: PostDetailClientProps) {
  const t = useTranslations("postDetail");
  const router = useRouter();
  const [sort, setSort] = useState<CommentSort>("recent");

  const postDetailQuery = useQuery({
    queryKey: feedQueryKeys.postDetail(slug),
    queryFn: () => readPostDetail(slug),
  });

  const commentsQuery = useQuery({
    queryKey: feedQueryKeys.postComments(slug, sort),
    queryFn: () => readPostComments({ slug, sort }),
  });

  const post = postDetailQuery.data?.post;
  const comments = commentsQuery.data?.comments ?? [];
  const isPostDeleted = Boolean(post?.deletedAt);

  if (!post) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PostCard
        post={post}
        variant="detail"
        commentHref="#post-comment-compose"
        isAuthenticated={isAuthenticated}
        onDeleteSuccess={() => router.push("/feed")}
      />

      {isPostDeleted ? null : (
        <CommentComposeForm
          postId={post.id}
          postSlug={post.slug}
          mode="toPost"
          anchorId="post-comment-compose"
          isAuthenticated={isAuthenticated}
        />
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-manrope text-[1.45rem] tracking-[-0.03em] text-white">
              {t("commentsTitle")}
            </h2>
            <p className="text-sm text-white/48">{t("commentsHint")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={sort === "recent" ? "secondary" : "ghost"}
              className="rounded-full border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
              onClick={() => setSort("recent")}
            >
              {t("sortRecent")}
            </Button>
            <Button
              type="button"
              variant={sort === "popular" ? "secondary" : "ghost"}
              className="rounded-full border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
              onClick={() => setSort("popular")}
            >
              {t("sortPopular")}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                isAuthenticated={isAuthenticated}
                replyHref={`/post/${slug}/c/${comment.id}#comment-reply-compose`}
                threadHref={`/post/${slug}/c/${comment.id}#comment-reply-compose`}
              />
            ))
          ) : (
            <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(14,17,24,0.98))] px-5 py-6 text-sm leading-7 text-white/56">
              {t("commentsEmpty")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
