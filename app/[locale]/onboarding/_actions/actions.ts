import { uploadCloudinary } from "@/lib/cloudinaryConfig";
import { myPrisma } from "@/lib/prisma";
import { UploadApiResponse } from "cloudinary";
import {
  uploadImageSchema,
  onboardingSchema,
  onboardingSchemaStepTwo,
} from "@/lib/validations.ts/onboarding";
import { getSession } from "@/lib/authSession";
import { revalidatePath } from "next/cache";

export type stepFormState = {
  ok: boolean;
  userMsg: string;
  errors?: {
    username?: string[];
    displayName?: string[];
    bio?: string[];
    occupation?: string[];
    avatarUrl?: string[];
  };
};

export async function verifyUsername(
  prevstate: stepFormState,
  FormData: FormData,
) {
  const inputusername = FormData.get("username");

  const username = await myPrisma.userProfile.findUnique({
    where: { username: String(inputusername) },
  });

  if (username) {
    return { ok: false, userMsg: "Nom d'utilisateur déjà pris" }; //translate //
  }

  return { ok: true, userMsg: "Nom disponible" };
}

export async function uploadImage(
  prevState: stepFormState,
  FormData: FormData,
) {
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
      const parseAvatar = uploadImageSchema.safeParse({ image: avatar });

      if (!parseAvatar.success) {
        return {
          ok: false,
          userMsg: `Impossible de téléchargé votre photo de profile, veuillez ressayé`,
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
      const parseBanner = uploadImageSchema.safeParse({ image: banner });

      if (!parseBanner.success) {
        return {
          ok: false,
          userMsg: "",
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
    return {
      ok: false,
      userMsg: "Echec lors de l'upload de l'image veuillez ressayé",
    };
  }

  return {
    ok: true,
    userMsg: "",
  };
}

export async function stepOneValidOnboarding(
  prevState: stepFormState,
  formData: FormData,
) {
  const session = await getSession();

  // Prendre toutes les propriété d'un coup //
  const raw = Object.fromEntries(formData.entries());

  // L'image est déjà géré par un autre serv action/schema ZOD donc ont la delete //
  delete raw.avatar;
  delete raw.banner;

  const parsed = onboardingSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      userMsg: "Erreur lors l'envoie des données",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await myPrisma.userProfile.updateMany({
    where: { userId: session?.user.id },
    // Ici spread operator prends toutes les propriété de parsed
    //  (objets avec tout ce que zod a parsé) et les envoie a data //
    data: { ...parsed, onboardedStep: 1 },
  });
  revalidatePath("/onboarding");
  return { ok: true, userMsg: "" };
}

export async function stepTwoValidOnboarding(id: string, FormData: FormData) {
  const userIntent = FormData.get("intent");
  const userCategories = FormData.get("categories");

  const parsed = onboardingSchemaStepTwo.safeParse({
    userIntent,
    userCategories,
  });

  if (!parsed.success) {
    return {
      ok: false,
      userMsg: "Erreur lors de l'envoie de données veuillez ressayé",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await myPrisma.userProfile.updateMany({
    where: { userId: id },

    data: { ...parsed, onboardedStep: 2 },
  });

  revalidatePath("/onboarding");

  return { ok: false, userMsg: true };
}
