/**
 * Soul Portrait generator — orchestrator.
 *
 *   birth data → natal chart (existing ephemeris) → sovereign Claude (portrait voice)
 *   → flat JSON → assembled SoulPortrait (draft)
 *
 * This produces a DRAFT for practitioner review. It does NOT persist, publish, or
 * enable the Mentor. Persistence is a separate, explicit step (portraitStore).
 */

import { calculateBirthChart, type BirthData } from '@/lib/astrology/ephemerisCalculator';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import {
  ARCHETYPE_CATALOG,
  DEFAULT_FRAMING,
  ELEMENT_META,
  type ArchetypeKey,
  type ElementKey,
  type Resonance,
  type SoulPortrait,
  type PortraitMode,
  type PortraitThemeKey,
} from '@/lib/soulPortrait/schema';
import { parseModelJson } from './parseModelJson';
import { chartSummaryText, portraitSystemPrompt } from './portraitPrompt';
import { generateYearAhead } from './generateYearAhead';
import { parseTransitReport, type ParsedTransit } from './transitReportParser';

export interface GeneratePortraitInput {
  name: string;
  slug: string;
  mode: PortraitMode;
  /** Ephemeris birth data: date (YYYY-MM-DD), time (HH:MM), location {lat,lng,timezone}. */
  birthData: BirthData;
  /** Human-readable birth place, for display in the portrait (chart uses lat/lng). */
  birthPlace?: string;
  age?: number;
  pronouns?: string;
  isMinor?: boolean;
  /** Visual theme the sender chose for the page. Presentation only; omitted → classic. */
  theme?: PortraitThemeKey;
  /**
   * Optional pasted 12-month transit report → Part II (Year Ahead). Only transit
   * FACTS are extracted (transitReportParser); the report's interpretive prose is
   * copyright (Henry Seltzer / Astrograph) and is discarded unread — never stored,
   * never prompted. All Year Ahead prose is written fresh.
   */
  transitReport?: string;
}

const ELEMENT_KEYS: ElementKey[] = ['fire', 'water', 'earth', 'air', 'aether'];
const ARCHETYPE_KEYS = new Set<ArchetypeKey>(Object.keys(ARCHETYPE_CATALOG) as ArchetypeKey[]);
const RESONANCES = new Set<Resonance>(['strong', 'present', 'emerging']);

/** Assemble the validated SoulPortrait from the model's flat JSON + canonical catalogs. */
function assemble(input: GeneratePortraitInput, j: any): SoulPortrait {
  const elementalProfile = ELEMENT_KEYS.map((element) => {
    const e = j.elements?.[element] ?? {};
    return {
      element,
      keyword: ELEMENT_META[element].keyword,
      title: String(e.title || ELEMENT_META[element].label),
      body: String(e.body || ''),
    };
  });

  const archetypalProfile = (Array.isArray(j.archetypes) ? j.archetypes : [])
    .filter((a: any) => ARCHETYPE_KEYS.has(a?.key))
    .slice(0, 4)
    .map((a: any) => ({
      key: a.key as ArchetypeKey,
      name: ARCHETYPE_CATALOG[a.key as ArchetypeKey].name,
      essence: String(a.essence || ARCHETYPE_CATALOG[a.key as ArchetypeKey].essence),
      gift: String(a.gift || ''),
      shadow: String(a.shadow || ''),
      resonance: (RESONANCES.has(a.resonance) ? a.resonance : 'present') as Resonance,
    }));

  const placements = (Array.isArray(j.natalPlacements) ? j.natalPlacements : []).map((p: any) => ({
    body: String(p.body || ''),
    sign: p.sign ? String(p.sign) : undefined,
    house: typeof p.house === 'number' ? p.house : undefined,
    meaning: String(p.meaning || ''),
  }));

  const portrait: SoulPortrait = {
    person: {
      name: input.name,
      slug: input.slug,
      age: input.age,
      pronouns: input.pronouns,
      isMinor: input.isMinor,
    },
    mode: input.mode,
    theme: input.theme,
    birthData: {
      date: input.birthData.date,
      time: input.birthData.time,
      place: input.birthPlace,
    },
    natalChartSummary: {
      placements,
      synthesis: String(j.natalSynthesis || ''),
    },
    openingLetter: String(j.openingLetter || ''),
    soulSignature: {
      headline: String(j.soulSignature?.headline || ''),
      body: String(j.soulSignature?.body || ''),
    },
    elementalProfile,
    archetypalProfile,
    seerAndProphet: {
      title: String(j.seerAndProphet?.title || 'The Seer and the Prophet'),
      body: String(j.seerAndProphet?.body || ''),
      blessing: Array.isArray(j.seerAndProphet?.blessing)
        ? j.seerAndProphet.blessing.map((s: any) => String(s))
        : undefined,
    },
    challengesAsTraining: {
      body: String(j.challenges?.body || ''),
      trainings: Array.isArray(j.challenges?.trainings)
        ? j.challenges.trainings.map((t: any) => ({
            challenge: String(t.challenge || ''),
            training: String(t.training || ''),
          }))
        : undefined,
    },
    northStar: j.northStar?.body
      ? { title: String(j.northStar.title || 'Your North Star'), body: String(j.northStar.body) }
      : undefined,
    developmentalStage: {
      label: String(j.developmentalStage?.label || 'This Season of Becoming'),
      ageRange: j.developmentalStage?.ageRange ? String(j.developmentalStage.ageRange) : undefined,
      body: String(j.developmentalStage?.body || ''),
    },
    reflectionQuestions: Array.isArray(j.reflectionQuestions)
      ? j.reflectionQuestions.map((q: any) => String(q))
      : [],
    soulVocation: String(j.soulVocation || ''),
    framing: DEFAULT_FRAMING,
    // Draft: the Mentor is never auto-enabled by generation (default-deny).
    mentorEnabled: false,
  };

  // Minimum-viability guard — a draft must at least carry its core prose.
  if (!portrait.openingLetter || !portrait.soulSignature.body || !portrait.soulVocation) {
    throw new Error('generator_incomplete_output');
  }
  return portrait;
}

/** Which engine actually wrote the draft — persisted on the row; the label travels. */
export interface GenerationProvenance {
  provider: string;
  model: string;
}

/**
 * Generate a Soul Portrait DRAFT from birth data. Throws on chart failure or
 * unusable model output (the caller — a practitioner tool — surfaces + retries).
 * Returns the draft plus the provenance of the engine that wrote it.
 */
export async function generateSoulPortrait(
  input: GeneratePortraitInput,
): Promise<{ portrait: SoulPortrait; provenance: GenerationProvenance }> {
  const chart = await calculateBirthChart(input.birthData);
  const summary = chartSummaryText(chart);

  // Parse the transit report FIRST (cheap, no model call) so an unusable report
  // fails before any generation spend. Facts only ever leave the parser.
  let parsedTransits: ParsedTransit[] | null = null;
  if (input.transitReport?.trim()) {
    const { transits, warnings } = parseTransitReport(input.transitReport);
    if (transits.length === 0) throw new Error('transit_report_unparseable');
    if (warnings.length) {
      console.warn(`[soul-portrait/year-ahead] parse warnings (${warnings.length}): ${warnings.join(' · ')}`);
    }
    parsedTransits = transits;
  }

  const llm = await getLLMProvider().generateSimple({
    tier: 'deep',
    // Cloud-primary-labeled (settled 2026-07-09): a deliberate provider choice,
    // not a bounded-attempt fallback. Deep-tier local inference measured
    // ~3 tok/s on minisforum CPU — a portrait-sized generation is an 11–43 min
    // grind. Sovereign is the destination, cloud the honest default until the
    // cognition node lands; local-primary returns by removing this flag
    // (+ pointing OLLAMA_BASE_URL at the node). The returned provenance must
    // be persisted with the draft — an unlabeled cloud-served portrait is a
    // refused state.
    forceClaude: true,
    systemPrompt: portraitSystemPrompt({
      name: input.name,
      age: input.age,
      isMinor: input.isMinor,
      mode: input.mode,
    }),
    messages: [
      {
        role: 'user',
        content: `Here are ${input.name}'s natal placements. Write their Soul Portrait as the JSON object specified.\n\n${summary}`,
      },
    ],
    temperature: 0.7,
    maxTokens: 8000,
  });

  const json = parseModelJson(llm.text || '', 'soul-portrait/generate');
  const portrait = assemble(input, json);

  // Part II — the Year Ahead, assembled deterministically like Part I above.
  if (parsedTransits) {
    portrait.yearAhead = await generateYearAhead({
      name: input.name,
      age: input.age,
      isMinor: input.isMinor,
      transits: parsedTransits,
      natalSummary: summary,
    });
  }
  return {
    portrait,
    provenance: { provider: llm.provider, model: llm.model },
  };
}
