"use server";
import Moderation from "@/lib/AI/postModerations";
import { FormState } from "../[locale]/login/_actions/actions";
import { postSchema, uploadImageSchema } from "@/lib/validations.ts/post";
import { uploadCloudinary } from "@/lib/cloudinaryConfig";
import { v2 as cloudinary } from "cloudinary";
import { getZodErrorMapForRequest } from "@/lib/i18n/zod";

export default async function createPost(
  _prevstate: FormState,
  FormData: FormData,
) {
  const errorMap = await getZodErrorMapForRequest();

  const raw = Object.fromEntries(FormData);

  const images = FormData.getAll("file").filter(
    (entry): entry is File => entry instanceof File,
  );
  const results = await Promise.all(
    images.map((image) => uploadCloudinary(image)),
  );

  const urls = results.map((r) => r.secure_url);
  const ids = results.map((r) => r.public_id);
  const moderation = await Moderation({
    language: String(raw.language) ?? "en",
    kind: "POST",
    title: String(raw.title),
    content: String(raw.content),
    imageUrl: urls,
  });

  if (moderation.ModerationStatus === "UNSAFE") {
    const result = await Promise.all(
      ids.map((id) =>
        cloudinary.uploader.destroy(id, { resource_type: "image" }),
      ),
    );

    if (!result) {
      console.error("Impossible de supprimé images après rejets d'IA");
    }
  }

  const imagesParsed = await Promise.all(
    images.map((image) => uploadImageSchema.safeParse(image)),
  );

  if (!imagesParsed) {
    return { ok: false, errors: imagesParsed.error.flatten().fieldErrors };
  }

  const parsed = postSchema.safeParse({ raw }, { error: errorMap });
  if (!parsed) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  return { ok: true, userMsg: "" };
}
