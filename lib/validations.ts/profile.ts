import { z } from "zod";

export const PROFILE_DISPLAYNAME_MIN = 2;
export const PROFILE_DISPLAYNAME_MAX = 30;
export const PROFILE_BIO_MAX = 160;
export const PROFILE_AVATAR_MAX_SIZE = 5_000_000;
export const USERNAME_REGEX = /^[a-z0-9_]+$/;
export const PROFILE_USERNAME_MAX = 30;
export const PROFILE_USERNAME_MIN = 2;

export const PROFILE_ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const uploadProfilImage = z.object({
  image: z
    .any()

    .refine((file) => file?.size <= PROFILE_AVATAR_MAX_SIZE, {
      params: {
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

export const modifyProfileSchema = z.object({
  displayname: z
    .string()
    .min(PROFILE_DISPLAYNAME_MIN)
    .max(PROFILE_DISPLAYNAME_MAX)
    .trim(),

  bio: z
    .string()
    .trim()
    .max(PROFILE_BIO_MAX)
    .transform((v) => (v === "" ? null : v)),

  avatarUrl: z
    .string()
    .url()
    .optional()
    .transform((v) => (v === "" ? null : v)),
});

export type modifyProfilSchema = z.infer<typeof modifyProfileSchema>;
