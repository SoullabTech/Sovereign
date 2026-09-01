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
 *
 * FAIL CLOSED, NOT QUIETLY CLEAN. The first cut of this parser threw on the
 * loud faults and silently tidied the quiet ones: it dropped uncertainty tags
 * outside the closed set, dropped malformed uncertain regions, turned a
 * non-string rationale into `''`, filtered non-string evidence refs - and, worst
 * of all, accepted `form: 'none'` WITH a units array by ignoring the units.
 *
 * That last one reopened by hand exactly what the type design had made
 * impossible: `none` has no `units` field, so a shape that cannot hold a tree
 * cannot be filled with one. A parser that discards the tree instead of refusing
 * it turns a self-contradicting answer into a clean finding, and the member
 * would read "no structure is evident" from a model that had just proposed
 * some. A field that does not belong to the variant is now a REFUSAL.
 *
 * The tool schema describes these constraints, but a JSON Schema cannot express
 * "units only when form is not none", and schema conformance is the model's
 * side of the contract in any case. This parser is ours.
 */

import { createHash } from 'crypto';
import { runStructured } from '../../ai/structured/router';
import type { StructuredBlock, StructuredTool } from '../../ai/structured/types';
import type {
  EditorialQuestion, EditorialSynthesis, ProposedUnitDraft, ProposedUncertainty,
  ReaderInput, ReaderOutput, ReaderReading, StructureReader, UncertainRegion,
} from './interpret';
import type { EvidenceObservation, HeadedSection, StructureEvidence } from './evidence';
import type { ReaderIdentity } from './readerProvenance';
import { DEFAULT_READ_SCOPE } from './readScope';

/** The model could not be understood. Never converted into a reading. */
export class StructureReaderError extends Error {
  constructor(readonly reason: string, readonly detail?: string) {
    super(detail ? `${reason}: ${detail}` : reason);
    this.name = 'StructureReaderError';
  }
}

/* ── who read it ──────────────────────────────────────────────────────────── */

/**
 * Attribution of the reading, frozen alongside it. Defined in
 * `./readerProvenance` so the proposal store can describe who read a Work
 * without importing the thing that reads.
 *
 * NOT the manuscript, and not the prompt payload - a proposal must never become
 * a second copy of the Work. This is who read, with what standing instructions,
 * and when: enough to answer "what produced this reading" from a row rather than
 * from a recollection, six months and three model versions later.
 *
 * Captured at freeze time rather than reconstructed. A provenance derived later
 * from whatever the code says today describes the CURRENT reader, which is
 * exactly the reader you cannot trust it to have been.
 */
export type { ReaderProvenance, ReaderIdentity } from './readerProvenance';

/**
 * The reader UNIT, not its exact instructions.
 *
 * `promptHash` is what distinguishes one contract from another, and it moves
 * whenever the prompt or the tool schema does - as it did when the containment
 * grammar was added after the first real reading. Two proposals bearing this
 * same version and different hashes were made by different readers, and the row
 * says so.
 */
export const READER_VERSION = 'REAL-STRUCTURE-READER-01';

/**
 * The prompt AND the tool contract, hashed together.
 *
 * The schema is half the instruction: changing the form enum or a field
 * description changes what MAIA can say as surely as editing the prose. Hashing
 * only `READER_SYSTEM` would report two different readers as identical.
 */
export function promptContractHash(): string {
  return createHash('sha256')
    .update(READER_SYSTEM, 'utf8')
    .update('\u0000', 'utf8')
    .update(JSON.stringify(readerTools()), 'utf8')
    .digest('hex');
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
const SCOPED = (t: string): string => t
  .replace('SCOPE_IDS', String(DEFAULT_READ_SCOPE.maxIdsPerRequest))
  .replace('SCOPE_SECTIONS', String(DEFAULT_READ_SCOPE.maxSections))
  .replace('SCOPE_CHARS', DEFAULT_READ_SCOPE.maxChars.toLocaleString('en-US'));

/* The ceilings are interpolated from the SAME constant the host enforces, so a
   prompt promising one policy while the host enforces another is not
   expressible. It also means the prompt hash moves when the scope moves, which
   is correct: a reader operating under different limits is a different reader. */
export const READER_SYSTEM = SCOPED(`You are reading a member's Work in order to PERCEIVE AND PROPOSE its organizing grammar. You are not detecting chapters. You are asking what kind of thing this Work is and where, if anywhere, it divides.

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

HOW DIVISIONS NEST
Hierarchy must be representable by the structure model. If a unit has children, every child's inclusive section range must lie entirely within its parent's inclusive range. A part running 43-69 holds only children that begin at or after 43 and end at or before 69.

Never widen, shrink, or invent a boundary merely to satisfy this rule. If your reading cannot be expressed as a valid hierarchy, use siblings, uncertainty, an alternative reading, "partial", "ambiguous", or "none" instead. The constraint is on what the model can hold, not on what you may see.

VOCABULARY IS THE WORK'S, NOT YOURS
"kind" is free text, in whatever vocabulary the Work itself uses: Part, Chapter, Movement, Act, Scene, Essay, Letter, Entry, Vignette, Book, Section, or a word this particular Work invented. Never force a Work into Part/Chapter because that is what books usually have. Use null rather than a manufactured kind.

"title" should be the member's own words wherever the Work supplies them. Use null rather than inventing a title. A null title is honest; an invented one is you writing their book.

DESCRIBING WHAT YOU SEE IS NOT INVENTING A TITLE
Those are different acts, and only one of them is forbidden. A title is the Work's words and would be written into the member's manuscript if they adopt your reading. An "editorialLabel" is YOUR words about a division, for writing to the member ABOUT their book - what an editor calls a section in a letter. It is never written into the manuscript and never becomes a title.

Every division carries one. Give the shortest phrase that would let the member tell this division from its siblings at a glance: "Fire", "the opening ground", "the reference apparatus".

A repeated kind is NOT editorial communication. Five sibling divisions all reading kind "element", all untitled, are five identical rows to the person reading your proposal - they can tell them apart only by counting section numbers. If you can see that they are Fire, Water, Earth, Air and Aether, say so here. That is the whole reason this field exists.

Ground a label in what you actually read. A heading inside the division, a word the Work uses for itself, a distinction you can point at. Use null when you cannot ground one - null is lawful and remains the honest answer. Do not fabricate a label to avoid an empty field; a manufactured label is the same fault as a manufactured title, moved one column over.

WRITE YOUR READING TO THE AUTHOR
"account" is your account of the Work's grammar. "editorialSynthesis" is the same reading said to the person who wrote it, and it is required.

- thesis: what you think this Work is doing, in one or two sentences. The single claim you would want them to see first.
- strongestFindings: the few things you would stand behind, one per string. Not a list of every division. If your reading is weak throughout, say fewer things.
- questionsForAuthor: what you would ask the author if you could. A question is a doubt turned outward - not "I am uncertain about the Water/Earth seam" but "Does the Earth material begin at the conclusion, or after it?" Give each a short label, an explanation of what is actually at stake, and the section ids it concerns. Ask nothing you do not genuinely want answered, and ask nothing you could settle yourself from what you were given.

This is commentary, not structure. Nothing in it is adopted, nothing in it enters their manuscript, and none of it decides anything. It exists so that a member can read what you found without reconstructing it from a tree.

UNCERTAINTY IS PART OF THE READING
Every division carries an uncertainty list, and an empty list is a claim of confidence you must actually hold. Where a boundary could reasonably sit one section either way, say so. Where you suspect a passage is front/back matter or a contents list rather than writing, mark it. Where a second reading is nearly as good, that is what "ambiguous" is for.

Use uncertainRegions for stretches you cannot account for and can say something useful about.

WHAT YOU MAY ASK FOR
On the first pass you have headings only. If headings alone cannot settle the reading, you may request the full text of specific sections and say why. Ask for the fewest sections that would actually settle it - this is a member's private writing, and every section you request is one more piece of their Work leaving their machine. Do not request sections out of general curiosity, and do not request the whole book.

The limits are hard, and a request that crosses one is refused whole rather than trimmed:
- at most SCOPE_IDS section ids in a single request
- at most SCOPE_SECTIONS distinct sections across the entire reading
- at most SCOPE_CHARS characters of the member's prose across the entire reading
- whole sections only; nothing is ever shortened for you

You have no access to notes, uploads, source material, or anything else in the member's Studio. You are reading the Work as written, not reconstructing what they meant from surrounding material.

If those limits cannot settle the reading, say so in your account and give the honest partial answer - "partial", "ambiguous" or "none" as fits. That a bounded reading could not settle this Work is a real finding and worth stating. Do not spend requests approaching a limit you already expect to be insufficient.

WHAT YOU ARE NOT
You are not deciding this Work's structure. The member reads your proposal, changes anything they like, and only they can make it real. Your rationale is evidence for their judgement, not an instruction to it. Do not write as though the reading is settled, and do not address the member.`);

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
    editorialLabel: { type: ['string', 'null'],
      description: 'YOUR short description of this division, for writing to the member '
        + 'about their book. Never written into the manuscript and never a title. '
        + 'Siblings sharing a kind must be distinguishable here. null when you cannot '
        + 'ground one in what you read - null is lawful, a fabricated label is not.' },
    fromSectionId: { type: 'string', description: 'Section id from the table given.' },
    toSectionId: { type: 'string', description: 'Inclusive. May equal fromSectionId.' },
    rationale: { type: 'string',
      description: 'Why this holds together, in your reading. Not a restatement of evidence.' },
    evidenceRefs: { type: 'array', items: { type: 'string' },
      description: 'Observation ids you actually reasoned from. May be empty.' },
    uncertainty: { type: 'array', items: { type: 'string', enum: UNCERTAINTY_VALUES } },
    ...(depth > 0
      ? { children: {
        type: 'array', items: unitSchema(depth - 1),
        description: "Every child's inclusive range must lie entirely within this "
          + 'unit\'s range. A child that escapes its parent is refused by the host, '
          + 'whole - the reading is not repaired for you. Where a reading will not '
          + 'nest, prefer siblings, an alternative, or a less confident form.' } }
      : {}),
  },
  required: ['title', 'kind', 'editorialLabel', 'fromSectionId', 'toSectionId',
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

/**
 * The tool contract, in the wire shape it has always had.
 *
 * `input_schema` is snake_case here and NOT the seam's neutral `inputSchema` on
 * purpose: `promptContractHash()` hashes `JSON.stringify(readerTools())`, so the
 * key name is load-bearing provenance. Renaming it would report every reading
 * ever made as having come from a different reader. The translation to the
 * neutral vocabulary happens once, at the call site.
 */
export interface ReaderTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export function readerTools(): ReaderTool[] {
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
            description: 'For stable, partial, flat and mixed ONLY. Omitting it is required '
              + 'for ambiguous and none - a reading that says "none" and carries divisions '
              + 'is rejected outright rather than having the divisions dropped.' },
          alternatives: {
            type: 'array',
            description: 'For "ambiguous" ONLY, and rejected on any other form. At least '
              + 'two, and choose no winner.',
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
          editorialSynthesis: {
            type: 'object',
            description: 'Your reading said to the author. Required for every form, '
              + 'including "none" - a Work that reads as one continuous body still '
              + 'deserves to be told what you think it is doing.',
            properties: {
              thesis: { type: 'string',
                description: 'What this Work is doing, in one or two sentences.' },
              strongestFindings: { type: 'array', items: { type: 'string' },
                description: 'The few claims you would stand behind. Not every division.' },
              questionsForAuthor: {
                type: 'array',
                description: 'What you would ask the author. May be empty if you '
                  + 'genuinely have nothing to ask.',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string',
                      description: 'Short, and answerable: "Where does Fire begin?"' },
                    explanation: { type: 'string',
                      description: 'What is at stake. Not a restatement of the label.' },
                    sectionIds: { type: 'array', items: { type: 'string' },
                      description: 'The sections this question is about. Ids from the '
                        + 'table given; an id this Work does not hold is refused.' },
                  },
                  required: ['label', 'explanation'],
                  additionalProperties: false,
                },
              },
            },
            required: ['thesis', 'strongestFindings', 'questionsForAuthor'],
            additionalProperties: false,
          },
        },
        required: ['form', 'account', 'editorialSynthesis'],
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
          sectionIds: { type: 'array', items: { type: 'string' },
            maxItems: DEFAULT_READ_SCOPE.maxIdsPerRequest,
            description: `At most ${DEFAULT_READ_SCOPE.maxIdsPerRequest}. A longer `
              + 'request is refused whole, not trimmed to the first few.' },
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
    /* ABSENT REFUSES, EXPLICIT null PASSES - the same treatment `title` and
       `kind` already get, and the distinction the field turns on. A reader that
       omitted the field never considered whether it could describe this
       division; a reader that answered null considered it and declined. Only
       the second is a reading. Defaulting absence to null would erase that
       difference and quietly restore the five-identical-rows failure. */
    if (!nullableStr(u.editorialLabel)) {
      throw new StructureReaderError('unit-bad-editorial-label', at);
    }
    /* Absent is fine; malformed is not. An invented uncertainty tag would reach
       the review surface as a caveat nothing renders - the member meeting a
       blank where a limit should be - so it is refused rather than dropped.
       Dropping it would silently upgrade the reading's confidence. */
    if (u.uncertainty !== undefined) {
      if (!Array.isArray(u.uncertainty)) {
        throw new StructureReaderError('unit-bad-uncertainty', at);
      }
      const bad = u.uncertainty.find((x) =>
        typeof x !== 'string' || !(UNCERTAINTY_VALUES as readonly string[]).includes(x));
      if (bad !== undefined) {
        throw new StructureReaderError('unit-unknown-uncertainty', `${at}: ${String(bad)}`);
      }
    }
    /* `rationale` became '' when it was not a string. An empty rationale is a
       division offered with no reason given, which is a different thing from a
       reason we failed to read. */
    if (u.rationale !== undefined && !isStr(u.rationale)) {
      throw new StructureReaderError('unit-bad-rationale', at);
    }
    if (u.evidenceRefs !== undefined
      && (!Array.isArray(u.evidenceRefs) || !u.evidenceRefs.every(isStr))) {
      throw new StructureReaderError('unit-bad-evidence-refs', at);
    }
    return {
      title: u.title ?? null,
      kind: u.kind ?? null,
      editorialLabel: u.editorialLabel as string | null,
      fromSectionId: u.fromSectionId,
      toSectionId: u.toSectionId,
      rationale: isStr(u.rationale) ? u.rationale : '',
      evidenceRefs: (u.evidenceRefs as string[] | undefined) ?? [],
      uncertainty: (u.uncertainty as ProposedUncertainty[] | undefined) ?? [],
      children: parseUnits(u.children, `${at}.children`),
    };
  });
}

/**
 * Absent means none. A malformed one is refused, not dropped.
 *
 * These are the reading's own statements of where it could not see. Silently
 * discarding one publishes a MORE confident reading than the model gave.
 */
function parseRegions(value: unknown): UncertainRegion[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new StructureReaderError('regions-not-an-array');
  return value.map((raw, i): UncertainRegion => {
    if (!raw || typeof raw !== 'object') {
      throw new StructureReaderError('region-not-an-object', `[${i}]`);
    }
    const r = raw as Record<string, unknown>;
    if (!isStr(r.fromSectionId) || !isStr(r.toSectionId) || !isStr(r.why)) {
      throw new StructureReaderError('region-incomplete', `[${i}]`);
    }
    return { fromSectionId: r.fromSectionId, toSectionId: r.toSectionId, why: r.why };
  });
}

/**
 * The editorial letter. REQUIRED, and malformed is refused rather than tidied.
 *
 * This is the field 8B exists for: without it the member meets a serialized
 * tree and has to reconstruct the claim before they can judge it. A reading
 * that arrives without one has not been communicated, and normalising the gap
 * to an empty letter would publish silence under MAIA's name.
 *
 * Empty ARRAYS are lawful - she may stand behind little and may have nothing to
 * ask. Empty STRINGS are not: a blank thesis or a blank finding renders as a
 * blank line the member is invited to read.
 */
function parseSynthesis(value: unknown): EditorialSynthesis {
  if (value === undefined) throw new StructureReaderError('reading-missing-editorial-synthesis');
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new StructureReaderError('synthesis-not-an-object');
  }
  const y = value as Record<string, unknown>;

  if (!isStr(y.thesis) || !y.thesis.trim()) {
    throw new StructureReaderError('synthesis-missing-thesis');
  }
  if (!Array.isArray(y.strongestFindings)
    || !y.strongestFindings.every((f) => isStr(f) && f.trim())) {
    throw new StructureReaderError('synthesis-bad-findings');
  }
  if (!Array.isArray(y.questionsForAuthor)) {
    throw new StructureReaderError('synthesis-bad-questions');
  }

  const questionsForAuthor = y.questionsForAuthor.map((raw, i): EditorialQuestion => {
    const at = `questionsForAuthor[${i}]`;
    if (!raw || typeof raw !== 'object') {
      throw new StructureReaderError('question-not-an-object', at);
    }
    const q = raw as Record<string, unknown>;
    if (!isStr(q.label) || !q.label.trim() || !isStr(q.explanation) || !q.explanation.trim()) {
      throw new StructureReaderError('question-missing-label-or-explanation', at);
    }
    /* Absent is fine - a question may be about the reading rather than a place.
       Malformed is refused: the host checks these ids against the draft, and a
       non-string would slip past that check as neither present nor absent. */
    if (q.sectionIds !== undefined
      && (!Array.isArray(q.sectionIds) || !q.sectionIds.every(isStr))) {
      throw new StructureReaderError('question-bad-section-ids', at);
    }
    return {
      label: q.label,
      explanation: q.explanation,
      ...(q.sectionIds ? { sectionIds: q.sectionIds as string[] } : {}),
    };
  });

  return { thesis: y.thesis, strongestFindings: y.strongestFindings as string[],
    questionsForAuthor };
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
  const editorialSynthesis = parseSynthesis(o.editorialSynthesis);

  /**
   * A field that does not belong to this variant is a CONTRADICTION, not noise.
   *
   * `none` carrying units is the case that matters: the type has no `units`
   * field precisely so a shape that cannot hold a tree cannot be filled with
   * one, and a parser that discarded the tree would hand the member "no
   * structure is evident" from a model that had just proposed some. Refusing is
   * the only reading of that answer which is true.
   */
  const refuseForeign = (form: string, fields: readonly string[]): void => {
    const present = fields.filter((f) => o[f] !== undefined);
    if (present.length > 0) {
      throw new StructureReaderError('form-carries-a-field-it-cannot-have',
        `${form} + ${present.join(',')}`);
    }
  };

  switch (o.form) {
    case 'none':
      refuseForeign('none', ['units', 'alternatives']);
      return { status: 'interpreted', reading: { form: 'none', account: o.account, uncertainRegions, editorialSynthesis } };

    case 'ambiguous': {
      refuseForeign('ambiguous', ['units']);
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
      return { status: 'interpreted', reading: { form: 'ambiguous', account: o.account, alternatives, uncertainRegions,
          editorialSynthesis } };
    }

    case 'stable': case 'partial': case 'flat': case 'mixed': {
      refuseForeign(o.form, ['alternatives']);
      const units = parseUnits(o.units, 'units');
      /* A tree-bearing form with no tree is a contradiction, and the honest
         answer for it already exists. It is NOT silently rewritten to `none`:
         the model said one thing and did another, and that is a machine fault
         to report, not a finding to publish under MAIA's name. */
      if (units.length === 0) {
        throw new StructureReaderError('form-claims-units-but-has-none', String(o.form));
      }
      return { status: 'interpreted', reading: { form: o.form, account: o.account, units, uncertainRegions,
          editorialSynthesis } };
    }

    default:
      throw new StructureReaderError('unknown-form', String(o.form));
  }
}

/* ── the reader itself ────────────────────────────────────────────────────── */

export interface MaiaReaderOptions {
  /* No `client`. The provider is resolved by the platform's structured seam,
     not handed in by a caller — a reader cannot name its own provider. */
  model?: string;
  maxTokens?: number;
  /** Structural telemetry only. Never called with prose. */
  onTurn?: (info: {
    pass: 1 | 2 | 3; tool: string; inputTokens: number; outputTokens: number;
    bodiesSupplied: number;
  }) => void;
}

export interface MaiaReader {
  read: StructureReader;
  /**
   * Bound to the reader that will actually run, rather than recomputed by the
   * caller from the same options. Two sources for one fact drift, and this is
   * the fact a member would rely on when asking what produced their reading.
   */
  provenance: ReaderIdentity;
}

/**
 * A `StructureReader` backed by the platform's structured-inference seam, with
 * its own attribution.
 *
 * It asks for a `long-running` completion because a reading of a long Work with
 * adaptive thinking can outrun a non-streaming HTTP timeout. Whether that is met
 * by streaming, long-polling, or a transport with no such timeout is the
 * adapter's business; the response is consumed whole either way.
 */
export function createMaiaStructureReader(opts: MaiaReaderOptions = {}): MaiaReader {
  const model = opts.model ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? DEFAULT_MAX_TOKENS;

  /* The same two tools, in the seam's provider-neutral vocabulary. Only the key
     name differs from the hashed shape; the wire request the adapter builds is
     the one this reader has always sent. */
  const tools: StructuredTool[] = readerTools().map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.input_schema,
  }));

  const read: StructureReader = async (input: ReaderInput): Promise<ReaderOutput> => {
    const outcome = await runStructured({
      model,
      maxTokens,
      system: READER_SYSTEM,
      tools,
      /* She must answer THROUGH one of the two tools. Prose in the text block is
         not a reading, and there is no path here that turns one into a tree. */
      toolChoice: { type: 'any' },
      messages: [{ role: 'user', content: buildRequest(input) }],
      /* A reading of a long Work with adaptive thinking can outrun a
         non-streaming HTTP timeout. The requirement is named; how it is met is
         the adapter's business. */
      execution: { completion: 'long-running' },
    });

    /* A refused inference is a fact about the machine, exactly like a parse
       failure, and gets the same treatment: it THROWS. Rendering it as
       `form: 'none'` would publish "no stable larger structure is evident"
       under MAIA's name at the moment she was never asked. */
    if (!outcome.ok) {
      throw new StructureReaderError('inference-refused', outcome.detail
        ? `${outcome.refusal}: ${outcome.detail}` : outcome.refusal);
    }
    const message = outcome.result;

    const call = message.content.find(
      (b): b is Extract<StructuredBlock, { type: 'tool_use' }> => b.type === 'tool_use');
    if (!call) {
      throw new StructureReaderError('no-tool-call', message.stopReason ?? 'unknown');
    }

    opts.onTurn?.({
      pass: input.pass,
      tool: call.name,
      inputTokens: message.usage.inputTokens,
      outputTokens: message.usage.outputTokens,
      bodiesSupplied: input.bodies.size,
    });

    return parseReaderOutput(call.name, call.input);
  };

  return {
    read,
    provenance: {
      provider: 'anthropic',
      model,
      promptHash: promptContractHash(),
      readerVersion: READER_VERSION,
    },
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
