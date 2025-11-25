/**
 * Elemental Voice Profiles
 *
 * Defines the archetypal voice characters based on five elements:
 * Fire, Water, Earth, Air, Aether
 *
 * Each element has distinct acoustic and temporal properties
 * that embody its essential quality.
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface ElementalVoice {
  element: Element;
  name: string;
  description: string;

  // Acoustic Properties
  basePitch: number;              // Hz (fundamental frequency)
  pitchVariation: number;         // Hz range for expressiveness
  timbreProfile: number[];        // Harmonic amplitudes [H1, H2, H3, H4, ...]
  breathiness: number;            // 0.0 - 1.0 (noise content mixed with harmonics)
  resonance: number;              // 0.0 - 1.0 (harmonic richness/overtone presence)

  // Temporal Properties
  pacingMultiplier: number;       // Speed of speech (0.5 = half speed, 2.0 = double)
  pauseFrequency: number;         // Pauses per sentence (0.0 - 1.0)
  articulationSharpness: number;  // 0.0 = soft transitions, 1.0 = crisp/precise

  // Emotional Coloring
  warmth: number;                 // 0.0 - 1.0 (low-frequency emphasis)
  clarity: number;                // 0.0 - 1.0 (high-frequency emphasis)
  depth: number;                  // 0.0 - 1.0 (reverb/spatial quality)
}

/**
 * 🔥 FIRE VOICE
 * Quick, clear, catalyzing. Sparks insight and breakthrough.
 * Characterized by bright harmonics, quick pacing, and crisp articulation.
 */
export const FIRE_VOICE: ElementalVoice = {
  element: 'fire',
  name: 'Catalyst',
  description: 'Quick, clear, catalyzing — sparks insight and breakthrough',

  // Acoustic
  basePitch: 240,              // Higher, brighter
  pitchVariation: 60,          // Wide range for expressiveness
  timbreProfile: [1.0, 0.8, 0.5, 0.3, 0.2], // Bright harmonics, strong fundamentals
  breathiness: 0.2,            // Minimal breathiness, clear tone
  resonance: 0.9,              // Rich overtones

  // Temporal
  pacingMultiplier: 1.2,       // Faster than baseline
  pauseFrequency: 0.3,         // Fewer pauses (quick flow)
  articulationSharpness: 0.9,  // Very crisp

  // Emotional
  warmth: 0.6,                 // Moderate warmth
  clarity: 0.95,               // Very clear
  depth: 0.3,                  // Forward presence, minimal reverb
};

/**
 * 💧 WATER VOICE
 * Flowing, empathic, reflective. Holds emotional space.
 * Characterized by smooth harmonics, flowing pace, and soft articulation.
 */
export const WATER_VOICE: ElementalVoice = {
  element: 'water',
  name: 'Flow',
  description: 'Flowing, empathic, reflective — holds emotional space',

  // Acoustic
  basePitch: 200,              // Lower, softer
  pitchVariation: 40,          // Moderate variation
  timbreProfile: [0.9, 0.9, 0.7, 0.4, 0.2], // Smooth, balanced harmonics
  breathiness: 0.4,            // More breathy, intimate
  resonance: 0.8,              // Good resonance

  // Temporal
  pacingMultiplier: 0.9,       // Slightly slower
  pauseFrequency: 0.6,         // Frequent pauses (allows reflection)
  articulationSharpness: 0.4,  // Soft, gentle transitions

  // Emotional
  warmth: 0.8,                 // Very warm
  clarity: 0.7,                // Softer clarity
  depth: 0.7,                  // More spatial, immersive
};

/**
 * 🌍 EARTH VOICE
 * Steady, reliable, grounding. Builds trust and stability.
 * Characterized by deep fundamentals, slow pace, and deliberate articulation.
 */
export const EARTH_VOICE: ElementalVoice = {
  element: 'earth',
  name: 'Ground',
  description: 'Steady, reliable, grounding — builds trust and stability',

  // Acoustic
  basePitch: 160,              // Lower, deeper
  pitchVariation: 20,          // Minimal variation (steady)
  timbreProfile: [1.0, 0.6, 0.4, 0.2, 0.1], // Emphasis on fundamentals
  breathiness: 0.1,            // Solid tone, minimal breath
  resonance: 0.7,              // Good presence

  // Temporal
  pacingMultiplier: 0.8,       // Slower, deliberate
  pauseFrequency: 0.8,         // Many pauses (space to ground)
  articulationSharpness: 0.7,  // Clear but not sharp

  // Emotional
  warmth: 0.9,                 // Very warm, grounding
  clarity: 0.6,                // Softer, less bright
  depth: 0.5,                  // Solid, present
};

/**
 * 🌬️ AIR VOICE
 * Mobile, conceptual, translating. Explains and clarifies.
 * Characterized by light harmonics, quick pace, and variable articulation.
 */
export const AIR_VOICE: ElementalVoice = {
  element: 'air',
  name: 'Clarity',
  description: 'Mobile, conceptual, translating — explains and clarifies',

  // Acoustic
  basePitch: 260,              // Higher, lighter
  pitchVariation: 80,          // Very expressive
  timbreProfile: [0.7, 0.9, 0.9, 0.8, 0.5], // Emphasis on upper harmonics
  breathiness: 0.6,            // Airy, light
  resonance: 0.6,              // Moderate resonance

  // Temporal
  pacingMultiplier: 1.3,       // Fast, agile
  pauseFrequency: 0.4,         // Moderate pauses
  articulationSharpness: 0.6,  // Moderate (not too crisp, not too soft)

  // Emotional
  warmth: 0.4,                 // Less warm, more intellectual
  clarity: 0.9,                // Very clear
  depth: 0.8,                  // Spatial, expansive
};

/**
 * ✨ AETHER VOICE (Integration)
 * Balanced, coherent, wise. The default integrated voice.
 * Characterized by balanced harmonics and neutral temporal properties.
 * This is the voice of integration, where all elements harmonize.
 */
export const AETHER_VOICE: ElementalVoice = {
  element: 'aether',
  name: 'Integration',
  description: 'Balanced, coherent, wise — the integrated voice',

  // Acoustic
  basePitch: 220,              // Balanced middle range
  pitchVariation: 50,          // Moderate expressiveness
  timbreProfile: [0.85, 0.85, 0.7, 0.5, 0.3], // Balanced harmonics
  breathiness: 0.3,            // Balanced
  resonance: 0.85,             // Strong but not excessive

  // Temporal
  pacingMultiplier: 1.0,       // Baseline pace
  pauseFrequency: 0.5,         // Balanced pauses
  articulationSharpness: 0.7,  // Clear and present

  // Emotional
  warmth: 0.75,                // Warm but not heavy
  clarity: 0.85,               // Clear but not harsh
  depth: 0.6,                  // Good presence with space
};

/**
 * Voice profile registry
 */
export const ELEMENTAL_VOICES: Record<Element, ElementalVoice> = {
  fire: FIRE_VOICE,
  water: WATER_VOICE,
  earth: EARTH_VOICE,
  air: AIR_VOICE,
  aether: AETHER_VOICE,
};

/**
 * Get a voice profile by element
 */
export function getVoiceProfile(element: Element): ElementalVoice {
  return ELEMENTAL_VOICES[element];
}

/**
 * Blend two voice profiles
 * @param primary Primary voice profile
 * @param secondary Secondary voice profile
 * @param ratio Blend ratio (0.0 = pure primary, 1.0 = pure secondary)
 * @returns Blended voice profile
 */
export function blendVoices(
  primary: ElementalVoice,
  secondary: ElementalVoice,
  ratio: number
): ElementalVoice {
  // Clamp ratio to 0-1
  ratio = Math.max(0, Math.min(1, ratio));

  // Linear interpolation of all numeric properties
  const lerp = (a: number, b: number) => a * (1 - ratio) + b * ratio;

  // Blend timbre profiles
  const maxLength = Math.max(primary.timbreProfile.length, secondary.timbreProfile.length);
  const timbreProfile: number[] = [];
  for (let i = 0; i < maxLength; i++) {
    const p = primary.timbreProfile[i] || 0;
    const s = secondary.timbreProfile[i] || 0;
    timbreProfile.push(lerp(p, s));
  }

  return {
    element: primary.element, // Keep primary element ID
    name: `${primary.name} → ${secondary.name}`,
    description: `Blended: ${Math.round((1 - ratio) * 100)}% ${primary.name}, ${Math.round(ratio * 100)}% ${secondary.name}`,

    basePitch: lerp(primary.basePitch, secondary.basePitch),
    pitchVariation: lerp(primary.pitchVariation, secondary.pitchVariation),
    timbreProfile,
    breathiness: lerp(primary.breathiness, secondary.breathiness),
    resonance: lerp(primary.resonance, secondary.resonance),

    pacingMultiplier: lerp(primary.pacingMultiplier, secondary.pacingMultiplier),
    pauseFrequency: lerp(primary.pauseFrequency, secondary.pauseFrequency),
    articulationSharpness: lerp(primary.articulationSharpness, secondary.articulationSharpness),

    warmth: lerp(primary.warmth, secondary.warmth),
    clarity: lerp(primary.clarity, secondary.clarity),
    depth: lerp(primary.depth, secondary.depth),
  };
}

/**
 * Select voice based on message intent/keywords
 * Simple keyword matching for now; can be enhanced with ML later
 */
export function selectVoiceByIntent(message: string): ElementalVoice {
  const lower = message.toLowerCase();

  // Fire: breakthrough, insight, creation, action
  if (
    lower.includes('breakthrough') ||
    lower.includes('insight') ||
    lower.includes('create') ||
    lower.includes('action') ||
    lower.includes('now') ||
    lower.includes('spark')
  ) {
    return FIRE_VOICE;
  }

  // Water: feeling, emotion, reflection, empathy
  if (
    lower.includes('feel') ||
    lower.includes('emotion') ||
    lower.includes('heart') ||
    lower.includes('reflect') ||
    lower.includes('sad') ||
    lower.includes('love')
  ) {
    return WATER_VOICE;
  }

  // Earth: ground, stable, structure, trust, body
  if (
    lower.includes('ground') ||
    lower.includes('stable') ||
    lower.includes('structure') ||
    lower.includes('trust') ||
    lower.includes('body') ||
    lower.includes('solid')
  ) {
    return EARTH_VOICE;
  }

  // Air: explain, clarify, understand, think, concept
  if (
    lower.includes('explain') ||
    lower.includes('clarify') ||
    lower.includes('understand') ||
    lower.includes('think') ||
    lower.includes('concept') ||
    lower.includes('why')
  ) {
    return AIR_VOICE;
  }

  // Default: Aether (integrated, balanced)
  return AETHER_VOICE;
}
