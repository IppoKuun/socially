import { FeedPost } from "@/lib/feed/shared";

type SearchResultProps = {
  profiles: string[];
  posts: FeedPost[];
};
export default function SearchResult({ profiles, posts }: SearchResultProps) {
  return <main className=""></main>;
}
