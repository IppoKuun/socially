import { z } from "zod";
import { Category, Intent } from "@prisma/client";

// LES MESSAGES SONT A REFAIRE AVEC I18N //
const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const uploadImageSchema = z.object({
  image: z
    .any() // On utilise any car 'File' n'existe pas côté serveur en standard TS pur

    // On vérifie que le type et taille sois cohérent //
    .refine(
      (file) => file?.size <= MAX_FILE_SIZE,
      `L'image ne doit pas dépasser 5Mo.`,
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Seuls les formats .jpg, .jpeg, .png et .webp sont acceptés.",
    ),
});
// MESSAGE D'ERREUR GERER PAR ZOD i18n //
export const onboardingSchema = z.object({
  username: z.string().min(3),
  displayName: z.string().min(15).optional(),
  bio: z.string().min(200).optional(),
  intent: z.enum(["PUBLISH", "READ", "DEBATE", "NETWORK"]),
  occupation: z.string().min(35),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const onboardingSchemaStepTwo = z.object({
  categories: z.nativeEnum(Category),
  intent: z.nativeEnum(Intent),
});

export type onboardingSchemaTwo = z.infer<typeof onboardingSchemaStepTwo>;
export type onboardingSchemaOne = z.infer<typeof onboardingSchema>;
export type zodUploadimageSchema = z.infer<typeof uploadImageSchema>;
