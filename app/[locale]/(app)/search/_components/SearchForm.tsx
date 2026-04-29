import submitSearch from "../_actions/submitSearch";
import { Input } from "@/components/ui/input";

type SearchFormProps = {
  query?: string;
};

export default function SearchForm({ query = "" }: SearchFormProps) {
  return (
    <form
      action={submitSearch}
      className="flex w-full flex-col gap-3  max-w-4xl mx-auto p-5 sm:flex-row mb-5 "
    >
      <label className="sr-only" htmlFor="search-query">
        Search
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
        placeholder="Search profiles and posts"
        className="h-16 px-4 border-white/10 bg-white/[0.04] rounded-2xl text-white placeholder:text-white/38"
      />
    </form>
  );
}
