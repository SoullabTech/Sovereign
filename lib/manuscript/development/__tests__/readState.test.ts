/**
 * BUILD-07A — freezing the state read. INV-7, INV-7a, INV-7b, INV-16a, INV-17.
 */

import { codePointLength } from '@/lib/manuscript/draftSections';
import { fingerprintStructureRows } from '@/lib/manuscript/structure/structureDigest';
import {
  freezeReadState, rowsOfFrozenStructure, authoredRows, sha256,
} from '../readState';
import { evidenceAtRev1, liveDraft, revisionOf, STRUCTURE, TEXTS, S } from './fixture';

describe('a capture uses only a revision that exactly matches the state read', () => {
  it('freezes when the revision is the draft, byte for byte, section for section', () => {
    const { evidence } = evidenceAtRev1();
    expect(evidence.readState.revisionNumber).toBe(1);
    expect(evidence.readState.sectionTopology).toEqual([...S]);
  });

  it('refuses a revision whose content is not the draft now held', () => {
    const draft = liveDraft({ s1: `${TEXTS.s1}One more sentence 🌒.\n\n` });
    const older = revisionOf(liveDraft(), 1);
    const r = freezeReadState({ draft, revision: older, bodyScope: ['s1'] });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.refusal).toBe('revision_not_current');
  });

  it('refuses a revision that flattens identically but was partitioned at a different boundary', () => {
    /* Move one character from the end of s0 to the start of s1: same string,
       different sections. Content matches; the sections do not. */
    const a = TEXTS.s0.slice(0, -1);
    const b = TEXTS.s0.slice(-1) + TEXTS.s1;
    const draft = liveDraft({ s0: a, s1: b });
    const revision = revisionOf(liveDraft(), 1);
    expect(revision.content).toBe(draft.content);
    const r = freezeReadState({ draft, revision, bodyScope: [] });
    expect(!r.ok && r.refusal).toBe('revision_not_current');
  });

  it('refuses, and never re-partitions, a revision with no recorded partition', () => {
    const draft = liveDraft();
    const legacy = { revisionNumber: 1, content: draft.content, sectionPartition: null };
    const r = freezeReadState({ draft, revision: legacy, bodyScope: ['s0'] });
    expect(!r.ok && r.refusal).toBe('partition_not_recorded');
  });

  it('refuses a body scope naming a section the revision does not hold', () => {
    const draft = liveDraft();
    const r = freezeReadState({ draft, revision: revisionOf(draft), bodyScope: ['s0', 'ghost'] });
    expect(!r.ok && r.refusal).toBe('unknown_section');
  });
});

describe('per-section state resolves to the immutable revision (INV-7a, INV-7b)', () => {
  it('freezes every section as (revisionNumber, code-point range, digest) — no prose', () => {
    const { evidence, draft } = evidenceAtRev1();
    let cursor = 0;
    for (const id of S) {
      const st = evidence.readState.sections[id];
      const len = codePointLength(TEXTS[id]);
      expect(st.revisionNumber).toBe(1);
      expect(st.range).toEqual({ start: cursor, end: cursor + len });
      expect(st.digest).toBe(sha256(TEXTS[id]));
      cursor += len;
    }
    expect(cursor).toBe(codePointLength(draft.content));
    /* The unit is code points: a JavaScript length would be larger. */
    expect(draft.content.length).toBeGreaterThan(cursor);
  });

  it('carries not one character of the Work', () => {
    const { evidence } = evidenceAtRev1();
    const json = JSON.stringify(evidence);
    for (const id of S) {
      const sentence = TEXTS[id].split('\n').filter((l) => l.length > 8)[0];
      expect(json).not.toContain(sentence);
    }
    expect(json).not.toContain('lantern');
    expect(json).not.toContain('🏮');
  });

  it('records depth per section: body for the scope, position for the rest', () => {
    const { evidence } = evidenceAtRev1({ bodyScope: ['s1', 's3'] });
    expect(evidence.coverage.sections).toEqual({ s0: 'position', s1: 'body', s2: 'position', s3: 'body' });
  });

  it('allows an empty body scope — order-only and structure-only readings are honest', () => {
    const { evidence } = evidenceAtRev1({ bodyScope: [] });
    expect(Object.values(evidence.coverage.sections).every((d) => d === 'position')).toBe(true);
  });
});

describe('the input fingerprint covers exactly the inputs used', () => {
  it('is deterministic', () => {
    expect(evidenceAtRev1().evidence.readState.inputFingerprint)
      .toBe(evidenceAtRev1().evidence.readState.inputFingerprint);
  });

  it('moves when the body scope moves, and when structure is withdrawn', () => {
    const a = evidenceAtRev1({ bodyScope: ['s0', 's1'] }).evidence.readState.inputFingerprint;
    const b = evidenceAtRev1({ bodyScope: ['s0'] }).evidence.readState.inputFingerprint;
    const c = evidenceAtRev1({ bodyScope: ['s0', 's1'], withStructure: false }).evidence.readState.inputFingerprint;
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });

  it('moves when a section read at body depth changes, even if the revision number is reused', () => {
    const changed = liveDraft({ s1: `${TEXTS.s1}Another sentence 🌒.\n\n` });
    const r = freezeReadState({ draft: changed, revision: revisionOf(changed, 1), bodyScope: ['s0', 's1'], structure: STRUCTURE });
    expect(r.ok && r.value.readState.inputFingerprint)
      .not.toBe(evidenceAtRev1().evidence.readState.inputFingerprint);
  });
});

describe('structure context is frozen inline and reasons only from authored structure', () => {
  it('excludes proposed units and their placements (INV-17)', () => {
    const { evidence } = evidenceAtRev1();
    const ctx = evidence.readState.structureContext!;
    expect(ctx.units.map((u) => u.id)).toEqual(['u1', 'u2']);
    expect(ctx.units.find((u) => u.id === 'u2')!.sectionIds).toEqual(['s2', 's3']);
    expect(JSON.stringify(ctx)).not.toContain('p9');
  });

  it('digests to exactly the frozen context, with the canonical algorithm', () => {
    const { evidence } = evidenceAtRev1();
    const rows = rowsOfFrozenStructure(evidence.readState.structureContext!);
    expect(fingerprintStructureRows(rows.units, rows.members)).toBe(evidence.readState.structureFingerprint);
    const authored = authoredRows(STRUCTURE);
    expect(fingerprintStructureRows(authored.units, authored.members)).toBe(evidence.readState.structureFingerprint);
  });

  it('is ABSENT, not degraded, when structure is not supplied or the Work has none', () => {
    const none = evidenceAtRev1({ withStructure: false }).evidence.readState;
    expect(none.structureContext).toBeUndefined();
    expect(none.structureFingerprint).toBeUndefined();

    const draft = liveDraft();
    const r = freezeReadState({
      draft, revision: revisionOf(draft), bodyScope: [],
      structure: { units: STRUCTURE.units.filter((u) => u.origin === 'proposed'), members: [] },
    });
    expect(r.ok && r.value.readState.structureContext).toBeUndefined();
  });

  it('refuses structure that places a section this revision does not hold', () => {
    const draft = liveDraft();
    const r = freezeReadState({
      draft, revision: revisionOf(draft), bodyScope: [],
      structure: { units: STRUCTURE.units, members: [...STRUCTURE.members, { unit_id: 'u2', draft_section_id: 'ghost' }] },
    });
    expect(!r.ok && r.refusal).toBe('structure_inconsistent');
  });

  it('refuses a unit whose parent is not an authored unit', () => {
    const draft = liveDraft();
    const r = freezeReadState({
      draft, revision: revisionOf(draft), bodyScope: [],
      structure: { units: [...STRUCTURE.units, { id: 'u3', parent_id: 'p9', position: 0, kind: null, title: 'Orphan', origin: 'member', adopted_from_id: null }], members: STRUCTURE.members },
    });
    expect(!r.ok && r.refusal).toBe('structure_inconsistent');
  });
});
