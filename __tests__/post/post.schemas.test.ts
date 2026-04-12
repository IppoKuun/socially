import { postSchema } from "@/lib/validations.ts/post";

describe("post schema", () => {
  it("normalise and accept a valid input", () => {
    const result = postSchema.safeParse({
      title: "    Les meuilleurs IA pour dev   ",
      content: "Codex et Claude",
      imagesUrl: "https://chatgpt.com/fr-FR",
    });
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Les meuilleurs IA pour dev");
    expect(result.data?.imagesUrl).toBe("https://chatgpt.com/fr-FR");
  });
  it("reject if title is not present", () => {
    const result = postSchema.safeParse({
      content: "ChatGPT est la meuilleur IA",
      imagesUrl: "https://chatgpt.com/fr-FR",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toBeDefined();
  });

  it("reject a bad images URL", () => {
    const result = postSchema.safeParse({
      title: "Nouveau modele gemini",
      content: "Le nouveau modele Gemin est meuilleur que tout les autres",
      imagesUrl: "gemini.fr",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.imagesUrl).toBeDefined();
  });
});
