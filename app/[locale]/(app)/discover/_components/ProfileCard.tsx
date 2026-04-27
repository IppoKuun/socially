import { DiscoverProfileCandidate } from "@/lib/discover/queries";
import { User2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ProfilCardProps = {
  profiles: DiscoverProfileCandidate[];
};
export default function ProfilCard({ profiles }: ProfilCardProps) {
  return (
    <section className="flex flex-col w-full">
      <h1 className="mb-5 font-manrope text-2xl">Nouveau Créateur</h1>
      {profiles.map((p) => (
        <Link key={p.id} href={`profile/${p.username}`}>
          <article className="w-full flex flex-row ">
            {p.avatarUrl ? (
              <Image
                width={50}
                height={50}
                sizes="50px"
                className="rounded-full object-cover"
                alt="photo_profile"
                src={p.avatarUrl}
              />
            ) : (
              <User2Icon />
            )}
            <div className="flex flex-col ">
              <h2 className="">{p.displayname}</h2>
              <h3 className=""> @{p.username} </h3>
              <p className="truncate">{p.bio ?? ""}</p>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="font-sora text-xl">
                {p._count.relationWhereUserIsFollowed}
              </span>
              <span className="font-light text-xs">Abonné</span>
            </div>
          </article>
        </Link>
      ))}
    </section>
  );
}
