/**
 * WS2-05B-5½ · REAL-STRUCTURE-READER-01 — MAIA reads the actual Work.
 *
 * This is the one implementation behind `StructureReader`. Everything on either
 * side of it was built and witnessed first, deliberately: the host loop already
 * mints unit ids, derives `unaccountedSectionIds`, refuses a reading that names
 * sections this draft does not hold, refuses overlapping siblings, and refuses
 * `ambiguous` without alternatives. This file supplies a reading to an interface
 * built to distrust it.
 *
 * WHAT IT CANNOT DO, STRUCTURALLY. It returns a `ReaderOutput`. It imports no
 * structure service, no proposal store, and no database client. There is no code
 * path from here to `manuscript_structure_units`, and 6 — the sovereignty
 * boundary — is not built, so the member's adoption is not merely required, it
 * is the only thing that could ever make a reading real.
 *
 * WHAT LEAVES THE MACHINE, AND WHEN. Pass 1 sends headings and mechanical
 * observations. Prose leaves ONLY when the reader asks for specific sections and
 * the host supplies them, and exactly those sections are recorded in
 * `coverage.bodies.sectionIds` on the stored proposal — so what was read is a
 * fact the member can check rather than a claim in a prompt. `buildRequest` is
 * pure and exported for that reason: what crosses this boundary is testable
 * without a network.
 *
 * A MALFORMED READING IS AN ERROR, NEVER A RESULT. If the model returns
 * something this file cannot parse, it THROWS. It does not fall back to
 * `form: 'none'`. "No stable larger structure is evident" is a finding about the
 * Work; a parse failure is a fact about the machine, and quietly rendering one
 * as the other would put words in MAIA's mouth at the exact moment she said
 * nothing intelligible.
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  ProposedUnitDraft, ProposedUncertainty, ReaderInput, ReaderOutput,
  ReaderReading, StructureReader, UncertainRegion,
} from './interpret';
import type { EvidenceObservation, HeadedSection, StructureEvidence } from './evidence';

/** The model could not be understood. Never converted into a reading. */
export class StructureReaderError extends Error {
  constructor(readonly reason: string, readonly detail?: string) {
    super(detail ? `${reason}: ${detail}` : reason);
    this.name = 'StructureReaderError';
  }
}

/**
 * Claude Opus 5. Thinking is deliberately NOT configured: on this model it runs
 * adaptively when the parameter is omitted, which is what perceiving the grammar
 * of a book wants. Do not "fix" this by adding a fixed budget.
 */
const DEFAULT_MODEL = process.env.MAIA_STRUCTURE_READER_MODEL || 'claude-opus-5';
const DEFAULT_MAX_TOKENS = 32_000;

/* ── what MAIA is asked to be ─────────────────────────────────────────────── */

/**
 * The system prompt.
 *
 * Written to make SIX answers equally available. A prompt that asks for chapters
 * gets chapters, from any book, including the ones that do not have them - and
 * the member would meet a confident invention rather than a reading. `none` is
 * named as a complete finding twice, and nothing here rewards a tree.
 */
export const READER_SYSTEM = `You are reading a member's Work in order to PERCEIVE AND PROPOSE its organizing grammar. You are not detecting chapters. You are asking what kind of thing this Work is and where, if anywhere, it divides.

WHAT YOU ARE LOOKING AT
A Work is an ordered sequence of sections. A section is a writing unit, not a chapter: a book's chapter may span many sections, and some Works have no larger structure at all.

You are given every section's heading, plus mechanical observations made by deterministic code. Each observation carries an explicit list of what it DOES NOT ESTABLISH. Honour those. A repeated label is a repeated label; it is not a proven division. Evidence is something to reason from, never a conclusion to restate.

THE SIX ANSWERS, ALL EQUALLY LEGITIMATE
- stable     a coherent larger grammar runs through the Work
- partial    part of the Work organises clearly; part does not, and you say which
- flat       a meaningful sequence with no larger hierarchy, and none invented
- mixed      different regions organise differently; siblings may differ in kind
- ambiguous  two or more readings remain defensible and the evidence does not separate them; you give the alternatives and choose no winner
- none       no stable larger structure is evident yet

"none" is a COMPLETE ANSWER, not a failure and not an empty result. A Work that reads as one continuous body deserves to be told so. Never manufacture a division to avoid returning it.

VOCABULARY IS THE WORK'S, NOT YOURS
"kind" is free text, in whatever vocabulary the Work itself uses: Part, Chapter, Movement, Act, Scene, Essay, Letter, Entry, Vignette, Book, Section, or a word this particular Work invented. Never force a Work into Part/Chapter because that is what books usually have. Use null rather than a manufactured kind.

"title" should be the member's own words wherever the Work supplies them. Use null rather than inventing a title. A null title is honest; an invented one is you writing their book.

UNCERTAINTY IS PART OF THE READING
Every division carries an uncertainty list, and an empty list is a claim of confidence you must actually hold. Where a boundary could reasonably sit one section either way, say so. Where you suspect a passage is front/back matter or a contents list rather than writing, mark it. Where a second reading is nearly as good, that is what "ambiguous" is for.

Use uncertainRegions for stretches you cannot account for and can say something useful about.

WHAT YOU MAY ASK FOR
On the first pass you have headings only. If headings alone cannot settle the reading, you may request the full text of specific sections and say why. Ask for the fewest sections that would actually settle it - this is a member's private writing, and every section you request is one more piece of their Work leaving their machine. Do not request sections out of general curiosity, and do not request the whole book.

WHAT YOU ARE NOT
You are not deciding this Work's structure. The member reads your proposal, changes anything they like, and only they can make it real. Your rationale is evidence for their judgement, not an instruction to it. Do not write as though the reading is settled, and do not address the member.`;

/* ── the closed shape MAIA may answer in ──────────────────────────────────── */

const UNCERTAINTY_VALUES: readonly ProposedUncertainty[] = [
  'start-boundary', 'end-boundary', 'kind', 'hierarchy',
  'possible-scaffold-contamination', 'competing-interpretation',
];

const unitSchema = (depth: number): Record<string, unknown> => ({
  type: 'object',
  properties: {
    title: { type: ['string', 'null'],
      description: "The Work's own words. null rather than invented." },
    kind: { type: ['string', 'null'],
      description: "Free text in the Work's vocabulary. Never forced. null is allowed." },
    fromSectionId: { type: 'string', description: 'Section id from the table given.' },
    toSectionId: { type: 'string', description: 'Inclusive. May equal fromSectionId.' },
    rationale: { type: 'string',
      description: 'Why this holds together, in your reading. Not a restatement of evidence.' },
    evidenceRefs: { type: 'array', items: { type: 'string' },
      description: 'Observation ids you actually reasoned from. May be empty.' },
    uncertainty: { type: 'array', items: { type: 'string', enum: UNCERTAINTY_VALUES } },
    ...(depth > 0
      ? { children: { type: 'array', items: unitSchema(depth - 1) } }
      : {}),
  },
  required: ['title', 'kind', 'fromSectionId', 'toSectionId',
    'rationale', 'evidenceRefs', 'uncertainty'],
  additionalProperties: false,
});

/**
 * Depth 4 is a schema limit, not a claim about books.
 *
 * A JSON Schema cannot express unbounded recursion, so nesting has to stop
 * somewhere. Four levels covers Book > Part > Chapter > Scene, and a reader that
 * needs a fifth can say so in `rationale` and mark `hierarchy` uncertainty
 * rather than silently flatten it.
 */
const MAX_PROPOSAL_DEPTH = 4;

export function readerTools(): Anthropic.Tool[] {
  return [
    {
      name: 'propose_structure',
      description: 'Give your reading of this Work. Use form "none" when no stable larger '
        + 'structure is evident - that is a complete answer.',
      input_schema: {
        type: 'object',
        properties: {
          form: { type: 'string',
            enum: ['stable', 'partial', 'flat', 'mixed', 'ambiguous', 'none'] },
          account: { type: 'string',
            description: 'Your account of this Work\'s grammar, in your words. Required for '
              + 'every form, including "none".' },
          units: { type: 'array', items: unitSchema(MAX_PROPOSAL_DEPTH),
            description: 'For stable, partial, flat and mixed. Omit for ambiguous and none.' },
          alternatives: {
            type: 'array',
            description: 'For "ambiguous" only. At least two, and choose no winner.',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'Short: "by movement", "by voice".' },
                why: { type: 'string' },
                units: { type: 'array', items: unitSchema(MAX_PROPOSAL_DEPTH) },
              },
              required: ['label', 'why', 'units'],
              additionalProperties: false,
            },
          },
          uncertainRegions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fromSectionId: { type: 'string' },
                toSectionId: { type: 'string' },
                why: { type: 'string' },
              },
              required: ['fromSectionId', 'toSectionId', 'why'],
              additionalProperties: false,
            },
          },
        },
        required: ['form', 'account'],
        additionalProperties: false,
      },
    },
    {
      name: 'request_sections',
      description: 'Ask for the full text of specific sections, when headings alone cannot '
        + 'settle the reading. Request the fewest that would actually settle it.',
      input_schema: {
        type: 'object',
        properties: {
          sectionIds: { type: 'array', items: { type: 'string' } },
          why: { type: 'string', description: 'What you expect reading these to settle.' },
        },
        required: ['sectionIds', 'why'],
        additionalProperties: false,
      },
    },
  ];
}

/* ── what actually crosses the boundary ───────────────────────────────────── */

/** Every observation, with its limits attached. Structural facts only. */
export function renderObservation(o: EvidenceObservation): string {
  const where = o.positions.length > 6
    ? `${o.positions.slice(0, 6).join(',')}… (${o.positions.length} places)`
    : o.positions.join(',');
  const detail =
    o.kind === 'structural-label' ? ` labels=${o.labels.join('|')}`
      : o.kind === 'numbering-pattern'
        ? ` word=${o.word} seen=${o.seen.join(',')} missing=${o.missing.join(',') || 'none'}`
        : o.kind === 'lexical-density'
          ? ` token=${o.token} core=${o.core.from}-${o.core.to}`
            + ` density=${o.density.toFixed(2)} outside=${o.outside.join(',') || 'none'}`
          : o.kind === 'repeated-form' ? ` template=${o.template}`
            : o.kind === 'suspected-scaffold' ? ` span=${o.from}-${o.to}`
              : ` at=${o.at} overlap=${o.overlap.toFixed(2)}`;
  return `[${o.id}] ${o.kind}${detail}\n  at: ${where}\n  note: ${o.note}\n`
    + `  DOES NOT ESTABLISH: ${o.doesNotEstablish.join('; ')}`;
}

/**
 * The section table. Ids as the Work holds them, because a reading that names
 * positions would break the moment a section moved.
 */
export function renderSections(sections: readonly HeadedSection[]): string {
  return [...sections]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.position}\t${s.id}\t${s.heading ?? '(no heading)'}`)
    .join('\n');
}

/**
 * The whole request, as text, from the host's own state.
 *
 * Pure and exported so that WHAT LEAVES THE MACHINE can be asserted in a test
 * with no network and no key: pass 1 must contain no body, and a later pass must
 * contain exactly the bodies the host supplied and no others.
 */
export function buildRequest(input: ReaderInput): string {
  const parts: string[] = [];
  parts.push(`PASS ${input.pass}. This Work has ${input.sections.length} sections.`);

  parts.push('\n## SECTIONS (position, id, heading)\n' + renderSections(input.sections));

  parts.push(input.evidence.observations.length === 0
    ? '\n## MECHANICAL OBSERVATIONS\nNone. The deterministic scan found nothing to report, '
      + 'which is itself information: this Work carries no structural labels or numbering '
      + 'the mechanics can see.'
    : '\n## MECHANICAL OBSERVATIONS\n'
      + input.evidence.observations.map(renderObservation).join('\n\n'));

  if (input.previousRequest) {
    parts.push(`\n## YOU ASKED FOR\n${input.previousRequest.sectionIds.length} section(s), `
      + `because: ${input.previousRequest.why}`);
  }

  if (input.bodies.size > 0) {
    /* Ordered by position so the supplied prose reads as the book does. */
    const order = new Map(input.sections.map((s) => [s.id, s.position]));
    const supplied = [...input.bodies.entries()]
      .sort((a, b) => (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0))
      .map(([id, text]) => `--- section ${order.get(id)} (${id}) ---\n${text}`);
    parts.push(`\n## SECTIONS YOU REQUESTED, IN FULL (${input.bodies.size})\n`
      + supplied.join('\n\n'));
  }

  parts.push(input.pass === 1
    ? '\nYou have headings only. Either give your reading now, or request the fewest '
      + 'sections that would settle it.'
    : '\nGive your reading now if you can. Requesting more is possible but each request '
      + 'sends more of the member\'s writing.');

  return parts.join('\n');
}

/* ── parsing what comes back ──────────────────────────────────────────────── */

const isStr = (v: unknown): v is string => typeof v === 'string';
const nullableStr = (v: unknown): v is string | null => v === null || typeof v === 'string';

function parseUnits(value: unknown, where: string): ProposedUnitDraft[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new StructureReaderError('units-not-an-array', where);
  return value.map((raw, i): ProposedUnitDraft => {
    const at = `${where}[${i}]`;
    if (!raw || typeof raw !== 'object') throw new StructureReaderError('unit-not-an-object', at);
    const u = raw as Record<string, unknown>;
    if (!isStr(u.fromSectionId) || !isStr(u.toSectionId)) {
      throw new StructureReaderError('unit-missing-range', at);
    }
    if (!nullableStr(u.title) || !nullableStr(u.kind)) {
      throw new StructureReaderError('unit-bad-title-or-kind', at);
    }
    /* Uncertainty is filtered to the closed set rather than passed through: an
       invented tag would reach the review surface as a label nothing renders,
       and the member would meet a blank where a caveat should be. */
    const uncertainty = Array.isArray(u.uncertainty)
      ? u.uncertainty.filter((x): x is ProposedUncertainty =>
        typeof x === 'string' && (UNCERTAINTY_VALUES as readonly string[]).includes(x))
      : [];
    return {
      title: u.title ?? null,
      kind: u.kind ?? null,
      fromSectionId: u.fromSectionId,
      toSectionId: u.toSectionId,
      rationale: isStr(u.rationale) ? u.rationale : '',
      evidenceRefs: Array.isArray(u.evidenceRefs) ? u.evidenceRefs.filter(isStr) : [],
      uncertainty,
      children: parseUnits(u.children, `${at}.children`),
    };
  });
}

function parseRegions(value: unknown): UncertainRegion[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw): UncertainRegion[] => {
    if (!raw || typeof raw !== 'object') return [];
    const r = raw as Record<string, unknown>;
    return isStr(r.fromSectionId) && isStr(r.toSectionId) && isStr(r.why)
      ? [{ fromSectionId: r.fromSectionId, toSectionId: r.toSectionId, why: r.why }]
      : [];
  });
}

/**
 * One tool call into one `ReaderOutput`, or an error.
 *
 * CLOSED, like the HTTP boundary in 5b and for the same reason: a model is not a
 * TypeScript caller, and `input as ReaderReading` would be an assertion about a
 * value produced by something that does not read our types. The shape checks
 * here are what stand between a malformed answer and the host loop.
 */
export function parseReaderOutput(toolName: string, input: unknown): ReaderOutput {
  if (!input || typeof input !== 'object') {
    throw new StructureReaderError('tool-input-not-an-object', toolName);
  }
  const o = input as Record<string, unknown>;

  if (toolName === 'request_sections') {
    if (!Array.isArray(o.sectionIds) || !o.sectionIds.every(isStr)) {
      throw new StructureReaderError('request-missing-sectionIds');
    }
    if (o.sectionIds.length === 0) throw new StructureReaderError('request-asks-for-nothing');
    if (!isStr(o.why) || !o.why.trim()) throw new StructureReaderError('request-missing-why');
    return { status: 'read-request', sectionIds: o.sectionIds as string[], why: o.why };
  }

  if (toolName !== 'propose_structure') {
    throw new StructureReaderError('unknown-tool', toolName);
  }

  if (!isStr(o.account) || !o.account.trim()) {
    throw new StructureReaderError('reading-missing-account');
  }
  const uncertainRegions = parseRegions(o.uncertainRegions);

  switch (o.form) {
    case 'none':
      return { status: 'interpreted', reading: { form: 'none', account: o.account, uncertainRegions } };

    case 'ambiguous': {
      if (!Array.isArray(o.alternatives)) {
        throw new StructureReaderError('ambiguous-without-alternatives');
      }
      const alternatives = o.alternatives.map((raw, i) => {
        const a = (raw ?? {}) as Record<string, unknown>;
        if (!isStr(a.label) || !isStr(a.why)) {
          throw new StructureReaderError('alternative-missing-label-or-why', `[${i}]`);
        }
        return { label: a.label, why: a.why, units: parseUnits(a.units, `alternatives[${i}].units`) };
      });
      /* The host refuses fewer than two as well. Refusing here too means the
         reason is reported where it happened rather than as a generic host
         refusal three frames away. */
      if (alternatives.length < 2) {
        throw new StructureReaderError('ambiguous-without-alternatives',
          `${alternatives.length} given`);
      }
      return { status: 'interpreted', reading: { form: 'ambiguous', account: o.account, alternatives, uncertainRegions } };
    }

    case 'stable': case 'partial': case 'flat': case 'mixed': {
      const units = parseUnits(o.units, 'units');
      /* A tree-bearing form with no tree is a contradiction, and the honest
         answer for it already exists. It is NOT silently rewritten to `none`:
         the model said one thing and did another, and that is a machine fault
         to report, not a finding to publish under MAIA's name. */
      if (units.length === 0) {
        throw new StructureReaderError('form-claims-units-but-has-none', String(o.form));
      }
      return { status: 'interpreted', reading: { form: o.form, account: o.account, units, uncertainRegions } };
    }

    default:
      throw new StructureReaderError('unknown-form', String(o.form));
  }
}

/* ── the reader itself ────────────────────────────────────────────────────── */

export interface MaiaReaderOptions {
  client?: Anthropic;
  model?: string;
  maxTokens?: number;
  /** Structural telemetry only. Never called with prose. */
  onTurn?: (info: {
    pass: 1 | 2 | 3; tool: string; inputTokens: number; outputTokens: number;
    bodiesSupplied: number;
  }) => void;
}

/**
 * A `StructureReader` backed by Claude.
 *
 * Streamed because a reading of a long Work with adaptive thinking can outrun a
 * non-streaming HTTP timeout; the response is still consumed whole.
 */
export function createMaiaStructureReader(opts: MaiaReaderOptions = {}): StructureReader {
  const client = opts.client ?? new Anthropic();
  const model = opts.model ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? DEFAULT_MAX_TOKENS;

  return async (input: ReaderInput): Promise<ReaderOutput> => {
    const stream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: READER_SYSTEM,
      tools: readerTools(),
      /* She must answer THROUGH one of the two tools. Prose in the text block is
         not a reading, and there is no path here that turns one into a tree. */
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: buildRequest(input) }],
    });
    const message = await stream.finalMessage();

    const call = message.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    if (!call) {
      throw new StructureReaderError('no-tool-call', message.stop_reason ?? 'unknown');
    }

    opts.onTurn?.({
      pass: input.pass,
      tool: call.name,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      bodiesSupplied: input.bodies.size,
    });

    return parseReaderOutput(call.name, call.input);
  };
}

/**
 * Bodies from the draft, for exactly the ids requested.
 *
 * Supplied by the caller rather than reached for here: this module holds no
 * database client, so a reader can never widen its own access to the Work.
 */
export type BodyFetcher = (sectionIds: readonly string[]) => Promise<Map<string, string>>;

/** Narrows a fetcher to the ids asked for, whatever the source hands back. */
export function boundedFetcher(fetch: BodyFetcher): BodyFetcher {
  return async (ids) => {
    const got = await fetch(ids);
    const wanted = new Set(ids);
    return new Map([...got].filter(([id]) => wanted.has(id)));
  };
}
