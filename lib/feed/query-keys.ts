import type { CommentSort } from "@/lib/feed/shared";

export const feedQueryKeys = {
  forYouInfiniteBase: () => ["feed", "for-you", "infinite"] as const,
  forYouInfinite: (version = 0) =>
    [...feedQueryKeys.forYouInfiniteBase(), version] as const,
  forYouHeadBase: () => ["feed", "for-you", "head"] as const,
  forYouHead: (version = 0) =>
    [...feedQueryKeys.forYouHeadBase(), version] as const,
  postDetail: (slug: string) => ["post", slug, "detail"] as const,
  postComments: (slug: string, sort: CommentSort) =>
    ["post", slug, "comments", sort] as const,
  commentThread: (slug: string, commentId: string) =>
    ["post", slug, "comment", commentId] as const,
};
