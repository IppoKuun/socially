import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[linear-gradient(90deg,rgba(255,255,255,0.045),rgba(255,255,255,0.085),rgba(255,255,255,0.045))] bg-[length:220%_100%]",
        className,
      )}
    />
  );
}

export function PostCardSkeleton({
  variant = "feed",
}: {
  variant?: "feed" | "detail" | "compact";
}) {
  const isDetail = variant === "detail";
  const isCompact = variant === "compact";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[24px] bg-[#12151c] shadow-[0_28px_80px_-54px_rgba(0,0,0,0.98)]",
        isCompact ? "px-4 py-4" : "px-5 py-5 sm:px-6 sm:py-6",
      )}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <SkeletonBlock
            className={cn(
              "shrink-0",
              isCompact ? "h-10 w-10 rounded-2xl" : "h-12 w-12 rounded-[18px]",
            )}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>

        <div
          className={cn(
            "grid gap-4",
            isDetail ? "lg:grid-cols-[minmax(0,1fr)_240px]" : "",
          )}
        >
          <div className="min-w-0 space-y-4">
            <SkeletonBlock
              className={cn(
                isDetail ? "h-8 w-4/5" : "h-6 w-3/4",
                "rounded-xl",
              )}
            />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-8/12" />
              {isDetail ? <SkeletonBlock className="h-4 w-10/12" /> : null}
            </div>
          </div>

          {isDetail ? (
            <SkeletonBlock className="aspect-square w-full rounded-[26px]" />
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-8 w-20 rounded-full" />
          <SkeletonBlock className="h-8 w-24 rounded-full" />
          <SkeletonBlock className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function PageHeaderSkeleton() {
  return (
    <header className="space-y-2 px-1">
      <SkeletonBlock className="h-9 w-48 rounded-xl" />
      <SkeletonBlock className="h-4 w-full max-w-xl" />
    </header>
  );
}

export function CommentSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <article
      className={cn(
        "rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,21,28,0.98),rgba(14,17,24,0.98))] shadow-[0_22px_70px_-48px_rgba(0,0,0,0.96)]",
        compact ? "px-4 py-4" : "px-5 py-5",
      )}
    >
      <div className="flex items-start gap-3">
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-10/12" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-8 w-16 rounded-full" />
            <SkeletonBlock className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <header className="relative">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(12,15,22,0.74)] px-4 py-6 shadow-[0_26px_90px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:px-6 sm:py-7 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_42%)]" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
          <SkeletonBlock className="h-32 w-32 shrink-0 rounded-full sm:h-36 sm:w-36" />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              <SkeletonBlock className="h-6 w-24 rounded-full" />
              <SkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="mx-auto h-10 w-56 rounded-xl md:mx-0" />
              <SkeletonBlock className="mx-auto h-4 w-32 md:mx-0" />
            </div>
            <SkeletonBlock className="mx-auto h-4 w-full max-w-xl md:mx-0" />
            <SkeletonBlock className="mx-auto h-4 w-8/12 max-w-lg md:mx-0" />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-48">
            <SkeletonBlock className="h-10 w-full rounded-full" />
            <SkeletonBlock className="h-10 w-full rounded-full" />
          </div>
        </div>
        <div className="relative z-10 mt-7 grid grid-cols-3 gap-2 rounded-[1.5rem] border border-white/10 bg-black/20 p-2 backdrop-blur-xl">
          <SkeletonBlock className="h-14 rounded-2xl" />
          <SkeletonBlock className="h-14 rounded-2xl" />
          <SkeletonBlock className="h-14 rounded-2xl" />
        </div>
      </section>
    </header>
  );
}

export function MessagesShellSkeleton() {
  return (
    <section className="grid min-h-[calc(100svh-11rem)] overflow-hidden rounded-[1.65rem] border border-white/10 bg-[rgba(15,18,25,0.72)] shadow-[0_26px_90px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl md:min-h-[620px] md:grid-cols-[340px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="min-w-0 bg-white/[0.035] p-4">
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-24 items-center gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.075] px-3 py-3"
            >
              <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex justify-between gap-3">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-10" />
                </div>
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </aside>
      <main className="hidden min-w-0 items-center justify-center border-l border-white/10 px-6 text-center md:flex">
        <div className="w-full max-w-sm space-y-3">
          <SkeletonBlock className="mx-auto h-8 w-56 rounded-xl" />
          <SkeletonBlock className="mx-auto h-4 w-full" />
          <SkeletonBlock className="mx-auto h-4 w-9/12" />
        </div>
      </main>
    </section>
  );
}
