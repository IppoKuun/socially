"use server";
import Moderation from "@/lib/AI/postModerations";
import { FormState } from "../[locale]/login/_actions/actions";
import { commentSchema } from "@/lib/validations.ts/validationComment";
import { getZodErrorMapForRequest } from "@/lib/i18n/zod";
import { myPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import { rateLimits } from "@/lib/rateLimits";
import { getTranslations } from "next-intl/server";

export default async function createComment(
  _prevstate: FormState,
  FormData: FormData,
) {
  const t = await getTranslations("comment.actions.create");
  const errorMap = await getZodErrorMapForRequest("comment");

  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }
  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!user) {
    return { ok: false, userMsg: t("profileNotFound") };
  }

  const limiter = rateLimits.postPublish;

  const identifier = user?.id ?? session.user.id;

  if (!identifier) {
    return {
      ok: false,
      userMsg: t("missingIdentifier"),
    };
  }
  const { success, reset } = await limiter.limit(identifier);
  // Erreur si limite attente //
  if (!success) {
    const diffMs = reset - Date.now();
    const minutes = Math.ceil(diffMs / (1000 * 60));
    return {
      ok: false,
      userMsg: t("rateLimited", { minutes }),
    };
  }
  const raw = Object.fromEntries(FormData);
  const postId = raw.PostId;
  const responseToCommentId = raw.CommentID;

  const parent = await myPrisma.comment.findUnique({
    where: { id: String(responseToCommentId) },
    select: { id: true, postId: true, responseToCommentId: true },
  });

  // Si le post principal du comment est absents, Il est probalblement supprimé
  //  et dans ce cas la, on ne veut pas faire une err pour chaque commentaires*
  // Mais avertir l'UI normalement comme ça ont pourra indiqué que le post est supprimé //
  if (!parent) {
    return { ok: true, userMsg: "", parent: false };
  }

  const parsed = commentSchema.safeParse(
    { title: raw.title, content: raw.content },
    { error: errorMap },
  );
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  let moderation;

  try {
    moderation = await Moderation({
      language: raw.language ? String(raw.language) : "en",
      kind: "COMMENT",
      title: String(raw.title),
      content: String(raw.content),
    });
  } catch (error) {
    console.error(error);
  }

  if (!moderation) {
    return {
      ok: false,
      userMsg: t("moderationUnavailable"),
    };
  }

  if (moderation.moderationStatus === "UNSAFE") {
    return {
      ok: false,
      userMsg: t("unsafeContent"),
      reasons: moderation.reasons,
      unsafeImages: moderation.unsafeImages,
    };
  }

  const created = await myPrisma.comment.create({
    data: {
      moderationStatus: moderation.moderationStatus,
      content: parsed.data?.content,
      authorId: user.id,
      responseToCommentId: String(responseToCommentId),
      postId: String(postId),
    },
  });

  if (!created) {
    return { ok: false, userMsg: t("createFailed") };
  }

  if (created.moderationStatus === "UNCERTAIN") {
    return { ok: true, userMsg: t("sensitiveWarning") };
  }

  return { ok: true, userMsg: "" };
}
