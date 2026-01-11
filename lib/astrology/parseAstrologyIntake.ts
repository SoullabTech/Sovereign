import { astrologyIntakeSchema, type AstrologyIntake } from "./astrologyIntakeSchema";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Accepts:
 * - JSON body matching schema
 * - plain text paste (chart dump)
 * - plain text that is actually JSON (we try JSON.parse)
 */
export function parseAstrologyIntake(input: unknown): AstrologyIntake {
  // String: either a chart paste OR JSON as text
  if (typeof input === "string") {
    const trimmed = input.trim();

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (isPlainObject(parsed)) {
          return astrologyIntakeSchema.parse(parsed);
        }
      } catch {
        // fall through to rawText
      }
    }

    return astrologyIntakeSchema.parse({
      rawText: input,
      question: "Interpret this through the best lens for growth.",
      meta: { source: "member_paste" },
    });
  }

  // Object body
  if (isPlainObject(input)) {
    return astrologyIntakeSchema.parse(input);
  }

  // Anything else: coerce to string
  return astrologyIntakeSchema.parse({
    rawText: String(input),
    question: "Interpret this through the best lens for growth.",
    meta: { source: "other" },
  });
}
