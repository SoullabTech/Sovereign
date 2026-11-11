/**
 * WS-RELATIONAL-ARCHITECTURE step 5 — the letter's opening (design §19): "This is what I think your book is reaching for … Is that
 * right?", what is working (each with the writer's own words quoted), and, only when the writer has stated an intention, where her
 * reading and that intention may diverge, asked both ways.
 *
 * Laws held here (each is checked by the server, not trusted to the model):
 *  - Grounded in MAIA's frozen observations: every part cites supplied handles (E1…); a part citing none is dropped.
 *  - A "working" item stands only if its quotation is found VERBATIM in the current draft. Otherwise it is dropped and counted.
 *    Praise without a quotation is never kept.
 *  - The writer's stated intention orients; it is never evidence. A divergence is kept only when an intention was stated, and it is
 *    shown as a question in both directions.
 *  - Nothing here changes the manuscript. The opening rides inside the letter's map (no schema of its own).
 */
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredBlock } from '@/lib/ai/structured/types';
import { query } from '@/lib/db/postgres';
import { loadReading } from '@/lib/manuscript/developmentalReading/store';
import { writerUnderstandingContextForManuscript } from '@/lib/writersStudio/writerUnderstandingServer';

export interface LetterOpening {
  reachingFor: string;
  working: { text: string; quote: string; sectionId: string | null }[];
  divergence: string | null;
  /** how many "working" items were dropped because their quotation was not found verbatim in the current draft */
  droppedUnverified: number;
}

const TOOL = 'return_letter_opening';
const MODEL = process.env.MAIA_ATTENTION_MAP_MODEL || process.env.MAIA_DEVELOPMENTAL_READER_MODEL || 'claude-opus-5';

export interface OpeningObservation { ref: string; lens: string; observation: string }

export function openingSchema(refs: readonly string[]) {
  return {
    type: 'object', additionalProperties: false, required: ['reachingFor', 'reachingForRefs', 'working', 'divergence'],
    properties: {
      reachingFor: { type: 'string' },
      reachingForRefs: { type: 'array', minItems: 1, items: { type: 'string', enum: [...refs] } },
      working: {
        type: 'array', maxItems: 3,
        items: {
          type: 'object', additionalProperties: false, required: ['text', 'quote', 'refs'],
          properties: { text: { type: 'string' }, quote: { type: 'string' }, refs: { type: 'array', minItems: 1, items: { type: 'string', enum: [...refs] } } },
        },
      },
      divergence: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    },
  } as const;
}

export const OPENING_SYSTEM = [
  'You are writing the first lines of an editor’s letter to a writer, from frozen developmental observations of their whole book.',
  'reachingFor: one or two sentences saying what you think the book is reaching for, ending as a question to the writer (for example "Is that right?"). It is your reading, offered for correction, never a verdict.',
  'working: up to three things that are genuinely working. Each must quote the writer’s own words EXACTLY as they appear in the manuscript (a short phrase or sentence), in "quote". No generic praise.',
  'divergence: only if the writer has stated an intention below AND your reading differs from it. Ask it both ways, as a question: is the book changing, or are these parts? Otherwise null.',
  'The writer’s stated intention is orientation only. Never state it as a fact about the text; say "you told me" when you refer to it.',
  'Cite the supplied observation handles (E1…) for every part. Do not invent facts or quotations. Do not propose edits.',
].join('\n');

/** Pure: keep only what the server can verify. `sections` are the current draft's sections. */
export function verifyOpening(raw: unknown, sections: readonly { id: string; text: string }[], refs: ReadonlySet<string>, hasIntention: boolean): LetterOpening | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { reachingFor?: unknown; reachingForRefs?: unknown; working?: unknown; divergence?: unknown };
  const cited = (xs: unknown) => Array.isArray(xs) && xs.length > 0 && xs.every((x) => typeof x === 'string' && refs.has(x));
  if (typeof r.reachingFor !== 'string' || !r.reachingFor.trim() || !cited(r.reachingForRefs)) return null;
  const working: LetterOpening['working'] = [];
  let dropped = 0;
  for (const w of Array.isArray(r.working) ? r.working.slice(0, 3) : []) {
    const item = w as { text?: unknown; quote?: unknown; refs?: unknown };
    const quote = typeof item.quote === 'string' ? item.quote.trim().replace(/^[“"']|[”"']$/g, '') : '';
    const where = quote.length >= 8 ? sections.find((s) => s.text.includes(quote)) : undefined;
    if (typeof item.text !== 'string' || !item.text.trim() || !cited(item.refs) || !where) { dropped += 1; continue; }
    working.push({ text: item.text.trim(), quote, sectionId: where.id });
  }
  const divergence = hasIntention && typeof r.divergence === 'string' && r.divergence.trim() ? r.divergence.trim() : null;
  const reachingFor = r.reachingFor.trim();
  return { reachingFor: /\?\s*$/.test(reachingFor) ? reachingFor : `${reachingFor} Is that right?`, working, divergence, droppedUnverified: dropped };
}

/** Compose the opening for a letter built from these readings. Returns null (and the letter goes without an opening) on any failure. */
export async function composeOpening(memberId: string, manuscriptId: string, readingIds: readonly string[]): Promise<LetterOpening | null> {
  try {
    const observations: OpeningObservation[] = [];
    for (const id of readingIds) {
      const reading = await loadReading(id, memberId);
      if (!reading || reading.manuscriptId !== manuscriptId || reading.outcome !== 'reading') continue;
      for (const o of reading.observations) observations.push({ ref: `E${observations.length + 1}`, lens: o.lens, observation: o.observation });
    }
    if (observations.length === 0) return null;
    const live = (await query<{ id: string; text: string }>(
      `SELECT s.id, s.text FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id = s.draft_id
        WHERE d.manuscript_id = $1 AND d.member_id = $2 ORDER BY s.position`, [manuscriptId, memberId])).rows;
    const intention = await writerUnderstandingContextForManuscript(memberId, manuscriptId);
    const out = await runStructured({
      model: MODEL,
      system: [OPENING_SYSTEM, intention ? `WHAT THE WRITER HAS TOLD YOU (orientation only, never evidence):\n${intention}` : 'The writer has not stated an intention.'].join('\n\n'),
      messages: [{ role: 'user', content: `FROZEN OBSERVATIONS:\n${JSON.stringify(observations)}` }],
      maxTokens: 2000,
      tools: [{ name: TOOL, inputSchema: openingSchema(observations.map((o) => o.ref)), description: 'Return the opening of the letter.' }],
      toolChoice: { type: 'tool', name: TOOL },
      execution: { completion: 'long-running' },
    } as Parameters<typeof runStructured>[0]);
    if (!out.ok) return null;
    const call = (out.result.content as readonly StructuredBlock[]).filter((b): b is Extract<StructuredBlock, { type: 'tool_use' }> => b.type === 'tool_use' && b.name === TOOL);
    if (call.length !== 1) return null;
    return verifyOpening(call[0]!.input, live, new Set(observations.map((o) => o.ref)), Boolean(intention));
  } catch { return null; }
}
