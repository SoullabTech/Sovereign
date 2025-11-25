/**
 * Elemental Phrasebook
 * Natural, everyday phrases for each element
 * NO cringe oracle cosplay - kitchen table conversation only
 */

export type ElementalPhrase = {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'balanced';
  phrases: string[];
};

export const ELEMENTAL_PHRASEBOOK: Record<string, string[]> = {
  fire: [
    "That's your spark showing up.",
    "Feels like it's time to move on this.",
    "Your energy wants to be used.",
    "This is where you catch momentum.",
    "I hear the drive underneath that.",
    "You're ready to move.",
    "That fire in you is real.",
    "Let that energy guide you.",
    "The spark is there - feel it.",
    "Your passion is speaking.",
  ],
  water: [
    "That feeling runs deep.",
    "Let yourself move with it instead of against it.",
    "It's okay to ride the wave here.",
    "That emotion is asking to be noticed.",
    "Sometimes you just have to let it flow through.",
    "The current will carry you.",
    "Feel what's moving underneath.",
    "Let it wash over you.",
    "Depth is calling you here.",
    "Your feelings know the way.",
  ],
  earth: [
    "Take a breath and let yourself land.",
    "Feel your feet on the ground for a second.",
    "This is about slowing down and settling in.",
    "You've got something solid to stand on.",
    "It helps to anchor in the basics first.",
    "Come back to your body.",
    "Ground down into this moment.",
    "You're more stable than you think.",
    "The foundation is here.",
    "Let yourself be held by what's solid.",
  ],
  air: [
    "The picture's getting clearer.",
    "That insight feels sharp.",
    "You're lifting above it now.",
    "I hear the clarity coming through.",
    "This is giving you a new view.",
    "You're seeing it from a different angle.",
    "The fog is lifting.",
    "Perspective is shifting.",
    "That's the breakthrough you needed.",
    "Your mind knows what to do.",
  ],
  aether: [
    "There's a bigger pattern holding this.",
    "Something more is weaving through here.",
    "Feels like a connection beyond the surface.",
    "This moment is part of a larger thread.",
    "There's mystery here, but also coherence.",
    "The bigger picture is revealing itself.",
    "Something's integrating.",
    "You're seeing the whole now.",
    "The pattern is becoming clear.",
    "It all connects somehow.",
  ],
  balanced: [
    "That makes sense.",
    "I hear you.",
    "Let's stay with that for a moment.",
    "There's something real in what you just said.",
    "That feels important to notice.",
    "Yeah.",
    "Tell me more.",
    "Go on.",
    "I'm listening.",
    "Keep going.",
  ],
};

/**
 * Get a random everyday phrase for an element
 */
export function getElementalPhrase(element: string): string {
  const elementKey = element.toLowerCase();
  const phrases = ELEMENTAL_PHRASEBOOK[elementKey] || ELEMENTAL_PHRASEBOOK.balanced;
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
}

/**
 * Get multiple phrases for variety
 */
export function getElementalPhrases(element: string, count: number = 3): string[] {
  const elementKey = element.toLowerCase();
  const phrases = ELEMENTAL_PHRASEBOOK[elementKey] || ELEMENTAL_PHRASEBOOK.balanced;

  // Shuffle and take first N
  const shuffled = [...phrases].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, phrases.length));
}

/**
 * Check if a response already has elemental resonance
 * (so we don't double-up or force it)
 */
export function hasElementalResonance(text: string, element: string): boolean {
  const elementKey = element.toLowerCase();
  const phrases = ELEMENTAL_PHRASEBOOK[elementKey] || [];

  const lowerText = text.toLowerCase();

  // Check if any phrasebook phrase appears in the text
  return phrases.some(phrase => lowerText.includes(phrase.toLowerCase()));
}

/**
 * Suggest a phrase if response feels too generic
 * Returns null if response already has personality
 */
export function suggestElementalPhrase(
  text: string,
  element: string,
  options?: { onlyIfGeneric?: boolean }
): string | null {
  // If response already has elemental resonance, don't add more
  if (options?.onlyIfGeneric && hasElementalResonance(text, element)) {
    return null;
  }

  // If response is very generic ("I understand", "That makes sense"), suggest a phrase
  const genericPatterns = [
    /^(I understand|That makes sense|I see|Okay|Got it)\.?$/i,
    /^(Tell me more|Go on|Continue)\.?$/i,
  ];

  const isGeneric = genericPatterns.some(pattern => pattern.test(text.trim()));

  if (isGeneric || !options?.onlyIfGeneric) {
    return getElementalPhrase(element);
  }

  return null;
}
