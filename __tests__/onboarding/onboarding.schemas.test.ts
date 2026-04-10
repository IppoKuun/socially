import { Category, Intent } from "@prisma/client";

import {
  onboardingSchema,
  onboardingSchemaStepThree,
  onboardingSchemaStepTwo,
  uploadImageSchema,
} from "@/lib/validations.ts/onboarding";

describe("onboarding schemas", () => {
  describe("onboardingSchema", () => {
    it("normalizes the first-step payload before persistence", () => {
      const result = onboardingSchema.safeParse({
        username: "  John_Doe  ",
        displayname: "  John Doe  ",
        bio: "",
        occupation: "",
      });

      expect(result.success).toBe(true);

      if (!result.success) {
        throw new Error("Expected onboardingSchema to parse successfully");
      }

      expect(result.data).toEqual({
        username: "john_doe",
        displayname: "John Doe",
        bio: null,
        occupation: null,
      });
    });

    it("rejects usernames that do not match the allowed pattern", () => {
      const result = onboardingSchema.safeParse({
        username: "John Doe",
        displayname: "John",
      });

      expect(result.success).toBe(false);

      if (result.success) {
        throw new Error("Expected onboardingSchema to fail");
      }

      expect(result.error.flatten().fieldErrors.username).toBeDefined();
    });
  });

  describe("onboardingSchemaStepTwo", () => {
    it("requires at least one valid category", () => {
      const result = onboardingSchemaStepTwo.safeParse({
        categories: [],
      });

      expect(result.success).toBe(false);

      if (result.success) {
        throw new Error("Expected onboardingSchemaStepTwo to fail");
      }

      expect(result.error.flatten().fieldErrors.categories).toBeDefined();
    });

    it("accepts valid Prisma category enums", () => {
      const result = onboardingSchemaStepTwo.safeParse({
        // Ont mets categories comme objets pour bien s'assurer qu'on vise le bon type //
        categories: [Category.TECH, Category.BUSINESS],
      });

      expect(result.success).toBe(true);

      if (!result.success) {
        throw new Error(
          "Expected onboardingSchemaStepTwo to parse successfully",
        );
      }

      expect(result.data.categories).toEqual([
        Category.TECH,
        Category.BUSINESS,
      ]);
    });
  });

  describe("onboardingSchemaStepThree", () => {
    it("accepts a valid intent enum", () => {
      const result = onboardingSchemaStepThree.safeParse({
        intent: Intent.PUBLISH,
      });

      expect(result.success).toBe(true);

      if (!result.success) {
        throw new Error(
          "Expected onboardingSchemaStepThree to parse successfully",
        );
      }

      expect(result.data.intent).toBe(Intent.PUBLISH);
    });
  });

  describe("uploadImageSchema", () => {
    it("accepts supported image files smaller than the limit", () => {
      const file = new File(["avatar"], "avatar.png", {
        type: "image/png",
      });

      const result = uploadImageSchema.safeParse({ image: file });

      expect(result.success).toBe(true);
    });

    it("rejects unsupported image types", () => {
      const file = new File(["avatar"], "avatar.gif", {
        type: "image/gif",
      });

      const result = uploadImageSchema.safeParse({ image: file });

      expect(result.success).toBe(false);

      if (result.success) {
        throw new Error("Expected uploadImageSchema to fail");
      }

      expect(result.error.flatten().fieldErrors.image).toBeDefined();
    });

    it("rejects files larger than 5 MB", () => {
      const file = new File([new Uint8Array(5_000_001)], "avatar.png", {
        type: "image/png",
      });

      const result = uploadImageSchema.safeParse({ image: file });

      expect(result.success).toBe(false);

      if (result.success) {
        throw new Error("Expected uploadImageSchema to fail");
      }

      expect(result.error.flatten().fieldErrors.image).toBeDefined();
    });
  });
});
