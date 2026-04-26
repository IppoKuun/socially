"use client";

import ProfileFollowCard, { FollowListItem } from "./ProfilFollowCard";

export type FollowListProps = {
  items: FollowListItem[];
  isViewerAuthentificated: boolean;
  mode: "followers" | "following";
  username: string;
};

export default function FollowList({
  items,
  isViewerAuthentificated,
  mode,
  username,
}: FollowListProps) {
  const title = mode === "followers" ? "Followers" : "Following";
  const description =
    mode === "followers"
      ? `People following @${username}.`
      : `People @${username} is following.`;
  const emptyMessage =
    mode === "followers"
      ? "Aucun follower pour le moment."
      : "Aucun profil suivi pour le moment.";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col">
        <header className="mb-6 border-b border-white/10 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary/80">
            Profile network
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-white/55">{description}</p>
        </header>

        {items.length === 0 ? (
          <p className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-5 py-6 text-sm text-white/55">
            {emptyMessage}
          </p>
        ) : (
          <section className="flex flex-col gap-3" aria-label={title}>
            {items.map((i) => (
              <ProfileFollowCard
                key={i.id}
                items={i}
                isAuthentificated={isViewerAuthentificated}
              />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
