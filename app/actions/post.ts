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
import { rateLimits } from "@/lib/rateLimits";

export default async function createPost(
  _prevstate: FormState,
  FormData: FormData,
) {
  const errorMap = await getZodErrorMapForRequest();

  const session = await getSession();
  if (!session) {
    return { ok: false, userMsg: "Veuillez vous connctez pour publiez" };
  }
  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const limiter = rateLimits["postPublish"];

  const idUser = user?.id;
  const identifier = idUser ?? session.user.id;

  if (!identifier) {
    return {
      ok: false,
      userMsg: "Requête rejetée : Impossible d'identifier la source.",
    };
  }
  const { success, reset } = await limiter.limit(identifier!);
  // Erreur si limite attente //
  if (!success) {
    const diffMs = reset - Date.now();
    const seconds = Math.ceil(diffMs / (1000 * 60)).toFixed(1);
    return {
      ok: false,
      userMsg: `Vous avez effectué trop de requete, veuilleuez ressayé dans : ${seconds} min`,
    };
  }
  const raw = Object.fromEntries(FormData);

  // On vérifie que chaque images a le bon type, sinon erreur //
  const rawFiles = FormData.getAll("images").every(
    (entry): entry is File => entry instanceof File,
  );

  if (!rawFiles) {
    return { ok: false, userMsg: "Veuillez entrez que des images" };
  }

  // Parsing de chaque image avec Zod, qui vas nous permettre d'upload sur Cloudinary
  // Et enfin, envoyez les images a l'IA moderation qui a besoin de ces URL pour modéré les images//

  const images = FormData.getAll("images");
  images.map((image) => {
    const result = uploadImageSchema.safeParse(image, { error: errorMap });

    if (!result.success) {
      return {
        ok: false,
        userMsg: "Erreur lors de l'envoie de votre image",
        errors: result.error.flatten().fieldErrors,
      };
    }
  });

  const results = await Promise.all(
    images.map((image) => uploadCloudinary(image as File)),
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
    // Ici, ont logge l'erreur pour nous meme et pas pour User car aucune utilisé a ce qu'il sois
    // au courant que l'image n'est pas réussi a cloudinary Après que son poste est été jugée unsafe //
    if (!result) {
      console.error("Impossible de supprimé images après rejets d'IA");
    }

    return {
      ok: false,
      userMsg: "Votre contenue viole notre politique d'utilisation",
      reasons: moderation.reasons,
    };
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
    // Tant qu'on trouve un slug existant, on refait la fonction //
    while (verifySlug) {
      return await generateSlug();
    }
    return slug;
  }

  const postSlug = await generateSlug();

  const created = await myPrisma.post.create({
    data: {
      title: parsed.data.title,
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

  if (created.moderationStatus === "UNCERTAIN") {
    return { ok: true, userMsg: " Attention, votre post a été jugé sensible" };
  }

  return { ok: true, userMsg: "" };
}
