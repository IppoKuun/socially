//Faire function pour requete des 15 meuilleurs post candidats + 7 plus gros profil//
// Les mettre dans des cache séparée qui vont etre appellée par SSR //
// Après récéption des candidats + user, filtrez les candidats pour rendre visible les post pour user //

import { unstable_cache } from "next/cache";
import { myPrisma } from "../prisma";
import type { Category } from "@prisma/client";
import type { FeedPost } from "../feed/shared";
import { getSession } from "@/lib/authSession";

export const POST_CANDIDATE_NUMBER = 20;
export const PROFILE_CANDIDATE_NUMBER = 7;
export const DISCOVER_REVALIDATE_SECONDS = 600;
export const DISCOVER_POST_CACHE_TAG = "discover-posts";
export const DISCOVER_PROFILE_CACHE_TAG = "discover-profiles";

export type DiscoverPostCandidate = Awaited<
  ReturnType<typeof getPostDiscoverCandidate>
>[number];

export type DiscoverProfileCandidate = {
  id: string;
  username: string | null;
  displayname: string;
  avatarUrl: string | null;
  bio: string | null;
  isAi: boolean;
  isPro: boolean;
  _count: {
    relationWhereUserIsFollowed: number;
  };
};

async function getPostDiscoverCandidate() {
  return await myPrisma.post.findMany({
    where: { deletedAt: null, moderationStatus: { not: "UNSAFE" } },
    select: {
      author: {
        select: {
          displayname: true,
          username: true,
          avatarUrl: true,
          id: true,
          isPro: true,
          isAi: true,
        },
      },
      title: true,
      slug: true,
      moderationStatus: true,
      content: true,
      imagesUrl: true,
      createdAt: true,
      deletedAt: true,
      id: true,
      _count: { select: { comment: true, likes: true } },
    },
    take: POST_CANDIDATE_NUMBER,
    orderBy: {
      likes: {
        _count: "desc",
      },
    },
  });
}

export const getCachedDiscoveryPost = unstable_cache(
  getPostDiscoverCandidate,
  ["discover-posts", "v3"],
  { tags: [DISCOVER_POST_CACHE_TAG], revalidate: DISCOVER_REVALIDATE_SECONDS },
);

async function getProfileDiscoverCandidate() {
  return await myPrisma.userProfile.findMany({
    select: {
      id: true,
      username: true,
      displayname: true,
      avatarUrl: true,
      bio: true,
      isAi: true,
      isPro: true,
      _count: {
        select: { relationWhereUserIsFollowed: true },
      },
    },
    where: {
      deletedAt: null,
      username: {
        not: null,
      },
    },

    take: PROFILE_CANDIDATE_NUMBER,
    orderBy: {
      relationWhereUserIsFollowed: {
        _count: "desc",
      },
    },
  });
}

export const getCachedDiscoveryProfile = unstable_cache(
  getProfileDiscoverCandidate,
  ["discover-profiles", "v3"],
  {
    tags: [DISCOVER_PROFILE_CACHE_TAG],
    revalidate: DISCOVER_REVALIDATE_SECONDS,
  },
);

export async function getDiscoveryPostForViewer(
  viewerId: string | null,
  postCandidat: DiscoverPostCandidate[],
) {
  const postAuthorId = postCandidat.map((post) => post.author.id);

  const blocks = viewerId
    ? await myPrisma.block.findMany({
        where: {
          OR: [
            { blockedById: viewerId, blockerId: { in: postAuthorId } },
            { blockedById: { in: postAuthorId }, blockerId: viewerId },
          ],
        },
      })
    : [];

  const blockId = new Set(
    blocks.map((b) => (b.blockerId === viewerId ? b.blockedById : b.blockerId)),
  );

  const safePosts = postCandidat.filter((post) => !blockId.has(post.author.id));
  const returnPost = safePosts.slice(0, 5);
  const returnPostId = returnPost.map((post) => post.id);

  const liked = viewerId
    ? await myPrisma.postLike.findMany({
        where: { post_id: { in: returnPostId }, user_id: viewerId },
        select: { post_id: true },
      })
    : [];

  const postLiked = new Set(liked.map((l) => l.post_id));

  const finalPost = returnPost.map((post) => ({
    ...post,
    viewer: {
      isOwner: Boolean(viewerId && post.author.id === viewerId),
      hasLiked: postLiked.has(post.id),
      hasReported: false,
    },
  }));

  return finalPost;
}

export async function getDiscoveryProfileForViewer(
  viewerId: string | null,
  profileCandidat: DiscoverProfileCandidate[],
) {
  const profileId = profileCandidat.map((profile) => profile.id);

  const blocks = viewerId
    ? await myPrisma.block.findMany({
        where: {
          OR: [
            { blockedById: viewerId, blockerId: { in: profileId } },
            { blockedById: { in: profileId }, blockerId: viewerId },
          ],
        },
      })
    : [];

  const blockId = new Set(
    blocks.map((b) => (b.blockerId === viewerId ? b.blockedById : b.blockerId)),
  );

  const safeProfiles = profileCandidat.filter(
    (profile) => profile.id !== viewerId && !blockId.has(profile.id),
  );
  const returnProfile = safeProfiles.slice(0, 3);
  const returnProfileId = returnProfile.map((profile) => profile.id);

  const followed = viewerId
    ? await myPrisma.follow.findMany({
        where: {
          followedProfileId: { in: returnProfileId },
          followerProfileId: viewerId,
        },
        select: { followedProfileId: true },
      })
    : [];

  const profileFollowed = new Set(
    followed.map((follow) => follow.followedProfileId),
  );

  const finalProfile = returnProfile.map((profile) => ({
    ...profile,
    isViewerFollowing: profileFollowed.has(profile.id),
  }));

  return finalProfile;
}

async function getCategoryViewerProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const profile = await myPrisma.userProfile.findFirst({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    return null;
  }

  return profile;
}

export async function getPostForCategory(
  category: Category,
): Promise<FeedPost[]> {
  const viewer = await getCategoryViewerProfile();
  const viewerId = viewer?.id ?? null;

  const posts = await myPrisma.post.findMany({
    where: {
      author: {
        deletedAt: null,
      },
      deletedAt: null,
      moderationStatus: { not: "UNSAFE" },
      categories: { has: category },
    },
    select: {
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
        where: { user_id: viewerId ?? "__anonymous_viewer__" },
        select: { id: true },
      },
      reported: {
        where: { reporterId: viewerId ?? "__anonymous_viewer__" },
        select: { id: true },
      },
      _count: {
        select: {
          likes: true,
          comment: true,
        },
      },
    },
    take: 20,
    orderBy: { likes: { _count: "desc" } },
  });

  return posts.map(
    (post): FeedPost => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      deletedAt: post.deletedAt?.toISOString() ?? null,
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
        isOwner: Boolean(viewerId && post.userId === viewerId),
        hasLiked: Boolean(viewerId && post.likes.length > 0),
        hasReported: Boolean(viewerId && post.reported.length > 0),
      },
    }),
  );
}
