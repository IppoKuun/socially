"use server";
import { getSession } from "@/lib/authSession";
import { getTranslations } from "next-intl/server";

import { myPrisma } from "@/lib/prisma";
import { createNotificationIfMissing } from "@/lib/notifications";
import { captureAppException } from "@/lib/monitoring/sentry";

export async function Like(postId: string) {
  const t = await getTranslations("post.actions.like");
  const session = await getSession();

  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }

  const user = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
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
      select: { id: true },
    });

    if (isLiked) {
      await myPrisma.postLike.delete({
        where: { id: isLiked.id },
      });
    } else {
      const targetPost = await myPrisma.post.findFirst({
        where: {
          id: postId,
          deletedAt: null,
          author: { deletedAt: null },
        },
        select: { id: true, userId: true },
      });

      if (!targetPost) {
        return { ok: false, userMsg: t("toggleFailed") };
      }

      await myPrisma.postLike.create({
        data: { user_id: user.id, post_id: postId },
      });

      try {
        await createNotificationIfMissing({
          actorId: user.id,
          userId: targetPost.userId,
          postId: targetPost.id,
          type: "LIKE",
        });
      } catch (error) {
        console.error("Unable to create like notification", error);
        captureAppException(error, {
          feature: "notifications",
          action: "create_like_notification",
          level: "warning",
          extra: {
            actorProfileId: user.id,
            receiverProfileId: targetPost.userId,
            postId: targetPost.id,
          },
        });
      }
    }
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      feature: "like",
      action: "toggle_post_like",
      extra: {
        userProfileId: user.id,
        postId,
      },
    });
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

  const user = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
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
      select: { id: true },
    });

    if (isLiked) {
      await myPrisma.commentLike.delete({
        where: { id: isLiked.id },
      });
    } else {
      const targetComment = await myPrisma.comment.findFirst({
        where: {
          id: commentId,
          deletedAt: null,
          author: { deletedAt: null },
          post: {
            deletedAt: null,
            author: { deletedAt: null },
          },
        },
        select: { id: true },
      });

      if (!targetComment) {
        return { ok: false, userMsg: t("toggleFailed") };
      }

      await myPrisma.commentLike.create({
        data: { user_id: user.id, comment_id: commentId },
      });
    }
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      feature: "like",
      action: "toggle_comment_like",
      extra: {
        userProfileId: user.id,
        commentId,
      },
    });
    return { ok: false, userMsg: t("toggleFailed") };
  }
  return { ok: true, userMsg: "" };
}
