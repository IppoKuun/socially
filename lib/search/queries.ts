import type { Prisma } from "@prisma/client";

import { getSession } from "../authSession";
import type { FeedAuthor, FeedPost } from "../feed/shared";
import { myError } from "../myError";
import { myPrisma } from "../prisma";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 50;

export type SearchProfile = {
  id: string;
  username: string | null;
  displayname: string;
  avatarUrl: string | null;
  bio: string | null;
  isAi: boolean;
  isPro: boolean;
  viewer: {
    isOwner: boolean;
    isFollower: boolean;
    isBlocked: boolean;
  };
};

function getEmptySearchResult(): SearchResult {
  return {
    data: {
      profiles: [],
      posts: [],
    },
  };
}

function normalizeSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_LENGTH);
}

export type SearchResult = {
  data: {
    profiles: SearchProfile[];
    posts: FeedPost[];
  };
};

function getVisibleAuthorWhere(viewerId: string): Prisma.UserProfileWhereInput {
  return {
    deletedAt: null,
    blocked: {
      none: {
        blockerId: viewerId,
      },
    },
    blocker: {
      none: {
        blockedById: viewerId,
      },
    },
  };
}

function getSearchPostSelect(viewerId: string) {
  return {
    id: true,
    title: true,
    content: true,
    slug: true,
    createdAt: true,
    imagesUrl: true,
    moderationStatus: true,
    userId: true,
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
    likes: {
      where: { user_id: viewerId },
      select: { id: true },
    },
    reported: {
      where: { reporterId: viewerId },
      select: { id: true },
    },
    _count: {
      select: {
        likes: true,
        comment: {
          where: {
            deletedAt: null,
            author: getVisibleAuthorWhere(viewerId),
          },
        },
      },
    },
  } satisfies Prisma.PostSelect;
}

type SearchPostRecord = Prisma.PostGetPayload<{
  select: ReturnType<typeof getSearchPostSelect>;
}>;

function serializeSearchAuthor(author: SearchPostRecord["author"]): FeedAuthor {
  return {
    id: author.id,
    displayName: author.displayname,
    username: author.username ?? "pending-profile",
    avatarUrl: author.avatarUrl,
    isAi: author.isAi,
    isPro: author.isPro,
  };
}

function serializeSearchPost(
  post: SearchPostRecord,
  viewerId: string,
): FeedPost {
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
    author: serializeSearchAuthor(post.author),
    viewer: {
      isOwner: post.userId === viewerId,
      hasLiked: post.likes.length > 0,
      hasReported: post.reported.length > 0,
    },
  };
}

export async function getQueriesResult(queries: string): Promise<SearchResult> {
  const normalizedQuery = normalizeSearchQuery(queries);

  if (normalizedQuery.length < SEARCH_MIN_LENGTH) {
    return getEmptySearchResult();
  }

  const session = await getSession();

  if (!session) {
    throw new myError("Unauthentificated");
  }
  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      relationWhereUserIsFollower: {
        select: { followedProfileId: true },
      },
      blocked: { select: { blockerId: true } },
      blocker: { select: { blockedById: true } },
    },
  });

  if (!user) {
    throw new myError("User not found");
  }
  const [profiles, posts] = await Promise.all([
    // Decision produit: les profils bloques restent visibles en recherche.
    // Le frontend les marque comme bloques pour expliquer a l'utilisateur
    // pourquoi les actions de suivi/navigation peuvent etre limitees.
    myPrisma.userProfile.findMany({
      where: {
        deletedAt: null,
        OR: [
          { username: { contains: normalizedQuery, mode: "insensitive" } },
          { displayname: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayname: true,
        avatarUrl: true,
        bio: true,
        isAi: true,
        isPro: true,
      },
      take: 5,
    }),

    myPrisma.post.findMany({
      where: {
        deletedAt: null,
        author: getVisibleAuthorWhere(user.id),
        OR: [
          { title: { contains: normalizedQuery, mode: "insensitive" } },
          { content: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
      select: getSearchPostSelect(user.id),
      take: 10,
    }),
  ]);

  const profilesThatBlockedViewer = new Set(
    user.blocked.map((block) => block.blockerId),
  );
  const profilesBlockedByViewer = new Set(
    user.blocker.map((block) => block.blockedById),
  );

  const viewerFollowId = new Set(
    user?.relationWhereUserIsFollower.map(
      (profile) => profile.followedProfileId,
    ),
  );

  return {
    data: {
      profiles: profiles.map((p) => ({
        ...p,
        viewer: {
          isOwner: p.id === user?.id,
          isFollower: viewerFollowId.has(p.id),
          isBlocked:
            profilesBlockedByViewer.has(p.id) ||
            profilesThatBlockedViewer.has(p.id) ||
            false,
        },
      })),
      posts: posts.map((post) => serializeSearchPost(post, user.id)),
    },
  };
}

export async function getViewerHistory(viewerId: string) {
  const history = await myPrisma.searchHistory.findMany({
    where: { userId: viewerId },
    select: { query: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return history.map((item) => item.query);
}
