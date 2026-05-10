"use server";

import { ModerationStatus, PostAppealStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import { getSession } from "@/lib/authSession";
import {
  captureAppException,
  captureAppMessage,
} from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";

type AppealPostModerationResult = {
  ok: boolean;
  userMsg: string;
  appealStatus?: PostAppealStatus;
};

export async function appealPostModeration(
  postId: string,
): Promise<AppealPostModerationResult> {
  const t = await getTranslations("post.actions.appeal");
  const cleanPostId = postId.trim();

  if (!cleanPostId) {
    return { ok: false, userMsg: t("postNotFound") };
  }

  const session = await getSession();

  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }

  const user = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });

  if (!user) {
    return { ok: false, userMsg: t("profileNotFound") };
  }

  const post = await myPrisma.post.findFirst({
    where: {
      id: cleanPostId,
      userId: user.id,
      deletedAt: null,
    },
    select: {
      id: true,
      moderationStatus: true,
      appealStatus: true,
    },
  });

  if (!post) {
    return { ok: false, userMsg: t("postNotFound") };
  }

  if (post.moderationStatus !== ModerationStatus.UNSAFE) {
    captureAppMessage("Post appeal rejected because post is not unsafe", {
      feature: "post",
      action: "appeal_post_moderation",
      level: "warning",
      extra: {
        postId: post.id,
        userProfileId: user.id,
        moderationStatus: post.moderationStatus,
      },
    });

    return { ok: false, userMsg: t("notAppealable") };
  }

  if (post.appealStatus === PostAppealStatus.PENDING) {
    return {
      ok: false,
      userMsg: t("alreadyPending"),
      appealStatus: post.appealStatus,
    };
  }

  if (post.appealStatus !== PostAppealStatus.NONE) {
    return {
      ok: false,
      userMsg: t("alreadyReviewed"),
      appealStatus: post.appealStatus,
    };
  }

  try {
    const updated = await myPrisma.post.updateMany({
      where: {
        id: post.id,
        userId: user.id,
        deletedAt: null,
        moderationStatus: ModerationStatus.UNSAFE,
        appealStatus: PostAppealStatus.NONE,
      },
      data: {
        appealStatus: PostAppealStatus.PENDING,
        appealedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      return { ok: false, userMsg: t("createFailed") };
    }
  } catch (error) {
    console.error("Unable to create post moderation appeal", error);
    captureAppException(error, {
      feature: "post",
      action: "appeal_post_moderation",
      extra: {
        postId: post.id,
        userProfileId: user.id,
      },
    });

    return { ok: false, userMsg: t("createFailed") };
  }

  return {
    ok: true,
    userMsg: t("created"),
    appealStatus: PostAppealStatus.PENDING,
  };
}
