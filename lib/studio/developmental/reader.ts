/**
 * READER-01 — what the Work has made available to a reader by here.
 *
 * A different object from the Developmental Editor, deliberately.
 *
 *     DE-02 asks:      What is happening in this Work?
 *     READER-01 asks:  What has the Work made available to a reader by here?
 *
 * This is NOT persona simulation. There is no first-time reader, no sceptical
 * academic, no therapist reader. Those produce synthetic psychology very
 * quickly — "the reader feels lost here" is a claim about a person who does
 * not exist, and it cannot be evidenced. What CAN be evidenced is what the
 * text has and has not supplied by a given point, and that turns out to be
 * the more useful thing.
 *
 * ── THE SIX LAWS, AND WHERE EACH IS ENFORCED ──────────────────────────────
 *
 *   1. NO IMAGINARY PSYCHOLOGY. MAIA may not say a reader feels bored,
 *      confused or moved. She may say the text has not yet supplied X, that Y
 *      appears before its referent, that two readings remain available.
 *      → Enforced in the stance, and by the phenomena themselves: none of the
 *        five has a place to put an emotion.
 *
 *   2. READER KNOWLEDGE IS CUMULATIVE AND POSITION-BOUND. What page 180
 *      establishes cannot excuse an ambiguity on page 40.
 *      → Enforced STRUCTURALLY: at each checkpoint MAIA is given only the text
 *        up to that point, and evidence is located only within that prefix.
 *        She cannot cite page 180 at page 40 because she has not been shown
 *        page 180. This is the same discipline as the evidence gate: make the
 *        rule a property of what the model receives, not a request.
 *
 *   3. EVIDENCE COMES FROM THE WORK ACTUALLY READ. Declared material may help
 *      MAIA understand the author's field; it is never something the reader
 *      knows.
 *      → Enforced by giving material in its own block, labelled as NOT
 *        available to the reader, and by a separate finding flag for the case
 *        where the material holds what the draft has not yet supplied.
 *
 *   4. NO CANONICAL STRUCTURE INFERENCE. "By this point in the draft", never
 *      "by the end of Movement II" unless the member declared Movement II.
 *
 *   5. NO DEFICIT SCORING. No readability, confusion, engagement, or
 *      drop-off numbers anywhere.
 *
 *   6. NO AUTOMATIC CORRECTION. A reader finding is an observation with the
 *      same seven writer dispositions as any other.
 */

import { locateQuote, type LocatedQuote } from './lenses';

export interface ReaderPhenomenon {
  id: string;
  label: string;
  blurb: string;
  ask: string;
}

/**
 * Five phenomena, each answerable from the text alone.
 *
 * Notice what is absent: nothing about interest, pace-as-experience, or
 * emotional response. Those require a reader who does not exist. These five
 * are questions about what the page has supplied.
 */
export const READER_PHENOMENA: ReaderPhenomenon[] = [
  {
    id: 'knowledge',
    label: 'Knowledge',
    blurb: 'What the Work has actually established by here.',
    ask: `What has this Work ESTABLISHED so far — concepts, people, situations, premises, terms? Name only what the text itself has supplied, and quote where each was established. Do not list what a reader might know from elsewhere.`,
  },
  {
    id: 'referents',
    label: 'Referents',
    blurb: 'Something named before there is ground to know what it means.',
    ask: `Where does the text refer to something — a term, a name, an allusion, an "it" or "this" — before it has given a reader ground to know what is meant? Quote the reference. If the ground appears earlier, this is not a finding.`,
  },
  {
    id: 'dependencies',
    label: 'Dependencies',
    blurb: 'A passage resting on something the Work has not yet supplied.',
    ask: `Where does a passage seem to REQUIRE knowledge the Work has not supplied by this point? Quote the passage and say what it appears to rest on. Distinguish knowledge the Work owes a reader from knowledge it is reasonable to assume of anyone.`,
  },
  {
    id: 'promises',
    label: 'Promises',
    blurb: 'What the Work raised, and whether it has returned to it.',
    ask: `What has the Work raised — a question, an image, a claim, a person — and not yet returned to? Quote where it was raised. An open promise is NOT automatically a defect: a Work may be holding it deliberately. Say what is open, not what is wrong.`,
  },
  {
    id: 'openness',
    label: 'Openness',
    blurb: 'Where more than one reading is genuinely available.',
    ask: `Where does the text legitimately support more than one reading? Quote it and name the readings. Then say whether the openness seems to come from the writing doing something deliberate, or from grounding the Work has not supplied — and be honest when you cannot tell.`,
  },
];

export function phenomenonById(id: string): ReaderPhenomenon | null {
  return READER_PHENOMENA.find((p) => p.id === id) ?? null;
}

// ---- checkpoints --------------------------------------------------------

export interface Checkpoint {
  /** The member's own label for where this lands, e.g. a chapter heading. */
  label: string;
  /** Characters of the Work a reader has by here. Evidence lives in [0, offset). */
  offset: number;
  index: number;
}

/**
 * Where the reading pauses to ask what is available.
 *
 * Checkpoints land on the parts the member carried in, because those are the
 * seams a reader actually experiences. A Work with no parts gets checkpoints
 * at even intervals — which is honest, and labelled as such rather than
 * dressed up as structure the writer never declared (Law 4).
 */
export const UNPARTED_CHECKPOINTS = 4;

export function checkpointsFor(
  contentLength: number,
  parts: { label: string; start: number; end: number }[],
): Checkpoint[] {
  if (contentLength <= 0) return [];

  if (parts.length > 0) {
    const ordered = [...parts].sort((a, b) => a.start - b.start);
    return ordered.map((part, index) => ({
      label: `through ${part.label}`,
      offset: Math.min(contentLength, part.end),
      index,
    }));
  }

  const step = Math.ceil(contentLength / UNPARTED_CHECKPOINTS);
  const out: Checkpoint[] = [];
  for (let i = 1; i <= UNPARTED_CHECKPOINTS; i += 1) {
    const offset = Math.min(contentLength, step * i);
    out.push({
      // Never "by the end of Part Two". The Work declared no parts, so the
      // label says what it actually is: a distance into the draft.
      label: `through the first ${Math.round((offset / contentLength) * 100)}% of the draft`,
      offset,
      index: i - 1,
    });
    if (offset >= contentLength) break;
  }
  return out;
}

/** Everything a reader has by this checkpoint, and nothing after it. */
export function prefixFor(content: string, checkpoint: Checkpoint): string {
  return content.slice(0, checkpoint.offset);
}

/**
 * The prefix is bounded so a long Work stays readable in one pass, and the
 * truncation is stated to MAIA rather than hidden: a reader who has read 200
 * pages HAS read them, so silently dropping the middle would make her report
 * things unavailable that the Work supplied.
 */
export const PREFIX_BUDGET_CHARS = 40_000;

export interface PreparedPrefix {
  text: string;
  /** True when the middle was elided; MAIA is told, and told where. */
  elided: boolean;
}

export function preparePrefix(content: string, checkpoint: Checkpoint): PreparedPrefix {
  const full = prefixFor(content, checkpoint);
  if (full.length <= PREFIX_BUDGET_CHARS) return { text: full, elided: false };

  // Keep the opening (where a Work establishes most of what it establishes)
  // and the approach to the checkpoint (where the question is being asked).
  const head = Math.floor(PREFIX_BUDGET_CHARS * 0.45);
  const tail = PREFIX_BUDGET_CHARS - head;
  return {
    text: `${full.slice(0, head)}\n\n[…a stretch of the Work you have not been shown…]\n\n${full.slice(full.length - tail)}`,
    elided: true,
  };
}

// ---- the gate, position-bound ------------------------------------------

export interface RawReaderFinding {
  title?: unknown;
  observation?: unknown;
  why?: unknown;
  confidence?: unknown;
  quotes?: unknown;
  onlyInMaterial?: unknown;
}

export interface ValidReaderFinding {
  phenomenon: string;
  title: string;
  observation: string;
  why: string | null;
  confidence: 'high' | 'medium' | 'low';
  /**
   * The surrounding material supplies this and the draft does not. The single
   * most useful thing this reading produces, and the reason material is given
   * at all — but it is a claim about the DRAFT, never reader knowledge.
   */
  onlyInMaterial: boolean;
  evidence: LocatedQuote[];
}

export interface ReaderValidation {
  findings: ValidReaderFinding[];
  dropped: { title: string; reason: string }[];
}

const RANKS = new Set(['high', 'medium', 'low']);

/**
 * Language that asserts an inner state MAIA cannot evidence.
 *
 * Law 1 is a prompt instruction and also this: a finding that tells the writer
 * how a reader FEELS is refused, because the writer will act on it and there
 * is no reader. The wording is checked on the observation, not the quotes —
 * a Work is entitled to say a character felt lost.
 */
const PSYCHOLOGY =
  /\b(the |a )?readers?\b[^.]{0,60}\b(feels?|felt|will feel|would feel|is|are|becomes?|gets?)\s+(bored|confused|lost|frustrated|engaged|invested|moved|inspired|hooked|impatient|overwhelmed|disoriented|alienated|excited|bewildered)\b/i;

export function validateReaderFindings(
  raw: unknown,
  prefix: string,
  phenomenon: string,
  prefixStart = 0,
): ReaderValidation {
  const list = Array.isArray(raw) ? raw : [];
  const findings: ValidReaderFinding[] = [];
  const dropped: { title: string; reason: string }[] = [];

  for (const item of list) {
    const f = (item ?? {}) as RawReaderFinding;
    const title = typeof f.title === 'string' ? f.title.trim() : '';
    const observation = typeof f.observation === 'string' ? f.observation.trim() : '';
    if (!title || !observation) {
      dropped.push({ title: title || '(untitled)', reason: 'no observation' });
      continue;
    }

    if (PSYCHOLOGY.test(observation)) {
      // Law 1. A claim about how a reader feels cannot be evidenced from the
      // page, and a writer will act on it as if it could.
      dropped.push({ title, reason: 'asserts a reader state rather than what the text supplied' });
      continue;
    }

    const quotes = Array.isArray(f.quotes) ? f.quotes : [];
    const located: LocatedQuote[] = [];
    const seen = new Set<number>();
    for (const quote of quotes) {
      if (typeof quote !== 'string') continue;
      // Law 2, enforced: located within the PREFIX only. A passage after the
      // checkpoint is not something the reader has, so it cannot be evidence
      // for what is available here.
      const hit = locateQuote(prefix, quote);
      if (hit && !seen.has(hit.start)) {
        seen.add(hit.start);
        located.push({
          start: hit.start + prefixStart,
          end: hit.end + prefixStart,
          quote: hit.quote,
        });
      }
    }

    if (located.length === 0) {
      dropped.push({ title, reason: 'no quote could be located in what the reader has read' });
      continue;
    }

    findings.push({
      phenomenon,
      title,
      observation,
      why: typeof f.why === 'string' && f.why.trim() ? f.why.trim() : null,
      confidence:
        typeof f.confidence === 'string' && RANKS.has(f.confidence)
          ? (f.confidence as 'high' | 'medium' | 'low')
          : 'medium',
      onlyInMaterial: f.onlyInMaterial === true,
      evidence: located.sort((a, b) => a.start - b.start),
    });
  }

  return { findings, dropped };
}

// ---- the prompt ---------------------------------------------------------

const READER_STANCE = `You are MAIA, reading a writer's Work the way a first reader necessarily reads it: forward, once, without knowing what comes later.

Your question is narrow and specific: WHAT HAS THIS WORK MADE AVAILABLE SO FAR?

You are not simulating a person. You will never say a reader feels bored, confused, lost, engaged or moved — you cannot know that, and a writer will act on it as though you could. Say what the text has supplied and what it has not.

WHAT YOU HAVE BEEN GIVEN
Everything up to a point in the Work, and nothing after it. This is deliberate. What the Work establishes on its last page cannot make its opening clear. If something is unavailable here, say so — even if you suspect the Work resolves it later. That suspicion is not knowledge you have.

WHAT A GOOD OBSERVATION IS
- It names something the text has or has not supplied, with the passage that shows it.
- It quotes verbatim from what you were given, long enough to find again.
- It distinguishes what the Work owes a reader from what any reader brings.

WHAT IS NOT AN OBSERVATION
- Any claim about a reader's feelings, attention, or patience.
- A score, a rating, a percentage, or a judgement of readability.
- Advice about what to change. You are noticing, not correcting.
- Praise.

STRUCTURE YOU WERE NOT GIVEN
Say "by this point in the draft". Never "by the end of the second movement" unless the writer declared movements.

NEVER invent, paraphrase or compose a quote. Every quoted passage must appear WORD FOR WORD in the text you were given.`;

export interface ReaderPromptParams {
  phenomenon: string;
  checkpointLabel: string;
  workTitle: string | null;
  declaredForm: string | null;
  elided: boolean;
  /**
   * Declared material, given ONLY so MAIA can tell the writer when the
   * surrounding material holds something the draft has not yet supplied.
   * It is never reader knowledge (Law 3).
   */
  materials: { kind: string; label: string; excerpt: string | null }[];
}

export function buildReaderPrompt(params: ReaderPromptParams): string {
  const phenomenon = phenomenonById(params.phenomenon);
  const lines = [READER_STANCE, ''];

  lines.push(`WHAT YOU ARE ATTENDING TO — ${phenomenon?.label ?? params.phenomenon}`);
  lines.push(phenomenon?.ask ?? '');
  lines.push('', `WHERE THE READER STANDS: ${params.checkpointLabel}.`);

  if (params.elided) {
    lines.push(
      'NOTE: a stretch of what the reader has read was not included, and is marked in the text. Do not report something as unavailable if it may have been in that stretch — say you cannot tell.',
    );
  }

  lines.push(
    '',
    params.workTitle
      ? `The writer calls this Work: "${params.workTitle}".`
      : 'The writer has not named this Work.',
  );
  if (params.declaredForm) {
    lines.push(`They call it: "${params.declaredForm}". Read it as that.`);
  }

  if (params.materials.length > 0) {
    lines.push(
      '',
      'THE WRITER\'S SURROUNDING MATERIAL — THE READER DOES NOT HAVE THIS.',
      'It is here for one purpose: so you can tell the writer when their material makes something clear that the DRAFT has not yet made available. Never treat it as something the reader knows, and never quote it as evidence.',
    );
    for (const m of params.materials) {
      lines.push(`  - [${m.kind}] ${m.label}`);
      if (m.excerpt) {
        lines.push('    <<<MATERIAL');
        lines.push(`    ${m.excerpt.replace(/\n/g, '\n    ')}`);
        lines.push('    MATERIAL>>>');
      }
    }
  }

  lines.push(
    '',
    'ANSWER WITH JSON ONLY — no prose before or after, no code fence:',
    '{"findings":[{"title":"short, specific","observation":"what the text has or has not supplied","why":"what made you notice","confidence":"high|medium|low","onlyInMaterial":false,"quotes":["a sentence copied exactly from what you were given"]}]}',
    '',
    'Set onlyInMaterial true ONLY when the writer\'s material supplies something the draft has not. That is a statement about the draft, not about the reader.',
    '',
    'Between zero and five findings. If the Work has made everything it needs available by here, answer {"findings":[]}. That is a real answer and a good one.',
  );

  return lines.join('\n');
}
