import { z } from "zod";

const postLimitSize = 8000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const uploadImageSchema = z.object({
  image: z
    .array(
      z
        .any()
        // On utilise any car 'File' n'existe pas côté serveur en standard TS pur

        // On vérifie que le type et taille sois cohérent //
        .refine((file) => file?.size <= postLimitSize, {
          params: {
            // Obligé de définir les clé pour i18n car c'est une erreur personnalisé et zod n'as pas de code pourça //
            i18n: {
              key: "validation.imageTooLarge",
              values: {
                maximum: postLimitSize / 1000000,
              },
            },
          },
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), {
          params: {
            i18n: "validation.invalidImageType",
          },
        }),
    )
    .min(1)
    .max(5),
});

export const postSchema = z.object({
  title: z.string().max(100).trim().min(3),
  content: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? null : v)),
  imagesUrl: z.array(z.url()).optional(),
});

export type postSchemaType = z.infer<typeof postSchema>;
