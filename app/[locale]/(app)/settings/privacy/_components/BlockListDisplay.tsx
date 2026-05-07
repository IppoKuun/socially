"use client";
import { getUserBlockListType } from "@/lib/settings/block/queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import readBlockListAction from "../../_actions/readBlockList";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import unblockUserAction from "../../_actions/unblockUser";
import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const BlockItemSkeleton = () => (
  <div className="flex animate-pulse items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
    <div className="size-10 rounded-full bg-white/10" />
    <div className="space-y-2">
      <div className="h-4 w-32 rounded bg-white/10" />
      <div className="h-3 w-20 rounded bg-white/5" />
    </div>
  </div>
);

export default function BlockListDisplay() {
  const t = useTranslations("settings");
  const [unblockedIds, setUnblockedIds] = useState<Set<string>>(new Set());

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await unblockUserAction(id);
        if (!result.ok) {
          toast.error(result.userMsg);
          return;
        }

        setUnblockedIds((current) => {
          const next = new Set(current);
          next.add(id);
          return next;
        });
      } catch {
        toast.error(t("blockList.unblockFallbackError"));
      }
    });
  };

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["blockList"],
    queryFn: ({ pageParam }) => readBlockListAction(pageParam ?? undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: getUserBlockListType) =>
      lastPage.nextCursor ?? undefined,
  });

  const profiles = data?.pages.flatMap((page) => page.blocksProfilToDisplay);
  return (
    <section className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-100">
          {t("blockList.loadError")}
        </p>
      )}
      {status == "pending" && (
        <div className="space-y-3">
          <BlockItemSkeleton />
          <BlockItemSkeleton />
          <BlockItemSkeleton />
        </div>
      )}
      {profiles?.length && profiles.length > 0 ? (
        <div className="space-y-3">
          {profiles.map((profile) => {
            const isUnblocked = unblockedIds.has(profile.id);
            const profileContent = (
              <>
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-white/10 text-white/60">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={t("blockList.avatarAlt", {
                        name: profile.username ?? t("blockList.deletedUser"),
                      })}
                      width={40}
                      height={40}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-5" aria-hidden="true" />
                  )}
                </div>
                <p className="text-sm font-medium text-white">
                  {profile.username ?? t("blockList.deletedUser")}
                </p>
              </>
            );

            return (
              <article
                key={profile.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4"
              >
                {profile.username ? (
                  <Link
                    href={`/profile/${profile.username}`}
                    className="flex min-w-0 items-center gap-3 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    {profileContent}
                  </Link>
                ) : (
                  <div className="flex min-w-0 items-center gap-3">
                    {profileContent}
                  </div>
                )}
                <Button
                  variant={isUnblocked ? "outline" : "secondary"}
                  className="shrink-0"
                  disabled={isPending || isUnblocked}
                  onClick={() => handleSubmit(profile.id)}
                >
                  {isUnblocked ? t("blockList.unblocked") : t("blockList.unblock")}
                </Button>
              </article>
            );
          })}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? t("blockList.loadingMore")
                  : t("blockList.loadMore")}
              </Button>
            </div>
          )}

          {isFetchingNextPage && (
            <div className="space-y-3">
              <BlockItemSkeleton />
              <BlockItemSkeleton />
              <BlockItemSkeleton />
              <BlockItemSkeleton />
              <BlockItemSkeleton />
            </div>
          )}
        </div>
      ) : (
        status !== "pending" && (
          <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm leading-6 text-white/55">
            {t("blockList.empty")}
          </p>
        )
      )}
    </section>
  );
}
