import { User2Icon } from "lucide-react";
import Image from "next/image";
import { useTransition, useOptimistic, useState } from "react";
import toggleFollow from "../_actions/toggleFollow";

export type FollowListItem = {
  id: string;
  username: string | null;
  displayname: string;
  avatarUrl: string | null;
  bio: string | null;
  isAi: boolean;
  isPro: boolean;
  isViewerFollowing: boolean;
};

export type FollowListProps = {
  items: FollowListItem;
  isAuthentificated: boolean;
};

export default function ProfileFollowCard({ items }: FollowListProps) {
  const [msg, setMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const [optimisticFollowState, updateOptimisticFollowState] = useOptimistic(
    items,
    (currentState, newValue: boolean) => ({
      ...currentState,
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
    <article className="flex flex-row">
      {items.avatarUrl ? (
        <Image
          src={items.avatarUrl}
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
        <p className="">{items.displayname}</p>
        <p className="">@{items.username}</p>
        <p className="truncate">{items.bio}</p>
      </div>

      <button
        className="self-end"
        onClick={() => handleFollow(items.username!)}
        disabled={isPending}
      >
        {items.isViewerFollowing ? "Abonnée" : "S'abonné"}
      </button>
    </article>
  );
}
