import { expect, test, type Page } from "@playwright/test";

type SignupUser = {
  displayName: string;
  email: string;
  password: string;
  username: string;
};

function createSignupUser(): SignupUser {
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    displayName: `Playwright Settings ${uniqueSuffix}`,
    email: `playwright-settings+${uniqueSuffix}@example.com`,
    password: "Playwright123!",
    username: `playwright_settings_${uniqueSuffix.replace(/-/g, "_")}`,
  };
}

function requireBaseURL(baseURL: string | undefined) {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required for the settings suite.");
  }

  return baseURL;
}

async function disableCookieBanner(baseURL: string, page: Page) {
  await page.context().addCookies([
    {
      name: "cookie_consent",
      value: "false",
      url: baseURL,
    },
  ]);
}

async function signUpAndCompleteOnboarding(page: Page, user: SignupUser) {
  await page.goto("/fr/login");

  await page.getByLabel("Nom").fill(user.displayName);
  await page.getByLabel("E-mail").fill(user.email);
  await page.getByLabel("Mot de passe").fill(user.password);
  await page.getByRole("button", { name: "Créer un compte" }).click();

  await expect(page).toHaveURL(/\/fr\/onboarding\/?$/);
  await page.locator('input[name="displayname"]').fill(user.displayName);
  await page.locator('input[name="username"]').fill(user.username);
  await page
    .locator('textarea[name="bio"]')
    .fill("Compte Playwright dédié au flow settings.");
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
}

test.describe("settings flow", () => {
  test("downloads a well-formed JSON data export", async ({
    baseURL,
    page,
  }) => {
    const user = createSignupUser();
    await disableCookieBanner(requireBaseURL(baseURL), page);
    await signUpAndCompleteOnboarding(page, user);

    await page.goto("/fr/settings/data");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exporter" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^socially-export-.+\.json$/);

    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();

    let rawPayload = "";
    for await (const chunk of stream!) {
      rawPayload += chunk.toString();
    }

    const payload = JSON.parse(rawPayload) as {
      exportedAt: string;
      profile: {
        username: string | null;
        displayName: string | null;
        bio: string | null;
        language: string | null;
        createdAt: string;
        isPro: boolean;
      };
      posts: unknown[];
      likes: unknown[];
      comments: unknown[];
      tracking: Record<string, unknown>;
    };

    expect(new Date(payload.exportedAt).toString()).not.toBe("Invalid Date");
    expect(payload.profile).toMatchObject({
      username: user.username,
      displayName: user.displayName,
      bio: "Compte Playwright dédié au flow settings.",
      isPro: false,
    });
    expect(new Date(payload.profile.createdAt).toString()).not.toBe(
      "Invalid Date",
    );
    expect(Array.isArray(payload.posts)).toBe(true);
    expect(Array.isArray(payload.likes)).toBe(true);
    expect(Array.isArray(payload.comments)).toBe(true);
    expect(payload.tracking).toHaveProperty("hasAcceptedCookies");
    expect(payload.tracking).toHaveProperty("visitCountBeforeLogin");
  });

  test("shows the restore account modal after a soft-deleted user signs in again", async ({
    baseURL,
    page,
  }) => {
    const user = createSignupUser();
    await disableCookieBanner(requireBaseURL(baseURL), page);
    await signUpAndCompleteOnboarding(page, user);

    await page.goto("/fr/settings/account");
    await page.getByRole("button", { name: "Supprimer mon compte" }).click();

    await expect(
      page.getByRole("dialog", {
        name: "Voulez-vous supprimer votre compte ?",
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Oui, supprimer" }).click();
    await expect(
      page.getByRole("heading", { name: "Compte en attente de suppression" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/fr\/login\/?$/);

    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByRole("heading", { name: "Bon retour" }),
    ).toBeVisible();

    await page.getByLabel("E-mail").fill(user.email);
    await page.getByLabel("Mot de passe").fill(user.password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(
      page.getByRole("heading", { name: "Compte en attente de suppression" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Annuler la suppression" }),
    ).toBeVisible();
  });
});
