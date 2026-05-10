// Page SSR qui orchestra tout les composant, prendre la query en params
// Et mettre composant result//
import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import SearchForm from "./_components/SearchForm";
import SearchResult from "./_components/SearchResult";
import SearchHistory from "./_components/SearchHistory";
import { getSession } from "@/lib/authSession";
import { getQueriesResult, getViewerHistory } from "@/lib/search/queries";
import { myPrisma } from "@/lib/prisma";
import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations("appShell.pages.search");
  const session = await getSession();
  const isAuthenticated = Boolean(session);

  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  if (query) {
    const { data } = await getQueriesResult(query);
    return (
      // Decision UI: les resultats de recherche avec query sont volontairement
      // exclus de AppPageShell pour avoir une surface plus directe et dediee.
      <main className="">
        <SearchForm query={query} />
        <SearchResult
          profiles={data.profiles}
          posts={data.posts}
          isAuthenticated={isAuthenticated}
        />
      </main>
    );
  }

  const user = await myPrisma.userProfile.findFirst({
    where: { userId: session?.user.id, deletedAt: null },
    select: { id: true },
  });

  const history = user ? await getViewerHistory(user.id) : [];

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="flex flex-col  ">
        <SearchForm query={query} />
        {user ? (
          <SearchHistory history={history} />
        ) : (
          <p className="font-manrope text-xs text-center text-white/70 font-extralight px-8">
            {t("authRequiredHistory")}
          </p>
        )}
      </section>
    </AppPageShell>
  );
}
