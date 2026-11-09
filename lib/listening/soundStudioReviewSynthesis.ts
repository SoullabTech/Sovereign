// LISTEN-01 · founder-side synthesis of saved Sound Studio reviews. Pure: prompt building and parsing only.
//
// The model receives ONLY confirmed review lines under anonymous references (L1, L2, …): never names, member ids,
// transcripts or dates. Every theme must cite the lines it rests on; a theme citing an unknown reference is
// dropped, so no theme can appear without traceable reviewer words. Synthesis is computed on request and not
// stored. It proposes; people decide.

import type { ReviewLine } from './soundStudioReview';

export type SynthesisInput = { ref: string; workTitle: string; line: ReviewLine };
export type Theme = { title: string; summary: string; refs: string[] };

export const MAX_SYNTHESIS_LINES = 300;

export function buildSynthesisInputs(
  reviews: ReadonlyArray<{ workTitle: string; lines: readonly ReviewLine[] }>,
): SynthesisInput[] {
  const out: SynthesisInput[] = [];
  for (const review of reviews) {
    for (const line of review.lines) {
      if (out.length >= MAX_SYNTHESIS_LINES) return out;
      out.push({ ref: `L${out.length + 1}`, workTitle: review.workTitle, line });
    }
  }
  return out;
}

export function synthesisSystemPrompt(): string {
  return [
    'You help the Soullab Sound Studio team read beta reviews. You are given confirmed review lines, each with a reference like L3.',
    'Group them into themes. Use only what the lines say; do not invent, generalize beyond them, or judge the reviewers.',
    'Keep craft notes, felt experience and suggestions distinguishable. Note disagreements as their own theme rather than averaging them away.',
    'Make no claims about health, healing or effects on the body.',
    'Return JSON only: {"themes":[{"title":"...","summary":"...","refs":["L1","L4"]}]}. Every theme must cite at least one ref. At most 12 themes.',
  ].join('\n');
}

export function synthesisUserInput(inputs: readonly SynthesisInput[]): string {
  return inputs.map(i => `${i.ref} [${i.workTitle} · ${i.line.kind}] ${i.line.text}`).join('\n');
}

export function parseThemes(raw: string, inputs: readonly SynthesisInput[]): Theme[] {
  const known = new Set(inputs.map(i => i.ref));
  if (typeof raw !== 'string') return [];
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(raw.slice(start, end + 1)); } catch { return []; }
  const themes = (parsed as { themes?: unknown }).themes;
  if (!Array.isArray(themes)) return [];
  const out: Theme[] = [];
  for (const t of themes.slice(0, 12)) {
    if (!t || typeof t !== 'object') continue;
    const rec = t as Record<string, unknown>;
    if (typeof rec.title !== 'string' || typeof rec.summary !== 'string' || !Array.isArray(rec.refs)) continue;
    const refs = [...new Set(rec.refs.filter((r): r is string => typeof r === 'string' && known.has(r)))];
    if (!refs.length) continue;
    out.push({ title: rec.title.trim().slice(0, 120), summary: rec.summary.trim().slice(0, 600), refs });
  }
  return out;
}
