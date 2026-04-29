import { Search } from "lucide-react";

import submitSearch from "../_actions/submitSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchFormProps = {
  query?: string;
};

export default function SearchForm({ query = "" }: SearchFormProps) {
  return (
    <form
      action={submitSearch}
      className="flex w-full flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:flex-row mb-5 "
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
        className="h-10 border-white/10 bg-white/[0.04] text-white placeholder:text-white/38"
      />
      <Button
        type="submit"
        className="h-10 shrink-0 rounded-lg bg-white text-[#111318] hover:bg-white/90"
      >
        <Search className="size-4" />
        <span>Search</span>
      </Button>
    </form>
  );
}
