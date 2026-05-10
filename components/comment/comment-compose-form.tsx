"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

import createComment from "@/app/actions/comment";
import AuthRequiredDialog from "@/components/auth/AuthRequiredDialog";
import { Button } from "@/components/ui/button";
import { feedQueryKeys } from "@/lib/feed/query-keys";
import { cn } from "@/lib/utils";

type CreateCommentResult = {
  ok: boolean;
  userMsg?: string;
  errors?: {
    content?: string[];
  };
};

type CommentComposeFormProps = {
  postId: string;
  postSlug: string;
  mode: "toPost" | "toComment";
  anchorId: string;
  isAuthenticated: boolean;
  responseToCommentId?: string | null;
  compact?: boolean;
};

const INITIAL_ACTION_STATE = {
  ok: false,
  userMsg: null,
};

export default function CommentComposeForm({
  postId,
  postSlug,
  mode,
  anchorId,
  isAuthenticated,
  responseToCommentId = null,
  compact = false,
}: CommentComposeFormProps) {
  const t = useTranslations("comments.compose");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [authRequiredOpen, setAuthRequiredOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      setAuthRequiredOpen(true);
      return;
    }

    if (!content.trim()) {
      setFeedbackMessage(t("empty"));
      return;
    }

    setFeedbackMessage("");

    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("language", locale);
    formData.append("PostId", postId);
    formData.append("mode", mode);

    if (responseToCommentId) {
      formData.append("CommentID", responseToCommentId);
    }

    startTransition(async () => {
      const result = (await createComment(
        INITIAL_ACTION_STATE,
        formData,
      )) as CreateCommentResult;

      if (!result.ok) {
        setFeedbackMessage(
          result.errors?.content?.[0] || result.userMsg || t("submitFailed"),
        );
        return;
      }

      setContent("");
      setFeedbackMessage(result.userMsg || t("success"));

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["post", postSlug] }),
        queryClient.invalidateQueries({
          queryKey: feedQueryKeys.forYouInfiniteBase(),
        }),
      ]);
    });
  }

  return (
    <>
      <form
        id={anchorId}
        className={cn(
          "rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(14,17,24,0.98))] shadow-[0_22px_70px_-48px_rgba(0,0,0,0.96)]",
          compact ? "px-4 py-4" : "px-5 py-5 sm:px-6 sm:py-6",
        )}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-manrope text-lg tracking-[-0.03em] text-white">
              {mode === "toPost" ? t("postTitle") : t("replyTitle")}
            </p>
            <p className="text-sm text-white/45">
              {mode === "toPost" ? t("postHint") : t("replyHint")}
            </p>
          </div>

          <TextareaAutosize
            minRows={compact ? 3 : 4}
            maxRows={10}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              mode === "toPost" ? t("postPlaceholder") : t("replyPlaceholder")
            }
            className="w-full resize-none rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-white/24 focus:border-primary/60"
            disabled={isPending}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/45" aria-live="polite">
              {feedbackMessage}
            </p>

            <Button
              type="submit"
              size={compact ? "default" : "lg"}
              className="min-w-30 rounded-full bg-[linear-gradient(180deg,#2f7cff_0%,#6e63ff_100%)] text-white shadow-[0_20px_40px_-24px_rgba(47,124,255,0.78)] hover:opacity-95"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  <SendHorizontal className="size-4" />
                  {t("submit")}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <AuthRequiredDialog
        open={authRequiredOpen}
        onOpenChange={setAuthRequiredOpen}
      />
    </>
  );
}
