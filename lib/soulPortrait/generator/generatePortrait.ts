/**
 * Soul Portrait generator — orchestrator.
 *
 *   birth data → natal chart (existing ephemeris) → sovereign Claude (portrait voice)
 *   → flat JSON → assembled LiterarySoulPortrait (draft)
 *
 * The generator emits the LITERARY (chapter-based) portrait form — the register
 * of the hand-authored models (portraits/nathan.ts, portraits/andreaFagan.ts):
 * one braided story across sixteen chapters (the nine constitutional sections
 * rendered as flowing prose, plus a whole-sky shape chapter), not a
 * section-shaped report. The renderer already accepts either form (AnyPortrait).
 *
 * This produces a DRAFT for practitioner review. It does NOT persist, publish, or
 * enable the Mentor. Persistence is a separate, explicit step (portraitStore).
 */

import { calculateBirthChart, type BirthData } from '@/lib/astrology/ephemerisCalculator';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import {
  DEFAULT_FRAMING,
  ELEMENT_META,
  type ElementKey,
  type LiterarySoulPortrait,
  type PortraitChapter,
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

const ELEMENT_KEYS = new Set<ElementKey>(Object.keys(ELEMENT_META) as ElementKey[]);

/**
 * Repair the JSON failure modes of small local models on long literary output:
 * raw control characters inside strings (unescaped newlines/tabs in prose) and
 * structures left open by truncation. Escapes controls in-string, closes an
 * unterminated string, drops a dangling trailing token, then closes every open
 * brace/bracket. Best-effort — the viability guard below still decides whether
 * the result is a usable draft.
 */
function repairJson(s: string): string {
  let out = '';
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  for (const ch of s) {
    if (inStr) {
      if (esc) { out += ch; esc = false; continue; }
      if (ch === '\\') { out += ch; esc = true; continue; }
      if (ch === '"') { inStr = false; out += ch; continue; }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') continue;
      if (ch === '\t') { out += '\\t'; continue; }
      out += ch;
      continue;
    }
    if (ch === '"') { inStr = true; out += ch; continue; }
    if (ch === '{' || ch === '[') { stack.push(ch); out += ch; continue; }
    if (ch === '}' || ch === ']') { stack.pop(); out += ch; continue; }
    out += ch;
  }
  if (esc) out = out.slice(0, -1);
  if (inStr) out += '"';
  out = out
    .replace(/,\s*$/, '')
    .replace(/"(?:[^"\\]|\\.)*"\s*:\s*$/, '')
    .replace(/,\s*$/, '');
  while (stack.length) out += stack.pop() === '{' ? '}' : ']';
  return out;
}

/** Strip markdown fences and parse the model's JSON defensively. */
function parseModelJson(raw: string): any {
  let s = (raw || '').trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
  try {
    return JSON.parse(s);
  } catch {
    return JSON.parse(repairJson(s));
  }
}

/** Assemble the validated LiterarySoulPortrait from the model's flat JSON. */
function assemble(input: GeneratePortraitInput, j: any): LiterarySoulPortrait {
  const chapters: PortraitChapter[] = (Array.isArray(j.chapters) ? j.chapters : [])
    .map((c: any) => ({
      title: String(c?.title || '').trim(),
      subtitle: c?.subtitle ? String(c.subtitle) : undefined,
      body: String(c?.body || '').trim(),
      element: ELEMENT_KEYS.has(c?.element) ? (c.element as ElementKey) : undefined,
    }))
    .filter((c: PortraitChapter) => c.title && c.body);

  const placements = (Array.isArray(j.natalPlacements) ? j.natalPlacements : []).map((p: any) => ({
    body: String(p.body || ''),
    sign: p.sign ? String(p.sign) : undefined,
    house: typeof p.house === 'number' ? p.house : undefined,
    meaning: String(p.meaning || ''),
  }));

  const portrait: LiterarySoulPortrait = {
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
      note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes.',
    },
    natalChartSummary: {
      placements,
      synthesis: String(j.natalSynthesis || ''),
    },
    chapters,
    framing: DEFAULT_FRAMING,
    // Draft: the Mentor is never auto-enabled by generation (default-deny).
    mentorEnabled: false,
  };

  // Minimum-viability guard — a literary draft must carry a real chapter arc.
  // The contract asks for sixteen chapters; twelve is the floor (a truncated
  // tail can be practitioner-repaired, a missing middle cannot). Calibrated
  // against the hand-authored models: major chapters run 800-3000 chars.
  const substantial = chapters.filter((c) => c.body.length >= 600);
  const totalProse = chapters.reduce((sum, c) => sum + c.body.length, 0);
  if (chapters.length < 12 || substantial.length < 8 || totalProse < 8000) {
    throw new Error('generator_incomplete_output');
  }
  return portrait;
}

/**
 * Generate a Soul Portrait DRAFT from birth data. Throws on chart failure or
 * unusable model output (the caller — a practitioner tool — surfaces + retries).
 */
export async function generateSoulPortrait(input: GeneratePortraitInput): Promise<LiterarySoulPortrait> {
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
        content: `Here are ${input.name}'s natal placements and whole-chart shape. Write their Soul Portrait as the JSON object specified.\n\n${summary}`,
      },
    ],
    temperature: 0.7,
    // The literary form runs long (~16 chapters, ~15-20k chars of prose). 12k
    // tokens gives headroom over the observed ~5-7k output; on the local deep
    // tier (qwen2.5:14b) this stresses generation time — streaming keeps the
    // connection alive (see project_soul_portrait_ollama_fallback_fix).
    maxTokens: 12000,
  });

  const json = parseModelJson(llm.text || '');
  return assemble(input, json);
}
