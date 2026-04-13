"use server";
import Moderation from "@/lib/AI/postModerations";
import { FormState } from "../[locale]/login/_actions/actions";
import { postSchema, uploadImageSchema } from "@/lib/validations.ts/post";
import { uploadCloudinary } from "@/lib/cloudinaryConfig";
import { v2 as cloudinary } from "cloudinary";
import { getZodErrorMapForRequest } from "@/lib/i18n/zod";
import { nanoid } from "nanoid";
import { myPrisma } from "@/lib/prisma";
import slugify from "slugify";
import { getSession } from "@/lib/authSession";

export default async function createPost(
  _prevstate: FormState,
  FormData: FormData,
) {
  const errorMap = await getZodErrorMapForRequest();

  const raw = Object.fromEntries(FormData);

  const images = FormData.getAll("file").filter(
    (entry): entry is File => entry instanceof File,
  );

  const imagesParsed = images.map((image) => {
    const result = uploadImageSchema.safeParse(image);

    if (!result.success) {
      return {
        ok: false,
        errors: result.error.flatten().fieldErrors,
      };
    }
  });

  if (!imagesParsed) {
  }
  const results = await Promise.all(
    images.map((image) => uploadCloudinary(image)),
  );
  if (!results) {
    return {
      ok: false,
      userMsg: "L'envoie d'images a échoué, veuillez ressayé",
    };
  }

  const urls = results.map((r) => r.secure_url);
  const ids = results.map((r) => r.public_id);
  const moderation = await Moderation({
    language: String(raw.language) ?? "en",
    kind: "POST",
    title: String(raw.title),
    content: String(raw.content),
    imageUrl: urls,
  });
  if (!moderation) {
    return {
      ok: false,
      userMsg: "Impossible de modéré le status du post avec l'IA.",
    };
  }
  const IAcategories = moderation.categories;

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

  const parsed = postSchema.safeParse({ raw }, { error: errorMap });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  async function generateSlug() {
    const slugID = nanoid(6);
    const baseSlug = slugify(parsed.data!.title, {
      lower: true, // tout en minuscule
      strict: true, // enlève les caractères spéciaux (!, @, #)
      trim: true, // enlève les espaces inutiles
    });
    const slug = `${baseSlug}-${slugID}`;
    const verifySlug = await myPrisma.post.findUnique({
      where: { slug: slug },
    });
    while (verifySlug) {
      return await generateSlug();
    }
    return slug;
  }

  const postSlug = await generateSlug();

  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: " Veuillez vous connctez pour publiez" };
  }
  const user = await myPrisma.userProfile.findUnique({
    where: { id: session.user.id },
  });

  const created = await myPrisma.post.create({
    data: {
      title: parsed.data!.title,
      moderationStatus: moderation.moderationStatus,
      slug: postSlug,
      content: parsed.data?.content,
      imagesUrl: urls,
      categories: IAcategories,
      userId: user!.id,
    },
  });

  if (!created) {
    return { ok: false, userMsg: "Impossible de créer le post" };
  }

  return { ok: true, userMsg: "" };
}
