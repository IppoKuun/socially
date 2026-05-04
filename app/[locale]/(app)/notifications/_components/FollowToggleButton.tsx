"use client";

import { LoaderCircle } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import toggleFollow from "../../profile/_actions/toggleFollow";

type FollowToggleButtonProps = {
  username: string | null;
  initialIsFollowing: boolean;
};

export default function FollowToggleButton({
  username,
  initialIsFollowing,
}: FollowToggleButtonProps) {
  const t = useTranslations("appShell.pages.notifications");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useOptimistic(
    initialIsFollowing,
    (_currentState, nextState: boolean) => nextState,
  );

  function handleFollowToggle() {
    if (!username || isPending) {
      return;
    }

    setMessage("");

    const previousFollowState = optimisticIsFollowing;
    const nextFollowState = !previousFollowState;

    startTransition(async () => {
      setOptimisticIsFollowing(nextFollowState);

      const result = await toggleFollow(username);

      if (!result.ok) {
        setOptimisticIsFollowing(previousFollowState);
        setMessage(result.userMsg || t("followError"));
      }
    });
  }

  return (
    <div className="flex min-w-28 flex-col items-end cursor-pointer gap-1">
      <button
        type="button"
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
          optimisticIsFollowing
            ? "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
            : "bg-white text-[#111318] hover:bg-white/90",
        )}
        onClick={handleFollowToggle}
        disabled={!username || isPending}
        aria-pressed={optimisticIsFollowing}
      >
        {isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
        {optimisticIsFollowing ? t("following") : t("follow")}
      </button>

      {message ? (
        <p className="max-w-40 text-right text-xs leading-4 text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
