/**
 * Spiralogic Evolutionary Report Generator
 *
 * Orchestrates birth chart engines, builds a rich prompt, calls Claude,
 * and assembles the structured SpiralogicEvolutionaryReportData.
 *
 * Design principles:
 * - Fire-and-forget is NOT used here — the report IS the response.
 * - Graceful fallback: if Claude fails, template text fills all narrative fields.
 * - No conversation content stored — only structural / archetypal data.
 */

import Anthropic from '@anthropic-ai/sdk';
import { runBirthChartEngine } from './engines/birthChartEngine';
import { runSpiralogicEngine, type SpiralogicEngineResult } from './engines/spiralogicEngine';
import { runTransitsEngine, type TransitsEngineResult } from './engines/transitsEngine';
import { runLifeCyclesEngine, type LifeCyclesEngineResult } from './engines/lifeCyclesEngine';
import { parseAstrologyIntake } from './parseAstrologyIntake';
import { SPIRALOGIC_FACETS } from './spiralogicMapping';
import type { BirthChart } from './ephemerisCalculator';
import type { BirthChartEngineResult } from './engines/birthChartEngine';
import type {
  SpiralogicEvolutionaryReportData,
  SpiralogicFacetReport,
  ElementReport,
  KarmicInsights,
  CurrentPhaseInsight,
  ElementalBalanceInsight,
} from './spiralogicReportTypes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ELEMENT_ORDER: Array<'fire' | 'water' | 'earth' | 'air'> = ['fire', 'water', 'earth', 'air'];

const ELEMENT_META: Record<string, { subtitle: string; emoji: string; houses: number[] }> = {
  fire: { subtitle: 'Vision, Activation, and Willpower', emoji: '🔥', houses: [1, 5, 9] },
  water: { subtitle: 'Emotional Depth, Healing, and Flow', emoji: '💧', houses: [4, 8, 12] },
  earth: { subtitle: 'Stability, Manifestation, and Purpose', emoji: '🌍', houses: [10, 2, 6] },
  air: { subtitle: 'Thought, Communication, and Connection', emoji: '🌬', houses: [7, 11, 3] },
};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface BirthInput {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  lat: number;
  lng: number;
  locationName: string;
  timezone: string;
}

// ---------------------------------------------------------------------------
// Claude narratives shape
// ---------------------------------------------------------------------------

interface ClaudeNarratives {
  introduction: string;
  currentPhaseLesson: string;
  currentPhaseNarrative: string;
  facets: Record<string, {
    keyTheme: string;
    leanInto: string;
    watchFor: string;
    narrative: string;
  }>;
  karmicNarrative: string;
  elementalBalanceNarrative: string;
  integrationPractices: string[];
  rituals: Array<{ planet: string; title: string; practice: string }>;
  timeline: Array<{ period: string; themes: string }>;
  closing: string;
}

// ---------------------------------------------------------------------------
// Chart summary builder
// ---------------------------------------------------------------------------

function buildChartSummary(
  chart: BirthChart,
  summary: BirthChartEngineResult['summary'],
  spiralogic: SpiralogicEngineResult | null,
  transits: TransitsEngineResult,
  cycles: LifeCyclesEngineResult | null
): string {
  const lines: string[] = [];

  lines.push('=== NATAL CHART ===');
  lines.push(`Sun: ${chart.sun.sign} ${chart.sun.degree.toFixed(1)}° (House ${chart.sun.house ?? '?'})`);
  lines.push(`Moon: ${chart.moon.sign} ${chart.moon.degree.toFixed(1)}° (House ${chart.moon.house ?? '?'})`);
  lines.push(`Ascendant (Rising): ${chart.ascendant.sign} ${chart.ascendant.degree.toFixed(1)}°`);

  const allPlanets = [
    { name: 'Mercury', data: chart.mercury },
    { name: 'Venus', data: chart.venus },
    { name: 'Mars', data: chart.mars },
    { name: 'Jupiter', data: chart.jupiter },
    { name: 'Saturn', data: chart.saturn },
    { name: 'Uranus', data: chart.uranus },
    { name: 'Neptune', data: chart.neptune },
    { name: 'Pluto', data: chart.pluto },
    { name: 'Chiron', data: chart.chiron },
    { name: 'North Node', data: chart.northNode },
    { name: 'South Node', data: chart.southNode },
  ];

  for (const p of allPlanets) {
    if (p.data) {
      const retro = p.data.retrograde ? ' (Rx)' : '';
      lines.push(`${p.name}: ${p.data.sign} ${p.data.degree.toFixed(1)}°${retro} (House ${p.data.house ?? '?'})`);
    }
  }

  lines.push('');
  lines.push('=== SPIRALOGIC HOUSE MAPPING ===');
  lines.push('House | Element | Stage   | Label                         | Planets Present');
  lines.push('------|---------|---------|-------------------------------|----------------');
  for (let h = 1; h <= 12; h++) {
    const facet = SPIRALOGIC_FACETS[h];
    if (!facet) continue;
    const planetsHere: string[] = [];
    if (chart.sun.house === h) planetsHere.push('Sun');
    if (chart.moon.house === h) planetsHere.push('Moon');
    for (const p of allPlanets) {
      if (p.data?.house === h) planetsHere.push(p.name);
    }
    const label = facet.label.slice(0, 30).padEnd(30);
    const elem = facet.element.padEnd(7);
    const stage = facet.stage.padEnd(7);
    lines.push(`  ${String(h).padStart(2)}  | ${elem} | ${stage} | ${label} | ${planetsHere.join(', ') || '—'}`);
  }

  if (spiralogic) {
    const bal = spiralogic.elementalBalance;
    lines.push('');
    lines.push('=== ELEMENTAL BALANCE ===');
    lines.push(`Fire: ${bal.fire}%  Water: ${bal.water}%  Earth: ${bal.earth}%  Air: ${bal.air}%`);
    // Dominance from the single versioned rule may be null — report it as
    // balanced/none honestly, never as a manufactured crown.
    lines.push(
      `Dominant: ${bal.dominant ?? 'none (balanced)'}  |  Deficient: ${bal.deficient ?? 'none'}`
    );
  }

  if (transits.aspects && transits.aspects.length > 0) {
    lines.push('');
    lines.push('=== SIGNIFICANT CURRENT TRANSITS (top 8 by orb) ===');
    const top = transits.aspects.slice(0, 8);
    for (const a of top) {
      lines.push(`  ${a.transitPlanet} ${a.aspectType} natal ${a.natalPlanet} (orb ${a.orb.toFixed(1)}°, house ${a.natalHouse})`);
    }
  }

  if (cycles) {
    lines.push('');
    lines.push('=== LIFE CYCLES ===');
    lines.push(`Age: ${cycles.currentAge}  |  Consciousness structure: ${cycles.consciousness.structure}`);
    lines.push(`Saturn cycle ${cycles.saturnCycle.currentCycle} (${cycles.saturnCycle.progress}% through)`);
    if (cycles.saturnCycle.nextReturn) {
      const sr = cycles.saturnCycle.nextReturn;
      lines.push(`  Next Saturn return: age ${sr.age} (${sr.yearsAway > 0 ? `in ${sr.yearsAway} years` : 'active now'})`);
    }
    lines.push(`Uranus opposition: age ${cycles.uranusOpposition.age} (${cycles.uranusOpposition.progress}% through)`);
    lines.push(`Chiron return: age ${cycles.chironReturn.age}`);
    if (cycles.insight) {
      lines.push(`Current phase insight: ${cycles.insight}`);
    }
  }

  if (chart.aspects && chart.aspects.length > 0) {
    lines.push('');
    lines.push('=== KEY NATAL ASPECTS ===');
    const notable = chart.aspects.slice(0, 10);
    for (const a of notable) {
      lines.push(`  ${a.planet1} ${a.type} ${a.planet2} (orb ${a.orb?.toFixed(1) ?? '?'}°)`);
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Fallback narratives
// ---------------------------------------------------------------------------

function buildFallbackNarratives(): ClaudeNarratives {
  const facets: Record<string, { keyTheme: string; leanInto: string; watchFor: string; narrative: string }> = {};
  for (let h = 1; h <= 12; h++) {
    const facet = SPIRALOGIC_FACETS[h];
    if (!facet) continue;
    facets[String(h)] = {
      keyTheme: facet.label,
      leanInto: `Engage consciously with the themes of ${facet.label}`,
      watchFor: `Patterns of avoidance or over-emphasis in this area`,
      narrative: `House ${h} activates the ${facet.element} pathway — ${facet.description}. This facet invites you to ${facet.consciousnessFunction.toLowerCase()}.`,
    };
  }

  return {
    introduction: 'Your chart reveals a unique evolutionary pattern woven through the Spiralogic framework.',
    currentPhaseLesson: 'Integration of current transits and life cycle markers.',
    currentPhaseNarrative: 'The current celestial configuration highlights an important threshold in your evolutionary journey.',
    facets,
    karmicNarrative: 'Your nodal axis and outer planet positions describe a karmic arc of growth and release.',
    elementalBalanceNarrative: 'Your elemental distribution shapes the lens through which you naturally perceive and engage with life.',
    integrationPractices: [
      'Daily grounding practice to anchor the dominant element',
      'Journaling at the threshold between waking and sleep',
      'Conscious breath as a bridge between elements',
    ],
    rituals: [
      {
        planet: 'Saturn',
        title: 'Discipline as Devotion',
        practice: 'Choose one recurring commitment and honour it without negotiation for 21 days.',
      },
      {
        planet: 'Moon',
        title: 'Lunar Attunement',
        practice: 'Track the lunar cycle for one month, noting mood and energy shifts at each phase.',
      },
    ],
    timeline: [
      { period: 'Next 3 months', themes: 'Consolidation and inner preparation.' },
      { period: '3–6 months', themes: 'Emergence and new expression.' },
      { period: '6–12 months', themes: 'Integration of the full cycle.' },
    ],
    closing: 'Your chart is not a fixed fate — it is an invitation to conscious participation in your own unfolding.',
  };
}

// ---------------------------------------------------------------------------
// Claude narrative generation
// ---------------------------------------------------------------------------

async function generateNarratives(
  memberName: string,
  birth: BirthInput,
  chartSummary: string
): Promise<ClaudeNarratives> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `You are a Spiralogic Evolutionary Astrologer generating a personalised report for ${memberName}.

Spiralogic maps the 12 astrological houses onto four elemental pathways (Fire: houses 1,5,9 — Water: houses 4,8,12 — Earth: houses 10,2,6 — Air: houses 7,11,3) with three developmental stages each (vector/intelligence, circle/intention, spiral/goal).

Guidelines:
- Be specific to THIS chart — avoid generic platitudes.
- Write directly to the person ("you", "your").
- Honour complexity without being prescriptive.
- Maintain sovereignty: offer reflection and framing, not commands or diagnoses.
- Keep narratives to 2–4 sentences of genuine depth.
- keyTheme: 4–8 word distillation.
- leanInto / watchFor: 1 sentence each.
- Return ONLY valid JSON. No markdown, no preamble.`;

  const userPrompt = `Here is the complete chart data:

${chartSummary}

Birth: ${birth.date} at ${birth.time} in ${birth.locationName} (${birth.timezone})
Member: ${memberName}

Generate the Spiralogic Evolutionary Report JSON. Return EXACTLY this structure (all 12 houses required in "facets"):

{
  "introduction": "2–3 sentence soul-level introduction about ${memberName}'s current evolutionary theme",
  "currentPhaseLesson": "One sentence naming the central developmental lesson right now",
  "currentPhaseNarrative": "2–3 sentences describing the current evolutionary phase based on transits and life cycles",
  "facets": {
    "1": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "2": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "3": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "4": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "5": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "6": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "7": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "8": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "9": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "10": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "11": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." },
    "12": { "keyTheme": "...", "leanInto": "...", "watchFor": "...", "narrative": "..." }
  },
  "karmicNarrative": "2–3 sentences about south node gifts, north node direction, saturn lessons, pluto transformation",
  "elementalBalanceNarrative": "2–3 sentences about the elemental distribution and what it means for this person",
  "integrationPractices": ["practice 1", "practice 2", "practice 3", "practice 4"],
  "rituals": [
    { "planet": "PlanetName", "title": "Ritual Title", "practice": "Specific practice instruction" },
    { "planet": "PlanetName", "title": "Ritual Title", "practice": "Specific practice instruction" },
    { "planet": "PlanetName", "title": "Ritual Title", "practice": "Specific practice instruction" },
    { "planet": "PlanetName", "title": "Ritual Title", "practice": "Specific practice instruction" }
  ],
  "timeline": [
    { "period": "Month Year – Month Year", "themes": "2–3 sentences" },
    { "period": "Month Year – Month Year", "themes": "2–3 sentences" },
    { "period": "Month Year – Month Year", "themes": "2–3 sentences" }
  ],
  "closing": "2–3 sentence closing affirmation of ${memberName}'s evolutionary path"
}`;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned) as ClaudeNarratives;

    // Ensure all 12 facets exist, fall back individually if missing
    const fallback = buildFallbackNarratives();
    for (let h = 1; h <= 12; h++) {
      const key = String(h);
      if (!parsed.facets?.[key]) {
        if (!parsed.facets) parsed.facets = {};
        parsed.facets[key] = fallback.facets[key];
      }
    }

    return parsed;
  } catch (err) {
    console.error('[SpiralogicReport] Claude narrative generation failed, using fallbacks:', err);
    return buildFallbackNarratives();
  }
}

// ---------------------------------------------------------------------------
// Report assembler
// ---------------------------------------------------------------------------

function assembleReport(
  memberName: string,
  birth: BirthInput,
  chart: BirthChart,
  birthChartResult: BirthChartEngineResult,
  spiralogic: SpiralogicEngineResult | null,
  transits: TransitsEngineResult,
  cycles: LifeCyclesEngineResult | null,
  narratives: ClaudeNarratives
): SpiralogicEvolutionaryReportData {
  // Build planet-by-house index
  const allPlanets = [
    { name: 'Sun', data: chart.sun },
    { name: 'Moon', data: chart.moon },
    { name: 'Mercury', data: chart.mercury },
    { name: 'Venus', data: chart.venus },
    { name: 'Mars', data: chart.mars },
    { name: 'Jupiter', data: chart.jupiter },
    { name: 'Saturn', data: chart.saturn },
    { name: 'Uranus', data: chart.uranus },
    { name: 'Neptune', data: chart.neptune },
    { name: 'Pluto', data: chart.pluto },
    { name: 'Chiron', data: chart.chiron },
    { name: 'North Node', data: chart.northNode },
    { name: 'South Node', data: chart.southNode },
  ];

  const planetsByHouse: Record<number, Array<{ name: string; sign: string }>> = {};
  for (const p of allPlanets) {
    if (p.data?.house && p.data.sign) {
      const h = p.data.house;
      if (!planetsByHouse[h]) planetsByHouse[h] = [];
      planetsByHouse[h].push({ name: p.name, sign: p.data.sign });
    }
  }

  // Build facet reports for each element
  const elementReports: ElementReport[] = ELEMENT_ORDER.map((elem) => {
    const meta = ELEMENT_META[elem];
    const facets: SpiralogicFacetReport[] = meta.houses.map((house) => {
      const facetDef = SPIRALOGIC_FACETS[house];
      const planetsHere = planetsByHouse[house] ?? [];
      const nav = narratives.facets[String(house)];
      const fallback = buildFallbackNarratives().facets[String(house)];

      return {
        house,
        element: elem,
        stage: facetDef?.stage ?? 'vector',
        label: facetDef?.label ?? `House ${house}`,
        planets: planetsHere.map((p) => p.name),
        planetSigns: Object.fromEntries(planetsHere.map((p) => [p.name, p.sign])),
        keyTheme: nav?.keyTheme ?? fallback.keyTheme,
        leanInto: nav?.leanInto ?? fallback.leanInto,
        watchFor: nav?.watchFor ?? fallback.watchFor,
        narrative: nav?.narrative ?? fallback.narrative,
      };
    });

    const percentage = spiralogic?.elementalBalance[elem] ?? 0;

    return {
      element: elem,
      emoji: meta.emoji,
      subtitle: meta.subtitle,
      percentage,
      facets,
    };
  });

  // Karmic insights
  const southNodeData = chart.southNode;
  const northNodeData = chart.northNode;
  const saturnData = chart.saturn;
  const plutoData = chart.pluto;
  const twelfthHousePlanets = (planetsByHouse[12] ?? []).map((p) => p.name);

  const karmicInsights: KarmicInsights = {
    southNode: {
      sign: southNodeData?.sign ?? 'Unknown',
      house: southNodeData?.house ?? 0,
      description: `South Node in ${southNodeData?.sign ?? 'Unknown'} — gifts and patterns from the past`,
    },
    northNode: {
      sign: northNodeData?.sign ?? 'Unknown',
      house: northNodeData?.house ?? 0,
      description: `North Node in ${northNodeData?.sign ?? 'Unknown'} — soul direction for this lifetime`,
    },
    saturn: {
      sign: saturnData?.sign ?? 'Unknown',
      house: saturnData?.house ?? 0,
      lesson: `Saturn in ${saturnData?.sign ?? 'Unknown'} — mastery through structure and discipline`,
    },
    pluto: {
      sign: plutoData?.sign ?? 'Unknown',
      house: plutoData?.house ?? 0,
      transformation: `Pluto in ${plutoData?.sign ?? 'Unknown'} — generational transformation and power`,
    },
    twelfthHousePlanets,
    narrative: narratives.karmicNarrative,
  };

  // Current phase transits (top 5 significant aspects)
  const majorTransits = (transits.aspects ?? [])
    .slice(0, 5)
    .map((a) => ({
      planet: a.transitPlanet,
      house: a.natalHouse,
      theme: `${a.transitPlanet} ${a.aspectType} natal ${a.natalPlanet}`,
    }));

  const currentPhase = {
    majorTransits,
    majorLesson: narratives.currentPhaseLesson,
    narrative: narratives.currentPhaseNarrative,
  };

  // Elemental balance insight.
  // NOTE: no fallback crowns. The old `?? 'fire'` / `?? 'earth'` defaults
  // invented a confident verdict from NO data — the exact anti-pattern the
  // C-fence abolishes. Absence propagates as null; renderers say balanced.
  const bal = spiralogic?.elementalBalance;
  const elementalBalance: ElementalBalanceInsight = {
    dominant: bal?.dominant ?? null,
    underactive: bal?.deficient ?? null,
    percentages: {
      fire: bal?.fire ?? 25,
      water: bal?.water ?? 25,
      earth: bal?.earth ?? 25,
      air: bal?.air ?? 25,
    },
    integrationPractices: narratives.integrationPractices?.length > 0
      ? narratives.integrationPractices
      : ['Grounding through consistent daily rhythm', 'Breathwork to connect elements', 'Journaling to integrate insight'],
    narrative: narratives.elementalBalanceNarrative,
  };

  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    memberName,
    birthDate: birth.date,
    birthLocation: birth.locationName,
    big3: {
      sun: birthChartResult.summary.sun,
      moon: birthChartResult.summary.moon,
      rising: birthChartResult.summary.ascendant,
    },
    introduction: narratives.introduction,
    currentPhase,
    elements: elementReports,
    karmicInsights,
    elementalBalance,
    practicalRituals: narratives.rituals?.length > 0 ? narratives.rituals : [],
    timeline: narratives.timeline?.length > 0 ? narratives.timeline : [],
    closing: narratives.closing,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateSpiralogicReport(
  birth: BirthInput,
  memberName: string
): Promise<SpiralogicEvolutionaryReportData> {
  // 1. Build intake for engines
  const intake = parseAstrologyIntake({
    houseSystem: 'whole_sign',
    question: 'Spiralogic Evolutionary Report generation',
    birth: {
      date: birth.date,
      time: birth.time,
      location: `${birth.lat},${birth.lng}`,
      timezone: birth.timezone,
    },
  });

  // 2. Run birth chart engine
  const birthChartResult = await runBirthChartEngine(intake);
  if (!birthChartResult) {
    throw new Error('Birth chart calculation failed — check birth data format (lat/lng required)');
  }
  const chart = birthChartResult.chart;

  // 3. Run remaining engines in parallel — individual failures are non-fatal
  const [spiralogicResult, transitsResult, cyclesResult] = await Promise.all([
    runSpiralogicEngine(intake, chart).catch((err) => {
      console.warn('[SpiralogicReport] spiralogicEngine failed (non-fatal):', err);
      return null;
    }),
    runTransitsEngine(intake, chart).catch((err) => {
      console.warn('[SpiralogicReport] transitsEngine failed (non-fatal):', err);
      return { timestamp: new Date().toISOString(), positions: [], aspects: [] } as TransitsEngineResult;
    }),
    runLifeCyclesEngine(intake, chart).catch((err) => {
      console.warn('[SpiralogicReport] lifeCyclesEngine failed (non-fatal):', err);
      return null;
    }),
  ]);

  // 4. Build chart summary for Claude
  const chartSummary = buildChartSummary(chart, birthChartResult.summary, spiralogicResult, transitsResult, cyclesResult);

  // 5. Generate AI narratives
  const narratives = await generateNarratives(memberName, birth, chartSummary);

  // 6. Assemble and return
  return assembleReport(memberName, birth, chart, birthChartResult, spiralogicResult, transitsResult, cyclesResult, narratives);
}
