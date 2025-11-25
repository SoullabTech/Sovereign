/**
 * Complete Spiralogic Pathway Data
 *
 * Kelly Beard's Elemental Alchemy framework with ALL layers:
 * - I Statements (essence)
 * - States (Cardinal/Fixed/Mutable)
 * - Phases (Purpose/Play/Practice, etc.)
 * - Alchemical operations
 * - McGilchrist's brain model
 * - Homeostasis/Heterostasis dynamics
 *
 * This is the FULL depth for those ready to go deeper.
 */

export interface HouseData {
  number: number;

  // Layer 1: Core Identity
  iStatement: string; // "I Explore", "I Feel", etc.
  name: string; // Traditional name

  // Layer 2: The Journey
  phase: string; // Purpose, Heart, Mission, Connection
  state: string; // Activating, Bonding, Creating, Directing
  modality: 'cardinal' | 'fixed' | 'mutable';
  modalityMeaning: string; // Initiation, Immersion, Integration

  // Layer 3: Neuroscience
  brainRegion: string; // "Right Prefrontal Cortex"
  hemisphereFunction: string; // What this brain region does

  // Layer 4: Alchemical Process
  alchemicalOperation: string; // Calcinatio, Solutio, Coagulatio, Separatio
  alchemicalDescription: string;

  // Layer 5: Homeostasis/Heterostasis
  homeostaticTendency: string; // What we cling to
  heterostaticChallenge: string; // What pushes us to grow
  dynamicBalance: string; // How to work with both

  // Layer 6: Lived Experience
  description: string;
  soulQuestions: string[];
  embodiedPractices: string[];

  // Layer 7: Shadow Integration
  shadowWork: string;
  giftWhenIntegrated: string;
}

export interface PathwayData {
  element: 'fire' | 'water' | 'earth' | 'air';
  name: string;

  // The Journey
  iStatements: [string, string, string]; // [I Explore, I Express, I Expand]
  phases: [string, string, string]; // [Purpose, Play, Practice]
  states: [string, string, string]; // [Activating, Amplifying, Adapting]

  // Neuroscience
  brainRegion: string;
  masterOrEmissary: 'master' | 'emissary';
  mcgilchristInsight: string;

  // The Dynamic
  pathwayFlow: string; // How the 3 houses flow together
  elementalGift: string; // What this element brings
  elementalChallenge: string; // Where it can get stuck

  houses: [HouseData, HouseData, HouseData];
}

export const FIRE_PATHWAY: PathwayData = {
  element: 'fire',
  name: 'Fire Pathway: Vision & Projection',

  iStatements: ['I Explore', 'I Express', 'I Expand'],
  phases: ['Purpose', 'Play', 'Practice'],
  states: ['Activating', 'Amplifying', 'Adapting'],

  brainRegion: 'Right Prefrontal Cortex',
  masterOrEmissary: 'master',
  mcgilchristInsight: 'The right prefrontal cortex generates compelling visions for the future, engaging with novelty and possibility. It sees the big picture before the details, creates before analyzing. This is the master\'s domain - attending to what is new and unknown.',

  pathwayFlow: 'Fire moves from the spark of identity (I Explore) → creative expression (I Express) → expanded wisdom (I Expand). This is consciousness discovering itself through vision, passion, and teaching.',
  elementalGift: 'Inspiration, courage, vision, creative passion, the spark that initiates transformation.',
  elementalChallenge: 'Burning out, flying too close to the sun (Icarus), losing groundedness, ego inflation, disconnection from body/earth.',

  houses: [
    {
      number: 1,
      iStatement: 'I Explore',
      name: 'Identity / Vision / Self-Awareness',

      phase: 'Purpose',
      state: 'Activating',
      modality: 'cardinal',
      modalityMeaning: 'Initiation - Sparking new endeavors with vigor',

      brainRegion: 'Right Prefrontal Cortex',
      hemisphereFunction: 'Generates compelling vision, attends to novelty, sees potential futures',

      alchemicalOperation: 'Calcinatio',
      alchemicalDescription: 'The fire of identity burns away what is false, leaving the purified essence of self. Like heating metal to remove impurities, this house asks: who are you when everything external is stripped away?',

      homeostaticTendency: 'Clinging to familiar identity, resisting change to self-concept, preferring known self-image',
      heterostaticChallenge: 'Being willing to evolve identity, embracing new visions of self, allowing ego transformation',
      dynamicBalance: 'Honor the stable core self while remaining open to visionary expansion. The seed of identity (homeostasis) must crack open (heterostasis) for the tree to grow.',

      description: 'The initiating flame of consciousness meeting itself. Your body as vessel for vision, presence radiating before thought. This is the cardinal fire - the spark that begins all journeys. Right Prefrontal generating futures, calling possibility into form.',

      soulQuestions: [
        'Who am I before the world names me?',
        'What vision wants to move through this body?',
        'How do I activate my authentic presence?',
        'Where does my spontaneous aliveness want to flow?'
      ],

      embodiedPractices: [
        'Morning mirror work: "I am..." declarations',
        'Breath of fire meditation (activating pranayama)',
        'Vision boarding your becoming',
        'Dance of the authentic self',
        'Ask your body: "Who are you today?"'
      ],

      shadowWork: 'The shadow of House 1 is false identity - the masks we wear, the ego we defend. When unintegrated, we either inflate (narcissism) or deflate (invisibility). The fire becomes defensive, protecting a fragile self-image.',
      giftWhenIntegrated: 'Authentic presence. You show up as YOU - no apology, no defense. Your mere presence inspires others to remember who THEY are. You become a living invitation to authenticity.'
    },
    {
      number: 5,
      iStatement: 'I Express',
      name: 'Creation / Self-Expression / Joy',

      phase: 'Play',
      state: 'Amplifying',
      modality: 'fixed',
      modalityMeaning: 'Immersion - Intensifying focus, sustaining energy',

      brainRegion: 'Right Prefrontal Cortex',
      hemisphereFunction: 'Expresses vision through creative passion, sustains inspired action',

      alchemicalOperation: 'Sublimatio',
      alchemicalDescription: 'Fire rises, transforming denser matter into lighter spirit. This is consciousness discovering itself through creation - art, children, romance, play. What was potential becomes manifest. The heat of passion transforms raw experience into beauty.',

      homeostaticTendency: 'Sticking to safe creative expressions, avoiding vulnerability, maintaining comfortable patterns',
      heterostaticChallenge: 'Risking authentic creative expression, allowing passion to lead, playing at the edge',
      dynamicBalance: 'Develop your craft (homeostasis) while remaining wildly playful (heterostasis). Mastery serves spontaneity; discipline enables freedom.',

      description: 'Consciousness becomes creator. Fixed fire—the sustained flame that forges. Vision intensifies into passion, passion into creation. Art, romance, play, offspring. The circle of creative flow where you discover yourself by making.',

      soulQuestions: [
        'What wants to be birthed through my creative fire?',
        'Where does my joy naturally overflow into form?',
        'How do I amplify passion without burning out?',
        'What would I create if failure were impossible?'
      ],

      embodiedPractices: [
        'Daily creative practice (any medium)',
        'Pleasure mapping: track what brings genuine joy',
        'Play dates with your inner child',
        'Romantic self-love rituals',
        'Express one authentic feeling through art each day'
      ],

      shadowWork: 'The shadow of House 5 is performative creation - making art for approval, confusing ego display with authentic expression. Or its opposite: creative paralysis, refusing to share gifts. Fixed fire can become stubbornly attached to one way of creating.',
      giftWhenIntegrated: 'Generative authenticity. Your creations become offerings, not demands. You create because you MUST, not to prove worth. Your joy becomes contagious, permission for others to play.'
    },
    {
      number: 9,
      iStatement: 'I Expand',
      name: 'Higher Meaning / Quest / Wisdom',

      phase: 'Practice',
      state: 'Adapting',
      modality: 'mutable',
      modalityMeaning: 'Integration - Harmonizing experiences, incorporating insights',

      brainRegion: 'Right Prefrontal Cortex',
      hemisphereFunction: 'Expands vision into spiritual fulfillment, integrates experience into wisdom',

      alchemicalOperation: 'Circulatio',
      alchemicalDescription: 'The fire circulates through all elements, rising and returning. This is the philosopher\'s fire - heat that transforms base experience into golden wisdom. Travel, teaching, spiritual seeking. The spiral of return at a higher level.',

      homeostaticTendency: 'Comfortable beliefs, familiar philosophies, known spiritual paths, cultural conditioning',
      heterostaticChallenge: 'Expanding beyond inherited worldviews, embracing paradox, following the quest into unknown territory',
      dynamicBalance: 'Ground in tradition (homeostasis) while questing beyond its boundaries (heterostasis). Honor teachers while becoming your own authority.',

      description: 'Mutable fire—the adaptable flame of wisdom. Personal vision merges with cosmic illumination. Philosophy, distant horizons, teachings that span cultures. The spiral of integration where your spark becomes a beacon for the collective.',

      soulQuestions: [
        'What truth burns so bright it must be shared?',
        'Where must I journey to meet my expanded self?',
        'How does my wisdom serve collective awakening?',
        'What teachings want to move through me?'
      ],

      embodiedPractices: [
        'Teach what you\'re learning (rubber duck effect)',
        'Study systems different from your worldview',
        'Sacred travel (pilgrimage)',
        'Philosophy journaling',
        'Ask elders for wisdom'
      ],

      shadowWork: 'The shadow of House 9 is spiritual bypassing - using philosophy to avoid embodiment, confusing information with transformation. Or fundamentalism - clinging rigidly to one truth. Mutable fire can scatter, never landing.',
      giftWhenIntegrated: 'Embodied wisdom. You become the teaching, not just the teacher. Your life IS the philosophy. You expand consciousness by your presence, not just your words.'
    }
  ]
};

/**
 * WATER PATHWAY - Houses 4, 8, 12
 * I Feel → I Flow → I Fathom
 * Heart → Healing → Holiness
 * Bonding → Balancing → Becoming
 * Right Hemisphere (Master)
 * Alchemical Operation: Solutio (Dissolution)
 */

export const WATER_PATHWAY: PathwayData = {
  element: 'water',
  name: 'Water Pathway: Introspection & Depth',

  iStatements: ['I Feel', 'I Flow', 'I Fathom'],
  phases: ['Heart', 'Healing', 'Holiness'],
  states: ['Bonding', 'Balancing', 'Becoming'],

  brainRegion: 'Right Hemisphere',
  masterOrEmissary: 'master',
  mcgilchristInsight: 'The right hemisphere attends to the living, relational world. It perceives depth, context, and the whole. This is where we feel connection to others, sense emotional truth, and experience the numinous. The master sees what is implicit, embodied, and alive.',

  pathwayFlow: 'Water moves from emotional intelligence (I Feel) → transformative healing (I Flow) → mystical union (I Fathom). This is consciousness discovering itself through feeling, depth, and spiritual awareness.',
  elementalGift: 'Emotional depth, empathy, healing capacity, intuitive knowing, ability to dissolve boundaries and merge with the sacred.',
  elementalChallenge: 'Drowning in emotion, losing boundaries, addiction to intensity, spiritual bypassing, avoiding the underworld journey.',

  houses: [
    {
      number: 4,
      iStatement: 'I Feel',
      name: 'Inner Child / Ancestry / Foundation',

      phase: 'Heart',
      state: 'Bonding',
      modality: 'cardinal',
      modalityMeaning: 'Initiation - Opening to emotional truth, activating heart wisdom',

      brainRegion: 'Right Hemisphere',
      hemisphereFunction: 'Reflects depth and fluidity of inner self, holds emotional memory',

      alchemicalOperation: 'Solutio',
      alchemicalDescription: 'Water dissolves rigid structures. This house dissolves the false boundaries between self and feeling, self and ancestry, self and home. What was solid becomes fluid. Emotions flow, ancestral patterns surface, the inner child speaks. Dissolution precedes rebirth.',

      homeostaticTendency: 'Emotional numbness, familiar family patterns, safe emotional range, protective walls around heart',
      heterostaticChallenge: 'Feeling deeply, breaking ancestral patterns, expanding emotional capacity, vulnerability',
      dynamicBalance: 'Honor the need for emotional safety (homeostasis) while courageously opening to deeper feeling (heterostasis). The heart must be both protected and permeable.',

      description: 'KELLY: Please share your phenomenological wisdom here. What have you witnessed in 28+ years of attending to House 4? How does the inner child speak? What ancestral patterns do you see repeating? How does Solutio work at this first water house? Share client stories, your own journey, the embodied practices that actually work.',

      soulQuestions: [
        'What does my inner child need to tell me?',
        'Which ancestral patterns am I carrying?',
        'Where is my true emotional home?',
        'What feelings have I been afraid to feel?'
      ],

      embodiedPractices: [
        'Inner child dialogue (journaling or empty chair)',
        'Ancestral altar practice',
        'Feeling body scan meditation',
        'Create sanctuary space',
        'KELLY: Add your practices...'
      ],

      shadowWork: 'KELLY: What is the shadow of House 4? How do people avoid their inner child? What happens when ancestral wounds stay unconscious? How does this relate to the Robert A. Johnson "inner gold" teaching?',
      giftWhenIntegrated: 'KELLY: What gift emerges when someone fully integrates House 4? What does it look like when someone has done this work?'
    },
    {
      number: 8,
      iStatement: 'I Flow',
      name: 'Shadow / Rebirth / Power',

      phase: 'Healing',
      state: 'Balancing',
      modality: 'fixed',
      modalityMeaning: 'Immersion - Sustaining presence in the underworld, fixed in transformation',

      brainRegion: 'Right Hemisphere',
      hemisphereFunction: 'Uncovers deepest truths through transformation, holds paradox',

      alchemicalOperation: 'Mortificatio',
      alchemicalDescription: 'Death before rebirth. This is the water of the underworld - the dissolution that precedes new life. Fixed water holds you in the depths until transformation is complete. Shadow work, sexual alchemy, ego death, power reclaimed. The baptism that drowns the false self.',

      homeostaticTendency: 'Surface living, avoiding shadow, maintaining control, fear of death/transformation',
      heterostaticChallenge: 'Descent into shadow, surrendering control, allowing ego death, facing taboos',
      dynamicBalance: 'Build ego strength (homeostasis) so you can surrender it (heterostasis). You must have a self before you can lose it. The strongest swimmers can dive deepest.',

      description: 'KELLY: This is the heart of the alchemical journey. Share what you know about House 8 - the underworld, the shadow, the sexual mysteries, the death/rebirth cycle. How does Robert A. Johnson\'s work on projection show up here? What happens when people reclaim their power?',

      soulQuestions: [
        'What parts of myself have I exiled to shadow?',
        'Where am I being called to die and be reborn?',
        'What power have I given away?',
        'What taboo truth wants to be spoken?'
      ],

      embodiedPractices: [
        'Shadow journaling (3-2-1 process)',
        'Sexual alchemy practices',
        'Ego death meditation',
        'Power reclamation ritual',
        'KELLY: Add your practices...'
      ],

      shadowWork: 'KELLY: The shadow of House 8? The ways people avoid this work? False power vs true power? Spiritual bypassing of the shadow journey?',
      giftWhenIntegrated: 'KELLY: What emerges when someone completes the House 8 journey? What does integrated power look like?'
    },
    {
      number: 12,
      iStatement: 'I Fathom',
      name: 'Dream / Mystic / Transcendent',

      phase: 'Holiness',
      state: 'Becoming',
      modality: 'mutable',
      modalityMeaning: 'Integration - Dissolving into the infinite, adapting to the numinous',

      brainRegion: 'Right Hemisphere',
      hemisphereFunction: 'Facilitates internal alignment and spiritual awareness, holds mystery',

      alchemicalOperation: 'Sublimatio',
      alchemicalDescription: 'Water becomes steam, matter becomes spirit. This is the final dissolution - the boundaries between self and cosmos dissolve. Mystical union, past-life karma, dreams that carry numinous weight. The water returns to the ocean of consciousness.',

      homeostaticTendency: 'Concrete reality, rational worldview, fear of dissolution, resistance to mystery',
      heterostaticChallenge: 'Opening to mystical experience, surrendering to the unknown, allowing boundaries to dissolve',
      dynamicBalance: 'Stay grounded in body (homeostasis) while opening to transcendent experience (heterostasis). The mystic must live in the world.',

      description: 'The dreamer who sees the web of interconnectivity. What the world calls ADD/ADHD is often Attention to Divine Design - mesmerized by how all is one. Mutable water dissolves the boundaries between self and cosmos, seeing patterns others miss. This isn\'t distraction, it\'s attending to depths. The right hemisphere perceiving the living whole while emissary culture pathologizes the gift. Buckminster Fuller: "Don\'t fight the old, build the new." The mystic creates a world they want to live in - not an isolated house of mirrors but a circle of tribe, a spiral of rich growth, a torus of holiness, a holon of honey. This is consciousness recognizing itself through the web.',

      soulQuestions: [
        'What dreams carry sacred messages?',
        'Where am I being called to surrender?',
        'What past-life patterns am I releasing?',
        'How do I serve the sacred?'
      ],

      embodiedPractices: [
        'Dream journaling and active imagination',
        'Contemplative prayer or meditation',
        'Sacred service (karma yoga)',
        'Past-life regression',
        'Crown chakra activation: receptive broadcasting halo',
        'Notice when vision lights up upper chest, throat, crown simultaneously',
        'Attend to the web of interconnectivity without needing to control it'
      ],

      shadowWork: 'The shadow of House 12 is pathologization of the gift. The world medicates the mystic, calls them disordered. Or the opposite: spiritual bypassing - floating in transcendence, avoiding embodiment. Addiction as false dissolution. Dissociation masquerading as mystical experience. The challenge is discernment: are you attending to Divine Design or escaping reality?',
      giftWhenIntegrated: 'Attention to Divine Design. Attending to Designing Higher Domains. You SEE the web of interconnectivity and can HOLD it while living in the world. Your "distraction" becomes your superpower - pattern recognition across domains. You build systems that support others\' right hemisphere gifts instead of pathologizing them. The mesmerized mystic becomes the architect of awakening.'
    }
  ]
};

// EARTH PATHWAY - Houses 10, 2, 6
// (Kelly to transmit next)

// AIR PATHWAY - Houses 7, 11, 3
// (Kelly to transmit next)
