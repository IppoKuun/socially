"use server";
//app/action/feed/shared.ts//

import {
  getCommentThreadQuery,
  getForYouFeedHeadQuery,
  getForYouFeedPageQuery,
  getPostCommentsQuery,
  getPostDetailQuery,
  getFollowingPage,
  getFollowingFeedHeadQuery,
} from "@/lib/feed/queries";
import type { CommentSort, FeedCursor } from "@/lib/feed/shared";

export async function readForYouFeedPage(input?: {
  cursor?: FeedCursor;
  limit?: number;
}) {
  return getForYouFeedPageQuery(input);
}

export async function readForFollowingPage(cursor: FeedCursor) {
  return getFollowingPage(cursor);
}

export async function readFollowingHead() {
  return getFollowingFeedHeadQuery();
}

export async function readForYouFeedHead() {
  return getForYouFeedHeadQuery();
}

export async function readPostDetail(slug: string) {
  return getPostDetailQuery(slug);
}

export async function readPostComments(input: {
  slug: string;
  sort: CommentSort;
}) {
  return getPostCommentsQuery(input);
}

export async function readCommentThread(input: {
  slug: string;
  commentId: string;
}) {
  return getCommentThreadQuery(input);
}
