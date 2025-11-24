/**
 * MAYAN ASTROLOGY LIBRARY
 *
 * Tzolk'in Sacred Calendar System
 * - 20 Solar Seals (Day Signs)
 * - 13 Galactic Tones
 * - 260-day cycle (20 x 13)
 * - Integration with Spiralogic elemental model
 *
 * Used professionally by many Spiralogic community members
 */

export type MayanDaySign =
  | 'imix' | 'ik' | 'akbal' | 'kan' | 'chicchan'
  | 'cimi' | 'manik' | 'lamat' | 'muluc' | 'oc'
  | 'chuen' | 'eb' | 'ben' | 'ix' | 'men'
  | 'cib' | 'caban' | 'etznab' | 'cauac' | 'ahau';

export type GalacticTone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface MayanSignInfo {
  number: number;
  name: string;
  glyph: string;
  meaning: string;
  archetype: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  power: string;
  action: string;
  essence: string;
  description: string;
}

export interface GalacticToneInfo {
  number: GalacticTone;
  name: string;
  meaning: string;
  intention: string;
  description: string;
  stage: 'initiation' | 'challenge' | 'empowerment' | 'completion';
}

export interface MayanBirthSign {
  daySign: MayanSignInfo;
  tone: GalacticToneInfo;
  tzolkinNumber: number; // 1-260
  wavespell: string;
  galacticSignature: string;
}

/**
 * 20 Solar Seals (Day Signs) - Mayan Glyphs
 */
export const MAYAN_DAY_SIGNS: Record<MayanDaySign, MayanSignInfo> = {
  imix: {
    number: 1,
    name: 'Imix',
    glyph: '🐊',
    meaning: 'Dragon / Crocodile',
    archetype: 'The Nurturer',
    element: 'water',
    power: 'Birth',
    action: 'Nurture',
    essence: 'Being',
    description: 'Primordial mother energy. Source of all creation. Nurturing, birthing, trusting the primal waters of life.',
  },
  ik: {
    number: 2,
    name: 'Ik',
    glyph: '🌬️',
    meaning: 'Wind / Breath / Spirit',
    archetype: 'The Communicator',
    element: 'air',
    power: 'Spirit',
    action: 'Communicate',
    essence: 'Breath',
    description: 'Divine breath animating all life. Communication, inspiration, transmitting messages between realms.',
  },
  akbal: {
    number: 3,
    name: 'Akbal',
    glyph: '🌙',
    meaning: 'Night / Darkness / House',
    archetype: 'The Dreamer',
    element: 'water',
    power: 'Abundance',
    action: 'Dream',
    essence: 'Intuition',
    description: 'The sacred darkness where dreams incubate. Inner temple, intuition, abundance emerging from void.',
  },
  kan: {
    number: 4,
    name: 'Kan',
    glyph: '🌽',
    meaning: 'Seed / Lizard',
    archetype: 'The Planter',
    element: 'fire',
    power: 'Flowering',
    action: 'Target',
    essence: 'Potential',
    description: 'The seed containing all future growth. Sexual energy, kundalini, focused intention manifesting abundance.',
  },
  chicchan: {
    number: 5,
    name: 'Chicchan',
    glyph: '🐍',
    meaning: 'Serpent',
    archetype: 'The Initiator',
    element: 'fire',
    power: 'Life Force',
    action: 'Survive',
    essence: 'Instinct',
    description: 'Kundalini fire rising. Survival instincts, passion, primal life force, shedding old skins for rebirth.',
  },
  cimi: {
    number: 6,
    name: 'Cimi',
    glyph: '☠️',
    meaning: 'Death / Transformer',
    archetype: 'The Transformer',
    element: 'water',
    power: 'Transcendence',
    action: 'Release',
    essence: 'Surrender',
    description: 'Death as transformation. Releasing ego, surrendering to flow, composting what no longer serves.',
  },
  manik: {
    number: 7,
    name: 'Manik',
    glyph: '🦌',
    meaning: 'Deer / Hand',
    archetype: 'The Healer',
    element: 'earth',
    power: 'Accomplishment',
    action: 'Know',
    essence: 'Healing',
    description: 'Hands that heal and create. Spiritual tools, sacred service, knowledge applied through skillful action.',
  },
  lamat: {
    number: 8,
    name: 'Lamat',
    glyph: '⭐',
    meaning: 'Star / Rabbit / Venus',
    archetype: 'The Artist',
    element: 'air',
    power: 'Elegance',
    action: 'Beautify',
    essence: 'Harmony',
    description: 'Venus star of beauty and art. Harmony, elegance, creative expression illuminating darkness with beauty.',
  },
  muluc: {
    number: 9,
    name: 'Muluc',
    glyph: '💧',
    meaning: 'Water / Moon',
    archetype: 'The Purifier',
    element: 'water',
    power: 'Universal Water',
    action: 'Purify',
    essence: 'Flow',
    description: 'Sacred waters of purification. Emotions, flow, cleansing, allowing life to move through without attachment.',
  },
  oc: {
    number: 10,
    name: 'Oc',
    glyph: '🐕',
    meaning: 'Dog / Heart',
    archetype: 'The Companion',
    element: 'earth',
    power: 'Heart',
    action: 'Love',
    essence: 'Loyalty',
    description: 'Unconditional love and loyalty. Heart-centered guidance, emotional intelligence, faithful companionship.',
  },
  chuen: {
    number: 11,
    name: 'Chuen',
    glyph: '🐒',
    meaning: 'Monkey / Magician',
    archetype: 'The Magician',
    element: 'air',
    power: 'Magic',
    action: 'Play',
    essence: 'Illusion',
    description: 'Divine trickster and magician. Playfulness, humor, weaving reality through consciousness, time artistry.',
  },
  eb: {
    number: 12,
    name: 'Eb',
    glyph: '🛤️',
    meaning: 'Road / Human',
    archetype: 'The Pathfinder',
    element: 'earth',
    power: 'Free Will',
    action: 'Explore',
    essence: 'Wisdom',
    description: 'The human journey and sacred path. Free will, exploration, pilgrimage, finding way through direct experience.',
  },
  ben: {
    number: 13,
    name: 'Ben',
    glyph: '🌾',
    meaning: 'Reed / Skywalker',
    archetype: 'The Explorer',
    element: 'air',
    power: 'Space',
    action: 'Explore',
    essence: 'Wakefulness',
    description: 'Pillar connecting heaven and earth. Courage, exploration, expanding consciousness, walking between worlds.',
  },
  ix: {
    number: 14,
    name: 'Ix',
    glyph: '🐆',
    meaning: 'Jaguar / Wizard',
    archetype: 'The Shaman',
    element: 'earth',
    power: 'Timelessness',
    action: 'Shamanize',
    essence: 'Magic',
    description: 'Jaguar shaman navigating night. Feminine magic, earth wisdom, sensing subtle energies, indigenous knowing.',
  },
  men: {
    number: 15,
    name: 'Men',
    glyph: '🦅',
    meaning: 'Eagle / Bird',
    archetype: 'The Visionary',
    element: 'air',
    power: 'Vision',
    action: 'Create',
    essence: 'Mind',
    description: 'Eagle soaring with planetary consciousness. Visionary perspective, seeing patterns, creating from higher mind.',
  },
  cib: {
    number: 16,
    name: 'Cib',
    glyph: '🕯️',
    meaning: 'Warrior / Owl',
    archetype: 'The Warrior',
    element: 'earth',
    power: 'Intelligence',
    action: 'Question',
    essence: 'Fearlessness',
    description: 'Spiritual warrior of truth. Fearless questioning, inner knowing, owl wisdom piercing illusion with inquiry.',
  },
  caban: {
    number: 17,
    name: 'Caban',
    glyph: '🌍',
    meaning: 'Earth / Earthquake',
    archetype: 'The Synchronizer',
    element: 'earth',
    power: 'Navigation',
    action: 'Evolve',
    essence: 'Synchronicity',
    description: 'Earth force and synchronicity. Evolution, galactic alignment, Gaia consciousness, navigating by signs.',
  },
  etznab: {
    number: 18,
    name: 'Etznab',
    glyph: '🔪',
    meaning: 'Mirror / Flint',
    archetype: 'The Mirror',
    element: 'air',
    power: 'Endlessness',
    action: 'Reflect',
    essence: 'Order',
    description: 'Obsidian mirror reflecting truth. Hall of mirrors, cutting through illusion, revealing infinite reflections.',
  },
  cauac: {
    number: 19,
    name: 'Cauac',
    glyph: '⛈️',
    meaning: 'Storm / Thunder',
    archetype: 'The Catalyst',
    element: 'water',
    power: 'Self-Generation',
    action: 'Catalyze',
    essence: 'Energy',
    description: 'Thunder being catalyzing transformation. Lightning illumination, storm clearing, self-generating energy.',
  },
  ahau: {
    number: 20,
    name: 'Ahau',
    glyph: '☀️',
    meaning: 'Sun / Lord / Flower',
    archetype: 'The Enlightened One',
    element: 'fire',
    power: 'Universal Fire',
    action: 'Enlighten',
    essence: 'Ascension',
    description: 'Solar lord and enlightenment. Ascended consciousness, Christ/Buddha nature, flowering of full potential.',
  },
};

/**
 * 13 Galactic Tones - Pulses of Creation
 */
export const GALACTIC_TONES: Record<GalacticTone, GalacticToneInfo> = {
  1: {
    number: 1,
    name: 'Magnetic',
    meaning: 'Purpose',
    intention: 'What is my purpose?',
    description: 'Unifying, attracting, calling forth. The initiating pulse of creation. Magnetic tone pulls intention into form.',
    stage: 'initiation',
  },
  2: {
    number: 2,
    name: 'Lunar',
    meaning: 'Challenge',
    intention: 'What is my challenge?',
    description: 'Polarizing, stabilizing, recognizing duality. The challenge that strengthens through opposition.',
    stage: 'challenge',
  },
  3: {
    number: 3,
    name: 'Electric',
    meaning: 'Service',
    intention: 'How can I best serve?',
    description: 'Activating, bonding, bringing trinity. Electric current animating purpose into action through service.',
    stage: 'challenge',
  },
  4: {
    number: 4,
    name: 'Self-Existing',
    meaning: 'Form',
    intention: 'What is the form?',
    description: 'Defining, measuring, manifesting structure. Four directions create stable container for growth.',
    stage: 'challenge',
  },
  5: {
    number: 5,
    name: 'Overtone',
    meaning: 'Radiance',
    intention: 'How do I shine?',
    description: 'Empowering, commanding, radiating center. Fifth force of radiance empowering all with presence.',
    stage: 'empowerment',
  },
  6: {
    number: 6,
    name: 'Rhythmic',
    meaning: 'Equality',
    intention: 'How do I balance?',
    description: 'Organizing, balancing, creating rhythm. Equality through balanced flow and reciprocal relationship.',
    stage: 'empowerment',
  },
  7: {
    number: 7,
    name: 'Resonant',
    meaning: 'Attunement',
    intention: 'How do I attune?',
    description: 'Channeling, inspiring, finding resonance. Mystical tone attuning to cosmic frequencies.',
    stage: 'empowerment',
  },
  8: {
    number: 8,
    name: 'Galactic',
    meaning: 'Integrity',
    intention: 'Do I live what I believe?',
    description: 'Modeling, harmonizing, integrating. Galactic integrity aligning personal truth with universal pattern.',
    stage: 'empowerment',
  },
  9: {
    number: 9,
    name: 'Solar',
    meaning: 'Intention',
    intention: 'How do I pulse?',
    description: 'Realizing, pulsing, completing intention. Solar pulse bringing intention into full realization.',
    stage: 'completion',
  },
  10: {
    number: 10,
    name: 'Planetary',
    meaning: 'Manifestation',
    intention: 'How do I manifest?',
    description: 'Perfecting, producing, manifesting. Planetary tone bringing vision into perfect earthly form.',
    stage: 'completion',
  },
  11: {
    number: 11,
    name: 'Spectral',
    meaning: 'Liberation',
    intention: 'How do I release?',
    description: 'Dissolving, releasing, liberating. Spectral frequency releases all that binds, preparing for rebirth.',
    stage: 'completion',
  },
  12: {
    number: 12,
    name: 'Crystal',
    meaning: 'Cooperation',
    intention: 'How do I dedicate?',
    description: 'Universalizing, dedicating, cooperating. Crystal clarity dedicates all to collective harmony.',
    stage: 'completion',
  },
  13: {
    number: 13,
    name: 'Cosmic',
    meaning: 'Presence',
    intention: 'How do I expand?',
    description: 'Enduring, transcending, embodying cosmic presence. Thirteenth tone completes cycle and opens to new creation.',
    stage: 'completion',
  },
};

/**
 * Calculate Mayan birth sign from Gregorian date
 * Uses correlation: July 26, 1987 = 1 Imix (Dreamspell/Jose Arguelles correlation)
 */
export function calculateMayanBirthSign(birthDate: Date): MayanBirthSign {
  // Dreamspell epoch: July 26, 1987 = 0 Imix 0
  const dreamspellEpoch = new Date('1987-07-26');
  const daysSinceEpoch = Math.floor(
    (birthDate.getTime() - dreamspellEpoch.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate position in 260-day cycle
  const tzolkinNumber = ((daysSinceEpoch % 260) + 260) % 260; // Handle negative numbers
  const tzolkinDay = tzolkinNumber === 0 ? 260 : tzolkinNumber;

  // Calculate tone (1-13)
  const toneNumber = ((tzolkinNumber % 13) + 1) as GalacticTone;
  if (toneNumber === 0) toneNumber as GalacticTone;

  // Calculate day sign (0-19 maps to signs)
  const daySignIndex = tzolkinNumber % 20;
  const daySignKeys = Object.keys(MAYAN_DAY_SIGNS) as MayanDaySign[];
  const daySignKey = daySignKeys[daySignIndex];

  const daySign = MAYAN_DAY_SIGNS[daySignKey];
  const tone = GALACTIC_TONES[toneNumber];

  // Calculate wavespell (groups of 13 days)
  const wavespellNumber = Math.floor(tzolkinNumber / 13) + 1;
  const wavespellSign = daySignKeys[((wavespellNumber - 1) % 20)];

  return {
    daySign,
    tone,
    tzolkinNumber: tzolkinDay,
    wavespell: `${MAYAN_DAY_SIGNS[wavespellSign].name} Wavespell`,
    galacticSignature: `${tone.name} ${daySign.name}`,
  };
}

/**
 * Get today's Mayan day sign
 */
export function getTodaysMayanSign(): MayanBirthSign {
  return calculateMayanBirthSign(new Date());
}

/**
 * Map Mayan element to Spiralogic element
 */
export function mapMayanToSpiralogic(mayanElement: 'fire' | 'water' | 'earth' | 'air') {
  return mayanElement; // Already compatible!
}

/**
 * Get archetypal synthesis between Mayan sign and Western sign
 */
export function synthesizeMayanWestern(
  mayanSign: MayanSignInfo,
  westernSign: string
): string {
  return `Your ${mayanSign.name} (${mayanSign.archetype}) Mayan signature flows through your ${westernSign} Western identity, creating a unique archetypal blend where ${mayanSign.essence} meets solar consciousness.`;
}
