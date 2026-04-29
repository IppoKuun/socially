import { Link } from "@/i18n/routing";
import { DiscoverPostCandidate } from "@/lib/discover/queries";
import { User2Icon } from "lucide-react";
import Image from "next/image";

type MainPostCardProps = {
  mainPost: DiscoverPostCandidate | null;
};

export default function MainPostCard({ mainPost }: MainPostCardProps) {
  if (!mainPost) {
    return <p className="">Aucun post trouvé</p>;
  }

  const hasImage = Boolean(mainPost.imagesUrl[0]);

  const backgroundImage = mainPost.imagesUrl[0]
    ? `url(${mainPost.imagesUrl[0]})`
    : "linear-gradient(135deg, #1f2937, #111827)";

  return (
    <Link href={`/post/${mainPost.slug}`} className="block">
      <section
        className="flex relative flex-col rounded-lg justify-end min-h-[340px] p-4 h-[45svh] overflow-hidden"
        style={
          backgroundImage
            ? {
                backgroundImage,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

        <div className="relative z-10 ">
          {!hasImage && mainPost.content ? (
            <p className="mb-4 line-clamp-3 max-w-xl text-sm leading-6 text-white/70">
              {mainPost.content}
            </p>
          ) : null}

          <h1 className="font-bold text-4xl leading-tight tracking-wide font-manrope ">
            {mainPost.title}
          </h1>
          <div className="flex flex-row gap-3">
            {mainPost.author.avatarUrl ? (
              <Image
                width={50}
                height={50}
                sizes="50px"
                className="rounded-full object-cover"
                alt="photo_profile"
                src={mainPost.author.avatarUrl}
              ></Image>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white">
                <User2Icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium font-light">
                @{mainPost.author.username}
              </p>
              <span className="text-xs font-extralight ">Posté par</span>
            </div>
          </div>
        </div>
      </section>
    </Link>
  );
}
