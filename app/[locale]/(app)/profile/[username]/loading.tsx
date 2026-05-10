import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import {
  PostCardSkeleton,
  ProfileHeaderSkeleton,
} from "@/components/loading/app-skeletons";

export default function ProfileLoading() {
  return (
    <>
      <AppPageShell
        title="Profile"
        description="@profile"
        className="max-w-[880px]"
      />
      <div className="space-y-6">
        <ProfileHeaderSkeleton />
        <section className="mb-15 mt-6 space-y-4">
          <div className="flex items-end justify-between gap-4 px-1">
            <div className="space-y-2">
              <div className="h-6 w-36 animate-pulse rounded-lg bg-white/10" />
              <div className="h-4 w-64 animate-pulse rounded bg-white/8" />
            </div>
            <div className="h-7 w-20 animate-pulse rounded-full bg-white/8" />
          </div>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </section>
      </div>
    </>
  );
}
