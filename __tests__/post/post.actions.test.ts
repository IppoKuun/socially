// TEST A EFFECTUER :
//title + content, IA donne SAFE + categories, normalisez, SLUG, post a été créer, return ok true //
//title + content, IA donne UNCERTAINS, zod accepte, slug deja pris, post créer avec un return spécial
//title + Image, Zod invalide image
// title/content/image : Zod valide mais IA juge unsafe sur image, IA retourne UNSAFE avec Reasons + un tab des images, suppresion cloudinary marche bien return ok false avec moderationStatus
// title/Content : IA juge UNSAFE et retourne false, avec reasons
// Title/Content/Image : ZOD ok, cloudindary fail, erreur appropriée*
// Title/Content/image : ZOD accept, IA UNCERTAINS sur texte, slug deja pris, reffait un nv slug, return ok avec moderations unsafe
// Title/Content/Image : Tout doit bien passé et return ok: true, userMsg:"" //
// Tout est bon mais rateLimits atteints //

const mockModerationPost = jest.fn();
const mockGetSession = jest.fn();
const mockUserProfileFindUnique = jest.fn();
const mockRateLimit = jest.fn();
const mockuploadCloudinary = jest.fn();
const mockCreatePost = jest.fn();

jest.mock("@/lib/cloudinaryCondfig", () => ({
  uploadCloudinary: (...args: unknown[]) => mockuploadCloudinary(...args),
}));

jest.mock("@/lib/authSession", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

jest.mock("@/lib/IA", () => ({
  moderatePostContent: (...args: unknown[]) => mockModerationPost(...args),
}));

jest.mock("@/lib/prisma", () => ({
  myPrisma: {
    userProfile: {
      findUnique: (...args: unknown[]) => mockUserProfileFindUnique(...args),
    },
  },
}));

jest.mock("@/lib/prisma", () => ({
  myPrisma: {
    Post: {
      create: (...args: unknown[]) => mockCreatePost(...args),
    },
  },
}));

jest.mock("@/lib/rateLimits", () => ({
  rateLimits: (...args: unknown[]) => mockRateLimit(...args),
}));
