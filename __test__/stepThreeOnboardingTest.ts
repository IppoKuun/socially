import { describe, expect, it } from "@jest/globals";
import {
  onboardingSchemaStepThree,
  onboardingSchema,
} from "@/lib/validations.ts/onboarding";

describe("onboardingValidation", () => {
  it("accept and parse good data", () => {
    const result = onboardingSchema.safeParse({
      username: "HIPP  ",
      displayname: "Hippo",
      bio: "",
      avatarUrl: "http://monsite.fr",
      occupation: "",
    });

    expect(result.success).toBe(true);
    expect(result.data?.username).toEqual("hipp");
    expect(result.data?.bio).toBe(null);
    expect(result.data?.occupation).toBe(null);
  });
  it("refuse bad data", () => {
    const result = onboardingSchema.safeParse({
      username: "HIPP!",
      displayName: "H",
      bio: "",
      avatarUrl: "www.google.com",
    });

    expect(result.success).toBe(false);
  });
  it("step 3 accept a valid intent", () => {
    const result = onboardingSchemaStepThree.safeParse({
      intent: "DISCOVER",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intent).toBe("DISCOVER");
    }
  });
});
