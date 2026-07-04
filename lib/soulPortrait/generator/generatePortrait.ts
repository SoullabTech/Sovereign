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
} from '@/lib/soulPortrait/schema';
import { chartSummaryText, portraitSystemPrompt } from './portraitPrompt';

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
}

const ELEMENT_KEYS: ElementKey[] = ['fire', 'water', 'earth', 'air', 'aether'];
const ARCHETYPE_KEYS = new Set<ArchetypeKey>(Object.keys(ARCHETYPE_CATALOG) as ArchetypeKey[]);
const RESONANCES = new Set<Resonance>(['strong', 'present', 'emerging']);

/** Strip markdown fences and parse the model's JSON defensively. */
function parseModelJson(raw: string): any {
  let s = (raw || '').trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
  return JSON.parse(s);
}

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

/**
 * Generate a Soul Portrait DRAFT from birth data. Throws on chart failure or
 * unusable model output (the caller — a practitioner tool — surfaces + retries).
 */
export async function generateSoulPortrait(input: GeneratePortraitInput): Promise<SoulPortrait> {
  const chart = await calculateBirthChart(input.birthData);
  const summary = chartSummaryText(chart);

  const llm = await getLLMProvider().generateSimple({
    tier: 'deep',
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

  const json = parseModelJson(llm.text || '');
  return assemble(input, json);
}
