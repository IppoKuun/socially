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
      <h1 className="">Nouveau Créateur</h1>
      {profiles.map((p) => (
        <Link key={p.id} href={`profile/${p.username}`}>
          <article className="w-full flex flex-row">
            {p.avatarUrl ? (
              <Image
                height={20}
                width={20}
                src={p.avatarUrl}
                alt="photo profile"
              />
            ) : (
              <User2Icon />
            )}
            <div className="flex flex-col">
              <h2 className="">{p.displayname}</h2>
              <h3 className=""> @{p.username} </h3>
              <p className="truncate">{p.bio ?? ""}</p>
            </div>
          </article>
        </Link>
      ))}
    </section>
  );
}
