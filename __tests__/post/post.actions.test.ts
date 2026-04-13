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

import { createPost } from "@/app/actions/post";

function createFormData(
  entries: Array<[string, string | File]>,
  multiEntries: Array<[string, string]> = [],
) {
  const formData = new FormData();

  for (const [key, value] of entries) {
    formData.set(key, value);
  }

  for (const [key, value] of multiEntries) {
    formData.append(key, value);
  }

  return formData;
}

describe("app creation post", () => {
  // Initialisation de notre espion qui vas avoir comme but de voir ce que la console renvoie en cas d'erreur
  // Ont fait une variable car son utilisation dépends d'énormement de chose qui sont spécifique a un test,
  // et modifié la variable la modifie pour tout les fichier, donc ici on s'occupe uniquement de typé l'espion sur la console.error  .
  // Chaque test pourra alors custom et définir la variable comme il le souhaite //
  let consoleSpy: jest.SpiedFunction<typeof console.error>;

  // Avant chaque test ont remplace la vrai fonction console.error par la notre //
  // et créer des values de base qui seront utile dans nos test //

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  (beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetSession.mockResolvedValue({ user: { id: "testUser-123" } });
    mockuploadCloudinary.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/socially/default.png",
      public_id: "default-image",
    });
  }),
    afterEach(() => {
      consoleSpy.mockRestore();
    }));

  it("accept and give a category to a normal post");
  // Après chaque test ont reset ce qu'il y'a dans notre console.error qu'on a créer avec notre espion //
});
