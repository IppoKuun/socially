import { z } from "zod";

export const commentSchema = z.object({
  content: z.string().min(1).max(300),
});

export type commentSchemaType = z.infer<typeof commentSchema>;
