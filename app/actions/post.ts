"use server";
import Moderation from "@/lib/AI/postModerations";
import { FormState } from "../[locale]/login/_actions/actions";
import { postSchema, uploadImageSchema } from "@/lib/validations.ts/post";
import { uploadCloudinary } from "@/lib/cloudinaryConfig";
import { v2 as cloudinary } from "cloudinary";
import { getZodErrorMapForRequest } from "@/lib/i18n/zod";
import { myPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import { rateLimits } from "@/lib/rateLimits";
import { getTranslations } from "next-intl/server";
import generateSlug from "@/lib/slug";
import {
  captureAppException,
  captureAppMessage,
} from "@/lib/monitoring/sentry";

async function cleanupUploadedPostImages(
  ids: string[],
  action: string,
  extra?: Record<string, unknown>,
) {
  if (ids.length === 0) {
    return;
  }

  try {
    await Promise.all(
      ids.map((id) =>
        cloudinary.uploader.destroy(id, { resource_type: "image" }),
      ),
    );
  } catch (error) {
    console.error(
      "Impossible de supprimer les images Cloudinary du post",
      error,
    );
    captureAppException(error, {
      feature: "post",
      action,
      level: "warning",
      extra: {
        imageCount: ids.length,
        ...extra,
      },
    });
  }
}

export default async function createPost(
  _prevstate: FormState,
  FormData: FormData,
) {
  const t = await getTranslations("post.actions.create");
  const errorMap = await getZodErrorMapForRequest("post");

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

  // On vérifie que chaque images a le bon type, sinon erreur //
  const rawFiles = FormData.getAll("images").every(
    (entry): entry is File => entry instanceof File,
  );

  if (!rawFiles) {
    return { ok: false, userMsg: t("invalidFiles") };
  }

  // Parsing de chaque image avec Zod, qui vas nous permettre d'upload sur Cloudinary
  // Et enfin, envoyez les images a l'IA moderation qui a besoin de ces URL pour modéré les images//

  const images = FormData.getAll("images");
  const imageValidation = uploadImageSchema.safeParse(
    { image: images },
    { error: errorMap },
  );

  if (!imageValidation.success) {
    return {
      ok: false,
      userMsg: t("invalidFiles"),
      errors: imageValidation.error.flatten().fieldErrors.image,
    };
  }

  const results = await Promise.all(
    images.map((image) => uploadCloudinary(image as File)),
  );
  if (!results) {
    return {
      ok: false,
      userMsg: t("uploadFailed"),
    };
  }

  const urls = results.map((r) => r.secure_url);
  const ids = results.map((r) => r.public_id);

  const parsed = postSchema.safeParse(
    { title: raw.title, content: raw.content, imagesUrl: urls },
    { error: errorMap },
  );
  if (!parsed.success) {
    await cleanupUploadedPostImages(
      ids,
      "cleanup_after_post_validation_error",
      {
        userProfileId: user.id,
      },
    );
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  //??//
  let moderation;

  try {
    moderation = await Moderation({
      language: raw.language ? String(raw.language) : "en",
      kind: "POST",
      title: String(raw.title),
      content: String(raw.content),
      imageUrl: urls,
    });
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      feature: "post",
      action: "moderate_post",
      extra: {
        userProfileId: user.id,
        imageCount: ids.length,
      },
    });
  }

  if (!moderation) {
    await cleanupUploadedPostImages(
      ids,
      "cleanup_after_post_moderation_error",
      {
        userProfileId: user.id,
      },
    );
    return {
      ok: false,
      userMsg: t("moderationUnavailable"),
    };
  }

  const IAcategories = moderation.categories;

  const postSlug = await generateSlug(parsed.data.title);
  const isUnsafe = moderation.moderationStatus === "UNSAFE";
  const postImageUrls = isUnsafe ? [] : (parsed.data.imagesUrl ?? []);
  const postImagePublicIds = isUnsafe ? [] : ids;

  if (isUnsafe) {
    await cleanupUploadedPostImages(ids, "cleanup_after_post_rejected_by_ai", {
      userProfileId: user.id,
    });
  }

  let created;

  try {
    created = await myPrisma.post.create({
      data: {
        title: parsed.data.title,
        moderationStatus: moderation.moderationStatus,
        slug: String(postSlug),
        content: parsed.data?.content,
        imagesUrl: postImageUrls,
        categories: IAcategories,
        imagesPublicId: postImagePublicIds,
        moderationReason: moderation.reasons || null,
        unsafeImages: moderation.unsafeImages,
        userId: user.id,
      },
      select: { id: true, moderationStatus: true },
    });
  } catch (error) {
    console.error("Impossible de créer le post", error);
    captureAppException(error, {
      feature: "post",
      action: "create_post",
      extra: {
        userProfileId: user.id,
        imageCount: ids.length,
        moderationStatus: moderation.moderationStatus,
      },
    });
    if (!isUnsafe) {
      await cleanupUploadedPostImages(ids, "cleanup_after_post_create_error", {
        userProfileId: user.id,
      });
    }
    return { ok: false, userMsg: t("createFailed") };
  }

  if (!created) {
    captureAppMessage("Post creation returned no record", {
      feature: "post",
      action: "create_post_empty_result",
      extra: {
        userProfileId: user.id,
        imageCount: ids.length,
      },
    });
    if (!isUnsafe) {
      await cleanupUploadedPostImages(ids, "cleanup_after_empty_post_create", {
        userProfileId: user.id,
      });
    }
    return { ok: false, userMsg: t("createFailed") };
  }

  if (created.moderationStatus === "UNSAFE") {
    return {
      ok: false,
      userMsg: t("unsafeContent"),
      reasons: moderation.reasons,
      unsafeImages: moderation.unsafeImages,
    };
  }

  if (created.moderationStatus === "UNCERTAIN") {
    return { ok: true, userMsg: t("sensitiveWarning") };
  }

  return { ok: true, userMsg: "" };
}
