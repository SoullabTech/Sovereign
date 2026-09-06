/**
 * reflection_opening_v1 — Reflections' first-turn response-form contract.
 *
 * ── WHAT THIS IS, AND WHAT IT IS NOT ──────────────────────────────────────
 *
 * This is COMPOSITION, not cognition. It does not change what constitutes the
 * canonical turn — identity, inputs, authority, candidates, gates and the
 * cognition path all remain CMT-01's (`lib/maia/canonical-turn/**`), untouched.
 * It changes only how the already-canonical cognition is asked to compose its
 * FIRST reply at one room-specific threshold: the member bringing a kept
 * reflection into conversation.
 *
 * ── THE ATTRIBUTION LAW THIS EXISTS TO ENFORCE ────────────────────────────
 *
 *   model produces noticed + asked
 *        -> server returns structured fields
 *        -> UI labels them
 *
 *   NOT
 *
 *   model produces prose
 *        -> UI guesses which sentence was "noticed" and which was "asked"
 *
 * The labels must be true because the model produced them, not because the
 * interface arranged them. A UI that split prose into `MAIA noticed` /
 * `MAIA asked` would assert a structure the cognition never produced — the same
 * defect family as a paraphrase inside quotation marks.
 *
 * ── FAIL TRUTHFULLY ───────────────────────────────────────────────────────
 *
 * If structured generation does not yield BOTH a `noticed` and an `asked`,
 * `parseReflectionOpening` returns null and the caller must render no labels.
 * There is deliberately no prose fallback: falling back to conversational text
 * and labelling it anyway would recreate the exact attribution defect the form
 * exists to prevent.
 *
 * ── AUTHORITY ─────────────────────────────────────────────────────────────
 *
 * The instruction is SERVER-AUTHORED. A caller may signal that this is the
 * Reflections handoff seam; it may never supply, alter or override the form
 * text. On the serving route the instruction is placed in the server-authored
 * field class, which sits below the client rest-spread per the PROMPT-AUTHORITY
 * INVARIANT (PBR-001, 2026-08-12) and therefore wins any collision.
 */

export const REFLECTION_OPENING_V1 = 'reflection_opening_v1' as const;

/** Markers the model is instructed to emit. Unlikely in ordinary MAIA prose. */
const NOTICED_MARKER = 'NOTICED:';
const ASKED_MARKER = 'ASKED:';

export interface ReflectionOpening {
  noticed: string;
  asked: string;
}

/**
 * The server-authored instruction. Never accepted from a caller, never
 * assembled on the client.
 */
export function buildReflectionOpeningAddendum(): string {
  return [
    '## RESPONSE FORM — reflection_opening_v1',
    '',
    'The member has brought a reflection they kept into conversation. This is the',
    'first turn at that threshold. Compose this one reply as exactly two parts,',
    'each on its own line, using these literal markers:',
    '',
    `${NOTICED_MARKER} one concise observation grounded in what the member actually wrote.`,
    `${ASKED_MARKER} one genuine question arising from that observation.`,
    '',
    'Constraints:',
    '- The observation must be grounded in the reflection as written. If you refer',
    '  to the member\'s words, quote them exactly or do not use quotation marks.',
    '- The question must be a real question, ending in a question mark, and must',
    '  follow from the observation rather than changing the subject.',
    '- Two lines only. No preamble, no sign-off, no additional sections.',
    '- Do not interpret what the reflection means about the member. Notice what is',
    '  there; ask what you do not know.',
  ].join('\n');
}

/**
 * Parse a model reply into the structured form.
 *
 * Returns null — never a partial or coerced result — when the reply does not
 * genuinely carry both parts. Callers MUST treat null as "render no labels".
 */
export function parseReflectionOpening(raw: string | null | undefined): ReflectionOpening | null {
  if (!raw || typeof raw !== 'string') return null;

  const noticedIdx = raw.indexOf(NOTICED_MARKER);
  const askedIdx = raw.indexOf(ASKED_MARKER);

  // Both markers required, and in order. A reply carrying only one of them is
  // not a reflection opening, however good the prose is.
  if (noticedIdx === -1 || askedIdx === -1 || askedIdx <= noticedIdx) return null;

  const noticed = raw.slice(noticedIdx + NOTICED_MARKER.length, askedIdx).trim();
  const asked = raw.slice(askedIdx + ASKED_MARKER.length).trim();

  if (!noticed || !asked) return null;

  // `asked` must actually be a question. If the model produced a statement, the
  // label "MAIA asked" would be false, so this fails rather than mislabels.
  if (!asked.endsWith('?')) return null;

  return { noticed, asked };
}

/**
 * The durable assistant text for the canonical thread.
 *
 * The exchange persisted to the conversation carries the same semantic content
 * the inline presentation displays — one exchange, two presentations — without
 * the machine markers leaking into the transcript the member later re-reads in
 * the sheet.
 */
export function composeReflectionOpeningText(opening: ReflectionOpening): string {
  return `${opening.noticed}\n\n${opening.asked}`;
}
