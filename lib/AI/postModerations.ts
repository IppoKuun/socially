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
  const inputTextData = {
    kind: kind ?? null,
    language: language ?? null,
    title: title ?? null,
    content: content ?? null,
  };

  const inputImageData =
    imageUrl?.map((url) => ({
      type: "input_image" as const,
      image_url: url,
    })) ?? [];
  const inputData = {
    content: {
      inputText: inputTextData,
      InputIamge: inputImageData,
    },
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
            categories: {
              type: "array",
              items: { type: "string", enum: classedCategories },
            },
            moderationStatus: {
              type: "string",
              enum: ["SAFE", "UNCERTAIN", "UNSAFE"],
            },
            unsafeImage: {
              type: "array",
              items: { type: "number" },
            },
            reasons: { type: "array", items: { type: "string" } },
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
