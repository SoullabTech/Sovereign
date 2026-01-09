/**
 * Journal-Chart Integration Service
 *
 * Links journal entries to astrological elements and tracks patterns over time.
 * "You often journal about Venus themes during Moon transits..."
 *
 * This service:
 * 1. Associates journal entries with planets/houses based on content
 * 2. Correlates entries with active transits at time of writing
 * 3. Detects recurring patterns across entries
 * 4. Generates insights about journaling rhythms and themes
 */

import { query } from '@/lib/db/postgres';
import {
  HOUSE_NEURAL_MAPPING,
  PLANETARY_NEURAL_MAPPING,
} from '@/lib/astrology/neuroArchetypalMapping';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlanetAssociation {
  planet: string;
  confidence: number; // 0-1
  themes: string[];
  reason: string;
}

export interface HouseAssociation {
  house: number;
  confidence: number;
  themes: string[];
  reason: string;
}

export interface JournalChartLink {
  entryId: string;
  entryType: 'quick' | 'holoflower' | 'elemental';
  createdAt: Date;
  planets: PlanetAssociation[];
  houses: HouseAssociation[];
  dominantElement?: 'fire' | 'water' | 'earth' | 'air';
  activeTransits?: TransitAtTime[];
}

export interface TransitAtTime {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
}

export interface JournalPattern {
  id: string;
  patternType: 'planet_timing' | 'house_theme' | 'element_cycle' | 'transit_correlation';
  description: string;
  frequency: number; // times observed
  confidence: number;
  examples: { entryId: string; date: Date; excerpt: string }[];
  insight: string;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ChartJournalInsight {
  userId: string;
  generatedAt: Date;
  dominantPlanets: { planet: string; entryCount: number; themes: string[] }[];
  housePatterns: { house: number; entryCount: number; lifeArea: string }[];
  transitCorrelations: {
    transit: string;
    journalTheme: string;
    frequency: number;
  }[];
  elementBalance: Record<string, number>;
  rhythmInsight: string;
  growthRecommendation: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Planet & House Theme Keywords
// ═══════════════════════════════════════════════════════════════════════════════

const PLANET_KEYWORDS: Record<string, string[]> = {
  Sun: [
    'identity', 'self', 'ego', 'purpose', 'vitality', 'father', 'authority',
    'leadership', 'shine', 'radiant', 'core', 'essence', 'creative', 'express',
    'confidence', 'pride', 'will', 'power', 'center',
  ],
  Moon: [
    'emotion', 'feeling', 'mood', 'mother', 'nurture', 'home', 'comfort',
    'security', 'intuition', 'instinct', 'dream', 'memory', 'past', 'family',
    'need', 'care', 'sensitive', 'receptive', 'inner',
  ],
  Mercury: [
    'think', 'thought', 'communicate', 'speak', 'write', 'learn', 'study',
    'idea', 'mind', 'logic', 'reason', 'sibling', 'neighbor', 'travel',
    'message', 'news', 'conversation', 'curious', 'nervous',
  ],
  Venus: [
    'love', 'beauty', 'value', 'worth', 'relationship', 'partner', 'attract',
    'pleasure', 'art', 'aesthetic', 'harmony', 'peace', 'money', 'desire',
    'affection', 'romantic', 'sensual', 'taste', 'enjoy',
  ],
  Mars: [
    'action', 'energy', 'anger', 'fight', 'conflict', 'assert', 'drive',
    'passion', 'courage', 'compete', 'challenge', 'initiative', 'aggression',
    'sexual', 'physical', 'warrior', 'attack', 'defend', 'force',
  ],
  Jupiter: [
    'growth', 'expand', 'opportunity', 'luck', 'abundance', 'faith', 'belief',
    'philosophy', 'wisdom', 'teacher', 'travel', 'foreign', 'higher', 'meaning',
    'optimism', 'generous', 'benefit', 'bless', 'vision',
  ],
  Saturn: [
    'structure', 'discipline', 'responsibility', 'limit', 'boundary', 'fear',
    'restriction', 'time', 'age', 'mature', 'authority', 'career', 'work',
    'achievement', 'serious', 'commitment', 'lesson', 'karma', 'father',
  ],
  Uranus: [
    'change', 'sudden', 'unexpected', 'freedom', 'rebel', 'unique', 'different',
    'innovation', 'technology', 'future', 'awaken', 'breakthrough', 'shock',
    'liberation', 'independent', 'eccentric', 'genius', 'revolution',
  ],
  Neptune: [
    'dream', 'imagination', 'spiritual', 'transcend', 'dissolve', 'confusion',
    'illusion', 'ideal', 'compassion', 'art', 'music', 'mystical', 'psychic',
    'escape', 'addiction', 'sacrifice', 'merge', 'boundless', 'fog',
  ],
  Pluto: [
    'transform', 'power', 'control', 'intense', 'deep', 'death', 'rebirth',
    'shadow', 'hidden', 'secret', 'obsess', 'compulsion', 'crisis', 'heal',
    'regenerate', 'purge', 'destroy', 'phoenix', 'underworld',
  ],
  Chiron: [
    'wound', 'heal', 'pain', 'teacher', 'mentor', 'vulnerable', 'sensitive',
    'gift', 'wisdom', 'bridge', 'integrate', 'acceptance', 'wholeness',
    'maverick', 'alternative', 'holistic',
  ],
  NorthNode: [
    'destiny', 'purpose', 'growth', 'future', 'calling', 'direction', 'path',
    'evolve', 'potential', 'unfamiliar', 'challenge', 'soul',
  ],
};

const HOUSE_KEYWORDS: Record<number, string[]> = {
  1: ['self', 'identity', 'body', 'appearance', 'beginning', 'initiative', 'persona'],
  2: ['money', 'value', 'resource', 'possess', 'earn', 'worth', 'security', 'material'],
  3: ['communicate', 'sibling', 'neighbor', 'learn', 'write', 'speak', 'local', 'mind'],
  4: ['home', 'family', 'root', 'mother', 'past', 'foundation', 'private', 'emotional'],
  5: ['create', 'play', 'child', 'romance', 'joy', 'express', 'art', 'risk', 'fun'],
  6: ['work', 'health', 'routine', 'service', 'improve', 'daily', 'skill', 'pet'],
  7: ['partner', 'relationship', 'marriage', 'other', 'contract', 'balance', 'cooperate'],
  8: ['transform', 'death', 'sex', 'shared', 'crisis', 'deep', 'power', 'inheritance'],
  9: ['travel', 'philosophy', 'belief', 'higher', 'foreign', 'expand', 'meaning', 'publish'],
  10: ['career', 'public', 'achieve', 'status', 'authority', 'reputation', 'goal', 'father'],
  11: ['friend', 'group', 'community', 'hope', 'future', 'network', 'humanitarian', 'ideal'],
  12: ['unconscious', 'dream', 'spiritual', 'hidden', 'retreat', 'transcend', 'sacrifice', 'end'],
};

const ELEMENT_KEYWORDS: Record<string, string[]> = {
  fire: ['passion', 'energy', 'inspire', 'action', 'courage', 'creative', 'enthusiastic'],
  water: ['emotion', 'feeling', 'intuition', 'dream', 'sensitive', 'nurture', 'deep'],
  earth: ['practical', 'material', 'stable', 'build', 'body', 'ground', 'secure'],
  air: ['think', 'idea', 'communicate', 'social', 'learn', 'curious', 'analyze'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Content Analysis
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze journal content for planetary themes
 */
export function analyzePlanetaryThemes(content: string): PlanetAssociation[] {
  const contentLower = content.toLowerCase();
  const words = contentLower.split(/\s+/);
  const associations: PlanetAssociation[] = [];

  for (const [planet, keywords] of Object.entries(PLANET_KEYWORDS)) {
    const matchedKeywords: string[] = [];
    let matchCount = 0;

    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        matchedKeywords.push(keyword);
        // Count occurrences
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex);
        matchCount += matches ? matches.length : 1;
      }
    }

    if (matchedKeywords.length > 0) {
      // Calculate confidence based on keyword density and variety
      const keywordVariety = matchedKeywords.length / keywords.length;
      const keywordDensity = Math.min(matchCount / words.length * 10, 1);
      const confidence = Math.min((keywordVariety * 0.6 + keywordDensity * 0.4) * 2, 1);

      if (confidence >= 0.15) {
        associations.push({
          planet,
          confidence: Math.round(confidence * 100) / 100,
          themes: matchedKeywords.slice(0, 5),
          reason: `Found themes: ${matchedKeywords.slice(0, 3).join(', ')}`,
        });
      }
    }
  }

  return associations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Analyze journal content for house themes
 */
export function analyzeHouseThemes(content: string): HouseAssociation[] {
  const contentLower = content.toLowerCase();
  const words = contentLower.split(/\s+/);
  const associations: HouseAssociation[] = [];

  for (const [houseStr, keywords] of Object.entries(HOUSE_KEYWORDS)) {
    const house = parseInt(houseStr);
    const matchedKeywords: string[] = [];
    let matchCount = 0;

    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        matchedKeywords.push(keyword);
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex);
        matchCount += matches ? matches.length : 1;
      }
    }

    if (matchedKeywords.length > 0) {
      const keywordVariety = matchedKeywords.length / keywords.length;
      const keywordDensity = Math.min(matchCount / words.length * 10, 1);
      const confidence = Math.min((keywordVariety * 0.6 + keywordDensity * 0.4) * 2, 1);

      if (confidence >= 0.15) {
        const houseData = HOUSE_NEURAL_MAPPING[house];
        associations.push({
          house,
          confidence: Math.round(confidence * 100) / 100,
          themes: matchedKeywords.slice(0, 5),
          reason: houseData?.archetypeTitle || `House ${house} themes`,
        });
      }
    }
  }

  return associations.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
}

/**
 * Detect dominant element in content
 */
export function detectDominantElement(
  content: string
): 'fire' | 'water' | 'earth' | 'air' | undefined {
  const contentLower = content.toLowerCase();
  const elementScores: Record<string, number> = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
  };

  for (const [element, keywords] of Object.entries(ELEMENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        elementScores[element]++;
      }
    }
  }

  const maxScore = Math.max(...Object.values(elementScores));
  if (maxScore < 2) return undefined;

  const dominant = Object.entries(elementScores).find(([, score]) => score === maxScore);
  return dominant ? (dominant[0] as 'fire' | 'water' | 'earth' | 'air') : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Database Operations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Store chart link for a journal entry
 */
export async function saveJournalChartLink(
  userId: string,
  link: JournalChartLink
): Promise<void> {
  await query(
    `INSERT INTO journal_chart_links
     (id, user_id, entry_id, entry_type, planets, houses, dominant_element, active_transits, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (entry_id) DO UPDATE SET
       planets = EXCLUDED.planets,
       houses = EXCLUDED.houses,
       dominant_element = EXCLUDED.dominant_element,
       active_transits = EXCLUDED.active_transits`,
    [
      userId,
      link.entryId,
      link.entryType,
      JSON.stringify(link.planets),
      JSON.stringify(link.houses),
      link.dominantElement || null,
      link.activeTransits ? JSON.stringify(link.activeTransits) : null,
      link.createdAt,
    ]
  );
}

/**
 * Get all chart-linked journal entries for a user
 */
export async function getJournalChartLinks(
  userId: string,
  options: {
    planet?: string;
    house?: number;
    element?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<JournalChartLink[]> {
  let queryStr = `
    SELECT entry_id, entry_type, planets, houses, dominant_element, active_transits, created_at
    FROM journal_chart_links
    WHERE user_id = $1
  `;
  const params: (string | number | Date)[] = [userId];
  let paramIndex = 2;

  if (options.planet) {
    queryStr += ` AND planets::text ILIKE $${paramIndex}`;
    params.push(`%"planet":"${options.planet}"%`);
    paramIndex++;
  }

  if (options.house) {
    queryStr += ` AND houses::text ILIKE $${paramIndex}`;
    params.push(`%"house":${options.house}%`);
    paramIndex++;
  }

  if (options.element) {
    queryStr += ` AND dominant_element = $${paramIndex}`;
    params.push(options.element);
    paramIndex++;
  }

  if (options.startDate) {
    queryStr += ` AND created_at >= $${paramIndex}`;
    params.push(options.startDate);
    paramIndex++;
  }

  if (options.endDate) {
    queryStr += ` AND created_at <= $${paramIndex}`;
    params.push(options.endDate);
    paramIndex++;
  }

  queryStr += ` ORDER BY created_at DESC`;

  if (options.limit) {
    queryStr += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
  }

  const result = await query(queryStr, params);

  return result.rows.map((row) => ({
    entryId: row.entry_id,
    entryType: row.entry_type,
    createdAt: row.created_at,
    planets: row.planets || [],
    houses: row.houses || [],
    dominantElement: row.dominant_element,
    activeTransits: row.active_transits,
  }));
}

/**
 * Store a detected journal pattern
 */
export async function saveJournalPattern(
  userId: string,
  pattern: Omit<JournalPattern, 'id'>
): Promise<string> {
  const result = await query(
    `INSERT INTO journal_patterns
     (id, user_id, pattern_type, description, frequency, confidence, examples, insight, first_seen, last_seen)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id, pattern_type, description) DO UPDATE SET
       frequency = journal_patterns.frequency + 1,
       confidence = GREATEST(journal_patterns.confidence, EXCLUDED.confidence),
       examples = EXCLUDED.examples,
       last_seen = EXCLUDED.last_seen
     RETURNING id`,
    [
      userId,
      pattern.patternType,
      pattern.description,
      pattern.frequency,
      pattern.confidence,
      JSON.stringify(pattern.examples),
      pattern.insight,
      pattern.firstSeen,
      pattern.lastSeen,
    ]
  );

  return result.rows[0].id;
}

/**
 * Get patterns for a user
 */
export async function getJournalPatterns(
  userId: string,
  minConfidence: number = 0.5
): Promise<JournalPattern[]> {
  const result = await query(
    `SELECT id, pattern_type, description, frequency, confidence, examples, insight, first_seen, last_seen
     FROM journal_patterns
     WHERE user_id = $1 AND confidence >= $2
     ORDER BY confidence DESC, frequency DESC`,
    [userId, minConfidence]
  );

  return result.rows.map((row) => ({
    id: row.id,
    patternType: row.pattern_type,
    description: row.description,
    frequency: row.frequency,
    confidence: row.confidence,
    examples: row.examples || [],
    insight: row.insight,
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern Detection
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze a user's journal entries for patterns
 */
export async function detectJournalPatterns(
  userId: string,
  links: JournalChartLink[]
): Promise<JournalPattern[]> {
  const patterns: JournalPattern[] = [];

  if (links.length < 3) return patterns;

  // 1. Planet timing patterns
  const planetCounts: Record<string, { count: number; entries: typeof links }> = {};
  for (const link of links) {
    for (const planet of link.planets) {
      if (planet.confidence >= 0.3) {
        if (!planetCounts[planet.planet]) {
          planetCounts[planet.planet] = { count: 0, entries: [] };
        }
        planetCounts[planet.planet].count++;
        planetCounts[planet.planet].entries.push(link);
      }
    }
  }

  for (const [planet, data] of Object.entries(planetCounts)) {
    if (data.count >= 3) {
      const planetData = PLANETARY_NEURAL_MAPPING?.[planet.toLowerCase()];
      const themes = planetData?.archetypeTitle || planet;

      patterns.push({
        id: '',
        patternType: 'planet_timing',
        description: `${planet} themes in journaling`,
        frequency: data.count,
        confidence: Math.min(data.count / links.length, 0.95),
        examples: data.entries.slice(0, 3).map((e) => ({
          entryId: e.entryId,
          date: e.createdAt,
          excerpt: `${planet} themes detected`,
        })),
        insight: `You frequently explore ${themes} themes. ${planet} energy is active in your reflective practice.`,
        firstSeen: data.entries[data.entries.length - 1].createdAt,
        lastSeen: data.entries[0].createdAt,
      });
    }
  }

  // 2. House theme patterns
  const houseCounts: Record<number, { count: number; entries: typeof links }> = {};
  for (const link of links) {
    for (const house of link.houses) {
      if (house.confidence >= 0.3) {
        if (!houseCounts[house.house]) {
          houseCounts[house.house] = { count: 0, entries: [] };
        }
        houseCounts[house.house].count++;
        houseCounts[house.house].entries.push(link);
      }
    }
  }

  for (const [houseStr, data] of Object.entries(houseCounts)) {
    const house = parseInt(houseStr);
    if (data.count >= 3) {
      const houseData = HOUSE_NEURAL_MAPPING[house];

      patterns.push({
        id: '',
        patternType: 'house_theme',
        description: `House ${house} (${houseData?.archetypeTitle || 'Life Area'}) focus`,
        frequency: data.count,
        confidence: Math.min(data.count / links.length, 0.95),
        examples: data.entries.slice(0, 3).map((e) => ({
          entryId: e.entryId,
          date: e.createdAt,
          excerpt: `House ${house} themes detected`,
        })),
        insight: houseData?.spiritualInvitation || `House ${house} is a significant area of reflection for you.`,
        firstSeen: data.entries[data.entries.length - 1].createdAt,
        lastSeen: data.entries[0].createdAt,
      });
    }
  }

  // 3. Element cycle patterns
  const elementCounts: Record<string, number> = { fire: 0, water: 0, earth: 0, air: 0 };
  for (const link of links) {
    if (link.dominantElement) {
      elementCounts[link.dominantElement]++;
    }
  }

  const dominantElement = Object.entries(elementCounts)
    .sort(([, a], [, b]) => b - a)[0];

  if (dominantElement && dominantElement[1] >= 3) {
    const elementInsights: Record<string, string> = {
      fire: 'Your journaling tends toward action, inspiration, and creative expression. Fire energy seeks movement and transformation.',
      water: 'Your journaling flows through emotional depths and intuitive knowing. Water energy seeks feeling and connection.',
      earth: 'Your journaling grounds in practical concerns and material reality. Earth energy seeks stability and manifestation.',
      air: 'Your journaling explores ideas, communication, and mental patterns. Air energy seeks understanding and connection.',
    };

    patterns.push({
      id: '',
      patternType: 'element_cycle',
      description: `Dominant ${dominantElement[0]} element in journaling`,
      frequency: dominantElement[1],
      confidence: Math.min(dominantElement[1] / links.length, 0.95),
      examples: links
        .filter((l) => l.dominantElement === dominantElement[0])
        .slice(0, 3)
        .map((e) => ({
          entryId: e.entryId,
          date: e.createdAt,
          excerpt: `${dominantElement[0]} element detected`,
        })),
      insight: elementInsights[dominantElement[0]],
      firstSeen: links[links.length - 1].createdAt,
      lastSeen: links[0].createdAt,
    });
  }

  // 4. Transit correlations (if transit data available)
  const transitCorrelations: Record<string, { count: number; entries: typeof links }> = {};
  for (const link of links) {
    if (link.activeTransits) {
      for (const transit of link.activeTransits) {
        const key = `${transit.transitPlanet}-${transit.aspectType}-${transit.natalPlanet}`;
        if (!transitCorrelations[key]) {
          transitCorrelations[key] = { count: 0, entries: [] };
        }
        transitCorrelations[key].count++;
        transitCorrelations[key].entries.push(link);
      }
    }
  }

  for (const [transit, data] of Object.entries(transitCorrelations)) {
    if (data.count >= 2) {
      const [transitPlanet, aspect, natalPlanet] = transit.split('-');

      patterns.push({
        id: '',
        patternType: 'transit_correlation',
        description: `Journaling during ${transitPlanet} ${aspect} natal ${natalPlanet}`,
        frequency: data.count,
        confidence: Math.min(data.count / 5, 0.9),
        examples: data.entries.slice(0, 3).map((e) => ({
          entryId: e.entryId,
          date: e.createdAt,
          excerpt: `During ${transit}`,
        })),
        insight: `You tend to journal when transiting ${transitPlanet} aspects your natal ${natalPlanet}. This transit may activate your reflective process.`,
        firstSeen: data.entries[data.entries.length - 1].createdAt,
        lastSeen: data.entries[0].createdAt,
      });
    }
  }

  return patterns;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Insight Generation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate comprehensive insights about a user's journaling patterns
 */
export async function generateChartJournalInsights(
  userId: string
): Promise<ChartJournalInsight> {
  const links = await getJournalChartLinks(userId, { limit: 100 });
  const patterns = await getJournalPatterns(userId);

  // Aggregate planet data
  const planetAggregates: Record<string, { count: number; themes: Set<string> }> = {};
  for (const link of links) {
    for (const planet of link.planets) {
      if (!planetAggregates[planet.planet]) {
        planetAggregates[planet.planet] = { count: 0, themes: new Set() };
      }
      planetAggregates[planet.planet].count++;
      planet.themes.forEach((t) => planetAggregates[planet.planet].themes.add(t));
    }
  }

  const dominantPlanets = Object.entries(planetAggregates)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([planet, data]) => ({
      planet,
      entryCount: data.count,
      themes: Array.from(data.themes).slice(0, 5),
    }));

  // Aggregate house data
  const houseAggregates: Record<number, number> = {};
  for (const link of links) {
    for (const house of link.houses) {
      houseAggregates[house.house] = (houseAggregates[house.house] || 0) + 1;
    }
  }

  const housePatterns = Object.entries(houseAggregates)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([houseStr, count]) => {
      const house = parseInt(houseStr);
      const houseData = HOUSE_NEURAL_MAPPING[house];
      return {
        house,
        entryCount: count,
        lifeArea: houseData?.archetypeTitle || `House ${house}`,
      };
    });

  // Element balance
  const elementBalance: Record<string, number> = { fire: 0, water: 0, earth: 0, air: 0 };
  for (const link of links) {
    if (link.dominantElement) {
      elementBalance[link.dominantElement]++;
    }
  }

  // Transit correlations from patterns
  const transitCorrelations = patterns
    .filter((p) => p.patternType === 'transit_correlation')
    .map((p) => ({
      transit: p.description,
      journalTheme: p.insight.split('.')[0],
      frequency: p.frequency,
    }));

  // Generate rhythm insight
  let rhythmInsight = '';
  if (dominantPlanets.length > 0) {
    const topPlanet = dominantPlanets[0];
    rhythmInsight = `Your journaling gravitates toward ${topPlanet.planet} themes (${topPlanet.themes.slice(0, 3).join(', ')}). `;
  }
  if (housePatterns.length > 0) {
    const topHouse = housePatterns[0];
    rhythmInsight += `The ${topHouse.lifeArea} area of life appears frequently in your reflections.`;
  }

  // Generate growth recommendation
  const underrepresented = Object.entries(elementBalance)
    .sort(([, a], [, b]) => a - b)[0];
  const growthRecommendation = underrepresented && underrepresented[1] < links.length / 8
    ? `Consider exploring ${underrepresented[0]} themes more: ${ELEMENT_KEYWORDS[underrepresented[0]].slice(0, 4).join(', ')}.`
    : 'Your journaling shows balanced elemental engagement.';

  return {
    userId,
    generatedAt: new Date(),
    dominantPlanets,
    housePatterns,
    transitCorrelations,
    elementBalance,
    rhythmInsight,
    growthRecommendation,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// High-Level API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process a new journal entry - analyze and link to chart
 */
export async function processJournalEntry(
  userId: string,
  entryId: string,
  entryType: 'quick' | 'holoflower' | 'elemental',
  content: string,
  createdAt: Date,
  activeTransits?: TransitAtTime[]
): Promise<JournalChartLink> {
  const planets = analyzePlanetaryThemes(content);
  const houses = analyzeHouseThemes(content);
  const dominantElement = detectDominantElement(content);

  const link: JournalChartLink = {
    entryId,
    entryType,
    createdAt,
    planets,
    houses,
    dominantElement,
    activeTransits,
  };

  await saveJournalChartLink(userId, link);

  return link;
}

/**
 * Get planet-specific journal entries
 */
export async function getEntriesByPlanet(
  userId: string,
  planet: string,
  limit: number = 20
): Promise<JournalChartLink[]> {
  return getJournalChartLinks(userId, { planet, limit });
}

/**
 * Get house-specific journal entries
 */
export async function getEntriesByHouse(
  userId: string,
  house: number,
  limit: number = 20
): Promise<JournalChartLink[]> {
  return getJournalChartLinks(userId, { house, limit });
}
