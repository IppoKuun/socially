import Link from "next/link";

type SearchHistoryProps = {
  history: string[];
};
export default function SearchHistory({ history }: SearchHistoryProps) {
  return (
    <main className="flex flex-col">
      {history.length === 0 ? (
        <p className="">
          Aucun historique de sauvergardez faitent votes premiere recherche
        </p>
      ) : (
        <section className="">
          {history.map((h) => (
            <Link key={h} href={`search?q=${h}`}>
              <article className="">
                <p className="">{h}</p>
              </article>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
