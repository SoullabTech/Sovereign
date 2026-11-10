/**
 * WS-WORK-CONTINUITY · Part A — history grounding. LAWS (authored before any implementation).
 *
 * Source: docs/programme/WS-WORK-CONTINUITY-STANDING-READ-SCOPE_PLAN_DRAFT_2026-11-08.md §3, §4 Part A1.
 * Witnessed defect (thread ffd2b452…, 2026-11-08): replayed history kept MAIA's earlier ANSWER but not the
 * PASSAGE behind it, so she disowned an accurate quotation ("I hadn't read it").
 *
 * ⚠️ WHAT THESE LAWS ARE AND ARE NOT. They check the SYSTEM PROMPT the Work conversation sends. A prompt law
 * constrains what the model is TOLD, never what it DOES; whether MAIA stops disowning is UNKNOWN until a live
 * walk. Keyword sets are brittle by nature and are declared as such: they pin required MEANING-BEARING words,
 * not exact wording, so an honest implementation has freedom and a wrong one still dies.
 */
export interface LawInput {
  /** The full system prompt as sent. */
  system: string;
  /** Whether prior turns were replayed to the model on this send. */
  hasHistory: boolean;
  /** Whether a passage (locus) was supplied this turn. */
  hasLocus: boolean;
}

export interface Law {
  id: string;
  statement: string;
  holds: (i: LawInput) => boolean;
}

const lc = (s: string) => s.toLowerCase();
const anyOf = (s: string, words: readonly string[]) => words.some((w) => lc(s).includes(w));
/** Sentence-level co-occurrence. A law that matched keywords ANYWHERE in the prompt was vacuous: the existing
 *  standing prompt already contains "invent"/"do not infer", so A1b passed with no implementation at all
 *  (found by the matrix on first run). Meaning-bearing words must co-occur in ONE sentence. */
const sentences = (s: string) => s.split(/(?<=[.!?])\s+|\n+/);
const someSentence = (s: string, groups: readonly (readonly string[])[]) =>
  sentences(s).some((x) => groups.every((g) => anyOf(x, g)));

export const LAWS: readonly Law[] = [
  {
    id: 'A1a-earlier-turns-may-rest-on-absent-text',
    statement:
      'With prior turns replayed, MAIA is told that her earlier turns may rest on text no longer in front of her.',
    holds: ({ system, hasHistory }) =>
      !hasHistory ||
      someSentence(system, [
        ['earlier turn', 'earlier answer', 'earlier repl', 'earlier in this conversation', 'your earlier'],
        ['no longer', 'not in front', 'not supplied', 'not given', 'not here now'],
      ]),
  },
  {
    id: 'A1b-absence-is-not-fabrication',
    statement:
      'With prior turns replayed, MAIA is told not to conclude she invented an earlier statement merely because its source text is absent now.',
    holds: ({ system, hasHistory }) =>
      !hasHistory ||
      someSentence(system, [
        ['do not conclude', 'not conclude', 'do not assume', 'not assume', 'do not infer', 'not infer'],
        ['fabricat', 'invent', 'made up', 'made it up'],
        ['earlier', 'source', 'cannot see', 'can no longer see'],
      ]),
  },
  {
    id: 'A2-no-false-history-claim-on-first-turn',
    statement: 'With NO prior turns, the prompt does not talk about earlier turns (it would assert something untrue).',
    holds: ({ system, hasHistory }) => hasHistory || !anyOf(system, ['earlier turn', 'earlier answer', 'earlier repl']),
  },
  {
    id: 'A3-unread-text-rule-preserved',
    statement: 'The standing rule "do not claim to have read anything they do not list" is never weakened or removed.',
    holds: ({ system }) => lc(system).includes('do not claim to have read anything'),
  },
  {
    id: 'A4-no-permission-to-treat-history-as-read',
    statement: 'Nothing licenses MAIA to treat her own earlier statements as text she has read.',
    holds: ({ system }) =>
      !anyOf(system, [
        'treat anything you said earlier as text you have read',
        'assume you had read',
        'you did read',
        'you have read it',
        'earlier answers are accurate',
      ]),
  },
  {
    id: 'A5-this-turn-supply-statement-preserved',
    statement: 'The statement of what text she holds THIS turn is preserved when a passage is supplied.',
    holds: ({ system, hasLocus }) => !hasLocus || system.includes('You have been given the text of exactly ONE section'),
  },
  {
    id: 'A6-grounding-is-conditional-not-categorical',
    statement:
      'Where a grounding statement is present it does not assert what she had earlier (the database does not record it); it is stated as possibility.',
    holds: ({ system, hasHistory }) => {
      const present = anyOf(system, ['earlier turn', 'earlier answer', 'earlier repl', 'earlier in this conversation']);
      if (!hasHistory || !present) return true;
      return (
        anyOf(system, ['may rest', 'may have', 'might', 'may refer', 'may be based']) &&
        !anyOf(system, ['earlier you were given', 'you were given the passage you quoted', 'you had the text'])
      );
    },
  },
];
