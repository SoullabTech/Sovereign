/**
 * Year Ahead (Part II) generator — orchestrator.
 *
 *   pasted transit report → parseTransitReport (DATA only) → sovereign Claude
 *   (fresh Seasonal Spiral prose, citing transits by ID) → flat JSON →
 *   assembled YearAhead (deterministic, like generatePortrait's assemble)
 *
 * Phase `transits[]` strings are rendered in code from the parsed data — the
 * model only ever cites IDs — and validateCitedTransits() re-checks the
 * assembled result, so a phase can never carry a transit that does not exist
 * in the report (Design Law: no manufactured transits).
 */

import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import type { ElementKey, YearAhead, YearAheadPhase } from '@/lib/soulPortrait/schema';
import {
  describeTransit,
  deriveTimeframe,
  transitDataText,
  type ParsedTransit,
} from './transitReportParser';
import { parseModelJson } from './parseModelJson';
import { yearAheadSystemPrompt } from './yearAheadPrompt';

/** The Seasonal Spiral's fixed elemental order (schema: YearAhead docs). */
const SPIRAL_ORDER: ElementKey[] = ['earth', 'fire', 'water', 'air', 'aether'];
const ELEMENT_SET = new Set<string>(SPIRAL_ORDER);

/**
 * Design Law validation: every transit cited by an assembled phase must exist
 * in the parsed report data. Throws — a manufactured transit is never repaired
 * into a draft.
 */
export function validateCitedTransits(phases: YearAheadPhase[], parsed: ParsedTransit[]): void {
  const real = new Set(parsed.map((t) => describeTransit(t)));
  for (const phase of phases) {
    for (const cited of phase.transits) {
      if (!real.has(cited)) {
        throw new Error(`year_ahead_manufactured_transit: "${cited}" (${phase.element})`);
      }
    }
  }
}

/** Assemble the validated YearAhead from the model's flat JSON + parsed transit data. */
function assemble(parsed: ParsedTransit[], j: any): YearAhead {
  const byId = new Map(parsed.map((t) => [t.id, t]));

  const phases: YearAheadPhase[] = SPIRAL_ORDER.map((element) => {
    const p = j.phases?.[element] ?? {};
    const ids: number[] = (Array.isArray(p.transitIds) ? p.transitIds : [])
      .map((n: any) => Number(n))
      .filter((n: number) => byId.has(n));
    return {
      element,
      title: String(p.title || ''),
      timeframe: p.timeframe ? String(p.timeframe) : undefined,
      // Rendered from DATA — the model's only authority here is the ID list.
      transits: ids.map((id) => describeTransit(byId.get(id)!)),
      body: String(p.body || ''),
      question: p.question ? String(p.question) : undefined,
      practice: p.practice?.prompt
        ? {
            label: p.practice.label ? String(p.practice.label) : undefined,
            prompt: String(p.practice.prompt),
          }
        : undefined,
    };
  });

  // Minimum viability: each phase must carry prose, a title, and at least one
  // REAL transit — a phase without a transit is an unmoored forecast.
  for (const phase of phases) {
    if (!phase.title || !phase.body || phase.transits.length === 0) {
      throw new Error('year_ahead_incomplete_output');
    }
  }

  const yearAhead: YearAhead = {
    title: 'The Year Ahead',
    subtitle: j.subtitle ? String(j.subtitle) : undefined,
    timeframe: deriveTimeframe(parsed),
    openingHeadline: j.openingHeadline ? String(j.openingHeadline) : undefined,
    openingTheme: String(j.openingTheme || ''),
    phases,
    weatherPattern: Array.isArray(j.weatherPattern)
      ? j.weatherPattern
          .filter((w: any) => ELEMENT_SET.has(w?.element))
          .map((w: any) => ({
            season: String(w.season || ''),
            element: w.element as ElementKey,
            invitation: String(w.invitation || ''),
          }))
      : undefined,
    goldenThread: String(j.goldenThread || ''),
    questions: Array.isArray(j.questions) ? j.questions.map((q: any) => String(q)) : [],
    closing: j.closing?.body
      ? { title: String(j.closing.title || 'A Word for the Year'), body: String(j.closing.body) }
      : undefined,
  };

  if (!yearAhead.openingTheme || !yearAhead.goldenThread || yearAhead.questions.length === 0) {
    throw new Error('year_ahead_incomplete_output');
  }
  validateCitedTransits(yearAhead.phases, parsed);
  return yearAhead;
}

/**
 * Generate the Year Ahead from parsed transit data. `natalSummary` is the same
 * factual placements block Part I uses (chartSummaryText) — our own ephemeris
 * data, so the spiral reading stays grounded in the person's chart.
 */
export async function generateYearAhead(opts: {
  name: string;
  age?: number;
  isMinor?: boolean;
  transits: ParsedTransit[];
  natalSummary: string;
}): Promise<YearAhead> {
  const { name, age, isMinor, transits, natalSummary } = opts;

  const llm = await getLLMProvider().generateSimple({
    tier: 'deep',
    // Cloud-primary-labeled, same settled posture as Part I (generatePortrait.ts):
    // Part II is half of one member-facing generation — it must not burn the
    // local deadline before falling back, and the persisted provenance label
    // (recorded from Part I's call) must describe BOTH parts' provider.
    forceClaude: true,
    systemPrompt: yearAheadSystemPrompt({
      name,
      age,
      isMinor,
      timeframe: deriveTimeframe(transits),
    }),
    messages: [
      {
        role: 'user',
        content: `${name}'s natal placements (for grounding):\n${natalSummary}\n\nThe year's transits — DATA extracted from ${name}'s 12-month transit report (cite by ID number):\n${transitDataText(transits)}\n\nWrite ${name}'s Year Ahead as the JSON object specified.`,
      },
    ],
    temperature: 0.7,
    maxTokens: 8000,
  });

  const json = parseModelJson(llm.text || '', 'soul-portrait/year-ahead');
  return assemble(transits, json);
}
