"use client";
//Components/post/post/card//
import { type KeyboardEvent, type MouseEvent, useState } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Bot, CircleUserRound, Sparkles, TriangleAlert } from "lucide-react";
import { useRouter } from "@/i18n/routing";

import PostActions from "@/components/post/post-actions";
import PostImageDialog from "@/components/post/post-image-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/routing";
import type { FeedPost } from "@/lib/feed/shared";
import { cn } from "@/lib/utils";

type PostCardVariant = "feed" | "detail" | "context" | "profile";

type PostCardProps = {
  post: FeedPost;
  variant?: PostCardVariant;
  commentHref: string;
  isAuthenticated: boolean;
  className?: string;
  onDeleteSuccess?: (postId: string) => void;
};

function AuthorAvatar({
  avatarUrl,
  displayName,
  compact,
}: {
  avatarUrl: string | null;
  displayName: string;
  compact: boolean;
}) {
  const avatarSizeClass = compact
    ? "h-10 w-10 rounded-2xl"
    : "h-12 w-12 rounded-[18px]";

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName}
        width={48}
        height={48}
        className={cn(
          avatarSizeClass,
          "shrink-0 object-cover ring-1 ring-white/10",
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        avatarSizeClass,
        "flex shrink-0 items-center justify-center border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(47,124,255,0.18))] text-white/74",
      )}
      aria-hidden="true"
    >
      <CircleUserRound className={compact ? "size-4" : "size-5"} />
    </span>
  );
}

export default function PostCard({
  post,
  variant = "feed",
  commentHref,
  isAuthenticated,
  className,
  onDeleteSuccess,
}: PostCardProps) {
  const t = useTranslations("feed.postCard");
  const formatter = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const [openImageIndex, setOpenImageIndex] = useState<number | null>(null);
  const router = useRouter();

  const compact = variant === "context";
  const isProfile = variant === "profile";
  const isDetail = variant === "detail";
  const isNavigable = !isDetail;
  const postHref = `/post/${post.slug}`;
  const postContent = post.content ?? "";
  const shouldShowExpand = isDetail && postContent.length > 440;
  const contentClassName = isDetail
    ? expanded
      ? "whitespace-pre-wrap text-[0.98rem] leading-8 text-white/78"
      : "line-clamp-[10] whitespace-pre-wrap text-[0.98rem] leading-8 text-white/78"
    : compact
      ? "line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-white/58"
      : isProfile
        ? "line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-white/58"
        : "line-clamp-4 whitespace-pre-wrap text-[0.95rem] leading-7 text-white/62";

  function shouldIgnorePostNavigation(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(target.closest("[data-no-post-nav]"));
  }

  function handleArticleClick(event: MouseEvent<HTMLElement>) {
    if (!isNavigable || shouldIgnorePostNavigation(event.target)) {
      return;
    }

    router.push(postHref);
  }

  function handleArticleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (
      !isNavigable ||
      shouldIgnorePostNavigation(event.target) ||
      (event.key !== "Enter" && event.key !== " ")
    ) {
      return;
    }

    event.preventDefault();
    router.push(postHref);
  }

  const cardContent = (
    <article
      role={isNavigable ? "link" : undefined}
      tabIndex={isNavigable ? 0 : undefined}
      className={cn(
        "relative overflow-hidden rounded-[24px] bg-[#12151c] shadow-[0_28px_80px_-54px_rgba(0,0,0,0.98)]",
        compact
          ? "px-4 py-4"
          : isProfile
            ? "px-4 py-4 sm:px-5 sm:py-5"
            : "px-5 py-5 sm:px-6 sm:py-6",
        post.author.isPro &&
          "bg-[linear-gradient(180deg,rgba(29,33,44,0.98),rgba(20,24,34,0.98))]",
        isNavigable &&
          "cursor-pointer transition hover:bg-[#151a24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12151c]",
        className,
      )}
      onClick={handleArticleClick}
      onKeyDown={handleArticleKeyDown}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          {isProfile ? (
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-white/42">
              <span>
                {formatter.dateTime(new Date(post.createdAt), {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              {post.moderationStatus === "UNCERTAIN" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="border-amber-400/30 bg-amber-400/10 text-amber-200"
                      >
                        <TriangleAlert className="size-3" />
                        {t("uncertainBadge")}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{t("uncertainTooltip")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          ) : (
            <Link
              data-no-post-nav
              href={`/profile/${post.author.username}`}
              className="flex min-w-0 items-start gap-3 transition hover:opacity-90"
            >
              <AuthorAvatar
                avatarUrl={post.author.avatarUrl}
                displayName={post.author.displayName}
                compact={compact}
              />

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-white">
                    {post.author.displayName}
                  </span>
                  {post.author.isPro ? (
                    <Sparkles className="size-4 text-[#ffd56b]" />
                  ) : null}
                  {post.author.isAi ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="border-sky-400/30 bg-sky-400/10 text-sky-200"
                          >
                            <Bot className="size-3" />
                            {t("aiBadge")}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t("aiTooltip")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : null}
                  {post.moderationStatus === "UNCERTAIN" ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="border-amber-400/30 bg-amber-400/10 text-amber-200"
                          >
                            <TriangleAlert className="size-3" />
                            {t("uncertainBadge")}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t("uncertainTooltip")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-white/42">
                  <span>@{post.author.username}</span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {formatter.dateTime(new Date(post.createdAt), {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div
          className={cn(
            "grid gap-4",
            post.images.length > 0 &&
              (compact
                ? "md:grid-cols-[minmax(0,1fr)_190px]"
                : "lg:grid-cols-[minmax(0,1fr)_240px]"),
          )}
        >
          <div className="min-w-0 space-y-4">
            <h2
              className={cn(
                "font-manrope leading-tight tracking-[-0.03em] text-white",
                compact
                  ? "text-[1.15rem]"
                  : isDetail
                    ? "text-[1.75rem] sm:text-[2rem]"
                    : isProfile
                      ? "line-clamp-2 text-[1.25rem]"
                      : "line-clamp-2 text-[1.35rem]",
              )}
            >
              {post.title}
            </h2>

            {postContent ? (
              <div className="space-y-3">
                <p className={contentClassName}>{postContent}</p>
                {shouldShowExpand ? (
                  <button
                    data-no-post-nav
                    type="button"
                    className="text-sm font-medium text-primary-glow transition hover:text-white"
                    onClick={() => setExpanded((current) => !current)}
                  >
                    {expanded ? t("seeLess") : t("seeMore")}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {post.images.length > 0 ? (
            <button
              data-no-post-nav
              type="button"
              className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-black/30"
              onClick={() => setOpenImageIndex(0)}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={post.images[0]}
                  alt={t("imageAlt", { index: 1 })}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.015]"
                  sizes={
                    compact ? "190px" : "(max-width: 1024px) 100vw, 240px"
                  }
                />
              </div>

              {post.images.length > 1 ? (
                <div className="absolute inset-x-3 bottom-3 rounded-full border border-white/10 bg-black/65 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  {t("moreImages", { count: post.images.length - 1 })}
                </div>
              ) : null}
            </button>
          ) : null}
        </div>

        <div data-no-post-nav>
          <PostActions
            post={post}
            commentHref={commentHref}
            isAuthenticated={isAuthenticated}
            compact={compact}
            onDeleteSuccess={onDeleteSuccess}
          />
        </div>
      </div>

      <PostImageDialog
        images={post.images}
        postTitle={post.title}
        openIndex={openImageIndex}
        onOpenIndexChange={setOpenImageIndex}
      />
    </article>
  );

  if (!post.author.isPro) {
    return cardContent;
  }

  return (
    <div className="premium-card-frame rounded-[31px] p-px">{cardContent}</div>
  );
}
