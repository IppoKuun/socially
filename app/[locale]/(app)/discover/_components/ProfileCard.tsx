import { Link } from "@/i18n/routing";
import { DiscoverProfileCandidate } from "@/lib/discover/queries";
import { User2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type ProfilCardProps = {
  profiles: DiscoverProfileCandidate[];
};
export default function ProfilCard({ profiles }: ProfilCardProps) {
  const t = useTranslations("appShell.pages.discover");

  return (
    <section className="flex h-full min-h-[150px] w-full min-w-0 flex-col">
      <h1 className=" font-manrope text-2xl">{t("profiles.title")}</h1>
      <section className="mb-5 flex min-w-0 flex-col space-y-3 py-4 sm:p-4">
        {profiles.map((p) => (
          <Link key={p.id} href={`/profile/${p.username}`} className="min-w-0">
            <article className="flex w-full min-w-0 flex-row items-center gap-3 overflow-hidden rounded-xl bg-white/10 p-4">
              <div className="h-[50px] w-[50px] flex-shrink-0">
                {p.avatarUrl ? (
                  <Image
                    width={50}
                    height={50}
                    sizes="50px"
                    className="rounded-full object-cover"
                    alt={t("profileAvatarAlt", { name: p.displayname })}
                    src={p.avatarUrl}
                  />
                ) : (
                  <div
                    className=" w-full h-full bg-white/5 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <User2Icon size={24} />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="truncate">{p.displayname}</h2>
                <h3 className="truncate text-xs"> @{p.username} </h3>
                <p className="truncate text-xs">{p.bio ?? ""}</p>
              </div>
              <div className="ml-auto flex shrink-0 flex-col items-center justify-center">
                <span className="font-sora text-xl">
                  {p._count.relationWhereUserIsFollowed}
                </span>
                <span className="font-light text-xs">
                  {t("profiles.followers", {
                    count: p._count.relationWhereUserIsFollowed,
                  })}
                </span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </section>
  );
}
