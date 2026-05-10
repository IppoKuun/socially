// On mocke toutes les fonctions qu'on vas utilisé pour isoler les fonction de situation de prod  //

const mockUploadCloudinary = jest.fn();
const mockGetSession = jest.fn();
const mockGetZodErrorMapForRequest = jest.fn();
const mockUserProfileFindUnique = jest.fn();
const mockUserProfileUpdate = jest.fn();
const mockGetTranslations = jest.fn();
const mockRevalidatePath = jest.fn();

// Ont passe tout les arguments que les fonctions recoivent pouyr les transmettre a leurs fonction mocker (car on vas utilisé leurs résultat)
// Ce qui vas également nous permettre d'évitez le hoisting //
jest.mock("@/lib/cloudinaryConfig", () => ({
  uploadCloudinary: (...args: unknown[]) => mockUploadCloudinary(...args),
}));

jest.mock("@/lib/authSession", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

jest.mock("@/lib/i18n/zod", () => ({
  getZodErrorMapForRequest: (...args: unknown[]) =>
    mockGetZodErrorMapForRequest(...args),
}));

jest.mock("@/lib/prisma", () => ({
  myPrisma: {
    userProfile: {
      findUnique: (...args: unknown[]) => mockUserProfileFindUnique(...args),
      update: (...args: unknown[]) => mockUserProfileUpdate(...args),
    },
  },
}));

jest.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
}));

jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

import {
  stepOneValidOnboarding,
  stepThreeValidOnboarding,
  stepTwoValidOnboarding,
  uploadImage,
  verifyUsername,
} from "@/app/[locale]/onboarding/_actions/actions";

// Dans les test, cette fonction vas naturellement appelé getTranslations car les message en dépende
// Quand elle sera appelé elle prendra le nom de la translation définie par :
// const t = await getTranslations("nom");  //
// Le nom sera alors le namespace. Et la fonction retournera une autre fonction qui prends en argument une clé
// Cette clé est juste le nom de la clé translation qui a appelée getTranslation
// Ex : si serv action tombe sur t("taken") taken devient la clé car le resultat vient de la fonction getTranslations
function createTranslationMock(namespace = "messages") {
  return (key: string) => `${namespace}.${key}`;
}

// Pour simuler vrai formulaire, ont vas créer une fonction qui prends des tuples,
// et pour chaque clée/ valeur de ce tuples ont le mets dans un form Créer //
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
  // MultiEntries car, si plusieurs valeur on ne peut pas les ajoutez avec un simple set, append est obligatoire.

  return formData;
}

describe("onboarding server actions", () => {
  // Initialisation de notre espion qui vas avoir comme but de voir ce que la console renvoie si il y'a une err
  // Ont fait une variable car son utilisation dépends d'énormement de chose qui sont spécifique a un test,
  // et modifié la variable la modifie pour tout les fichier, d'ou la nécessité de n'en pas faire une variable .
  // Chaque test pourra alors la custom comme il le veut //
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  // Avant chaque test ont remplace la vrai fonction console.error par la notre //
  // et créer des values de base qui seront utile dans nos test //
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetSession.mockResolvedValue({ user: { id: "user-123" } });
    mockGetTranslations.mockImplementation(async (namespace?: string) =>
      createTranslationMock(namespace),
    );

    // Undefined car on veut pas vérifié ce que i18n zod renvoie en cas d'erreur
    // Mais juste si ZOD a bien parsé. //
    mockGetZodErrorMapForRequest.mockResolvedValue(undefined);
    mockUserProfileFindUnique.mockResolvedValue(null);
    mockUserProfileUpdate.mockResolvedValue({});
    mockUploadCloudinary.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/socially/default.png",
      public_id: "default-image",
    });
  });

  // Après chaque test ont reset ce qu'il y'a dans notre console.error qu'on a créer avec notre espion //
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("verifyUsername", () => {
    it("returns a translated error when no username is provided", async () => {
      const result = await verifyUsername(
        { ok: true, userMsg: "" },
        new FormData(),
      );

      expect(result).toEqual({
        ok: false,
        userMsg: "onboarding.actions.verifyUsername.missingUsername",
      });
      expect(mockUserProfileFindUnique).not.toHaveBeenCalled();
    });

    it("rejects a username already used by another user", async () => {
      mockUserProfileFindUnique.mockResolvedValueOnce({ userId: "user-999" });
      // Ici, ont dit que findunique doit renvoyez qlq chose, si c'est le cas ça veut dire que username est déjà attibué //

      const result = await verifyUsername(
        { ok: true, userMsg: "" },
        createFormData([["username", "Existing_User"]]),
      );

      expect(mockUserProfileFindUnique).toHaveBeenCalledWith({
        where: { username: "existing_user" },
        select: { userId: true },
      });
      expect(result).toEqual({
        ok: false,
        userMsg: "onboarding.actions.verifyUsername.taken",
      });
    });

    it("allows the current user to keep their own username", async () => {
      mockUserProfileFindUnique.mockResolvedValueOnce({ userId: "user-123" });

      const result = await verifyUsername(
        { ok: true, userMsg: "" },
        createFormData([["username", "existing_user"]]),
      );

      expect(result).toEqual({
        ok: true,
        userMsg: "onboarding.actions.verifyUsername.available",
      });
    });
  });

  describe("stepOneValidOnboarding", () => {
    it("returns field errors when the first step payload is invalid", async () => {
      const result = await stepOneValidOnboarding(
        { ok: true, userMsg: "" },
        createFormData([
          ["username", "Invalid Username"],
          ["displayname", "J"],
          ["bio", ""],
          ["occupation", ""],
        ]),
      );

      expect(result.ok).toBe(false);
      expect(result.errors?.username).toBeDefined();
      expect(result.errors?.displayname).toBeDefined();
      expect(mockUserProfileUpdate).not.toHaveBeenCalled();
      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });

    it("persists the normalized first step payload and revalidates onboarding", async () => {
      const result = await stepOneValidOnboarding(
        { ok: true, userMsg: "" },
        createFormData([
          ["username", "  John_Doe  "],
          ["displayname", "  John Doe  "],
          ["bio", ""],
          ["occupation", ""],
          ["avatar", new File(["avatar"], "avatar.png", { type: "image/png" })],
          [
            "banner",
            new File(["banner"], "banner.webp", { type: "image/webp" }),
          ],
        ]),
      );

      expect(mockUserProfileUpdate).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        data: {
          username: "john_doe",
          displayname: "John Doe",
          bio: null,
          occupation: null,
          onboardedStep: 1,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/onboarding");
      expect(result).toEqual({ ok: true, userMsg: "" });
    });

    it("returns a translated submit error when persistence fails", async () => {
      mockUserProfileUpdate.mockRejectedValueOnce(new Error("db unavailable"));
      // Erreur si prisma Fail //

      const result = await stepOneValidOnboarding(
        { ok: true, userMsg: "" },
        createFormData([
          ["username", "john_doe"],
          ["displayname", "John Doe"],
          ["bio", ""],
          ["occupation", ""],
        ]),
      );

      expect(result).toEqual({
        ok: false,
        userMsg: "onboarding.actions.stepOne.submitFailed",
      });
      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("stepTwoValidOnboarding", () => {
    it("returns field errors when no category is selected", async () => {
      const result = await stepTwoValidOnboarding(
        { ok: true, userMsg: "" },
        new FormData(),
      );

      expect(result.ok).toBe(false);
      expect(result.errors?.categories).toBeDefined();
      expect(mockUserProfileUpdate).not.toHaveBeenCalled();
    });

    it("updates the selected categories and onboarding step", async () => {
      const result = await stepTwoValidOnboarding(
        { ok: true, userMsg: "" },
        createFormData(
          [],
          [
            ["categories", "TECH"],
            ["categories", "BUSINESS"],
          ],
        ),
      );

      expect(mockUserProfileUpdate).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        data: {
          categories: { set: ["TECH", "BUSINESS"] },
          onboardedStep: 2,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/onboarding");
      expect(result).toEqual({ ok: true, userMsg: "" });
    });
  });

  describe("stepThreeValidOnboarding", () => {
    it("marks onboarding as completed when the intent is valid", async () => {
      const result = await stepThreeValidOnboarding(
        { ok: true, userMsg: "" },
        createFormData([["intent", "PUBLISH"]]),
      );

      expect(mockUserProfileUpdate).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        data: {
          intent: "PUBLISH",
          onboardedStep: 3,
          hasOnboarded: true,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/onboarding");
      expect(result).toEqual({ ok: true, userMsg: "" });
    });
  });

  describe("uploadImage", () => {
    it("returns the first validation message when the avatar file is invalid", async () => {
      const result = await uploadImage(
        { ok: true, userMsg: "" },
        createFormData([
          ["avatar", new File(["avatar"], "avatar.gif", { type: "image/gif" })],
        ]),
      );

      expect(result.ok).toBe(false);
      expect(result.errors?.image?.[0]).toBeDefined();
      expect(result.userMsg).toBe(result.errors?.image?.[0]);
      expect(mockUploadCloudinary).not.toHaveBeenCalled();
      expect(mockUserProfileUpdate).not.toHaveBeenCalled();
    });

    it("returns a translated fallback when Cloudinary upload fails", async () => {
      mockUploadCloudinary.mockRejectedValueOnce(new Error("upload failed"));

      const result = await uploadImage(
        { ok: true, userMsg: "" },
        createFormData([
          ["avatar", new File(["avatar"], "avatar.png", { type: "image/png" })],
        ]),
      );

      expect(result).toEqual({
        ok: false,
        userMsg: "onboarding.actions.uploadImage.unexpectedError",
      });
    });
  });
});
