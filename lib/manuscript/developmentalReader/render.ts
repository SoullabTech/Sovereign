/**
 * BUILD-07B — DEVELOPMENTAL READER · the deterministic renderer and the
 * prompt contract.
 *
 * WHAT LEAVES THE MACHINE IS TESTABLE WITHOUT A NETWORK. `renderRequest` is a
 * pure function of the request; the same request renders to byte-identical
 * text (contract F20), so `promptContractHash()` plus a digest of the rendered
 * request identify exactly what the model was shown.
 *
 * THE SYSTEM PROMPT IS CONSTANT. The commissioned lens is rendered into the
 * user message, not the system prompt, so the prompt-contract hash names the
 * READER (its instructions and its tool) and not one invocation of it. Two
 * readings under different lenses were made by the same reader.
 *
 * ONE TOOL, AND NO SECOND ONE (A4, F12). There is no `request_sections` here
 * and there never will be under this contract: a larger read is a new capture
 * and a new commissioned act, initiated outside the reader.
 *
 * `input_schema` — snake_case — is the shape that is hashed, exactly as the
 * structure reader does (maiaReader.ts): the wire contract is the provenance.
 * Renaming the key would report every reading ever made as having come from a
 * different reader.
 */

import { createHash } from 'crypto';
import type { FrozenStructureContext } from '../development/readState';
import {
  DEVELOPMENTAL_NON_CONCLUSIONS,
  NON_CONCLUSION_MEANING,
  type DevelopmentalReaderRequest,
  type RecoveredBody,
} from './contract';

export const READER_VERSION = 'DEVELOPMENTAL-READER-01';
export const TOOL_NAME = 'draft_reader_claims';

/* ── the prompt ──────────────────────────────────────────────────────────── */

const VOCABULARY = DEVELOPMENTAL_NON_CONCLUSIONS
  .map((k) => `  ${k.padEnd(28)} ${NON_CONCLUSION_MEANING[k]}`)
  .join('\n');

export const READER_SYSTEM = `You are MAIA, reading a member's manuscript developmentally, under one commissioned lens.

WHAT YOU ARE DOING. You are drafting what you NOTICED, and stating exactly what that noticing does NOT establish. You are not writing observations, interpretations, recommendations, or judgements about the Work. What you return will be bound to the exact evidence it rests on and, only later and by a separate act, may become a developmental observation. The author remains the only authority over the Work.

WHAT YOU HAVE BEEN GIVEN. A frozen state of the Work: the sequence of its sections by id; the full text of the sections you may cite as prose, each with its id, its position in the sequence, and its length in Unicode code points; possibly the member's own authored structure (divisions with the member's own kind and title words, and which sections each holds); and one commissioned lens. Sections listed at POSITION depth were not read - you know only that they exist and where they sit.

RULES.
1. Every claim rests on evidence references, in exactly these JSON shapes and no others:
     { "kind": "section", "sectionId": "<id>" }
     { "kind": "passage", "sectionId": "<id>", "range": { "start": <n>, "end": <n> } }
       (start inclusive, end exclusive, in Unicode code points from the start of that section's text)
     { "kind": "section-run", "sectionIds": ["<id>", "<id>", ...] }   (a contiguous run, in sequence order)
     { "kind": "structure-unit", "unitId": "<id>" }
     { "kind": "structure-units", "unitIds": ["<id>", ...] }
     { "kind": "structure-topology" }
   "section" and "passage" may name ONLY sections whose text you were given. "section-run" may name any sections in the sequence. Structure references are permitted ONLY if an AUTHORED STRUCTURE block was given; if none was, make no structural claim.
2. Every claim carries at least one non-conclusion from this closed vocabulary, naming what the evidence does not establish:
${VOCABULARY}
3. Do not interpret, rank, score, grade, recommend, or say what should change. Do not guess the author's intent. Do not assert an effect on a reader. Do not describe a whole-Work pattern from partial coverage without saying so through the vocabulary.
4. Do not ask for more sections, more context, or another read. What you were given is the whole of what you may read. If the commissioned question cannot be read from it, say so in claims that carry "outside-coverage", or return "none".
5. Do not invent headings or titles. Refer to sections by id and position, and to divisions by the member's own words as given.
6. Answer ONLY through the tool. Return outcome "none" when, after reading what you were given, there is nothing worth drafting under this lens - that is a complete answer.`;

/* ── the tool ────────────────────────────────────────────────────────────── */

export interface ReaderTool {
  name: string;
  description: string;
  /** JSON Schema. Snake_case key is load-bearing provenance. */
  input_schema: Record<string, unknown>;
}

const id = { type: 'string', minLength: 1 } as const;
const idList = { type: 'array', minItems: 1, items: id } as const;

const REF_SCHEMA = {
  oneOf: [
    { type: 'object', additionalProperties: false, required: ['kind', 'sectionId'],
      properties: { kind: { const: 'section' }, sectionId: id } },
    { type: 'object', additionalProperties: false, required: ['kind', 'sectionId', 'range'],
      properties: { kind: { const: 'passage' }, sectionId: id,
        range: { type: 'object', additionalProperties: false, required: ['start', 'end'],
          properties: { start: { type: 'integer', minimum: 0 }, end: { type: 'integer', minimum: 0 } } } } },
    { type: 'object', additionalProperties: false, required: ['kind', 'sectionIds'],
      properties: { kind: { const: 'section-run' }, sectionIds: idList } },
    { type: 'object', additionalProperties: false, required: ['kind', 'unitId'],
      properties: { kind: { const: 'structure-unit' }, unitId: id } },
    { type: 'object', additionalProperties: false, required: ['kind', 'unitIds'],
      properties: { kind: { const: 'structure-units' }, unitIds: idList } },
    { type: 'object', additionalProperties: false, required: ['kind'],
      properties: { kind: { const: 'structure-topology' } } },
  ],
} as const;

export function readerTool(): ReaderTool {
  return {
    name: TOOL_NAME,
    description: 'Draft what you noticed under the commissioned lens, each draft bound to '
      + 'evidence references and to what it does not establish. Use outcome "none" when '
      + 'there is nothing worth drafting - that is a complete answer.',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      required: ['outcome'],
      properties: {
        outcome: { type: 'string', enum: ['claims', 'none'] },
        claims: {
          type: 'array',
          minItems: 1,
          description: 'For outcome "claims" ONLY. Omit entirely for "none".',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['text', 'refs', 'doesNotEstablish'],
            properties: {
              text: { type: 'string', minLength: 1,
                description: 'What you noticed. Not a recommendation, not a judgement.' },
              refs: { type: 'array', minItems: 1, items: REF_SCHEMA,
                description: 'The evidence this rests on, in the permitted shapes.' },
              doesNotEstablish: { type: 'array', minItems: 1,
                items: { type: 'string', enum: [...DEVELOPMENTAL_NON_CONCLUSIONS] },
                description: 'What this noticing does NOT establish. At least one.' },
            },
          },
        },
      },
    },
  };
}

/** SHA-256 over the system prompt and the tool contract, together (INV-25). */
export function promptContractHash(): string {
  return createHash('sha256')
    .update(READER_SYSTEM, 'utf8')
    .update('\u0000')
    .update(JSON.stringify(readerTool()), 'utf8')
    .digest('hex');
}

/* ── the request ─────────────────────────────────────────────────────────── */

/** Unicode code points — never UTF-16 units. */
export function codePointLength(s: string): number {
  let n = 0;
  for (const _ of s) n += 1;
  return n;
}

function renderStructure(ctx: FrozenStructureContext): string {
  const lines = ctx.units.map((u) => {
    const label = [u.kind, u.title].filter((x): x is string => x !== null && x !== '').join(' · ');
    return `  unit ${u.id} · position ${u.position} · parent ${u.parentId ?? 'none'} · origin ${u.origin}`
      + (label ? ` · "${label}"` : '')
      + ` · sections [${u.sectionIds.join(', ')}]`;
  });
  return `AUTHORED STRUCTURE (the member's own, frozen as read; kind and title are the member's words):\n${lines.join('\n')}`;
}

/**
 * The user message. Deterministic: bodies are rendered in TOPOLOGY order
 * regardless of the order the caller supplied them, and nothing here reads a
 * clock, an environment variable, or anything outside the request.
 *
 * Precondition: the request has passed `validateRequest`. This function does
 * not re-validate; it renders exactly what it is given.
 */
export function renderRequest(request: DevelopmentalReaderRequest): string {
  const { evidence, recovered, commissionedLens } = request;
  const { readState, coverage } = evidence;
  const byId = new Map<string, RecoveredBody>(recovered.map((r) => [r.sectionId, r]));
  const topology = readState.sectionTopology;

  const sequence = topology.map((sid, i) => {
    const depth = coverage.sections[sid] === 'body' ? 'BODY' : 'POSITION';
    const len = depth === 'BODY' ? ` · ${codePointLength(byId.get(sid)?.text ?? '')} code points` : '';
    return `  ${i}. ${sid} · ${depth}${len}`;
  });

  const parts: string[] = [];
  parts.push(`COMMISSIONED LENS: ${commissionedLens}`);
  parts.push(`THE WORK AS READ (draft ${readState.draftId}, revision ${readState.revisionNumber}; ${topology.length} sections in sequence):\n${sequence.join('\n')}`);
  parts.push(readState.structureContext
    ? renderStructure(readState.structureContext)
    : 'AUTHORED STRUCTURE: none was supplied to this reading. Make no structural claim.');

  const bodies = topology
    .filter((sid) => byId.has(sid))
    .map((sid) => {
      const r = byId.get(sid) as RecoveredBody;
      const pos = topology.indexOf(sid);
      return `=== SECTION ${sid} · position ${pos} · ${codePointLength(r.text)} code points ===\n${r.text}\n=== END ${sid} ===`;
    });
  parts.push(bodies.length > 0
    ? `SECTION TEXT (exactly the sections at BODY depth above):\n\n${bodies.join('\n\n')}`
    : 'SECTION TEXT: none. Every section was read at POSITION depth only.');

  parts.push('Draft what you noticed under the commissioned lens, through the tool.');
  return parts.join('\n\n');
}

/** A digest of what the model was shown, for a witness record. */
export function renderedRequestDigest(rendered: string): string {
  return createHash('sha256').update(rendered, 'utf8').digest('hex');
}
