import { expect, test, type Page } from "@playwright/test";
import { PageNotFoundError } from "next/dist/shared/lib/utils";
type SignupUser = {
  displayName: string;
  email: string;
  password: string;
  username: string;
};

function createSignupUser(): SignupUser {
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    displayName: `Playwright ${uniqueSuffix}`,
    email: `playwright+${uniqueSuffix}@example.com`,
    password: "Playwright123!",
    username: `playwright_${uniqueSuffix.replace(/-/g, "_")}`, // On remplace tiret par underscore car zod vas gueuler // ,
  };
}

function requireBaseURL(baseURL: string | undefined) {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required for the onboarding suite.");
  }

  return baseURL;
}

test.describe("Post Creation Flow", () => {
  test("publish a valid Post", async ({ page }) => {
    await page.goto("/fr/feed");

    await page.getByRole("button", { name: "Créer un post" }).click();

    await expect(page.getByText("Créer un post")).toBeVisible();

    await page.getByLabel("post-title").fill("PLAYWRIGHT-TEST");
    await page
      .getByLabel("post-content")
      .fill("Ceci est un post SAFE playwright");

    await page.getByRole("button", { name: "Publier" }).click();

    await expect(page.getByText("Créer un post")).not.toBeVisible();

    await expect(
      page.getByText("Ceci est un post SAFE playwright"),
    ).toBeVisible();
  });

  test("Reject a bad post if content is malicious", async ({ page }) => {
    await page.goto("/fr/feed");

    await page.getByRole("button", { name: "Créer un post" }).click();

    await expect(page.getByText("Créer un post")).toBeVisible();

    await page.getByLabel("post-title").fill("PLAYWRIGHT-TEST-MALICIOUS");
    await page
      .getByLabel("post-content")
      .fill(
        "Ce texte doit etre signalé comme UNSAFE par la modération, c'est un test de playwright pour s'assurer que tout fonctionne bien si le contenu est UNSAFE",
      );

    await page.getByRole("button", { name: "Publier" }).click();

    await expect(page.getByText("Créer un post")).toBeVisible();

    await expect(
      page.getByText(
        "Votre commentaire enfreint notre politique d'utilisation.",
      ),
    ).toBeVisible();

    await expect(
      page.getByText("Ceci est un post SAFE playwright"),
    ).toBeVisible();
  });
});
