// IA: Playwright
import { expect, test, type Page } from "@playwright/test";

type SignupUser = {
  displayName: string;
  email: string;
  password: string;
  username: string;
};

// Fonction pour créer un robot user, ont lui mets un suffix aléatoire pour que évitez les collisions d'unicité //
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

async function disableCookieBanner(baseURL: string, page: Page) {
  // Le contexte de page c'est une session avec les cookies/stockage et état de la session, on en a besoin ici pr ls cookies //
  await page.context().addCookies([
    {
      name: "cookie_consent",
      value: "false",
      url: baseURL,
    },
  ]);
}

test.describe("onboarding flow", () => {
  test("redirects anonymous traffic to the localized login page", async ({
    baseURL,
    page,
  }) => {
    await disableCookieBanner(requireBaseURL(baseURL), page);

    await page.goto("/fr");

    await expect(page).toHaveURL(/\/fr\/login$/);
    await expect(
      page.getByRole("heading", { name: "Créez votre compte" }),
    ).toBeVisible();
  });

  test("signs up a user and completes the onboarding journey", async ({
    baseURL,
    page,
  }) => {
    const user = createSignupUser();

    await disableCookieBanner(requireBaseURL(baseURL), page);
    await page.goto("/fr/login");

    await page.getByLabel("Nom").fill(user.displayName);
    await page.getByLabel("E-mail").fill(user.email);
    await page.getByLabel("Mot de passe").fill(user.password);
    await page.getByRole("button", { name: "Créer un compte" }).click();

    await expect(page).toHaveURL(/\/fr\/onboarding\/?$/);
    await expect(page.getByText("Créez votre profil")).toBeVisible();

    await page.locator('input[name="displayname"]').fill(user.displayName);
    await page.locator('input[name="username"]').fill(user.username);
    await page
      .locator('textarea[name="bio"]')
      .fill("Compte Playwright dédié à la validation du flux onboarding.");
    await page.locator('input[name="occupation"]').fill("QA automation");

    await expect(page.getByText("Nom d'utilisateur disponible.")).toBeVisible();
    await page
      .getByRole("button", { name: "Passer à l'étape suivante" })
      .click();

    await expect(page.getByText("Catégorie")).toBeVisible();
    await page.getByRole("button", { name: "TECH" }).click();
    await page.getByRole("button", { name: "BUSINESS" }).click();
    await page
      .getByRole("button", { name: "Passer à l'étape suivante" })
      .click();

    await expect(page.getByText("Intention")).toBeVisible();
    await page.locator('label[for="publish"]').click();
    await page
      .getByRole("button", { name: "Passer à l'étape suivante" })
      .click();

    await expect(page).toHaveURL(/\/fr\/feed\/?$/);
    await expect(page.getByText(/bienvenue dans feed/i)).toBeVisible();
  });
});
