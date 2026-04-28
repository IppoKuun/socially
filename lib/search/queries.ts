import { getSession } from "../authSession";
import { myError } from "../myError";
import { myPrisma } from "../prisma";

export async function getQueriesResult(queries: string) {
  const session = await getSession();

  if (!session) {
    throw new myError("Unauthentificated");
  }
  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      likes: { select: { post_id: true } },
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
    myPrisma.userProfile.findMany({
      where: {
        OR: [
          { username: { contains: queries, mode: "insensitive" } },
          { displayname: { contains: queries, mode: "insensitive" } },
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
      take: 4,
    }),

    myPrisma.post.findMany({
      where: {
        OR: [
          { title: { contains: queries, mode: "insensitive" } },
          { content: { contains: queries, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        imagesUrl: true,
        moderationStatus: true,
        author: {
          select: {
            id: true,
            blocked: {
              select: { blockerId: true },
            },
            blocker: {
              select: { blockedById: true },
            },
          },
        },
        _count: { select: { likes: true, comment: true } },
      },
      take: 20,
    }),
  ]);

  const profilesThatBlockedViewer = new Set(
    user.blocked.map((block) => block.blockerId),
  );
  const profilesBlockedByViewer = new Set(
    user.blocker.map((block) => block.blockedById),
  );

  const viewerLikeId = new Set(user?.likes.map((post) => post.post_id));
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
      posts: posts.map((post) => ({
        ...post,
        viewer: {
          isLiked: viewerLikeId.has(post.id),
          isBlocked: post.author.blocked.some(
            (block) =>
              block.blockerId === user?.id || block.blockerId === user?.id,
          ),
        },
      })),
    },
  };
}

export async function searchHistory(viewerId: string) {
  const history = await myPrisma.searchHistory.findMany({
    where: { userId: viewerId },
    select: { query: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return history;
}
