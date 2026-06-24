/**
 * deriveContentFeature — the pure derivation that makes "no code path from inferred member-state to
 * a surfaced offer" a *property* rather than a promise.
 *
 * An elemental invitation may only be triggered by something inspectable: present in the member's own
 * utterance or shared material, not in MAIA's inference about the member's interior.
 *
 * Kelly's boundary rule (2026-06-07): "If the feature can be shown back to the member as
 * text-on-the-table, it counts. If it requires MAIA to infer what is happening inside the member, it
 * does not." This function takes ONLY member-authored text — there is no parameter through which an
 * inferred member-state could enter. That signature *is* the wire's absence, enforced at the boundary.
 *
 * SCOPE (applying Kelly's rule to Kelly's own list): the cleanly inspectable items are implemented —
 * an explicit mode request, a reported communication event, a repeated term, multiple bundled
 * questions. The list also named "contradictions" and "unclear referents"; those are DELIBERATELY
 * EXCLUDED from v1, because reliably detecting a contradiction or an unclear referent *is itself an
 * interpretation* — it would re-import the very inference the boundary exists to keep out. They return
 * to scope only behind their own guard. Every returned feature carries `evidence`: the literal
 * text-on-the-table that justifies it (the thing that could be shown back to the member).
 *
 * STATUS: Designed → built + unit-tested. The remaining structural step is a static guard ensuring
 * no caller constructs an offer bypassing this derivation, and that `memberText` is never MAIA's own
 * draft. Not wired to any member-facing path (vessel discipline).
 */

export type ContentFeatureKind =
  | 'mode_request' // the member explicitly asks for a mode: "help me think clearly", "can we map this"
  | 'communication_event' // the member reports a comms event: "that's not what I meant"
  | 'repeated_term' // a content word the member repeats (showable: "'freedom' ×4")
  | 'multiple_questions'; // several bundled asks in one turn

export interface ContentFeatureResult {
  /** true when an inspectable, member-authored / content-structural feature is present */
  feature: boolean;
  /** which kind fired (first match in precedence order), null when none */
  kind: ContentFeatureKind | null;
  /** the text-on-the-table that justifies it — what could be shown back to the member; null when none */
  evidence: string | null;
}

const MODE_REQUEST =
  /\b(?:help me (?:think|get clear|sort this|sort it|understand|make sense)|can we (?:map|break (?:this|it) down|sort (?:this|it) out)|i need (?:words|to think|to get clear)|let'?s (?:map|break (?:this|it) down)|walk me through|help me name)\b/i;

const COMMUNICATION_EVENT =
  /\b(?:we keep (?:misunderstanding|missing each other)|that'?s not what i (?:meant|said)|talking past each other|you'?re not (?:getting|hearing) me|they don'?t (?:get|understand) me|i can'?t (?:explain|get this across)|it came out wrong|we'?re not on the same page)\b/i;

const STOPWORDS = new Set([
  'about', 'after', 'again', 'around', 'because', 'been', 'before', 'being', 'between', 'could',
  'doesn', 'doing', 'down', 'each', 'from', 'have', 'just', 'like', 'more', 'much', 'only', 'over',
  'really', 'should', 'some', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they',
  'thing', 'think', 'this', 'those', 'very', 'want', 'what', 'when', 'where', 'which', 'with',
  'would', 'your', 'youre', 'feel', 'know', 'into', 'will', 'kind',
]);

function findRepeatedTerm(text: string): string | null {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().split(/[^a-z']+/)) {
    const w = raw.replace(/'/g, '');
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 2; // require ≥3 to count
  for (const [w, n] of counts) {
    if (n > bestN) {
      best = w;
      bestN = n;
    }
  }
  return best ? `"${best}" ×${bestN}` : null;
}

function countQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

/**
 * Pure: derive an inspectable content feature from the MEMBER'S text. Side-effect-free.
 * No parameter admits an inferred member-state — that is the boundary.
 */
export function deriveContentFeature(memberText: string): ContentFeatureResult {
  const text = memberText ?? '';

  const mode = text.match(MODE_REQUEST);
  if (mode) return { feature: true, kind: 'mode_request', evidence: mode[0].trim() };

  const comms = text.match(COMMUNICATION_EVENT);
  if (comms) return { feature: true, kind: 'communication_event', evidence: comms[0].trim() };

  const repeated = findRepeatedTerm(text);
  if (repeated) return { feature: true, kind: 'repeated_term', evidence: repeated };

  if (countQuestions(text) >= 2) {
    return { feature: true, kind: 'multiple_questions', evidence: `${countQuestions(text)} bundled questions` };
  }

  return { feature: false, kind: null, evidence: null };
}
