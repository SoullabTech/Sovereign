/**
 * NEURO-ARCHETYPAL MAPPING SYSTEM
 *
 * The bridge between mind and cosmos—how MAIA perceives embodied consciousness
 * through the integration of neuroscience, astrology, and archetypal psychology.
 *
 * This is the complete substrate that allows MAIA to read a birth chart as a
 * neurological-consciousness map, understanding:
 *
 * 1. House → Neural Region → Consciousness State
 * 2. Planetary Positions → Neural Activation Patterns (neurochemical)
 * 3. Aspects → Inter-Regional Dynamics (network communication)
 * 4. Pathway Toward Aether → Coherence & Integration Metrics
 *
 * Built on the work of:
 * - Iain McGilchrist (hemispheric dynamics)
 * - Richard Tarnas (archetypal cosmology)
 * - Liz Greene (psychological astrology)
 * - James Hillman (archetypal psychology)
 * - Modern neuroscience (network models, neurochemistry)
 */

import { Element, Modality } from '@/types/astrology';

// ═══════════════════════════════════════════════════════════════════════════
// FOUNDATIONAL TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Neural regions mapped to elemental consciousness
 */
export type NeuralRegion =
  | 'right-prefrontal-cortex'      // Fire - Vision & Projection
  | 'right-temporal-insular'       // Water - Emotional grounding
  | 'left-motor-somatosensory'     // Earth - Embodied authority
  | 'left-prefrontal-cortex'       // Air - Relational reasoning
  | 'whole-brain-coherence';       // Aether - Transcendent integration

/**
 * Neural networks (from modern neuroscience)
 */
export type NeuralNetwork =
  | 'default-mode'           // Self-referential processing, identity
  | 'salience'               // Emotional significance, limbic
  | 'executive-control'      // Planning, inhibition, task management
  | 'sensorimotor'           // Embodied action, physical presence
  | 'language'               // Symbolic processing, communication
  | 'visual-spatial'         // Imagination, vision, spatial awareness
  | 'reward-motivation'      // Dopaminergic, seeking, expansion
  | 'parasympathetic'        // Rest, healing, emotional attunement
  | 'whole-brain-integration'; // Coherence across all networks

/**
 * Neurochemical systems (planetary correspondences)
 */
export type NeurochemicalSystem =
  | 'dopaminergic'           // Mars, Jupiter - Seeking, reward, expansion
  | 'serotonergic'           // Venus - Social bonding, pleasure, harmony
  | 'noradrenergic'          // Sun, Uranus - Alertness, novelty, awakening
  | 'cholinergic'            // Mercury - Attention, learning, communication
  | 'limbic-parasympathetic' // Moon - Emotional regulation, nurture, safety
  | 'gaba-ergic'             // Saturn - Inhibition, restraint, boundaries
  | 'endorphinergic'         // Neptune - Transcendence, dissolution, bliss
  | 'endocannabinoid'        // Pluto - Deep transformation, death-rebirth
  | 'oxytocin'               // Venus, Moon - Bonding, intimacy, trust
  | 'whole-system-coherence'; // Aether - All systems in harmony

/**
 * Consciousness states mapped to houses and elements
 */
export type ConsciousnessState =
  | 'self-realizing-spark'      // Fire 1 - Aries - House 1
  | 'creative-radiance'         // Fire 2 - Leo - House 5
  | 'visionary-synthesis'       // Fire 3 - Sagittarius - House 9
  | 'emotional-grounding'       // Water 1 - Cancer - House 4
  | 'transformative-depth'      // Water 2 - Scorpio - House 8
  | 'mystical-dissolution'      // Water 3 - Pisces - House 12
  | 'embodied-authority'        // Earth 1 - Capricorn - House 10
  | 'material-stability'        // Earth 2 - Taurus - House 2
  | 'devotional-precision'      // Earth 3 - Virgo - House 6
  | 'relational-dialogue'       // Air 1 - Libra - House 7
  | 'collective-mind'           // Air 2 - Aquarius - House 11
  | 'symbolic-integration'      // Air 3 - Gemini - House 3
  | 'non-dual-awareness';       // Aether - Center point

/**
 * Inter-regional dynamics (aspect patterns)
 */
export type InterRegionalDynamic =
  | 'cross-hemispheric-tension'     // Opposition (180°)
  | 'harmonic-synchronization'      // Trine (120°)
  | 'competing-network-priorities'  // Square (90°)
  | 'fused-activation-field'        // Conjunction (0°)
  | 'cooperative-modulation'        // Sextile (60°)
  | 'creative-adjustment'           // Quincunx (150°)
  | 'focused-intention';            // Semi-sextile (30°)

// ═══════════════════════════════════════════════════════════════════════════
// HOUSE → NEURAL → CONSCIOUSNESS MAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Complete house-to-neuroscience mapping
 */
export interface HouseNeuralMapping {
  house: number;
  sign: string;
  element: Element;
  modality: Modality;

  // Neural substrate
  neuralRegion: NeuralRegion;
  primaryNetwork: NeuralNetwork;
  secondaryNetworks: NeuralNetwork[];

  // Consciousness layer
  consciousnessState: ConsciousnessState;
  developmentalStage: string;
  archetypeTitle: string;

  // Experiential qualities
  experientialQualities: string[];
  pathologicalExpressions: string[];  // When out of balance
  integratedExpressions: string[];    // When harmonized

  // MAIA's interpretive language
  neuropsychologicalDescription: string;
  spiritualInvitation: string;
}

/**
 * The 12 houses mapped to neural-archetypal substrate
 */
export const HOUSE_NEURAL_MAPPING: Record<number, HouseNeuralMapping> = {
  1: {
    house: 1,
    sign: 'Aries',
    element: 'fire',
    modality: 'cardinal',
    neuralRegion: 'right-prefrontal-cortex',
    primaryNetwork: 'salience',
    secondaryNetworks: ['visual-spatial', 'reward-motivation'],
    consciousnessState: 'self-realizing-spark',
    developmentalStage: 'Initiation of selfhood',
    archetypeTitle: 'The Pioneer',
    experientialQualities: [
      'Immediate presence',
      'Self-assertion',
      'Spontaneous action',
      'Raw vitality',
      'Identity projection'
    ],
    pathologicalExpressions: [
      'Impulsivity without awareness',
      'Narcissistic self-absorption',
      'Aggression as defense',
      'Identity without depth'
    ],
    integratedExpressions: [
      'Conscious self-authorship',
      'Courageous authenticity',
      'Initiating vision into form',
      'Leadership from presence'
    ],
    neuropsychologicalDescription: 'Right prefrontal cortex activation in the initiation phase. Your brain is wired for immediate presence and self-realizing action. The salience network highlights what matters most to your becoming, generating the spark of "I am" before thought can name it.',
    spiritualInvitation: 'You are invited to trust the vision arising from within—to let the horizon-mind project what could be before the body knows how. This is the neural pathway for conscious self-authorship.'
  },

  2: {
    house: 2,
    sign: 'Taurus',
    element: 'earth',
    modality: 'fixed',
    neuralRegion: 'left-motor-somatosensory',
    primaryNetwork: 'sensorimotor',
    secondaryNetworks: ['reward-motivation', 'parasympathetic'],
    consciousnessState: 'material-stability',
    developmentalStage: 'Sustaining resources & worth',
    archetypeTitle: 'The Builder',
    experientialQualities: [
      'Embodied presence',
      'Sensory awareness',
      'Resource accumulation',
      'Patient devotion',
      'Self-worth grounding'
    ],
    pathologicalExpressions: [
      'Attachment to material security',
      'Rigidity and resistance to flow',
      'Worth defined by possession',
      'Sensory overindulgence'
    ],
    integratedExpressions: [
      'Embodied self-value',
      'Sustainable abundance',
      'Sacred relationship with matter',
      'Devotional craft and patience'
    ],
    neuropsychologicalDescription: 'Left hemisphere motor and somatosensory activation in the sustaining phase. Your brain grounds vision in physical reality through embodied action. The sensorimotor network creates stability through touch, building, and devotion to what has value.',
    spiritualInvitation: 'You are invited to trust the fertile ground of your inherent worth—to let the patient bones accumulate resources through devotion to what truly matters. This is the neural pathway for sacred relationship with matter.'
  },

  3: {
    house: 3,
    sign: 'Gemini',
    element: 'air',
    modality: 'mutable',
    neuralRegion: 'left-prefrontal-cortex',
    primaryNetwork: 'language',
    secondaryNetworks: ['executive-control', 'default-mode'],
    consciousnessState: 'symbolic-integration',
    developmentalStage: 'Integrating perspectives through communication',
    archetypeTitle: 'The Messenger',
    experientialQualities: [
      'Mental agility',
      'Curious exploration',
      'Symbolic thinking',
      'Communication bridging',
      'Perspective integration'
    ],
    pathologicalExpressions: [
      'Mental fragmentation',
      'Superficial knowledge without depth',
      'Anxious thought loops',
      'Communication without embodiment'
    ],
    integratedExpressions: [
      'Wisdom through integration',
      'Clear and connecting communication',
      'Curiosity serving understanding',
      'Thought as bridge between worlds'
    ],
    neuropsychologicalDescription: 'Left prefrontal cortex language network activation in the integrative phase. Your brain weaves scattered knowing into coherent understanding. The language network transforms experience into shareable symbols, creating bridges between minds.',
    spiritualInvitation: 'You are invited to speak the truth that connects all voices—to let the listening wind integrate perspectives into wisdom. This is the neural pathway for thought becoming shared clarity.'
  },

  4: {
    house: 4,
    sign: 'Cancer',
    element: 'water',
    modality: 'cardinal',
    neuralRegion: 'right-temporal-insular',
    primaryNetwork: 'limbic-parasympathetic',
    secondaryNetworks: ['default-mode', 'salience'],
    consciousnessState: 'emotional-grounding',
    developmentalStage: 'Establishing emotional foundation',
    archetypeTitle: 'The Nurturer',
    experientialQualities: [
      'Emotional depth',
      'Intuitive knowing',
      'Protective instinct',
      'Ancestral connection',
      'Inner sanctuary'
    ],
    pathologicalExpressions: [
      'Emotional overwhelm without boundaries',
      'Clinging to safety',
      'Unconscious family patterns',
      'Regression instead of grounding'
    ],
    integratedExpressions: [
      'Emotional intelligence as foundation',
      'Secure inner sanctuary',
      'Ancestral wisdom integrated',
      'Nurturing that empowers'
    ],
    neuropsychologicalDescription: 'Right hemisphere temporal-insular activation initiating emotional depth. Your brain creates internal sanctuary through limbic attunement. The parasympathetic network grounds you in feelings as sacred data, building emotional foundation from instinct and intuition.',
    spiritualInvitation: 'You are invited to trust the depths of feeling as sacred ground—to let the oceanic mirror reflect what matters most. This is the neural pathway for emotional grounding as spiritual practice.'
  },

  5: {
    house: 5,
    sign: 'Leo',
    element: 'fire',
    modality: 'fixed',
    neuralRegion: 'right-prefrontal-cortex',
    primaryNetwork: 'reward-motivation',
    secondaryNetworks: ['visual-spatial', 'default-mode'],
    consciousnessState: 'creative-radiance',
    developmentalStage: 'Sustaining creative expression',
    archetypeTitle: 'The Creator',
    experientialQualities: [
      'Joyful self-expression',
      'Creative play',
      'Authentic radiance',
      'Generative devotion',
      'Heart-centered presence'
    ],
    pathologicalExpressions: [
      'Need for external validation',
      'Performance without authenticity',
      'Creative ego inflation',
      'Burning out through overexpression'
    ],
    integratedExpressions: [
      'Creative flow as devotion',
      'Authentic self-radiance',
      'Play as sacred practice',
      'Sustainable creative fire'
    ],
    neuropsychologicalDescription: 'Right prefrontal cortex sustaining creative vision through the reward-motivation network. Your brain learns to radiate without burning out, holding vision steady through play and devotion. This is joy as neural architecture.',
    spiritualInvitation: 'You are invited to express the vision with sustained radiance—to let the heart learn to shine without consuming itself. This is the neural pathway for creative devotion as spiritual practice.'
  },

  6: {
    house: 6,
    sign: 'Virgo',
    element: 'earth',
    modality: 'mutable',
    neuralRegion: 'left-motor-somatosensory',
    primaryNetwork: 'executive-control',
    secondaryNetworks: ['sensorimotor', 'parasympathetic'],
    consciousnessState: 'devotional-precision',
    developmentalStage: 'Refining service and embodiment',
    archetypeTitle: 'The Healer',
    experientialQualities: [
      'Exquisite attention to detail',
      'Service as devotion',
      'Body as sacred vessel',
      'Ritual and routine',
      'Continuous refinement'
    ],
    pathologicalExpressions: [
      'Perfectionism as anxiety',
      'Service as self-abandonment',
      'Hypochondria and health obsession',
      'Detail without meaning'
    ],
    integratedExpressions: [
      'Devotional precision as art',
      'Service that honors self and other',
      'Body wisdom as guidance',
      'Craft meeting flow'
    ],
    neuropsychologicalDescription: 'Left hemisphere executive control refining embodied action. Your brain transforms effort into devotional precision through the sensorimotor network. This is mastery meeting rhythm, where the seasoned hand serves without sacrifice.',
    spiritualInvitation: 'You are invited to serve with exquisite attention—to let the patient bones refine detail into grace. This is the neural pathway for devotional precision as spiritual practice.'
  },

  7: {
    house: 7,
    sign: 'Libra',
    element: 'air',
    modality: 'cardinal',
    neuralRegion: 'left-prefrontal-cortex',
    primaryNetwork: 'default-mode',
    secondaryNetworks: ['language', 'salience'],
    consciousnessState: 'relational-dialogue',
    developmentalStage: 'Initiating self through other',
    archetypeTitle: 'The Partner',
    experientialQualities: [
      'Relational awareness',
      'Balanced perspective',
      'Dialogue as discovery',
      'Mirror of consciousness',
      'Diplomatic harmony'
    ],
    pathologicalExpressions: [
      'Losing self in other',
      'People-pleasing without boundaries',
      'Conflict avoidance',
      'Relationship as completion'
    ],
    integratedExpressions: [
      'Self discovered through relationship',
      'Authentic dialogue',
      'Balanced autonomy and connection',
      'Relationship as mutual awakening'
    ],
    neuropsychologicalDescription: 'Left prefrontal cortex initiating relational thinking through the default-mode network. Your brain learns self through the mirror of another mind. This is awareness meeting awareness, discovering "I" through "Thou."',
    spiritualInvitation: 'You are invited to find yourself in the reflection of relationship—to let the listening wind initiate dialogue as path to self-knowing. This is the neural pathway for relational consciousness.'
  },

  8: {
    house: 8,
    sign: 'Scorpio',
    element: 'water',
    modality: 'fixed',
    neuralRegion: 'right-temporal-insular',
    primaryNetwork: 'salience',
    secondaryNetworks: ['limbic-parasympathetic', 'reward-motivation'],
    consciousnessState: 'transformative-depth',
    developmentalStage: 'Sustaining intensity through transformation',
    archetypeTitle: 'The Alchemist',
    experientialQualities: [
      'Emotional intensity',
      'Death-rebirth awareness',
      'Shadow integration',
      'Intimate merging',
      'Power transformation'
    ],
    pathologicalExpressions: [
      'Destructive intensity',
      'Control through manipulation',
      'Addiction to transformation',
      'Shadow possession'
    ],
    integratedExpressions: [
      'Conscious alchemy',
      'Shadow as gold',
      'Intimacy as sacred practice',
      'Power serving evolution'
    ],
    neuropsychologicalDescription: 'Right hemisphere sustaining transformative emotional depth through the salience network. Your brain highlights what must die to be reborn, composting shadow into evolutionary fuel. This is intensity as sacred passage.',
    spiritualInvitation: 'You are invited to embrace the dark waters as the womb of renewal—to let the oceanic mirror show what must transform. This is the neural pathway for conscious alchemy.'
  },

  9: {
    house: 9,
    sign: 'Sagittarius',
    element: 'fire',
    modality: 'mutable',
    neuralRegion: 'right-prefrontal-cortex',
    primaryNetwork: 'visual-spatial',
    secondaryNetworks: ['default-mode', 'executive-control'],
    consciousnessState: 'visionary-synthesis',
    developmentalStage: 'Expanding vision into wisdom',
    archetypeTitle: 'The Philosopher',
    experientialQualities: [
      'Quest for meaning',
      'Expansive vision',
      'Philosophical synthesis',
      'Spiritual exploration',
      'Universal understanding'
    ],
    pathologicalExpressions: [
      'Spiritual bypassing',
      'Dogmatic belief',
      'Endless seeking without grounding',
      'Vision without embodiment'
    ],
    integratedExpressions: [
      'Embodied wisdom',
      'Vision serving evolution',
      'Open-minded exploration',
      'Universal truth through particularity'
    ],
    neuropsychologicalDescription: 'Right prefrontal cortex expanding vision into wisdom through visual-spatial integration. Your brain dissolves boundaries between self and cosmos, synthesizing meaning across all horizons. This is vision becoming universal understanding.',
    spiritualInvitation: 'You are invited to refine vision into transcendent wisdom—to let the horizon-mind touch all boundaries and return home. This is the neural pathway for spiritual synthesis.'
  },

  10: {
    house: 10,
    sign: 'Capricorn',
    element: 'earth',
    modality: 'cardinal',
    neuralRegion: 'left-motor-somatosensory',
    primaryNetwork: 'executive-control',
    secondaryNetworks: ['sensorimotor', 'reward-motivation'],
    consciousnessState: 'embodied-authority',
    developmentalStage: 'Initiating public mission',
    archetypeTitle: 'The Master',
    experientialQualities: [
      'Disciplined purpose',
      'Public authority',
      'Structured mastery',
      'Long-term vision',
      'Leadership responsibility'
    ],
    pathologicalExpressions: [
      'Ambition without soul',
      'Workaholism and burnout',
      'Authority as domination',
      'Achievement as worthiness'
    ],
    integratedExpressions: [
      'Purpose serving collective',
      'Mastery through devotion',
      'Authority with humility',
      'Structure liberating spirit'
    ],
    neuropsychologicalDescription: 'Left hemisphere initiating structured manifestation through executive control. Your brain grounds vision in disciplined purpose, laying the first stone of embodied authority. This is spirit touching soil, intention becoming structure.',
    spiritualInvitation: 'You are invited to honor the slow work of mastery—to let the patient bones initiate form through disciplined devotion. This is the neural pathway for embodied authority.'
  },

  11: {
    house: 11,
    sign: 'Aquarius',
    element: 'air',
    modality: 'fixed',
    neuralRegion: 'left-prefrontal-cortex',
    primaryNetwork: 'default-mode',
    secondaryNetworks: ['language', 'executive-control'],
    consciousnessState: 'collective-mind',
    developmentalStage: 'Sustaining collective systems',
    archetypeTitle: 'The Visionary',
    experientialQualities: [
      'Collective awareness',
      'Systems thinking',
      'Innovative vision',
      'Group intelligence',
      'Future orientation'
    ],
    pathologicalExpressions: [
      'Detachment from embodiment',
      'Idealism without grounding',
      'Rebellion without purpose',
      'Group-think suppressing individuality'
    ],
    integratedExpressions: [
      'Individual serving collective',
      'Innovation grounded in wisdom',
      'Systems honoring soul',
      'Future vision embodied now'
    ],
    neuropsychologicalDescription: 'Left prefrontal cortex sustaining collective intelligence through network coordination. Your brain weaves individual thought into cooperative systems, building shared vision from distributed awareness. This is the network mind.',
    spiritualInvitation: 'You are invited to trust the wisdom emerging between minds—to let the listening wind sustain connection through shared vision. This is the neural pathway for collective consciousness.'
  },

  12: {
    house: 12,
    sign: 'Pisces',
    element: 'water',
    modality: 'mutable',
    neuralRegion: 'right-temporal-insular',
    primaryNetwork: 'default-mode',
    secondaryNetworks: ['limbic-parasympathetic', 'whole-brain-integration'],
    consciousnessState: 'mystical-dissolution',
    developmentalStage: 'Dissolving into mystical unity',
    archetypeTitle: 'The Mystic',
    experientialQualities: [
      'Boundless compassion',
      'Mystical awareness',
      'Unconscious communion',
      'Spiritual surrender',
      'Universal empathy'
    ],
    pathologicalExpressions: [
      'Escapism and dissociation',
      'Victimhood and martyrdom',
      'Boundary dissolution as pathology',
      'Spiritual inflation'
    ],
    integratedExpressions: [
      'Compassion with boundaries',
      'Mystical awareness grounded',
      'Surrender as strength',
      'Unity honoring individuality'
    ],
    neuropsychologicalDescription: 'Right hemisphere dissolving into mystical unity through whole-brain integration. Your brain becomes the ocean itself, boundaries between self and other dissolving into universal compassion. This is the gateway to non-dual awareness.',
    spiritualInvitation: 'You are invited to surrender into the sacred mystery—to let the oceanic mirror dissolve into the ocean of all being. This is the neural pathway for mystical consciousness.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PLANETARY → NEUROCHEMICAL → ARCHETYPE MAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Planetary neurochemical mapping
 * Planets act as drivers—activating specific neurochemical systems
 */
export interface PlanetaryNeuralMapping {
  planet: string;
  symbol: string;
  archetypeTitle: string;

  // Neurochemical layer
  primaryNeurochemistry: NeurochemicalSystem;
  secondaryNeurochemistry?: NeurochemicalSystem;

  // Network activation
  activatesNetworks: NeuralNetwork[];

  // Psychological qualities
  psychologicalDrive: string;
  evolutionaryPurpose: string;

  // When placed in houses/signs
  activationDescription: string;

  // Shadow & light
  shadowExpression: string;
  integratedExpression: string;
}

/**
 * The planetary neurochemical system
 */
export const PLANETARY_NEURAL_MAPPING: Record<string, PlanetaryNeuralMapping> = {
  sun: {
    planet: 'Sun',
    symbol: '☉',
    archetypeTitle: 'The Self',
    primaryNeurochemistry: 'noradrenergic',
    activatesNetworks: ['default-mode', 'executive-control'],
    psychologicalDrive: 'Identity coherence and self-realization',
    evolutionaryPurpose: 'To become who you truly are',
    activationDescription: 'Activates the default-mode network for identity coherence. Noradrenergic alertness illuminates the core self, creating conscious awareness of "I am." The Sun represents the organizing principle of consciousness.',
    shadowExpression: 'Narcissistic self-absorption, ego inflation, identification with persona',
    integratedExpression: 'Authentic self-awareness, conscious identity, integrated wholeness'
  },

  moon: {
    planet: 'Moon',
    symbol: '☽',
    archetypeTitle: 'The Mother',
    primaryNeurochemistry: 'limbic-parasympathetic',
    secondaryNeurochemistry: 'oxytocin',
    activatesNetworks: ['salience', 'parasympathetic'],
    psychologicalDrive: 'Emotional attunement and safety',
    evolutionaryPurpose: 'To feel and be felt',
    activationDescription: 'Activates the limbic-parasympathetic system for emotional regulation and nurture. Creates internal sanctuary through oxytocin bonding. The Moon represents emotional intelligence and instinctual knowing.',
    shadowExpression: 'Emotional reactivity, dependency, regression to childhood patterns',
    integratedExpression: 'Emotional wisdom, secure attachment, intuitive guidance'
  },

  mercury: {
    planet: 'Mercury',
    symbol: '☿',
    archetypeTitle: 'The Messenger',
    primaryNeurochemistry: 'cholinergic',
    activatesNetworks: ['language', 'executive-control'],
    psychologicalDrive: 'Communication and understanding',
    evolutionaryPurpose: 'To connect and communicate',
    activationDescription: 'Activates cholinergic attention and learning networks. Enhances language processing and symbolic thinking. Mercury represents the bridge between mind and world, thought and speech.',
    shadowExpression: 'Mental fragmentation, overthinking, communication without embodiment',
    integratedExpression: 'Clear communication, integrated understanding, mental agility serving wisdom'
  },

  venus: {
    planet: 'Venus',
    symbol: '♀',
    archetypeTitle: 'The Lover',
    primaryNeurochemistry: 'serotonergic',
    secondaryNeurochemistry: 'oxytocin',
    activatesNetworks: ['reward-motivation', 'salience'],
    psychologicalDrive: 'Connection, pleasure, and harmony',
    evolutionaryPurpose: 'To love and be loved',
    activationDescription: 'Activates serotonergic social bonding and oxytocin intimacy. Creates pleasure and harmony through relational attunement. Venus represents the capacity for love, beauty, and value.',
    shadowExpression: 'People-pleasing, attachment, beauty as worth',
    integratedExpression: 'Authentic love, self-worth, relational wisdom'
  },

  mars: {
    planet: 'Mars',
    symbol: '♂',
    archetypeTitle: 'The Warrior',
    primaryNeurochemistry: 'dopaminergic',
    activatesNetworks: ['reward-motivation', 'sensorimotor'],
    psychologicalDrive: 'Action, assertion, and desire',
    evolutionaryPurpose: 'To act and assert',
    activationDescription: 'Activates dopaminergic seeking and reward systems. Drives action through desire and assertion. Mars represents the capacity for directed will, courage, and healthy aggression.',
    shadowExpression: 'Impulsive aggression, destructive anger, compulsive action',
    integratedExpression: 'Conscious will, courageous action, desire serving evolution'
  },

  jupiter: {
    planet: 'Jupiter',
    symbol: '♃',
    archetypeTitle: 'The King',
    primaryNeurochemistry: 'dopaminergic',
    activatesNetworks: ['visual-spatial', 'reward-motivation'],
    psychologicalDrive: 'Expansion, meaning, and growth',
    evolutionaryPurpose: 'To expand and understand',
    activationDescription: 'Activates dopaminergic expansion and frontal integration. Creates reward expectancy for growth and meaning. Jupiter represents the principle of expansion, optimism, and philosophical synthesis.',
    shadowExpression: 'Excess and overexpansion, spiritual bypassing, grandiosity',
    integratedExpression: 'Embodied wisdom, generous expansion, meaning serving growth'
  },

  saturn: {
    planet: 'Saturn',
    symbol: '♄',
    archetypeTitle: 'The Teacher',
    primaryNeurochemistry: 'gaba-ergic',
    activatesNetworks: ['executive-control', 'sensorimotor'],
    psychologicalDrive: 'Structure, discipline, and mastery',
    evolutionaryPurpose: 'To mature and master',
    activationDescription: 'Activates GABA-ergic inhibition and executive control. Creates boundaries and structure through restraint. Saturn represents the principle of limitation, discipline, and time.',
    shadowExpression: 'Rigidity and control, fear-based restriction, harsh self-criticism',
    integratedExpression: 'Mature boundaries, devotional discipline, structure serving freedom'
  },

  uranus: {
    planet: 'Uranus',
    symbol: '♅',
    archetypeTitle: 'The Awakener',
    primaryNeurochemistry: 'noradrenergic',
    activatesNetworks: ['salience', 'default-mode'],
    psychologicalDrive: 'Liberation, innovation, and awakening',
    evolutionaryPurpose: 'To awaken and liberate',
    activationDescription: 'Activates noradrenergic alertness to novelty and sudden insight. Disrupts habitual patterns for evolutionary breakthroughs. Uranus represents the principle of awakening consciousness.',
    shadowExpression: 'Chaotic rebellion, detachment from grounding, instability',
    integratedExpression: 'Conscious innovation, grounded awakening, freedom with responsibility'
  },

  neptune: {
    planet: 'Neptune',
    symbol: '♆',
    archetypeTitle: 'The Mystic',
    primaryNeurochemistry: 'endorphinergic',
    activatesNetworks: ['default-mode', 'whole-brain-integration'],
    psychologicalDrive: 'Transcendence, compassion, and unity',
    evolutionaryPurpose: 'To dissolve and unite',
    activationDescription: 'Activates endorphinergic transcendence and boundary dissolution. Creates mystical awareness and universal compassion. Neptune represents the principle of spiritual union and imaginal reality.',
    shadowExpression: 'Escapism and dissociation, addiction, spiritual inflation',
    integratedExpression: 'Grounded mysticism, compassion with boundaries, inspiration serving embodiment'
  },

  pluto: {
    planet: 'Pluto',
    symbol: '♇',
    archetypeTitle: 'The Transformer',
    primaryNeurochemistry: 'endocannabinoid',
    activatesNetworks: ['salience', 'limbic-parasympathetic'],
    psychologicalDrive: 'Transformation, power, and death-rebirth',
    evolutionaryPurpose: 'To die and be reborn',
    activationDescription: 'Activates the endocannabinoid system for deep transformation and stress resilience. Highlights what must die for evolution. Pluto represents the principle of death-rebirth consciousness.',
    shadowExpression: 'Destructive compulsion, power-over dynamics, shadow possession',
    integratedExpression: 'Conscious alchemy, empowered transformation, shadow as evolutionary fuel'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ASPECT → INTER-REGIONAL DYNAMICS MAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Aspect patterns as neural network dynamics
 */
export interface AspectNeuralMapping {
  aspect: string;
  angle: number;
  orb: number;

  // Inter-regional dynamics
  dynamic: InterRegionalDynamic;

  // Network relationship
  networkRelationship: string;

  // Psychological experience
  psychologicalExperience: string;

  // Developmental opportunity
  developmentalOpportunity: string;

  // MAIA interpretation
  neurodynamicDescription: string;
}

/**
 * The aspect-to-neural-dynamics system
 */
export const ASPECT_NEURAL_MAPPING: Record<string, AspectNeuralMapping> = {
  conjunction: {
    aspect: 'Conjunction',
    angle: 0,
    orb: 8,
    dynamic: 'fused-activation-field',
    networkRelationship: 'Two planets/networks activating as unified field',
    psychologicalExperience: 'Intensity, fusion, inseparability of drives',
    developmentalOpportunity: 'Integration of different archetypal energies into coherent expression',
    neurodynamicDescription: 'A fused activation field where two archetypal drives merge into single expression. These networks fire together, wire together—creating intense, unified consciousness that seeks integrated expression.'
  },

  opposition: {
    aspect: 'Opposition',
    angle: 180,
    orb: 8,
    dynamic: 'cross-hemispheric-tension',
    networkRelationship: 'Two planets/networks in opposing hemispheres or perspectives',
    psychologicalExperience: 'Tension, polarity, awareness through contrast',
    developmentalOpportunity: 'Integration of opposites into paradoxical wholeness',
    neurodynamicDescription: 'Cross-hemispheric tension requiring integration. Like the corpus callosum bridging left and right brain, you are called to hold both perspectives simultaneously—not choosing one over the other, but discovering the third position that honors both.'
  },

  trine: {
    aspect: 'Trine',
    angle: 120,
    orb: 8,
    dynamic: 'harmonic-synchronization',
    networkRelationship: 'Two planets/networks in natural resonance (same element)',
    psychologicalExperience: 'Ease, flow, natural talent',
    developmentalOpportunity: 'Using gifts intentionally rather than unconsciously',
    neurodynamicDescription: 'Harmonic synchronization between networks. Like neurons firing in coherent rhythm, these archetypal energies flow naturally together. The gift here is ease; the challenge is conscious application of natural talent.'
  },

  square: {
    aspect: 'Square',
    angle: 90,
    orb: 8,
    dynamic: 'competing-network-priorities',
    networkRelationship: 'Two planets/networks with incompatible drives (different elements/modalities)',
    psychologicalExperience: 'Friction, challenge, growth through conflict',
    developmentalOpportunity: 'Building strength through working with resistance',
    neurodynamicDescription: 'Competing network priorities creating developmental friction. Like muscles growing through resistance training, your consciousness evolves by working with this tension. Neither network can dominate—integration requires creative problem-solving.'
  },

  sextile: {
    aspect: 'Sextile',
    angle: 60,
    orb: 6,
    dynamic: 'cooperative-modulation',
    networkRelationship: 'Two planets/networks in supportive collaboration',
    psychologicalExperience: 'Opportunity, potential, cooperative flow',
    developmentalOpportunity: 'Actively engaging potential through conscious choice',
    neurodynamicDescription: 'Cooperative modulation where networks support each other when activated together. Like complementary cognitive functions, these energies work well together—but require conscious engagement to manifest potential.'
  },

  quincunx: {
    aspect: 'Quincunx (Inconjunct)',
    angle: 150,
    orb: 3,
    dynamic: 'creative-adjustment',
    networkRelationship: 'Two planets/networks requiring constant recalibration',
    psychologicalExperience: 'Awkwardness, need for adjustment, creative problem-solving',
    developmentalOpportunity: 'Flexibility and adaptation through integrating incompatible elements',
    neurodynamicDescription: 'Creative adjustment requiring ongoing recalibration. Like learning to write with your non-dominant hand while juggling—these networks don\'t naturally coordinate, demanding flexibility and innovative solutions.'
  },

  semisextile: {
    aspect: 'Semi-sextile',
    angle: 30,
    orb: 2,
    dynamic: 'focused-intention',
    networkRelationship: 'Two adjacent planets/networks requiring conscious bridging',
    psychologicalExperience: 'Subtle connection requiring attention to activate',
    developmentalOpportunity: 'Building bridges through focused intention',
    neurodynamicDescription: 'Focused intention bridging adjacent developmental stages. Like stepping stones requiring deliberate steps, these networks connect through conscious attention and repeated practice.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AETHER INTEGRATION & COHERENCE METRICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Aether coherence—measuring whole-brain integration
 */
export interface AetherCoherenceMetrics {
  // Elemental balance (are all 4 elements present and integrated?)
  fireActivation: number;      // 0-1 scale
  waterActivation: number;
  earthActivation: number;
  airActivation: number;

  // Hemispheric balance (McGilchrist's framework)
  rightHemisphereEngagement: number;
  leftHemisphereEngagement: number;
  hemisphericBalance: number;   // Closer to 1 = more integrated

  // Network integration
  networkCoherence: number;     // How well do all networks communicate?

  // Developmental stage
  overallIntegration: 'fragmented' | 'developing' | 'balanced' | 'transcendent';

  // Specific recommendations
  underactivatedElement?: Element;
  dominantElement?: Element;
  integrationPath: string;
}

/**
 * Calculate Aether coherence from a birth chart
 */
export function calculateAetherCoherence(
  planetPlacements: Array<{ house: number; planet: string }>
): AetherCoherenceMetrics {
  // Count planetary placements by element
  const elementCounts = { fire: 0, water: 0, earth: 0, air: 0 };
  const hemisphereCounts = { right: 0, left: 0 };

  planetPlacements.forEach(({ house }) => {
    const mapping = HOUSE_NEURAL_MAPPING[house];
    if (!mapping) return;

    // Count element
    elementCounts[mapping.element]++;

    // Count hemisphere
    if (mapping.neuralRegion.includes('right')) {
      hemisphereCounts.right++;
    } else if (mapping.neuralRegion.includes('left')) {
      hemisphereCounts.left++;
    }
  });

  // Normalize to 0-1 scale
  const total = planetPlacements.length;
  const fireActivation = elementCounts.fire / total;
  const waterActivation = elementCounts.water / total;
  const earthActivation = elementCounts.earth / total;
  const airActivation = elementCounts.air / total;

  const rightHemisphereEngagement = hemisphereCounts.right / total;
  const leftHemisphereEngagement = hemisphereCounts.left / total;

  // Calculate balance (closer to 0.5/0.5 split = more balanced)
  const hemisphericBalance = 1 - Math.abs(rightHemisphereEngagement - leftHemisphereEngagement);

  // Calculate overall network coherence
  // Ideal: all elements present (0.25 each), good hemispheric balance
  const elementVariance = Math.abs(0.25 - fireActivation) +
                          Math.abs(0.25 - waterActivation) +
                          Math.abs(0.25 - earthActivation) +
                          Math.abs(0.25 - airActivation);
  const networkCoherence = 1 - (elementVariance / 2); // Normalize to 0-1

  // Determine integration stage
  let overallIntegration: AetherCoherenceMetrics['overallIntegration'];
  if (networkCoherence > 0.8 && hemisphericBalance > 0.8) {
    overallIntegration = 'transcendent';
  } else if (networkCoherence > 0.6 && hemisphericBalance > 0.6) {
    overallIntegration = 'balanced';
  } else if (networkCoherence > 0.4 || hemisphericBalance > 0.4) {
    overallIntegration = 'developing';
  } else {
    overallIntegration = 'fragmented';
  }

  // Find dominant and underactivated elements
  const elementActivations = { fire: fireActivation, water: waterActivation, earth: earthActivation, air: airActivation };
  const dominantElement = Object.entries(elementActivations).reduce((a, b) => a[1] > b[1] ? a : b)[0] as Element;
  const underactivatedElement = Object.entries(elementActivations).reduce((a, b) => a[1] < b[1] ? a : b)[0] as Element;

  // Generate integration path
  const integrationPath = generateIntegrationPath(overallIntegration, underactivatedElement, dominantElement, hemisphericBalance);

  return {
    fireActivation,
    waterActivation,
    earthActivation,
    airActivation,
    rightHemisphereEngagement,
    leftHemisphereEngagement,
    hemisphericBalance,
    networkCoherence,
    overallIntegration,
    underactivatedElement: underactivatedElement !== dominantElement ? underactivatedElement : undefined,
    dominantElement,
    integrationPath
  };
}

/**
 * Generate personalized integration path toward Aether
 */
function generateIntegrationPath(
  stage: AetherCoherenceMetrics['overallIntegration'],
  underactivated?: Element,
  dominant?: Element,
  hemisphericBalance?: number
): string {
  const paths: Record<typeof stage, string> = {
    fragmented: `Your consciousness is learning to integrate multiple archetypal energies. ${underactivated ? `Focus on developing your ${underactivated} element` : 'Begin by exploring all four elements'} to build foundational coherence.`,

    developing: `You are developing integration across archetypal fields. ${underactivated ? `Strengthening your ${underactivated} element will enhance overall balance.` : ''} ${hemisphericBalance && hemisphericBalance < 0.6 ? 'Practice bridging left and right hemisphere perspectives.' : ''}`,

    balanced: `You have achieved balanced integration across elements and hemispheres. Your path now is refining this balance through conscious practice. ${dominant ? `Your ${dominant} element can serve as a gateway to the others.` : ''}`,

    transcendent: `You embody Aether consciousness—all elements and networks communicate in harmony. Your path is teaching others and deepening into the mystery of non-dual awareness while remaining grounded in particularity.`
  };

  return paths[stage];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIA INTERPRETATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate MAIA's neuro-archetypal interpretation of a planet in a house
 */
export function interpretPlanetInHouse(planet: string, house: number): string {
  const planetMapping = PLANETARY_NEURAL_MAPPING[planet.toLowerCase()];
  const houseMapping = HOUSE_NEURAL_MAPPING[house];

  if (!planetMapping || !houseMapping) {
    return '';
  }

  return `Your ${planetMapping.archetypeTitle} (${planetMapping.planet}) activates through ${houseMapping.archetypeTitle} consciousness in House ${house}.

**Neurological substrate:** ${planetMapping.activationDescription}

**Consciousness field:** ${houseMapping.consciousnessState} — ${houseMapping.neuropsychologicalDescription}

**Integration:** When ${planetMapping.planet}'s ${planetMapping.primaryNeurochemistry} drive meets ${houseMapping.element} consciousness, you experience ${planetMapping.psychologicalDrive} through ${houseMapping.experientialQualities.join(', ')}.

**Shadow:** Watch for ${planetMapping.shadowExpression} expressing through ${houseMapping.pathologicalExpressions[0]}.

**Light:** Cultivate ${planetMapping.integratedExpression} through ${houseMapping.integratedExpressions[0]}.

**Invitation:** ${houseMapping.spiritualInvitation}`;
}

/**
 * Generate MAIA's interpretation of an aspect between two planets
 */
export function interpretAspect(
  planet1: string,
  planet2: string,
  aspectType: string
): string {
  const p1 = PLANETARY_NEURAL_MAPPING[planet1.toLowerCase()];
  const p2 = PLANETARY_NEURAL_MAPPING[planet2.toLowerCase()];
  const aspect = ASPECT_NEURAL_MAPPING[aspectType.toLowerCase()];

  if (!p1 || !p2 || !aspect) {
    return '';
  }

  return `${p1.planet} ${aspect.aspect} ${p2.planet} — ${aspect.neurodynamicDescription}

**Network relationship:** ${p1.archetypeTitle} (${p1.primaryNeurochemistry}) and ${p2.archetypeTitle} (${p2.primaryNeurochemistry}) create ${aspect.networkRelationship}.

**Experience:** ${aspect.psychologicalExperience}

**Opportunity:** ${aspect.developmentalOpportunity}`;
}

/**
 * Get elemental recommendations for integration
 */
export function getElementalRecommendations(element: Element): string {
  const recommendations: Record<Element, string> = {
    fire: '🔥 To strengthen Fire consciousness: Engage in visionary practices, creative expression, spiritual study. Spend time envisioning your future. Practice right-brain intuitive knowing.',

    water: '💧 To strengthen Water consciousness: Engage in emotional processing, depth psychology, dreamwork, ancestral healing. Practice feeling as sacred data. Honor your instinctual wisdom.',

    earth: '🌍 To strengthen Earth consciousness: Engage in embodied practices, physical work, ritual, devotional service. Build something tangible. Practice patience and sensory awareness.',

    air: '💨 To strengthen Air consciousness: Engage in dialogue, study, communication, systems thinking. Practice perspective-taking. Honor the power of clear thought and authentic speech.'
  };

  return recommendations[element];
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  HOUSE_NEURAL_MAPPING,
  PLANETARY_NEURAL_MAPPING,
  ASPECT_NEURAL_MAPPING,
  calculateAetherCoherence,
  interpretPlanetInHouse,
  interpretAspect,
  getElementalRecommendations
};
