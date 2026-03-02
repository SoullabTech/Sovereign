// @ts-nocheck
/**
 * MAIA Astrology Context Service
 *
 * Provides birth chart and current transit context for MAIA conversations.
 * Enables MAIA to reference astrological patterns naturally in dialogue.
 *
 * Example: If user mentions communication issues with partner and Mercury is retrograde
 * with Chiron in their 7th house, MAIA can reference these dynamics.
 */

import { query } from '@/lib/db/postgres';
import {
  calculateBirthChart,
  calculateTransits,
  type BirthData,
  type BirthChart,
  type PlanetPosition,
} from '@/lib/astrology/ephemerisCalculator';
import {
  calculateCompleteMayanProfile,
  getTodaysMayanSign,
  type CompleteMayanProfile,
  type MayanBirthSign,
} from '@/lib/astrology/mayanAstrology';
import {
  computeCelestialEvents,
  type CelestialEventsSnapshot,
  type EclipseEvent,
  type LunationEvent,
} from '@/lib/astrology/celestialEvents';

// ==================== TYPES ====================

export interface MemberBirthData {
  date: string;        // YYYY-MM-DD
  time: string | null; // HH:MM (may be unknown)
  location: {
    lat: number;
    lng: number;
    name: string;
    timezone: string;
  } | null;
}

export interface CurrentTransit {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  significantAspects?: string[];
}

export interface TransitHighlight {
  description: string;
  relevance: 'high' | 'medium' | 'low';
  theme: string;
}

export interface AstrologyContext {
  hasBirthData: boolean;
  birthChart: BirthChart | null;
  mayanProfile: CompleteMayanProfile | null;
  todaysMayanSign: MayanBirthSign | null;
  currentTransits: CurrentTransit[];
  transitHighlights: TransitHighlight[];
  relevantPatterns: string[];
  /** Always-included status directive (~250 chars). Never truncate this. */
  contextHeader: string;
  /** Prioritized detail — natal identity first, cosmic weather last. Can be capped. */
  contextDetail: string;
  /** contextHeader + contextDetail (backward compat) */
  formattedContext: string;
  celestialEvents: CelestialEventsSnapshot | null;
}

// ==================== TRANSIT SIGNIFICANCE ====================

const RETROGRADE_MEANINGS: Record<string, string> = {
  mercury: 'communication challenges, technology glitches, revisiting past conversations',
  venus: 'relationship reflection, reconsidering values, past lovers may resurface',
  mars: 'action blocks, redirected energy, simmering frustration needing patience',
  jupiter: 'internal growth focus, philosophical reassessment',
  saturn: 'restructuring responsibilities, karma review',
};

const PLANET_HOUSE_THEMES: Record<number, string> = {
  1: 'identity, self-expression, physical body',
  2: 'resources, values, self-worth, money',
  3: 'communication, siblings, local travel, learning',
  4: 'home, family, roots, emotional foundation',
  5: 'creativity, romance, children, joy, play',
  6: 'health, daily routine, service, work',
  7: 'partnerships, marriage, open enemies, projection',
  8: 'transformation, shared resources, intimacy, death/rebirth',
  9: 'higher learning, travel, philosophy, meaning',
  10: 'career, public image, authority, achievement',
  11: 'community, friends, hopes, collective causes',
  12: 'unconscious, spirituality, isolation, hidden patterns',
};

const CHIRON_HOUSE_WOUNDS: Record<number, string> = {
  1: 'wound around identity and being seen',
  2: 'wound around self-worth and resources',
  3: 'wound around communication and being heard',
  4: 'wound around family and belonging',
  5: 'wound around creativity and being valued',
  6: 'wound around health and service',
  7: 'wound around relationships and partnership',
  8: 'wound around intimacy and trust',
  9: 'wound around meaning and truth',
  10: 'wound around achievement and recognition',
  11: 'wound around community and acceptance',
  12: 'wound around spirituality and connection to source',
};

// ==================== MAIN SERVICE ====================

/**
 * Get complete astrology context for a user
 */
export async function getAstrologyContextForUser(memberId: string): Promise<AstrologyContext | null> {
  try {
    // Fetch birth data from members table
    const result = await query(
      `SELECT birth_date, birth_time, birth_location_lat, birth_location_lng,
              birth_location_name, birth_timezone
       FROM members WHERE id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const member = result.rows[0];
    const hasBirthData = !!member.birth_date;

    let birthChart: BirthChart | null = null;
    let mayanProfile: CompleteMayanProfile | null = null;
    let relevantPatterns: string[] = [];

    // Calculate birth chart if we have the data
    if (hasBirthData && member.birth_location_lat && member.birth_location_lng) {
      try {
        const birthData: BirthData = {
          date: member.birth_date,
          time: member.birth_time || '12:00', // Noon if unknown
          location: {
            lat: parseFloat(member.birth_location_lat),
            lng: parseFloat(member.birth_location_lng),
            timezone: member.birth_timezone || 'America/Los_Angeles',
          },
        };

        birthChart = await calculateBirthChart(birthData);
        relevantPatterns = extractRelevantPatterns(birthChart);
      } catch (chartError) {
        console.warn('[AstrologyContext] Birth chart calculation failed:', chartError);
      }
    }

    // Calculate Mayan profile if we have birth date (doesn't need location/time)
    if (hasBirthData) {
      try {
        const birthDate = new Date(member.birth_date);
        mayanProfile = calculateCompleteMayanProfile(birthDate);
      } catch (mayanError) {
        console.warn('[AstrologyContext] Mayan profile calculation failed:', mayanError);
      }
    }

    // Get current transits (works even without birth data)
    const currentTransits = await getCurrentTransitPositions();
    const transitHighlights = generateTransitHighlights(currentTransits, birthChart);

    // Get today's Mayan sign (always available)
    const todaysMayanSign = getTodaysMayanSign();

    // Celestial events: eclipses, exact lunations, retrograde stations, seasonal markers
    let celestialEvents: CelestialEventsSnapshot | null = null;
    try {
      const observer = (member.birth_location_lat && member.birth_location_lng)
        ? { lat: parseFloat(member.birth_location_lat), lng: parseFloat(member.birth_location_lng) }
        : undefined;
      celestialEvents = computeCelestialEvents(new Date(), observer);
      const eclipseCount = celestialEvents.eclipses.length;
      console.log(`[AstrologyContext] Celestial events loaded: ${eclipseCount} eclipses, eclipse season: ${celestialEvents.eclipseSeasonActive}`);
    } catch (celestialError) {
      console.warn('[AstrologyContext] Celestial events calculation failed (non-critical):', celestialError);
    }

    // Format the context for MAIA
    const { header: contextHeader, detail: contextDetail } = formatAstrologyContextForMAIA({
      hasBirthData,
      birthChart,
      mayanProfile,
      todaysMayanSign,
      currentTransits,
      transitHighlights,
      relevantPatterns,
      birthTimeUnknown: !member.birth_time,
      celestialEvents,
    });

    return {
      hasBirthData,
      birthChart,
      mayanProfile,
      todaysMayanSign,
      currentTransits,
      transitHighlights,
      relevantPatterns,
      contextHeader,
      contextDetail,
      formattedContext: contextHeader + contextDetail, // backward compat
      celestialEvents,
    };
  } catch (error) {
    console.error('[AstrologyContext] Error fetching context:', error);
    return null;
  }
}

/**
 * Get current planetary positions
 */
async function getCurrentTransitPositions(): Promise<CurrentTransit[]> {
  try {
    const transitsMap = await calculateTransits(new Date());
    // Convert from Record<string, PlanetPosition> to CurrentTransit[]
    return Object.entries(transitsMap).map(([planet, pos]) => ({
      planet: planet.charAt(0).toUpperCase() + planet.slice(1), // Capitalize planet name
      sign: pos.sign,
      degree: pos.degree,
      retrograde: pos.retrograde,
    }));
  } catch (error) {
    console.warn('[AstrologyContext] Transit calculation failed, using fallback:', error);
    // Fallback: return basic current sky info
    return getSimplifiedCurrentTransits();
  }
}

/**
 * Simplified transit calculation fallback
 */
function getSimplifiedCurrentTransits(): CurrentTransit[] {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  // Approximate Sun position based on date
  const sunSigns = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'
  ];

  // Simplified sun sign calculation
  let sunSignIndex = month;
  if (day >= 20) sunSignIndex = (month + 1) % 12;

  return [
    { planet: 'Sun', sign: sunSigns[sunSignIndex], degree: day, retrograde: false },
    // Note: For accurate transits, the full ephemeris calculation should be used
  ];
}

/**
 * Extract psychologically relevant patterns from birth chart
 */
function extractRelevantPatterns(chart: BirthChart): string[] {
  const patterns: string[] = [];

  // Sun-Moon relationship (core identity vs emotional needs)
  if (chart.sun && chart.moon) {
    const sunElement = getElement(chart.sun.sign);
    const moonElement = getElement(chart.moon.sign);
    if (sunElement !== moonElement) {
      patterns.push(`Sun in ${chart.sun.sign} (${sunElement}) and Moon in ${chart.moon.sign} (${moonElement}) suggest a creative tension between identity expression and emotional needs`);
    }
  }

  // Chiron placement (core wound)
  if (chart.chiron) {
    const chironWound = CHIRON_HOUSE_WOUNDS[chart.chiron.house];
    if (chironWound) {
      patterns.push(`Chiron in ${chart.chiron.sign} in the ${chart.chiron.house}th house indicates a ${chironWound}`);
    }
  }

  // Venus placement (relationships, values)
  if (chart.venus) {
    patterns.push(`Venus in ${chart.venus.sign} (House ${chart.venus.house}) colors how they give and receive love, and what they value`);
  }

  // Saturn placement (challenges, structure)
  if (chart.saturn) {
    patterns.push(`Saturn in ${chart.saturn.sign} (House ${chart.saturn.house}) shows where they face growth through challenge and responsibility`);
  }

  return patterns;
}

/**
 * Generate transit highlights relevant to common conversation themes
 */
function generateTransitHighlights(
  transits: CurrentTransit[],
  birthChart: BirthChart | null
): TransitHighlight[] {
  const highlights: TransitHighlight[] = [];

  // Check for Mercury retrograde
  const mercury = transits.find(t => t.planet === 'Mercury');
  if (mercury?.retrograde) {
    highlights.push({
      description: 'Mercury is currently retrograde - a natural time for miscommunications, technology issues, and revisiting past conversations',
      relevance: 'high',
      theme: 'communication',
    });
  }

  // Check for Venus retrograde
  const venus = transits.find(t => t.planet === 'Venus');
  if (venus?.retrograde) {
    highlights.push({
      description: 'Venus retrograde period - relationships and values are being reconsidered, past connections may resurface',
      relevance: 'high',
      theme: 'relationships',
    });
  }

  // Check for Mars retrograde
  const mars = transits.find(t => t.planet === 'Mars');
  if (mars?.retrograde) {
    highlights.push({
      description: 'Mars retrograde - energy may feel blocked or redirected, patience with action is favored',
      relevance: 'medium',
      theme: 'action',
    });
  }

  // If we have birth chart, check for significant transits to natal planets
  if (birthChart) {
    // Check if current Saturn is aspecting natal Sun, Moon, or Saturn
    const saturn = transits.find(t => t.planet === 'Saturn');
    if (saturn) {
      const saturnDegree = getAbsoluteDegree(saturn.sign, saturn.degree);
      const sunDegree = getAbsoluteDegree(birthChart.sun.sign, birthChart.sun.degree);

      if (isWithinOrb(saturnDegree, sunDegree, 5)) {
        highlights.push({
          description: 'Saturn is currently aspecting your natal Sun - a time of maturation, responsibility, and defining who you truly are',
          relevance: 'high',
          theme: 'identity',
        });
      }
    }
  }

  return highlights;
}

interface FormattedAstrologyContext {
  /** Always-included status directive. Never truncate. ~200-300 chars. */
  header: string;
  /** Prioritized rich detail. Natal identity first so truncation harms least. */
  detail: string;
}

/**
 * Format astrology context as two blocks for MAIA's system prompt.
 *
 * BLOCK A (header): status directive — always included, never capped.
 *   Uses hasBirthData (DB presence) not birthChart (calculation result) as the
 *   authoritative gate. MAIA must not re-ask for data that is stored.
 *
 * BLOCK B (detail): natal identity first, cosmic weather last.
 *   Priority order ensures truncation harms the least important data.
 */
function formatAstrologyContextForMAIA({
  hasBirthData,
  birthChart,
  mayanProfile,
  todaysMayanSign,
  currentTransits,
  transitHighlights,
  relevantPatterns,
  birthTimeUnknown,
  celestialEvents,
}: {
  hasBirthData: boolean;
  birthChart: BirthChart | null;
  mayanProfile: CompleteMayanProfile | null;
  todaysMayanSign: MayanBirthSign | null;
  currentTransits: CurrentTransit[];
  transitHighlights: TransitHighlight[];
  relevantPatterns: string[];
  birthTimeUnknown: boolean;
  celestialEvents?: CelestialEventsSnapshot | null;
}): FormattedAstrologyContext {
  // ── BLOCK A: Status directive ─────────────────────────────────────────────
  // Short, unambiguous, always survives any cap on block B.
  let statusDirective: string;
  if (hasBirthData) {
    if (birthChart) {
      statusDirective =
        '**BIRTH DATA: ON FILE** — Do not ask for birth date, time, or location. ' +
        'You already have their natal chart — reference it directly. ' +
        'If uncertain about a specific detail, proceed with what is available and ' +
        'suggest /astrology (Cosmic Blueprint) or /journey (Spiralogic map) for ' +
        'verification. Never re-ask.';
    } else {
      statusDirective =
        '**BIRTH DATA: ON FILE** (chart calculation in progress) — Do not ask for ' +
        'birth date, time, or location. Their data is stored. Use what is available ' +
        'below; for the full chart, direct them to /astrology. Never re-ask.';
    }
  } else {
    statusDirective =
      '**NO BIRTH DATA ON FILE** — You may gently invite the person to share birth ' +
      'details or visit /astrology to enter them, but only if cosmically relevant.';
  }

  const header = `\n# Astrological Context (IMPLICIT)\n\n${statusDirective}\n`;

  // ── BLOCK B: Detail — natal identity first ────────────────────────────────
  let detail = '';

  // 1. Natal identity — most important, goes first so truncation can't touch it
  if (birthChart) {
    detail += '\n## Natal Identity\n';
    if (birthTimeUnknown) {
      detail += '*Birth time unknown — house placements are approximate*\n';
    }
    detail += `- **Sun:** ${birthChart.sun.sign} H${birthChart.sun.house} — core identity, vitality\n`;
    detail += `- **Moon:** ${birthChart.moon.sign} H${birthChart.moon.house} — emotional nature, inner needs\n`;
    detail += `- **Rising:** ${birthChart.ascendant.sign} — how they meet the world\n`;

    detail += '\n## Personal Planets\n';
    detail += `- Mercury: ${birthChart.mercury.sign} H${birthChart.mercury.house} — mind, communication\n`;
    detail += `- Venus: ${birthChart.venus.sign} H${birthChart.venus.house} — love, values, pleasure\n`;
    detail += `- Mars: ${birthChart.mars.sign} H${birthChart.mars.house} — drive, action, desire\n`;

    detail += '\n## Outer Planets\n';
    detail += `- Jupiter ${birthChart.jupiter.sign} H${birthChart.jupiter.house} · Saturn ${birthChart.saturn.sign} H${birthChart.saturn.house}\n`;
    detail += `- Uranus ${birthChart.uranus.sign} H${birthChart.uranus.house} · Neptune ${birthChart.neptune.sign} H${birthChart.neptune.house} · Pluto ${birthChart.pluto.sign} H${birthChart.pluto.house}\n`;

    detail += '\n## Soul Axis & Wounds\n';
    detail += `- North Node: ${birthChart.northNode.sign} H${birthChart.northNode.house} — growth direction\n`;
    detail += `- South Node: ${birthChart.southNode.sign} H${birthChart.southNode.house} — past patterns\n`;
    detail += `- Chiron: ${birthChart.chiron.sign} H${birthChart.chiron.house} — ${CHIRON_HOUSE_WOUNDS[birthChart.chiron.house] || 'core wound & healing gift'}\n`;
    if (birthChart.lilith) {
      detail += `- Lilith: ${birthChart.lilith.sign} H${birthChart.lilith.house} — primal feminine, shadow\n`;
    }

    // Key aspects (top 5 only — compact)
    if (birthChart.aspects && birthChart.aspects.length > 0) {
      const keyPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'saturn', 'chiron', 'northnode'];
      const significantAspects = birthChart.aspects
        .filter(a => keyPlanets.includes(a.planet1.toLowerCase()) || keyPlanets.includes(a.planet2.toLowerCase()))
        .slice(0, 5);
      if (significantAspects.length > 0) {
        detail += '\n## Key Aspects\n';
        significantAspects.forEach(a => {
          detail += `- ${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}°) — ${getAspectMeaning(a.type)}\n`;
        });
      }
    }

    // Elemental balance (condensed to one line)
    const el = calculateElementalBalance(birthChart);
    const dom = Object.entries(el).sort((a, b) => b[1] - a[1])[0];
    const weak = Object.entries(el).sort((a, b) => a[1] - b[1])[0];
    detail += `\n**Elemental Temperament:** Fire ${el.fire} · Earth ${el.earth} · Air ${el.air} · Water ${el.water} | Dominant: ${dom[0]} · Growth edge: ${weak[0]}\n`;

    if (relevantPatterns.length > 0) {
      detail += '\n**Patterns:**\n';
      relevantPatterns.forEach(p => { detail += `- ${p}\n`; });
    }
  }

  // 2. Mayan profile (condensed — 3 key lines)
  if (mayanProfile) {
    detail += '\n## Mayan Profile\n';
    detail += `- Birth sign: ${mayanProfile.tzolkin.tone} ${mayanProfile.tzolkin.daySign.name} — ${mayanProfile.tzolkin.daySign.meaning}\n`;
    detail += `- Adulthood pillar: ${mayanProfile.pathOfLife.adulthood.tone} ${mayanProfile.pathOfLife.adulthood.daySign.name}\n`;
    detail += `- Life phase: ${mayanProfile.lifeCycleInsight}\n`;
  }

  // 3. Current sky — after personal data so natal identity is prioritised
  detail += '\n## Current Sky\n';
  if (celestialEvents?.currentMoonPhase) {
    const mp = celestialEvents.currentMoonPhase;
    detail += `**Moon:** ${mp.phase} (${mp.illumination}% illuminated) — ${mp.meaning}\n`;
  } else {
    const mp = getMoonPhase();
    detail += `**Moon:** ${mp.phase} (${mp.percentage}% illuminated) — ${mp.meaning}\n`;
  }

  const retrogrades = currentTransits.filter(t => t.retrograde);
  if (retrogrades.length > 0) {
    detail += `**Retrograde:** ${retrogrades.map(p => p.planet).join(', ')}\n`;
  }

  transitHighlights.filter(h => h.relevance === 'high').forEach(h => {
    detail += `- ${h.description}\n`;
  });

  if (birthChart) {
    const approaching = getApproachingTransits(birthChart, currentTransits);
    if (approaching.length > 0) {
      detail += '**Active Transits:**\n';
      approaching.forEach(t => { detail += `- ${t}\n`; });
    }
  }

  if (todaysMayanSign) {
    detail += `**Today's Mayan Day:** ${todaysMayanSign.tone} ${todaysMayanSign.daySign.name} — ${todaysMayanSign.daySign.meaning}\n`;
  }

  // 4. Celestial events
  if (celestialEvents) {
    const eventsSection = formatCelestialEventsSection(celestialEvents);
    if (eventsSection) detail += '\n' + eventsSection;
  }

  // 5. Usage notes (least critical — truncation here is acceptable)
  detail += `\n## Usage\n`;
  detail += `- Regular conversation: don't proactively mention astrology unless asked\n`;
  detail += `- Full assessments: weave astrological insights implicitly\n`;
  detail += `- Explicit requests: share openly and specifically\n`;
  detail += `- Always prioritise their lived experience — astrology is one lens\n`;

  return { header, detail };
}

// ==================== CELESTIAL EVENTS FORMATTING ====================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format celestial events as a system prompt section.
 * Only emits content when there are meaningful events to report.
 */
function formatCelestialEventsSection(events: CelestialEventsSnapshot): string {
  const nearEclipses = events.eclipses.filter(e => Math.abs(e.daysFromNow) <= 45);
  const nearLunations = events.lunations.filter(
    l => (l.type === 'new_moon' || l.type === 'full_moon') && Math.abs(l.daysFromNow) <= 14
  );
  const nearSeasons = events.seasonalMarkers.filter(m => Math.abs(m.daysFromNow) <= 7);
  const nearStations = events.retrogradeStations.filter(s => Math.abs(s.daysFromNow) <= 14);

  const hasMajorEvents = nearEclipses.length > 0 || nearLunations.length > 0 ||
    nearSeasons.length > 0 || nearStations.length > 0;

  if (!hasMajorEvents && !events.eclipseSeasonActive) return '';

  let section = '## Major Celestial Events (FACTUAL \u2014 cite dates exactly as given)\n\n';

  // Eclipse season notice
  if (events.eclipseSeasonActive) {
    section += '**Eclipse Season Active** \u2014 The Sun is near the lunar nodes. Eclipses are possible during this window.\n\n';
  }

  // Eclipses
  if (nearEclipses.length > 0) {
    section += '**Eclipses:**\n';
    for (const eclipse of nearEclipses) {
      const dateStr = eclipse.peakTime.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const timeStr = eclipse.peakTime.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
      });
      const typeLabel = `${capitalize(eclipse.kind)} ${capitalize(eclipse.type)} Eclipse`;
      const proximity = formatProximity(eclipse.daysFromNow);

      section += `- ${typeLabel} in ${eclipse.sign}: ${dateStr} at ${timeStr} (${proximity})\n`;

      if (eclipse.localVisibility) {
        if (eclipse.localVisibility.visible) {
          section += `  - Visible from this member's location (${Math.round((eclipse.localVisibility.localObscuration || 0) * 100)}% obscuration)\n`;
        } else {
          section += `  - NOT visible from this member's location\n`;
        }
      }

      section += `  - Meaning: ${getEclipseMeaning(eclipse)}\n`;
    }
    section += '\n';
  }

  // Exact lunation times
  if (nearLunations.length > 0) {
    section += '**Exact Lunation Times:**\n';
    for (const lun of nearLunations) {
      const label = lun.type === 'new_moon' ? 'New Moon' : 'Full Moon';
      const dateStr = lun.time.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const timeStr = lun.time.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
      });
      const proximity = formatProximity(lun.daysFromNow);

      section += `- ${label} in ${lun.sign}: ${dateStr} at ${timeStr} (${proximity})\n`;
      section += `  - Meaning: ${getLunationMeaning(lun)}\n`;
    }
    section += '\n';
  }

  // Seasonal markers
  if (nearSeasons.length > 0) {
    section += '**Seasonal Markers:**\n';
    for (const marker of nearSeasons) {
      const dateStr = marker.time.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      const proximity = formatProximity(marker.daysFromNow);
      section += `- ${marker.name}: ${dateStr} (${proximity})\n`;
    }
    section += '\n';
  }

  // Retrograde stations
  if (nearStations.length > 0) {
    section += '**Planetary Stations:**\n';
    for (const station of nearStations) {
      const label = station.event === 'station_retrograde'
        ? `${station.planet} stations Retrograde in ${station.sign}`
        : `${station.planet} stations Direct in ${station.sign}`;
      const dateStr = station.approximateDate.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric'
      });
      const proximity = formatProximity(station.daysFromNow);
      section += `- ${label}: ~${dateStr} (${proximity})\n`;
    }
    section += '\n';
  }

  section += 'IMPORTANT: When discussing celestial events, use the EXACT dates listed above. Do NOT guess or approximate dates for eclipses, lunations, or seasonal markers. If asked about an event not listed here, say you are not certain of the exact date rather than guessing.\n\n';

  return section;
}

function formatProximity(daysFromNow: number): string {
  const absDays = Math.abs(Math.round(daysFromNow));
  if (absDays === 0 || Math.abs(daysFromNow) < 0.5) return 'TODAY';
  if (daysFromNow < 0) {
    if (absDays === 1) return 'yesterday';
    return `${absDays} days ago`;
  }
  if (absDays === 1) return 'tomorrow';
  return `in ${absDays} days`;
}

function getEclipseMeaning(eclipse: EclipseEvent): string {
  if (eclipse.type === 'solar') {
    const meanings: Record<string, string> = {
      total: 'Powerful new beginning; old identity structures dissolve to make way for the new. A threshold crossing.',
      annular: 'A ring of fire \u2014 illumination around a hidden center. Something old is framed by something emerging.',
      partial: 'Partial reset \u2014 some aspect of life direction seeks realignment.',
    };
    return meanings[eclipse.kind] || 'Solar eclipse: new beginnings, reset of direction.';
  } else {
    const meanings: Record<string, string> = {
      total: 'Deep emotional culmination; what has been hidden in shadow comes fully into view. Release and revelation.',
      partial: 'Partial emotional release \u2014 some feeling or pattern surfaces for integration.',
      penumbral: 'Subtle emotional shift \u2014 barely perceptible but meaningful. A quiet recalibration beneath awareness.',
    };
    return meanings[eclipse.kind] || 'Lunar eclipse: emotional culmination and release.';
  }
}

function getLunationMeaning(lun: LunationEvent): string {
  const signMeanings: Record<string, string> = {
    Aries: 'initiative, identity, courage',
    Taurus: 'stability, values, embodiment',
    Gemini: 'communication, curiosity, connection',
    Cancer: 'home, nurturing, emotional security',
    Leo: 'creativity, self-expression, heart',
    Virgo: 'service, health, discernment',
    Libra: 'relationships, balance, beauty',
    Scorpio: 'transformation, depth, power',
    Sagittarius: 'meaning, freedom, expansion',
    Capricorn: 'structure, ambition, mastery',
    Aquarius: 'community, innovation, liberation',
    Pisces: 'transcendence, compassion, imagination',
  };
  const signTheme = signMeanings[lun.sign] || '';
  if (lun.type === 'new_moon') {
    return `Seeding intentions around ${signTheme}`;
  }
  return `Culmination and illumination of themes around ${signTheme}`;
}

// ==================== MAYAN & OTHER HELPERS ====================

/**
 * Get the meaning of a Mayan tone (1-13)
 */
function getToneMeaning(tone: number): string {
  const toneMeanings: Record<number, string> = {
    1: 'Unity, beginnings, magnetic attraction',
    2: 'Duality, challenge, polarity',
    3: 'Rhythm, action, movement',
    4: 'Stability, form, foundation',
    5: 'Radiance, empowerment, center',
    6: 'Flow, balance, organic growth',
    7: 'Mystical power, reflection, attunement',
    8: 'Harmony, integrity, modeling',
    9: 'Intention, patience, greater cycles',
    10: 'Manifestation, perfection, producing',
    11: 'Liberation, change, dissolution',
    12: 'Cooperation, dedication, complex stability',
    13: 'Transcendence, presence, cosmic consciousness',
  };
  return toneMeanings[tone] || 'Unknown tone';
}

// ==================== HELPERS ====================

/**
 * Calculate elemental balance from birth chart
 */
function calculateElementalBalance(chart: BirthChart): { fire: number; earth: number; air: number; water: number } {
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };

  // Count elements from main planets
  const planetsToCount = [
    chart.sun, chart.moon, chart.mercury, chart.venus, chart.mars,
    chart.jupiter, chart.saturn, chart.uranus, chart.neptune, chart.pluto
  ];

  planetsToCount.forEach(planet => {
    if (planet?.sign) {
      const element = getElement(planet.sign);
      if (element in counts) {
        counts[element as keyof typeof counts]++;
      }
    }
  });

  return counts;
}

/**
 * Get psychological meaning of an aspect type
 */
function getAspectMeaning(type: string): string {
  const meanings: Record<string, string> = {
    conjunction: 'fusion, intensification',
    opposition: 'polarity, balance through tension',
    trine: 'natural flow, ease',
    square: 'friction that catalyzes growth',
    sextile: 'opportunity, cooperation',
    quincunx: 'adjustment, integration needed',
  };
  return meanings[type] || 'dynamic interaction';
}

/**
 * Calculate current moon phase
 */
function getMoonPhase(): { phase: string; meaning: string; percentage: number } {
  const now = new Date();
  const synodicMonth = 29.53059; // days

  // Known new moon: January 11, 2024
  const knownNewMoon = new Date('2024-01-11T11:57:00Z');
  const daysSinceNewMoon = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = daysSinceNewMoon % synodicMonth;
  const percentage = (moonAge / synodicMonth) * 100;

  let phase: string;
  let meaning: string;

  if (moonAge < 1.85) {
    phase = 'New Moon';
    meaning = 'new beginnings, setting intentions, introspection';
  } else if (moonAge < 7.38) {
    phase = 'Waxing Crescent';
    meaning = 'building momentum, taking first steps, hope';
  } else if (moonAge < 9.23) {
    phase = 'First Quarter';
    meaning = 'action, decisions, overcoming obstacles';
  } else if (moonAge < 14.77) {
    phase = 'Waxing Gibbous';
    meaning = 'refinement, adjustment, almost there';
  } else if (moonAge < 16.61) {
    phase = 'Full Moon';
    meaning = 'culmination, illumination, heightened emotions';
  } else if (moonAge < 22.15) {
    phase = 'Waning Gibbous';
    meaning = 'gratitude, sharing wisdom, release begins';
  } else if (moonAge < 24.00) {
    phase = 'Last Quarter';
    meaning = 'letting go, forgiveness, clearing';
  } else {
    phase = 'Waning Crescent';
    meaning = 'surrender, rest, preparation for renewal';
  }

  return { phase, meaning, percentage: Math.round(percentage) };
}

/**
 * Detect significant approaching transits (next 3 months)
 */
function getApproachingTransits(
  birthChart: BirthChart,
  currentTransits: CurrentTransit[]
): string[] {
  const approaching: string[] = [];

  // Check outer planet transits to personal planets (these are the big ones)
  const outerPlanets = ['Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const personalPoints = [
    { name: 'Sun', pos: birthChart.sun },
    { name: 'Moon', pos: birthChart.moon },
    { name: 'Ascendant', pos: birthChart.ascendant },
    { name: 'Venus', pos: birthChart.venus },
    { name: 'Mars', pos: birthChart.mars },
  ];

  outerPlanets.forEach(outerName => {
    const transit = currentTransits.find(t => t.planet === outerName);
    if (!transit) return;

    const transitDegree = getAbsoluteDegree(transit.sign, transit.degree);

    personalPoints.forEach(personal => {
      if (!personal.pos?.sign) return;
      const natalDegree = getAbsoluteDegree(personal.pos.sign, personal.pos.degree);

      // Check if within 5 degrees (approaching conjunction)
      const diff = Math.abs(transitDegree - natalDegree);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;

      if (normalizedDiff <= 5 && normalizedDiff > 0) {
        const direction = transitDegree < natalDegree ? 'approaching' : 'in effect';
        approaching.push(`${outerName} ${direction} conjunction to natal ${personal.name} - major ${getTransitTheme(outerName)} themes active`);
      }

      // Check opposition (within 5 degrees of 180)
      if (Math.abs(normalizedDiff - 180) <= 5) {
        approaching.push(`${outerName} opposing natal ${personal.name} - ${getTransitTheme(outerName)} tensions surfacing`);
      }

      // Check square (within 5 degrees of 90)
      if (Math.abs(normalizedDiff - 90) <= 5) {
        approaching.push(`${outerName} square natal ${personal.name} - ${getTransitTheme(outerName)} challenges catalyzing growth`);
      }
    });
  });

  return approaching.slice(0, 4); // Limit to most significant
}

/**
 * Get theme for outer planet transits
 */
function getTransitTheme(planet: string): string {
  const themes: Record<string, string> = {
    Saturn: 'maturation, responsibility, restructuring',
    Uranus: 'liberation, awakening, sudden change',
    Neptune: 'dissolution, spirituality, confusion/clarity',
    Pluto: 'transformation, power dynamics, death/rebirth',
  };
  return themes[planet] || 'significant life';
}

function getElement(sign: string): string {
  const fireSign = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

  if (fireSign.includes(sign)) return 'fire';
  if (earthSigns.includes(sign)) return 'earth';
  if (airSigns.includes(sign)) return 'air';
  if (waterSigns.includes(sign)) return 'water';
  return 'unknown';
}

function getAbsoluteDegree(sign: string, degree: number): number {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = signs.indexOf(sign);
  return signIndex * 30 + degree;
}

function isWithinOrb(degree1: number, degree2: number, orb: number): boolean {
  const diff = Math.abs(degree1 - degree2);
  // Handle wraparound (0° and 359° are close)
  const normalizedDiff = diff > 180 ? 360 - diff : diff;
  return normalizedDiff <= orb;
}

/**
 * Check if a topic in the user's message might be astrologically relevant
 * Used to decide whether to emphasize certain patterns
 */
export function detectAstrologicalRelevance(
  message: string,
  context: AstrologyContext
): string[] {
  const relevantInsights: string[] = [];
  const lowerMessage = message.toLowerCase();

  // Communication themes + Mercury retrograde
  if (
    (lowerMessage.includes('communication') ||
      lowerMessage.includes('misunderstand') ||
      lowerMessage.includes("can't explain") ||
      lowerMessage.includes('technology') ||
      lowerMessage.includes('phone') ||
      lowerMessage.includes('computer')) &&
    context.currentTransits.some(t => t.planet === 'Mercury' && t.retrograde)
  ) {
    relevantInsights.push('Mercury is retrograde, which may be amplifying communication challenges');
  }

  // Relationship themes + Venus patterns
  if (
    (lowerMessage.includes('relationship') ||
      lowerMessage.includes('partner') ||
      lowerMessage.includes('love') ||
      lowerMessage.includes('marriage') ||
      lowerMessage.includes('dating')) &&
    context.birthChart
  ) {
    const venus = context.birthChart.venus;
    if (venus.house === 7) {
      relevantInsights.push(`Their Venus in the 7th house suggests relationships are a central theme of their life's work`);
    }
    if (context.birthChart.chiron?.house === 7) {
      relevantInsights.push(`Chiron in their 7th house indicates a core wound around partnership - this is likely a tender area`);
    }
  }

  // Career/achievement themes + Saturn/10th house
  if (
    (lowerMessage.includes('career') ||
      lowerMessage.includes('work') ||
      lowerMessage.includes('job') ||
      lowerMessage.includes('achievement') ||
      lowerMessage.includes('success')) &&
    context.birthChart
  ) {
    if (context.birthChart.saturn?.house === 10) {
      relevantInsights.push('Saturn in their 10th house suggests career is an area of significant growth through challenge');
    }
  }

  // Mayan astrology topics
  if (
    lowerMessage.includes('mayan') ||
    lowerMessage.includes('tzolkin') ||
    lowerMessage.includes('nahual') ||
    lowerMessage.includes('day sign') ||
    lowerMessage.includes('galactic')
  ) {
    if (context.mayanProfile) {
      relevantInsights.push(`Their Mayan birth sign is ${context.mayanProfile.tzolkin.tone} ${context.mayanProfile.tzolkin.daySign.name} - share their complete profile if they ask`);
    }
    if (context.todaysMayanSign) {
      relevantInsights.push(`Today's Mayan energy is ${context.todaysMayanSign.tone} ${context.todaysMayanSign.daySign.name}`);
    }
  }

  // Life phase/transition themes + Mayan pillars
  if (
    (lowerMessage.includes('life phase') ||
      lowerMessage.includes('transition') ||
      lowerMessage.includes('turning point') ||
      lowerMessage.includes('midlife') ||
      lowerMessage.includes('growing up') ||
      lowerMessage.includes('getting older') ||
      lowerMessage.includes('youth') ||
      lowerMessage.includes('future')) &&
    context.mayanProfile
  ) {
    relevantInsights.push(`Their Mayan Path of Life shows three pillars: Youth (${context.mayanProfile.pathOfLife.youth.daySign.name}), Adulthood (${context.mayanProfile.pathOfLife.adulthood.daySign.name}), and Future (${context.mayanProfile.pathOfLife.future.daySign.name}) - ${context.mayanProfile.lifeCycleInsight}`);
  }

  // Purpose/destiny themes + Mayan cardinal direction
  if (
    (lowerMessage.includes('purpose') ||
      lowerMessage.includes('destiny') ||
      lowerMessage.includes('path') ||
      lowerMessage.includes('direction') ||
      lowerMessage.includes('meaning')) &&
    context.mayanProfile
  ) {
    const dir = context.mayanProfile.cardinalDirection;
    relevantInsights.push(`Their Mayan cardinal direction is ${dir.direction} (${dir.color}) - their soul's activity is to ${dir.activity.toLowerCase()}`);
  }

  // Eclipse themes — ground MAIA in factual dates
  if (
    lowerMessage.includes('eclipse') ||
    lowerMessage.includes('blood moon') ||
    lowerMessage.includes('eclipse season')
  ) {
    if (context.celestialEvents) {
      const nearEclipses = context.celestialEvents.eclipses.filter(e => Math.abs(e.daysFromNow) <= 45);
      if (nearEclipses.length > 0) {
        for (const eclipse of nearEclipses) {
          const dateStr = eclipse.peakTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          relevantInsights.push(
            `There is a ${eclipse.kind} ${eclipse.type} eclipse on ${dateStr} in ${eclipse.sign} \u2014 use this exact date, do not guess`
          );
        }
      } else {
        relevantInsights.push(
          'No eclipses in the immediate window. If the member mentions one, acknowledge their experience rather than guessing the date.'
        );
      }
    }
  }

  // Lunation themes (full moon, new moon)
  if (
    lowerMessage.includes('full moon') ||
    lowerMessage.includes('new moon') ||
    lowerMessage.includes('moon phase') ||
    lowerMessage.includes('lunar')
  ) {
    if (context.celestialEvents) {
      const keyLunations = context.celestialEvents.lunations.filter(
        l => (l.type === 'new_moon' || l.type === 'full_moon') && Math.abs(l.daysFromNow) <= 14
      );
      for (const lun of keyLunations) {
        const label = lun.type === 'new_moon' ? 'New Moon' : 'Full Moon';
        const dateStr = lun.time.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        relevantInsights.push(`The nearest ${label} is in ${lun.sign} on ${dateStr}`);
      }
    }
  }

  // Solstice/equinox themes
  if (
    lowerMessage.includes('solstice') ||
    lowerMessage.includes('equinox') ||
    lowerMessage.includes('shortest day') ||
    lowerMessage.includes('longest day')
  ) {
    if (context.celestialEvents) {
      const nearby = context.celestialEvents.seasonalMarkers.filter(m => Math.abs(m.daysFromNow) <= 30);
      for (const marker of nearby) {
        const dateStr = marker.time.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        relevantInsights.push(`${marker.name} falls on ${dateStr}`);
      }
    }
  }

  // Retrograde station themes
  if (
    lowerMessage.includes('retrograde') ||
    lowerMessage.includes('station') ||
    lowerMessage.includes('goes direct') ||
    lowerMessage.includes('turns retrograde')
  ) {
    if (context.celestialEvents) {
      const nearStations = context.celestialEvents.retrogradeStations.filter(s => Math.abs(s.daysFromNow) <= 14);
      for (const station of nearStations) {
        const label = station.event === 'station_retrograde'
          ? `${station.planet} stations retrograde`
          : `${station.planet} stations direct`;
        const dateStr = station.approximateDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        relevantInsights.push(`${label} around ${dateStr} in ${station.sign}`);
      }
    }
  }

  return relevantInsights;
}
