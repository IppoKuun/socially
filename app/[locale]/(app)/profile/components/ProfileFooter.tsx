import PostCard from "@/components/post/post-card";
import type { ProfileData } from "../_actions/getProfile";

type ProfileFooterProps = {
  profile: ProfileData;
};

export default function ProfileFooter({ profile }: ProfileFooterProps) {
  return (
    <section className="flex flex-col mb-15">
      {profile.post.length === 0 ? (
        <p className="">Aucun post a affiché</p>
      ) : (
        <section className="">
          {profile.post.map((p) => (
            <PostCard
              variant="profil"
              key={p.id}
              post={p}
              commentHref={`/post/${p.slug}#post-comment-compose`}
            />
          ))}
        </section>
      )}
    </section>
  );
}
