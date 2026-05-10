import { makeQueryClient } from "@/lib/query-client";
import { getUserBlockListType } from "@/lib/settings/block/queries";
import readBlockListAction from "../../_actions/readBlockList";
import BlockListDisplay from "../_components/BlockListDisplay";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import QueryProvider from "@/components/providers/query-provider";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function settingsBlocksPage() {
  const t = await getTranslations("appShell.pages.settings");
  const queryclient = makeQueryClient();

  await queryclient.fetchInfiniteQuery({
    queryKey: ["blockList"],
    queryFn: async ({ pageParam }) => await readBlockListAction(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: getUserBlockListType) =>
      lastPage.nextCursor ?? undefined,
  });

  return (
    // Pas de apppageShell ici, c'est normal //
    <section className="space-y-4">
      <Link
        href="/settings/privacy"
        className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("blockList.backToPrivacy")}
      </Link>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h1 className="font-manrope text-xl font-semibold text-white">
          {t("blockList.title")}
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-6 text-white/55">
          {t("blockList.description")}
        </p>
      </div>

      <QueryProvider>
        <HydrationBoundary state={dehydrate(queryclient)}>
          <BlockListDisplay />
        </HydrationBoundary>
      </QueryProvider>
    </section>
  );
}
