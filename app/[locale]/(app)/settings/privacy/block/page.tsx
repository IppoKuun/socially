import { makeQueryClient } from "@/lib/query-client";
import { getUserBlockListType } from "@/lib/settings/block/queries";
import readBlockListAction from "../../_actions/readBlockList";
import BlockListDisplay from "../_components/BlockListDisplay";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import QueryProvider from "@/components/providers/query-provider";

export default async function settingsBlocksPage() {
  const queryclient = makeQueryClient();

  const data = await queryclient.fetchInfiniteQuery({
    queryKey: ["blockList"],
    queryFn: async ({ pageParam }) => await readBlockListAction(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: getUserBlockListType) =>
      lastPage.nextCursor ?? undefined,
  });

  return (
    // Pas de apppageShell ici, c'est normal //
    <section className="">
      <QueryProvider>
        <HydrationBoundary state={dehydrate(queryclient)}>
          <BlockListDisplay />
        </HydrationBoundary>
      </QueryProvider>
    </section>
  );
}
