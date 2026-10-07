import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

export interface CraftLocusHint {
  readonly sectionId: string;
  readonly start: number;
  readonly end: number;
  readonly anchor: string;
  readonly reason: 'quoted-heading';
}

const PROBLEM_CUES = [
  'but ', 'however', 'conceptual', 'systematic', 'analytical', 'distance',
  'less like', 'rather than', 'overwhelm', 'dense', 'repetitive', 'risk',
  'breakdown', 'breaking down', 'phases', 'keeping readers', 'arm\'s length',
  'not quite', 'mostly watching',
] as const;

const POSITIVE_CUES = [
  'works', 'embodied', 'relational', 'effective', 'alive', 'makes you feel',
  'strong foundation', 'feels lived',
] as const;

function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function quotedPhrases(text: string): Array<{ phrase: string; at: number }> {
  const out: Array<{ phrase: string; at: number }> = [];
  const re = /[“"]([^"”]{8,220})[”"]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const phrase = match[1]?.trim() ?? '';
    if (phrase.length >= 8) out.push({ phrase, at: match.index });
  }
  return out;
}

function cueScore(text: string, at: number): number {
  const before = text.slice(Math.max(0, at - 320), at + 80).toLowerCase();
  let score = 0;
  for (const cue of PROBLEM_CUES) if (before.includes(cue)) score += 3;
  for (const cue of POSITIVE_CUES) if (before.includes(cue)) score -= 2;
  return score;
}

function firstCraftWindow(body: string): { start: number; end: number } | null {
  const trimmedStart = body.search(/\S/);
  if (trimmedStart < 0) return null;
  const tail = body.slice(trimmedStart);
  try {
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    const sentences = Array.from(segmenter.segment(tail));
    if (sentences.length === 0) return null;
    const chosen = sentences.slice(0, Math.min(3, sentences.length));
    const last = chosen[chosen.length - 1]!;
    const end = trimmedStart + last.index + last.segment.length;
    return { start: trimmedStart, end };
  } catch {
    const point = tail.search(/(?:[.!?]["”']?)(?:\s|$)/);
    const end = point >= 0 ? trimmedStart + point + 1 : Math.min(body.length, trimmedStart + 520);
    return { start: trimmedStart, end };
  }
}

/**
 * R8I — high-confidence Hermes orientation.
 *
 * This does not infer author intent and does not create an editorial act.
 * It uses only an exact phrase MAIA just displayed to the writer and a unique
 * current manuscript heading containing that phrase. The phrase is navigation
 * evidence only; the server still re-resolves the conversation before Craft
 * cognition and the editorial thread still verifies the exact selected range.
 */
export function resolveCraftLocusHint(
  maiaTurnBody: string,
  sections: readonly RebuildSection[],
): CraftLocusHint | null {
  const candidates = quotedPhrases(maiaTurnBody)
    .map((quote) => ({ ...quote, score: cueScore(maiaTurnBody, quote.at) }))
    .sort((a, b) => b.score - a.score || b.phrase.length - a.phrase.length);

  for (const candidate of candidates) {
    if (candidate.score <= 0) continue;
    const q = normalize(candidate.phrase);
    if (!q) continue;
    const matches = sections.filter((section) => {
      const h = normalize(section.heading ?? '');
      return h.length > 0 && (h.includes(q) || q.includes(h));
    });
    if (matches.length !== 1) continue;
    const section = matches[0]!;
    if (!section.editable || !section.body.trim()) continue;
    const range = firstCraftWindow(section.body);
    if (!range || range.end <= range.start) continue;
    return {
      sectionId: section.draftSectionId,
      start: range.start,
      end: range.end,
      anchor: candidate.phrase,
      reason: 'quoted-heading',
    };
  }
  return null;
}
