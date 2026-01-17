/**
 * Vedic Astrology (Jyotish) Type Definitions
 *
 * Core types for sidereal zodiac calculations, nakshatras, and Vimshottari Dasha
 */

// =============================================================================
// AYANAMSA TYPES
// =============================================================================

export type AyanamsaType = 'lahiri' | 'true_chitra' | 'krishnamurti';

export interface AyanamsaConfig {
  type: AyanamsaType;
  label: string;
  description: string;
  /** Base offset at epoch (J2000: Jan 1, 2000 12:00 TT) in degrees */
  epochOffset: number;
  /** Annual precession rate in degrees */
  annualRate: number;
}

export const AYANAMSA_CONFIGS: Record<AyanamsaType, AyanamsaConfig> = {
  lahiri: {
    type: 'lahiri',
    label: 'Lahiri (Chitrapaksha)',
    description: 'Official Indian government standard, most widely used',
    epochOffset: 23.85,
    annualRate: 0.01397,
  },
  true_chitra: {
    type: 'true_chitra',
    label: 'True Chitra',
    description: 'Based on fixed star Spica at exactly 0° Libra',
    epochOffset: 23.97,
    annualRate: 0.01397,
  },
  krishnamurti: {
    type: 'krishnamurti',
    label: 'Krishnamurti (KP)',
    description: 'Used in Krishnamurti Paddhati predictive system',
    epochOffset: 23.75,
    annualRate: 0.01397,
  },
};

// =============================================================================
// RASHI (SIDEREAL SIGN) TYPES
// =============================================================================

export type RashiName =
  | 'Mesha' | 'Vrishabha' | 'Mithuna' | 'Karka'
  | 'Simha' | 'Kanya' | 'Tula' | 'Vrischika'
  | 'Dhanu' | 'Makara' | 'Kumbha' | 'Meena';

export type VedicElement = 'agni' | 'prithvi' | 'vayu' | 'jala';
export type VedicQuality = 'chara' | 'sthira' | 'dwiswabhava';

export interface RashiInfo {
  number: number;
  name: RashiName;
  sanskrit: string;
  westernEquivalent: string;
  element: VedicElement;
  quality: VedicQuality;
  ruler: GrahaName;
  symbol: string;
  description: string;
  spiralogicElement: 'fire' | 'earth' | 'air' | 'water';
}

export const RASHIS: RashiInfo[] = [
  {
    number: 1,
    name: 'Mesha',
    sanskrit: 'मेष',
    westernEquivalent: 'Aries',
    element: 'agni',
    quality: 'chara',
    ruler: 'Mangala',
    symbol: '♈',
    description: 'The Ram - Initiative, pioneering spirit, courage, leadership',
    spiralogicElement: 'fire',
  },
  {
    number: 2,
    name: 'Vrishabha',
    sanskrit: 'वृषभ',
    westernEquivalent: 'Taurus',
    element: 'prithvi',
    quality: 'sthira',
    ruler: 'Shukra',
    symbol: '♉',
    description: 'The Bull - Stability, material security, sensual pleasure',
    spiralogicElement: 'earth',
  },
  {
    number: 3,
    name: 'Mithuna',
    sanskrit: 'मिथुन',
    westernEquivalent: 'Gemini',
    element: 'vayu',
    quality: 'dwiswabhava',
    ruler: 'Budha',
    symbol: '♊',
    description: 'The Twins - Communication, curiosity, adaptability',
    spiralogicElement: 'air',
  },
  {
    number: 4,
    name: 'Karka',
    sanskrit: 'कर्क',
    westernEquivalent: 'Cancer',
    element: 'jala',
    quality: 'chara',
    ruler: 'Chandra',
    symbol: '♋',
    description: 'The Crab - Nurturing, emotional depth, home and family',
    spiralogicElement: 'water',
  },
  {
    number: 5,
    name: 'Simha',
    sanskrit: 'सिंह',
    westernEquivalent: 'Leo',
    element: 'agni',
    quality: 'sthira',
    ruler: 'Surya',
    symbol: '♌',
    description: 'The Lion - Self-expression, creativity, royal dignity',
    spiralogicElement: 'fire',
  },
  {
    number: 6,
    name: 'Kanya',
    sanskrit: 'कन्या',
    westernEquivalent: 'Virgo',
    element: 'prithvi',
    quality: 'dwiswabhava',
    ruler: 'Budha',
    symbol: '♍',
    description: 'The Virgin - Analysis, service, discrimination, healing',
    spiralogicElement: 'earth',
  },
  {
    number: 7,
    name: 'Tula',
    sanskrit: 'तुला',
    westernEquivalent: 'Libra',
    element: 'vayu',
    quality: 'chara',
    ruler: 'Shukra',
    symbol: '♎',
    description: 'The Scales - Balance, partnership, justice, harmony',
    spiralogicElement: 'air',
  },
  {
    number: 8,
    name: 'Vrischika',
    sanskrit: 'वृश्चिक',
    westernEquivalent: 'Scorpio',
    element: 'jala',
    quality: 'sthira',
    ruler: 'Mangala',
    symbol: '♏',
    description: 'The Scorpion - Transformation, depth, intensity, mystery',
    spiralogicElement: 'water',
  },
  {
    number: 9,
    name: 'Dhanu',
    sanskrit: 'धनु',
    westernEquivalent: 'Sagittarius',
    element: 'agni',
    quality: 'dwiswabhava',
    ruler: 'Guru',
    symbol: '♐',
    description: 'The Archer - Philosophy, higher learning, expansion',
    spiralogicElement: 'fire',
  },
  {
    number: 10,
    name: 'Makara',
    sanskrit: 'मकर',
    westernEquivalent: 'Capricorn',
    element: 'prithvi',
    quality: 'chara',
    ruler: 'Shani',
    symbol: '♑',
    description: 'The Crocodile - Ambition, discipline, structure, mastery',
    spiralogicElement: 'earth',
  },
  {
    number: 11,
    name: 'Kumbha',
    sanskrit: 'कुम्भ',
    westernEquivalent: 'Aquarius',
    element: 'vayu',
    quality: 'sthira',
    ruler: 'Shani',
    symbol: '♒',
    description: 'The Water Bearer - Innovation, humanitarianism, detachment',
    spiralogicElement: 'air',
  },
  {
    number: 12,
    name: 'Meena',
    sanskrit: 'मीन',
    westernEquivalent: 'Pisces',
    element: 'jala',
    quality: 'dwiswabhava',
    ruler: 'Guru',
    symbol: '♓',
    description: 'The Fish - Spirituality, intuition, dissolution, transcendence',
    spiralogicElement: 'water',
  },
];

// =============================================================================
// GRAHA (PLANET) TYPES
// =============================================================================

export type GrahaName =
  | 'Surya' | 'Chandra' | 'Mangala' | 'Budha'
  | 'Guru' | 'Shukra' | 'Shani' | 'Rahu' | 'Ketu';

export type DashaRuler = GrahaName;

export interface GrahaInfo {
  name: GrahaName;
  sanskrit: string;
  westernName: string;
  symbol: string;
  nature: 'benefic' | 'malefic' | 'neutral';
  element: VedicElement | 'akasha';
  exaltation: RashiName;
  exaltationDegree: number;
  debilitation: RashiName;
  debilitationDegree: number;
  ownSigns: RashiName[];
  moolatrikona: RashiName;
  moolatrikonaRange: [number, number];
  drishti: number[];
  karakatva: string[];
  vimshottariYears: number;
}

export const GRAHAS: Record<GrahaName, GrahaInfo> = {
  Surya: {
    name: 'Surya',
    sanskrit: 'सूर्य',
    westernName: 'Sun',
    symbol: '☉',
    nature: 'malefic',
    element: 'agni',
    exaltation: 'Mesha',
    exaltationDegree: 10,
    debilitation: 'Tula',
    debilitationDegree: 10,
    ownSigns: ['Simha'],
    moolatrikona: 'Simha',
    moolatrikonaRange: [0, 20],
    drishti: [],
    karakatva: ['Soul', 'Father', 'Authority', 'Vitality', 'Government', 'Self'],
    vimshottariYears: 6,
  },
  Chandra: {
    name: 'Chandra',
    sanskrit: 'चन्द्र',
    westernName: 'Moon',
    symbol: '☽',
    nature: 'benefic',
    element: 'jala',
    exaltation: 'Vrishabha',
    exaltationDegree: 3,
    debilitation: 'Vrischika',
    debilitationDegree: 3,
    ownSigns: ['Karka'],
    moolatrikona: 'Vrishabha',
    moolatrikonaRange: [4, 30],
    drishti: [],
    karakatva: ['Mind', 'Mother', 'Emotions', 'Nourishment', 'Public', 'Water'],
    vimshottariYears: 10,
  },
  Mangala: {
    name: 'Mangala',
    sanskrit: 'मंगल',
    westernName: 'Mars',
    symbol: '♂',
    nature: 'malefic',
    element: 'agni',
    exaltation: 'Makara',
    exaltationDegree: 28,
    debilitation: 'Karka',
    debilitationDegree: 28,
    ownSigns: ['Mesha', 'Vrischika'],
    moolatrikona: 'Mesha',
    moolatrikonaRange: [0, 12],
    drishti: [4, 8],
    karakatva: ['Energy', 'Siblings', 'Courage', 'Land', 'Surgery', 'Competition'],
    vimshottariYears: 7,
  },
  Budha: {
    name: 'Budha',
    sanskrit: 'बुध',
    westernName: 'Mercury',
    symbol: '☿',
    nature: 'neutral',
    element: 'prithvi',
    exaltation: 'Kanya',
    exaltationDegree: 15,
    debilitation: 'Meena',
    debilitationDegree: 15,
    ownSigns: ['Mithuna', 'Kanya'],
    moolatrikona: 'Kanya',
    moolatrikonaRange: [16, 20],
    drishti: [],
    karakatva: ['Intelligence', 'Speech', 'Commerce', 'Learning', 'Friends', 'Writing'],
    vimshottariYears: 17,
  },
  Guru: {
    name: 'Guru',
    sanskrit: 'गुरु',
    westernName: 'Jupiter',
    symbol: '♃',
    nature: 'benefic',
    element: 'akasha',
    exaltation: 'Karka',
    exaltationDegree: 5,
    debilitation: 'Makara',
    debilitationDegree: 5,
    ownSigns: ['Dhanu', 'Meena'],
    moolatrikona: 'Dhanu',
    moolatrikonaRange: [0, 10],
    drishti: [5, 9],
    karakatva: ['Wisdom', 'Teacher', 'Children', 'Dharma', 'Fortune', 'Husband'],
    vimshottariYears: 16,
  },
  Shukra: {
    name: 'Shukra',
    sanskrit: 'शुक्र',
    westernName: 'Venus',
    symbol: '♀',
    nature: 'benefic',
    element: 'jala',
    exaltation: 'Meena',
    exaltationDegree: 27,
    debilitation: 'Kanya',
    debilitationDegree: 27,
    ownSigns: ['Vrishabha', 'Tula'],
    moolatrikona: 'Tula',
    moolatrikonaRange: [0, 15],
    drishti: [],
    karakatva: ['Love', 'Wife', 'Beauty', 'Art', 'Vehicles', 'Pleasure'],
    vimshottariYears: 20,
  },
  Shani: {
    name: 'Shani',
    sanskrit: 'शनि',
    westernName: 'Saturn',
    symbol: '♄',
    nature: 'malefic',
    element: 'vayu',
    exaltation: 'Tula',
    exaltationDegree: 20,
    debilitation: 'Mesha',
    debilitationDegree: 20,
    ownSigns: ['Makara', 'Kumbha'],
    moolatrikona: 'Kumbha',
    moolatrikonaRange: [0, 20],
    drishti: [3, 10],
    karakatva: ['Karma', 'Longevity', 'Service', 'Discipline', 'Sorrow', 'Labor'],
    vimshottariYears: 19,
  },
  Rahu: {
    name: 'Rahu',
    sanskrit: 'राहु',
    westernName: 'North Node',
    symbol: '☊',
    nature: 'malefic',
    element: 'vayu',
    exaltation: 'Vrishabha',
    exaltationDegree: 20,
    debilitation: 'Vrischika',
    debilitationDegree: 20,
    ownSigns: ['Kumbha'],
    moolatrikona: 'Kanya',
    moolatrikonaRange: [0, 20],
    drishti: [5, 9],
    karakatva: ['Obsession', 'Foreign', 'Technology', 'Illusion', 'Ambition', 'Materialism'],
    vimshottariYears: 18,
  },
  Ketu: {
    name: 'Ketu',
    sanskrit: 'केतु',
    westernName: 'South Node',
    symbol: '☋',
    nature: 'malefic',
    element: 'agni',
    exaltation: 'Vrischika',
    exaltationDegree: 20,
    debilitation: 'Vrishabha',
    debilitationDegree: 20,
    ownSigns: ['Vrischika'],
    moolatrikona: 'Dhanu',
    moolatrikonaRange: [0, 20],
    drishti: [5, 9],
    karakatva: ['Liberation', 'Spirituality', 'Past Lives', 'Detachment', 'Moksha', 'Psychic'],
    vimshottariYears: 7,
  },
};

// =============================================================================
// NAKSHATRA TYPES
// =============================================================================

export type NakshatraName =
  | 'Ashwini' | 'Bharani' | 'Krittika' | 'Rohini' | 'Mrigashira'
  | 'Ardra' | 'Punarvasu' | 'Pushya' | 'Ashlesha' | 'Magha'
  | 'Purva Phalguni' | 'Uttara Phalguni' | 'Hasta' | 'Chitra' | 'Swati'
  | 'Vishakha' | 'Anuradha' | 'Jyeshtha' | 'Mula' | 'Purva Ashadha'
  | 'Uttara Ashadha' | 'Shravana' | 'Dhanishta' | 'Shatabhisha'
  | 'Purva Bhadrapada' | 'Uttara Bhadrapada' | 'Revati';

export type NakshatraGuna = 'sattva' | 'rajas' | 'tamas';
export type NakshatraGana = 'deva' | 'manushya' | 'rakshasa';

export interface NakshatraInfo {
  number: number;
  name: NakshatraName;
  sanskrit: string;
  meaning: string;
  deity: string;
  symbol: string;
  ruler: DashaRuler;
  startDegree: number;
  endDegree: number;
  rashis: RashiName[];
  guna: NakshatraGuna;
  gana: NakshatraGana;
  animal: string;
  description: string;
  themes: string[];
  spiralogicConnection: string;
}

export const NAKSHATRAS: NakshatraInfo[] = [
  {
    number: 1,
    name: 'Ashwini',
    sanskrit: 'अश्विनी',
    meaning: 'The Horse Woman',
    deity: 'Ashwini Kumaras (Divine Physicians)',
    symbol: 'Horse Head',
    ruler: 'Ketu',
    startDegree: 0,
    endDegree: 13.333333,
    rashis: ['Mesha'],
    guna: 'rajas',
    gana: 'deva',
    animal: 'Horse',
    description: 'Swift healing, beginnings, speed, vitality, and miraculous cures',
    themes: ['Healing', 'Speed', 'New Beginnings', 'Vitality'],
    spiralogicConnection: 'Fire Pathway - Vector stage of initiation and rapid transformation',
  },
  {
    number: 2,
    name: 'Bharani',
    sanskrit: 'भरणी',
    meaning: 'The Bearer',
    deity: 'Yama (God of Death)',
    symbol: 'Yoni (Female Reproductive Organ)',
    ruler: 'Shukra',
    startDegree: 13.333333,
    endDegree: 26.666666,
    rashis: ['Mesha'],
    guna: 'rajas',
    gana: 'manushya',
    animal: 'Elephant',
    description: 'Birth and death cycles, restraint, transformation through discipline',
    themes: ['Transformation', 'Restraint', 'Birth/Death', 'Creativity'],
    spiralogicConnection: 'Fire Pathway - Circle stage of creative gestation',
  },
  {
    number: 3,
    name: 'Krittika',
    sanskrit: 'कृत्तिका',
    meaning: 'The Cutter',
    deity: 'Agni (Fire God)',
    symbol: 'Razor/Flame',
    ruler: 'Surya',
    startDegree: 26.666666,
    endDegree: 40,
    rashis: ['Mesha', 'Vrishabha'],
    guna: 'rajas',
    gana: 'rakshasa',
    animal: 'Sheep',
    description: 'Purification through fire, cutting away impurity, nourishment',
    themes: ['Purification', 'Cutting', 'Nourishment', 'Fire'],
    spiralogicConnection: 'Fire Pathway - Spiral stage of purifying transformation',
  },
  {
    number: 4,
    name: 'Rohini',
    sanskrit: 'रोहिणी',
    meaning: 'The Growing One',
    deity: 'Brahma (Creator)',
    symbol: 'Chariot/Ox Cart',
    ruler: 'Chandra',
    startDegree: 40,
    endDegree: 53.333333,
    rashis: ['Vrishabha'],
    guna: 'rajas',
    gana: 'manushya',
    animal: 'Serpent',
    description: 'Fertility, growth, beauty, artistic expression, material abundance',
    themes: ['Growth', 'Beauty', 'Fertility', 'Abundance'],
    spiralogicConnection: 'Earth Pathway - Vector stage of material manifestation',
  },
  {
    number: 5,
    name: 'Mrigashira',
    sanskrit: 'मृगशिरा',
    meaning: 'Deer Head',
    deity: 'Soma (Moon God)',
    symbol: 'Deer Head',
    ruler: 'Mangala',
    startDegree: 53.333333,
    endDegree: 66.666666,
    rashis: ['Vrishabha', 'Mithuna'],
    guna: 'rajas',
    gana: 'deva',
    animal: 'Serpent',
    description: 'Seeking, curiosity, gentle pursuit, research and exploration',
    themes: ['Seeking', 'Curiosity', 'Exploration', 'Gentleness'],
    spiralogicConnection: 'Air Pathway - Vector stage of intellectual quest',
  },
  {
    number: 6,
    name: 'Ardra',
    sanskrit: 'आर्द्रा',
    meaning: 'The Moist One',
    deity: 'Rudra (Storm God)',
    symbol: 'Teardrop/Diamond',
    ruler: 'Rahu',
    startDegree: 66.666666,
    endDegree: 80,
    rashis: ['Mithuna'],
    guna: 'tamas',
    gana: 'manushya',
    animal: 'Dog',
    description: 'Storms of transformation, emotional turbulence, renewal through destruction',
    themes: ['Transformation', 'Storms', 'Renewal', 'Intensity'],
    spiralogicConnection: 'Air Pathway - Spiral stage of mental dissolution and rebirth',
  },
  {
    number: 7,
    name: 'Punarvasu',
    sanskrit: 'पुनर्वसु',
    meaning: 'Return of the Light',
    deity: 'Aditi (Mother of Gods)',
    symbol: 'Bow and Quiver',
    ruler: 'Guru',
    startDegree: 80,
    endDegree: 93.333333,
    rashis: ['Mithuna', 'Karka'],
    guna: 'sattva',
    gana: 'deva',
    animal: 'Cat',
    description: 'Restoration, return to prosperity, wisdom, and spiritual expansion',
    themes: ['Restoration', 'Return', 'Wisdom', 'Expansion'],
    spiralogicConnection: 'Water Pathway - Vector stage of emotional restoration',
  },
  {
    number: 8,
    name: 'Pushya',
    sanskrit: 'पुष्य',
    meaning: 'Nourisher',
    deity: 'Brihaspati (Priest of Gods)',
    symbol: 'Lotus/Cow Udder',
    ruler: 'Shani',
    startDegree: 93.333333,
    endDegree: 106.666666,
    rashis: ['Karka'],
    guna: 'tamas',
    gana: 'deva',
    animal: 'Ram',
    description: 'Most auspicious nakshatra for spiritual growth, nourishment, dharma',
    themes: ['Nourishment', 'Spirituality', 'Auspiciousness', 'Dharma'],
    spiralogicConnection: 'Water Pathway - Circle stage of spiritual nourishment',
  },
  {
    number: 9,
    name: 'Ashlesha',
    sanskrit: 'आश्लेषा',
    meaning: 'The Embracer',
    deity: 'Nagas (Serpent Deities)',
    symbol: 'Coiled Serpent',
    ruler: 'Budha',
    startDegree: 106.666666,
    endDegree: 120,
    rashis: ['Karka'],
    guna: 'sattva',
    gana: 'rakshasa',
    animal: 'Cat',
    description: 'Kundalini energy, hypnotic power, mysticism, hidden knowledge',
    themes: ['Kundalini', 'Mystery', 'Power', 'Hidden Knowledge'],
    spiralogicConnection: 'Water Pathway - Spiral stage of serpent wisdom awakening',
  },
  {
    number: 10,
    name: 'Magha',
    sanskrit: 'मघा',
    meaning: 'The Mighty',
    deity: 'Pitris (Ancestors)',
    symbol: 'Throne/Palanquin',
    ruler: 'Ketu',
    startDegree: 120,
    endDegree: 133.333333,
    rashis: ['Simha'],
    guna: 'tamas',
    gana: 'rakshasa',
    animal: 'Rat',
    description: 'Royal power, ancestral connection, authority, and legacy',
    themes: ['Royalty', 'Ancestors', 'Authority', 'Legacy'],
    spiralogicConnection: 'Fire Pathway - Vector stage of ancestral power activation',
  },
  {
    number: 11,
    name: 'Purva Phalguni',
    sanskrit: 'पूर्व फाल्गुनी',
    meaning: 'Former Reddish One',
    deity: 'Bhaga (God of Fortune)',
    symbol: 'Front Legs of Bed/Hammock',
    ruler: 'Shukra',
    startDegree: 133.333333,
    endDegree: 146.666666,
    rashis: ['Simha'],
    guna: 'rajas',
    gana: 'manushya',
    animal: 'Rat',
    description: 'Pleasure, love, creativity, relaxation, and enjoyment',
    themes: ['Pleasure', 'Love', 'Creativity', 'Relaxation'],
    spiralogicConnection: 'Fire Pathway - Circle stage of creative pleasure',
  },
  {
    number: 12,
    name: 'Uttara Phalguni',
    sanskrit: 'उत्तर फाल्गुनी',
    meaning: 'Latter Reddish One',
    deity: 'Aryaman (God of Contracts)',
    symbol: 'Back Legs of Bed',
    ruler: 'Surya',
    startDegree: 146.666666,
    endDegree: 160,
    rashis: ['Simha', 'Kanya'],
    guna: 'rajas',
    gana: 'manushya',
    animal: 'Bull',
    description: 'Partnerships, contracts, friendship, and social connections',
    themes: ['Partnership', 'Contracts', 'Friendship', 'Service'],
    spiralogicConnection: 'Earth Pathway - Vector stage of committed service',
  },
  {
    number: 13,
    name: 'Hasta',
    sanskrit: 'हस्त',
    meaning: 'The Hand',
    deity: 'Savitar (Solar Deity)',
    symbol: 'Hand/Palm',
    ruler: 'Chandra',
    startDegree: 160,
    endDegree: 173.333333,
    rashis: ['Kanya'],
    guna: 'rajas',
    gana: 'deva',
    animal: 'Buffalo',
    description: 'Skillful hands, craftsmanship, healing, and manual dexterity',
    themes: ['Skill', 'Craftsmanship', 'Healing', 'Dexterity'],
    spiralogicConnection: 'Earth Pathway - Circle stage of skillful manifestation',
  },
  {
    number: 14,
    name: 'Chitra',
    sanskrit: 'चित्रा',
    meaning: 'The Bright One',
    deity: 'Vishwakarma (Divine Architect)',
    symbol: 'Pearl/Bright Jewel',
    ruler: 'Mangala',
    startDegree: 173.333333,
    endDegree: 186.666666,
    rashis: ['Kanya', 'Tula'],
    guna: 'tamas',
    gana: 'rakshasa',
    animal: 'Tiger',
    description: 'Brilliance, beauty, architecture, and artistic creation',
    themes: ['Brilliance', 'Beauty', 'Architecture', 'Artistry'],
    spiralogicConnection: 'Air Pathway - Vector stage of brilliant creation',
  },
  {
    number: 15,
    name: 'Swati',
    sanskrit: 'स्वाति',
    meaning: 'The Sword',
    deity: 'Vayu (Wind God)',
    symbol: 'Coral/Sword',
    ruler: 'Rahu',
    startDegree: 186.666666,
    endDegree: 200,
    rashis: ['Tula'],
    guna: 'tamas',
    gana: 'deva',
    animal: 'Buffalo',
    description: 'Independence, movement, flexibility, and scattering',
    themes: ['Independence', 'Flexibility', 'Movement', 'Commerce'],
    spiralogicConnection: 'Air Pathway - Circle stage of independent movement',
  },
  {
    number: 16,
    name: 'Vishakha',
    sanskrit: 'विशाखा',
    meaning: 'The Forked Branch',
    deity: 'Indra-Agni (King of Gods and Fire)',
    symbol: 'Archway/Triumphal Arch',
    ruler: 'Guru',
    startDegree: 200,
    endDegree: 213.333333,
    rashis: ['Tula', 'Vrischika'],
    guna: 'sattva',
    gana: 'rakshasa',
    animal: 'Tiger',
    description: 'Ambition, determination, achievement, and triumph',
    themes: ['Ambition', 'Determination', 'Achievement', 'Purpose'],
    spiralogicConnection: 'Water Pathway - Vector stage of purposeful achievement',
  },
  {
    number: 17,
    name: 'Anuradha',
    sanskrit: 'अनुराधा',
    meaning: 'Following Radha',
    deity: 'Mitra (God of Friendship)',
    symbol: 'Lotus/Staff',
    ruler: 'Shani',
    startDegree: 213.333333,
    endDegree: 226.666666,
    rashis: ['Vrischika'],
    guna: 'sattva',
    gana: 'deva',
    animal: 'Hare',
    description: 'Devotion, friendship, success in foreign lands, organization',
    themes: ['Devotion', 'Friendship', 'Organization', 'Success'],
    spiralogicConnection: 'Water Pathway - Circle stage of devoted friendship',
  },
  {
    number: 18,
    name: 'Jyeshtha',
    sanskrit: 'ज्येष्ठा',
    meaning: 'The Eldest',
    deity: 'Indra (King of Gods)',
    symbol: 'Earring/Umbrella',
    ruler: 'Budha',
    startDegree: 226.666666,
    endDegree: 240,
    rashis: ['Vrischika'],
    guna: 'sattva',
    gana: 'rakshasa',
    animal: 'Hare',
    description: 'Seniority, protection, authority, and responsibility',
    themes: ['Authority', 'Protection', 'Seniority', 'Responsibility'],
    spiralogicConnection: 'Water Pathway - Spiral stage of protective authority',
  },
  {
    number: 19,
    name: 'Mula',
    sanskrit: 'मूल',
    meaning: 'The Root',
    deity: 'Nirriti (Goddess of Destruction)',
    symbol: 'Bunch of Roots/Elephant Goad',
    ruler: 'Ketu',
    startDegree: 240,
    endDegree: 253.333333,
    rashis: ['Dhanu'],
    guna: 'tamas',
    gana: 'rakshasa',
    animal: 'Dog',
    description: 'Root causes, investigation, destruction for renewal, research',
    themes: ['Roots', 'Destruction', 'Research', 'Renewal'],
    spiralogicConnection: 'Fire Pathway - Spiral stage of root dissolution',
  },
  {
    number: 20,
    name: 'Purva Ashadha',
    sanskrit: 'पूर्वाषाढ़ा',
    meaning: 'Former Invincible One',
    deity: 'Apas (Water Deity)',
    symbol: 'Elephant Tusk/Fan',
    ruler: 'Shukra',
    startDegree: 253.333333,
    endDegree: 266.666666,
    rashis: ['Dhanu'],
    guna: 'rajas',
    gana: 'manushya',
    animal: 'Monkey',
    description: 'Invincibility, purification, rejuvenation, declaration',
    themes: ['Invincibility', 'Purification', 'Declaration', 'Victory'],
    spiralogicConnection: 'Fire Pathway - Circle stage of invincible declaration',
  },
  {
    number: 21,
    name: 'Uttara Ashadha',
    sanskrit: 'उत्तराषाढ़ा',
    meaning: 'Latter Invincible One',
    deity: 'Vishwadevas (Universal Gods)',
    symbol: 'Elephant Tusk/Small Bed',
    ruler: 'Surya',
    startDegree: 266.666666,
    endDegree: 280,
    rashis: ['Dhanu', 'Makara'],
    guna: 'sattva',
    gana: 'manushya',
    animal: 'Mongoose',
    description: 'Final victory, leadership, introspection, and authority',
    themes: ['Victory', 'Leadership', 'Introspection', 'Authority'],
    spiralogicConnection: 'Earth Pathway - Vector stage of ultimate victory',
  },
  {
    number: 22,
    name: 'Shravana',
    sanskrit: 'श्रवण',
    meaning: 'Hearing',
    deity: 'Vishnu (The Preserver)',
    symbol: 'Ear/Three Footprints',
    ruler: 'Chandra',
    startDegree: 280,
    endDegree: 293.333333,
    rashis: ['Makara'],
    guna: 'rajas',
    gana: 'deva',
    animal: 'Monkey',
    description: 'Listening, learning, connection, and oral tradition',
    themes: ['Listening', 'Learning', 'Connection', 'Tradition'],
    spiralogicConnection: 'Earth Pathway - Circle stage of receptive learning',
  },
  {
    number: 23,
    name: 'Dhanishta',
    sanskrit: 'धनिष्ठा',
    meaning: 'Wealthiest',
    deity: 'Vasus (Eight Gods of Light)',
    symbol: 'Drum/Flute',
    ruler: 'Mangala',
    startDegree: 293.333333,
    endDegree: 306.666666,
    rashis: ['Makara', 'Kumbha'],
    guna: 'tamas',
    gana: 'rakshasa',
    animal: 'Lion',
    description: 'Wealth, music, rhythm, fame, and prosperity',
    themes: ['Wealth', 'Music', 'Fame', 'Prosperity'],
    spiralogicConnection: 'Air Pathway - Vector stage of rhythmic abundance',
  },
  {
    number: 24,
    name: 'Shatabhisha',
    sanskrit: 'शतभिषा',
    meaning: 'Hundred Physicians',
    deity: 'Varuna (God of Waters)',
    symbol: 'Empty Circle/Hundred Stars',
    ruler: 'Rahu',
    startDegree: 306.666666,
    endDegree: 320,
    rashis: ['Kumbha'],
    guna: 'tamas',
    gana: 'rakshasa',
    animal: 'Horse',
    description: 'Healing, secrets, solitude, and mystical knowledge',
    themes: ['Healing', 'Secrets', 'Solitude', 'Mystery'],
    spiralogicConnection: 'Air Pathway - Spiral stage of mysterious healing',
  },
  {
    number: 25,
    name: 'Purva Bhadrapada',
    sanskrit: 'पूर्व भाद्रपद',
    meaning: 'Former Blessed Feet',
    deity: 'Aja Ekapad (One-Footed Goat)',
    symbol: 'Sword/Front of Funeral Cot',
    ruler: 'Guru',
    startDegree: 320,
    endDegree: 333.333333,
    rashis: ['Kumbha', 'Meena'],
    guna: 'sattva',
    gana: 'manushya',
    animal: 'Lion',
    description: 'Intensity, austerity, transformation, and spiritual fire',
    themes: ['Intensity', 'Austerity', 'Transformation', 'Fire'],
    spiralogicConnection: 'Water Pathway - Vector stage of intense purification',
  },
  {
    number: 26,
    name: 'Uttara Bhadrapada',
    sanskrit: 'उत्तर भाद्रपद',
    meaning: 'Latter Blessed Feet',
    deity: 'Ahir Budhnya (Dragon of the Deep)',
    symbol: 'Back Legs of Funeral Cot/Twins',
    ruler: 'Shani',
    startDegree: 333.333333,
    endDegree: 346.666666,
    rashis: ['Meena'],
    guna: 'tamas',
    gana: 'manushya',
    animal: 'Cow',
    description: 'Depth, wisdom, kundalini, and cosmic consciousness',
    themes: ['Depth', 'Wisdom', 'Kundalini', 'Cosmos'],
    spiralogicConnection: 'Water Pathway - Circle stage of cosmic depth',
  },
  {
    number: 27,
    name: 'Revati',
    sanskrit: 'रेवती',
    meaning: 'Wealthy',
    deity: 'Pushan (Nourisher of Flocks)',
    symbol: 'Fish/Drum',
    ruler: 'Budha',
    startDegree: 346.666666,
    endDegree: 360,
    rashis: ['Meena'],
    guna: 'sattva',
    gana: 'deva',
    animal: 'Elephant',
    description: 'Completion, safe passage, nourishment, and transcendence',
    themes: ['Completion', 'Nourishment', 'Protection', 'Transcendence'],
    spiralogicConnection: 'Water Pathway - Spiral stage of transcendent completion',
  },
];

// =============================================================================
// VIMSHOTTARI DASHA TYPES
// =============================================================================

export interface MahadashaInfo {
  ruler: DashaRuler;
  years: number;
  sequence: number;
  themes: string[];
  opportunities: string[];
  challenges: string[];
  healthFocus: string[];
  spiralogicConnection: string;
}

export const MAHADASHA_SEQUENCE: MahadashaInfo[] = [
  {
    ruler: 'Ketu',
    years: 7,
    sequence: 1,
    themes: ['Spiritual awakening', 'Letting go', 'Past life resolution', 'Detachment'],
    opportunities: ['Spiritual insight', 'Psychic development', 'Liberation from attachments', 'Inner wisdom'],
    challenges: ['Confusion', 'Loss', 'Disconnection', 'Health issues'],
    healthFocus: ['Nervous system', 'Spine', 'Mysterious ailments'],
    spiralogicConnection: 'Spiral stage - dissolution of ego patterns',
  },
  {
    ruler: 'Shukra',
    years: 20,
    sequence: 2,
    themes: ['Love', 'Beauty', 'Art', 'Pleasure', 'Relationships', 'Wealth'],
    opportunities: ['Marriage', 'Artistic success', 'Material comfort', 'Refinement'],
    challenges: ['Overindulgence', 'Vanity', 'Relationship conflicts', 'Laziness'],
    healthFocus: ['Reproductive system', 'Kidneys', 'Diabetes'],
    spiralogicConnection: 'Circle stage - relational harmony and beauty',
  },
  {
    ruler: 'Surya',
    years: 6,
    sequence: 3,
    themes: ['Authority', 'Self-expression', 'Father', 'Government', 'Leadership'],
    opportunities: ['Recognition', 'Career advancement', 'Self-confidence', 'Vitality'],
    challenges: ['Ego conflicts', 'Authority issues', 'Health concerns', 'Pride'],
    healthFocus: ['Heart', 'Eyes', 'Bones', 'Vitality'],
    spiralogicConnection: 'Vector stage - radiant self-expression',
  },
  {
    ruler: 'Chandra',
    years: 10,
    sequence: 4,
    themes: ['Mind', 'Mother', 'Emotions', 'Home', 'Nurturing', 'Public'],
    opportunities: ['Emotional fulfillment', 'Public recognition', 'Property', 'Family harmony'],
    challenges: ['Emotional instability', 'Mental anxiety', 'Domestic issues', 'Dependency'],
    healthFocus: ['Mind', 'Lungs', 'Blood', 'Fluids'],
    spiralogicConnection: 'Water Pathway - emotional intelligence awakening',
  },
  {
    ruler: 'Mangala',
    years: 7,
    sequence: 5,
    themes: ['Energy', 'Action', 'Courage', 'Competition', 'Property', 'Brothers'],
    opportunities: ['Achievement', 'Physical vitality', 'Land acquisition', 'Success in competition'],
    challenges: ['Accidents', 'Conflicts', 'Impulsiveness', 'Anger'],
    healthFocus: ['Blood', 'Muscles', 'Head', 'Injuries'],
    spiralogicConnection: 'Fire Pathway - dynamic action and will',
  },
  {
    ruler: 'Rahu',
    years: 18,
    sequence: 6,
    themes: ['Worldly desires', 'Foreign matters', 'Technology', 'Obsession', 'Unconventional'],
    opportunities: ['Material success', 'Foreign connections', 'Innovation', 'Worldly achievement'],
    challenges: ['Illusion', 'Addiction', 'Deception', 'Anxiety', 'Obsessive behavior'],
    healthFocus: ['Nervous disorders', 'Skin', 'Psychological issues'],
    spiralogicConnection: 'Spiral stage - shadow integration',
  },
  {
    ruler: 'Guru',
    years: 16,
    sequence: 7,
    themes: ['Wisdom', 'Expansion', 'Children', 'Teaching', 'Dharma', 'Fortune'],
    opportunities: ['Spiritual growth', 'Higher education', 'Children', 'Luck', 'Wealth'],
    challenges: ['Over-optimism', 'Weight gain', 'Excess', 'Dogmatism'],
    healthFocus: ['Liver', 'Fat', 'Ears', 'Diabetes'],
    spiralogicConnection: 'Circle stage - wisdom expansion and teaching',
  },
  {
    ruler: 'Shani',
    years: 19,
    sequence: 8,
    themes: ['Karma', 'Discipline', 'Service', 'Longevity', 'Hard work', 'Structure'],
    opportunities: ['Mastery', 'Career stability', 'Longevity', 'Patience', 'Wisdom through experience'],
    challenges: ['Delays', 'Restrictions', 'Depression', 'Chronic illness', 'Isolation'],
    healthFocus: ['Bones', 'Joints', 'Teeth', 'Chronic conditions'],
    spiralogicConnection: 'Earth Pathway - karmic mastery through discipline',
  },
  {
    ruler: 'Budha',
    years: 17,
    sequence: 9,
    themes: ['Intelligence', 'Communication', 'Commerce', 'Learning', 'Adaptability'],
    opportunities: ['Education', 'Business success', 'Writing', 'Speaking', 'Networking'],
    challenges: ['Nervous tension', 'Overthinking', 'Skin issues', 'Speech problems'],
    healthFocus: ['Nervous system', 'Skin', 'Lungs', 'Intestines'],
    spiralogicConnection: 'Air Pathway - intellectual refinement and communication',
  },
];

export interface DashaPeriod {
  ruler: DashaRuler;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
  subPeriods?: DashaPeriod[];
}

export interface VimshottariDashaProfile {
  birthNakshatra: NakshatraInfo;
  moonLongitude: number;
  balanceAtBirth: number;
  mahadashas: DashaPeriod[];
  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod | null;
  previousMahadasha: DashaPeriod | null;
  nextMahadasha: DashaPeriod | null;
}

// =============================================================================
// SIDEREAL POSITION TYPES
// =============================================================================

export type PlanetaryDignity =
  | 'exalted'
  | 'moolatrikona'
  | 'own'
  | 'friendly'
  | 'neutral'
  | 'enemy'
  | 'debilitated';

export interface SiderealPosition {
  longitude: number;
  rashi: RashiInfo;
  rashiDegree: number;
  nakshatra: NakshatraInfo;
  nakshatraPada: 1 | 2 | 3 | 4;
  nakshatraDegree: number;
}

export interface GrahaPosition extends SiderealPosition {
  graha: GrahaInfo;
  retrograde: boolean;
  dignity: PlanetaryDignity;
  combustion: boolean;
  house: number;
}

export interface VedicChart {
  ascendant: SiderealPosition;
  grahas: Record<GrahaName, GrahaPosition>;
  houses: number[];
  ayanamsa: AyanamsaConfig;
  ayanamsaValue: number;
}

// =============================================================================
// COMPLETE VEDIC PROFILE
// =============================================================================

export interface CompleteVedicProfile {
  chart: VedicChart;
  dasha: VimshottariDashaProfile;
  birthNakshatra: NakshatraInfo;
  moonSign: RashiInfo;
  sunSign: RashiInfo;
  ascendantSign: RashiInfo;
  spiralogicIntegration: {
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    pathway: string;
    integration: string;
  };
}
