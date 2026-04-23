"use client";

import ProfileFollowCard, { FollowListItem } from "./ProfilFollowCard";

export type FollowListProps = {
  items: FollowListItem[];
  isViewerAuthentificated: boolean;
};

export default function FollowList({
  items,
  isViewerAuthentificated,
}: FollowListProps) {
  return (
    <main className="p-8 flex items-centers">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <h1 className="">Mode</h1>
        {items.length === 0 ? (
          <p className="">Aucun profil trouvé</p>
        ) : (
          <section>
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
