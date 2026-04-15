"use server";
import { myPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import deleteCloudinary from "@/lib/cloudinaryConfig";

export default async function deletePost(id: string) {
  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: "Vous n'etes pas connecté" };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const post = await myPrisma.post.findUnique({
    where: { id },
  });

  if (post?.userId !== user?.id) {
    return { ok: false, userMsg: "Vous nen pouvez supprimez que vos post" };
  }
  if (!post) {
    return { ok: false, userMsg: "Votre post n'as pas été trouvée" };
  }
  if (post.imagesUrl) {
    try {
      await deleteCloudinary(post.imagesPublicId);
    } catch (error: typeof error) {
      console.error(error);
      return { ok: false, userMsg: "Impossible de supprimez image cloudinary" };
    }
  }

  const deletePost = await myPrisma.post.delete({
    where: { id },
  });

  if (deletePost) {
    return { ok: false, userMsg: "Votre post n'as pas pu etre supprimé" };
  }
  return { ok: true, userMsg: "" };
}
