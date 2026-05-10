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
    <section className="flex flex-col w-full h-full min-h-[150px]">
      <h1 className=" font-manrope text-2xl">{t("profiles.title")}</h1>
      <section className="flex flex-col space-y-3 p-4 mb-5">
        {profiles.map((p) => (
          <Link key={p.id} href={`/profile/${p.username}`}>
            <article className="w-full flex flex-row  bg-white/10 p-4 rounded-xl overflow-hidden">
              <div className="w-[50px] h-[50px] flex-shrink-0">
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
              <div className="flex flex-col w-[70%] ml-4">
                <h2 className="">{p.displayname}</h2>
                <h3 className="text-xs"> @{p.username} </h3>
                <p className="truncate text-xs">{p.bio ?? ""}</p>
              </div>
              <div className="flex flex-col ml-auto items-center justify-center ">
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
