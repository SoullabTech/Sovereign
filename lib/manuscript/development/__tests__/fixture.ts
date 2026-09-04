/**
 * BUILD-07A test fixture — a four-section Work with astral prose.
 *
 * ⛔ ASTRAL ON PURPOSE. The prerequisite's first witness passed 41/41 over BMP
 * prose and proved the fixture, not the claim. Every text here carries at
 * least one character outside the BMP so that a code-unit / code-point
 * confusion anywhere in the evidence path fails a test instead of a member.
 */

import { partitionFromSections } from '@/lib/manuscript/draftSections';
import type { CanonicalMemberRow, CanonicalUnitRow } from '@/lib/manuscript/structure/structureDigest';
import {
  freezeReadState,
  type DevelopmentalEvidence,
  type LiveDraftState,
  type RevisionRecord,
  type StructureRows,
} from '../readState';

export const S = ['s0', 's1', 's2', 's3'] as const;

export const TEXTS: Record<(typeof S)[number], string> = {
  s0: 'The First Movement 😀\n\nA thread is introduced here, and it carries a lantern 🏮.\n\n',
  s1: 'The Second Movement\n\nThe thread continues — café and an astral pair 𝔘𝔫 sit mid-sentence.\n\n',
  s2: '😀 An unheaded third movement that BEGINS with an emoji and says nothing of the thread.\n\n',
  s3: 'The Fourth Movement\n\nThe lantern 🏮 returns, at last.\n',
};

export function liveDraft(overrides: Partial<Record<(typeof S)[number], string>> = {}): LiveDraftState {
  const sections = S.map((id) => ({ id, text: overrides[id] ?? TEXTS[id] }));
  return { draftId: 'draft-1', content: sections.map((s) => s.text).join(''), sections };
}

export function revisionOf(draft: LiveDraftState, revisionNumber = 1): RevisionRecord {
  return {
    revisionNumber,
    content: draft.content,
    sectionPartition: partitionFromSections(draft.sections),
  };
}

/** Two authored units, u1 = s0..s1, u2 = s2..s3, plus a `proposed` row that must be excluded. */
export const UNIT_ROWS: CanonicalUnitRow[] = [
  { id: 'u1', parent_id: null, position: 0, kind: 'chapter', title: 'One', origin: 'member', adopted_from_id: null },
  { id: 'u2', parent_id: null, position: 1, kind: 'chapter', title: 'Two', origin: 'member', adopted_from_id: null },
  { id: 'p9', parent_id: null, position: 2, kind: 'part', title: 'MAIA thought so', origin: 'proposed', adopted_from_id: null },
];
export const MEMBER_ROWS: CanonicalMemberRow[] = [
  { unit_id: 'u1', draft_section_id: 's0' },
  { unit_id: 'u1', draft_section_id: 's1' },
  { unit_id: 'u2', draft_section_id: 's2' },
  { unit_id: 'u2', draft_section_id: 's3' },
  { unit_id: 'p9', draft_section_id: 's3' },
];
export const STRUCTURE: StructureRows = { units: UNIT_ROWS, members: MEMBER_ROWS };

/** A frozen reading of the fixture at revision 1, bodies for s0 and s1, structure supplied. */
export function evidenceAtRev1(opts: { bodyScope?: readonly string[]; withStructure?: boolean } = {}): {
  draft: LiveDraftState; revision: RevisionRecord; evidence: DevelopmentalEvidence;
} {
  const draft = liveDraft();
  const revision = revisionOf(draft);
  const r = freezeReadState({
    draft, revision,
    bodyScope: opts.bodyScope ?? ['s0', 's1'],
    structure: opts.withStructure === false ? undefined : STRUCTURE,
  });
  if (!r.ok) throw new Error(`fixture failed to freeze: ${r.refusal} ${r.detail}`);
  return { draft, revision, evidence: r.value };
}
