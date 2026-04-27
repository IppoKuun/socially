// Page SSR fetchQuery qui vas faire requete des 20 post les plus like de la category //

import { getPostForCategory } from "@/lib/discover/queries";
import { makeQueryClient } from "@/lib/query-client";
import { Category } from "@prisma/client";
import { notFound } from "next/navigation";
import AppPageShell from "../../_components/app-page-shell";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PostCard from "@/components/post/post-card";

interface CategoryParams {
  locale: string;
  category: string;
}

interface PageProps {
  params: Promise<CategoryParams>;
}
export default async function DiscoverCategoryPage({ params }: PageProps) {
  const { locale, category } = await params;
  if (!Object.values(Category).includes(category as Category)) {
    notFound();
  }

  const queryClient = makeQueryClient();

  const categoryValue = category;

  const posts = await queryClient.fetchQuery({
    queryKey: ["category", categoryValue],
    queryFn: () => {
      return getPostForCategory(categoryValue as Category);
    },
  });

  return (
    <>
      <AppPageShell
        title={category}
        description={"Les meuilleurs post de la category"}
        className="max-w-[880px]"
      ></AppPageShell>
      {posts.length === 0 ? (
        <p className="">Aucun post pour cette catégories trouvé</p>
      ) : (
        <section className="flex flex-col space-y-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              commentHref={`/post/${post.slug}#post-comment-compose`}
            />
          ))}
        </section>
      )}

      <HydrationBoundary state={dehydrate(queryClient)}></HydrationBoundary>
    </>
  );
}
