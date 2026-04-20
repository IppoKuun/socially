import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

import { readForYouFeedPage } from "@/app/actions/feed";
import QueryProvider from "@/components/providers/query-provider";
import { feedQueryKeys } from "@/lib/feed/query-keys";
import {
  FEED_PAGE_SIZE,
  type FeedCursor,
  type ForYouFeedPage,
} from "@/lib/feed/shared";
import { makeQueryClient } from "@/lib/query-client";
import AppPageShell from "../_components/app-page-shell";
import CreatePostComposer from "./_components/CreatePostComposer";
import FeedTabClient from "./_components/feedTabClient";

export default async function FeedPage() {
  const t = await getTranslations("appShell.pages.feed");
  const queryClient = makeQueryClient();

  // Ont fait plusieurs promise car on a besoin du feed infini + du premier post (HEAD)
  // Car il n'est pas inclus dans la logique du scroll infini car il ne sera jamais appellé
  // en scroll infini //
  await queryClient.prefetchInfiniteQuery({
    queryKey: feedQueryKeys.forYouInfinite(0),
    // PageParams sera toujours notre cursor //
    queryFn: ({ pageParam }) =>
      readForYouFeedPage({
        cursor: pageParam,
        limit: FEED_PAGE_SIZE,
      }),

    // Cette propriété est null car le premier post sera géré par l'autre promise
    // Avec une requete sur le HEAD //
    initialPageParam: null as FeedCursor,

    // Ici lastPage = le 21ieme cursor  //
    getNextPageParam: (lastPage: ForYouFeedPage) =>
      lastPage.nextCursor ?? undefined,
  });

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <QueryProvider>
        {/** HydratationBoundary est uniquement pour désydraté tout ce que tanSack mets en cache.
         Car il renvoie plein de fonctions/Objets qu'on ne peut pas envoyé au client ducoup ont
         le convertis de cette maniere en JSON
         */}
        <HydrationBoundary state={dehydrate(queryClient)}>
          <div className="flex flex-col items-center justify-center">
            <FeedTabClient />
            <CreatePostComposer />
          </div>
        </HydrationBoundary>
      </QueryProvider>
    </AppPageShell>
  );
}
