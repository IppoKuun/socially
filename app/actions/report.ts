"use server";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

export default async function report(postId: string) {
  const session = await getSession();

  if (!session) {
    return { ok: false, userMsg: "Vous n'etes pas connecté" };
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!user) {
    return {
      ok: false,
      userMsg: "Nous n'avons pas réussi a trouver votre profile",
    };
  }

  const post = await myPrisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) {
    return { ok: false, userMsg: "Impossible de trouver le post" };
  }

  try {
    const createReport = await myPrisma.report.create({
      data: { reporterId: user.id, postId },
    });

    if (!createReport) {
      return { ok: false, userMsg: "Impossible de signaler le post" };
    }

    return { ok: true, userMsg: "" };
  } catch (error) {
    if (
      // Si user essaie de briser le contrat d'unicité
      // User qui report ne peut pas reporte plusieurs fois le meme post//
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        userMsg: "Vous avez déjà signalé ce post.",
      };
    }

    console.error(error);
    return { ok: false, userMsg: "Impossible de signaler le post" };
  }
}
