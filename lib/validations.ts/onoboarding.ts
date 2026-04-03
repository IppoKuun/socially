import { z } from "zod";

// LES MESSAGES SONT A REFAIRE AVEC I18N //
const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const uploadImage = z.object({
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
});
