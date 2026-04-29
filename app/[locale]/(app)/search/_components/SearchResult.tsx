import type { FeedPost } from "@/lib/feed/shared";
import type { SearchProfile } from "@/lib/search/queries";

type SearchResultProps = {
  profiles: SearchProfile[];
  posts: FeedPost[];
};
export default function SearchResult({ profiles, posts }: SearchResultProps) {
  void profiles;
  void posts;

  return <main className=""></main>;
}
