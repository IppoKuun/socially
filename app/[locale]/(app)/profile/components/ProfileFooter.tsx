import PostCard from "@/components/post/post-card";
import { getTranslations } from "next-intl/server";
import type { ProfileData } from "../_actions/getProfile";

type ProfileFooterProps = {
  profile: ProfileData;
};

export default async function ProfileFooter({ profile }: ProfileFooterProps) {
  const t = await getTranslations("profilePublic");

  return (
    <section className="mb-15 mt-6 space-y-4">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h2 className="font-sora text-xl font-semibold tracking-[-0.03em] text-white">
            {t("recentPostsTitle")}
          </h2>
          <p className="mt-1 text-sm text-white/45">
            {t("recentPostsDescription")}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/55">
          {t("recentPostsCount", { count: profile._count.post })}
        </span>
      </div>

      {profile.post.length === 0 ? (
        <p className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-6 text-sm text-white/55">
          {t("recentPostsEmpty")}
        </p>
      ) : (
        <section className="space-y-4">
          {profile.post.map((p) => (
            <PostCard
              variant="profile"
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
