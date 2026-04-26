import { User2Icon } from "lucide-react";
import Image from "next/image";
import { useTransition, useOptimistic, useState } from "react";
import toggleFollow from "../_actions/toggleFollow";

export type FollowListItem = {
  id: string;
  username: string | null;
  displayname: string;
  avatarUrl: string | null;
  bio: string | null;
  isAi: boolean;
  isPro: boolean;
  isViewerFollowing: boolean;
};

export type FollowListProps = {
  items: FollowListItem;
  isAuthentificated: boolean;
};

export default function ProfileFollowCard({
  items,
  isAuthentificated,
}: FollowListProps) {
  const [msg, setMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const canFollow = Boolean(items.username) && isAuthentificated;

  const [optimisticFollowState, updateOptimisticFollowState] = useOptimistic(
    items,
    (currentState, newValue: boolean) => ({
      ...currentState,
      isViewerFollowing: newValue,
    }),
  );

  const handleFollow = (username: string) => {
    if (!canFollow || isPending) {
      return;
    }

    setMsg("");
    const previousFollowState = optimisticFollowState.isViewerFollowing;
    const nextFollowState = !optimisticFollowState.isViewerFollowing;

    startTransition(async () => {
      updateOptimisticFollowState(nextFollowState);
      const result = await toggleFollow(username);
      if (!result.ok) {
        updateOptimisticFollowState(previousFollowState);
        setMsg(result?.userMsg || "Impossible de vous abonner");
      }
    });
  };

  return (
    <article className="rounded-[1.35rem] border border-white/10 bg-[#121722]/75 p-4 shadow-[0_18px_48px_-38px_rgba(0,0,0,0.85)] backdrop-blur-xl transition hover:border-white/16 hover:bg-white/[0.055]">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-white/55 sm:h-14 sm:w-14">
          {items.avatarUrl ? (
            <Image
              src={items.avatarUrl}
              width={56}
              alt={`Avatar de ${items.displayname}`}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <User2Icon className="h-6 w-6" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-white sm:text-base">
              {items.displayname}
            </p>
            {items.isPro && (
              <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">
                Pro
              </span>
            )}
            {items.isAi && (
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/60">
                AI
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-white/45">
            @{items.username ?? "unknown"}
          </p>
          {items.bio && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/68">
              {items.bio}
            </p>
          )}
        </div>

        <button
          type="button"
          className="ml-auto h-9 shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/82 transition hover:border-primary/40 hover:bg-primary/10 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.025] disabled:text-white/32 sm:h-10 sm:px-5 sm:text-sm"
          onClick={() => {
            if (!items.username) {
              setMsg("Ce profil ne peut pas encore être suivi.");
              return;
            }

            handleFollow(items.username);
          }}
          disabled={!canFollow || isPending}
        >
          {optimisticFollowState.isViewerFollowing ? "Abonné" : "Suivre"}
        </button>
      </div>

      {msg && (
        <p className="mt-3 rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {msg}
        </p>
      )}
    </article>
  );
}
