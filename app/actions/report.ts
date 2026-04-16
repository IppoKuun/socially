"use server";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

export default async function report(postId: string) {
  const session = await getSession();

  if (!session) {
    return { ok: false, userMsg: "Vous n'etes pas connecté" };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { id: session.user.id },
  });

  const post = await myPrisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) {
    return { ok: false, userMsg: "Impossible de trouver le post" };
  }

  const createReport = await myPrisma.report.create({
    data: { reporterId: session.user.id, postId },
  });

  if (!createReport) {
    return { ok: false, userMsg: "Impossible de report le post" };
  }
}
