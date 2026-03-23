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
    const _ebo = reportData.elementalBalanceOverview as Record<string, unknown> | undefined;
    const _cpNew = reportData.currentPhase as {
      phase?: string; majorLesson?: string; edge?: string; gifts?: string[]; currentTransits?: string[];
    } | undefined;
    if (_cpNew && _ebo) {
      upsertActiveReportContext(memberId, {
        reportId: row.id,
        generatedAt: String(row.created_at),
        currentPhase: {
          spiralogicPhase: String(_cpNew.phase ?? ''),
          majorLifeLesson: String(_cpNew.majorLesson ?? ''),
          edgeChallenge: String(_cpNew.edge ?? ''),
          emergentGift: String((_cpNew.gifts ?? [])[0] ?? ''),
          activeTransits: (_cpNew.currentTransits as string[]) ?? [],
        },
        elementalBalance: {
          dominantElement: String(_ebo.dominantElement ?? ''),
          underactiveElement: String(_ebo.underactiveElement ?? ''),
          fire: Number(_ebo.fire ?? 0),
          water: Number(_ebo.water ?? 0),
          earth: Number(_ebo.earth ?? 0),
          air: Number(_ebo.air ?? 0),
        },
        nextAction: {
          actions: [],
          watchFor: '',
          journalPrompt: '',
        },
        evolutionDelta: (() => {
          const d = reportData.evolutionDelta as { sinceLastReport?: string; repeatedPatterns?: string[]; emergingStrengths?: string[] } | null | undefined;
          return d ? { sinceLastReport: d.sinceLastReport ?? '', repeatedPatterns: d.repeatedPatterns ?? [], emergingStrengths: d.emergingStrengths ?? [] } : null;
        })(),
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
  // Use month*100+day for clean range comparison — avoids cross-year wrap bugs
  const month = birthDate.getUTCMonth() + 1; // use UTC to match how date string is parsed
  const day = birthDate.getUTCDate();
  const md = month * 100 + day;

  if (md >= 321 && md <= 419) return { sign: 'Aries',       element: 'fire'  };
  if (md >= 420 && md <= 520) return { sign: 'Taurus',      element: 'earth' };
  if (md >= 521 && md <= 620) return { sign: 'Gemini',      element: 'air'   };
  if (md >= 621 && md <= 722) return { sign: 'Cancer',      element: 'water' };
  if (md >= 723 && md <= 822) return { sign: 'Leo',         element: 'fire'  };
  if (md >= 823 && md <= 922) return { sign: 'Virgo',       element: 'earth' };
  if (md >= 923 && md <= 1022) return { sign: 'Libra',      element: 'air'   };
  if (md >= 1023 && md <= 1121) return { sign: 'Scorpio',   element: 'water' };
  if (md >= 1122 && md <= 1221) return { sign: 'Sagittarius', element: 'fire' };
  if (md >= 1222 || md <= 119)  return { sign: 'Capricorn', element: 'earth' };
  if (md >= 120 && md <= 218)   return { sign: 'Aquarius',  element: 'air'   };
  return { sign: 'Pisces', element: 'water' }; // 219–320
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
 * Compute the Ascendant (rising sign) element from birth coordinates and time.
 *
 * Method: Local Sidereal Time → Ascendant ecliptic longitude (Meeus formula)
 * Accurate to within ±2° for most latitudes (excludes extreme polar regions).
 *
 * Returns null if coordinates are outside valid ranges.
 */
function getAscendantElement(
  lat: number,
  lng: number,
  birthDate: Date,
  birthTime: string,
): { element: Elem; sign: string } | null {
  if (lat < -89.9 || lat > 89.9 || lng < -180 || lng > 180) return null;

  const [hourStr, minStr] = birthTime.split(':');
  const hourLocal = parseInt(hourStr, 10) + parseInt(minStr || '0', 10) / 60;

  // Convert local clock time to UT (approximate — no timezone DB, use lng offset)
  // lng offset: each 15° = 1 hour
  const utHour = ((hourLocal - lng / 15) % 24 + 24) % 24;

  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const birthDayUTC = Date.UTC(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
    0, 0, 0,
  );
  const T = (birthDayUTC - j2000) / (1000 * 60 * 60 * 24); // days since J2000.0

  // Greenwich Sidereal Time at 0h UT (degrees)
  const GST0 = ((280.46061837 + 360.98564736629 * T) % 360 + 360) % 360;
  // GST at birth UT
  const GST = ((GST0 + utHour * 15.041069) % 360 + 360) % 360;
  // Local Sidereal Time (degrees)
  const LST = ((GST + lng) % 360 + 360) % 360;

  // Obliquity of ecliptic (simplified, degrees)
  const eps = 23.4393 - 0.0000004 * T;

  const RAmcRad = LST * Math.PI / 180;
  const epsRad = eps * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  // Ascendant ecliptic longitude (Meeus, Astronomical Algorithms §14)
  let ascLon = Math.atan2(
    Math.cos(RAmcRad),
    -(Math.sin(RAmcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad)),
  ) * 180 / Math.PI;
  ascLon = ((ascLon % 360) + 360) % 360;

  const zodiacSigns: [string, Elem][] = [
    ['Aries', 'fire'], ['Taurus', 'earth'], ['Gemini', 'air'], ['Cancer', 'water'],
    ['Leo', 'fire'], ['Virgo', 'earth'], ['Libra', 'air'], ['Scorpio', 'water'],
    ['Sagittarius', 'fire'], ['Capricorn', 'earth'], ['Aquarius', 'air'], ['Pisces', 'water'],
  ];
  const [sign, element] = zodiacSigns[Math.floor(ascLon / 30)];
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
 * Compute weighted elemental distribution.
 *
 * Full model (coordinates present):
 *   Sun 30% · Moon 25% · Ascendant 25% · Time 10% · Remainder 10%
 *
 * Fallback model (no coordinates):
 *   Sun 35% · Moon 30% · Time 20% · Remainder 15%
 */
function computeElementalDistribution(
  sunElement: Elem,
  timeElement: Elem,
  moonElement: Elem,
  ascendantElement?: Elem | null,
): { dist: Record<Elem, number>; mode: 'sun-moon-asc-time' | 'sun-moon-time' } {
  const elements: Elem[] = ['fire', 'water', 'earth', 'air'];
  const dist: Record<Elem, number> = { fire: 0, water: 0, earth: 0, air: 0 };

  const mode = ascendantElement ? 'sun-moon-asc-time' : 'sun-moon-time';

  if (ascendantElement) {
    // Full model
    dist[sunElement]       += 30;
    dist[moonElement]      += 25;
    dist[ascendantElement] += 25;
    dist[timeElement]      += 10;
    // Remaining 10% to any elements with no primary weight
    const weighted = new Set([sunElement, moonElement, ascendantElement, timeElement]);
    const remaining = elements.filter((e) => !weighted.has(e));
    if (remaining.length === 0) {
      dist[sunElement] += 10;
    } else {
      const share = 10 / remaining.length;
      remaining.forEach((e) => { dist[e] += share; });
    }
  } else {
    // Fallback model
    dist[sunElement]  += 35;
    dist[moonElement] += 30;
    dist[timeElement] += 20;
    const weighted = new Set([sunElement, moonElement, timeElement]);
    const remaining = elements.filter((e) => !weighted.has(e));
    if (remaining.length === 0) {
      dist[sunElement] += 15;
    } else {
      const share = 15 / remaining.length;
      remaining.forEach((e) => { dist[e] += share; });
    }
  }

  // Normalise to sum to 100
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  elements.forEach((e) => { dist[e] = Math.round((dist[e] / total) * 100); });
  const sum = Object.values(dist).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    const dominant = elements.reduce((a, b) => (dist[a] > dist[b] ? a : b));
    dist[dominant] += (100 - sum);
  }

  return { dist, mode };
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

const ORACLE_SYSTEM_PROMPT = `You are an oracle-level astrology writer working in the Spiralogic tradition.

Your task is to produce a report that feels:
- mythopoetic but not vague
- intimate but not sentimental
- spiritually intelligent but not inflated
- psychologically deep but not clinical
- beautiful but still structurally clear

The opening sections should feel like a living reading, not a software summary.

Especially in "oracleWelcome" and "memberOverviewStory":
- write as though you are welcoming the reader into a sacred but discerning mirror
- interpret the astrology as lived pattern, not only as technical placement
- make timing matter — show how recurring spirals are shaping the person's present threshold
- ensure the story has movement, not just descriptors

The memberOverviewStory must not sound like a generic personality summary. It must explicitly answer:
- What cycle are they in?
- What spiral is repeating?
- What is this spiral trying to teach?
- What becomes possible if they meet it consciously now?

Never invent random mystical claims that are unsupported by the chart context.
Never use generic phrases like "you are a powerful soul" unless they are concretely earned and made specific.`;

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

  // Ascendant (requires lat + lng)
  const lat = birthData.location?.lat;
  const lng = birthData.location?.lng;
  const ascendantResult =
    lat != null && lng != null
      ? getAscendantElement(lat, lng, birthDate, birthData.time)
      : null;
  const ascendantElement = ascendantResult?.element ?? null;
  const ascendantSign = ascendantResult?.sign ?? null;

  const { dist: elementStrengths, mode: calculationMode } = computeElementalDistribution(
    sunElement,
    timeElement,
    moonElement,
    ascendantElement,
  );
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

  const subjectName = birthData.name ?? 'the member';

  const astrologyContext = `Sun: ${sunSign} (${sunElement}, ${elementStrengths[sunElement]}% elemental weight)
Moon: ${moonSign} (${moonElement}, ${elementStrengths[moonElement]}% elemental weight)
${ascendantSign ? `Ascendant: ${ascendantSign} (${ascendantElement}, strong angular weight)` : 'Ascendant: not calculated (coordinates not provided)'}
Birth time: ${timeLabel}
Elemental distribution — Fire: ${elementStrengths.fire}% | Water: ${elementStrengths.water}% | Earth: ${elementStrengths.earth}% | Air: ${elementStrengths.air}%
Dominant element: ${dominantElement}
Underactive element: ${underactiveElement}
Calculation mode: ${calculationMode}`;

  const spiralogicContext = `Life-cycle transits active now:
${lifeCycleTransits.map((t, i) => `${i + 1}. ${t}`).join('\n')}
${lifeStage ? `\nLife stage provided: ${lifeStage}` : ''}`;

  const narrativeConstraint = `The memberOverviewStory must explicitly answer:
- What cycle are they in?
- What spiral is repeating?
- What is this spiral trying to teach?
- What becomes possible if they meet it consciously now?`;

  const prompt = `You are generating a Spiralogic Evolutionary Report.

Write in a mythopoetic, psychologically precise, astrologically grounded voice. The tone should feel intimate, elegant, spiritually intelligent, and emotionally exact. Avoid generic spiritual clichés, flattery, and vague uplift language. Everything must feel earned by the chart, the timing, and the Spiralogic lens.

The report should echo the beauty and warmth of an oracle reading, but remain structurally clear and grounded in real astrological interpretation.

SUBJECT
Name: ${subjectName}
Birth date: ${birthData.date}
Birth time: ${birthData.time}
Birth location: ${birthData.location?.placeName ?? 'unspecified'}
${birthData.location?.lat != null ? `Latitude: ${birthData.location.lat}` : ''}
${birthData.location?.lng != null ? `Longitude: ${birthData.location.lng}` : ''}
${lifeStage ? `Life stage/context: ${lifeStage}` : ''}

ASTROLOGICAL CONTEXT
${astrologyContext}

SPIRALOGIC CONTEXT
${spiralogicContext}

${deltaPromptSection}

NARRATIVE CONSTRAINT
${narrativeConstraint}

INSTRUCTIONS

1. Begin with "oracleWelcome"
Write 1-2 short paragraphs. This should feel like a beautiful welcome into the reading. Warm, intelligent, intimate. Speak directly to the person.

2. Then write "memberOverviewStory"
This is the most important section. Write 4-7 substantial paragraphs describing the member's astrological walk at this time.
This section must:
- synthesize natal pattern, current transits, life phase, and Spiralogic elemental development
- describe the spirals currently active in the person's life across identity, relationships, work, embodiment, and soul growth
- name tensions, thresholds, gifts, and what is ripening now
- feel literary and beautiful, but still precise
- make the person feel deeply seen without becoming vague or inflated

3. Write "currentPhase" — Describe the person's current Spiralogic phase and why it is activated now.

4. Write "soulsJourney" — The arc: where they are (stateOfBeing), where they are moving (stateOfBecoming), and how (bridge).

5. Write "elementalMapping" — Generate 4-5 facet interpretations rooted in the Spiralogic system. Each facet should correspond to a life domain (e.g. Identity/Will, Relationships/Depth, Vocation/Form, Mind/Expression, Soul/Integration). Use the computed elemental strengths to weight the interpretation.

6. Write "karmicSignatures" — Return 2-4 key karmic or archetypal themes grounded in the natal signature.

7. Write "timelineForecast" — Return 3-5 time windows (e.g. "Now – 3 months", "3–6 months", "6–12 months") showing likely developmental themes and opportunities.

8. Write "integrationPractices" — Return 4-6 grounded, elegant practices for embodiment and alignment. Make them specific to this chart, not generic.

STYLE RULES
- Prioritize narrative coherence over category dumping
- Use evocative but readable language
- Do not repeat the same idea in multiple sections
- Do not overuse metaphors
- Avoid melodrama
- Be psychologically mature and symbolically rich
- Keep the language alive, but not overwrought
- Make the Member Overview Story the narrative heart of the report

OUTPUT RULES
- Return valid JSON only
- Do not include markdown fences
- Do not include commentary outside the JSON
- Match this exact structure:

{
  "title": "<evocative report title for ${subjectName}>",
  "subjectName": "${subjectName}",
  "generatedAt": "${new Date().toISOString()}",
  "oracleWelcome": "<1-2 welcoming paragraphs — warm, intelligent, direct address to the reader>",
  "memberOverviewStory": "<4-7 paragraphs: the narrative heart — cycle, spiral, teaching, threshold, what is ripening now>",
  "currentPhase": {
    "element": "${dominantElement}",
    "phase": "<Spiralogic phase name that resonates with the active life-cycle transits>",
    "title": "<evocative phase title>",
    "summary": "<2-3 sentence summary of what this phase means for this person right now>",
    "majorLesson": "<one clear sentence: the core growth edge from the active transits>",
    "edge": "<what is specifically being asked of a ${dominantElement}-dominant ${sunSign} person in this phase>",
    "gifts": ["<gift 1>", "<gift 2>", "<gift 3>"],
    "currentTransits": ${JSON.stringify(lifeCycleTransits)}
  },
  "soulsJourney": {
    "stateOfBeing": "<where they are now — present condition, pattern, ground>",
    "stateOfBecoming": "<where they are moving — direction, integration, emergence>",
    "bridge": "<the specific threshold or practice that connects being to becoming>"
  },
  "elementalMapping": [
    {
      "facetKey": "identity",
      "facetName": "Identity & Will",
      "element": "<element name capitalized>",
      "phase": "<Spiralogic phase>",
      "archetype": "<archetype for this facet>",
      "natalSignature": "<what the natal chart shows in this domain>",
      "currentActivation": "<what is active or stirring in this domain right now>",
      "growthEdge": "<what is being asked of them in this domain>",
      "gifts": ["<gift 1>", "<gift 2>"],
      "practices": ["<practice 1>", "<practice 2>"]
    },
    {
      "facetKey": "relationships",
      "facetName": "Relationships & Depth",
      "element": "<element>",
      "phase": "<phase>",
      "archetype": "<archetype>",
      "natalSignature": "<natal pattern>",
      "currentActivation": "<current activation>",
      "growthEdge": "<growth edge>",
      "gifts": ["<gift 1>", "<gift 2>"],
      "practices": ["<practice 1>", "<practice 2>"]
    },
    {
      "facetKey": "vocation",
      "facetName": "Vocation & Form",
      "element": "<element>",
      "phase": "<phase>",
      "archetype": "<archetype>",
      "natalSignature": "<natal pattern>",
      "currentActivation": "<current activation>",
      "growthEdge": "<growth edge>",
      "gifts": ["<gift 1>", "<gift 2>"],
      "practices": ["<practice 1>", "<practice 2>"]
    },
    {
      "facetKey": "mind",
      "facetName": "Mind & Expression",
      "element": "<element>",
      "phase": "<phase>",
      "archetype": "<archetype>",
      "natalSignature": "<natal pattern>",
      "currentActivation": "<current activation>",
      "growthEdge": "<growth edge>",
      "gifts": ["<gift 1>", "<gift 2>"],
      "practices": ["<practice 1>", "<practice 2>"]
    },
    {
      "facetKey": "soul",
      "facetName": "Soul & Integration",
      "element": "<element>",
      "phase": "<phase>",
      "archetype": "<archetype>",
      "natalSignature": "<natal pattern>",
      "currentActivation": "<current activation>",
      "growthEdge": "<growth edge>",
      "gifts": ["<gift 1>", "<gift 2>"],
      "practices": ["<practice 1>", "<practice 2>"]
    }
  ],
  "karmicSignatures": [
    {
      "title": "<karmic theme title>",
      "description": "<2-3 sentence description grounded in natal signature>",
      "lesson": "<the evolutionary invitation>"
    }
  ],
  "timelineForecast": [
    {
      "window": "Now – 3 months",
      "theme": "<theme title>",
      "interpretation": "<what is happening in this window for this chart>",
      "opportunity": "<what to move toward>",
      "caution": "<what to watch for>"
    },
    {
      "window": "3–6 months",
      "theme": "<theme>",
      "interpretation": "<interpretation>",
      "opportunity": "<opportunity>",
      "caution": "<caution>"
    },
    {
      "window": "6–12 months",
      "theme": "<theme>",
      "interpretation": "<interpretation>",
      "opportunity": "<opportunity>",
      "caution": "<caution>"
    }
  ],
  "integrationPractices": [
    {
      "title": "<practice title>",
      "description": "<description — specific to this chart>",
      "frequency": "<optional: daily/weekly/as needed>"
    }
  ],
  "evolutionDelta": ${priorReport ? `{
    "sinceLastReport": "<1-2 sentences: most meaningful change or continuity since prior report>",
    "repeatedPatterns": ["<recurring pattern>"],
    "emergingStrengths": ["<growing integration or capacity>"]
  }` : 'null'}
}`;

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 12000,
    system: ORACLE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  // Inject server-computed chart signature as authoritative QA anchor
  // (not AI-generated — values come directly from the computation above)
  parsed.chartSignature = {
    sunSign,
    sunElement,
    moonSign,
    moonElement,
    timeElement,
    ascendantSign: ascendantSign ?? null,
    ascendantElement: ascendantElement ?? null,
    calculationMode,
    elementalDistribution: elementStrengths,
  };

  // Inject server-computed elemental balance overview
  parsed.elementalBalanceOverview = {
    fire: elementStrengths.fire,
    water: elementStrengths.water,
    earth: elementStrengths.earth,
    air: elementStrengths.air,
    dominantElement,
    underactiveElement,
    calculationMode,
    ...(ascendantSign ? { ascendantSign, ascendantElement } : {}),
    balanceSummary: `${elementStrengths[dominantElement]}% ${dominantElement} dominant with ${elementStrengths[underactiveElement]}% ${underactiveElement} as the developmental edge`,
  };

  return parsed;
}
