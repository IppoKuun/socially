import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

export default async function Like(postId: string) {
  const session = await getSession();

  if (!session) {
    return { ok: false, userMsg: "Vous n'etes pas connecté" };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { id: session.user.id },
  });

  try {
    const isLiked = await myPrisma.postLike.findUnique({
      where: {
        // Cette syntaxe fait qu'elle vas ciblé la relation unique //
        user_id_post_id: {
          post_id: postId,
          user_id: session.user.id,
        },
      },
    });

    if (isLiked) {
      await myPrisma.postLike.delete({
        where: { id: isLiked.id },
      });
    } else {
      await myPrisma.postLike.create({
        data: { user_id: session.user.id, post_id: postId },
      });
    }
  } catch (error) {
    console.error(error);
    return { ok: false, userMsg: "Impossible de modifié le like" };
  }
}
