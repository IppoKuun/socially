"use server";
import { myPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import deleteCloudinary from "@/lib/cloudinaryConfig";
import { getTranslations } from "next-intl/server";

export default async function deletePost(id: string) {
  const t = await getTranslations("post.actions.delete");
  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const post = await myPrisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    return { ok: false, userMsg: t("postNotFound") };
  }
  if (post?.userId !== user?.id) {
    return { ok: false, userMsg: t("forbidden") };
  }

  if (post.imagesUrl) {
    try {
      await deleteCloudinary(post.imagesPublicId);
    } catch (error) {
      console.error(error);
      return { ok: false, userMsg: t("imageDeleteFailed") };
    }
  }

  const deletePost = await myPrisma.post.delete({
    where: { id },
  });

  if (!deletePost) {
    return { ok: false, userMsg: t("deleteFailed") };
  }
  return { ok: true, userMsg: "" };
}
