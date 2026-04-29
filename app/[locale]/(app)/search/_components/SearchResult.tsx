import { Button } from "@/components/ui/button";
import type { FeedPost } from "@/lib/feed/shared";
import type { SearchProfile } from "@/lib/search/queries";
import { User2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    <main className="flex flex col">
      {profiles.length > 0 ? (
        <>
          <h1 className="text-2xl font-manrope">Profiles</h1>
          <span className="">{`${profiles.length} résultats`}</span>
          <section className="grid grid-col-2">
            {profiles.map((profile) => (
              <Link key={profile.id} href={`profile/${profile.username}`}>
                <article className="flex flex-col">
                  <div className="flex flex-row relative">
                    {profile.viewer.isBlocked && (
                      <span className="absolute top-0 right-3">
                        Ce profil est bloqué
                      </span>
                    )}
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt="photo de profil"
                        width={50}
                        height={50}
                      />
                    ) : (
                      <div className="">
                        <User2Icon />
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <p className="">{profile.displayname}</p>
                      <p className="">@{profile.username}</p>
                    </div>
                  </div>
                  <p className=" text-xs text-white/65 line-clamp-2">
                    {profile.bio}
                  </p>
                </article>
              </Link>
            ))}
          </section>
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
