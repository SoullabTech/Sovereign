import type { AstrologyIntake } from "./astrologyIntakeSchema";

export type Lens = "developmental" | "mythic" | "timing" | "integration" | "spiralogic";

const KEYWORDS: Record<Lens, string[]> = {
  developmental: ["pattern", "stuck", "shadow", "heal", "trauma", "lesson", "growth", "mature", "attachment"],
  mythic: ["meaning", "purpose", "calling", "soul", "initiation", "archetype", "destiny", "myth"],
  timing: ["when", "next", "coming", "this year", "transit", "progression", "return", "retrograde", "date"],
  integration: ["what do i do", "how do i", "practice", "steps", "ground", "nervous system", "help me", "plan"],
  spiralogic: ["element", "facet", "phase", "alchemy", "coherence", "spiralogic", "fire", "water", "earth", "air", "aether"],
};

function normalize(s: string) {
  return (s || "").toLowerCase();
}

function dedupe<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function pickLenses(intake: AstrologyIntake): Lens[] {
  // Respect explicit selection
  if (intake.lens) {
    const explicit = Array.isArray(intake.lens) ? intake.lens : [intake.lens];
    return dedupe(explicit as Lens[]);
  }

  const blob = `${normalize(intake.question)}\n${normalize(intake.rawText ?? "")}`;

  const hits = (lens: Lens) => KEYWORDS[lens].some((k) => blob.includes(k));

  // Default: developmental + integration
  const lenses: Lens[] = ["developmental", "integration"];

  // Add timing if provided or requested
  if (intake.timing?.transits?.length || hits("timing")) lenses.push("timing");

  // Add mythic if requested by language
  if (hits("mythic")) lenses.push("mythic");

  // Add spiralogic if requested by language
  if (hits("spiralogic")) lenses.push("spiralogic");

  return dedupe(lenses);
}
