"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";

import toggleFollow from "../../profile/_actions/toggleFollow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchFollowButtonProps = {
  username: string | null;
  initialIsFollowing: boolean;
  disabled?: boolean;
  className?: string;
};

export default function SearchFollowButton({
  username,
  initialIsFollowing,
  disabled = false,
  className,
}: SearchFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const canToggleFollow = Boolean(username) && !disabled;

  function handleFollowToggle() {
    if (!username || !canToggleFollow || isPending) {
      return;
    }

    setMessage("");
    const previousFollowing = isFollowing;
    const nextFollowing = !previousFollowing;

    setIsFollowing(nextFollowing);

    startTransition(async () => {
      const result = await toggleFollow(username);

      if (!result.ok) {
        setIsFollowing(previousFollowing);
        setMessage(result.userMsg || "Impossible de mettre a jour l'abonnement.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant={isFollowing ? "secondary" : "default"}
        size="sm"
        className={cn(
          "min-w-24 rounded-full",
          isFollowing
            ? "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
            : "bg-white text-[#111318] hover:bg-white/90",
          className,
        )}
        onClick={handleFollowToggle}
        disabled={!canToggleFollow || isPending}
      >
        {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {isFollowing ? "Abonné" : "Suivre"}
      </Button>

      {message ? (
        <p className="max-w-48 text-right text-xs leading-5 text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
