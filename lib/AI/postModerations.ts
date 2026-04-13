import { myError } from "../myError";
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
  if (!title && !content && !imageUrl) {
    throw new myError("Aucun contenu a modéré");
  }

  const inputTextData = {
    kind: kind,
    language: language,
    title: title ?? null,
    content: content ?? null,
  };

  const response = await openai.responses.create({
    model: "gpt-5.4-nano",
    instructions: moderationPostPrompt,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: JSON.stringify(inputTextData, null, 2) },
          ...(imageUrl?.map((url) => ({
            type: "input_image" as const,
            image_url: url,
            detail: "auto" as const,
          })) ?? []),
        ],
      },
    ],

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
            unsafeImages: {
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

  if (!response.output_text) {
    throw new myError("Réponse vide ou refus du modèle.");
  }

  return JSON.parse(response.output_text);
}
