import { openai } from "./clients";
import { classedCategories, moderationPostPrompt } from "./prompt";

type ModerationInput = {
  language: string;
  kind: "POST" | "COMMENT";
  title?: string;
  content?: string;
  imageUrl?: string[];
};

export default async function Moderation({
  language,
  kind,
  title,
  content,
  imageUrl,
}: ModerationInput) {
  const inputData = {
    kind: kind ?? null,
    language: language ?? null,
    title: title ?? null,
    content: content ?? null,
    image: imageUrl ?? null,
  };
  const response = await openai.responses.create({
    model: "gpt-5.4-nano",
    instructions: moderationPostPrompt,
    input: JSON.stringify(inputData, null, 2),
    text: {
      format: {
        type: "json_schema",

        name: "SOC-IA-Moderation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            Category: {
              type: "array",
              items: { type: "string", enum: [classedCategories] },
            },
            ModerationStatus: {
              type: "string",
              enum: ["SAFE", "UNCERTAIN", "UNSAFE"],
            },
            unsafeImage: {
              type: "array",
              items: { type: "number" },
            },
            Reasons: { type: "string" },
          },
          required: ["ModerationStatus"],
          additionalProperties: false,
        },
      },
    },
  });

  const parsed = JSON.parse(response.output_text);
  return parsed;
}
