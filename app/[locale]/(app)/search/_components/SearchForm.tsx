import { getTranslations } from "next-intl/server";

import submitSearch from "../_actions/submitSearch";
import { Input } from "@/components/ui/input";

type SearchFormProps = {
  query?: string;
};

export default async function SearchForm({ query = "" }: SearchFormProps) {
  const t = await getTranslations("appShell.pages.search.form");

  return (
    <form
      action={submitSearch}
      className="flex w-full flex-col gap-3  max-w-4xl mx-auto p-5 sm:flex-row mb-5 "
    >
      {/* Decision UI: pas de bouton submit visible ici.
          La recherche se valide avec Entree pour garder une barre plus simple,
          au prix d'une affordance un peu moins explicite. */}
      <label className="sr-only" htmlFor="search-query">
        {t("label")}
      </label>
      <Input
        id="search-query"
        name="query"
        type="search"
        minLength={2}
        maxLength={50}
        required
        autoComplete="off"
        defaultValue={query}
        placeholder={t("placeholder")}
        className="h-16 px-4 border-white/10 bg-white/[0.04] rounded-2xl text-white placeholder:text-white/38"
      />
    </form>
  );
}
