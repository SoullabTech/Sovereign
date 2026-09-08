/**
 * WS2-ENCOUNTER-01 · E2 — the structural screen.
 *
 * This is the executable half of the ratified vocabulary (E1, amendments A1–A5).
 * It enforces what CAN be proven mechanically. It does not pretend to be the
 * whole constitutional boundary:
 *
 *   The lexicon catches wording. Only the constitutional test catches moves.
 *
 * The residue lives in the retained semantic-ear corpus (`semanticEar.ts`), which
 * is acceptance evidence and is deliberately NOT dressed up as a deterministic
 * falsifier. A regex pretending to understand expectation would be worse than an
 * honest limit.
 *
 * ── FAILING CLOSED ────────────────────────────────────────────────────────
 *
 * A candidate that trips any rule is DROPPED, not repaired and not reported to
 * the writer. Pre-intervention fails closed toward silence: if uncertain between
 * Encounter and DEVELOP, Encounter loses. And the writer is never told that
 * something was withheld — the system's lack of an observation is not
 * information about the Work.
 */
import { ENCOUNTER_FAMILIES, isEncounterFamily, type CandidateNotice } from './contract';

export type ScreenViolation =
  | 'not_a_family'
  | 'recollection_as_notice'
  | 'deficit_lexicon'
  | 'obligation_modal'
  | 'comparative_quality'
  | 'prescription_verb'
  | 'invitation_to_edit'
  | 'standard_importing'
  | 'imputed_volition'
  | 'unbounded_absence'
  | 'reader_effect'
  | 'unanchored';

/** Word-boundary matcher over a lowercased, punctuation-normalized string. */
const has = (text: string, patterns: readonly string[]) =>
  patterns.some((p) => new RegExp(`(^|[^a-z])${p}([^a-z]|$)`, 'i').test(text));

/* E1 §2.2 — the forbidden lexical families, verbatim in intent. */
const DEFICIT = [
  'missing', 'gap', 'gaps', 'absence', 'loose end', 'loose ends', 'weakness', 'weaknesses',
  'problem', 'problems', 'issue', 'issues', 'opportunity', 'opportunities', 'shortcoming',
  'underdeveloped', 'overexplained', 'over-explained', 'unclear', 'thin', 'weak',
  'unresolved', 'abandoned', 'undercooked', 'flat', 'lacking', 'lacks',
];
const OBLIGATION = [
  'should', 'needs to', 'need to', 'ought', 'must', 'has to', 'have to',
  'could be', 'would benefit', 'might benefit', 'deserves',
];
const COMPARATIVE = [
  'strongest', 'weakest', 'best', 'worst', 'better', 'worse', 'more effective',
  'less effective', 'the only place', 'nowhere else', 'more than anywhere',
  'most powerful', 'most vivid', 'beautiful', 'stunning', 'masterful', 'brilliant',
];
const PRESCRIPTION = [
  'fix', 'improve', 'strengthen', 'tighten', 'cut', 'trim', 'expand', 'resolve',
  'develop further', 'open further', 'flesh out', 'rework', 'revise',
];
const INVITATION = [
  'consider', 'why not', 'have you thought', 'you could', 'you might', 'one option',
  'perhaps you', 'it may be worth',
];
const STANDARD = [
  "doesn't work", 'does not work', 'loses the reader', 'fails to', 'departs from',
  'contradicts', 'inconsistent with', 'breaks down',
];
/** Reader-effect claims: the Work measured by what it does to someone. */
const READER_EFFECT = [
  'the reader', 'readers', 'the audience', 'loses orientation', 'confusing',
];
/**
 * A2/FG-2 — imputed volition. The move that carries no forbidden word:
 * predicating wanting, waiting, needing or trying of the Work turns a bounded
 * textual fact into an unfulfilled expectation, which is a developmental case
 * with the vocabulary filed off.
 */
const VOLITION = [
  'wants', 'wanting', 'waiting', 'waits', 'asks to be', 'trying to', 'tries to',
  'seems to want', 'yearns', 'reaching for', 'calls out for', 'begs',
];
/** E1 §3.2 — absence measured against an expected standard, never bounded non-return. */
const UNBOUNDED_ABSENCE = [
  'has no', 'there is no', 'there are no', 'never resolves', 'never establishes',
  'no clear', 'without any', 'none of the', 'fails to establish',
];

/**
 * Screen one candidate. Returns the violations found; empty means lawful *as far
 * as this instrument can tell*, which is not the same as lawful.
 */
export function screenCandidate(c: CandidateNotice): ScreenViolation[] {
  const v: ScreenViolation[] = [];
  const t = c.text.toLowerCase();

  /* A5: RECOLLECTION is not available to be selected. A generator reaching for
     it is trying to author the writer's memory. */
  if (String(c.family).toLowerCase() === 'recollection') v.push('recollection_as_notice');
  else if (!isEncounterFamily(c.family)) v.push('not_a_family');

  if (has(t, DEFICIT)) v.push('deficit_lexicon');
  if (has(t, OBLIGATION)) v.push('obligation_modal');
  if (has(t, COMPARATIVE)) v.push('comparative_quality');
  if (has(t, PRESCRIPTION)) v.push('prescription_verb');
  if (has(t, INVITATION)) v.push('invitation_to_edit');
  if (has(t, STANDARD)) v.push('standard_importing');
  if (has(t, READER_EFFECT)) v.push('reader_effect');
  if (has(t, VOLITION)) v.push('imputed_volition');
  if (has(t, UNBOUNDED_ABSENCE)) v.push('unbounded_absence');

  /* A4: an observation with no anchor is an impression about the book. */
  if (!Array.isArray(c.anchors) || c.anchors.length === 0) v.push('unanchored');

  return v;
}

export const LAWFUL_FAMILIES = ENCOUNTER_FAMILIES;
