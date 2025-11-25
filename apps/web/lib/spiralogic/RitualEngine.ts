/**
 * 🧘 Ritual Engine
 *
 * Suggests practices and rituals based on:
 * - Current archetype (emotional/symbolic style)
 * - Spiralogic phase (growth cycle stage)
 * - User context and needs
 */

import type { Archetype } from '@/lib/voice/conversation/AffectDetector';
import type { SpiralogicPhase } from './PhaseDetector';

export interface Ritual {
  name: string;
  description: string;
  duration: string;
  archetype: Archetype;
  phase: SpiralogicPhase;
  instructions: string[];
  intention: string;
  tags: string[];
}

/**
 * Ritual Library
 * Each ritual is keyed by [Archetype]_[Phase]
 */
export const RitualLibrary: Record<string, Ritual> = {
  // Fire Archetype Rituals
  "Fire_Fire": {
    name: "Vision Ignition",
    description: "Catalyze your vision with breath and movement",
    duration: "5 minutes",
    archetype: "Fire",
    phase: "Fire",
    instructions: [
      "Stand tall, feet hip-width apart",
      "Take 3 deep breaths, expanding your chest",
      "Visualize your vision as a flame in your solar plexus",
      "Move your body dynamically - punch, reach, expand",
      "Speak your vision out loud with power"
    ],
    intention: "Ignite creative fire and activate vision",
    tags: ["movement", "breath", "voice", "vision"]
  },

  "Fire_Water": {
    name: "Passion Flow",
    description: "Let passion flow through emotional release",
    duration: "10 minutes",
    archetype: "Fire",
    phase: "Water",
    instructions: [
      "Sit by water (or imagine water)",
      "Place hand on heart",
      "Feel the passion beneath any emotional blocks",
      "Allow tears, laughter, or sound to release",
      "Journal what wants to flow"
    ],
    intention: "Release emotional blocks to access pure passion",
    tags: ["emotion", "release", "journaling", "heart"]
  },

  // Water Archetype Rituals
  "Water_Water": {
    name: "Emotional Depths",
    description: "Dive into emotional waters with gentle presence",
    duration: "15 minutes",
    archetype: "Water",
    phase: "Water",
    instructions: [
      "Find a comfortable seated position",
      "Close eyes and place hands on heart",
      "Breathe into whatever emotion is present",
      "Welcome all feelings without judgment",
      "Allow tears or sounds to flow naturally",
      "Journal any insights that arise"
    ],
    intention: "Honor and process emotional depth",
    tags: ["emotion", "presence", "journaling", "shadow"]
  },

  "Water_Earth": {
    name: "Grounded Flow",
    description: "Let emotions flow while staying rooted",
    duration: "10 minutes",
    archetype: "Water",
    phase: "Earth",
    instructions: [
      "Stand or sit with feet firmly planted",
      "Feel the ground beneath you",
      "Place one hand on heart, one on belly",
      "Breathe: emotions flow, body stays grounded",
      "Visualize roots growing from your feet into earth"
    ],
    intention: "Process emotions from a grounded, safe container",
    tags: ["grounding", "emotion", "body", "safety"]
  },

  // Earth Archetype Rituals
  "Earth_Earth": {
    name: "Root Ritual",
    description: "Ground deeply into physical presence",
    duration: "10 minutes",
    archetype: "Earth",
    phase: "Earth",
    instructions: [
      "Stand barefoot on earth/floor",
      "Shift weight slowly from foot to foot",
      "Feel the solidity beneath you",
      "Breathe into your belly, expanding on inhale",
      "Say: 'I am grounded, I am stable, I am here'"
    ],
    intention: "Establish deep grounding and stability",
    tags: ["grounding", "body", "stability", "presence"]
  },

  "Earth_Air": {
    name: "Structured Clarity",
    description: "Create mental clarity through physical ritual",
    duration: "15 minutes",
    archetype: "Earth",
    phase: "Air",
    instructions: [
      "Set up a clean, organized space",
      "Light a candle",
      "Write down 3 priorities for today",
      "Breathe deeply 5 times",
      "Commit to one structured action"
    ],
    intention: "Bring mental clarity into physical form",
    tags: ["structure", "clarity", "organization", "action"]
  },

  // Air Archetype Rituals
  "Air_Air": {
    name: "Perspective Shift",
    description: "Reframe mental patterns with breath and movement",
    duration: "7 minutes",
    archetype: "Air",
    phase: "Air",
    instructions: [
      "Stand and look at the sky (or imagine sky)",
      "Take 10 deep breaths",
      "With each exhale, release one limiting thought",
      "Move your head/body to see from different angles",
      "Ask: 'What else is true?'"
    ],
    intention: "Gain fresh perspective and mental clarity",
    tags: ["breath", "perspective", "reframe", "clarity"]
  },

  "Air_Fire": {
    name: "Strategic Ignition",
    description: "Turn insight into action",
    duration: "10 minutes",
    archetype: "Air",
    phase: "Fire",
    instructions: [
      "Write down your key insight",
      "Ask: 'What one action makes this real?'",
      "Stand up and declare the action out loud",
      "Do a physical gesture of commitment (fist pump, etc.)",
      "Take the first step immediately"
    ],
    intention: "Transform mental clarity into inspired action",
    tags: ["action", "strategy", "commitment", "clarity"]
  },

  // Aether Archetype Rituals
  "Aether_Aether": {
    name: "Spacious Presence",
    description: "Rest in pure awareness and integration",
    duration: "20 minutes",
    archetype: "Aether",
    phase: "Aether",
    instructions: [
      "Sit in meditation posture",
      "Close eyes or soft gaze",
      "Breathe naturally",
      "Simply be present to what is",
      "Notice thoughts, feelings, sensations without attachment",
      "Rest in spacious awareness"
    ],
    intention: "Integrate all elements through pure presence",
    tags: ["meditation", "presence", "integration", "awareness"]
  },

  "Aether_Water": {
    name: "Soul Reflection",
    description: "Integrate emotional wisdom into soul knowing",
    duration: "15 minutes",
    archetype: "Aether",
    phase: "Water",
    instructions: [
      "Sit quietly near water or with water in bowl",
      "Gaze into water",
      "Ask: 'What does my soul know about this feeling?'",
      "Listen deeply to the stillness",
      "Journal any soul-level insights"
    ],
    intention: "Access soul wisdom through emotional depth",
    tags: ["reflection", "soul", "wisdom", "journaling"]
  }
};

/**
 * Get ritual suggestion based on archetype and phase
 */
export function suggestRitual(
  archetype: Archetype,
  phase: SpiralogicPhase
): Ritual | null {
  const key = `${archetype}_${phase}`;
  return RitualLibrary[key] || null;
}

/**
 * Get all rituals for an archetype
 */
export function getRitualsForArchetype(archetype: Archetype): Ritual[] {
  return Object.values(RitualLibrary).filter(r => r.archetype === archetype);
}

/**
 * Get all rituals for a phase
 */
export function getRitualsForPhase(phase: SpiralogicPhase): Ritual[] {
  return Object.values(RitualLibrary).filter(r => r.phase === phase);
}

/**
 * Get ritual by tags
 */
export function getRitualsByTags(tags: string[]): Ritual[] {
  return Object.values(RitualLibrary).filter(ritual =>
    tags.some(tag => ritual.tags.includes(tag))
  );
}

/**
 * Get personalized ritual suggestion with context
 */
export function getPersonalizedRitual(
  archetype: Archetype,
  phase: SpiralogicPhase,
  userContext?: {
    hasTime?: boolean;        // User has limited time?
    needsGrounding?: boolean; // User needs grounding?
    needsAction?: boolean;    // User needs action?
  }
): Ritual | null {
  // Try exact match first
  let ritual = suggestRitual(archetype, phase);

  // If no exact match, use contextual fallback
  if (!ritual && userContext) {
    if (userContext.needsGrounding) {
      ritual = suggestRitual("Earth", "Earth");
    } else if (userContext.needsAction) {
      ritual = suggestRitual("Fire", "Fire");
    }
  }

  // Default to spacious presence
  if (!ritual) {
    ritual = suggestRitual("Aether", "Aether");
  }

  return ritual;
}
