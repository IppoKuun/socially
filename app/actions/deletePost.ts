"use server";
import { myPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import deleteCloudinary from "@/lib/cloudinaryConfig";
import { getTranslations } from "next-intl/server";
import { captureAppException } from "@/lib/monitoring/sentry";

export default async function deletePost(id: string) {
  const t = await getTranslations("post.actions.delete");
  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }

  const user = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });

  const post = await myPrisma.post.findFirst({
    where: {
      id,
      deletedAt: null,
      author: { deletedAt: null },
    },
    select: { id: true, imagesPublicId: true, imagesUrl: true, userId: true },
  });

  if (!post) {
    return { ok: false, userMsg: t("postNotFound") };
  }
  if (post?.userId !== user?.id) {
    return { ok: false, userMsg: t("forbidden") };
  }

  if (post.imagesPublicId.length > 0) {
    try {
      await deleteCloudinary(post.imagesPublicId);
    } catch (error) {
      console.error(error);
      captureAppException(error, {
        feature: "post",
        action: "delete_post_images",
        extra: {
          postId: post.id,
          userProfileId: user?.id,
          imageCount: post.imagesPublicId.length,
        },
      });
      return { ok: false, userMsg: t("imageDeleteFailed") };
    }
  }

  let deletedPost;

  try {
    deletedPost = await myPrisma.post.update({
      where: { id },
      data: {
        title: "Deleted post",
        content: null,
        imagesUrl: [],
        imagesPublicId: [],
        deletedAt: new Date(),
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("Impossible de supprimer le post", error);
    captureAppException(error, {
      feature: "post",
      action: "delete_post",
      extra: {
        postId: post.id,
        userProfileId: user?.id,
      },
    });
    return { ok: false, userMsg: t("deleteFailed") };
  }

  if (!deletedPost) {
    return { ok: false, userMsg: t("deleteFailed") };
  }
  return { ok: true, userMsg: "" };
}
