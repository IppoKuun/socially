import { myError } from "../myError";
import { Category } from "@prisma/client";
import { openai } from "./clients";
import { classedCategories, moderationPostPrompt } from "./prompt";

type ModerationInput = {
  language: string;
  kind: "POST" | "COMMENT";
  title?: string;
  content?: string;
  imageUrl?: string[];
};

type ModerationResult = {
  categories: Category[];
  moderationStatus: "SAFE" | "UNCERTAIN" | "UNSAFE";
  unsafeImages: number[];
  reasons: string;
};

export default async function moderatePostContent({
  language,
  kind,
  title,
  content,
  imageUrl,
}: ModerationInput): Promise<ModerationResult> {
  if (!title && !content && imageUrl?.length === 0) {
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
          // Si image URL est présent, pour chaque image créer un obj avec type et l'url de l'image  //
          ...(imageUrl?.map((url) => ({
            type: "input_image" as const,
            image_url: url,
            detail: "auto" as const, //ici c'est juste pour TS //
          })) ?? []),
        ],
      },
    ],

    // Définition de comment l'IA vas nous renvoyé la réponse //
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
            reasons: { type: "string" },
          },
          required: [
            "moderationStatus",
            "categories",
            "unsafeImages",
            "reasons",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  if (!response.output_text) {
    throw new myError("Réponse vide ou refus du modèle.");
  }

  return JSON.parse(response.output_text) as ModerationResult;
}
