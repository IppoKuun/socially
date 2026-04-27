import { DiscoverPostCandidate } from "@/lib/discover/queries";
import { User2Icon } from "lucide-react";
import Image from "next/image";

type MainPostCardProps = {
  mainPost: DiscoverPostCandidate;
};

export default function MainPostCard({ mainPost }: MainPostCardProps) {
  const backgroundImage = mainPost.imagesUrl[0]
    ? `url(${mainPost.imagesUrl[0]})`
    : "linear-gradient(135deg, #1f2937, #111827)";

  return (
    <section
      className="flex flex-col"
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

      <div className="relative z-10">
        <h1 className="font-bold">{mainPost.title}</h1>
        <div className="flex flex-row">
          {mainPost.author.avatarUrl ? (
            <Image
              width={10}
              height={10}
              alt="photo_profile"
              src={mainPost.author.avatarUrl}
            ></Image>
          ) : (
            <User2Icon />
          )}
          <div className="flex flex-col items-start">
            @{mainPost.author.username}
          </div>
          <span className="">Posté par</span>
        </div>
      </div>
    </section>
  );
}
