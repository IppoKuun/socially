"use server";
import { getSession } from "@/lib/authSession";
import { getTranslations } from "next-intl/server";
import { myPrisma } from "@/lib/prisma";

export async function Like(postId: string) {
  const t = await getTranslations("post.actions.like");
  const session = await getSession();

  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!user) {
    return {
      ok: false,
      userMsg: t("profileNotFound"),
    };
  }
  try {
    const isLiked = await myPrisma.postLike.findUnique({
      where: {
        // Cette syntaxe fait qu'elle vas ciblé la relation unique //
        user_id_post_id: {
          post_id: postId,
          user_id: user.id,
        },
      },
    });

    if (isLiked) {
      await myPrisma.postLike.delete({
        where: { id: isLiked.id },
      });
    } else {
      await myPrisma.postLike.create({
        data: { user_id: user.id, post_id: postId },
      });
    }
  } catch (error) {
    console.error(error);
    return { ok: false, userMsg: t("toggleFailed") };
  }
  return { ok: true, userMsg: "" };
}

export async function commentLike(commentId: string) {
  const t = await getTranslations("comment.actions.like");
  const session = await getSession();

  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!user) {
    return {
      ok: false,
      userMsg: t("profileNotFound"),
    };
  }

  try {
    const isLiked = await myPrisma.commentLike.findUnique({
      where: {
        // Cette syntaxe fait qu'elle vas ciblé la relation unique //
        user_id_comment_id: {
          comment_id: commentId,
          user_id: user.id,
        },
      },
    });

    if (isLiked) {
      await myPrisma.commentLike.delete({
        where: { id: isLiked.id },
      });
    } else {
      await myPrisma.commentLike.create({
        data: { user_id: user.id, comment_id: commentId },
      });
    }
  } catch (error) {
    console.error(error);
    return { ok: false, userMsg: t("toggleFailed") };
  }
  return { ok: true, userMsg: "" };
}
