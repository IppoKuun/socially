// Page SSR fetchQuery qui vas faire requete des 20 post les plus like de la category //

import { getPostForCategory } from "@/lib/discover/queries";
import { makeQueryClient } from "@/lib/query-client";
import { Category } from "@prisma/client";
import { notFound } from "next/navigation";
import AppPageShell from "../../_components/app-page-shell";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PostCard from "@/components/post/post-card";
import QueryProvider from "@/components/providers/query-provider";

interface CategoryParams {
  locale: string;
  category: string;
}

interface PageProps {
  params: Promise<CategoryParams>;
}
export default async function DiscoverCategoryPage({ params }: PageProps) {
  const { locale, category } = await params;
  const categoryValue = category.toUpperCase().replaceAll("-", "_") as Category;

  if (!Object.values(Category).includes(categoryValue)) {
    notFound();
  }

  const queryClient = makeQueryClient();

  // Decision produit assumee: une page de categorie Discover est une surface publique
  // de decouverte. Elle affiche les posts de la categorie meme si une relation de
  // blocage existe, contrairement aux feeds personnalises.
  const posts = await queryClient.fetchQuery({
    queryKey: ["category", categoryValue],
    queryFn: () => {
      return getPostForCategory(categoryValue);
    },
  });

  return (
    <>
      <AppPageShell
        title={category}
        description={"Les meuilleurs post de la category"}
        className="max-w-[880px]"
      >
        <QueryProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
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
          </HydrationBoundary>
        </QueryProvider>
      </AppPageShell>
    </>
  );
}
