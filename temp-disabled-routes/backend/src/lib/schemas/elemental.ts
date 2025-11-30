import { z } from "zod";

// Optional crystal focus schema
export const crystalFocusSchema = z.object({
  type: z.enum([
    "career",
    "spiritual",
    "relational",
    "health",
    "creative",
    "other",
  ]),
  customDescription: z.string().optional(),
  challenges: z.string(),
  aspirations: z.string(),
});

// Elemental profile schema
export const elementalProfileSchema = z.object({
  user_id: z.string(),
  fire: z.number().min(0).max(100),
  water: z.number().min(0).max(100),
  earth: z.number().min(0).max(100),
  air: z.number().min(0).max(100),
  aether: z.number().min(0).max(100),
  crystal_focus: crystalFocusSchema.optional(),
  updated_at: z.string().optional(), // ISO timestamp
});

// 👉 Export inferred TypeScript type
export type ElementalProfile = z.infer<typeof elementalProfileSchema>;
