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
  selectedPostId?: string;
};

export default function AllPostNotifs({
  postNotificationGroups,
  selectedPostId,
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
    <section className="flex flex-col border-r h-full border-neutral-800 min-w-80 w-full mr-15 ">
      <h1 className="text-2xl mb-5 font-bold">Notifications</h1>
      <section className="flex-1 overflow-y-auto flex flex-col space-y-4 ">
        {postNotificationGroups.length === 0 ? (
          <p className="">Vous navez aucune notifications</p>
        ) : (
          <>
            {postNotificationGroups.map((post) => {
              const isSelected = post.postId === selectedPostId;

              return (
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
                      "flex flex-col justify-between p-4 rounded-xl hover:bg-neutral-800/40 transition-colors cursor-pointer  h-full min-h-[200px] bg-neutral-900/50",
                      post.isUnread ? "bg-white/20" : "bg-white/10",
                      isSelected &&
                        "  shadow-[0_0_15px_rgba(168,85,247,0.15)], ring-3, ring-blue-500. ",
                    )}
                  >
                    <p className="line-clamp-3 leading-relaxed text-[11px] uppercase tracking-wider  bg-neutral-800 p-2 rounded-xs">
                      {post.post.title}
                    </p>
                    <div className="flex flex-col justify-between space-y-1">
                      <div className="flex flex-row gap-2">
                        <Heart size={20} />
                        <p className="text-white/80 text-xs">
                          {post.likeActors.length} Ont aimé votre post
                        </p>
                      </div>
                      <div className="flex flex-row gap-2">
                        <MessageCircle size={20} />
                        <p className="text-white/80 text-xs">
                          {post.commentActors.length} ont répondu
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </>
        )}
      </section>
    </section>
  );
}
