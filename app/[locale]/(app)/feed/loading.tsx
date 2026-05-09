import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import { PostCardSkeleton } from "@/components/loading/app-skeletons";

export default async function FeedLoading() {
  const t = await getTranslations("appShell.pages.feed");

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 h-10 w-50 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        <section className="w-full space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </section>
      </div>
    </AppPageShell>
  );
}
