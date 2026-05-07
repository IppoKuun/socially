import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

type blockItem = {
  avatarUrl: string | null;
  username: string | null;
  id: string;
};

export type getUserBlockListType = {
  nextCursor: string | undefined;
  blocksProfilToDisplay: blockItem[];
};

export async function getUserBlockList(
  cursor?: string,
): Promise<getUserBlockListType> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const profile = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    throw new Error("Profile not found");
  }

  // Les profiles delete seront aussi affiché dans la liste de block
  // C'est un choix métier //
  const blockList = await myPrisma.block.findMany({
    take: 21,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    where: {
      blockerId: profile.id,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      blocked: { select: { id: true, avatarUrl: true, username: true } },
    },
  });

  const hasNextPage = blockList.length > 20;
  // Si la longueur de la blockLIST est supérieux a 20 cv dire qu'il ya une page suivante
  // Ducoup ont la prends en coupant l'élement suivant qui est le prochain cursor
  // Sinon on prends le block telle qu'il l'est//
  const rawBlocks = hasNextPage ? blockList.slice(0, 20) : blockList;

  const nextCursor = blockList[20]?.id;
  const blocksProfilToDisplay: blockItem[] = rawBlocks.map((item) => {
    return {
      id: item.blocked.id,
      username: item.blocked.username,
      avatarUrl: item.blocked.avatarUrl,
    };
  });

  return {
    nextCursor,
    blocksProfilToDisplay,
  };
}
