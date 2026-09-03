/**
 * BUILD-07A — INV-7b proven: an evidence reference resolves back to the exact
 * state read AFTER the author changes the Work. And INV-19/20/21: never
 * re-anchored, three-state, scoped to what moved.
 */

import { codePointLength } from '@/lib/manuscript/draftSections';
import { recoverEvidence, locateCurrent, observationLocation, type LiveWork } from '../resolve';
import { evidenceAtRev1, liveDraft, TEXTS, STRUCTURE } from './fixture';

const bytes = (s: string) => Buffer.from(s, 'utf8');

describe('HISTORICAL DISPLAY — recovers what was read, after the Work changes', () => {
  const { evidence, revision } = evidenceAtRev1();
  const rs = evidence.readState;

  it('recovers a whole section byte for byte from the immutable revision', () => {
    const r = recoverEvidence({ kind: 'section', sectionId: 's1' }, rs, revision.content);
    expect(r.ok).toBe(true);
    expect(r.ok && r.value.kind === 'text' && bytes(r.value.text).equals(bytes(TEXTS.s1))).toBe(true);
  });

  it('still recovers the ORIGINAL text when the live section has since changed', () => {
    /* The author edits s1. The reading's revision does not change — it is
       append-only — so recovery against it returns what MAIA read. */
    const edited = liveDraft({ s1: 'Entirely rewritten 🌒.\n\n' });
    expect(edited.sections[1].text).not.toBe(TEXTS.s1);
    const r = recoverEvidence({ kind: 'section', sectionId: 's1' }, rs, revision.content);
    expect(r.ok && r.value.kind === 'text' && r.value.text).toBe(TEXTS.s1);
  });

  it('recovers a passage across an astral character without a split surrogate', () => {
    /* s1 contains '𝔘𝔫'. Take a code-point range that ends between them. */
    const idx = Array.from(TEXTS.s1).indexOf('𝔘');
    const r = recoverEvidence({ kind: 'passage', sectionId: 's1', range: { start: idx - 5, end: idx + 1 } }, rs, revision.content);
    expect(r.ok).toBe(true);
    const text = r.ok && r.value.kind === 'text' ? r.value.text : '';
    expect(text.endsWith('𝔘')).toBe(true);
    expect(codePointLength(text)).toBe(6);
    expect(text).toBe(Array.from(TEXTS.s1).slice(idx - 5, idx + 1).join(''));
  });

  it('refuses a passage that lies outside the section as read', () => {
    const len = codePointLength(TEXTS.s1);
    const r = recoverEvidence({ kind: 'passage', sectionId: 's1', range: { start: 0, end: len + 1 } }, rs, revision.content);
    expect(!r.ok && r.refusal).toBe('range_outside_section');
  });

  it('refuses content that is not the frozen revision — it recovers, it does not trust', () => {
    const later = liveDraft({ s1: 'Entirely rewritten 🌒.\n\n' }).content;
    const r = recoverEvidence({ kind: 'section', sectionId: 's0' }, rs, later);
    expect(!r.ok && r.refusal).toBe('revision_integrity_failure');
  });

  it('needs the revision content for textual refs and says so', () => {
    const r = recoverEvidence({ kind: 'section', sectionId: 's0' }, rs, null);
    expect(!r.ok && r.refusal).toBe('revision_content_required');
  });

  it('recovers a run as the frozen sequence with positions', () => {
    const r = recoverEvidence({ kind: 'section-run', sectionIds: ['s1', 's2'] }, rs, null);
    expect(r.ok && r.value).toEqual({ kind: 'sequence', sectionIds: ['s1', 's2'], positions: [1, 2] });
  });

  it('recovers the frozen unit — the structure MAIA reasoned from, not the structure now', () => {
    const r = recoverEvidence({ kind: 'structure-unit', unitId: 'u1' }, rs, null);
    expect(r.ok && r.value.kind === 'structure' && r.value.units[0].title).toBe('One');
    expect(r.ok && r.value.kind === 'structure' && r.value.units[0].sectionIds).toEqual(['s0', 's1']);
    const whole = recoverEvidence({ kind: 'structure-topology' }, rs, null);
    expect(whole.ok && whole.value.kind === 'structure' && whole.value.whole).toBe(true);
    expect(whole.ok && whole.value.kind === 'structure' && whole.value.units.length).toBe(2);
  });

  it('refuses structural recovery where no structure was frozen', () => {
    const none = evidenceAtRev1({ withStructure: false }).evidence.readState;
    const r = recoverEvidence({ kind: 'structure-unit', unitId: 'u1' }, none, null);
    expect(!r.ok && r.refusal).toBe('structure_not_frozen');
  });
});

describe('CURRENT LOCATION — three-state, never re-anchored, scoped to what moved', () => {
  const { evidence } = evidenceAtRev1();
  const rs = evidence.readState;
  const unchanged: LiveWork = { sections: liveDraft().sections, structure: STRUCTURE };
  const s1Edited: LiveWork = { sections: liveDraft({ s1: `${TEXTS.s1}More 🌒.\n\n` }).sections, structure: STRUCTURE };

  it('is current when nothing the ref depends on moved', () => {
    expect(locateCurrent({ kind: 'section', sectionId: 's1' }, rs, unchanged)).toEqual({ state: 'current' });
    expect(locateCurrent({ kind: 'structure-topology' }, rs, unchanged)).toEqual({ state: 'current' });
  });

  it('a changed section supersedes refs into it, and ONLY those (INV-21)', () => {
    expect(locateCurrent({ kind: 'section', sectionId: 's1' }, rs, s1Edited))
      .toEqual({ state: 'superseded', moved: [{ what: 'section-text', sectionId: 's1' }] });
    expect(locateCurrent({ kind: 'section', sectionId: 's0' }, rs, s1Edited)).toEqual({ state: 'current' });
    expect(locateCurrent({ kind: 'section-run', sectionIds: ['s0', 's1', 's2'] }, rs, s1Edited)).toEqual({ state: 'current' });
    expect(locateCurrent({ kind: 'structure-unit', unitId: 'u1' }, rs, s1Edited)).toEqual({ state: 'current' });
  });

  it('a passage in a changed section is superseded even if its words survive — no fuzzy re-find (INV-19)', () => {
    const appended: LiveWork = { sections: liveDraft({ s1: `${TEXTS.s1}Appended.\n` }).sections, structure: STRUCTURE };
    const r = locateCurrent({ kind: 'passage', sectionId: 's1', range: { start: 0, end: 5 } }, rs, appended);
    expect(r.state).toBe('superseded');
  });

  it('an absent section is superseded as absent', () => {
    const removed: LiveWork = { sections: liveDraft().sections.filter((s) => s.id !== 's2'), structure: STRUCTURE };
    expect(locateCurrent({ kind: 'section', sectionId: 's2' }, rs, removed))
      .toEqual({ state: 'superseded', moved: [{ what: 'section-absent', sectionId: 's2' }] });
  });

  it('a run is superseded by a reorder or an insertion inside it, not by text inside it', () => {
    const base = liveDraft().sections;
    const reordered: LiveWork = { sections: [base[0], base[2], base[1], base[3]], structure: STRUCTURE };
    expect(locateCurrent({ kind: 'section-run', sectionIds: ['s1', 's2'] }, rs, reordered).state).toBe('superseded');
    const inserted: LiveWork = { sections: [base[0], base[1], { id: 'sNew', text: 'x' }, base[2], base[3]], structure: STRUCTURE };
    expect(locateCurrent({ kind: 'section-run', sectionIds: ['s1', 's2'] }, rs, inserted).state).toBe('superseded');
    /* An insertion elsewhere leaves a local run current. */
    const elsewhere: LiveWork = { sections: [{ id: 'sNew', text: 'x' }, ...base], structure: STRUCTURE };
    expect(locateCurrent({ kind: 'section-run', sectionIds: ['s1', 's2'] }, rs, elsewhere)).toEqual({ state: 'current' });
  });

  it('a renamed unit supersedes refs to that unit; a sibling and the text stay current', () => {
    const renamed: LiveWork = {
      sections: liveDraft().sections,
      structure: {
        units: STRUCTURE.units.map((u) => (u.id === 'u1' ? { ...u, title: 'Renamed' } : u)),
        members: STRUCTURE.members,
      },
    };
    expect(locateCurrent({ kind: 'structure-unit', unitId: 'u1' }, rs, renamed))
      .toEqual({ state: 'superseded', moved: [{ what: 'structure-unit', unitId: 'u1' }] });
    expect(locateCurrent({ kind: 'structure-unit', unitId: 'u2' }, rs, renamed)).toEqual({ state: 'current' });
    expect(locateCurrent({ kind: 'structure-topology' }, rs, renamed).state).toBe('superseded');
    expect(locateCurrent({ kind: 'section', sectionId: 's0' }, rs, renamed)).toEqual({ state: 'current' });
  });

  it('a moved placement supersedes the unit it left and the unit it joined', () => {
    const moved: LiveWork = {
      sections: liveDraft().sections,
      structure: {
        units: STRUCTURE.units,
        members: STRUCTURE.members.map((m) => (m.draft_section_id === 's1' ? { ...m, unit_id: 'u2' } : m)),
      },
    };
    expect(locateCurrent({ kind: 'structure-units', unitIds: ['u1', 'u2'] }, rs, moved))
      .toEqual({ state: 'superseded', moved: [
        { what: 'structure-unit', unitId: 'u1' }, { what: 'structure-unit', unitId: 'u2' },
      ] });
  });

  it('is UNMEASURED, never current, when the live Work could not be loaded (INV-20)', () => {
    const blind: LiveWork = { sections: null, structure: null };
    expect(locateCurrent({ kind: 'section', sectionId: 's1' }, rs, blind)).toEqual({ state: 'unmeasured' });
    expect(locateCurrent({ kind: 'section-run', sectionIds: ['s0', 's1'] }, rs, blind)).toEqual({ state: 'unmeasured' });
    expect(locateCurrent({ kind: 'structure-unit', unitId: 'u1' }, rs, blind)).toEqual({ state: 'unmeasured' });
    expect(locateCurrent({ kind: 'structure-topology' }, rs, blind)).toEqual({ state: 'unmeasured' });
    /* Sections measured, structure not: a textual ref is current, a structural one is unmeasured. */
    const half: LiveWork = { sections: liveDraft().sections, structure: null };
    expect(locateCurrent({ kind: 'section', sectionId: 's1' }, rs, half)).toEqual({ state: 'current' });
    expect(locateCurrent({ kind: 'structure-unit', unitId: 'u1' }, rs, half)).toEqual({ state: 'unmeasured' });
  });

  it('an observation is the union of its refs, and unknown never rounds to current', () => {
    const refs = [{ kind: 'section', sectionId: 's0' }, { kind: 'structure-unit', unitId: 'u1' }] as const;
    expect(observationLocation(refs, rs, unchanged)).toEqual({ state: 'current' });
    expect(observationLocation(refs, rs, { sections: liveDraft().sections, structure: null })).toEqual({ state: 'unmeasured' });
    expect(observationLocation([{ kind: 'section', sectionId: 's1' }, ...refs], rs, s1Edited).state).toBe('superseded');
  });
});
