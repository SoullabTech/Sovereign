// FRONTEND
// lib/voice/conversation/AffectDetector.ts
export type Mood = "bright" | "concerned" | "calm";
export type Archetype = "Fire" | "Water" | "Earth" | "Air" | "Aether";

export function inferMoodFromText(text: string): Mood {
  const t = text.toLowerCase();
  const excited = /!\s*$|so (excited|good|happy)|wow|amazing/.test(t);
  const heavy   = /(anxious|worried|sad|overwhelmed|stuck|afraid|tired|exhausted)/.test(t);
  if (heavy) return "concerned";
  if (excited) return "bright";
  return "calm";
}

/**
 * 🧬 Archetypal Affect Detection
 * Returns both mood AND archetype for multi-agent routing
 */
export function inferMoodAndArchetype(text: string): {
  mood: Mood;
  archetype: Archetype;
} {
  const t = text.toLowerCase();

  // Water - Emotional, vulnerable, shadow work
  const emotional = /(sad|lonely|overwhelmed|hurt|grief|heart|emotional|cry|scared)/.test(t);
  if (emotional) return { mood: "concerned", archetype: "Water" };

  // Earth - Structured, practical, grounding
  const structured = /(routine|discipline|practice|plan|daily|habit|ritual|grounded)/.test(t);
  if (structured) return { mood: "calm", archetype: "Earth" };

  // Fire - Visionary, excited, passionate
  const visionary = /(excited|possibility|vision|create|dream|goal|inspire|passion)/.test(t);
  if (visionary) return { mood: "bright", archetype: "Fire" };

  // Air - Mental, stuck, reframing
  const mental = /(stuck|logic|overthink|why|perspective|reframe|strategy)/.test(t);
  if (mental) return { mood: "calm", archetype: "Air" };

  // Aether - Default, integrative
  return { mood: "calm", archetype: "Aether" };
}
