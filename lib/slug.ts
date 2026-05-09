import { nanoid } from "nanoid";
import slugify from "slugify";
import { myPrisma } from "./prisma";

export default async function generateSlug(title: string) {
  const slugID = nanoid(6);
  const baseSlug = slugify(title, {
    lower: true, // tout en minuscule
    strict: true, // enlève les caractères spéciaux (!, @, #)
    trim: true, // enlève les espaces inutiles
  });
  const slug = `${baseSlug}-${slugID}`;
  const verifySlug = await myPrisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (verifySlug) return await generateSlug(title);

  return slug;
}
