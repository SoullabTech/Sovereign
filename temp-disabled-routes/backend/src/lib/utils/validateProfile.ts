import { elementalProfileSchema } from "../schemas/elemental";

export function validateProfile(input: unknown) {
  const parsed = elementalProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten(), data: null };
  }
  return { error: null, data: parsed.data };
}
