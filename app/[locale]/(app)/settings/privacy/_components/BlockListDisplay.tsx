import { getUserBlockListType } from "@/lib/settings/block/queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import readBlockListAction from "../../_actions/readBlockList";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import unblockUserAction from "../../_actions/unblockUser";
import { UserRound } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const BlockItemSkeleton = () => (
  <div className="flex items-center gap-3 p-4 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-neutral-800" />
    <div className="h-4 w-32 bg-neutral-800 rounded" />
  </div>
);

export default function BlockListDisplay() {
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
        toast.error("Impossible de débloqué, veuillez réesaiyez");
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
    initialPageParam: null,
    getNextPageParam: (lastPage: getUserBlockListType) =>
      lastPage.nextCursor ?? undefined,
  });

  const profiles = data?.pages.flatMap((page) => page.blocksProfilToDisplay);
  return (
    <section className="flex flex-col">
      {error && (
        <p className="">
          Désolé, nous navons pas pu avoir les utilisateurs bloqué
        </p>
      )}
      {status == "pending" && (
        <>
          <BlockItemSkeleton />
          <BlockItemSkeleton />
          <BlockItemSkeleton />
        </>
      )}
      {profiles ? (
        <>
          {profiles.map((profile) => {
            const isUnblocked = unblockedIds.has(profile.id);
            const profileContent = (
              <>
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-white/10 text-white/60">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.username ?? "Profil bloqué"}
                      width={40}
                      height={40}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-5" aria-hidden="true" />
                  )}
                </div>
                <p className="text-sm font-medium text-white">
                  {profile.username ?? "Utilisateur supprimé"}
                </p>
              </>
            );

            return (
              <article
                key={profile.id}
                className="flex flex-row justify-between p-4"
              >
                {profile.username ? (
                  <Link
                    href={`/profile/${profile.username}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    {profileContent}
                  </Link>
                ) : (
                  <div className="flex min-w-0 items-center gap-3">
                    {profileContent}
                  </div>
                )}
                <Button
                  disabled={isPending}
                  onClick={() => handleSubmit(profile.id)}
                >
                  {isUnblocked ? "Débloqué" : "Débloquer"}
                </Button>
              </article>
            );
          })}

          {hasNextPage && (
            <Button onClick={() => fetchNextPage()}>
              {isFetchingNextPage
                ? "Chargememnt des autres profiles"
                : "Charger plus"}
            </Button>
          )}

          {isFetchingNextPage && (
            <>
              <BlockItemSkeleton />
              <BlockItemSkeleton />
              <BlockItemSkeleton />
              <BlockItemSkeleton />
              <BlockItemSkeleton />
            </>
          )}
        </>
      ) : (
        <p className="">Vous navez bloqué aucun profiles</p>
      )}
    </section>
  );
}
