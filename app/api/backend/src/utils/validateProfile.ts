// src/lib/utils/validateProfile.ts

import { elementalProfileSchema } from "@lib/schemas/elemental";

export function validateProfile(input: unknown) {
  const parsed = elementalProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten(), data: null };
  }
  return { error: null, data: parsed.data };
}
