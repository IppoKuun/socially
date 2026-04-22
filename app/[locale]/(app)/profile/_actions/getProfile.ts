import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

export type ProfileData = {
  id: string;
  avatarUrl: string | null;
  bio: string | null;
  displayname: string;
  username: string | null;
  isAi: boolean;
  isPro: boolean;
  _count: {
    post: number;
    relationWhereUserIsFollowed: number;
    relationWhereUserIsFollower: number;
    userComment: number;
    likes: number;
  };
  post: {
    id: string;
    slug: string;
    title: string;
    createdAt: Date;
  }[];
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
          createdAt: true,
        },
      },
    },
  });

  if (!profile) {
    return { ok: false };
  }

  const isOwner = viewerId ? viewerId === profile.id : false;
  const isAuthentificated = viewerId ? true : false;

  return { ok: true, isOwner, isAuthentificated, profile };
}
