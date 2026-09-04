/**
 * BUILD-07A — DEVELOPMENTAL EVIDENCE · resolving a reference.
 *
 * TWO OPERATIONS, NAMED APART (DECIDE §4). Conflating them is how "resolves
 * through frozen state" and "may fail after an edit" were both once said of one
 * thing:
 *
 *   HISTORICAL DISPLAY   show what the observation rested on
 *                        → `recoverEvidence` · resolves against the reading's
 *                          frozen state and the immutable revision
 *                        → must ALWAYS succeed, or the reading was never
 *                          recoverable
 *
 *   CURRENT LOCATION     find that same evidence in the Work as it stands now
 *                        → `locateCurrent` · three-state, never two
 *                        → failure is a SUPERSESSION SIGNAL, not an error
 *
 * ⛔ NO FUZZY MATCHING, EVER. A passage whose section has changed is superseded
 * even if the same words still appear somewhere in it. "An implementation that
 * silently fuzzy-matches a moved passage to keep the second operation
 * succeeding has invented evidence for the first." A reading is never
 * re-anchored (INV-19).
 *
 * ⛔ UNMEASURED IS A STATE. Where the live Work could not be loaded, the answer
 * is `unmeasured`, never `current`. A surface that cannot say "I do not know"
 * will say "no" — the `ask/staleness.ts` doctrine, reused rather than
 * re-derived (INV-20).
 */

import { codePointBoundaries } from '@/lib/manuscript/draftSections';
import { fingerprintStructureRows } from '@/lib/manuscript/structure/structureDigest';
import {
  type CodePointRange,
  type EvidenceRef,
  type NonEmptyArray,
} from './evidenceRef';
import {
  authoredRows,
  sha256,
  type DevelopmentalReadState,
  type FrozenStructureUnit,
  type StructureRows,
} from './readState';

/* ── historical display ──────────────────────────────────────────────────── */

export type Recovered =
  /** The exact words read. `range` is within the section, in code points. */
  | { kind: 'text'; sectionId: string; range: CodePointRange; text: string }
  /** The sequence as read, with each section's position in the topology. */
  | { kind: 'sequence'; sectionIds: readonly string[]; positions: readonly number[] }
  /** The authored unit(s) as frozen. `whole` when the ref named the topology. */
  | { kind: 'structure'; units: readonly FrozenStructureUnit[]; whole: boolean };

export type RecoverRefusal =
  /** A textual ref was asked for without the revision's content. */
  | 'revision_content_required'
  /** The content supplied is not the revision the reading froze. Append-only store violated, or wrong row. */
  | 'revision_integrity_failure'
  /** The recovered section's bytes do not digest to what was frozen. */
  | 'section_integrity_failure'
  | 'section_not_in_read_state'
  | 'range_outside_section'
  | 'structure_not_frozen'
  | 'unit_not_in_structure_context';

export type RecoverResult =
  | { ok: true; value: Recovered }
  | { ok: false; refusal: RecoverRefusal; detail: string };

const refuseRecover = (refusal: RecoverRefusal, detail: string): RecoverResult =>
  ({ ok: false, refusal, detail });

/**
 * Show what an observation rested on, from the reading's frozen state.
 *
 * `revisionContent` is the content of `readState.revisionNumber` for
 * `readState.draftId`, loaded by the caller from `working_draft_revisions`.
 * It is verified against the frozen digest before a single character is
 * sliced: this function recovers, it does not trust.
 *
 * ⛔ Slicing goes through the code-point boundary table. `String.slice` takes
 * UTF-16 indices; on astral text it returns a lone surrogate — prose the
 * member never wrote, in the one path whose whole purpose is exactness.
 */
export function recoverEvidence(
  ref: EvidenceRef,
  readState: DevelopmentalReadState,
  revisionContent: string | null,
): RecoverResult {
  switch (ref.kind) {
    case 'section':
    case 'passage': {
      const state = readState.sections[ref.sectionId];
      if (!state) {
        return refuseRecover('section_not_in_read_state',
          `section ${ref.sectionId} is not in the frozen read state`);
      }
      if (revisionContent === null) {
        return refuseRecover('revision_content_required',
          `recovering ${ref.kind} evidence needs the content of revision ${readState.revisionNumber}`);
      }
      if (sha256(revisionContent) !== readState.revisionDigest) {
        return refuseRecover('revision_integrity_failure',
          `the content supplied is not revision ${readState.revisionNumber} as frozen`);
      }
      const boundaries = codePointBoundaries(revisionContent);
      const sectionLength = state.range.end - state.range.start;
      if (state.range.end > boundaries.length - 1) {
        return refuseRecover('revision_integrity_failure',
          `section ${ref.sectionId} is frozen beyond the end of revision ${readState.revisionNumber}`);
      }
      const sectionText = revisionContent.slice(
        boundaries[state.range.start], boundaries[state.range.end]);
      if (sha256(sectionText) !== state.digest) {
        return refuseRecover('section_integrity_failure',
          `section ${ref.sectionId} recovered from revision ${readState.revisionNumber} does not digest to what was frozen`);
      }
      if (ref.kind === 'section') {
        return { ok: true, value: {
          kind: 'text', sectionId: ref.sectionId,
          range: { start: 0, end: sectionLength }, text: sectionText,
        } };
      }
      const { start, end } = ref.range;
      if (start < 0 || end < start || end > sectionLength) {
        return refuseRecover('range_outside_section',
          `passage ${start}–${end} lies outside section ${ref.sectionId}, which is ${sectionLength} code points as read`);
      }
      const inner = codePointBoundaries(sectionText);
      return { ok: true, value: {
        kind: 'text', sectionId: ref.sectionId, range: { start, end },
        text: sectionText.slice(inner[start], inner[end]),
      } };
    }

    case 'section-run': {
      const positions: number[] = [];
      for (const id of ref.sectionIds) {
        const p = readState.sectionTopology.indexOf(id);
        if (p < 0) {
          return refuseRecover('section_not_in_read_state', `section ${id} is not in the frozen read state`);
        }
        positions.push(p);
      }
      return { ok: true, value: { kind: 'sequence', sectionIds: ref.sectionIds, positions } };
    }

    case 'structure-unit':
    case 'structure-units':
    case 'structure-topology': {
      const ctx = readState.structureContext;
      if (!ctx) {
        return refuseRecover('structure_not_frozen',
          'no authoritative structure was supplied to this reading');
      }
      if (ref.kind === 'structure-topology') {
        return { ok: true, value: { kind: 'structure', units: ctx.units, whole: true } };
      }
      const wanted = ref.kind === 'structure-unit' ? [ref.unitId] : ref.unitIds;
      const units: FrozenStructureUnit[] = [];
      for (const id of wanted) {
        const u = ctx.units.find((x) => x.id === id);
        if (!u) {
          return refuseRecover('unit_not_in_structure_context',
            `unit ${id} is not in the frozen structure context`);
        }
        units.push(u);
      }
      return { ok: true, value: { kind: 'structure', units, whole: false } };
    }
  }
}

/* ── current location ────────────────────────────────────────────────────── */

/** The Work as it stands now. Each part nullable ON PURPOSE: null = could not be measured. */
export interface LiveWork {
  /** Current sections in position order, or null when they could not be loaded. */
  sections: readonly { id: string; text: string }[] | null;
  /** Current authored structure rows, or null when they could not be loaded. */
  structure: StructureRows | null;
}

export type Moved =
  | { what: 'section-text'; sectionId: string }
  | { what: 'section-absent'; sectionId: string }
  | { what: 'section-order'; sectionIds: readonly string[] }
  | { what: 'structure-unit'; unitId: string }
  | { what: 'structure-unit-absent'; unitId: string }
  | { what: 'structure-topology' };

export type CurrentLocation =
  | { state: 'current' }
  | { state: 'superseded'; moved: NonEmptyArray<Moved> }
  | { state: 'unmeasured' };

const superseded = (moved: Moved[]): CurrentLocation =>
  moved.length === 0 ? { state: 'current' } : { state: 'superseded', moved: moved as unknown as NonEmptyArray<Moved> };

function sameUnit(frozen: FrozenStructureUnit, now: StructureRows): boolean {
  const row = now.units.find((u) => u.id === frozen.id);
  if (!row) return false;
  if (row.parent_id !== frozen.parentId || row.position !== frozen.position
    || row.kind !== frozen.kind || row.title !== frozen.title
    || row.origin !== frozen.origin || row.adopted_from_id !== frozen.adoptedFromId) {
    return false;
  }
  const placed = now.members.filter((m) => m.unit_id === frozen.id).map((m) => m.draft_section_id);
  if (placed.length !== frozen.sectionIds.length) return false;
  const set = new Set(placed);
  return frozen.sectionIds.every((id) => set.has(id));
}

/**
 * Whether the evidence a reference points at is still what the Work holds.
 *
 * Scoped to what the reference actually depends on (INV-21):
 *
 *   section / passage    that section's text, byte for byte. A passage does
 *                        not survive its section changing, however little
 *   section-run          the presence and relative order of exactly those ids;
 *                        text changes inside them do not move a run
 *   structure-unit(s)    that unit's own row and direct placements
 *   structure-topology   the whole authored structure's digest
 *
 * Anything the reference does not depend on cannot supersede it. Inserting a
 * section elsewhere in the Work leaves a local section ref current.
 */
export function locateCurrent(
  ref: EvidenceRef,
  readState: DevelopmentalReadState,
  now: LiveWork,
): CurrentLocation {
  switch (ref.kind) {
    case 'section':
    case 'passage': {
      if (now.sections === null) return { state: 'unmeasured' };
      const frozen = readState.sections[ref.sectionId];
      if (!frozen) return { state: 'unmeasured' };
      const live = now.sections.find((s) => s.id === ref.sectionId);
      if (!live) return superseded([{ what: 'section-absent', sectionId: ref.sectionId }]);
      if (sha256(live.text) !== frozen.digest) {
        return superseded([{ what: 'section-text', sectionId: ref.sectionId }]);
      }
      return { state: 'current' };
    }

    case 'section-run': {
      if (now.sections === null) return { state: 'unmeasured' };
      const moved: Moved[] = [];
      const liveOrder = now.sections.map((s) => s.id);
      for (const id of ref.sectionIds) {
        if (!liveOrder.includes(id)) moved.push({ what: 'section-absent', sectionId: id });
      }
      if (moved.length > 0) return superseded(moved);
      /* The run as read was contiguous in the frozen topology (bind enforces
         it). It is current only if the live topology holds exactly that run,
         contiguously, in that order — an inserted section inside it, or a
         reorder, moves it. */
      const from = liveOrder.indexOf(ref.sectionIds[0]);
      const liveRun = liveOrder.slice(from, from + ref.sectionIds.length);
      const same = liveRun.length === ref.sectionIds.length
        && liveRun.every((id, i) => id === ref.sectionIds[i]);
      return same ? { state: 'current' } : superseded([{ what: 'section-order', sectionIds: ref.sectionIds }]);
    }

    case 'structure-unit':
    case 'structure-units': {
      if (now.structure === null) return { state: 'unmeasured' };
      const ctx = readState.structureContext;
      if (!ctx) return { state: 'unmeasured' };
      const live = authoredRows(now.structure);
      const moved: Moved[] = [];
      for (const id of ref.kind === 'structure-unit' ? [ref.unitId] : ref.unitIds) {
        const frozen = ctx.units.find((u) => u.id === id);
        if (!frozen) return { state: 'unmeasured' };
        if (!live.units.some((u) => u.id === id)) moved.push({ what: 'structure-unit-absent', unitId: id });
        else if (!sameUnit(frozen, live)) moved.push({ what: 'structure-unit', unitId: id });
      }
      return superseded(moved);
    }

    case 'structure-topology': {
      if (now.structure === null) return { state: 'unmeasured' };
      if (!readState.structureFingerprint) return { state: 'unmeasured' };
      const live = authoredRows(now.structure);
      return fingerprintStructureRows(live.units, live.members) === readState.structureFingerprint
        ? { state: 'current' }
        : superseded([{ what: 'structure-topology' }]);
    }
  }
}

/**
 * The location of an OBSERVATION: the union over its references.
 *
 * Three-state and conservative in the right direction: any superseded ref
 * supersedes the observation; otherwise any unmeasured ref leaves it
 * unmeasured; only when every ref is current is the observation current.
 * "Unknown" never rounds to "current".
 */
export function observationLocation(
  refs: readonly EvidenceRef[],
  readState: DevelopmentalReadState,
  now: LiveWork,
): CurrentLocation {
  const moved: Moved[] = [];
  let unmeasured = false;
  for (const ref of refs) {
    const loc = locateCurrent(ref, readState, now);
    if (loc.state === 'superseded') moved.push(...loc.moved);
    else if (loc.state === 'unmeasured') unmeasured = true;
  }
  if (moved.length > 0) return superseded(moved);
  return unmeasured ? { state: 'unmeasured' } : { state: 'current' };
}
