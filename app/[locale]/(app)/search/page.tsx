// Page SSR qui orchestra tout les composant, prendre la query en params
// Et mettre composant result//
import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import SearchForm from "./_components/SearchForm";
import SearchResult from "./_components/SearchResult";
import SearchHistory from "./_components/SearchHistory";
import { getQueriesResult } from "@/lib/search/queries";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations("appShell.pages.search");

  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  const { data } = await getQueriesResult(query);

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="flex flex-col">
        <SearchForm query={query} />
        {data ? (
          <SearchResult profiles={data.profiles} posts={data.posts} />
        ) : (
          <SearchHistory history={data.history} />
        )}
      </section>
    </AppPageShell>
  );
}
