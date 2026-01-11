// @ts-nocheck
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

export type CardinalDirection = 'east' | 'north' | 'west' | 'south';

export interface CardinalDirectionInfo {
  direction: CardinalDirection;
  meaning: string;
  activity: string;
  color: string;
  description: string;
}

export const CARDINAL_DIRECTIONS: Record<CardinalDirection, CardinalDirectionInfo> = {
  east: {
    direction: 'east',
    meaning: 'Originate',
    activity: 'Create',
    color: 'red',
    description: 'The direction of new beginnings, initiative, and creative force. Where the sun rises, so do new ideas and ventures.',
  },
  north: {
    direction: 'north',
    meaning: 'Decrease',
    activity: 'Reduce/Minimize',
    color: 'white',
    description: 'The direction of the mind, intellect, and refinement. A time to cut away what no longer serves.',
  },
  west: {
    direction: 'west',
    meaning: 'Cooperate',
    activity: 'Adjust',
    color: 'black',
    description: 'The direction of relationships, encounters, and transformation. Where the sun sets, we learn to work with others.',
  },
  south: {
    direction: 'south',
    meaning: 'Increase',
    activity: 'Gain',
    color: 'yellow',
    description: 'The direction of emotions, feelings, and growth. A time of expansion and abundance.',
  },
};

// Map each day sign to its cardinal direction
export const DAY_SIGN_DIRECTIONS: Record<MayanDaySign, CardinalDirection> = {
  imix: 'east',
  ik: 'north',
  akbal: 'west',
  kan: 'south',
  chicchan: 'east',
  cimi: 'north',
  manik: 'west',
  lamat: 'south',
  muluc: 'east',
  oc: 'north',
  chuen: 'west',
  eb: 'south',
  ben: 'east',
  ix: 'north',
  men: 'west',
  cib: 'south',
  caban: 'east',
  etznab: 'north',
  cauac: 'west',
  ahau: 'south',
};

/**
 * Haab Calendar - 365-day Solar Year
 * 18 months of 20 days + 5 Wayeb (unlucky) days
 */
export interface HaabMonth {
  number: number;
  name: string;
  meaning: string;
  glyph: string;
}

export const HAAB_MONTHS: HaabMonth[] = [
  { number: 1, name: 'Pop', meaning: 'Mat / Jaguar', glyph: '🐆' },
  { number: 2, name: 'Wo', meaning: 'Black Conjunction', glyph: '🌑' },
  { number: 3, name: 'Sip', meaning: 'Red Conjunction', glyph: '🔴' },
  { number: 4, name: 'Sotz', meaning: 'Bat', glyph: '🦇' },
  { number: 5, name: 'Sek', meaning: 'Death', glyph: '💀' },
  { number: 6, name: 'Xul', meaning: 'Dog', glyph: '🐕' },
  { number: 7, name: 'Yaxkin', meaning: 'New Sun', glyph: '🌅' },
  { number: 8, name: 'Mol', meaning: 'Water / Jade', glyph: '💧' },
  { number: 9, name: 'Chen', meaning: 'Black Storm', glyph: '⛈️' },
  { number: 10, name: 'Yax', meaning: 'Green Storm', glyph: '🌿' },
  { number: 11, name: 'Sak', meaning: 'White Storm', glyph: '🌨️' },
  { number: 12, name: 'Keh', meaning: 'Red Storm', glyph: '🌋' },
  { number: 13, name: 'Mak', meaning: 'Enclosed', glyph: '🏛️' },
  { number: 14, name: 'Kankin', meaning: 'Yellow Sun', glyph: '☀️' },
  { number: 15, name: 'Muwan', meaning: 'Owl', glyph: '🦉' },
  { number: 16, name: 'Pax', meaning: 'Planting Time', glyph: '🌱' },
  { number: 17, name: 'Kayab', meaning: 'Turtle', glyph: '🐢' },
  { number: 18, name: 'Kumku', meaning: 'Grain', glyph: '🌾' },
];

export interface HaabDate {
  day: number; // 0-19 (Seating to 19)
  month: HaabMonth;
  isWayeb: boolean;
  wayebDay?: number; // 1-5 if in Wayeb period
  fullDate: string;
}

export interface PathOfLife {
  youth: MayanBirthSign; // Past influences, dominant until ~26
  adulthood: MayanBirthSign; // Main life sign
  future: MayanBirthSign; // Destiny, fades in around ~52
}

export interface CompleteMayanProfile {
  tzolkin: MayanBirthSign;
  haab: HaabDate;
  pathOfLife: PathOfLife;
  cardinalDirection: CardinalDirectionInfo;
  lifeCycleInsight: string;
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

/**
 * Calculate Haab date from Gregorian date
 * The Haab is a 365-day solar calendar with 18 months of 20 days + 5 Wayeb days
 * Correlation: July 26, 1987 = 0 Pop (New Year in Dreamspell)
 */
export function calculateHaabDate(date: Date): HaabDate {
  // Haab epoch aligned with Dreamspell: July 26, 1987 = 0 Pop
  const haabEpoch = new Date('1987-07-26');
  const daysSinceEpoch = Math.floor(
    (date.getTime() - haabEpoch.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Position in 365-day Haab cycle
  const haabPosition = ((daysSinceEpoch % 365) + 365) % 365;

  // First 360 days are 18 months of 20 days each
  if (haabPosition < 360) {
    const monthIndex = Math.floor(haabPosition / 20);
    const dayInMonth = haabPosition % 20;
    const month = HAAB_MONTHS[monthIndex];

    return {
      day: dayInMonth,
      month,
      isWayeb: false,
      fullDate: `${dayInMonth} ${month.name}`,
    };
  } else {
    // Last 5 days are Wayeb (unlucky days)
    const wayebDay = haabPosition - 359; // 1-5
    return {
      day: wayebDay,
      month: { number: 19, name: 'Wayeb', meaning: 'Nameless Days', glyph: '⚠️' },
      isWayeb: true,
      wayebDay,
      fullDate: `Wayeb ${wayebDay}`,
    };
  }
}

/**
 * Calculate Path of Life - the three nahuales that guide a person's journey
 * Based on traditional Ki'che' Maya astrology from Momostenango
 *
 * Youth sign: 9 positions counterclockwise on the calendar wheel
 * Future sign: 9 positions clockwise on the calendar wheel
 */
export function calculatePathOfLife(birthDate: Date): PathOfLife {
  const adulthood = calculateMayanBirthSign(birthDate);

  // The calendar wheel calculation:
  // Each position on the wheel represents a day in the 260-day cycle
  // Youth is 9 x 20 = 180 days before birth
  // Future is 9 x 20 = 180 days after birth

  const youthDate = new Date(birthDate);
  youthDate.setDate(youthDate.getDate() - 180);

  const futureDate = new Date(birthDate);
  futureDate.setDate(futureDate.getDate() + 180);

  return {
    youth: calculateMayanBirthSign(youthDate),
    adulthood,
    future: calculateMayanBirthSign(futureDate),
  };
}

/**
 * Get cardinal direction info for a day sign
 */
export function getCardinalDirection(daySignKey: MayanDaySign): CardinalDirectionInfo {
  const direction = DAY_SIGN_DIRECTIONS[daySignKey];
  return CARDINAL_DIRECTIONS[direction];
}

/**
 * Get the day sign key from sign info
 */
export function getDaySignKey(signInfo: MayanSignInfo): MayanDaySign {
  const daySignKeys = Object.keys(MAYAN_DAY_SIGNS) as MayanDaySign[];
  return daySignKeys.find(key => MAYAN_DAY_SIGNS[key].number === signInfo.number) || 'imix';
}

/**
 * Generate life cycle insight based on age and Path of Life
 */
export function generateLifeCycleInsight(birthDate: Date, pathOfLife: PathOfLife): string {
  const today = new Date();
  const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  const { youth, adulthood, future } = pathOfLife;

  if (age < 26) {
    const youthInfluence = Math.max(0, 26 - age);
    return `At ${age}, you're still in your Youth cycle, strongly influenced by ${youth.daySign.name} (${youth.daySign.archetype}). ` +
      `The ${youth.daySign.essence} essence shapes your early path. ` +
      `Over the next ${youthInfluence} years, you'll gradually transition into your core ${adulthood.daySign.name} nature, ` +
      `moving from ${youth.daySign.power} toward ${adulthood.daySign.power}.`;
  } else if (age < 52) {
    const yearsToFuture = 52 - age;
    return `At ${age}, your ${adulthood.daySign.name} (${adulthood.daySign.archetype}) signature is fully active. ` +
      `The ${adulthood.daySign.power} power guides your actions while ${adulthood.daySign.essence} defines your essence. ` +
      `In ${yearsToFuture} years, the ${future.daySign.name} energy will begin weaving into your path, ` +
      `bringing themes of ${future.daySign.essence} and ${future.daySign.meaning}.`;
  } else {
    const futureYears = age - 52;
    return `At ${age}, you've entered your Future cycle where ${future.daySign.name} (${future.daySign.archetype}) ` +
      `increasingly shapes your destiny. For ${futureYears} years now, the ${future.daySign.power} power has been ` +
      `awakening within you. Your journey synthesizes ${adulthood.daySign.essence} with ${future.daySign.essence}, ` +
      `revealing the deeper purpose of ${future.daySign.meaning}.`;
  }
}

/**
 * Calculate complete Mayan profile with all three pillars
 */
export function calculateCompleteMayanProfile(birthDate: Date): CompleteMayanProfile {
  const tzolkin = calculateMayanBirthSign(birthDate);
  const haab = calculateHaabDate(birthDate);
  const pathOfLife = calculatePathOfLife(birthDate);
  const daySignKey = getDaySignKey(tzolkin.daySign);
  const cardinalDirection = getCardinalDirection(daySignKey);
  const lifeCycleInsight = generateLifeCycleInsight(birthDate, pathOfLife);

  return {
    tzolkin,
    haab,
    pathOfLife,
    cardinalDirection,
    lifeCycleInsight,
  };
}

/**
 * Get relationship compatibility between two day signs based on cardinal directions
 */
export function getDirectionalCompatibility(sign1: MayanSignInfo, sign2: MayanSignInfo): {
  compatibility: 'harmonious' | 'challenging' | 'dynamic' | 'complementary';
  description: string;
} {
  const key1 = getDaySignKey(sign1);
  const key2 = getDaySignKey(sign2);
  const dir1 = DAY_SIGN_DIRECTIONS[key1];
  const dir2 = DAY_SIGN_DIRECTIONS[key2];

  if (dir1 === dir2) {
    return {
      compatibility: 'harmonious',
      description: `Both ${sign1.name} and ${sign2.name} share the ${dir1} direction, creating natural harmony and understanding. You speak the same cosmic language.`,
    };
  }

  // Opposite directions (East-West, North-South) are complementary
  const opposites: Record<CardinalDirection, CardinalDirection> = {
    east: 'west',
    west: 'east',
    north: 'south',
    south: 'north',
  };

  if (opposites[dir1] === dir2) {
    return {
      compatibility: 'complementary',
      description: `${sign1.name} (${dir1}) and ${sign2.name} (${dir2}) form a cosmic polarity. Your opposite directions create balance and wholeness when united.`,
    };
  }

  // Adjacent directions are dynamic
  return {
    compatibility: 'dynamic',
    description: `${sign1.name} (${dir1}) and ${sign2.name} (${dir2}) bring different cosmic energies. This dynamic tension sparks growth and mutual learning.`,
  };
}
