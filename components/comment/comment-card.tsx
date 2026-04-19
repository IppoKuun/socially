"use client";

import { useOptimistic, useState, useTransition } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { CircleUserRound, Heart, LoaderCircle, MessageSquare } from "lucide-react";

import { commentLike } from "@/app/actions/like";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { FeedComment } from "@/lib/feed/shared";
import { cn } from "@/lib/utils";

type CommentCardProps = {
  comment: FeedComment;
  variant?: "default" | "context";
  threadHref?: string;
  replyHref: string;
  highlighted?: boolean;
};

function CommentAvatar({
  avatarUrl,
  displayName,
  compact,
}: {
  avatarUrl: string | null;
  displayName: string;
  compact: boolean;
}) {
  const className = compact ? "h-9 w-9 rounded-2xl" : "h-10 w-10 rounded-2xl";

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName}
        width={40}
        height={40}
        className={cn(className, "object-cover ring-1 ring-white/10")}
      />
    );
  }

  return (
    <span
      className={cn(
        className,
        "flex items-center justify-center border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(47,124,255,0.18))] text-white/72",
      )}
      aria-hidden="true"
    >
      <CircleUserRound className={compact ? "size-4" : "size-5"} />
    </span>
  );
}

export default function CommentCard({
  comment,
  variant = "default",
  threadHref,
  replyHref,
  highlighted = false,
}: CommentCardProps) {
  const t = useTranslations("comments.card");
  const formatter = useFormatter();
  const queryClient = useQueryClient();
  const compact = variant === "context";
  const [isLikePending, startLikeTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState("");
  const [optimisticLikeState, updateOptimisticLikeState] = useOptimistic(
    {
      hasLiked: comment.viewer.hasLiked,
      likeCount: comment.likeCount,
    },
    (currentState, nextHasLiked: boolean) => ({
      hasLiked: nextHasLiked,
      likeCount: Math.max(
        0,
        currentState.likeCount + (nextHasLiked ? 1 : -1),
      ),
    }),
  );

  function handleLike() {
    setStatusMessage("");

    const nextHasLiked = !optimisticLikeState.hasLiked;
    updateOptimisticLikeState(nextHasLiked);

    startLikeTransition(async () => {
      const result = await commentLike(comment.id);

      if (!result.ok) {
        setStatusMessage(result.userMsg || t("likeError"));
      }

      await queryClient.invalidateQueries({
        queryKey: ["post", comment.postSlug],
      });
    });
  }

  return (
    <article
      className={cn(
        "rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(14,17,24,0.98))] shadow-[0_22px_70px_-48px_rgba(0,0,0,0.96)]",
        compact ? "px-4 py-4" : "px-5 py-5",
        highlighted && "border-primary/30 shadow-[0_28px_80px_-52px_rgba(47,124,255,0.28)]",
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Link
            href={`/profile/${comment.author.username}`}
            className="shrink-0 transition hover:opacity-90"
          >
            <CommentAvatar
              avatarUrl={comment.author.avatarUrl}
              displayName={comment.author.displayName}
              compact={compact}
            />
          </Link>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/42">
              <Link
                href={`/profile/${comment.author.username}`}
                className="truncate text-sm font-semibold text-white transition hover:opacity-90"
              >
                {comment.author.displayName}
              </Link>
              <span>@{comment.author.username}</span>
              <span aria-hidden="true">•</span>
              <span>
                {formatter.dateTime(new Date(comment.createdAt), {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {threadHref ? (
              <Link href={threadHref} className="block rounded-2xl transition hover:bg-white/[0.03]">
                <p
                  className={cn(
                    "whitespace-pre-wrap text-white/78",
                    compact ? "text-sm leading-6" : "text-[0.95rem] leading-7",
                  )}
                >
                  {comment.content}
                </p>
              </Link>
            ) : (
              <p
                className={cn(
                  "whitespace-pre-wrap text-white/78",
                  compact ? "text-sm leading-6" : "text-[0.95rem] leading-7",
                )}
              >
                {comment.content}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={optimisticLikeState.hasLiked ? "secondary" : "ghost"}
                size={compact ? "sm" : "default"}
                className={cn(
                  "rounded-full border border-white/10 bg-white/[0.03] text-white/82 hover:bg-white/[0.08]",
                  optimisticLikeState.hasLiked && "text-[#ff7aa6]",
                )}
                onClick={handleLike}
                disabled={isLikePending}
              >
                {isLikePending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Heart
                    className={cn(
                      "size-4",
                      optimisticLikeState.hasLiked && "fill-current",
                    )}
                  />
                )}
                <span>{optimisticLikeState.likeCount}</span>
              </Button>

              <Button
                asChild
                variant="ghost"
                size={compact ? "sm" : "default"}
                className="rounded-full border border-white/10 bg-white/[0.03] text-white/82 hover:bg-white/[0.08]"
              >
                <Link href={replyHref}>
                  <MessageSquare className="size-4" />
                  <span>
                    {comment.replyCount > 0
                      ? t("replyCount", { count: comment.replyCount })
                      : t("reply")}
                  </span>
                </Link>
              </Button>
            </div>

            {statusMessage ? (
              <p className="text-sm text-white/52" aria-live="polite">
                {statusMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
