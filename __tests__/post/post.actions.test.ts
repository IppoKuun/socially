const mockModerationPost = jest.fn();
const mockGetSession = jest.fn();
const mockUserProfileFindUnique = jest.fn();
const mockRateLimit = jest.fn();
const mockuploadCloudinary = jest.fn();
const mockCreatePost = jest.fn();
const mockSlug = jest.fn();
const mockSearchPost = jest.fn();
const mockDeleteCloudinary = jest.fn();
const mockGetZodErrorMapForRequest = jest.fn();
const mockGetTranslations = jest.fn();

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

jest.mock("@/lib/i18n/zod", () => ({
  getZodErrorMapForRequest: (...args: unknown[]) =>
    mockGetZodErrorMapForRequest(...args),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
}));

jest.mock("@/lib/authSession", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

jest.mock("@/lib/AI/postModerations", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockModerationPost(...args),
}));

jest.mock("@/lib/slug", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockSlug(...args),
}));

jest.mock("@/lib/prisma", () => ({
  myPrisma: {
    userProfile: {
      findUnique: (...args: unknown[]) => mockUserProfileFindUnique(...args),
    },
    post: {
      create: (...args: unknown[]) => mockCreatePost(...args),
      findUnique: (...args: unknown[]) => mockSearchPost(...args),
    },
  },
}));

jest.mock("@/lib/rateLimits", () => ({
  rateLimits: {
    postPublish: { limit: (...args: unknown[]) => mockRateLimit(...args) },
  },
}));

import createPost from "@/app/actions/post";

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

function createTranslationMock(namespace = "messages") {
  return (key: string) => `${namespace}.${key}`;
}

describe("app creation post", () => {
  let consoleSpy: jest.SpiedFunction<typeof console.error>;

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  (beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetTranslations.mockImplementation(async (namespace?: string) =>
      createTranslationMock(namespace),
    );
    mockGetZodErrorMapForRequest.mockResolvedValue(undefined);
    mockGetSession.mockResolvedValue({ user: { id: "testUser-123" } });
    mockUserProfileFindUnique.mockResolvedValue({
      id: "testUserProfile-123",
    });
    mockCreatePost.mockResolvedValue({
      id: "post-123",
      moderationStatus: "SAFE",
      categories: ["TECH"],
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
      moderationStatus: "SAFE",
      categories: ["TECH"],
    });
    // Cela veut dire que le slug n'est pas pris //
    mockSearchPost.mockResolvedValue({});
    mockSlug.mockResolvedValue("js-meuilleure-language-V1StG_");

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
        moderationStatus: "SAFE",
        content:
          "Il permet de développer à la fois le frontend ET, le backend ",
        imagesUrl: [],
        categories: ["TECH"],
        userId: "testUserProfile-123",
      },
    });
  });

  it("accept a normal payload but IA give incertain and slug is already taken", async () => {
    mockModerationPost.mockResolvedValue({
      moderationStatus: "UNCERTAIN",
      categories: ["TECH"],
    });

    mockCreatePost.mockResolvedValue({
      id: "post-123",
      moderationStatus: "UNCERTAIN",
    });

    // Cela veut dire que le slug n'est pas pris //
    mockSearchPost.mockResolvedValue("react_vs_vue-Jbzçsm");

    mockSlug
      .mockResolvedValueOnce("react_vs_vue-Jbzçsm")
      .mockResolvedValueOnce("react_vs_vue-8ez9eg5");

    const state = await createPost(
      { ok: true, userMsg: "" },
      createFormData([
        ["title", "React vs Vue"],
        ["content", "Un comparatif détaillé des deux frameworks."],
      ]),
    );

    expect(state).toEqual({
      ok: true,
      userMsg: "post.actions.create.sensitiveWarning",
    });
    expect(mockSlug).toHaveBeenCalled();
    expect(mockCreatePost).toHaveBeenCalledWith({
      data: {
        title: "React vs Vue",
        slug: "react_vs_vue-Jbzçsm",
        content: "Un comparatif détaillé des deux frameworks.",
        categories: ["TECH"],
        moderationStatus: "UNCERTAIN",
        imagesUrl: [],
        userId: "testUserProfile-123",
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
    expect(state.ok).toBe(false);
    expect(state.errors).toBeDefined();
    expect(mockModerationPost).not.toHaveBeenCalled();
    expect(mockuploadCloudinary).not.toHaveBeenCalled();
  });
  // title/content/image : Zod valide mais IA juge unsafe sur image, IA retourne UNSAFE avec Reasons + un tab des images, suppresion cloudinary marche bien return ok false avec moderationStatus

  it("accepte payload but IA juges images unsafe and return reasons with unsafeImage and images are deleted", async () => {
    mockModerationPost.mockResolvedValue({
      moderationStatus: "UNSAFE",
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
      createFormData(
        [["title", "POST with unsafe image"]],
        [
          [
            "images",
            new File(["image1"], "unsafeImage", { type: "image/png" }),
          ],
          ["images", new File(["image2"], "safeImage", { type: "image/png" })],
          [
            "images",
            new File(["image3"], "unsafeImage2", { type: "image/png" }),
          ],
          ["images", new File(["image4"], "safeImage2", { type: "image/png" })],
        ],
      ),
    );
    expect(state).toEqual({
      ok: false,
      userMsg: "post.actions.create.unsafeContent",
      reasons: "Contenu de vos images beaucoup trop violent",
      unsafeImages: [0, 2],
    });
    expect(mockDeleteCloudinary).toHaveBeenCalled();
    expect(mockCreatePost).not.toHaveBeenCalled();
  });
  it("reject If AI say title / CONTENT isnt appropriates", async () => {
    mockModerationPost.mockResolvedValue({
      moderationStatus: "UNSAFE",
      reasons: "Vous etes un danger pour la civilisation",
      unsafeImages: [],
    });
    mockCreatePost.mockResolvedValue({
      id: "post-123",
      moderationStatus: "UNCERTAIN",
    });
    const state = await createPost(
      { ok: true, userMsg: "" },
      createFormData([
        ["title", "Le rassemblement natrional est un bon partie politique"],
        [
          "content",
          "le RN est un bon partie politique, et veulent du bien de la France",
        ],
      ]),
    );

    expect(state).toEqual({
      ok: false,
      userMsg: "post.actions.create.unsafeContent",
      reasons: "Vous etes un danger pour la civilisation",
      unsafeImages: [],
    });
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it("reject because user rateLimits", async () => {
    mockRateLimit.mockResolvedValue({
      success: false,
      reset: Date.now() + 5 * 60 * 1000,
    });

    const state = await createPost(
      { ok: true, userMsg: "" },
      createFormData([
        ["title", "Etre productif en apprennant Next.js"],
        [
          "content",
          "Act sportif, bonne alimentation,  bon sommeil et motivation",
        ],
      ]),
    );

    expect(state).toEqual({
      ok: false,
      userMsg: "post.actions.create.rateLimited",
    });
    expect(mockCreatePost).not.toHaveBeenCalled();
    expect(mockModerationPost).not.toHaveBeenCalled();
  });
});
