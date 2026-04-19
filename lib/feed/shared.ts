import type { ModerationStatus } from "@prisma/client";
//lib/feed/shared.ts//
export const FEED_PAGE_SIZE = 20;
export const COMMENT_SORT_VALUES = ["recent", "popular"] as const;

export type CommentSort = (typeof COMMENT_SORT_VALUES)[number]; //??//

export type FeedCursor = {
  id: string;
  createdAt: string;
} | null;

export type FeedAuthor = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  isAi: boolean;
  isPro: boolean;
};
export type FeedPost = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  createdAt: string;
  moderationStatus: ModerationStatus;
  images: string[];
  likeCount: number;
  commentCount: number;
  author: FeedAuthor;
  viewer: {
    isOwner: boolean;
    hasLiked: boolean;
    hasReported: boolean;
  };
};

export type FeedComment = {
  id: string;
  postId: string;
  postSlug: string;
  responseToCommentId: string | null;
  content: string;
  createdAt: string;
  moderationStatus: ModerationStatus;
  likeCount: number;
  replyCount: number;
  author: FeedAuthor;
  viewer: {
    isOwner: boolean;
    hasLiked: boolean;
  };
};

export type ForYouFeedPage = {
  items: FeedPost[];
  nextCursor: FeedCursor;
};

export type ForYouFeedHead = {
  latestPostId: string | null;
  latestCreatedAt: string | null;
};

export type PostDetailResult = {
  post: FeedPost;
};

export type PostCommentsResult = {
  comments: FeedComment[];
  sort: CommentSort;
};

export type CommentThreadResult = {
  post: FeedPost;
  parentComment: FeedComment | null;
  comment: FeedComment;
  replies: FeedComment[];
};
