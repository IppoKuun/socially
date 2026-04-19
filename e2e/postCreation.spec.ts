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
  test("", async () => {});
});
