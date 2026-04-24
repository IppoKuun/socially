"use server";

import { FormState } from "@/app/[locale]/login/_actions/actions";
import { getSession } from "@/lib/authSession";
import deleteCloudinary, { uploadCloudinary } from "@/lib/cloudinaryConfig";
import { getZodErrorMapForRequest } from "@/lib/i18n/zod";
import { myPrisma } from "@/lib/prisma";
import { rateLimits } from "@/lib/rateLimits";
import {
  modifyProfileSchema,
  uploadProfilImage,
} from "@/lib/validations.ts/profile";
import { getTranslations } from "next-intl/server";

export default async function modifyProfil(
  _prevstate: FormState,
  FormData: FormData,
) {
  const t = await getTranslations("profile.actions.modify");
  const errorMap = await getZodErrorMapForRequest("profile");

  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: t("authRequired") };
  }
  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, avatarPublicId: true },
  });
  if (!user) {
    return { ok: false, userMsg: t("profileNotFound") };
  }

  //La clé utilisé est bien postPublish, c'est fait exprès
  // car la valeur convient //
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
  const avatar = FormData.get("avatar");
  const hasNewAvatar = avatar instanceof File && avatar.size > 0;

  const parsedDraft = modifyProfileSchema.safeParse(
    { displayname: raw.displayname, bio: raw.bio, avatarUrl: undefined },
    { error: errorMap },
  );

  if (!parsedDraft.success) {
    return { ok: false, errors: parsedDraft.error.flatten().fieldErrors };
  }

  let finalAvatarUrl: string | null = null;
  let finalAvatarPublicId: string | null = null;

  const previousAvatarPublicId = user.avatarPublicId;

  if (hasNewAvatar) {
    const avatarValidation = uploadProfilImage.safeParse(
      { image: avatar },
      { error: errorMap },
    );

    if (!avatarValidation.success) {
      return {
        ok: false,
        userMsg: t("invalidFiles"),
        errors: avatarValidation.error.flatten().fieldErrors.image,
      };
    }

    let uploadAvatar;
    try {
      uploadAvatar = await uploadCloudinary(avatar);
    } catch {
      return { ok: false, userMsg: t("uploadFailed") };
    }

    if (!uploadAvatar) {
      return { ok: false, userMsg: t("uploadFailed") };
    }
    finalAvatarUrl = uploadAvatar.secure_url;
    finalAvatarPublicId = uploadAvatar.public_id;
  }

  const parsed = modifyProfileSchema.safeParse(
    { displayname: raw.displayname, bio: raw.bio, avatarUrl: finalAvatarUrl },
    { error: errorMap },
  );

  if (!parsed.success) {
    if (finalAvatarPublicId) {
      const deleteUploadedAvatar = await deleteCloudinary([
        finalAvatarPublicId,
      ]);

      if (!deleteUploadedAvatar) {
        console.error("Impossible de supprimé image Cloudinary invalide");
      }
    }

    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await myPrisma.$transaction(async (tx) => {
      await tx.userProfile.update({
        where: { userId: session.user.id },
        data: {
          displayname: parsed.data.displayname || undefined,
          bio: parsed.data.bio,
          avatarUrl: parsed.data.avatarUrl || undefined,
          avatarPublicId: finalAvatarPublicId || undefined,
        },
      });
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: parsed.data.displayname || undefined,
          image: hasNewAvatar ? parsed.data.avatarUrl : undefined,
        },
      });
    });

    if (
      hasNewAvatar &&
      previousAvatarPublicId &&
      previousAvatarPublicId !== finalAvatarPublicId
    ) {
      const deletePreviousAvatar = await deleteCloudinary([
        previousAvatarPublicId,
      ]);

      if (!deletePreviousAvatar) {
        console.error("Impossible de supprimé l'ancien avatar Cloudinary");
      }
    }
  } catch (error) {
    console.error(`Impossible de modifié profile : ${error}`);
    if (finalAvatarPublicId) {
      const deleteAvatar = await deleteCloudinary([finalAvatarPublicId]);

      if (!deleteAvatar) {
        console.error("Impossible de supprimé image Cloudinary");
      }
    }
    return {
      ok: false,
      userMsg: "Impossible de modifié votre profile, reesayé plus tard",
    };
  }

  return { ok: true, userMsg: "" };
}
