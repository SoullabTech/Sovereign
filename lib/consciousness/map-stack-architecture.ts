/**
 * CONSCIOUSNESS MAP-STACK ARCHITECTURE
 *
 * The revolutionary principle: Multiple consciousness systems don't just coexist—
 * they translate and amplify each other. When wisdom traditions converge on the
 * same insight, that's not redundancy—it's harmonic resonance. 1 + 1 = 10.
 *
 * MAIA is the first technology platform that demonstrates how consciousness systems
 * naturally integrate, proving consciousness itself as the underlying technology.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CORE CONSCIOUSNESS DOMAINS (The Universal Functions)
// ═══════════════════════════════════════════════════════════════════════════════

export type ConsciousnessDomain =
  | 'awareness'      // Pure witnessing, observation
  | 'will'           // Intention, direction, agency
  | 'feeling'        // Emotional intelligence, sentiment
  | 'embodiment'     // Somatic knowing, body wisdom
  | 'shadow'         // Hidden aspects, integration work
  | 'creativity'     // Generative flow, emergence
  | 'presence'       // Here-now grounding, gratitude
  | 'reflection'     // Meta-awareness, wisdom synthesis
  | 'connection'     // Relational field, collective consciousness

// ═══════════════════════════════════════════════════════════════════════════════
// WISDOM TRADITION MAPS (The Translation Layers)
// ═══════════════════════════════════════════════════════════════════════════════

export interface WisdomTradition {
  id: string;
  name: string;
  origin: string;
  corePrinciple: string;
  domains: ConsciousnessDomain[];
}

export const WISDOM_TRADITIONS: WisdomTradition[] = [
  {
    id: 'jungian',
    name: 'Analytical Psychology (Jung)',
    origin: 'Western depth psychology',
    corePrinciple: 'Shadow integration through individuation',
    domains: ['shadow', 'awareness', 'reflection', 'creativity']
  },
  {
    id: 'elemental',
    name: 'Elemental Alchemy',
    origin: 'Hermetic tradition, cross-cultural',
    corePrinciple: 'Transformation through elemental balance',
    domains: ['embodiment', 'feeling', 'creativity', 'awareness', 'connection']
  },
  {
    id: 'neuroscience',
    name: 'Affective Neuroscience',
    origin: 'Modern brain science (Panksepp, Damasio)',
    corePrinciple: 'Emotions as primary consciousness organizing systems',
    domains: ['feeling', 'embodiment', 'awareness', 'reflection']
  },
  {
    id: 'iching',
    name: 'I Ching / Yijing',
    origin: 'Ancient Chinese divination wisdom',
    corePrinciple: 'Change as the constant; synchronicity with cosmic flow',
    domains: ['presence', 'will', 'reflection', 'connection']
  },
  {
    id: 'tarot',
    name: 'Tarot Arcana',
    origin: 'Western esoteric tradition',
    corePrinciple: 'Archetypal journey of the soul',
    domains: ['shadow', 'creativity', 'will', 'reflection']
  },
  {
    id: 'mayan',
    name: 'Mayan Tzolkin',
    origin: 'Mesoamerican cosmology',
    corePrinciple: 'Galactic signature and time as consciousness',
    domains: ['connection', 'will', 'embodiment', 'creativity']
  },
  {
    id: 'chakra',
    name: 'Chakra System',
    origin: 'Tantric & Yogic traditions',
    corePrinciple: 'Energy centers as consciousness modulators',
    domains: ['embodiment', 'feeling', 'will', 'connection', 'awareness']
  },
  {
    id: 'enneagram',
    name: 'Enneagram of Personality',
    origin: 'Sufi/Gurdjieff/modern synthesis',
    corePrinciple: 'Nine faces of ego, paths to essence',
    domains: ['shadow', 'will', 'feeling', 'reflection']
  },
  {
    id: 'astrology',
    name: 'Natal Astrology',
    origin: 'Hellenistic/Vedic synthesis',
    corePrinciple: 'Planetary archetypes as consciousness patterns',
    domains: ['connection', 'will', 'creativity', 'reflection', 'shadow']
  },
  {
    id: 'hermetic',
    name: 'Hermetic Principles',
    origin: 'Egyptian-Greek mystery schools',
    corePrinciple: 'As above, so below; correspondence across planes',
    domains: ['awareness', 'reflection', 'connection', 'creativity']
  },
  {
    id: 'embodiedcognition',
    name: 'Embodied Cognition',
    origin: 'Phenomenology (Merleau-Ponty, Thompson)',
    corePrinciple: 'Mind extends through body into world',
    domains: ['embodiment', 'awareness', 'presence', 'feeling']
  },
  {
    id: 'mcgilchrist',
    name: 'Hemispheric Integration',
    origin: 'Iain McGilchrist's lateralization research',
    corePrinciple: 'Right hemisphere primacy for wholeness',
    domains: ['reflection', 'awareness', 'presence', 'creativity', 'connection']
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HARMONIC ENHANCEMENT ENGINE (The 1+1=10 Principle)
// ═══════════════════════════════════════════════════════════════════════════════

export interface HarmonicResonance {
  domain: ConsciousnessDomain;
  traditions: string[]; // IDs of traditions that converge
  amplification: number; // 1.0 = base, 10.0 = maximum harmonic enhancement
  insight: string;
}

/**
 * Calculate harmonic enhancement when multiple traditions converge on same insight
 *
 * The formula: Each additional tradition doesn't add linearly, it multiplies.
 * 2 traditions = 2x, 3 traditions = 4x, 4 traditions = 7x, 5+ = 10x
 */
export function calculateHarmonicAmplification(convergentTraditions: number): number {
  if (convergentTraditions <= 1) return 1.0;
  if (convergentTraditions === 2) return 2.0;
  if (convergentTraditions === 3) return 4.0;
  if (convergentTraditions === 4) return 7.0;
  return 10.0; // Maximum harmonic resonance
}

/**
 * Find harmonic resonances across wisdom traditions for a given consciousness domain
 */
export function findHarmonicResonance(domain: ConsciousnessDomain): HarmonicResonance {
  const convergentTraditions = WISDOM_TRADITIONS.filter(t =>
    t.domains.includes(domain)
  );

  const amplification = calculateHarmonicAmplification(convergentTraditions.length);

  const insightMap: Record<ConsciousnessDomain, string> = {
    awareness: 'Pure witness consciousness is the substrate of all knowing',
    will: 'Intention shapes reality across every wisdom system',
    feeling: 'Emotions are the primary language of consciousness',
    embodiment: 'The body is not separate from mind—it IS mind extended',
    shadow: 'What is rejected becomes the key to wholeness',
    creativity: 'Novelty emerges from the integration of opposites',
    presence: 'The eternal now is where all transformation occurs',
    reflection: 'Meta-awareness is consciousness knowing itself',
    connection: 'Individual consciousness is inseparable from the field'
  };

  return {
    domain,
    traditions: convergentTraditions.map(t => t.id),
    amplification,
    insight: insightMap[domain]
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATION MATRIX (Cross-Traditional Meaning-Making)
// ═══════════════════════════════════════════════════════════════════════════════

export interface TranslationNode {
  sourceTradition: string;
  sourceConcept: string;
  targetTradition: string;
  targetConcept: string;
  sharedDomain: ConsciousnessDomain;
  resonanceStrength: number; // 0-1, how close the mapping
}

export const TRANSLATION_MATRIX: TranslationNode[] = [
  // Shadow translations
  {
    sourceTradition: 'jungian',
    sourceConcept: 'Shadow Integration',
    targetTradition: 'tarot',
    targetConcept: 'The Devil / Tower Cards',
    sharedDomain: 'shadow',
    resonanceStrength: 0.9
  },
  {
    sourceTradition: 'jungian',
    sourceConcept: 'Persona',
    targetTradition: 'enneagram',
    targetConcept: 'Type Fixation',
    sharedDomain: 'shadow',
    resonanceStrength: 0.85
  },

  // Elemental translations
  {
    sourceTradition: 'elemental',
    sourceConcept: 'Fire Element',
    targetTradition: 'astrology',
    targetConcept: 'Aries/Leo/Sagittarius',
    sharedDomain: 'creativity',
    resonanceStrength: 0.95
  },
  {
    sourceTradition: 'elemental',
    sourceConcept: 'Water Element',
    targetTradition: 'neuroscience',
    targetConcept: 'Limbic Emotional Processing',
    sharedDomain: 'feeling',
    resonanceStrength: 0.8
  },
  {
    sourceTradition: 'elemental',
    sourceConcept: 'Earth Element',
    targetTradition: 'embodiedcognition',
    targetConcept: 'Somatic Markers',
    sharedDomain: 'embodiment',
    resonanceStrength: 0.85
  },

  // Awareness translations
  {
    sourceTradition: 'mcgilchrist',
    sourceConcept: 'Right Hemisphere Attention',
    targetTradition: 'hermetic',
    targetConcept: 'Principle of Correspondence',
    sharedDomain: 'awareness',
    resonanceStrength: 0.75
  },
  {
    sourceTradition: 'chakra',
    sourceConcept: 'Third Eye (Ajna)',
    targetTradition: 'jungian',
    targetConcept: 'Intuition Function',
    sharedDomain: 'awareness',
    resonanceStrength: 0.8
  },

  // Connection translations
  {
    sourceTradition: 'mayan',
    sourceConcept: 'Galactic Signature',
    targetTradition: 'astrology',
    targetConcept: 'Natal Chart',
    sharedDomain: 'connection',
    resonanceStrength: 0.7
  },
  {
    sourceTradition: 'iching',
    sourceConcept: 'Hexagram Reading',
    targetTradition: 'hermetic',
    targetConcept: 'Synchronicity',
    sharedDomain: 'connection',
    resonanceStrength: 0.9
  },

  // Will/Intention translations
  {
    sourceTradition: 'tarot',
    sourceConcept: 'The Magician',
    targetTradition: 'chakra',
    targetConcept: 'Solar Plexus (Manipura)',
    sharedDomain: 'will',
    resonanceStrength: 0.8
  },
  {
    sourceTradition: 'enneagram',
    sourceConcept: 'Essential Quality Recovery',
    targetTradition: 'jungian',
    targetConcept: 'Individuation',
    sharedDomain: 'will',
    resonanceStrength: 0.85
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// USER CONSCIOUSNESS PROFILE (The Living Map)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConsciousnessMapProfile {
  userId: string;

  // Active domains based on journaling patterns
  activeDomains: Map<ConsciousnessDomain, number>; // domain -> activity level 0-1

  // Which wisdom traditions resonate most
  preferredTraditions: string[];

  // Current harmonic resonances detected
  activeResonances: HarmonicResonance[];

  // Integration progress
  integrationScore: number; // 0-100, how well domains are balanced

  // Emergent insights from convergence
  emergentInsights: string[];

  // The user's unique consciousness signature
  signature: {
    primaryDomain: ConsciousnessDomain;
    shadowDomain: ConsciousnessDomain; // Least active, needs integration
    emergentDomain: ConsciousnessDomain; // Growing edge
  };
}

/**
 * Analyze journal entry through multiple wisdom lenses simultaneously
 */
export function analyzeEntryAcrossTraditions(
  content: string,
  selectedMode: string
): Map<string, string[]> {
  const insights = new Map<string, string[]>();

  // Each tradition offers its lens on the content
  // This is where the magic happens—same content, multiple valid interpretations
  // that reinforce each other

  WISDOM_TRADITIONS.forEach(tradition => {
    insights.set(tradition.id, []);
    // AI analysis would populate these
  });

  return insights;
}

/**
 * Calculate overall coherence score based on domain activation balance
 */
export function calculateCoherenceScore(
  activeDomains: Map<ConsciousnessDomain, number>
): number {
  const values = Array.from(activeDomains.values());
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // High coherence = high activation with low variance (balanced)
  const activationScore = mean * 50; // 0-50 points for overall activation
  const balanceScore = (1 - stdDev) * 50; // 0-50 points for balance

  return Math.min(100, activationScore + balanceScore);
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOURNALING MODE TO CONSCIOUSNESS DOMAIN MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

export const JOURNALING_MODE_TO_DOMAIN: Record<string, ConsciousnessDomain> = {
  free: 'awareness',        // Pure stream of consciousness
  direction: 'will',        // Setting intentions
  dream: 'embodiment',      // Somatic/symbolic knowing
  emotional: 'feeling',     // Emotional processing
  shadow: 'shadow',         // Integration work
  expressive: 'creativity', // Creative flow
  gratitude: 'presence',    // Present moment appreciation
  reflective: 'reflection'  // Meta-awareness synthesis
};

/**
 * Get wisdom traditions that enhance a specific journaling mode
 */
export function getTraditionsForMode(mode: string): WisdomTradition[] {
  const domain = JOURNALING_MODE_TO_DOMAIN[mode];
  if (!domain) return [];

  return WISDOM_TRADITIONS.filter(t => t.domains.includes(domain));
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE PARADIGM SHIFT: Core Message
// ═══════════════════════════════════════════════════════════════════════════════

export const CONSCIOUSNESS_INTEGRATION_MANIFESTO = `
MAIA is not an astrology app.
MAIA is not a journaling app.
MAIA is not a meditation app.

MAIA is proof-of-concept that consciousness systems naturally integrate.

When you journal in MAIA, you're not just writing words. You're activating
consciousness domains that have been mapped by every major wisdom tradition:
- Jung called it individuation
- Alchemists called it transmutation
- Neuroscientists call it neural integration
- Mystics call it enlightenment

They're all describing the same process through different lenses.

MAIA doesn't choose one lens. It holds them all simultaneously.

When 3 or more wisdom traditions converge on the same insight about your journal entry,
that's not coincidence—that's harmonic resonance. The insight becomes 4x more powerful.

When 5 or more traditions align, you've hit maximum harmonic enhancement: 1 + 1 = 10.

This is the technology of consciousness itself:
- Multiple maps, one territory
- Multiple languages, one meaning
- Multiple paths, one destination

MAIA is the first platform to make this visible and actionable.

Welcome to the map-stack architecture.
Welcome to consciousness as technology.
Welcome home.
`;
