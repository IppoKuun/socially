import { z } from "zod";
import { Category, Intent } from "@prisma/client";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const USERNAME_REGEX = /^[a-z0-9_]+$/;

export const uploadImageSchema = z.object({
  image: z
    .any() // On utilise any car 'File' n'existe pas côté serveur en standard TS pur

    // On vérifie que le type et taille sois cohérent //
    .refine((file) => file?.size <= MAX_FILE_SIZE, {
      params: {
        // Obligé de définir les clé pour i18n car c'est une erreur personnalisé et n'as pas de code pourça //
        i18n: {
          key: "validation.imageTooLarge",
          values: {
            maximum: MAX_FILE_SIZE / 1000000,
          },
        },
      },
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), {
      params: {
        i18n: "validation.invalidImageType",
      },
    }),
});
export const onboardingSchema = z.object({
  username: z
    .string()
    .min(2)
    .max(20)
    .trim()
    .toLowerCase()
    .refine((value) => USERNAME_REGEX.test(value), {
      params: {
        i18n: "validation.usernamePattern",
      },
    }),
  displayname: z.string().min(2).max(30).trim(),

  bio: z
    .string()
    .trim()
    .max(160)
    .transform((v) => (v === "" ? null : v)), // On transforme tout les string vide en null  //

  avatarUrl: z
    .string()
    .url()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  occupation: z
    .string()
    .max(30)
    .trim()
    .transform((v) => (v === "" ? null : v)),
});

export const onboardingSchemaStepTwo = z.object({
  categories: z.nativeEnum(Category),
  intent: z.nativeEnum(Intent),
});

export type onboardingSchemaTwo = z.infer<typeof onboardingSchemaStepTwo>;
export type onboardingSchemaOne = z.infer<typeof onboardingSchema>;
export type zodUploadimageSchema = z.infer<typeof uploadImageSchema>;
