// src/schemas/memory.schema.ts

import { z } from "zod";

export const createMemorySchema = z.object({
  content: z.string().min(1, "Content is required"),
});
