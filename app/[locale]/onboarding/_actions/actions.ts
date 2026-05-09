"use server";
import { uploadCloudinary } from "@/lib/cloudinaryConfig";
import { getSession } from "@/lib/authSession";
import { getZodErrorMapForRequest } from "@/lib/i18n/zod";
import { captureAppException } from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";
import { UploadApiResponse } from "cloudinary";
import { getTranslations } from "next-intl/server";
import {
  uploadImageSchema,
  onboardingSchema,
  onboardingSchemaStepTwo,
  onboardingSchemaStepThree,
} from "@/lib/validations.ts/onboarding";
import { revalidatePath } from "next/cache";

export type stepFormState = {
  ok: boolean;
  userMsg: string;
  errors?: {
    image?: string[];
    username?: string[];
    displayname?: string[];
    bio?: string[];
    occupation?: string[];
    avatarUrl?: string[];
    categories?: string[];
    intent?: string[];
  };
};

export async function verifyUsername(
  _prevstate: stepFormState,
  FormData: FormData,
) {
  const t = await getTranslations("onboarding.actions.verifyUsername");
  const session = await getSession();
  const inputusername = FormData.get("username");
  const usernameInput =
    typeof inputusername === "string" ? inputusername.trim().toLowerCase() : "";

  if (!usernameInput) {
    return { ok: false, userMsg: t("missingUsername") };
  }

  const username = await myPrisma.userProfile.findUnique({
    where: { username: usernameInput },
    select: { userId: true },
  });

  if (username && username.userId !== session?.user.id) {
    return { ok: false, userMsg: t("taken") };
  }

  return { ok: true, userMsg: t("available") };
}

export async function uploadImage(
  _prevState: stepFormState,
  FormData: FormData,
) {
  const t = await getTranslations("onboarding.actions.uploadImage");
  // Ont prends errorMaps maintenant pour avoir la bonne erreur dans la bonne langue //
  const errorMap = await getZodErrorMapForRequest();
  const session = await getSession();
  const avatar = FormData.get("avatar");
  // Banner est mis mais pas utilisé, je l'ai deplacé hors-scope mais je garde pour une futur version //
  const banner = FormData.get("banner");
  const dataToUpdate: {
    avatarUrl?: string;
    avatarPublicId?: string;
    bannerUrl?: string;
    bannerPublicId?: string;
  } = {};

  try {
    // Important de regardé si image vient du format fichier et que size > 0, ça veut dire que l'image
    // vient d'etre uploader et ne vient pas d'un provider //
    if (avatar instanceof File && avatar.size > 0) {
      const parseAvatar = uploadImageSchema.safeParse(
        { image: avatar },
        { error: errorMap },
      );

      if (!parseAvatar.success) {
        const imageErrors = parseAvatar.error.flatten().fieldErrors.image;

        return {
          ok: false,
          userMsg: imageErrors?.[0] ?? t("validationFailed"),
          errors: parseAvatar.error.flatten().fieldErrors,
        };
      }

      const { secure_url, public_id } = (await uploadCloudinary(
        avatar,
      )) as UploadApiResponse; // Ont a besoin du vrai type de uploadCloudinary pour avoir secure et publicID //

      dataToUpdate.avatarUrl = secure_url;
      dataToUpdate.avatarPublicId = public_id;
    }

    if (banner instanceof File && banner.size > 0) {
      const parseBanner = uploadImageSchema.safeParse(
        { image: banner },
        { error: errorMap },
      );

      if (!parseBanner.success) {
        const imageErrors = parseBanner.error.flatten().fieldErrors.image;

        return {
          ok: false,
          userMsg: imageErrors?.[0] ?? t("validationFailed"),
          errors: parseBanner.error.flatten().fieldErrors,
        };
      }

      const { secure_url, public_id } = (await uploadCloudinary(
        banner,
      )) as UploadApiResponse;

      dataToUpdate.bannerUrl = secure_url;
      dataToUpdate.bannerPublicId = public_id;
    }
    await myPrisma.userProfile.update({
      where: { userId: session?.user.id },
      data: dataToUpdate,
    });
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      feature: "onboarding",
      action: "upload_onboarding_media",
      extra: {
        authUserId: session?.user.id,
        hasAvatar: avatar instanceof File && avatar.size > 0,
        hasBanner: banner instanceof File && banner.size > 0,
      },
    });
    return {
      ok: false,
      userMsg: t("unexpectedError"),
    };
  }

  return {
    ok: true,
    userMsg: "",
  };
}

export async function stepOneValidOnboarding(
  _prevState: stepFormState,
  formData: FormData,
) {
  const t = await getTranslations("onboarding.actions.stepOne");
  const errorMap = await getZodErrorMapForRequest();
  const session = await getSession();

  // Prendre toutes les propriété d'un coup //
  const raw = Object.fromEntries(formData.entries());

  // L'image est déjà géré par un autre serv action/schema ZOD donc ont la delete //
  delete raw.avatar;
  delete raw.banner;

  const parsed = onboardingSchema.safeParse(raw, { error: errorMap });

  if (!parsed.success) {
    return {
      ok: false,
      userMsg: "",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await myPrisma.userProfile.update({
      where: { userId: session?.user.id },
      // Ici parsed.data contient l'objet validé et transformé par Zod.
      data: { ...parsed.data, onboardedStep: 1 },
    });
    revalidatePath("/onboarding");

    return { ok: true, userMsg: "" };
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      feature: "onboarding",
      action: "save_step_one",
      extra: {
        authUserId: session?.user.id,
      },
    });

    return {
      ok: false,
      userMsg: t("submitFailed"),
    };
  }
}

export async function stepThreeValidOnboarding(
  _prevData: stepFormState,
  FormData: FormData,
) {
  const t = await getTranslations("onboarding.actions.stepThree");
  const errorMap = await getZodErrorMapForRequest();
  const session = await getSession();

  const intent = FormData.get("intent");

  const parsed = onboardingSchemaStepThree.safeParse(
    {
      intent,
    },
    { error: errorMap },
  );
  if (!parsed.success) {
    return {
      ok: false,
      userMsg: "",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    await myPrisma.userProfile.update({
      where: { userId: session?.user.id },

      data: {
        intent: parsed.data.intent,
        onboardedStep: 3,
        hasOnboarded: true,
      },
    });

    revalidatePath("/onboarding");

    return { ok: true, userMsg: "" };
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      feature: "onboarding",
      action: "save_step_three",
      extra: {
        authUserId: session?.user.id,
      },
    });

    return {
      ok: false,
      userMsg: t("submitFailed"),
    };
  }
}

export async function stepTwoValidOnboarding(
  _prevData: stepFormState,
  FormData: FormData,
) {
  const t = await getTranslations("onboarding.actions.stepTwo");
  const errorMap = await getZodErrorMapForRequest();
  const categories = FormData.getAll("categories");
  const session = await getSession();

  const parsed = onboardingSchemaStepTwo.safeParse(
    {
      categories,
    },
    { error: errorMap },
  );

  if (!parsed.success) {
    return {
      ok: false,
      userMsg: "",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await myPrisma.userProfile.update({
      where: { userId: session?.user.id },

      data: {
        categories: { set: parsed.data.categories },
        onboardedStep: 2,
      },
    });

    revalidatePath("/onboarding");

    return { ok: true, userMsg: "" };
  } catch (error) {
    console.error(error);
    captureAppException(error, {
      feature: "onboarding",
      action: "save_step_two",
      extra: {
        authUserId: session?.user.id,
      },
    });

    return {
      ok: false,
      userMsg: t("submitFailed"),
    };
  }
}
