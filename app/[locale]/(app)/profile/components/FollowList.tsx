"use client";

import { User2Icon } from "lucide-react";
import Image from "next/image";
import toggleFollow from "../_actions/toggleFollow";
import { useOptimistic, useState, useTransition } from "react";
import { Result } from "pg";

export type FollowListItem = {
  id: string;
  username: string | null;
  displayname: string;
  avatarUrl: string | null;
  bio: string | null;
  isAi: boolean;
  isPro: boolean;
};

type FollowListProps = {
  items: FollowListItem[];
  isAuthentificated: boolean;
  isViewerFollowing: boolean;
};

export default function FollowList({
  items,
  isViewerFollowing,
}: FollowListProps) {
  const [msg, setMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const [optimisticFollowState, updateOptimisticFollowState] = useOptimistic(
    {
      isViewerFollowing,
    },
    (currentState, newValue: boolean) => ({
      isViewerFollowing: newValue,
    }),
  );

  const handleFollow = async (username: string) => {
    setMsg("");
    updateOptimisticFollowState(!optimisticFollowState);

    startTransition(async () => {
      const result = await toggleFollow(username);
      if (!result.ok) {
        setMsg(result?.userMsg || "Impossible de vous abonné");
      }
    });
  };

  return (
    <main className="p-8 flex items-centers">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <h1 className="">Mode</h1>
        {items.length === 0 ? (
          <p className="">Aucun profil trouvé</p>
        ) : (
          <section>
            {items.map((i) => (
              <article key={i.id} className="flex flex-row">
                {i.avatarUrl ? (
                  <Image
                    src={i.avatarUrl}
                    priority
                    width={30}
                    alt="photo_profile"
                    height={30}
                    className="rounded*full"
                  />
                ) : (
                  <User2Icon />
                )}
                <div className="flex flex-col items-start space-y-2">
                  <p className="">{i.displayname}</p>
                  <p className="">@{i.username}</p>
                  <p className="truncate">{i.bio}</p>
                </div>

                <button
                  className="self-end"
                  onClick={() => handleFollow(i.username!)}
                  disabled={isPending}
                >
                  {isViewerFollowing ? "Abonnée" : "S'abonné"}
                </button>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
