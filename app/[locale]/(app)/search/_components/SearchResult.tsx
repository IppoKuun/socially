import PostCard from "@/components/post/post-card";
import QueryProvider from "@/components/providers/query-provider";
import type { FeedPost } from "@/lib/feed/shared";
import type { SearchProfile } from "@/lib/search/queries";
import { User2Icon } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import SearchFollowButton from "./SearchFollowButton";

type SearchResultProps = {
  profiles: SearchProfile[];
  posts: FeedPost[];
};
export default function SearchResult({ profiles, posts }: SearchResultProps) {
  const hasResults = profiles.length > 0 || posts.length > 0;

  if (!hasResults) {
    return (
      <p className="font-manrope text-xs text-center text-white/70 font-extralight px-8">
        Aucun résultat trouvé.
      </p>
    );
  }

  return (
    <main className="flex flex-col w-full">
      {profiles.length > 0 && (
        <>
          <div className="flex items-end justify-between">
            <h1 className="font-manrope text-2xl">Profiles</h1>
            <span className="text-sm text-white/50">
              {profiles.length} résultats
            </span>
          </div>{" "}
          <section className="mt-5 grid w-full grid-cols-2 gap-4 md:grid-cols-3">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="flex min-h-48 flex-col rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 transition duration-200 hover:border-white/25 hover:bg-white/[0.06]"
              >
                {profile.username ? (
                  <Link
                    href={`/profile/${profile.username}`}
                    className="flex flex-row items-center relative"
                  >
                    {profile.viewer.isBlocked && (
                      <span className="shrink-0 rounded-full border border-red-400/20 bg-red-400/10 px-2 py-1 text-[11px] font-medium text-red-200">
                        Bloqué
                      </span>
                    )}
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt="photo de profil"
                        width={50}
                        height={50}
                        className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">
                        <User2Icon className="size-5" />
                      </div>
                    )}
                    <div className="flex flex-col ml-2 items-start min-w-0 flex-1">
                      <p className="truncate font-manrope text-sm font-semibold text-white">
                        {profile.displayname}
                      </p>
                      <p className="truncate text-xs text-white/45">
                        @{profile.username}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex flex-row items-center relative">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt="photo de profil"
                        width={50}
                        height={50}
                        className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">
                        <User2Icon className="size-5" />
                      </div>
                    )}
                    <div className="flex flex-col ml-2 items-start min-w-0 flex-1">
                      <p className="truncate font-manrope text-sm font-semibold text-white">
                        {profile.displayname}
                      </p>
                      <p className="truncate text-xs text-white/45">
                        @unknown
                      </p>
                    </div>
                  </div>
                )}

                <p className="mt-4 min-h-10 text-sm leading-6 text-white/60 line-clamp-2">
                  {profile.bio || "Aucune bio pour le moment."}
                </p>
                <div className="mt-auto pt-4">
                  <SearchFollowButton
                    username={profile.username}
                    initialIsFollowing={profile.viewer.isFollower}
                    disabled={
                      profile.viewer.isOwner || profile.viewer.isBlocked
                    }
                  />
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {posts.length > 0 && (
        <section className="flex flex-col gap-4 mt-5">
          <div className="flex items-end justify-between">
            <h1 className="font-manrope text-2xl">Posts</h1>
            <span className="text-sm text-white/50">
              {posts.length} résultats
            </span>
          </div>

          <QueryProvider>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                commentHref={`/post/${post.slug}#post-comment-compose`}
              />
            ))}
          </QueryProvider>
        </section>
      )}
    </main>
  );
}
