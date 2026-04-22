import { notFound } from "next/navigation";
import FollowList, { FollowListItem } from "../../../components/FollowList";
import { makeQueryClient } from "@/lib/query-client";
import { myPrisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ locale: string; username: string; mode: string }>;
}
export default async function connectionMode({ params }: PageProps) {
  const { username, mode } = await params;
  const queryClient = makeQueryClient();

  if (mode !== "followers" && mode !== "following") {
    notFound();
  }

  const [Follower, Following] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["follower", username],
      queryFn: () => {
        return myPrisma.userProfile.findMany({
          where: { username },
          select: {
            id: true,
            username: true,
            displayname: true,
            avatarUrl: true,
            bio: true,
            isAi: true,
            isPro: true,
            relationWhereUserIsFollowed: true,
            select: {
              FollowerProfil: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                isAi: true,
                isPro: true,
              },
            },
          },
        });
      },
    }),
    queryClient.fetchQuery({
      queryKey: ["following", username],
      queryFn: () => {
        return myPrisma.userProfile.findMany({
          where: { username },
          select: {
            id: true,
            username: true,
            displayname: true,
            avatarUrl: true,
            bio: true,
            isAi: true,
            isPro: true,
            relationWhereUserIsFollower: true,
            select: {
              FollowedProfile: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                isAi: true,
                isPro: true,
              },
            },
          },
        });
      },
    }),
  ]);

  const itemsMode: FollowListItem[] =
    mode === "following" ? Following : Follower;
  return (
    <>
      <FollowList items={itemsMode} />
    </>
  );
}
