import { z } from "zod";
import { Category, Intent } from "@prisma/client";
import {
  PROFILE_ACCEPTED_IMAGE_TYPES,
  PROFILE_AVATAR_MAX_SIZE,
  PROFILE_BIO_MAX,
  PROFILE_DISPLAYNAME_MAX,
  PROFILE_DISPLAYNAME_MIN,
  PROFILE_USERNAME_MAX,
  PROFILE_USERNAME_MIN,
  USERNAME_REGEX,
} from "./profile";

export const uploadImageSchema = z.object({
  image: z
    .any() // On utilise any car 'File' n'existe pas côté serveur en standard TS pur

    // On vérifie que le type et taille sois cohérent //
    .refine((file) => file?.size <= PROFILE_AVATAR_MAX_SIZE, {
      params: {
        // Obligé de définir les clé pour i18n car c'est une erreur personnalisé et n'as pas de code pourça //
        i18n: {
          key: "validation.imageTooLarge",
          values: {
            maximum: PROFILE_AVATAR_MAX_SIZE / 1000000,
          },
        },
      },
    })
    .refine((file) => PROFILE_ACCEPTED_IMAGE_TYPES.includes(file?.type), {
      params: {
        i18n: "validation.invalidImageType",
      },
    }),
});
export const onboardingSchema = z.object({
  username: z
    .string()
    .min(PROFILE_USERNAME_MIN)
    .max(PROFILE_USERNAME_MAX)
    .trim()
    .toLowerCase()
    .refine((value) => USERNAME_REGEX.test(value), {
      params: {
        i18n: "validation.usernamePattern",
      },
    }),
  displayname: z
    .string()
    .min(PROFILE_DISPLAYNAME_MIN)
    .max(PROFILE_DISPLAYNAME_MAX)
    .trim(),

  bio: z
    .string()
    .trim()
    .max(PROFILE_BIO_MAX)
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
  categories: z.array(z.nativeEnum(Category)).min(1),
});

export const onboardingSchemaStepThree = z.object({
  intent: z.nativeEnum(Intent),
});

export type onboardingSchemaThree = z.infer<typeof onboardingSchemaStepThree>;
export type onboardingSchemaTwo = z.infer<typeof onboardingSchemaStepTwo>;
export type onboardingSchemaOne = z.infer<typeof onboardingSchema>;
export type zodUploadimageSchema = z.infer<typeof uploadImageSchema>;
