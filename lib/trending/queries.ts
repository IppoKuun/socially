// IA: Next.js Data Cache
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";

import type { FeedAuthor, FeedPost } from "@/lib/feed/shared";
import { myPrisma } from "@/lib/prisma";

export const TRENDING_POSTS_CACHE_TAG = "trending-posts";
export const TRENDING_POST_LIMIT = 10;
export const TRENDING_WINDOW_DAYS = 7;
export const TRENDING_REVALIDATE_SECONDS = 300;

const TRENDING_CANDIDATE_LIMIT = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type TrendingPostCandidate = Omit<FeedPost, "viewer">;

function getTrendingPostSelect() {
  return {
    id: true,
    slug: true,
    title: true,
    content: true,
    createdAt: true,
    moderationStatus: true,
    imagesUrl: true,
    author: {
      select: {
        id: true,
        displayname: true,
        username: true,
        avatarUrl: true,
        isAi: true,
        isPro: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comment: {
          where: {
            deletedAt: null,
            author: {
              deletedAt: null,
            },
          },
        },
      },
    },
  } satisfies Prisma.PostSelect;
}

type TrendingPostRecord = Prisma.PostGetPayload<{
  select: ReturnType<typeof getTrendingPostSelect>;
}>;

function serializeAuthor(author: TrendingPostRecord["author"]): FeedAuthor {
  return {
    id: author.id,
    displayName: author.displayname,
    username: author.username ?? "pending-profile",
    avatarUrl: author.avatarUrl,
    isAi: author.isAi,
    isPro: author.isPro,
  };
}

function serializeTrendingPost(
  post: TrendingPostRecord,
): TrendingPostCandidate {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    moderationStatus: post.moderationStatus,
    images: post.imagesUrl,
    likeCount: post._count.likes,
    commentCount: post._count.comment,
    author: serializeAuthor(post.author),
  };
}

export function getTrendingWindowStart(now = new Date()) {
  return new Date(now.getTime() - TRENDING_WINDOW_DAYS * MS_PER_DAY);
}

async function getTrendingPostCandidatesFromDb() {
  const posts = await myPrisma.post.findMany({
    take: TRENDING_CANDIDATE_LIMIT,
    where: {
      createdAt: {
        gte: getTrendingWindowStart(),
      },
      deletedAt: null,
      likes: {
        // Les post qui ont au moins 1 like. //
        some: {},
      },
      author: {
        deletedAt: null,
      },
    },
    orderBy: [
      {
        likes: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    select: getTrendingPostSelect(),
  });

  return posts.map(serializeTrendingPost);
}

export const getCachedTrendingPostCandidates = unstable_cache(
  getTrendingPostCandidatesFromDb,
  ["trending-posts", "v2"],
  {
    tags: [TRENDING_POSTS_CACHE_TAG],
    revalidate: TRENDING_REVALIDATE_SECONDS,
  },
);

async function getBlockedTrendingAuthorIds(input: {
  viewerId: string;
  authorIds: string[];
}) {
  if (input.authorIds.length === 0) {
    return new Set<string>();
  }

  const blocks = await myPrisma.block.findMany({
    where: {
      OR: [
        {
          blockerId: input.viewerId,
          blockedById: {
            in: input.authorIds,
          },
        },
        {
          blockedById: input.viewerId,
          blockerId: {
            in: input.authorIds,
          },
        },
      ],
    },
    select: {
      blockerId: true,
      blockedById: true,
    },
  });

  return new Set(
    blocks.map((block) =>
      // Retourne un tableau d'ID de sois le bloqué sois la personne qui a bloqué //
      block.blockerId === input.viewerId ? block.blockedById : block.blockerId,
    ),
  );
}

async function getTrendingViewerState(input: {
  viewerId: string;
  postIds: string[];
}) {
  if (input.postIds.length === 0) {
    return {
      likedPostIds: new Set<string>(),
      reportedPostIds: new Set<string>(),
    };
  }

  const [likes, reports] = await Promise.all([
    myPrisma.postLike.findMany({
      where: {
        user_id: input.viewerId,
        post_id: {
          in: input.postIds,
        },
      },
      select: {
        post_id: true,
      },
    }),
    myPrisma.report.findMany({
      where: {
        reporterId: input.viewerId,
        postId: {
          in: input.postIds,
        },
      },
      select: {
        postId: true,
      },
    }),
  ]);

  return {
    likedPostIds: new Set(likes.map((like) => like.post_id)),
    reportedPostIds: new Set(reports.map((report) => report.postId)),
  };
}

export async function getTrendingFeedPostsForViewer(input: {
  candidates: TrendingPostCandidate[];
  viewerId: string;
}) {
  const authorIds = input.candidates.map((post) => post.author.id);
  const blockedAuthorIds = await getBlockedTrendingAuthorIds({
    viewerId: input.viewerId,
    authorIds,
  });

  const visiblePosts = input.candidates
    .filter((post) => !blockedAuthorIds.has(post.author.id))
    .slice(0, TRENDING_POST_LIMIT);

  const viewerState = await getTrendingViewerState({
    viewerId: input.viewerId,
    postIds: visiblePosts.map((post) => post.id),
  });

  return visiblePosts.map(
    (post): FeedPost => ({
      ...post,
      viewer: {
        isOwner: post.author.id === input.viewerId,
        hasLiked: viewerState.likedPostIds.has(post.id),
        hasReported: viewerState.reportedPostIds.has(post.id),
      },
    }),
  );
}
