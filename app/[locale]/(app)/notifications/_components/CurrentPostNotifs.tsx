import { Link } from "@/i18n/routing";
import { FollowNotificationType, PostNotificationGroup } from "../page";
import Image from "next/image";
import { User2Icon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import FollowToggleButton from "./FollowToggleButton";

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
  const visibleCommentActors = currentPost?.commentActors.slice(0, 4) ?? [];
  const hiddenCommentActorsCount = Math.max(
    0,
    (currentPost?.commentActors.length ?? 0) - visibleCommentActors.length,
  );
  return mode === "follow" ? (
    <section className="grid min-w-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {followList.map((follow) => {
        const profileHref = follow.actor.username
          ? `/profile/${follow.actor.username}`
          : null;
        const isViewerFollowing =
          follow.actor.relationWhereUserIsFollowed.length > 0;
        const avatar = follow.actor.avatarUrl ? (
          <Image
            src={follow.actor.avatarUrl}
            alt={`Avatar de ${follow.actor.displayname}`}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/60 ring-1 ring-white/10">
            <User2Icon className="size-6" />
          </div>
        );
        const profileContent = (
          <>
            {avatar}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {follow.actor.displayname}
              </p>
              <p className="mt-0.5 truncate text-xs text-white/45">
                @{follow.actor.username ?? "unknown"}
              </p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/68">
                A commencé à vous suivre.
              </p>
            </div>
          </>
        );

        return (
          <article
            key={follow.id}
            className="flex min-h-44 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.95)] transition hover:border-white/16 hover:bg-white/[0.09]"
          >
            {profileHref ? (
              <Link
                href={profileHref}
                className="flex min-w-0 items-start gap-3 transition hover:opacity-90"
              >
                {profileContent}
              </Link>
            ) : (
              <div className="flex min-w-0 items-start gap-3">
                {profileContent}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/58">
                Nouvel abonné
              </span>
              <FollowToggleButton
                username={follow.actor.username}
                initialIsFollowing={isViewerFollowing}
              />
            </div>
          </article>
        );
      })}
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
        <>
          <article className="mt-5 rounded-xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl">
            {currentPost?.post.imagesUrl &&
            currentPost?.post.imagesUrl.length > 0 ? (
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
                    {formatDistanceToNow(
                      new Date(currentPost.latestCreatedAt),
                      {
                        addSuffix: true,
                        locale: fr,
                      },
                    )}
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

          {currentPost.commentActors.length > 0 && (
            <div className="mt-8 flex flex-col text-2xl font-sora font-bold tracking-tight">
              {currentPost.commentActors.length} personne ont commenté votre
              post
              <div className="mt-5 flex flex-row items-center gap-2">
                {visibleCommentActors.map((actor) => (
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

                {hiddenCommentActorsCount > 0 && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white ring-1 ring-white/10">
                    +{hiddenCommentActorsCount}
                  </div>
                )}
              </div>
            </div>
          )}

          <Link
            href={`/post/${currentPost.post.slug}`}
            className="mt-8 inline-flex w-fit items-center justify-center rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-[#111318] shadow-[0_20px_60px_-45px_rgba(0,0,0,0.95)] transition hover:bg-white/90"
          >
            Cliquez pour voir votre post
          </Link>
        </>
      ) : null}
    </section>
  );
}
