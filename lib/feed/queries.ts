"use server";
//lib/feed/queries.ts//

import type { Prisma } from "@prisma/client";

import { getSession } from "@/lib/authSession";
import { FEED_PAGE_SIZE } from "@/lib/feed/shared";
import type {
  CommentSort,
  CommentThreadResult,
  FeedAuthor,
  FeedComment,
  FeedCursor,
  FeedPost,
  ForYouFeedHead,
  ForYouFeedPage,
  PostCommentsResult,
  PostDetailResult,
} from "@/lib/feed/shared";
import { myPrisma } from "@/lib/prisma";

type ViewerProfile = {
  id: string;
};

const ANONYMOUS_VIEWER_ID = "__anonymous_viewer__";

// Ces 2 fonctions sont la pour filtrer le contenu qu'on vas voir dans notre feed
// Ils vont etre appellée lors de requete prisma avec un spread Operator //
// Where Input dans les fonctions sont utile, pour l'autocompletion et surtout
// Pour avoir les bonnes propriété //
function getVisibleAuthorWhere(
  viewerId?: string | null,
): Prisma.UserProfileWhereInput {
  return {
    deletedAt: null,
    ...(viewerId
      ? {
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
        }
      : {}),
  };
}

function getVisiblePostWhere(viewerId?: string | null): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    moderationStatus: { not: "UNSAFE" },
    author: getVisibleAuthorWhere(viewerId),
  };
}

function getPostDetailWhere(viewerId?: string | null): Prisma.PostWhereInput {
  return {
    moderationStatus: { not: "UNSAFE" },
    deletedAt: null,
    author: getVisibleAuthorWhere(viewerId),
  };
}

function getVisiblePostWhereFollowingFeed(
  viewerId: string,
): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    moderationStatus: { not: "UNSAFE" },
    author: {
      ...getVisibleAuthorWhere(viewerId),
      relationWhereUserIsFollower: { some: { followerProfileId: viewerId } },
    },
  };
}

async function getViewerProfile(): Promise<ViewerProfile | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });
}

function getPostSelect(viewerId?: string | null) {
  const safeViewerId = viewerId ?? ANONYMOUS_VIEWER_ID;

  return {
    id: true,
    slug: true,
    title: true,
    content: true,
    createdAt: true,
    deletedAt: true,
    moderationStatus: true,
    imagesUrl: true,
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
      where: { user_id: safeViewerId },
      select: { id: true },
    },
    reported: {
      // Ont veut juste savoir si user a Liker/Reported, pas User lui meme //
      where: { reporterId: safeViewerId },
      select: { id: true },
    },
    // Ont vas prendre tout le nombre total de Likes/Comment //
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
    // Satisfies veut dire : IL faut que le type de l'objets qu'on return sois similaire a celui de PostSelect
    // ça Permet de nour protégé des erreurs //
  } satisfies Prisma.PostSelect;
}

function getCommentSelect(viewerId?: string | null) {
  const safeViewerId = viewerId ?? ANONYMOUS_VIEWER_ID;

  return {
    id: true,
    deletedAt: true,
    postId: true,
    responseToCommentId: true,
    content: true,
    createdAt: true,
    moderationStatus: true,
    authorId: true,
    post: {
      select: {
        slug: true,
      },
    },
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
    Likes: {
      where: { user_id: safeViewerId },
      select: { id: true },
    },
    _count: {
      select: {
        Likes: true,
        replies: {
          where: {
            deletedAt: null,
            author: getVisibleAuthorWhere(viewerId),
          },
        },
      },
    },
  } satisfies Prisma.CommentSelect;
}

// Type qui reflète exactement ce que Prisma retourne pour ce modèle,
// en fonction des champs sélectionnés dans getPostSelect.
// Si le schema change, ce type se met à jour automatiquement.
type PostRecord = Prisma.PostGetPayload<{
  select: ReturnType<typeof getPostSelect>;
}>;

type CommentRecord = Prisma.CommentGetPayload<{
  select: ReturnType<typeof getCommentSelect>;
}>;

function serializeAuthor(author: {
  id: string;
  displayname: string;
  username: string | null;
  avatarUrl: string | null;
  isAi: boolean;
  isPro: boolean;
}): FeedAuthor {
  return {
    id: author.id,
    displayName: author.displayname,
    username: author.username ?? "pending-profile",
    avatarUrl: author.avatarUrl,
    isAi: author.isAi,
    isPro: author.isPro,
  };
}

function serializePost(post: PostRecord, viewerId?: string | null): FeedPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    // Conversion de Date pour User //
    createdAt: post.createdAt.toISOString(),
    deletedAt: post.deletedAt?.toISOString() ?? null,
    moderationStatus: post.moderationStatus,
    images: post.imagesUrl,
    likeCount: post._count.likes,
    commentCount: post._count.comment,
    author: serializeAuthor(post.author),
    viewer: {
      isOwner: Boolean(viewerId && post.userId === viewerId),
      hasLiked: Boolean(viewerId && post.likes.length > 0),
      hasReported: Boolean(viewerId && post.reported.length > 0),
    },
  };
}

function serializeComment(
  comment: CommentRecord,
  viewerId?: string | null,
): FeedComment {
  return {
    id: comment.id,
    postId: comment.postId,
    postSlug: comment.post.slug,
    responseToCommentId: comment.responseToCommentId,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    moderationStatus: comment.moderationStatus,
    likeCount: comment._count.Likes,
    replyCount: comment._count.replies,
    author: serializeAuthor(comment.author),
    viewer: {
      isOwner: Boolean(viewerId && comment.authorId === viewerId),
      hasLiked: Boolean(viewerId && comment.Likes.length > 0),
    },
  };
}

function getFeedCursorWhere(
  cursor: FeedCursor,
): Prisma.PostWhereInput | undefined {
  if (!cursor) {
    return undefined;
  }

  return {
    // Ont prends tout les post qui ont une date inférieur a cursor (Dernier post vu)
    // Ou bien ceux qui sont créer a le meme date et ont un ID plus petit que mon cursor
    // Le tri par ID n'as aucun sens car les IDs sont aléatoire, mais pour User c'est
    // Pas grave du tout tant que les posts ont la meme date //
    OR: [
      {
        createdAt: {
          lt: new Date(cursor.createdAt),
        },
      },
      {
        createdAt: new Date(cursor.createdAt),
        id: {
          lt: cursor.id,
        },
      },
    ],
  };
}

export async function getForYouFeedPageQuery(input?: {
  cursor?: FeedCursor;
  limit?: number;
}): Promise<ForYouFeedPage> {
  const viewer = await getViewerProfile();
  const viewerId = viewer?.id ?? null;
  const limit = input?.limit ?? FEED_PAGE_SIZE;

  const posts = await myPrisma.post.findMany({
    take: limit + 1,
    where: {
      ...getVisiblePostWhere(viewerId),
      ...getFeedCursorWhere(input?.cursor ?? null),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: getPostSelect(viewerId),
  });

  // On accede au post qui est = a la valeur limits //
  const nextItem = posts[limit];

  const visibleItems = posts.slice(0, limit);

  return {
    items: visibleItems.map((post) => serializePost(post, viewerId)),
    nextCursor: nextItem
      ? {
          id: nextItem.id,
          createdAt: nextItem.createdAt.toISOString(),
        }
      : null,
  };
}

export async function getForYouFeedHeadQuery(): Promise<ForYouFeedHead> {
  const viewer = await getViewerProfile();

  const latestPost = await myPrisma.post.findFirst({
    where: getVisiblePostWhere(viewer?.id),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      createdAt: true,
    },
  });

  return {
    latestPostId: latestPost?.id ?? null,
    latestCreatedAt: latestPost?.createdAt.toISOString() ?? null,
  };
}

export async function getFollowingPage(cursor: FeedCursor) {
  const viewer = await getViewerProfile();

  if (!viewer) {
    return {
      items: [],
      nextCursor: null,
    };
  }

  const posts = await myPrisma.post.findMany({
    take: FEED_PAGE_SIZE + 1,
    where: {
      ...getVisiblePostWhereFollowingFeed(viewer.id),
      ...getFeedCursorWhere(cursor ?? null),

      // Ici ont vérifie juste si au moins un user et Follow par notre User //
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: getPostSelect(viewer.id),
  });

  const nextItem = posts[FEED_PAGE_SIZE];

  const visibleItems = posts.slice(0, FEED_PAGE_SIZE);

  return {
    items: visibleItems.map((post) => serializePost(post, viewer.id)),
    nextCursor: nextItem
      ? {
          id: nextItem.id,
          createdAt: nextItem.createdAt.toISOString(),
        }
      : null,
  };
}

export async function getFollowingFeedHeadQuery(): Promise<ForYouFeedHead> {
  const viewer = await getViewerProfile();

  if (!viewer) {
    return {
      latestPostId: null,
      latestCreatedAt: null,
    };
  }

  const latestPost = await myPrisma.post.findFirst({
    where: getVisiblePostWhereFollowingFeed(viewer.id),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      createdAt: true,
    },
  });

  return {
    latestPostId: latestPost?.id ?? null,
    latestCreatedAt: latestPost?.createdAt.toISOString() ?? null,
  };
}

export async function getPostDetailQuery(
  slug: string,
): Promise<PostDetailResult | null> {
  const viewer = await getViewerProfile();
  const viewerId = viewer?.id ?? null;

  const post = await myPrisma.post.findFirst({
    where: {
      slug,
      ...getPostDetailWhere(viewerId),
    },
    select: getPostSelect(viewerId),
  });

  if (!post) {
    return null;
  }

  return {
    post: serializePost(post, viewerId),
  };
}

export async function getPostCommentsQuery(input: {
  slug: string;
  sort: CommentSort;
}): Promise<PostCommentsResult> {
  const viewer = await getViewerProfile();
  const viewerId = viewer?.id ?? null;

  const comments = await myPrisma.comment.findMany({
    where: {
      deletedAt: null,
      responseToCommentId: null, // Ont ne veux pas prendre le post Parents car on est déjà sur le post parents //

      author: getVisibleAuthorWhere(viewerId),
      post: {
        slug: input.slug,
        ...getPostDetailWhere(viewerId),
      },
    },
    orderBy:
      input.sort === "popular"
        ? [{ Likes: { _count: "desc" } }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }],
    // Si le tri est sur populaire, on order by Les likes du plus grands au plus petit
    // Si meme nombre de Likes, ont fallback sur le plus récents //
    // Sinon on tri plus récents c'est tout//

    select: getCommentSelect(viewerId),
  });

  return {
    comments: comments.map((comment) => serializeComment(comment, viewerId)),
    sort: input.sort,
  };
}

export async function getCommentThreadQuery(input: {
  slug: string;
  commentId: string;
}): Promise<CommentThreadResult | null> {
  const viewer = await getViewerProfile();
  const viewerId = viewer?.id ?? null;

  // Ici ont veut juste sortir avec 2 constante, post et le commentaires actuelle //
  const [post, currentComment] = await Promise.all([
    myPrisma.post.findFirst({
      where: {
        slug: input.slug,
        ...getPostDetailWhere(viewerId),
      },
      select: getPostSelect(viewerId),
    }),
    myPrisma.comment.findFirst({
      where: {
        id: input.commentId,
        deletedAt: null,
        author: getVisibleAuthorWhere(viewerId),
        post: {
          slug: input.slug,
          ...getPostDetailWhere(viewerId),
        },
      },
      select: getCommentSelect(viewerId),
    }),
  ]);

  if (!post || !currentComment) {
    return null;
  }

  const [parentComment, replies] = await Promise.all([
    currentComment.responseToCommentId
      ? // Si on a responseToCommentId cela veut dire qu'on repond a un comment //
        myPrisma.comment.findFirst({
          where: {
            id: currentComment.responseToCommentId,
            deletedAt: null,
            author: getVisibleAuthorWhere(viewerId),
            postId: currentComment.postId,
          },
          select: getCommentSelect(viewerId),
        })
      : Promise.resolve(null),
    //Ont cancel si on a rien trouvé ça veut dire qu'il répond pas a un commentaire mais au post directement //
    myPrisma.comment.findMany({
      where: {
        deletedAt: null,
        // Tous les commentaires qui ont responseToCommentId l'ID de mon commentaires sont des replies de mon commentaires //
        responseToCommentId: currentComment.id,
        author: getVisibleAuthorWhere(viewerId),
        postId: currentComment.postId,
      },
      orderBy: [{ createdAt: "desc" }],
      select: getCommentSelect(viewerId),
    }),
  ]);

  return {
    post: serializePost(post, viewerId),
    parentComment: parentComment
      ? serializeComment(parentComment, viewerId)
      : null,
    comment: serializeComment(currentComment, viewerId),
    replies: replies.map((reply) => serializeComment(reply, viewerId)),
  };
}
