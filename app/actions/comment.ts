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

  const limiter = rateLimits.comment;

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
  const postId = raw.PostId ? String(raw.PostId) : "";
  const responseToCommentId = raw.CommentID ? String(raw.CommentID) : null;
  // Frontend devra envoyé dans un input hidden : le mode. Si toComment
  // User répond a un com si toPost user réponds a un Post directement//
  const mode = String(raw.mode);

  if (!mode) {
    console.error(" SERV ACTION COMMENT : LE MODE NAS PAS ETE DONNER ");
    return { ok: false, userMsg: t("unexpectedError") };
  }

  const targetPost = await myPrisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  // Le post peut avoir été supprimé entre le rendu et la soumission.
  // Dans ce cas on bloque la création et on renvoie un état clair au front.
  if (!targetPost) {
    return {
      ok: false,
      userMsg: t("postUnavailable"),
      postUnavailable: true,
    };
  }

  let commentParent = null;

  if (mode === "toComment") {
    if (!responseToCommentId) {
      return {
        ok: false,
        userMsg: t("replyTargetUnavailable"),
      };
    }

    commentParent = await myPrisma.comment.findUnique({
      where: { id: responseToCommentId },
      select: { id: true, postId: true },
    });

    if (!commentParent) {
      return {
        ok: false,
        userMsg: t("replyTargetUnavailable"),
      };
    }

    if (commentParent.postId !== postId) {
      return { ok: false, userMsg: t("createFailed") };
    }
  }

  const parsed = commentSchema.safeParse(
    { content: raw.content },
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
      responseToCommentId: commentParent?.id,
      postId,
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
