/**
 * DE-01 — Developmental Review: the lenses, and the evidence gate.
 *
 * Pure and framework-free. Everything that decides WHAT MAIA is asked and
 * WHETHER a finding is allowed to exist lives here, so the doctrine is
 * testable without a model call or a database.
 *
 * The load-bearing piece is `locateQuote` and the validation built on it. A
 * developmental finding is only as good as the passage it points at, and a
 * model asked for quotes will sometimes produce a plausible sentence that is
 * not in the book. So every quote MAIA returns is located in the snapshot she
 * was actually given; a finding whose quotes cannot be found is DROPPED, not
 * shown with a caveat. That is the difference between inspectable editorial
 * reasoning and an opinion with citations attached.
 */

export const LENSES = [
  {
    id: 'whole_work',
    label: 'Whole Work',
    /** What this lens is for, in the writer's terms. Rendered in the UI. */
    blurb: 'What the Work seems to be doing, and where it asks for attention.',
    ask: `Read the whole Work. What is it doing? Where is its promise clearest, and where does it soften? Do not summarise the content back — say what you notice about how it moves and what it is asking of a reader.`,
  },
  {
    id: 'movement',
    label: 'Movement',
    blurb: 'How the Work travels — rhythm, pacing, where it slows or leaps.',
    ask: `Attend to movement: rhythm, pacing, the distance between one kind of writing and the next. Where does the Work travel well, and where does it stall, leap, or repeat its own motion? Name where, with passages.`,
  },
  {
    id: 'threads',
    label: 'Threads',
    blurb: 'What recurs, and whether it is developing or repeating.',
    ask: `Attend to threads: images, questions, terms and preoccupations that recur. For each, is it DEVELOPING across the Work or merely repeating? A thread that appears three times unchanged is different from one that deepens.`,
  },
  {
    id: 'continuity',
    label: 'Continuity',
    blurb: 'Where the Work contradicts, drops, or forgets itself.',
    ask: `Attend to continuity: something introduced and never returned to, a term used two ways, a claim made and later contradicted, a promise the opening makes that the Work does not keep. Be specific and cite both places.`,
  },
  {
    id: 'reader',
    label: 'Reader',
    blurb: 'What a reader is carrying, and where they may lose the thread.',
    ask: `Read as a first-time reader would. Where are they oriented, and where might they lose the thread, feel talked at, or not know why they are being told this? You are describing a reader's likely experience, not prescribing a fix.`,
  },
] as const;

export type LensId = (typeof LENSES)[number]['id'];

export function lensById(id: string): (typeof LENSES)[number] | null {
  return LENSES.find((l) => l.id === id) ?? null;
}

/**
 * Form sensitivity — WITHOUT imposing a schema.
 *
 * The refusal here is deliberate and specific: no lens ever tells MAIA to look
 * for an inciting incident, a midpoint, or a beat sheet unless the writer's
 * own declared form is one those belong to. A book of elemental philosophy
 * read against three-act structure produces confident nonsense, and confident
 * nonsense is worse than silence.
 *
 * An UNDECLARED form is a correct state. It yields the universal guidance and
 * an instruction to ask rather than assume.
 */
export function formGuidance(declaredForm: string | null): string {
  const form = (declaredForm ?? '').trim().toLowerCase();
  if (!form) {
    return `THE WRITER HAS NOT DECLARED WHAT KIND OF WORK THIS IS. Do not assume one. Read it on its own terms, and if the kind of Work genuinely changes what you would notice, say so and ask rather than picking one.`;
  }
  if (/(novel|fiction|story|short stor)/.test(form)) {
    return `The writer calls this: "${declaredForm}". Character, scene function, stakes and consequence are fair to attend to. Do NOT check it against a beat sheet or a three-act template unless the writer asks for that lens by name.`;
  }
  if (/(memoir|autobiograph|life writ)/.test(form)) {
    return `The writer calls this: "${declaredForm}". Narrative distance, the movement between scene and reflection, and what meaning is being made are fair to attend to. Do not treat it as a novel with a protagonist to be optimised.`;
  }
  if (/(dissertation|thesis|academic|research|paper)/.test(form)) {
    return `The writer calls this: "${declaredForm}". Argument, the scaffolding of concepts, the relationship of evidence to claim, and what a reader is assumed to know already are fair to attend to. Voice matters less than whether the argument holds and can be followed.`;
  }
  if (/(spiritual|philosoph|teaching|practice|alchem|sacred|shaman)/.test(form)) {
    return `The writer calls this: "${declaredForm}". Attend to the relationship between concept and lived experience, between teaching and story, and to language that closes meaning versus language that opens it. Do NOT impose narrative structure on a Work that is not a narrative.`;
  }
  if (/(guide|handbook|manual|nonfiction|non-fiction|workbook|curricul|course)/.test(form)) {
    return `The writer calls this: "${declaredForm}". Attend to the central promise, whether each part earns its place for the reader it is for, and where explanation outruns grounding.`;
  }
  return `The writer calls this: "${declaredForm}". Read it as that, on its own terms. Do not substitute a form you know better.`;
}

// ---- segmentation ------------------------------------------------------

export interface Segment {
  label: string;
  start: number;
  end: number;
  text: string;
}

/** Roughly one model-readable pass. Segments are cut on part boundaries first. */
export const SEGMENT_TARGET_CHARS = 18000;

export interface PartRange {
  label: string;
  start: number;
  end: number;
}

/**
 * Cut the snapshot into readable segments.
 *
 * Parts the member carried in are the natural seams, so they are used when
 * present. A part longer than the target is split further, and the split is
 * LABELLED as a continuation rather than silently renumbered — a writer told
 * "Chapter 7" must be able to find chapter 7.
 */
export function segment(content: string, parts: PartRange[]): Segment[] {
  const seams: PartRange[] =
    parts.length > 0
      ? [...parts].sort((a, b) => a.start - b.start)
      : [{ label: 'The manuscript', start: 0, end: content.length }];

  const out: Segment[] = [];
  for (const part of seams) {
    const start = Math.max(0, part.start);
    const end = Math.min(content.length, part.end);
    if (end <= start) continue;
    if (end - start <= SEGMENT_TARGET_CHARS) {
      out.push({ label: part.label, start, end, text: content.slice(start, end) });
      continue;
    }
    let cursor = start;
    let piece = 1;
    while (cursor < end) {
      // Prefer a paragraph break near the target so a segment does not open
      // mid-sentence, which changes how a reader (and a model) hears it.
      const hardEnd = Math.min(end, cursor + SEGMENT_TARGET_CHARS);
      let cut = hardEnd;
      if (hardEnd < end) {
        const back = content.lastIndexOf('\n\n', hardEnd);
        if (back > cursor + SEGMENT_TARGET_CHARS / 2) cut = back;
      }
      out.push({
        label: piece === 1 ? part.label : `${part.label} (continued, ${piece})`,
        start: cursor,
        end: cut,
        text: content.slice(cursor, cut),
      });
      cursor = cut;
      piece += 1;
    }
  }
  return out;
}

// ---- the evidence gate -------------------------------------------------

export interface LocatedQuote {
  start: number;
  end: number;
  quote: string;
}

/** Collapse runs of whitespace so a quote that differs only in wrapping still matches. */
function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Find a quote in the snapshot, returning its REAL offsets or null.
 *
 * Two passes. Exact first — cheap and unambiguous. Then a whitespace-tolerant
 * pass, because a model re-wrapping a quoted paragraph is a formatting
 * difference, not a fabrication. Anything beyond that (a paraphrase, a
 * composite, an invented line) does not match, and is meant not to.
 *
 * Very short quotes are refused outright: "the" appears everywhere, and a
 * match that could be anywhere is not evidence of anything.
 */
export const MIN_QUOTE_CHARS = 24;

export function locateQuote(content: string, quote: string): LocatedQuote | null {
  const wanted = normalize(quote);
  if (wanted.length < MIN_QUOTE_CHARS) return null;

  const exact = content.indexOf(quote);
  if (exact !== -1) return { start: exact, end: exact + quote.length, quote };

  // Whitespace-tolerant: walk the content building a normalized form while
  // remembering where each normalized character came from.
  const map: number[] = [];
  let flat = '';
  let inSpace = false;
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    if (/\s/.test(ch)) {
      if (!inSpace && flat.length > 0) {
        flat += ' ';
        map.push(i);
      }
      inSpace = true;
    } else {
      flat += ch;
      map.push(i);
      inSpace = false;
    }
  }
  const at = flat.indexOf(wanted);
  if (at === -1) return null;
  const start = map[at];
  const lastIndex = at + wanted.length - 1;
  const end = map[lastIndex] + 1;
  return { start, end, quote: content.slice(start, end) };
}

export interface RawFinding {
  lens?: unknown;
  title?: unknown;
  observation?: unknown;
  why?: unknown;
  confidence?: unknown;
  /**
   * Kept in the shape only so an older or chattier model answer parses. It is
   * read by nothing: importance is not MAIA's to assign, and reach is derived
   * from the evidence instead.
   */
  priority?: unknown;
  quotes?: unknown;
}

export interface ValidFinding {
  lens: LensId;
  title: string;
  observation: string;
  why: string | null;
  /** MAIA's own stated uncertainty. Hers to say, and marked as hers. */
  confidence: 'high' | 'medium' | 'low';
  /** How much of the Work the evidence spans. A fact, not an importance. */
  reach: Reach;
  /** The inspectable arithmetic behind the reach, shown to the writer. */
  reachBasis: string;
  evidence: LocatedQuote[];
}

export type Reach = 'wide' | 'moderate' | 'narrow';

/**
 * Reach — how much of the Work the evidence spans. Arithmetic, and named for
 * exactly what it measures.
 *
 * This was called "priority", which was a lie by vocabulary. A contradiction
 * evidenced by a single passage may matter enormously; a harmless repeated
 * phrase may span six chapters. Reach describes the evidence, not the
 * importance — importance is the writer's to assign, and nothing here assigns
 * it on their behalf.
 *
 * The basis string travels with it, so the label is always inspectable.
 */
export function deriveReach(
  evidence: LocatedQuote[],
  parts: PartRange[],
): { reach: Reach; reachBasis: string } {
  const passages = evidence.length;
  const touched = new Set<string>();
  for (const e of evidence) {
    const part = parts.find((p) => e.start >= p.start && e.start < p.end);
    touched.add(part ? part.label : '—');
  }
  const spread = touched.size;
  const basis = `${passages} passage${passages === 1 ? '' : 's'} across ${spread} part${spread === 1 ? '' : 's'}`;

  if (spread >= 3 || passages >= 6) return { reach: 'wide', reachBasis: basis };
  if (spread >= 2 || passages >= 3) return { reach: 'moderate', reachBasis: basis };
  return { reach: 'narrow', reachBasis: basis };
}

export interface ValidationResult {
  findings: ValidFinding[];
  /** Findings refused, and why — surfaced in logs, never silently swallowed. */
  dropped: { title: string; reason: string }[];
}

const RANK = new Set(['high', 'medium', 'low']);

function asRank(value: unknown, fallback: 'high' | 'medium' | 'low') {
  return typeof value === 'string' && RANK.has(value)
    ? (value as 'high' | 'medium' | 'low')
    : fallback;
}

/**
 * The gate. A finding survives only if it names a lens we asked for, says
 * something, and points at passages that are genuinely in the text MAIA read.
 */
export function validateFindings(
  raw: unknown,
  content: string,
  lens: LensId,
  parts: PartRange[] = [],
): ValidationResult {
  const list = Array.isArray(raw) ? raw : [];
  const findings: ValidFinding[] = [];
  const dropped: { title: string; reason: string }[] = [];

  for (const item of list) {
    const f = (item ?? {}) as RawFinding;
    const title = typeof f.title === 'string' ? f.title.trim() : '';
    const observation = typeof f.observation === 'string' ? f.observation.trim() : '';
    if (!title || !observation) {
      dropped.push({ title: title || '(untitled)', reason: 'no observation' });
      continue;
    }

    const quotes = Array.isArray(f.quotes) ? f.quotes : [];
    const located: LocatedQuote[] = [];
    const seen = new Set<number>();
    for (const q of quotes) {
      if (typeof q !== 'string') continue;
      const hit = locateQuote(content, q);
      // The same passage cited twice is one piece of evidence, not two.
      if (hit && !seen.has(hit.start)) {
        seen.add(hit.start);
        located.push(hit);
      }
    }

    if (located.length === 0) {
      dropped.push({ title, reason: 'no quote could be located in the text' });
      continue;
    }

    const ordered = located.sort((a, b) => a.start - b.start);
    findings.push({
      lens,
      title,
      observation,
      why: typeof f.why === 'string' && f.why.trim() ? f.why.trim() : null,
      confidence: asRank(f.confidence, 'medium'),
      // Whatever MAIA said about importance is discarded here on purpose.
      ...deriveReach(ordered, parts),
      evidence: ordered,
    });
  }

  return { findings, dropped };
}

// ---- prompts -----------------------------------------------------------

const READER_STANCE = `You are MAIA, reading a writer's Work as a developmental editor.

You are not editing. You will not rewrite, suggest replacement prose, or produce a corrected version of anything. You are reading closely and saying what you see.

You are also not grading. Do not score the Work, rate it, or say how complete it is. There is no percentage anywhere in your answer.

WHAT A GOOD FINDING IS
- It names something SPECIFIC that is true of this Work, not of books in general.
- It quotes the passages that made you notice — verbatim, copied exactly from the text you were given, long enough to be found again (a full sentence or more).
- It says WHY you noticed, so the writer can disagree with your reasoning and not just your conclusion.
- It is honest about confidence. "low" is a real and useful answer.

WHAT IS NOT A FINDING
- Praise. The writer is not asking to be encouraged.
- Generic craft advice ("show don't tell", "vary sentence length").
- A summary of what a section says.
- Anything you cannot point at.

NEVER invent, paraphrase, reconstruct, or compose a quote. Every quoted passage must appear WORD FOR WORD in the text given to you. A finding you cannot evidence should be left out.`;

export function buildLensPrompt(params: {
  lens: LensId;
  declaredForm: string | null;
  workTitle: string | null;
  workPurpose: string | null;
  materials: { kind: string; label: string; sentence: string | null }[];
}): string {
  const lens = lensById(params.lens);
  const lines = [READER_STANCE, '', `THIS READING'S LENS — ${lens?.label ?? params.lens}`, lens?.ask ?? ''];
  lines.push('', formGuidance(params.declaredForm));
  lines.push(
    '',
    params.workTitle
      ? `The writer calls this Work: "${params.workTitle}".`
      : 'The writer has not named this Work.',
  );
  if (params.workPurpose) {
    lines.push(`In their own words, what they are making: "${params.workPurpose}"`);
  }
  if (params.materials.length > 0) {
    lines.push('', 'Material the writer declared feeds this Work (context only — you were not given its contents):');
    for (const m of params.materials) {
      lines.push(`  - [${m.kind}] ${m.label}${m.sentence ? ` — they wrote: "${m.sentence}"` : ''}`);
    }
  }
  lines.push(
    '',
    'ANSWER WITH JSON ONLY — no prose before or after, no code fence:',
    '{"findings":[{"title":"short, specific","observation":"what you notice","why":"what made you notice it","confidence":"high|medium|low","quotes":["a full sentence copied exactly from the text","another"]}]}',
    '',
    'Do not rank the findings against each other and do not say which matters most — that is the writer\'s call. How much of the Work a finding spans is worked out from its evidence, not from your opinion.',
    '',
    'Between one and six findings. Fewer, better-evidenced findings beat more.',
    'If this lens finds nothing worth the writer\'s attention, answer {"findings":[]}. That is a legitimate answer.',
  );
  return lines.join('\n');
}

export function buildOverviewPrompt(declaredForm: string | null): string {
  return `${READER_STANCE}

You have just read this Work through several lenses and produced findings. Now write the OVERVIEW the writer reads first.

Four short movements, in plain prose, no headings, no lists, no percentages:
  1. What the Work seems to be doing.
  2. Where it is strongest — specifically, not as praise.
  3. Where it seems to be asking for attention.
  4. One or two questions you would sit with before changing anything.

Under 220 words. Speak to the writer. This is what you noticed, not what the Work is.

${formGuidance(declaredForm)}`;
}

/** Strip a code fence a model may add despite being asked not to. */
export function parseJsonAnswer(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // A model that wrapped its JSON in a sentence still gave us the JSON.
    const open = trimmed.indexOf('{');
    const close = trimmed.lastIndexOf('}');
    if (open === -1 || close <= open) return null;
    try {
      return JSON.parse(trimmed.slice(open, close + 1));
    } catch {
      return null;
    }
  }
}
