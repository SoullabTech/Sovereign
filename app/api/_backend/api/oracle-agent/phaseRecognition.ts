// phaseRecognition.ts
import { JournalEntry, ContextSnapshot } from "@/types/oracle"; // adjust path as needed

export type SpiralogicPhase = "Fire" | "Earth" | "Air" | "Water" | "Aether";

export function determineSpiralogicPhase(
  context: ContextSnapshot,
): SpiralogicPhase {
  const journal = context.recentJournalEntries || [];
  const emotion = context.emotion || "";
  const keywords = context.keywords || [];

  // Simple keyword-based detection (to be replaced with NLP vector phase model later)
  if (emotion.includes("grief") || keywords.includes("release")) return "Water";
  if (keywords.includes("vision") || keywords.includes("catalyze"))
    return "Fire";
  if (keywords.includes("boundaries") || keywords.includes("body"))
    return "Earth";
  if (keywords.includes("relationships") || keywords.includes("voice"))
    return "Air";
  if (keywords.includes("integration") || keywords.includes("closure"))
    return "Aether";

  // Default fallback
  return "Earth";
}
