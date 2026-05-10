import { getTranslations } from "next-intl/server";

import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import {
  CommentSkeleton,
  PostCardSkeleton,
} from "@/components/loading/app-skeletons";

export default async function PostLoading() {
  const t = await getTranslations("postDetail");

  return (
    <AppPageShell
      title={t("pageDescription")}
      description={t("commentsHint")}
      className="max-w-[880px]"
    >
      <div className="space-y-6">
        <PostCardSkeleton variant="detail" />
        <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(14,17,24,0.98))] px-5 py-5 shadow-[0_22px_70px_-48px_rgba(0,0,0,0.96)] sm:px-6 sm:py-6">
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-white/10" />
            <div className="h-24 animate-pulse rounded-[22px] border border-white/10 bg-black/20" />
            <div className="ml-auto h-9 w-32 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
        <section className="space-y-3">
          <CommentSkeleton />
          <CommentSkeleton />
        </section>
      </div>
    </AppPageShell>
  );
}
