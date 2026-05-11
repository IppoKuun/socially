import { Link } from "@/i18n/routing";
import { DiscoverPostCandidate } from "@/lib/discover/queries";
import { User2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type MainPostCardProps = {
  mainPost: DiscoverPostCandidate | null;
};

export default function MainPostCard({ mainPost }: MainPostCardProps) {
  const t = useTranslations("appShell.pages.discover");

  if (!mainPost) {
    return <p className="">{t("mainPost.empty")}</p>;
  }

  const hasImage = Boolean(mainPost.imagesUrl[0]);

  const backgroundImage = mainPost.imagesUrl[0]
    ? `url(${mainPost.imagesUrl[0]})`
    : "linear-gradient(135deg, #1f2937, #111827)";

  return (
    <Link href={`/post/${mainPost.slug}`} className="block min-w-0">
      <section
        className="relative flex h-[45svh] min-h-[340px] min-w-0 flex-col justify-end overflow-hidden rounded-lg p-4"
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

        <div className="relative z-10 min-w-0">
          {!hasImage && mainPost.content ? (
            <p className="mb-4 line-clamp-3 max-w-xl text-sm leading-6 text-white/70">
              {mainPost.content}
            </p>
          ) : null}

          <h1 className="break-words font-manrope text-2xl font-bold leading-tight tracking-wide sm:text-4xl">
            {mainPost.title}
          </h1>
          <div className="flex min-w-0 flex-row gap-3">
            {mainPost.author.avatarUrl ? (
              <Image
                width={50}
                height={50}
                sizes="50px"
                className="rounded-full object-cover"
                alt={t("profileAvatarAlt", {
                  name: mainPost.author.displayname,
                })}
                src={mainPost.author.avatarUrl}
              ></Image>
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white"
                aria-hidden="true"
              >
                <User2Icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium font-light">
                @{mainPost.author.username}
              </p>
              <span className="text-xs font-extralight ">
                {t("mainPost.postedBy")}
              </span>
            </div>
          </div>
        </div>
      </section>
    </Link>
  );
}
