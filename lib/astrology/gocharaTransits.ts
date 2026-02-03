/**
 * Gochara (Vedic Transit) Calculator
 *
 * In Vedic astrology, transits are analyzed from the Moon sign at birth,
 * not the Sun sign. Each planet transiting through different houses from
 * the natal Moon produces specific effects.
 *
 * This follows the classical Brihat Parashara Hora Shastra guidelines.
 */

import { GrahaName, RashiName, RASHIS } from './types/vedic';

// =============================================================================
// TYPES
// =============================================================================

export type GocharaEffect = 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult';

export interface GocharaPosition {
  graha: GrahaName;
  transitRashi: RashiName;
  houseFromMoon: number; // 1-12
  effect: GocharaEffect;
  vedhaBlocked: boolean; // True if Vedha cancels the effect
  vedhaFrom?: number; // House causing Vedha
  interpretation: string;
  keywords: string[];
}

export interface GocharaProfile {
  natalMoonRashi: RashiName;
  natalMoonRashiNumber: number;
  transits: GocharaPosition[];
  overallTone: GocharaEffect;
  summary: string;
  calculatedAt: string;
}

// =============================================================================
// CLASSICAL GOCHARA EFFECTS
// =============================================================================

/**
 * Classical effects of planets transiting houses from Moon
 * Based on Brihat Parashara Hora Shastra
 *
 * Key: graha -> house from Moon -> effect
 */
const GOCHARA_EFFECTS: Record<GrahaName, Record<number, GocharaEffect>> = {
  Surya: {
    1: 'challenging', 2: 'challenging', 3: 'excellent', 4: 'challenging',
    5: 'challenging', 6: 'excellent', 7: 'challenging', 8: 'challenging',
    9: 'challenging', 10: 'excellent', 11: 'excellent', 12: 'challenging',
  },
  Chandra: {
    1: 'good', 2: 'challenging', 3: 'excellent', 4: 'challenging',
    5: 'challenging', 6: 'excellent', 7: 'excellent', 8: 'challenging',
    9: 'challenging', 10: 'excellent', 11: 'excellent', 12: 'challenging',
  },
  Mangala: {
    1: 'challenging', 2: 'challenging', 3: 'excellent', 4: 'challenging',
    5: 'challenging', 6: 'excellent', 7: 'challenging', 8: 'challenging',
    9: 'challenging', 10: 'challenging', 11: 'excellent', 12: 'challenging',
  },
  Budha: {
    1: 'challenging', 2: 'excellent', 3: 'challenging', 4: 'excellent',
    5: 'challenging', 6: 'excellent', 7: 'challenging', 8: 'excellent',
    9: 'challenging', 10: 'excellent', 11: 'excellent', 12: 'challenging',
  },
  Guru: {
    1: 'challenging', 2: 'excellent', 3: 'challenging', 4: 'challenging',
    5: 'excellent', 6: 'challenging', 7: 'excellent', 8: 'challenging',
    9: 'excellent', 10: 'challenging', 11: 'excellent', 12: 'challenging',
  },
  Shukra: {
    1: 'excellent', 2: 'excellent', 3: 'excellent', 4: 'excellent',
    5: 'excellent', 6: 'challenging', 7: 'challenging', 8: 'excellent',
    9: 'excellent', 10: 'challenging', 11: 'excellent', 12: 'excellent',
  },
  Shani: {
    1: 'challenging', 2: 'challenging', 3: 'excellent', 4: 'challenging',
    5: 'challenging', 6: 'excellent', 7: 'challenging', 8: 'challenging',
    9: 'challenging', 10: 'challenging', 11: 'excellent', 12: 'challenging',
  },
  Rahu: {
    1: 'challenging', 2: 'challenging', 3: 'excellent', 4: 'challenging',
    5: 'challenging', 6: 'excellent', 7: 'challenging', 8: 'challenging',
    9: 'challenging', 10: 'excellent', 11: 'excellent', 12: 'challenging',
  },
  Ketu: {
    1: 'challenging', 2: 'challenging', 3: 'excellent', 4: 'challenging',
    5: 'challenging', 6: 'excellent', 7: 'challenging', 8: 'challenging',
    9: 'excellent', 10: 'challenging', 11: 'excellent', 12: 'challenging',
  },
};

// =============================================================================
// VEDHA (OBSTRUCTION) POINTS
// =============================================================================

/**
 * Vedha system: When a planet gives good results in certain houses,
 * another planet transiting the Vedha point cancels those good results.
 *
 * Format: good house -> Vedha point (the house that blocks it)
 */
const VEDHA_POINTS: Record<GrahaName, Record<number, number>> = {
  Surya: { 3: 9, 6: 12, 10: 4, 11: 5 },
  Chandra: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  Mangala: { 3: 12, 6: 9, 11: 5 },
  Budha: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
  Guru: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  Shukra: { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
  Shani: { 3: 12, 6: 9, 11: 5 },
  Rahu: { 3: 12, 6: 9, 10: 4, 11: 5 },
  Ketu: { 3: 12, 6: 9, 9: 3, 11: 5 },
};

// =============================================================================
// INTERPRETATIONS
// =============================================================================

const GOCHARA_INTERPRETATIONS: Record<GrahaName, Record<number, { text: string; keywords: string[] }>> = {
  Surya: {
    1: { text: 'Health challenges, diminished vitality. Focus on rest and self-care.', keywords: ['health', 'ego', 'vitality'] },
    2: { text: 'Financial pressures, family tensions. Guard your resources.', keywords: ['money', 'family', 'speech'] },
    3: { text: 'Courage amplified, success through effort. Take bold initiatives.', keywords: ['courage', 'siblings', 'communication'] },
    4: { text: 'Domestic unrest, mother\'s health concerns. Inner disquiet.', keywords: ['home', 'mother', 'peace'] },
    5: { text: 'Challenges with children or creativity. Speculation unfavored.', keywords: ['children', 'creativity', 'romance'] },
    6: { text: 'Victory over enemies and obstacles. Health improves.', keywords: ['enemies', 'health', 'service'] },
    7: { text: 'Partnership tensions, travel fatigue. Patience in relationships.', keywords: ['marriage', 'partners', 'travel'] },
    8: { text: 'Hidden challenges, health vulnerabilities. Avoid risk.', keywords: ['transformation', 'secrets', 'longevity'] },
    9: { text: 'Obstacles in higher learning or dharma. Father\'s difficulties.', keywords: ['dharma', 'father', 'luck'] },
    10: { text: 'Career success, recognition, authority enhanced.', keywords: ['career', 'status', 'authority'] },
    11: { text: 'Gains through effort, wishes fulfilled. Social success.', keywords: ['gains', 'friends', 'aspirations'] },
    12: { text: 'Expenses increase, spiritual introspection needed.', keywords: ['expenses', 'isolation', 'spirituality'] },
  },
  Chandra: {
    1: { text: 'Emotional sensitivity heightened. Good for self-reflection.', keywords: ['emotions', 'mind', 'self'] },
    2: { text: 'Financial fluctuations, family emotional needs.', keywords: ['money', 'family', 'food'] },
    3: { text: 'Mental courage, successful short journeys. Good communication.', keywords: ['courage', 'travel', 'siblings'] },
    4: { text: 'Emotional unrest at home. Mother needs attention.', keywords: ['home', 'comfort', 'mother'] },
    5: { text: 'Creative blocks, children matters require care.', keywords: ['creativity', 'romance', 'children'] },
    6: { text: 'Emotional strength to overcome obstacles.', keywords: ['enemies', 'health', 'service'] },
    7: { text: 'Partnership harmony, beneficial travel.', keywords: ['marriage', 'partners', 'public'] },
    8: { text: 'Emotional turmoil, health vulnerabilities.', keywords: ['transformation', 'crisis', 'secrets'] },
    9: { text: 'Spiritual restlessness, pilgrimage unfavored.', keywords: ['dharma', 'travel', 'teachers'] },
    10: { text: 'Public recognition, emotional satisfaction in work.', keywords: ['career', 'reputation', 'success'] },
    11: { text: 'Emotional fulfillment, friendships blossom.', keywords: ['gains', 'friends', 'hopes'] },
    12: { text: 'Emotional isolation, need for retreat.', keywords: ['expenses', 'sleep', 'liberation'] },
  },
  Mangala: {
    1: { text: 'Anger issues, accidents possible. Channel energy constructively.', keywords: ['energy', 'anger', 'accidents'] },
    2: { text: 'Financial aggression, family conflicts. Guard speech.', keywords: ['money', 'conflicts', 'speech'] },
    3: { text: 'Courage and victory. Excellent for competition.', keywords: ['courage', 'victory', 'siblings'] },
    4: { text: 'Domestic strife, property issues. Mother\'s health.', keywords: ['property', 'vehicles', 'mother'] },
    5: { text: 'Children concerns, romance conflicts. Speculation losses.', keywords: ['children', 'speculation', 'conflict'] },
    6: { text: 'Victory over enemies, surgical success. Legal wins.', keywords: ['enemies', 'surgery', 'competition'] },
    7: { text: 'Partnership conflicts, travel accidents. Patience needed.', keywords: ['marriage', 'conflict', 'travel'] },
    8: { text: 'Accidents, surgeries, hidden dangers. Extreme caution.', keywords: ['accidents', 'surgery', 'danger'] },
    9: { text: 'Conflicts with father/teachers. Dharmic struggles.', keywords: ['father', 'dharma', 'conflict'] },
    10: { text: 'Career ambition strong but conflicts with authority.', keywords: ['career', 'ambition', 'conflict'] },
    11: { text: 'Gains through courage, elder sibling benefits.', keywords: ['gains', 'courage', 'friends'] },
    12: { text: 'Hidden enemies active, expenses on health.', keywords: ['expenses', 'enemies', 'hospitalization'] },
  },
  Budha: {
    1: { text: 'Mental restlessness, communication issues.', keywords: ['mind', 'nerves', 'communication'] },
    2: { text: 'Financial gains through intellect. Good for learning.', keywords: ['money', 'speech', 'learning'] },
    3: { text: 'Scattered mind, sibling tensions.', keywords: ['communication', 'siblings', 'travel'] },
    4: { text: 'Mental peace at home, educational success.', keywords: ['education', 'home', 'vehicles'] },
    5: { text: 'Children\'s education concerns. Intellectual creativity blocked.', keywords: ['children', 'education', 'speculation'] },
    6: { text: 'Victory in debates, intellectual triumph over enemies.', keywords: ['debates', 'health', 'service'] },
    7: { text: 'Business partnership tensions, contractual issues.', keywords: ['contracts', 'partners', 'negotiations'] },
    8: { text: 'Research success, occult learning. Communication with hidden matters.', keywords: ['research', 'occult', 'inheritance'] },
    9: { text: 'Higher learning obstacles, publishing delays.', keywords: ['philosophy', 'publishing', 'travel'] },
    10: { text: 'Career advancement through communication/intellect.', keywords: ['career', 'communication', 'business'] },
    11: { text: 'Gains through networking, intellectual friendships.', keywords: ['gains', 'networking', 'friends'] },
    12: { text: 'Mental fatigue, expenses through miscommunication.', keywords: ['expenses', 'confusion', 'isolation'] },
  },
  Guru: {
    1: { text: 'Lack of wisdom, health issues. Reputation concerns.', keywords: ['health', 'reputation', 'wisdom'] },
    2: { text: 'Financial growth, family expansion. Excellent for wealth.', keywords: ['wealth', 'family', 'speech'] },
    3: { text: 'Courage lacking, sibling difficulties.', keywords: ['courage', 'siblings', 'effort'] },
    4: { text: 'Mental unrest, property issues.', keywords: ['property', 'education', 'mother'] },
    5: { text: 'Children prosper, excellent for creativity and romance.', keywords: ['children', 'creativity', 'romance'] },
    6: { text: 'Enemies gain strength, health requires attention.', keywords: ['enemies', 'debts', 'disease'] },
    7: { text: 'Marriage/partnership blessings. Excellent for relationships.', keywords: ['marriage', 'partnerships', 'travel'] },
    8: { text: 'Longevity concerns, inheritance blocked.', keywords: ['longevity', 'transformation', 'inheritance'] },
    9: { text: 'Dharma flourishes, father prospers. Luck amplified.', keywords: ['dharma', 'luck', 'father'] },
    10: { text: 'Career obstacles, reputation challenges.', keywords: ['career', 'status', 'authority'] },
    11: { text: 'Major gains, wishes fulfilled. Excellent period.', keywords: ['gains', 'income', 'aspirations'] },
    12: { text: 'Expenses increase, spiritual growth opportunity.', keywords: ['expenses', 'spirituality', 'liberation'] },
  },
  Shukra: {
    1: { text: 'Beauty, charm, luxury enhanced. Excellent for relationships.', keywords: ['beauty', 'luxury', 'pleasure'] },
    2: { text: 'Financial prosperity, family harmony. Sweet speech.', keywords: ['wealth', 'family', 'pleasure'] },
    3: { text: 'Artistic success, sibling harmony.', keywords: ['arts', 'siblings', 'communication'] },
    4: { text: 'Domestic luxury, vehicle acquisition. Mother happy.', keywords: ['vehicles', 'property', 'comfort'] },
    5: { text: 'Romance blossoms, children bring joy. Creative success.', keywords: ['romance', 'creativity', 'children'] },
    6: { text: 'Relationship conflicts, health indulgences.', keywords: ['conflicts', 'health', 'enemies'] },
    7: { text: 'Partnership tensions possible despite Venus.', keywords: ['marriage', 'partnerships', 'business'] },
    8: { text: 'Unexpected gains, research into beauty/arts.', keywords: ['inheritance', 'occult', 'transformation'] },
    9: { text: 'Dharmic pursuits blessed, beneficial travel.', keywords: ['dharma', 'travel', 'teachers'] },
    10: { text: 'Career challenges in creative fields.', keywords: ['career', 'reputation', 'arts'] },
    11: { text: 'Gains through arts, fulfillment of desires.', keywords: ['gains', 'friends', 'desires'] },
    12: { text: 'Luxury in isolation, bedroom pleasures.', keywords: ['pleasure', 'expenses', 'spirituality'] },
  },
  Shani: {
    1: { text: 'Health challenges, depression possible. Slow period.', keywords: ['health', 'depression', 'delays'] },
    2: { text: 'Financial constraints, family burdens.', keywords: ['money', 'family', 'restrictions'] },
    3: { text: 'Courage through discipline, success via hard work.', keywords: ['discipline', 'effort', 'siblings'] },
    4: { text: 'Domestic difficulties, property problems. Mother\'s health.', keywords: ['property', 'mother', 'restrictions'] },
    5: { text: 'Children challenges, creativity blocked. Romance delayed.', keywords: ['children', 'delays', 'creativity'] },
    6: { text: 'Victory over enemies through persistence. Health stable.', keywords: ['enemies', 'persistence', 'service'] },
    7: { text: 'Partnership delays or older partner. Travel difficult.', keywords: ['marriage', 'delays', 'restrictions'] },
    8: { text: 'Longevity concerns, transformation through hardship.', keywords: ['longevity', 'hardship', 'transformation'] },
    9: { text: 'Dharmic tests, father\'s difficulties. Faith challenged.', keywords: ['dharma', 'father', 'tests'] },
    10: { text: 'Career delays but eventual rise through persistence.', keywords: ['career', 'delays', 'authority'] },
    11: { text: 'Gains through patience, older friends beneficial.', keywords: ['gains', 'patience', 'friends'] },
    12: { text: 'Isolation, hospitalization possible. Spiritual lessons.', keywords: ['isolation', 'hospitals', 'spirituality'] },
  },
  Rahu: {
    1: { text: 'Confusion about identity, health anxieties.', keywords: ['confusion', 'anxiety', 'obsession'] },
    2: { text: 'Financial instability through illusion. Family tensions.', keywords: ['money', 'illusion', 'speech'] },
    3: { text: 'Unconventional courage, media success.', keywords: ['media', 'courage', 'unconventional'] },
    4: { text: 'Domestic instability, foreign residence possible.', keywords: ['property', 'foreign', 'instability'] },
    5: { text: 'Speculation dangers, unconventional romance.', keywords: ['speculation', 'romance', 'unconventional'] },
    6: { text: 'Victory over hidden enemies, foreign health treatments.', keywords: ['enemies', 'foreign', 'victory'] },
    7: { text: 'Unconventional partnerships, foreign spouse possible.', keywords: ['marriage', 'foreign', 'unconventional'] },
    8: { text: 'Sudden transformations, occult attractions.', keywords: ['transformation', 'occult', 'sudden'] },
    9: { text: 'Dharmic confusion, foreign teachers.', keywords: ['dharma', 'foreign', 'confusion'] },
    10: { text: 'Career advancement through unconventional means.', keywords: ['career', 'unconventional', 'foreign'] },
    11: { text: 'Gains through technology, foreign friends.', keywords: ['gains', 'technology', 'foreign'] },
    12: { text: 'Foreign travels, spiritual illusions.', keywords: ['foreign', 'isolation', 'illusions'] },
  },
  Ketu: {
    1: { text: 'Spiritual awakening, physical detachment.', keywords: ['spirituality', 'detachment', 'confusion'] },
    2: { text: 'Financial losses through detachment. Family separation.', keywords: ['losses', 'separation', 'family'] },
    3: { text: 'Spiritual courage, moksha-oriented actions.', keywords: ['spirituality', 'courage', 'moksha'] },
    4: { text: 'Detachment from home, mother\'s spiritual growth.', keywords: ['detachment', 'home', 'spirituality'] },
    5: { text: 'Children matters complex, past-life creativity.', keywords: ['children', 'past-life', 'creativity'] },
    6: { text: 'Victory through spiritual power over enemies.', keywords: ['spirituality', 'enemies', 'healing'] },
    7: { text: 'Partnership detachment, spiritual union preferred.', keywords: ['detachment', 'marriage', 'spirituality'] },
    8: { text: 'Deep transformation, occult mastery.', keywords: ['occult', 'transformation', 'kundalini'] },
    9: { text: 'Past-life dharma activated, moksha path.', keywords: ['moksha', 'dharma', 'past-life'] },
    10: { text: 'Career detachment, spiritual vocation.', keywords: ['detachment', 'career', 'spirituality'] },
    11: { text: 'Spiritual gains, detachment from desires.', keywords: ['gains', 'detachment', 'spirituality'] },
    12: { text: 'Moksha advancement, liberation focus.', keywords: ['moksha', 'liberation', 'spirituality'] },
  },
};

// =============================================================================
// CORE CALCULATOR
// =============================================================================

/**
 * Calculate house position from Moon
 *
 * @param moonRashiNumber - Natal Moon's rashi number (1-12)
 * @param transitRashiNumber - Transit planet's current rashi number (1-12)
 * @returns House from Moon (1-12)
 */
export function calculateHouseFromMoon(moonRashiNumber: number, transitRashiNumber: number): number {
  let house = transitRashiNumber - moonRashiNumber + 1;
  if (house <= 0) house += 12;
  return house;
}

/**
 * Get rashi number from name
 */
export function getRashiNumber(rashiName: RashiName | string): number {
  const rashi = RASHIS.find(
    r => r.name === rashiName || r.westernEquivalent.toLowerCase() === rashiName.toLowerCase()
  );
  return rashi?.number || 1;
}

/**
 * Get rashi name from number
 */
export function getRashiName(number: number): RashiName {
  const rashi = RASHIS.find(r => r.number === number);
  return rashi?.name || 'Mesha';
}

/**
 * Check if Vedha applies
 *
 * @param graha - The planet being checked
 * @param houseFromMoon - House the planet is transiting from Moon
 * @param allTransits - All current transits to check for Vedha planets
 * @returns Object with blocked status and blocking house if applicable
 */
export function checkVedha(
  graha: GrahaName,
  houseFromMoon: number,
  allTransits: Array<{ graha: GrahaName; houseFromMoon: number }>
): { blocked: boolean; blockingHouse?: number } {
  const vedhaPoints = VEDHA_POINTS[graha];
  if (!vedhaPoints) return { blocked: false };

  const vedhaHouse = vedhaPoints[houseFromMoon];
  if (!vedhaHouse) return { blocked: false };

  // Check if any other planet is in the Vedha house
  // Note: Sun and Moon don't cause Vedha to each other
  const blockingTransit = allTransits.find(t => {
    if (t.graha === graha) return false;
    if ((graha === 'Surya' && t.graha === 'Chandra') ||
        (graha === 'Chandra' && t.graha === 'Surya')) return false;
    return t.houseFromMoon === vedhaHouse;
  });

  return {
    blocked: !!blockingTransit,
    blockingHouse: blockingTransit ? vedhaHouse : undefined,
  };
}

/**
 * Calculate complete Gochara profile
 *
 * @param natalMoonRashi - Natal Moon's rashi name
 * @param currentTransits - Current planetary positions (sidereal)
 * @returns Complete Gochara analysis
 */
export function calculateGochara(
  natalMoonRashi: RashiName | string,
  currentTransits: Array<{ graha: GrahaName; rashi: RashiName | string }>
): GocharaProfile {
  const moonRashiNumber = getRashiNumber(natalMoonRashi);

  // First pass: calculate basic positions
  const basicTransits = currentTransits.map(transit => ({
    graha: transit.graha,
    transitRashi: (typeof transit.rashi === 'string'
      ? RASHIS.find(r => r.name === transit.rashi || r.westernEquivalent.toLowerCase() === transit.rashi.toLowerCase())?.name || 'Mesha'
      : transit.rashi) as RashiName,
    houseFromMoon: calculateHouseFromMoon(moonRashiNumber, getRashiNumber(transit.rashi)),
  }));

  // Second pass: calculate effects with Vedha
  const transits: GocharaPosition[] = basicTransits.map(transit => {
    const effect = GOCHARA_EFFECTS[transit.graha]?.[transit.houseFromMoon] || 'neutral';
    const interp = GOCHARA_INTERPRETATIONS[transit.graha]?.[transit.houseFromMoon] || {
      text: 'Transit effects being calculated.',
      keywords: ['transit'],
    };

    // Check Vedha only for good houses
    let vedhaBlocked = false;
    let vedhaFrom: number | undefined;

    if (effect === 'excellent' || effect === 'good') {
      const vedhaCheck = checkVedha(transit.graha, transit.houseFromMoon, basicTransits);
      vedhaBlocked = vedhaCheck.blocked;
      vedhaFrom = vedhaCheck.blockingHouse;
    }

    return {
      graha: transit.graha,
      transitRashi: transit.transitRashi,
      houseFromMoon: transit.houseFromMoon,
      effect: vedhaBlocked ? 'neutral' : effect,
      vedhaBlocked,
      vedhaFrom,
      interpretation: vedhaBlocked
        ? `${interp.text} (Vedha from house ${vedhaFrom} reduces benefits.)`
        : interp.text,
      keywords: interp.keywords,
    };
  });

  // Calculate overall tone
  const effectScores: Record<GocharaEffect, number> = {
    excellent: 2,
    good: 1,
    neutral: 0,
    challenging: -1,
    difficult: -2,
  };

  const totalScore = transits.reduce((sum, t) => sum + effectScores[t.effect], 0);
  const avgScore = totalScore / transits.length;

  let overallTone: GocharaEffect;
  if (avgScore >= 1) overallTone = 'excellent';
  else if (avgScore >= 0.3) overallTone = 'good';
  else if (avgScore >= -0.3) overallTone = 'neutral';
  else if (avgScore >= -1) overallTone = 'challenging';
  else overallTone = 'difficult';

  // Generate summary
  const beneficTransits = transits.filter(t => t.effect === 'excellent' || t.effect === 'good');
  const challengingTransits = transits.filter(t => t.effect === 'challenging' || t.effect === 'difficult');

  let summary = `Moon in ${natalMoonRashi}: `;
  if (beneficTransits.length > challengingTransits.length) {
    summary += `Favorable period with ${beneficTransits.map(t => t.graha).join(', ')} supporting you. `;
  } else if (challengingTransits.length > beneficTransits.length) {
    summary += `Challenging period with ${challengingTransits.map(t => t.graha).join(', ')} requiring patience. `;
  } else {
    summary += `Mixed influences requiring balance. `;
  }

  const vedhaCount = transits.filter(t => t.vedhaBlocked).length;
  if (vedhaCount > 0) {
    summary += `${vedhaCount} positive transit(s) reduced by Vedha.`;
  }

  return {
    natalMoonRashi: getRashiName(moonRashiNumber),
    natalMoonRashiNumber: moonRashiNumber,
    transits,
    overallTone,
    summary,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Get Gochara guidance for a specific transit
 */
export function getGocharaGuidance(graha: GrahaName, houseFromMoon: number, effect: GocharaEffect): string {
  const guidanceMap: Record<GocharaEffect, string> = {
    excellent: `${graha} transiting your ${getHouseOrdinal(houseFromMoon)} house from Moon brings excellent results. Maximize this period.`,
    good: `${graha} transiting your ${getHouseOrdinal(houseFromMoon)} house from Moon is generally favorable. Good time for related matters.`,
    neutral: `${graha} transiting your ${getHouseOrdinal(houseFromMoon)} house from Moon has mixed effects. Proceed with awareness.`,
    challenging: `${graha} transiting your ${getHouseOrdinal(houseFromMoon)} house from Moon requires patience. Avoid hasty decisions.`,
    difficult: `${graha} transiting your ${getHouseOrdinal(houseFromMoon)} house from Moon is challenging. Practice remedial measures and patience.`,
  };
  return guidanceMap[effect];
}

function getHouseOrdinal(house: number): string {
  const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  return ordinals[house] || `${house}th`;
}

// Types are exported inline above
