import { notFound } from "next/navigation";
import FollowList from "../../../components/FollowList";
import { myPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import type { Prisma } from "@prisma/client";

interface PageProps {
  params: Promise<{ locale: string; username: string; mode: string }>;
}
export default async function connectionMode({ params }: PageProps) {
  const session = await getSession();

  const viewer = await myPrisma.userProfile.findFirst({
    where: { userId: session?.user.id, deletedAt: null },
    select: { id: true },
  });

  const { username, mode } = await params;

  if (mode !== "followers" && mode !== "following") {
    notFound();
  }

  const visibleProfileWhere = {
    deletedAt: null,
    ...(viewer?.id
      ? {
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
        }
      : {}),
  } satisfies Prisma.UserProfileWhereInput;

  const viewerFollowSelect = {
    where: viewer?.id ? { followerProfileId: viewer.id } : undefined,
    select: {
      followerProfileId: true,
    },
  } satisfies Prisma.FollowFindManyArgs;

  const target = await myPrisma.userProfile.findFirst({
    where: { username, ...visibleProfileWhere },
    select: { id: true },
  });

  if (!target) {
    notFound();
  }

  if (mode === "followers") {
    //Si ont regarde les follower de username.
    //On cherche la relation ou ou username est suivies, et prends tout les profiles
    const relations = await myPrisma.follow.findMany({
      where: {
        followedProfileId: target.id,
        followerProfile: visibleProfileWhere,
      },
      select: {
        followerProfile: {
          select: {
            id: true,
            username: true,
            displayname: true,
            avatarUrl: true,
            bio: true,
            isAi: true,
            isPro: true,
            relationWhereUserIsFollowed: viewerFollowSelect,
          },
        },
      },
    });

    // Ont mappe chaque relations trouvé pour retourné une bonne props
    // et pour calculer si viewerFollowing //
    const itemsMode = relations.map((relation) => {
      // Pour chaque relation cette constante deviendra une propriété retournera true//
      const isViewerFollowing =
        relation.followerProfile.relationWhereUserIsFollowed.some(
          (followRelation) => followRelation.followerProfileId === viewer?.id,
        );
      return {
        id: relation.followerProfile.id,
        username: relation.followerProfile.username,
        displayname: relation.followerProfile.displayname,
        avatarUrl: relation.followerProfile.avatarUrl,
        bio: relation.followerProfile.bio,
        isAi: relation.followerProfile.isAi,
        isPro: relation.followerProfile.isPro,
        isViewerFollowing,
      };
    });

    return (
      <>
        <FollowList
          items={itemsMode}
          isViewerAuthentificated={Boolean(session)}
          mode={mode}
          username={username}
        />
      </>
    );
  }

  const relations = await myPrisma.follow.findMany({
    where: {
      followerProfileId: target.id,
      followedProfile: visibleProfileWhere,
    },
    select: {
      followedProfile: {
        select: {
          id: true,
          username: true,
          displayname: true,
          avatarUrl: true,
          bio: true,
          isAi: true,
          isPro: true,
          relationWhereUserIsFollowed: viewerFollowSelect,
        },
      },
    },
  });

  const itemsMode = relations.map((relation) => {
    const isViewerFollowing =
      relation.followedProfile.relationWhereUserIsFollowed.some(
        (followRelation) => followRelation.followerProfileId === viewer?.id,
      );

    return {
      id: relation.followedProfile.id,
      username: relation.followedProfile.username,
      displayname: relation.followedProfile.displayname,
      avatarUrl: relation.followedProfile.avatarUrl,
      bio: relation.followedProfile.bio,
      isAi: relation.followedProfile.isAi,
      isPro: relation.followedProfile.isPro,
      isViewerFollowing,
    };
  });

  return (
    <>
      <FollowList
        items={itemsMode}
        isViewerAuthentificated={Boolean(session)}
        mode={mode}
        username={username}
      />
    </>
  );
}
