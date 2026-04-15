import { z } from "zod";

export const POST_IMAGE_MAX_SIZE = 8_000_000;
export const POST_IMAGE_MAX_COUNT = 10;
export const POST_ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const uploadImageSchema = z.object({
  image: z
    .array(
      z
        .any()
        // On utilise any car 'File' n'existe pas côté serveur en standard TS pur

        // On vérifie que le type et taille sois cohérent //
        .refine((file) => file?.size <= POST_IMAGE_MAX_SIZE, {
          params: {
            // Obligé de définir les clé pour i18n car c'est une erreur personnalisé et zod n'as pas de code pourça //
            i18n: {
              key: "validation.imageTooLarge",
              values: {
                maximum: POST_IMAGE_MAX_SIZE / 1000000,
              },
            },
          },
        })
        .refine((file) => POST_ACCEPTED_IMAGE_TYPES.includes(file?.type), {
          params: {
            i18n: "validation.invalidImageType",
          },
        }),
    )
    .max(10)
    .optional(),
});

export const postSchema = z.object({
  title: z.string().max(100).trim().min(3),
  content: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? null : v)),
  imagesUrl: z.array(z.string().url()).optional(),
});

export type postSchemaType = z.infer<typeof postSchema>;
