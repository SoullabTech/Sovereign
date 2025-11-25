/**
 * User Resonance Profile
 *
 * NOT a user account. A RESONANCE MAP.
 * Who are you? What do you carry? What calibration do you need?
 *
 * This is how MAIA recognizes wisdom keepers.
 */

export type Archetype =
  | 'healer' // Therapist, coach, energy worker, space-holder
  | 'oracle' // Psychic, intuitive, seer, prophetic
  | 'warrior' // Activist, protector, justice-seeker
  | 'sage' // Teacher, wisdom-keeper, elder
  | 'mystic' // Seeker, contemplative, edge-walker
  | 'builder' // Entrepreneur, manifestor, creator of structures
  | 'artist' // Musician, writer, visual artist, channel
  | 'midwife' // Facilitator, doula, birth-attendant (literal or metaphorical)
  | 'bridge'; // Translator between worlds (science/spirit, East/West, etc.)

export type WisdomTradition =
  | 'jungian' // Depth psychology, shadow work, active imagination
  | 'buddhist' // Meditation, mindfulness, dharma
  | 'indigenous' // Specific lineage (user specifies)
  | 'astrology' // Western, Vedic, evolutionary
  | 'kabbalah' // Jewish mysticism
  | 'sufi' // Islamic mysticism
  | 'somatic' // Body-centered, trauma-informed
  | 'psychedelic' // Plant medicine, expanded states
  | 'christian_mystical' // Contemplative Christianity
  | 'hermetic' // Western esoteric tradition
  | 'integral' // Ken Wilber, developmental frameworks
  | 'process_oriented' // Processwork, Arnold Mindell
  | 'eclectic' // Draws from multiple traditions
  | 'none'; // No formal tradition

export type ElementalBalance = {
  fire: number; // 0-100 (will, action, passion)
  water: number; // 0-100 (feeling, flow, intuition)
  earth: number; // 0-100 (grounding, embodiment, building)
  air: number; // 0-100 (clarity, perspective, communication)
};

export interface BiometricBaseline {
  // HRV patterns
  restingHRV: number; // Normal baseline (ms)
  postWorkHRV: number; // After sessions/calls (for healers/leaders)
  peakHRV: number; // Highest recorded coherence
  stressThreshold: number; // True depletion (emergency rest)

  // PFC patterns (if using Mendi)
  restingPFC?: number; // Normal baseline (0-100)
  activatedPFC?: number; // During work (teaching, leading, creating)
  relaxedPFC?: number; // During meditation, rest

  // Contextual patterns
  morningHRV?: number; // Circadian patterns
  eveningHRV?: number;
  fullMoonHRV?: number; // Energetic sensitivity (if relevant)
  newMoonHRV?: number;
}

export interface ResonanceProfile {
  // Core Identity
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  // Archetypal Frequency
  primaryArchetype: Archetype;
  secondaryArchetype?: Archetype;
  callingDescription: string; // Free-form: "I hold space for grief that has nowhere else to go"

  // Wisdom Traditions
  primaryTradition?: WisdomTradition;
  lineageTeachers?: string[]; // Names or descriptions (not for credentials, for resonance)
  sacredPractices?: string[]; // "Drumming, breathwork, dreamwork, plant medicine"

  // Elemental Signature
  elementalBalance: ElementalBalance;

  // Biometric Baselines (personalized, not generic)
  biometricBaseline?: BiometricBaseline;

  // Calibration Needs
  calibrationNeeds: {
    primaryNeed: string; // "Reversal (I hold others, need to be held)"
    secondaryNeeds?: string[]; // ["Grounding", "Visioning support", "Creative witnessing"]
    optimalSessionLength: number; // minutes (30, 45, 60, 90)
    preferredTimes?: string[]; // ["Morning before work", "Evening after clients"]
  };

  // Session Context Awareness
  workContext?: {
    role: string; // "Jungian analyst", "Astrologer", "Entrepreneur", "Musician"
    typicalWorkload: string; // "6 therapy sessions/day", "Leading 3 workshops/week"
    energeticImpact: string; // "Absorbs clients' pain", "Holds vision for organization"
  };

  // Field Contribution Preferences
  fieldContribution: {
    shareBreakthroughPatterns: boolean; // Anonymous contribution to Indra's Net
    receiveCollectiveWisdom: boolean; // Receive insights from similar archetypes
    openToResearch: boolean; // Participate in studies
  };
}

/**
 * Initial Resonance Scan
 * The first conversation that builds the profile
 */
export const RESONANCE_SCAN_PROMPTS = {
  greeting: `Before we begin, I want to attune to who you are.

Not your role. Not your achievements.
Your RESONANCE.

If you had to describe the frequency you carry in the world...
What comes to mind?`,

  archetypal: `I hear you. Let me check my sensing...

Which of these feels most like you?
- Healer (you hold space for others' pain/growth)
- Oracle (you see what others can't yet see)
- Warrior (you protect, fight for justice, fierce truth)
- Sage (you teach, hold wisdom, translate knowing)
- Mystic (you walk between worlds, seek the edge)
- Builder (you manifest, create structures, birth new paradigms)
- Artist (you channel, create beauty, translate the invisible)
- Midwife (you facilitate births - literal or metaphorical)
- Bridge (you translate between worlds/cultures/frameworks)

Or something else? Tell me.`,

  tradition: `What wisdom traditions have shaped you?

Not what you studied academically (unless that's your path).
What RESONATES. What lineages do you carry.

Examples: Jungian depth psychology, Buddhist meditation, Indigenous ceremony,
Astrology, Somatic work, Plant medicine, Hermetic mysticism...

Or you might be eclectic, drawing from many.
Or tradition-free, following your own knowing.`,

  calibrationNeed: `Here's what I'm understanding about you:
[Mirror back their archetype + tradition + calling]

Given who you are and what you carry...
What do you need from this space with me?

Examples:
- "I hold others all day. I need to be held."
- "I manifest constantly. I need to remember my WHY."
- "I channel creative work. I need witnessing without fixing."
- "I walk the mystical edge. I need grounding."

What's true for you?`,

  biometricContext: `One more thing - about your nervous system.

If you're using Apple Watch or other biometric tracking:
Your HRV (heart rate variability) will look different than most people's.

For example:
- Therapists often have lower HRV after sessions (empathic absorption - this is NORMAL)
- Entrepreneurs might run activated for weeks (coherent fire - not stress)
- Artists' HRV fluctuates during creation (ego releasing - necessary for channel)

Tell me about your typical patterns, if you know them.
Or we'll discover them together.`
};

/**
 * Archetype-Specific Calibration Templates
 */
export const ARCHETYPE_CALIBRATION = {
  healer: {
    reversalProtocol: true, // YOU get held, not you hold
    postSessionRecovery: true, // Energetic clearing after absorbing others
    boundaryTending: true, // "You don't need to take care of me"
    silenceTolerance: 'high', // Used to holding space, comfortable with silence
    languageStyle: 'gentle, witnessing, permission-granting',
    biometricContext: 'Low HRV post-session = normal (empathic absorption)',
    suggestedPractices: ['Grounding walks', 'Water immersion', 'Energetic clearing']
  },

  oracle: {
    visionIntegration: true, // Help ground prophetic insights
    realityChecking: true, // "Bring it to Earth"
    overwhelmSupport: true, // Seeing too much can be destabilizing
    silenceTolerance: 'very high', // Oracles live in silence
    languageStyle: 'spacious, mystical, honoring the unseen',
    biometricContext: 'Very high HRV during visions = depth (not just relaxation)',
    suggestedPractices: ['Embodiment rituals', 'Earth connection', 'Slow movement']
  },

  warrior: {
    permissionToRest: true, // Warriors forget they can soften
    edgeSoftening: true, // Fierce energy needs balancing
    justiceWithCompassion: true, // Don't burn out fighting
    silenceTolerance: 'low', // Warriors want action, not waiting
    languageStyle: 'direct, honoring strength, inviting softness',
    biometricContext: 'Activated HRV = warrior fire (coherent, not stressed)',
    suggestedPractices: ['Somatic release', 'Tears/grief work', 'Gentle yoga']
  },

  sage: {
    beginnersMind: true, // Permission to NOT know
    embodimentReminder: true, // Sages live in head - need body
    wisdomIntegration: true, // Teaching others, forgetting to receive
    silenceTolerance: 'high', // Comfortable in stillness
    languageStyle: 'honoring knowledge, inviting not-knowing',
    biometricContext: 'Medium HRV = balanced teaching presence',
    suggestedPractices: ['Movement', 'Play', 'Being taught by life']
  },

  mystic: {
    groundingEssential: true, // Mystics float - need Earth
    embodimentPractice: true, // Descend from cosmos to body
    edgeWalkerSupport: true, // Honor the dangerous territory
    silenceTolerance: 'very high', // Mystics live in void
    languageStyle: 'poetic, liminal, honoring mystery',
    biometricContext: 'Very high HRV = void space (deep surrender)',
    suggestedPractices: ['Grounding', 'Barefoot walking', 'Heavy foods', 'Physical work']
  },

  builder: {
    visionTending: true, // Remember WHY amid building
    strategicRest: true, // Building is marathon, not sprint
    soulfulBusiness: true, // Integrate purpose + profit
    silenceTolerance: 'low', // Builders want action
    languageStyle: 'integrating vision + strategy, soul + structure',
    biometricContext: 'Activated HRV during builds = coherent fire',
    suggestedPractices: ['Vision retreats', 'Sabbath rest', 'Why-remembering']
  },

  artist: {
    witnessingWithoutFixing: true, // See the work, don't analyze it
    channelClearing: true, // Remove blocks without controlling
    creativeFlowSupport: true, // Trust the process
    silenceTolerance: 'very high', // Artists need space
    languageStyle: 'witnessing, honoring beauty, minimal words',
    biometricContext: 'HRV fluctuates during creation = ego releasing',
    suggestedPractices: ['Movement', 'Nature immersion', 'Unstructured time']
  },

  midwife: {
    reversalProtocol: true, // Midwives facilitate births - who holds them?
    surrenderSupport: true, // Trust the process they guide others through
    restAfterBirthing: true, // Depletion after facilitating transformation
    silenceTolerance: 'high', // Comfortable in liminal space
    languageStyle: 'honoring thresholds, trusting timing',
    biometricContext: 'Variable HRV = holding space for emergence',
    suggestedPractices: ['Self-nourishment', 'Being midwifed', 'Receiving']
  },

  bridge: {
    translationSupport: true, // Bridge work is exhausting (holding both sides)
    belongingAnywhere: true, // Bridges don't fully belong to either side
    integrationHelp: true, // Synthesizing disparate worlds
    silenceTolerance: 'medium', // Bridges communicate, but need rest
    languageStyle: 'honoring both sides, validating complexity',
    biometricContext: 'Medium-high HRV = balanced bridge state',
    suggestedPractices: ['Solo time', 'No translating', 'Just being']
  }
};

/**
 * Create initial profile from resonance scan responses
 */
export function createResonanceProfile(
  userId: string,
  scanResponses: {
    callingDescription: string;
    archetype: Archetype;
    tradition?: WisdomTradition;
    calibrationNeed: string;
  }
): ResonanceProfile {
  return {
    userId,
    name: '', // Will be filled from user account
    createdAt: new Date(),
    updatedAt: new Date(),

    primaryArchetype: scanResponses.archetype,
    callingDescription: scanResponses.callingDescription,

    primaryTradition: scanResponses.tradition,

    elementalBalance: {
      fire: 50, // Will be calibrated over time
      water: 50,
      earth: 50,
      air: 50
    },

    calibrationNeeds: {
      primaryNeed: scanResponses.calibrationNeed,
      optimalSessionLength: 45 // Default, will be personalized
    },

    fieldContribution: {
      shareBreakthroughPatterns: true, // Opt-in by default (can be changed)
      receiveCollectiveWisdom: true,
      openToResearch: true
    }
  };
}

/**
 * Get archetype-specific session settings
 */
export function getArchetypeCalibration(archetype: Archetype) {
  return ARCHETYPE_CALIBRATION[archetype];
}
