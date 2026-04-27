"use client";
import { Link } from "@/i18n/routing";
import { DiscoverPostCandidate } from "@/lib/discover/queries";
import { Heart, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

type discussionProps = {
  discussionPost: DiscoverPostCandidate[];
};

export default function DiscussionPostCard({
  discussionPost,
}: discussionProps) {
  const router = useRouter();

  return (
    <section className="flex flex-col w-full">
      <h1 className="font-manrope text-2xl mb-5">Discussion intéréssantes</h1>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {discussionPost.map((post) => (
          <Link key={post.id} href={`post/${post.slug}`}>
            <article
              className="flex flex-col bg-white/8  justify-center rounded-lg p-4"
              key={post.id}
            >
              <h2 className="font-sora mb-2">{post.title}</h2>
              <p className="line-clamp-3 text-white/70 text-xs">
                {post.content}
              </p>
              <div className="flex flex-row gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 " />
                  <span className="text-xs font-extralight">
                    {post._count.likes} Likes
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-extralight">
                    {post._count.comment} Commentaires
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </section>
  );
}
