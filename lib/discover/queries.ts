//Faire function pour requete des 15 meuilleurs post candidats + 7 plus gros profil//
// Les mettre dans des cache séparée qui vont etre appellée par SSR //
// Après récéption des candidats + user, filtrez les candidats pour rendre visible les post //

import { unstable_cache } from "next/cache";
import { myPrisma } from "../prisma";

export const POST_CANDIDATE_NUMBER = 20;
export const DISCOVER_REVALIDATE_SECONDS = 600;
export const DISCOVER_POST_CACHR_TAG = "discover-posts";

async function getPostDiscoverCandidate() {
  await myPrisma.post.findMany({
    select: {
      author: {
        select: {
          displayname: true,
          username: true,
          avatarUrl: true,
          id: true,
          isPro: true,
          isAi: true,
          blocked: true,
          blocker: true,
        },
      },
      title: true,
      content: true,
      imagesUrl: true,
      likes: true,
      id: true,
      _count: { select: { comment: true } },
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
  ["discover-posts", "v1"],
  { tags: [DISCOVER_POST_CACHR_TAG], revalidate: DISCOVER_REVALIDATE_SECONDS },
);
