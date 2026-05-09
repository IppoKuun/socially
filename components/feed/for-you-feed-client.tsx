"use client";
//component/feed/for-u-feed-clients.tsx//
import { useEffect, useState } from "react";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";

import { readForYouFeedHead, readForYouFeedPage } from "@/app/actions/feed";
import PostCard from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { feedQueryKeys } from "@/lib/feed/query-keys";
import {
  FEED_PAGE_SIZE,
  type FeedCursor,
  type ForYouFeedPage,
} from "@/lib/feed/shared";

type ForYouFeedClientProps = {
  isAuthenticated: boolean;
};

export default function ForYouFeedClient({
  isAuthenticated,
}: ForYouFeedClientProps) {
  const t = useTranslations("feed.forYou");
  const queryClient = useQueryClient();
  const [resetVersion, setResetVersion] = useState(0);
  const [showNewPostsBadge, setShowNewPostsBadge] = useState(false);
  const infiniteQueryKey = feedQueryKeys.forYouInfinite(resetVersion);
  const headQueryKey = feedQueryKeys.forYouHead(resetVersion);

  // dans le fichier layout page on a prefetch les query, ils sont donc en cache :
  // Ici ont veut utilisé ce cache avec useQuery //
  const feedQuery = useInfiniteQuery({
    queryKey: infiniteQueryKey,
    queryFn: ({ pageParam }) =>
      readForYouFeedPage({
        cursor: pageParam,
        limit: FEED_PAGE_SIZE,
      }),
    initialPageParam: null as FeedCursor,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    // Ont veut pas que lorsqu'on revient sur la page 20 posts sont rechargé d'un coup //
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const latestRenderedPostId = feedQuery.data?.pages[0]?.items[0]?.id ?? null;

  const headQuery = useQuery({
    queryKey: headQueryKey,
    queryFn: () => readForYouFeedHead(),

    // Ont veut uniquement calculer le HEAD quand TanSack a déjà une liste de POST //
    enabled: Boolean(latestRenderedPostId),

    // Si user reviens d'une autre page ou d'une autre feneter
    // Ont recalcule HEAD pour voir si ya pas de nouveau POST //
    refetchOnWindowFocus: true,
    refetchOnMount: true,

    // A part a sa reception, la données n'est jamais considérée comme fraiche
    // car c'est grace aux head qu'on voit si ya de nvl DATA ont doit donc etre
    // Ont mets donc RIEN en cache //
    staleTime: 0,
  });

  // Dans ce useEffect qui se déclenche quand dernier post du feed ou dernier post en DB change //
  // Si le HEAD et le plus récents post en DB est différents ne sont pas pareil
  // Ont déclenchee l'animation pour le badge pour rafraichir les nvl données //
  // Et si le composant se démonte ot cancel le timeout et l'animation //
  // Cela permet une vérification si ya de nouverau a chaque MAJ du cache
  // Et si nouveau post, possiblité de fetch les nv post pris //

  useEffect(() => {
    if (!latestRenderedPostId || !headQuery.data?.latestPostId) {
      return;
    }

    if (headQuery.data.latestPostId === latestRenderedPostId) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setShowNewPostsBadge(true);
    });
    const timeoutId = window.setTimeout(() => {
      setShowNewPostsBadge(false);
    }, 3_000);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [
    headQuery.data?.latestPostId,
    headQuery.dataUpdatedAt,
    latestRenderedPostId,
  ]);

  //Si ont delete un post, ont veut qu'il ne sois plus présent dans le cache de Tansack //
  function handleDeleteSuccess(postId: string) {
    queryClient.setQueryData<InfiniteData<ForYouFeedPage, FeedCursor>>( //??//
      infiniteQueryKey,
      (currentData) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          pages: currentData.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.id !== postId),
          })),
        };
      },
    );
  }

  function handleResetFeed() {
    setShowNewPostsBadge(false);

    // Ont doit changer de version a chaque reset pour invalididé le cache actuelle //
    setResetVersion((current) => current + 1);
  }

  // FlatMap veut dire qu'on renvoie un tableau avec que les post au lieu d'avoir l'objet brut de Tansack //
  const posts = feedQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="relative space-y-4">
      {showNewPostsBadge ? (
        <button
          type="button"
          className="fixed left-1/2 top-5 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-[rgba(18,21,28,0.96)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_24px_48px_-26px_rgba(0,0,0,0.98)] backdrop-blur-xl transition hover:bg-white/[0.08]"
          onClick={handleResetFeed}
        >
          {t("newPostsBadge")}
        </button>
      ) : null}

      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            commentHref={`/post/${post.slug}#post-comment-compose`}
            isAuthenticated={isAuthenticated}
            onDeleteSuccess={handleDeleteSuccess}
          />
        ))
      ) : feedQuery.isPending ? (
        <div className="flex items-center justify-center rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,26,33,0.98),rgba(20,22,29,0.98))] px-5 py-10 text-white/60">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,26,33,0.98),rgba(20,22,29,0.98))] px-5 py-8 text-sm leading-7 text-white/56">
          {t("empty")}
        </div>
      )}

      {feedQuery.hasNextPage ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            size="lg"
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 text-white hover:bg-white/[0.08]"
            onClick={() => feedQuery.fetchNextPage()}
            disabled={feedQuery.isFetchingNextPage}
          >
            {feedQuery.isFetchingNextPage ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                {t("loadingMore")}
              </>
            ) : (
              t("loadMore")
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
