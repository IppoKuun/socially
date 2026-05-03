import { Link } from "@/i18n/routing";
import { FollowNotificationType, PostNotificationGroup } from "../page";
import Image from "next/image";
import { User2Icon } from "lucide-react";

type CurrentPostNotifsProps = {
  followList: FollowNotificationType[];
  mode: string;
  currentPost: PostNotificationGroup | null;
};

export default function CurrentPostNotifs({
  currentPost,
  mode,
  followList,
}: CurrentPostNotifsProps) {
  const visibleLikeActors = currentPost?.likeActors.slice(0, 4) ?? [];
  const hiddenLikeActorsCount = Math.max(
    0,
    (currentPost?.likeActors.length ?? 0) - visibleLikeActors.length,
  );
  return mode === "follow" ? (
    <section className="grid grid-cols-3 sm:grid-cols-5">
      {followList.map((follow) => (
        <Link key={follow.id} href={`/profile/${follow.actor.username}`}>
          <article className="flex min-h-48 flex-col p-5 shadow">
            {follow.actor.avatarUrl ? (
              <Image
                src={follow.actor.avatarUrl}
                alt="photoimage"
                width={50}
                height={50}
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">
                <User2Icon className="size-5" />
              </div>
            )}

            <p className="">{follow.actor.displayname}</p>
            <p className="">@{follow.actor.username}</p>
          </article>
        </Link>
      ))}
    </section>
  ) : (
    <section className="">
      {currentPost?.likeActors.length && (
        <div className="flex flex-col">
          {currentPost?.likeActors.length} Ont liké votre post
          <div className="flex flex-row items-center gap-2">
            {visibleLikeActors.map((actor) => (
              <div key={actor.id}>
                {actor.avatarUrl ? (
                  <Image
                    src={actor.avatarUrl}
                    alt={actor.displayname}
                    width={50}
                    height={50}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">
                    <User2Icon className="size-5" />
                  </div>
                )}
              </div>
            ))}

            {hiddenLikeActorsCount > 0 && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white ring-1 ring-white/10">
                +{hiddenLikeActorsCount}
              </div>
            )}
          </div>
        </div>
      )}
      {currentPost ? (
        <article className="">
          {currentPost?.post.imagesUrl ? (
            <div className="flex flex-row items-center">
              <div className="flex flex-col">
                <p className=""> {currentPost.post.title}</p>
                <p className=""> {currentPost.post.content} </p>
              </div>
              <div className="">
                <span className="">
                  {currentPost.latestCreatedAt.toISOString()}
                </span>
                <Image
                  width={100}
                  height={100}
                  src={currentPost.post.imagesUrl[0]}
                  alt={`image du post ${currentPost.post.title}`}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="">
                {currentPost.latestCreatedAt.toISOString()}
              </span>
              <p className="">{currentPost.post.title}</p>
              <p className="">{currentPost.post.content} </p>
            </div>
          )}
        </article>
      ) : null}
    </section>
  );
}
