"use client";
//Componenrts/post/post-actions//
import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  Flag,
  Heart,
  LoaderCircle,
  MessageSquare,
  Share2,
  Trash2,
} from "lucide-react";

import deletePost from "@/app/actions/deletePost";
import { Like } from "@/app/actions/like";
import report from "@/app/actions/report";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/routing";
import { feedQueryKeys } from "@/lib/feed/query-keys";
import type { FeedPost } from "@/lib/feed/shared";
import { cn } from "@/lib/utils";

type PostActionsProps = {
  post: FeedPost;
  commentHref: string;
  compact?: boolean;
  onDeleteSuccess?: (postId: string) => void;
};

export default function PostActions({
  post,
  commentHref,
  compact = false,
  onDeleteSuccess,
}: PostActionsProps) {
  const t = useTranslations("feed.postCard");
  const queryClient = useQueryClient();
  const [isLikePending, startLikeTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isReportPending, startReportTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [reported, setReported] = useState(post.viewer.hasReported);
  const [optimisticLikeState, updateOptimisticLikeState] = useOptimistic(
    {
      hasLiked: post.viewer.hasLiked,
      likeCount: post.likeCount,
    },
    (currentState, nextHasLiked: boolean) => ({
      hasLiked: nextHasLiked,
      likeCount: Math.max(0, currentState.likeCount + (nextHasLiked ? 1 : -1)),
    }),
  );

  // Ont veut invalider le cache a chaque actions car ont ne veut pas que User
  // Fasse une action qui a changé la DB mais n'est pas pris en compte lors de l'affichage de
  // ce meme post dans plusieurs interface, ex :
  // User like dans feed, clique sur le post, son like n'est pas pris en compte car
  // react a pris la data du cachge qui ne comportait pas son Like  //

  async function refreshPostSurfaces() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: feedQueryKeys.forYouInfiniteBase(),
      }),
      queryClient.invalidateQueries({
        queryKey: feedQueryKeys.forYouHeadBase(),
      }),
      queryClient.invalidateQueries({
        queryKey: ["post", post.slug],
      }),
    ]);
  }

  function handleLike() {
    setStatusMessage("");

    const nextHasLiked = !optimisticLikeState.hasLiked;
    updateOptimisticLikeState(nextHasLiked);

    startLikeTransition(async () => {
      const result = await Like(post.id);

      if (!result.ok) {
        setStatusMessage(result.userMsg || t("likeError"));
      }

      await refreshPostSurfaces();
    });
  }

  function handleDelete() {
    setStatusMessage("");

    startDeleteTransition(async () => {
      const result = await deletePost(post.id);

      if (!result.ok) {
        setStatusMessage(result.userMsg || t("deleteError"));
        return;
      }

      setDeleteOpen(false);
      onDeleteSuccess?.(post.id);
      await refreshPostSurfaces();
    });
  }

  function handleReport() {
    setStatusMessage("");

    startReportTransition(async () => {
      const result = await report(post.id);

      if (!result.ok) {
        setStatusMessage(result.userMsg || t("reportError"));
        return;
      }

      setReported(true);
      setReportOpen(false);
      await refreshPostSurfaces();
    });
  }

  const buttonSize = compact ? "sm" : "default";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={optimisticLikeState.hasLiked ? "secondary" : "ghost"}
          size={buttonSize}
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
          <span>
            {t("like")} {optimisticLikeState.likeCount}
          </span>
        </Button>

        <Button
          asChild
          variant="ghost"
          size={buttonSize}
          className="rounded-full border border-white/10 bg-white/[0.03] text-white/82 hover:bg-white/[0.08]"
        >
          <Link href={commentHref}>
            <MessageSquare className="size-4" />
            <span>
              {t("comment")} {post.commentCount}
            </span>
          </Link>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size={buttonSize}
          className="cursor-not-allowed rounded-full border border-white/10 bg-white/[0.03] text-white/38 hover:bg-white/[0.03] hover:text-white/38"
          disabled
          title={t("shareDisabled")}
        >
          <Share2 className="size-4" />
          <span>{t("share")}</span>
        </Button>

        {post.viewer.isOwner ? (
          <Button
            type="button"
            variant="ghost"
            size={buttonSize}
            className="rounded-full border border-white/10 bg-white/[0.03] text-white/82 hover:bg-white/[0.08]"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            <span>{t("delete")}</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size={buttonSize}
            className="rounded-full border border-white/10 bg-white/[0.03] text-white/82 hover:bg-white/[0.08]"
            onClick={() => setReportOpen(true)}
            disabled={reported}
          >
            <Flag className="size-4" />
            <span>{reported ? t("reported") : t("report")}</span>
          </Button>
        )}
      </div>

      {statusMessage ? (
        <p className="text-sm text-white/58" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border border-white/10 bg-[#11161f]   text-white">
          <div className="px-5 py-5">
            <DialogHeader>
              <DialogTitle className="font-manrope text-xl tracking-[-0.03em] text-white">
                {t("deleteTitle")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-white/58">
                {t("deleteDescription")}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-white/10 bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
              onClick={() => setDeleteOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                t("confirmDelete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="border border-white/10 bg-[#11161f] p-0 text-white">
          <div className="px-5 py-5">
            <DialogHeader>
              <DialogTitle className="font-manrope text-xl tracking-[-0.03em] text-white">
                {t("reportTitle")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-white/58">
                {t("reportDescription")}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-white/10 bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
              onClick={() => setReportOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleReport}
              disabled={isReportPending}
            >
              {isReportPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {t("reporting")}
                </>
              ) : (
                t("confirmReport")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
