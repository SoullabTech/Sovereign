import { z } from "zod";

export const memoryCreateSchema = z.object({
  content: z.string().min(1, "Content is required"),
  type: z.enum(["dream", "insight", "ritual", "journal"]),
  symbols: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional(),
});

export const memoryQuerySchema = z.object({
  query: z.string().min(1, "Query is required"),
  limit: z.number().int().positive().optional().default(10),
  type: z.enum(["dream", "insight", "ritual", "journal"]).optional(),
});

export const sharedSpaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  participants: z.array(z.string()).optional().default([]),
});

export type MemoryCreate = z.infer<typeof memoryCreateSchema>;
export type MemoryQuery = z.infer<typeof memoryQuerySchema>;
export type SharedSpace = z.infer<typeof sharedSpaceSchema>;

// Export as memorySchema for backwards compatibility
export const memorySchema = {
  create: memoryCreateSchema,
  query: memoryQuerySchema,
  sharedSpace: sharedSpaceSchema,
};
