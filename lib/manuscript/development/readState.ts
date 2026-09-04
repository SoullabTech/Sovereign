/**
 * BUILD-07A — DEVELOPMENTAL EVIDENCE · the frozen read state.
 *
 * THE QUESTION THIS ANSWERS. After the author changes the Work, what EXACTLY did
 * MAIA read? Not "something changed" — a digest answers that and DECIDE ruled it
 * insufficient (INV-7b). The state read must be RECOVERABLE.
 *
 * THE MECHANISM (recoverability boundary §3, option (d)). One immutable
 * whole-draft revision, plus per-section `(revisionNumber, codePointRange)` into
 * that revision's content. `working_draft_revisions` is append-only and its
 * `section_partition` freezes the ranges at write time, so a SectionState names
 * the same characters forever without a single character being copied here.
 *
 * ⛔ NO PROSE IN THIS OBJECT. Ids, offsets, digests and fingerprints only. The
 * Work continues to exist in exactly ONE custody domain. A field on any type
 * below that held member text would re-create the second prose store the
 * founder rejected on 2026-09-02.
 *
 * ⛔ A CAPTURE USES ONLY A REVISION THAT EXACTLY MATCHES THE STATE READ. It may
 * not attach the current sections' ranges to an older checkpoint because that
 * checkpoint is convenient (lane, prerequisite closure). `freezeReadState`
 * proves the match three ways — whole content as bytes, partition identity and
 * order, and every section slice as bytes — and refuses otherwise. Making the
 * checkpoint is a separate act this module does not perform; see capture.ts.
 *
 * ⛔ NO INFERENCE. A revision whose partition was never recorded is refused,
 * never re-partitioned. Structure that names sections the revision does not
 * hold is refused, never trimmed to fit.
 *
 * WHY THIS MODULE IS PURE. Every refusal is decided here with no database and
 * no request, so the contract is proven in unit tests and a defect is a red
 * test rather than a false evidence object a member later relies on.
 */

import { createHash } from 'crypto';
import {
  sectionsFromPartition,
  type RevisionSectionRange,
} from '@/lib/manuscript/draftSections';
import {
  fingerprintStructureRows,
  type CanonicalMemberRow,
  type CanonicalUnitRow,
} from '@/lib/manuscript/structure/structureDigest';
import type { CodePointRange } from './evidenceRef';

/* ── the frozen shapes ───────────────────────────────────────────────────── */

/**
 * Where one section's exact text lives, and what it digested to.
 *
 * `range` is in Unicode CODE POINTS into the content of revision
 * `revisionNumber` of the reading's draft — the unit the partition is recorded
 * in and the unit PostgreSQL's `length()` enforces. `digest` is SHA-256 over
 * the section's UTF-8 bytes as read: a check on recovery, never a substitute
 * for it.
 */
export interface SectionState {
  revisionNumber: number;
  range: CodePointRange;
  digest: string;
}

/** One member-authored division, frozen. Holds sections by reference only. */
export interface FrozenStructureUnit {
  id: string;
  parentId: string | null;
  position: number;
  kind: string | null;
  title: string | null;
  origin: 'member' | 'imported';
  adoptedFromId: string | null;
  /** Direct placements, in draft order. Ancestors derive theirs by walking. */
  sectionIds: readonly string[];
}

/**
 * The authored structure as it stood when read, INLINE.
 *
 * Why inline rather than a pointer: `manuscript_structure_units` is mutable in
 * place and has no revision store, so no durable immutable snapshot of authored
 * structure exists to point at. DECIDE (INV-7b) requires the structure context
 * to be "itself frozen or [to] point at a durable immutable snapshot"; the
 * first is the only option inside BUILD-07A's authority. What is frozen is
 * topology and labels — unit ids, parents, positions, the member's own words
 * for kind and title, and section memberships by id. No manuscript prose.
 */
export interface FrozenStructureContext {
  /** Every authored unit, ordered by id — the same order the digest uses. */
  units: readonly FrozenStructureUnit[];
}

export interface DevelopmentalReadState {
  draftId: string;
  /** The ONE immutable revision this reading was taken from. */
  revisionNumber: number;
  /** SHA-256 over that revision's whole content, UTF-8. */
  revisionDigest: string;
  /** The ordered section ids as read — the draft's topology at that revision. */
  sectionTopology: readonly string[];
  /** Exact location and digest for EVERY section in the topology. */
  sections: Readonly<Record<string, SectionState>>;
  /** Over the exact inputs used for THIS reading. See `inputFingerprint()`. */
  inputFingerprint: string;
  /** Present iff authoritative structure was supplied to the reading. */
  structureContext?: FrozenStructureContext;
  /** Present iff `structureContext` is. Same algorithm as `canonicalFingerprint`. */
  structureFingerprint?: string;
}

/**
 * What depth a section was read at.
 *
 *   position   its identity and place in the sequence were known
 *   body       its prose was read, whole. Never a prefix: a partial section
 *              read as a whole one lets a surface say "MAIA read X" when she
 *              read an arbitrary slice of X. Full section or position only.
 */
export type ReadDepth = 'position' | 'body';

export interface DevelopmentalCoverage {
  /** Every section in the topology, with the depth it was read at. */
  sections: Readonly<Record<string, ReadDepth>>;
}

/** The evidence object BUILD-07A establishes. A reading (BUILD-07C) will carry one. */
export interface DevelopmentalEvidence {
  readState: DevelopmentalReadState;
  coverage: DevelopmentalCoverage;
}

/* ── inputs ──────────────────────────────────────────────────────────────── */

/** The draft as it stands now — the state that was, or is about to be, read. */
export interface LiveDraftState {
  draftId: string;
  content: string;
  /** In position order. */
  sections: readonly { id: string; text: string }[];
}

/** One row of `working_draft_revisions`, as stored. */
export interface RevisionRecord {
  revisionNumber: number;
  content: string;
  sectionPartition: readonly RevisionSectionRange[] | null;
}

/** Authored-structure rows, in the database's own shape. */
export interface StructureRows {
  units: readonly CanonicalUnitRow[];
  members: readonly CanonicalMemberRow[];
}

export interface FreezeInput {
  draft: LiveDraftState;
  revision: RevisionRecord;
  /** Section ids whose bodies this reading covers. May be empty. */
  bodyScope: readonly string[];
  /**
   * Authored structure, when it is being supplied to the reading. `undefined`
   * means structure was NOT supplied, and every structural reference will be
   * refused at bind time — absent, not degraded (INV-16a).
   */
  structure?: StructureRows;
}

export type FreezeRefusal =
  /** The revision predates section-addressability; boundaries were never observed. */
  | 'partition_not_recorded'
  /** The revision is not the state now read. Checkpoint first; never re-attach. */
  | 'revision_not_current'
  /** `bodyScope` names a section the revision does not hold. */
  | 'unknown_section'
  /** Structure names a unit, parent or section the reading cannot see. */
  | 'structure_inconsistent';

export type FreezeResult =
  | { ok: true; value: DevelopmentalEvidence }
  | { ok: false; refusal: FreezeRefusal; detail: string };

const refuse = (refusal: FreezeRefusal, detail: string): FreezeResult =>
  ({ ok: false, refusal, detail });

export const sha256 = (s: string): string =>
  createHash('sha256').update(s, 'utf8').digest('hex');

const sameBytes = (a: string, b: string): boolean =>
  Buffer.from(a, 'utf8').equals(Buffer.from(b, 'utf8'));

/* ── the fingerprint ─────────────────────────────────────────────────────── */

/**
 * A digest over the EXACT inputs used for a reading, and nothing else.
 *
 * ⛔ Deliberately not `interpretationInputHash`. That is the StructureReader's
 * hash over headings plus supplied bodies, and UNDERSTAND §2 declined to adopt
 * that regime. This covers: which draft, which immutable revision (by number
 * and by content digest), the topology as read, which sections were read at
 * body depth and what each digested to, and the structure fingerprint when
 * structure was supplied. Change any one and the fingerprint moves; nothing
 * outside that set can move it.
 */
export function inputFingerprint(input: {
  draftId: string;
  revisionNumber: number;
  revisionDigest: string;
  sectionTopology: readonly string[];
  bodySections: readonly { sectionId: string; digest: string }[];
  structureFingerprint: string | null;
}): string {
  return sha256(JSON.stringify({
    v: 1,
    draftId: input.draftId,
    revisionNumber: input.revisionNumber,
    revisionDigest: input.revisionDigest,
    sectionTopology: input.sectionTopology,
    bodySections: input.bodySections,
    structureFingerprint: input.structureFingerprint,
  }));
}

/* ── structure ───────────────────────────────────────────────────────────── */

const byId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Authored rows only. A `proposed` unit is MAIA's own earlier perception and
 * may not enter the structure a developmental reading reasons from (INV-17);
 * `loadStructure` applies the same filter for the outline.
 */
export function authoredRows(structure: StructureRows): StructureRows {
  const units = structure.units.filter((u) => u.origin !== 'proposed');
  const ids = new Set(units.map((u) => u.id));
  return { units, members: structure.members.filter((m) => ids.has(m.unit_id)) };
}

/**
 * Re-express a frozen context as the database row shapes, so it can be digested
 * with the one structure algorithm. Used to prove `structureFingerprint` is a
 * digest OF the frozen context rather than of something adjacent to it.
 */
export function rowsOfFrozenStructure(ctx: FrozenStructureContext): StructureRows {
  return {
    units: ctx.units.map((u) => ({
      id: u.id, parent_id: u.parentId, position: u.position, kind: u.kind,
      title: u.title, origin: u.origin, adopted_from_id: u.adoptedFromId,
    })),
    members: ctx.units.flatMap((u) =>
      u.sectionIds.map((sectionId) => ({ unit_id: u.id, draft_section_id: sectionId }))),
  };
}

function freezeStructure(
  structure: StructureRows,
  topology: readonly string[],
): { ok: true; context: FrozenStructureContext | null; fingerprint: string | null }
  | { ok: false; detail: string } {
  const { units, members } = authoredRows(structure);
  if (units.length === 0) {
    /* Supplied, but the Work has no authored structure. The structure-aware
       half is ABSENT for this reading, and a bind of any structural ref will
       say so. Not an error: most Works begin here. */
    return { ok: true, context: null, fingerprint: null };
  }
  const unitIds = new Set(units.map((u) => u.id));
  const positionOf = new Map(topology.map((id, i) => [id, i]));

  for (const u of units) {
    if (u.parent_id !== null && !unitIds.has(u.parent_id)) {
      return { ok: false, detail: `unit ${u.id} names a parent ${u.parent_id} that is not an authored unit` };
    }
  }
  for (const m of members) {
    if (!positionOf.has(m.draft_section_id)) {
      return { ok: false, detail: `unit ${m.unit_id} places section ${m.draft_section_id}, which this revision does not hold` };
    }
  }

  const placements = new Map<string, string[]>();
  for (const m of members) {
    const list = placements.get(m.unit_id) ?? [];
    list.push(m.draft_section_id);
    placements.set(m.unit_id, list);
  }

  const frozen: FrozenStructureUnit[] = [...units].sort(byId).map((u) => ({
    id: u.id,
    parentId: u.parent_id,
    position: u.position,
    kind: u.kind,
    title: u.title,
    origin: u.origin as 'member' | 'imported',
    adoptedFromId: u.adopted_from_id,
    sectionIds: (placements.get(u.id) ?? [])
      .sort((a, b) => (positionOf.get(a) as number) - (positionOf.get(b) as number)),
  }));

  return {
    ok: true,
    context: { units: frozen },
    fingerprint: fingerprintStructureRows(units, members),
  };
}

/* ── the freeze ──────────────────────────────────────────────────────────── */

/**
 * Freeze what the Work is, from a revision that exactly matches it.
 *
 * Three proofs of the match, each refusing on failure with zero side effects:
 *
 *   1. the revision's content is BYTE-IDENTICAL to the draft's content
 *   2. the revision's partition names the draft's sections, in the draft's order
 *   3. every slice the partition recovers is byte-identical to that section's
 *      live text — so the boundaries, not only the flattening, are the ones read
 *
 * (3) is not redundant with (1)+(2): two partitions of one string can differ at
 * a boundary and flatten identically. The revision is the state read only if
 * its sections are the sections read.
 */
export function freezeReadState(input: FreezeInput): FreezeResult {
  const { draft, revision, bodyScope, structure } = input;

  if (!revision.sectionPartition || revision.sectionPartition.length === 0) {
    return refuse('partition_not_recorded',
      `revision ${revision.revisionNumber} predates the draft becoming section-addressable; `
      + 'its boundaries were never recorded and are not inferred');
  }

  if (!sameBytes(revision.content, draft.content)) {
    return refuse('revision_not_current',
      `revision ${revision.revisionNumber} is not the state now read `
      + `(revision ${Buffer.byteLength(revision.content, 'utf8')} bytes, draft `
      + `${Buffer.byteLength(draft.content, 'utf8')} bytes). Checkpoint first; `
      + 'a capture never attaches current ranges to an older revision');
  }

  const topology = draft.sections.map((s) => s.id);
  const recovered = sectionsFromPartition(revision.content, revision.sectionPartition, topology);
  if (!recovered.ok) {
    return recovered.refusal === 'partition_not_recorded'
      ? refuse('partition_not_recorded', recovered.detail)
      : refuse('revision_not_current',
        `revision ${revision.revisionNumber} was partitioned into different sections than the draft now holds`);
  }
  for (let i = 0; i < topology.length; i += 1) {
    if (!sameBytes(recovered.value[i].text, draft.sections[i].text)) {
      return refuse('revision_not_current',
        `section ${topology[i]} differs between revision ${revision.revisionNumber} and the draft now read`);
    }
  }

  const positionOf = new Map(topology.map((id, i) => [id, i]));
  const scope = new Set<string>();
  for (const id of bodyScope) {
    if (!positionOf.has(id)) {
      return refuse('unknown_section', `bodyScope names ${id}, which this revision does not hold`);
    }
    scope.add(id);
  }

  let structureContext: FrozenStructureContext | undefined;
  let structureFingerprint: string | undefined;
  if (structure !== undefined) {
    const frozen = freezeStructure(structure, topology);
    if (!frozen.ok) return refuse('structure_inconsistent', frozen.detail);
    if (frozen.context) {
      structureContext = frozen.context;
      structureFingerprint = frozen.fingerprint as string;
    }
  }

  const sections: Record<string, SectionState> = {};
  const coverage: Record<string, ReadDepth> = {};
  const bodySections: { sectionId: string; digest: string }[] = [];
  for (const [i, range] of revision.sectionPartition.entries()) {
    const id = topology[i];
    const digest = sha256(draft.sections[i].text);
    sections[id] = {
      revisionNumber: revision.revisionNumber,
      range: { start: range.start, end: range.end },
      digest,
    };
    const depth: ReadDepth = scope.has(id) ? 'body' : 'position';
    coverage[id] = depth;
    if (depth === 'body') bodySections.push({ sectionId: id, digest });
  }

  const revisionDigest = sha256(revision.content);
  const readState: DevelopmentalReadState = {
    draftId: draft.draftId,
    revisionNumber: revision.revisionNumber,
    revisionDigest,
    sectionTopology: topology,
    sections,
    inputFingerprint: inputFingerprint({
      draftId: draft.draftId,
      revisionNumber: revision.revisionNumber,
      revisionDigest,
      sectionTopology: topology,
      bodySections,
      structureFingerprint: structureFingerprint ?? null,
    }),
    ...(structureContext ? { structureContext, structureFingerprint } : {}),
  };

  return { ok: true, value: { readState, coverage: { sections: coverage } } };
}
