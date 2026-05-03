import { Link } from "@/i18n/routing";
import { FollowNotificationType, PostNotificationGroup } from "../page";
import Image from "next/image";
import { User2Icon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
    <section className="min-w-0 flex-1">
      {currentPost?.likeActors.length && (
        <div className="flex flex-col text-4xl font-sora font-bold tracking-tight ">
          {currentPost?.likeActors.length} personne ont liké votre post
          <div className="flex flex-row items-center gap-2 mt-5">
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
        <article className="mt-5 rounded-xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl">
          {currentPost?.post.imagesUrl ? (
            <div className="flex min-w-0 flex-row items-start justify-between gap-6">
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="font-manrope text-xl font-bold leading-tight">
                  {currentPost.post.title}
                </p>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/70">
                  {currentPost.post.content}
                </p>
              </div>
              <div className="flex w-48 shrink-0 flex-col gap-2">
                <span className="text-sm font-medium text-white/80 self-center ">
                  {formatDistanceToNow(new Date(currentPost.latestCreatedAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
                <Image
                  className="flex aspect-square w-[110px] self-center shrink-0 flex-col gap-2 rounded-2xl border border-neutral-700/50 bg-neutral-800 object-cover"
                  width={100}
                  height={100}
                  src={currentPost.post.imagesUrl[0]}
                  alt={`image du post ${currentPost.post.title}`}
                />
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-white/80">
                {formatDistanceToNow(new Date(currentPost.latestCreatedAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
              <p className="mt-3 font-manrope text-xl font-bold leading-tight">
                {currentPost.post.title}
              </p>
              <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-white/70">
                {currentPost.post.content}
              </p>
            </div>
          )}
        </article>
      ) : null}
    </section>
  );
}
