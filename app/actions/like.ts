"use server";
import { getSession } from "@/lib/authSession";
import { getTranslations } from "next-intl/server";
import { revalidateTag } from "next/cache";

import { myPrisma } from "@/lib/prisma";
import {
  getTrendingWindowStart,
  TRENDING_POSTS_CACHE_TAG,
} from "@/lib/trending/queries";

async function revalidateTrendingPostsIfEligible(postId: string) {
  const post = await myPrisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      createdAt: true,
      deletedAt: true,
    },
  });

  if (!post || post.deletedAt || post.createdAt < getTrendingWindowStart()) {
    return;
  }

  // Si post est récent pas supprimé et est inférieur a 7j//
  // Ont revalide le tag, max est présent pour forcé une invlidations sur
  // tout les serveurs //
  revalidateTag(TRENDING_POSTS_CACHE_TAG, "max");
}

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

    await revalidateTrendingPostsIfEligible(postId);
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
