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
const mockSlug = jest.fn();
const mockSearchPost = jest.fn();
const mockDeleteCloudinary = jest.fn();

jest.mock("@/lib/cloudinaryConfig", () => ({
  uploadCloudinary: (...args: unknown[]) => mockuploadCloudinary(...args),
}));

jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      destroy: (...args: unknown[]) => mockDeleteCloudinary(...args),
    },
  },
}));

jest.mock("@/lib/authSession", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

jest.mock("@/lib/IA", () => ({
  moderatePostContent: (...args: unknown[]) => mockModerationPost(...args),
}));

jest.mock("@/lib/", () => ({
  generateSlug: (...args: unknown[]) => mockSlug(...args),
}));

jest.mock("@/lib/prisma", () => ({
  myPrisma: {
    userProfile: {
      findUnique: (...args: unknown[]) => mockUserProfileFindUnique(...args),
    },
    Post: {
      create: (...args: unknown[]) => mockCreatePost(...args),
      findUnique: (...args: unknown[]) => mockSearchPost(...args),
    },
  },
}));

jest.mock("@/lib/rateLimits", () => ({
  rateLimits: (...args: unknown[]) => mockRateLimit(...args),
}));

import { createPost } from "@/app/actions/post";
import { ModerationStatus } from "@prisma/client";

function createFormData(
  entries: Array<[string, string | File]>,
  multiEntries: Array<[string, string | File]> = [],
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
    mockUserProfileFindUnique.mockResolvedValue({
      userId: "testUserProfile-123",
    });

    mockRateLimit.mockResolvedValue({ success: true });

    mockuploadCloudinary.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/socially/default.png",
      public_id: "default-image",
    });
  }),
    afterEach(() => {
      consoleSpy.mockRestore();
    }));

  it("accept a normal payload with IA answer, zod parsing, creation of slug and post", async () => {
    mockModerationPost.mockResolvedValue({
      ModerationStatus: "SAFE",
      categories: "SPORTS",
    });
    // Cela veut dire que le slug n'est pas pris //
    mockSearchPost.mockResolvedValue({});
    mockSlug.mockResolvedValue({ slug: "js-meuilleure-language-V1StG_" });

    const state = await createPost(
      { ok: true, userMsg: "" },
      createFormData([
        ["title", "Js meuilleure language"],
        [
          "content",
          "Il permet de développer à la fois le frontend ET, le backend ",
        ],
      ]),
    );

    expect(state).toEqual({ ok: true, userMsg: "" });
    expect(mockCreatePost).toHaveBeenCalledWith({
      data: {
        title: "Js meuilleure language",
        slug: "js-meuilleure-language-V1StG_",
        ModerationStatus: "SAFE",
        content:
          "Il permet de développer à la fois le frontend ET, le backend ",
        imagesUrl: [],
        categries: "TECH",
        userId: "testUserProfile-123",
      },
    });
  });

  it("accept a normal payload but IA give incertain and slug is already taken", async () => {
    mockModerationPost.mockResolvedValue({
      ModerationStatus: "UNCERTAIN",
      categories: "TECH",
    });
    // Cela veut dire que le slug n'est pas pris //
    mockSearchPost.mockResolvedValue({ slug: "react_vs_vue-Jbzçsm" });

    mockSlug
      .mockResolvedValueOnce({ slug: "react_vs_vue-Jbzçsm" })
      .mockResolvedValueOnce({ slug: "react_vs_vue-8ez9eg5" });

    const state = await createPost(
      { ok: true, userMsg: "" },
      createFormData([
        ["title", "React vs Vue"],
        ["content", "Un comparatif détaillé des deux frameworks."],
      ]),
    );

    expect(state).toEqual({
      ok: true,
      userMsg: "Attention, votre post a été jugé sensible",
    });
    expect(mockSlug).toHaveBeenCalledTimes(2);
    expect(mockCreatePost).toHaveBeenCalledWith({
      data: {
        title: "",
        slug: "",
        content: "Un comparatif détaillé des deux frameworks.",
        categories: ["TECH"],
        ModerationStatus: "UNCERTAIN",
        imagesUrl: [],
        UserId: "testUserProfile-123",
      },
    });
  });
  it("zod reject if image isnt valid", async () => {
    const state = await createPost(
      { ok: false, userMsg: "" },
      createFormData([
        ["title", "POST with invalide image"],

        [
          "images",
          new File(["image1"], "fakeimage.png", { type: "image/gif" }),
        ],
        ["images", new File(["image2"], "real.png", { type: "image/png" })],
        [
          "images",
          new File(["image3"], "fakeimage3.png", { type: "image/gif" }),
        ],
      ]),
    );

    expect(state.error).toBeDefined();
    expect(mockModerationPost).not.toHaveBeenCalled();
    expect(mockuploadCloudinary).not.toHaveBeenCalled();
  });
  // title/content/image : Zod valide mais IA juge unsafe sur image, IA retourne UNSAFE avec Reasons + un tab des images, suppresion cloudinary marche bien return ok false avec moderationStatus

  it("accepte payload but IA juges images unsafe and return reasons with unsafeImage and images are deleted", async () => {
    mockModerationPost.mockResolvedValue({
      ModerationStatus: "UNSAFE",
      reasons: "Contenu de vos images beaucoup trop violent",
      unsafeImages: [0, 2],
    });
    mockDeleteCloudinary
      .mockResolvedValueOnce({ result: "ok" })
      .mockResolvedValueOnce({ result: "ok" })
      .mockResolvedValueOnce({ result: "ok" })
      .mockResolvedValueOnce({ result: "ok" });

    const state = await createPost(
      { ok: false, userMsg: "" },
      createFormData([
        ["title", "POST with unsafe image"],
        ["images", new File(["image1"], "unsafeImage", { type: "image/png" })],
        ["images", new File(["image2"], "safeImage", { type: "image/png" })],
        ["images", new File(["image3"], "unsafeImage2", { type: "image/png" })],
        ["images", new File(["image4"], "safeImage2", { type: "image/png" })],
      ]),
    );
    expect(state).toEqual({
      ok: false,
      userMsg: "Votre contenue viole notre politique d'utilisation",
      reasons: "Contenu beaucoup trop violent",
      unsafeImage: [0, 2],
    });
    expect(mockDeleteCloudinary).toHaveBeenCalledTimes(4);
    expect(mockCreatePost).not.toHaveBeenCalled();
  });
});
