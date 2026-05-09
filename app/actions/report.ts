"use server";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/authSession";
import { getTranslations } from "next-intl/server";
import { myPrisma } from "@/lib/prisma";
import { captureAppException } from "@/lib/monitoring/sentry";

export default async function report(postId: string) {
  const t = await getTranslations("post.actions.report");
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

  const post = await myPrisma.post.findFirst({
    where: {
      id: postId,
      deletedAt: null,
      moderationStatus: { not: "UNSAFE" },
      author: { deletedAt: null },
    },
    select: { id: true },
  });
  if (!post) {
    return { ok: false, userMsg: t("postNotFound") };
  }

  try {
    const createReport = await myPrisma.report.create({
      data: { reporterId: user.id, postId },
      select: { id: true },
    });

    if (!createReport) {
      return { ok: false, userMsg: t("createFailed") };
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
        userMsg: t("alreadyReported"),
      };
    }

    console.error(error);
    captureAppException(error, {
      feature: "report",
      action: "create_report",
      extra: {
        reporterProfileId: user.id,
        postId,
      },
    });
    return { ok: false, userMsg: t("createFailed") };
  }
}
