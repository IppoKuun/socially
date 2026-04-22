import { Prisma } from "@prisma/client";

function getProfil(viewerId: string): Prisma.UserProfileWhereInput{
    return {
              username,
      deletedAt: null,
      blocked: {
        none: {
          blockerId: viewer.id,
        },
      },
      blocker: {
        none: {
          blockedById: viewer.id,
        },
      },
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
        select: { post: true },
      },
      post: {
        where: {
          deletedAt: null,
        },
        orderBy: [{ createdAt: "desc" }],
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          createdAt: true,
        },
      },
    }
}