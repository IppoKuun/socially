import { getSession } from "@/lib/authSession";
import type { FeedPost } from "@/lib/feed/shared";
import { myPrisma } from "@/lib/prisma";

export type ProfileData = {
  id: string;
  avatarUrl: string | null;
  bio: string | null;
  displayname: string;
  username: string | null;
  isAi: boolean;
  isPro: boolean;
  isViewerFollowing: boolean;
  _count: {
    post: number;
    relationWhereUserIsFollowed: number;
    relationWhereUserIsFollower: number;
    userComment: number;
    likes: number;
  };
  post: FeedPost[];
};

export default async function getProfilePage(username: string) {
  const session = await getSession();

  const viewer = await myPrisma.userProfile.findUnique({
    where: { userId: session?.user.id },
    select: { id: true },
  });

  const viewerId = viewer?.id;

  const profile = await myPrisma.userProfile.findFirst({
    where: {
      username,
      deletedAt: null,
      // Si il ya un viewer, il ne pourra pas voir le profil si il est bloqué
      // Mais si pas de viewer il pourra quand meme voir//
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
    },
    select: {
      id: true,
      avatarUrl: true,
      bio: true,
      displayname: true,
      username: true,
      isAi: true,
      isPro: true,
      _count: {
        select: {
          post: true,
          relationWhereUserIsFollowed: true,
          relationWhereUserIsFollower: true,
          userComment: true,
          likes: true,
        },
      },
      post: {
        where: {
          deletedAt: null,
        },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          createdAt: true,
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
            where: { user_id: viewerId ?? "" },
            select: { id: true },
          },
          reported: {
            where: { reporterId: viewerId ?? "" },
            select: { id: true },
          },
          _count: {
            select: {
              likes: true,
              comment: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    return { ok: false };
  }

  const isOwner = viewerId ? viewerId === profile.id : false;
  const isAuthentificated = viewerId ? true : false;
  const isViewerFollowing =
    viewerId && !isOwner
      ? await myPrisma.follow.findUnique({
          where: {
            followedProfileId_followerProfileId: {
              followedProfileId: profile.id,
              followerProfileId: viewerId,
            },
          },
          select: { id: true },
        })
      : null;

  const serializedPosts: FeedPost[] = profile.post.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    moderationStatus: post.moderationStatus,
    images: post.imagesUrl,
    likeCount: post._count.likes,
    commentCount: post._count.comment,
    author: {
      id: post.author.id,
      displayName: post.author.displayname,
      username: post.author.username ?? "pending-profile",
      avatarUrl: post.author.avatarUrl,
      isAi: post.author.isAi,
      isPro: post.author.isPro,
    },
    viewer: {
      isOwner: post.userId === viewerId,
      hasLiked: post.likes.length > 0,
      hasReported: post.reported.length > 0,
    },
  }));

  return {
    ok: true,
    isOwner,
    isAuthentificated,
    profile: {
      ...profile,
      isViewerFollowing: Boolean(isViewerFollowing),
      post: serializedPosts,
    },
  };
}
