"use client";
import { Link, usePathname } from "@/i18n/routing";
import { PostNotificationGroup } from "../page";
import { Heart, MessageCircle } from "lucide-react";
import { useTransition } from "react";
import { markPostNotificationsAsRead } from "../_actions/readNotifs";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type AllPostNotifsProps = {
  postNotificationGroups: PostNotificationGroup[];
};

export default function AllPostNotifs({
  postNotificationGroups,
}: AllPostNotifsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();

  function handleNotificationClick(postId: string) {
    if (isPending) return;
    const params = new URLSearchParams();

    startTransition(async () => {
      try {
        await markPostNotificationsAsRead(postId);
        params.set("postId", postId);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      } catch {
        console.error("Impossible de marqué la notif comme read");
      }
    });
  }
  return (
    <section className="">
      <h1 className="">Notifications</h1>
      <section className="">
        {postNotificationGroups.length === 0 ? (
          <p className="">Vous navez aucune notifications</p>
        ) : (
          <>
            {postNotificationGroups.map((post) => (
              <Link
                // Ici je fais expès de mettre un lien qui vas etre directement cancel par le e.preventdefault
                // Le vrai redirect sera celui de router.push
                // La raison pour laquelle ont peut pas utilisez Link pour naviguez est qu'on doit d'abord faire une actions async puis ensuite redirect
                // Ducoup Link est ici juste pour la sémantique et accessibilitées //
                href={`/notifications?postId=${post.postId}`}
                key={post.postId}
                onClick={async (event) => {
                  event.preventDefault();
                  handleNotificationClick(post.postId);
                }}
              >
                <article
                  className={cn(
                    "flex flex-col",
                    post.isUnread ? "bg-white/60" : "",
                  )}
                >
                  <p className="line-clamp-3 text-xs truncate">
                    {post.post.title}
                  </p>
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-row">
                      <Heart />
                      <p className="">
                        {post.likeActors.length} Ont aimé votre post
                      </p>
                    </div>
                    <div className="flex flex-row">
                      <MessageCircle />
                      <p className="">
                        {post.commentActors.length} ont répondu
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </>
        )}
      </section>
    </section>
  );
}
