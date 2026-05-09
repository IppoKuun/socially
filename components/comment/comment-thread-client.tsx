"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { readCommentThread } from "@/app/actions/feed";
import CommentCard from "@/components/comment/comment-card";
import CommentComposeForm from "@/components/comment/comment-compose-form";
import PostCard from "@/components/post/post-card";
import { feedQueryKeys } from "@/lib/feed/query-keys";

type CommentThreadClientProps = {
  slug: string;
  commentId: string;
  isAuthenticated: boolean;
};

export default function CommentThreadClient({
  slug,
  commentId,
  isAuthenticated,
}: CommentThreadClientProps) {
  const t = useTranslations("commentThread");
  const threadQuery = useQuery({
    queryKey: feedQueryKeys.commentThread(slug, commentId),
    queryFn: () => readCommentThread({ slug, commentId }),
  });

  const thread = threadQuery.data;
  const isPostDeleted = Boolean(thread?.post.deletedAt);

  if (!thread) {
    return null;
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/34">
          {t("postLabel")}
        </p>
        <PostCard
          post={thread.post}
          variant="context"
          commentHref={`/post/${slug}#post-comment-compose`}
          isAuthenticated={isAuthenticated}
        />
      </section>

      {thread.parentComment ? (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/34">
            {t("parentLabel")}
          </p>
          <CommentCard
            comment={thread.parentComment}
            variant="context"
            isAuthenticated={isAuthenticated}
            replyHref={`/post/${slug}/c/${thread.parentComment.id}#comment-reply-compose`}
            threadHref={`/post/${slug}/c/${thread.parentComment.id}#comment-reply-compose`}
          />
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/34">
            {t("currentLabel")}
          </p>
          <CommentCard
            comment={thread.comment}
            highlighted
            isAuthenticated={isAuthenticated}
            replyHref="#comment-reply-compose"
          />
        </div>

        {isPostDeleted ? null : (
          <CommentComposeForm
            postId={thread.post.id}
            postSlug={thread.post.slug}
            mode="toComment"
            responseToCommentId={thread.comment.id}
            anchorId="comment-reply-compose"
            isAuthenticated={isAuthenticated}
          />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-manrope text-[1.35rem] tracking-[-0.03em] text-white">
            {t("repliesTitle")}
          </h2>
          <p className="text-sm text-white/48">{t("repliesHint")}</p>
        </div>

        <div className="space-y-3">
          {thread.replies.length > 0 ? (
            thread.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                variant="context"
                isAuthenticated={isAuthenticated}
                replyHref={`/post/${slug}/c/${reply.id}#comment-reply-compose`}
                threadHref={`/post/${slug}/c/${reply.id}#comment-reply-compose`}
              />
            ))
          ) : (
            <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(14,17,24,0.98))] px-5 py-6 text-sm leading-7 text-white/56">
              {t("repliesEmpty")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
