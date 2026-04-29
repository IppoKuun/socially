import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";

type SearchHistoryProps = {
  history: string[];
};
export default async function SearchHistory({ history }: SearchHistoryProps) {
  const t = await getTranslations("appShell.pages.search.history");

  return (
    <main className="flex flex-col">
      {history.length === 0 ? (
        <p className="font-manrope text-xs text-center text-white/70 font-extralight px-8">
          {t("empty")}
        </p>
      ) : (
        <section className="flex flex-col">
          <h1 className="mb-5">{t("title")}</h1>
          {history.map((h) => (
            <Link key={h} href={`/search?q=${encodeURIComponent(h)}`}>
              <article className=" border border-white/10 p-4 rounded hover:bg-white/5 ">
                <p className="text-white/70 font-mono">{h}</p>
              </article>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
