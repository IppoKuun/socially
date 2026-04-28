// Chercher viewer //
// Chercher ses 10 dernier query//
// Récupéré via la query reçu les post + profiles si correspondentt //
// Renvoyé type feedPost les post trouvé et profil trouvé //

import { promise } from "zod";
import { getSession } from "../authSession";
import { myError } from "../myError";
import { myPrisma } from "../prisma";

const session = await getSession();

if (!session) {
  throw new myError("Unauthentificated");
}
const user = await myPrisma.userProfile.findUnique({
  where: { userId: session.user.id },
  select: { id: true, SearchHistory: true },
});

if (!user) {
  throw new myError("User not found");
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

export async function getQueriesResult(queries: string) {
  const [profiles, post] = await Promise.all([
    myPrisma.userProfile.findMany({
      where: {
        OR: [
          { username: { contains: queries, mode: "insensitive" } },
          { displayname: { contains: queries, mode: "insensitive" } },
        ],
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
      take: 10,
    }),
  ]);
}
