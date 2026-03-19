export const dynamic = 'force-dynamic';
/**
 * Spiralogic Evolutionary Report API
 *
 * POST /api/spiralogic-report          — generate a report for the authenticated member
 * GET  /api/spiralogic-report          — list the member's reports (history)
 *
 * Auth: getMemberIdFromRequest (x-member-id header or memberId cookie)
 * DB:   lib/db/postgres.ts
 * PDF:  NOT generated here; see /api/spiralogic-report/[reportId]/download
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { upsertActiveReportContext, type ActiveReportContext } from '@/lib/consciousness/spiralStatePersistence';

// ---------------------------------------------------------------------------
// Types (mirrors spiralogicAstrologyService.ts SpiralogicReport)
// ---------------------------------------------------------------------------

export interface SpiralogicBirthData {
  date: string;       // ISO date string, e.g. "1990-06-15"
  time: string;       // HH:MM
  location: {
    lat?: number;
    lng?: number;
    timezone?: string;
    placeName?: string;
  };
  name?: string;
}

// ---------------------------------------------------------------------------
// POST — generate report
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    birthData: SpiralogicBirthData;
    practitionerId?: string;
    lifeStage?: string;
    personalityNotes?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { birthData, practitionerId, lifeStage, personalityNotes } = body;

  if (!birthData?.date || !birthData?.time) {
    return NextResponse.json(
      { error: 'birthData.date and birthData.time are required' },
      { status: 400 },
    );
  }

  // Load prior report for delta comparison (nullable — fine if none exists)
  let priorReport: Record<string, unknown> | null = null;
  try {
    const priorResult = await query(
      `SELECT report_data FROM spiralogic_reports
       WHERE member_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [memberId],
    );
    if (priorResult.rows.length > 0) {
      priorReport = priorResult.rows[0].report_data;
    }
  } catch {
    // non-fatal — delta generation degrades gracefully
  }

  // Build the report data using the existing Spiralogic narrative engine.
  // The _backend astrology service is an Express service that uses swisseph —
  // not importable server-side in Next.js without the native binary.
  // We produce the structure that matches SpiralogicReport from the type file
  // via a lightweight AI-backed generator so the UI has real content.
  let reportData: Record<string, unknown>;
  try {
    reportData = await generateSpiralogicReportData({
      memberId,
      birthData,
      lifeStage,
      personalityNotes: personalityNotes ?? [],
      priorReport,
    });
  } catch (err) {
    console.error('[spiralogic-report] generation error:', err);
    return NextResponse.json(
      { error: 'Report generation failed', detail: String(err) },
      { status: 500 },
    );
  }

  // Persist
  try {
    const result = await query(
      `INSERT INTO spiralogic_reports (member_id, practitioner_id, birth_data, report_data)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [
        memberId,
        practitionerId ?? null,
        JSON.stringify(birthData),
        JSON.stringify(reportData),
      ],
    );

    const row = result.rows[0];

    // Fire-and-forget: write active report context snapshot to member_spiral_state
    // reportData is Record<string, unknown> — cast through unknown to satisfy the type
    const _ebo = reportData.elementalBalanceOverview as Record<string, unknown> | undefined;
    const _cp = reportData.currentPhase as ActiveReportContext['currentPhase'] | undefined;
    const _na = reportData.nextAction as ActiveReportContext['nextAction'] | undefined;
    if (_cp && _ebo && _na) {
      const _delta = reportData.evolutionDelta as { sinceLastReport: string; repeatedPatterns: string[]; emergingStrengths: string[]; decompensatingPatterns?: string[] } | null | undefined;
      upsertActiveReportContext(memberId, {
        reportId: row.id,
        generatedAt: String(row.created_at),
        currentPhase: _cp,
        elementalBalance: {
          dominantElement: String(_ebo.dominantElement ?? ''),
          underactiveElement: String(_ebo.underactiveElement ?? ''),
          fire: Number(_ebo.fire ?? 0),
          water: Number(_ebo.water ?? 0),
          earth: Number(_ebo.earth ?? 0),
          air: Number(_ebo.air ?? 0),
        },
        nextAction: _na,
        evolutionDelta: _delta
          ? {
              sinceLastReport: _delta.sinceLastReport,
              repeatedPatterns: _delta.repeatedPatterns ?? [],
              emergingStrengths: _delta.emergingStrengths ?? [],
            }
          : null,
      }).catch((err) => console.error('[spiralogic] activeReportContext upsert failed (non-fatal):', err));
    }

    return NextResponse.json({
      success: true,
      reportId: row.id,
      createdAt: row.created_at,
      report: reportData,
    });
  } catch (err) {
    console.error('[spiralogic-report] DB persist error:', err);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET — history
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT id, birth_data, created_at,
              report_data->>'beingArchetype'   AS being_archetype,
              report_data->>'becomingArchetype' AS becoming_archetype
       FROM spiralogic_reports
       WHERE member_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [memberId],
    );

    return NextResponse.json({
      success: true,
      reports: result.rows.map((r) => ({
        id: r.id,
        birthData: r.birth_data,
        createdAt: r.created_at,
        beingArchetype: r.being_archetype,
        becomingArchetype: r.becoming_archetype,
      })),
    });
  } catch (err) {
    console.error('[spiralogic-report] history error:', err);
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Astrological helpers + report generation
// ---------------------------------------------------------------------------

type Elem = 'fire' | 'water' | 'earth' | 'air';

/**
 * Derive the Sun sign element from a birth date using tropical zodiac boundaries.
 * Returns the element (fire/water/earth/air) and the sign name.
 */
function getSunSignElement(birthDate: Date): { element: Elem; sign: string } {
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();

  // [sign, startMonth, startDay, element]
  const signs: [string, number, number, Elem][] = [
    ['Aries',       3, 21, 'fire'],
    ['Taurus',      4, 20, 'earth'],
    ['Gemini',      5, 21, 'air'],
    ['Cancer',      6, 21, 'water'],
    ['Leo',         7, 23, 'fire'],
    ['Virgo',       8, 23, 'earth'],
    ['Libra',       9, 23, 'air'],
    ['Scorpio',    10, 23, 'water'],
    ['Sagittarius',11, 22, 'fire'],
    ['Capricorn',  12, 22, 'earth'],
    ['Aquarius',    1, 20, 'air'],
    ['Pisces',      2, 19, 'water'],
  ];

  // Walk signs in reverse to find which one the date falls into
  for (let i = signs.length - 1; i >= 0; i--) {
    const [sign, sMonth, sDay, element] = signs[i];
    if (month > sMonth || (month === sMonth && day >= sDay)) {
      return { element, sign };
    }
  }
  // Jan 1–19 falls in Capricorn
  return { element: 'earth', sign: 'Capricorn' };
}

/**
 * Approximate Moon sign from birth date using simplified lunar position.
 * Accurate to ±1 sign for most dates — sufficient for elemental classification.
 *
 * Reference: J2000.0 epoch (Jan 1.5, 2000 UT), Moon longitude ≈ 218.3°
 * Moon mean motion: 13.17639648°/day
 */
function getMoonSignElement(birthDate: Date, birthTime: string): { element: Elem; sign: string } {
  const [hourStr, minStr] = birthTime.split(':');
  const hour = parseInt(hourStr, 10) + parseInt(minStr || '0', 10) / 60;

  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const birthUTC = Date.UTC(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
    Math.floor(hour),
    Math.round((hour % 1) * 60),
    0,
  );
  const daysSinceJ2000 = (birthUTC - j2000) / (1000 * 60 * 60 * 24);

  // Moon mean longitude (simplified, no perturbations)
  const moonLon = ((218.3 + 13.17639648 * daysSinceJ2000) % 360 + 360) % 360;

  // Map degrees to zodiac sign (30° each starting at Aries 0°)
  const signIndex = Math.floor(moonLon / 30);
  const zodiacSigns: [string, Elem][] = [
    ['Aries', 'fire'], ['Taurus', 'earth'], ['Gemini', 'air'], ['Cancer', 'water'],
    ['Leo', 'fire'], ['Virgo', 'earth'], ['Libra', 'air'], ['Scorpio', 'water'],
    ['Sagittarius', 'fire'], ['Capricorn', 'earth'], ['Aquarius', 'air'], ['Pisces', 'water'],
  ];
  const [sign, element] = zodiacSigns[signIndex];
  return { element, sign };
}

/**
 * Derive a rough diurnal quadrant from birth time (HH:MM).
 * Returns the element boosted by this time-of-day and a human label.
 */
function getTimeQuadrant(birthTime: string): { element: Elem; label: string } {
  const [hourStr] = birthTime.split(':');
  const hour = parseInt(hourStr, 10);
  if (hour >= 6 && hour < 12)  return { element: 'fire',  label: 'Born at dawn/morning — fire/will emphasis' };
  if (hour >= 12 && hour < 18) return { element: 'earth', label: 'Born at midday/afternoon — earth/form emphasis' };
  if (hour >= 18 && hour < 24) return { element: 'air',   label: 'Born at dusk/evening — air/mind emphasis' };
  return { element: 'water', label: 'Born at night/pre-dawn — water/depth emphasis' };
}

/**
 * Compute weighted elemental distribution:
 * Sun sign element → 35%, Moon sign element → 30%, time quadrant element → 20%,
 * remaining 15% spread equally across remaining elements.
 */
function computeElementalDistribution(
  sunElement: Elem,
  timeElement: Elem,
  moonElement: Elem,
): Record<Elem, number> {
  const elements: Elem[] = ['fire', 'water', 'earth', 'air'];
  const dist: Record<Elem, number> = { fire: 0, water: 0, earth: 0, air: 0 };

  dist[sunElement] += 35;
  dist[moonElement] += 30;
  dist[timeElement] += 20;

  // Spread remaining 15% across elements that received no primary weight
  const weighted = new Set([sunElement, moonElement, timeElement]);
  const remaining = elements.filter((e) => !weighted.has(e));
  if (remaining.length === 0) {
    // All three factors land on already-weighted elements — add 15% to sun
    dist[sunElement] += 15;
  } else {
    const share = 15 / remaining.length;
    remaining.forEach((e) => { dist[e] += share; });
  }

  // Normalise to sum to 100
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  elements.forEach((e) => { dist[e] = Math.round((dist[e] / total) * 100); });

  // Correct any rounding drift so the sum is exactly 100
  const sum = Object.values(dist).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    const dominant = elements.reduce((a, b) => (dist[a] > dist[b] ? a : b));
    dist[dominant] += (100 - sum);
  }

  return dist;
}

/**
 * Compute likely life-cycle transits from age.
 */
function computeLifeCycleTransits(birthDate: Date): string[] {
  const now = new Date();
  const age = now.getFullYear() - birthDate.getFullYear() -
    (now < new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);

  const transits: string[] = [];

  // Saturn return
  if (age >= 27 && age <= 31) transits.push(`Saturn Return (age ~29) — structures, career, and identity consolidation are under direct pressure`);
  if (age >= 56 && age <= 60) transits.push(`Second Saturn Return (age ~58) — legacy, authority, and life purpose are in focus`);

  // Chiron return
  if (age >= 48 && age <= 52) transits.push(`Chiron Return (age ~50) — the core wound surfaces for integration, not just management`);

  // Uranus opposition
  if (age >= 40 && age <= 44) transits.push(`Uranus Opposition (age ~42) — disruption of the established self; authentic re-orientation is the invitation`);

  // Pluto square (approximated for post-1940 generations)
  if (age >= 36 && age <= 42) transits.push(`Pluto Square natal Pluto (~age 36-42 for this generation) — compulsive transformation; shadow material demands integration`);

  // Jupiter returns
  const jupiterReturnAges = [12, 24, 36, 48, 60, 72];
  jupiterReturnAges.forEach((jAge) => {
    if (age >= jAge - 1 && age <= jAge + 1) {
      transits.push(`Jupiter Return (age ~${jAge}) — expansion, vision, and renewed sense of purpose are available`);
    }
  });

  // North Node return (~18.6 year cycle)
  const nodeReturnAges = [18, 37, 56];
  nodeReturnAges.forEach((nAge) => {
    if (age >= nAge - 1 && age <= nAge + 1) {
      transits.push(`Nodal Return (age ~${nAge}) — soul-level course correction; old patterns release more easily now`);
    }
  });

  if (transits.length === 0) {
    transits.push(`No major life-cycle return is exact right now — this is a consolidation or integration phase between peaks`);
  }

  return transits;
}

// ---------------------------------------------------------------------------
// Internal: build report data
// Uses Claude (Anthropic) for narrative generation aligned with Spiralogic
// Returns a structure matching SpiralogicReport from spiralogicAstrologyService.ts
// ---------------------------------------------------------------------------

async function generateSpiralogicReportData(opts: {
  memberId: string;
  birthData: SpiralogicBirthData;
  lifeStage?: string;
  personalityNotes: string[];
  priorReport?: Record<string, unknown> | null;
}): Promise<Record<string, unknown>> {
  const { birthData, lifeStage, personalityNotes, priorReport } = opts;

  const birthDate = new Date(birthData.date);
  const { element: sunElement, sign: sunSign } = getSunSignElement(birthDate);
  const { element: moonElement, sign: moonSign } = getMoonSignElement(birthDate, birthData.time);
  const { element: timeElement, label: timeLabel } = getTimeQuadrant(birthData.time);
  const elementStrengths = computeElementalDistribution(sunElement, timeElement, moonElement);
  const lifeCycleTransits = computeLifeCycleTransits(birthDate);

  // Identify dominant and underactive elements
  const elements: Elem[] = ['fire', 'water', 'earth', 'air'];
  const dominantElement = elements.reduce((a, b) => elementStrengths[a] > elementStrengths[b] ? a : b);
  const underactiveElement = elements.reduce((a, b) => elementStrengths[a] < elementStrengths[b] ? a : b);

  const contextNote = [
    lifeStage ? `Life stage: ${lifeStage}.` : '',
    personalityNotes.length > 0 ? `Notes: ${personalityNotes.join(', ')}.` : '',
  ].filter(Boolean).join(' ');

  // Extract comparison fields from prior report (handle missing fields gracefully)
  const priorPhase = (priorReport?.currentPhase as any)?.spiralogicPhase ?? null;
  const priorDominant = (priorReport?.elementalBalanceOverview as any)?.dominantElement ?? null;
  const priorUnderactive = (priorReport?.elementalBalanceOverview as any)?.underactiveElement ?? null;
  const priorTransits = (priorReport?.currentPhase as any)?.activeTransits ?? [];
  const priorLesson = (priorReport?.currentPhase as any)?.majorLifeLesson ?? null;

  const deltaPromptSection = priorReport
    ? `
## Prior Report Context (for Evolution Delta)
Previous Phase: ${priorPhase ?? 'no prior report'}
Previous Dominant Element: ${priorDominant ?? 'unknown'}
Previous Underactive Element: ${priorUnderactive ?? 'unknown'}
Previous Major Life Lesson: ${priorLesson ?? 'unknown'}
Previous Active Transits: ${priorTransits.length > 0 ? priorTransits.join('; ') : 'none recorded'}

Current vs Prior Element Shift:
- Dominant: ${priorDominant} → ${dominantElement} (${priorDominant === dominantElement ? 'stable' : 'shifted'})
- Underactive: ${priorUnderactive} → ${underactiveElement} (${priorUnderactive === underactiveElement ? 'stable' : 'shifted'})
- Phase: ${priorPhase} → active now

For "evolutionDelta": compare the prior and current data above. Be conservative — do not overclaim change from limited evidence. Use hedged language like "early signals suggest...", "a pattern may be recurring...", "this appears to be stabilising...". Focus only on what the structured data clearly supports.
`
    : '';

  // Build report using Claude
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are the Spiralogic Evolutionary Report engine. Generate a deeply personalized report in JSON.

## Chart Signature (PRIMARY — all interpretations must reference this)
Sun sign: ${sunSign} → Sun element: ${sunElement} (35% weight)
Moon sign: ${moonSign} → Moon element: ${moonElement} (30% weight)
Birth time context: ${timeLabel} (20% weight)
Remainder spread equally across other elements (15%)
Name: ${birthData.name ?? 'the member'}
Birth date: ${birthData.date}
Birth time: ${birthData.time}
Location: ${birthData.location.placeName ?? 'unspecified'}
${contextNote}

## Computed Elemental Distribution (chart-grounded, not seasonal)
Fire: ${elementStrengths.fire}%
Water: ${elementStrengths.water}%
Earth: ${elementStrengths.earth}%
Air: ${elementStrengths.air}%
Dominant element: ${dominantElement}
Underactive element: ${underactiveElement}

## Life-Cycle Transits (compute from birth year — these are real timing signals)
${lifeCycleTransits.map((t, i) => `${i + 1}. ${t}`).join('\n')}

${deltaPromptSection}## Specificity Requirement
CRITICAL: Do not write generic advice. Every interpretation, challenge, gift, practice, and action must be grounded in this chart's actual elemental signature. A ${dominantElement}-dominant ${sunSign} person has specific patterns — name them precisely. The "nextAction" section must make different recommendations than it would for a person with different dominant elements or life-cycle phase.

For currentPhase.activeTransits: use ONLY the life-cycle transits listed above. Do not fabricate generic transit language. Reference the specific transit descriptions provided.

For nextAction: A ${dominantElement}-dominant person in their current life-cycle phase gets different actions than any other combination. Make these actions concrete, embodied, and specific to ${dominantElement} energy and the transits above.

Return ONLY valid JSON matching this exact structure (no markdown, no commentary):
{
  "userId": "member",
  "birthChartId": "generated",
  "personalOverview": "<2-3 sentence soul narrative grounded in ${sunSign} Sun and ${dominantElement} dominance>",
  "beingArchetype": "<short archetype name that reflects ${sunSign} and ${dominantElement} nature, e.g. 'The Scorpio Depth-Keeper'>",
  "becomingArchetype": "<short archetype name for evolutionary direction toward ${underactiveElement} integration>",
  "elementalInsights": {
    "fire": {
      "element": "Fire",
      "strength": ${elementStrengths.fire},
      "planets": [],
      "interpretation": "<2 sentences about fire in THIS chart — reference ${sunSign} and the ${elementStrengths.fire}% weight specifically>",
      "challenges": ["<challenge specific to fire at ${elementStrengths.fire}%>", "<second challenge>"],
      "gifts": ["<gift specific to this fire level>", "<second gift>"],
      "practices": ["<practice for ${elementStrengths.fire}% fire>", "<second practice>"]
    },
    "water": {
      "element": "Water",
      "strength": ${elementStrengths.water},
      "planets": [],
      "interpretation": "<2 sentences about water in THIS chart — reference the ${elementStrengths.water}% weight>",
      "challenges": ["<challenge specific to water at ${elementStrengths.water}%>", "<second challenge>"],
      "gifts": ["<gift specific to this water level>", "<second gift>"],
      "practices": ["<practice for ${elementStrengths.water}% water>", "<second practice>"]
    },
    "earth": {
      "element": "Earth",
      "strength": ${elementStrengths.earth},
      "planets": [],
      "interpretation": "<2 sentences about earth in THIS chart — reference the ${elementStrengths.earth}% weight>",
      "challenges": ["<challenge specific to earth at ${elementStrengths.earth}%>", "<second challenge>"],
      "gifts": ["<gift specific to this earth level>", "<second gift>"],
      "practices": ["<practice for ${elementStrengths.earth}% earth>", "<second practice>"]
    },
    "air": {
      "element": "Air",
      "strength": ${elementStrengths.air},
      "planets": [],
      "interpretation": "<2 sentences about air in THIS chart — reference the ${elementStrengths.air}% weight>",
      "challenges": ["<challenge specific to air at ${elementStrengths.air}%>", "<second challenge>"],
      "gifts": ["<gift specific to this air level>", "<second gift>"],
      "practices": ["<practice for ${elementStrengths.air}% air>", "<second practice>"]
    }
  },
  "karmicAxis": {
    "northNode": {
      "placement": { "planet": "North Node", "sign": "", "house": 0, "degree": 0, "retrograde": false },
      "interpretation": "<2 sentences on evolutionary direction — integrate ${underactiveElement} themes>",
      "lessons": ["<lesson 1>", "<lesson 2>"],
      "evolutionary_direction": "<one-liner>"
    },
    "southNode": {
      "placement": { "planet": "South Node", "sign": "", "house": 0, "degree": 0, "retrograde": false },
      "interpretation": "<2 sentences on innate gifts — reference ${sunSign} and ${dominantElement} comfort patterns>",
      "lessons": ["<lesson 1>"],
      "evolutionary_direction": "<one-liner>"
    },
    "saturn": {
      "placement": { "planet": "Saturn", "sign": "", "house": 0, "degree": 0, "retrograde": false },
      "interpretation": "<2 sentences on path of mastery — connect to dominant element and life-cycle transits>",
      "lessons": ["<lesson 1>"],
      "evolutionary_direction": "<one-liner>"
    },
    "pluto": {
      "placement": { "planet": "Pluto", "sign": "", "house": 0, "degree": 0, "retrograde": false },
      "interpretation": "<2 sentences on deepest transformation — reference generational Pluto placement for birth year ${birthDate.getFullYear()}>",
      "lessons": ["<lesson 1>"],
      "evolutionary_direction": "<one-liner>"
    }
  },
  "currentPhase": {
    "spiralogicPhase": "<name the active Spiralogic phase that resonates with the life-cycle transits above — e.g. 'Water 2 — Death and Rebirth' for a Saturn Return>",
    "activeTransits": ${JSON.stringify(lifeCycleTransits)},
    "majorLifeLesson": "<one clear sentence naming the core growth edge from the active life-cycle transit(s) above>",
    "edgeChallenge": "<what is specifically being asked of a ${dominantElement}-dominant ${sunSign} person in this phase>",
    "emergentGift": "<what is being unlocked — name it in terms of ${dominantElement} and ${underactiveElement} integration>"
  },
  "reflectiveProtocols": [
    {
      "name": "<ritual name grounded in ${dominantElement}>",
      "element": "${dominantElement}",
      "description": "<one-sentence description specific to ${dominantElement} at ${elementStrengths[dominantElement]}%>",
      "steps": ["<step 1>", "<step 2>", "<step 3>"],
      "timing": "<timing that suits ${dominantElement} energy>"
    },
    {
      "name": "<ritual name that develops ${underactiveElement}>",
      "element": "${underactiveElement}",
      "description": "<one-sentence description that builds ${underactiveElement} capacity for this chart>",
      "steps": ["<step 1>", "<step 2>"],
      "timing": "<timing>"
    }
  ],
  "elementalBalanceOverview": {
    "fire": ${elementStrengths.fire},
    "water": ${elementStrengths.water},
    "earth": ${elementStrengths.earth},
    "air": ${elementStrengths.air},
    "dominantElement": "${dominantElement}",
    "underactiveElement": "${underactiveElement}",
    "balanceSummary": "<one sentence: what does a ${elementStrengths[dominantElement]}% ${dominantElement} / ${elementStrengths[underactiveElement]}% ${underactiveElement} signature mean for how this person moves through life>"
  },
  "nextAction": {
    "actions": [
      "<concrete first action this week — must be specific to ${dominantElement} energy and the current transit(s); not generic self-help>",
      "<second action — reflective or relational, grounded in ${sunSign} and current life-cycle phase>",
      "<third action — 30-day commitment to develop ${underactiveElement} capacity in a way authentic to this chart>"
    ],
    "watchFor": "<one clear shadow tendency specific to ${dominantElement}-dominant ${sunSign} people in this life-cycle phase>",
    "journalPrompt": "<one open-ended question that a ${sunSign}/${dominantElement}-dominant person in this transit phase would genuinely benefit from sitting with>"
  },
  "evolutionDelta": ${priorReport ? `{
    "sinceLastReport": "<1-2 sentences summarising the most meaningful change or continuity since the prior report — be specific about what shifted or held>",
    "repeatedPatterns": ["<pattern that appears in both reports>"],
    "emergingStrengths": ["<something showing more integration or capacity than before>"],
    "decompensatingPatterns": ["<something showing less coherence or more reactivity — omit array if nothing is clear>"]
  }` : 'null'},
  "generatedAt": "${new Date().toISOString()}"
}`;

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed;
}
