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
    <section className="flex flex-col max-h-screen max-w-80 w-full border-r border-neutral-800 pr-6">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl mb-5 font-bold">Notifications</h1>
      </div>

      <section className="flex-1 mt-5 overflow-y-auto  flex flex-col space-y-4 p-1">
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
                      "flex flex-col justify-between p-4 relative rounded-xl hover:bg-neutral-800/40 transition-colors cursor-pointer  h-full bg-neutral-900/50",
                      post.isUnread
                        ? " bg-white/10 min-h-[250px] pt-12"
                        : "bg-white/3 text-white/30 min-h-[200px] ",
                      isSelected &&
                        "ring-1 ring-blue-400  shadow-[0_0_24px_rgba(255,255,255,0.12)]",
                    )}
                  >
                    {post.isUnread && (
                      <span className="bg-blue-600 font-sora p-2 absolute top-2 right-2 rounded-3xl text-xs text-white/80">
                        Nouveau
                      </span>
                    )}
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <p
                        className={cn(
                          "line-clamp-2 text-[11px] font-semibold uppercase leading-snug tracking-wider text-white",
                          !post.isUnread && "text-white/30",
                        )}
                      >
                        {post.post.title}
                      </p>
                      {post.post.content ? (
                        <p
                          className={cn(
                            "mt-2 line-clamp-3 text-xs leading-relaxed text-white/60",
                            !post.isUnread && "text-white/30",
                          )}
                        >
                          {post.post.content}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col mt-5 justify-between space-y-1">
                      <div className="flex flex-row gap-2">
                        <Heart size={20} />
                        <p className="text-xs">
                          {post.likeActors.length} Ont aimé votre post
                        </p>
                      </div>
                      <div className="flex flex-row gap-2">
                        <MessageCircle size={20} />
                        <p className=" text-xs">
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
