// Page SSR fetchQuery qui vas faire requete des 20 post les plus like de la category //

import { getPostForCategory } from "@/lib/discover/queries";
import {
  getCategoryFromSlug,
  getCategoryLabel,
  getCategorySlug,
} from "@/lib/discover/categories";
import { makeQueryClient } from "@/lib/query-client";
import { notFound } from "next/navigation";
import AppPageShell from "../../_components/app-page-shell";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PostCard from "@/components/post/post-card";
import QueryProvider from "@/components/providers/query-provider";
import { getSession } from "@/lib/authSession";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import {
  createPublicPageMetadata,
  getAbsoluteUrl,
  noIndexMetadata,
} from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";

interface CategoryParams {
  locale: string;
  category: string;
}

interface PageProps {
  params: Promise<CategoryParams>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const categoryValue = getCategoryFromSlug(category);

  if (!categoryValue) {
    return noIndexMetadata;
  }

  const label = getCategoryLabel(categoryValue);
  const t = await getTranslations({ locale, namespace: "seo.category" });

  return createPublicPageMetadata({
    title: t("title", { category: label }),
    description: t("description", { category: label.toLowerCase() }),
    locale,
    pathname: `/discover/${getCategorySlug(categoryValue)}`,
  });
}

export default async function DiscoverCategoryPage({ params }: PageProps) {
  const { locale, category } = await params;
  const session = await getSession();
  const isAuthenticated = Boolean(session);
  const categoryValue = getCategoryFromSlug(category);

  if (!categoryValue) {
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
  const categoryLabel = getCategoryLabel(categoryValue);
  const categoryPath = `/discover/${getCategorySlug(categoryValue)}`;
  const tSeo = await getTranslations({ locale, namespace: "seo.category" });
  const pageDescription = tSeo("description", {
    category: categoryLabel.toLowerCase(),
  });
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: tSeo("title", { category: categoryLabel }),
    description: pageDescription,
    url: getAbsoluteUrl(locale, categoryPath),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getAbsoluteUrl(locale, `/post/${post.slug}`),
        name: post.title,
      })),
    },
  };

  return (
    <>
      <JsonLd data={categoryJsonLd} />
      <AppPageShell
        title={categoryLabel}
        description={pageDescription}
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
                    isAuthenticated={isAuthenticated}
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
