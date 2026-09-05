/**
 * BUILD-07E — the falsifiers, E1–E9, stated in the census before the build.
 *
 * E10 (the no-migration expectation) is discharged by the absence of a
 * migration in this unit, and by `ask_threads.reading_identity` already being
 * `jsonb`: a shape assertion in a test would not add evidence to that.
 *
 * WHAT THESE MUST NOT BECOME. A test that only exercises the happy path proves
 * the code runs, not that the boundary holds. Every refusal below is asserted
 * against an input that a careless implementation would have accepted.
 */

import { checkObservationAnchor, selectObservation } from '../developmentalAnchor';
import { checkAnchor } from '../anchor';
import { readIdentity, isDevelopmentalIdentity } from '../threadStore';
import {
  assembleDevelopmentalContext, developmentalStaleness, hasUnverifiableEvidence,
} from '../developmentalContext';
import { __systemForTest } from '../developmentalAskReader';
import { evidenceAtRev1, liveDraft, S, TEXTS } from '../../development/__tests__/fixture';
import { freezeReadState } from '../../development/readState';
import { partitionFromSections } from '@/lib/manuscript/draftSections';
import type { DevelopmentalReading } from '../../developmentalReading/contract';
import type { LiveWork } from '../../development/resolve';

const { draft, revision, evidence } = evidenceAtRev1();

function readingOf(overrides: Partial<DevelopmentalReading> = {}): DevelopmentalReading {
  return {
    id: 'reading-1',
    manuscriptId: 'work-1',
    scope: { commissionedLens: 'structure', bodyScope: ['s0', 's1'], withStructure: true },
    readState: evidence.readState,
    coverage: evidence.coverage,
    provenance: {
      reader: { provider: 'anthropic', model: 'claude-opus-5' } as never,
      classifier: { provider: 'anthropic', model: 'claude-opus-5', promptHash: 'h', classifierVersion: 'v' },
      frozenAt: '2026-09-05T00:00:00.000Z',
    },
    outcome: 'reading',
    observations: [{
      key: 'o1',
      lens: 'structure' as never,
      phenomenon: 'recurrence',
      evidenceRefs: [{ kind: 'passage', sectionId: 's0', range: { start: 0, end: 20 } }] as never,
      observation: 'A lantern is introduced in the first movement and returns in the fourth.',
      doesNotEstablish: ['that the return was deliberate'] as never,
      structureDependency: { kind: 'independent' },
    }],
    ...overrides,
  } as DevelopmentalReading;
}

const liveNow: LiveWork = {
  sections: draft.sections.map((s) => ({ id: s.id, text: s.text })),
  structure: null,
};

const observationAnchor = { on: 'observation' as const, readingId: 'reading-1', observationKey: 'o1' };

describe('E1 · a readingId that disagrees with the reading is refused, not repaired', () => {
  it('refuses a mismatch and names it', () => {
    const r = checkObservationAnchor(
      { ...observationAnchor, readingId: 'a-different-reading' }, readingOf());
    expect(r).toEqual({ ok: false, refusal: 'anchor_reading_mismatch' });
  });

  it('refuses when there is no reading at all', () => {
    expect(checkObservationAnchor(observationAnchor, null))
      .toEqual({ ok: false, refusal: 'anchor_requires_reading' });
  });

  it('accepts only the exact reading', () => {
    expect(checkObservationAnchor(observationAnchor, readingOf()).ok).toBe(true);
  });
});

describe('E2 · an unresolvable observationKey refuses and does not degrade', () => {
  it('refuses an unknown key', () => {
    const r = checkObservationAnchor({ ...observationAnchor, observationKey: 'o99' }, readingOf());
    expect(r).toEqual({ ok: false, refusal: 'anchor_unresolved', detail: 'observation' });
  });

  it('does NOT fall back to a reading-level conversation', () => {
    const r = checkObservationAnchor({ ...observationAnchor, observationKey: 'o99' }, readingOf());
    expect(r.ok).toBe(false);
  });

  it('an outcome-none reading resolves no key, and says the reading exists', () => {
    const none = readingOf({ outcome: 'none', observations: [] } as never);
    expect(checkObservationAnchor(observationAnchor, none))
      .toEqual({ ok: false, refusal: 'anchor_unresolved', detail: 'observation' });
  });

  it('selectObservation never returns a nearest match', () => {
    expect(selectObservation(readingOf(), 'o99')).toBeNull();
  });
});

describe('E1b · the structure checker refuses a developmental anchor rather than passing it', () => {
  it('returns anchor_unknown, never ok', () => {
    expect(checkAnchor(observationAnchor, null))
      .toEqual({ ok: false, refusal: 'anchor_unknown' });
  });
});

describe('E3 · a thread identity cannot hold both references', () => {
  it('normalises a pre-07E row (no kind) as a structure reading', () => {
    const id = readIdentity({
      proposalId: 'p1', interpretationInputHash: 'a', sectionTopologyHash: 'b',
      reviewRevision: 2, readerProvenance: null,
    });
    expect(id?.kind).toBe('structure');
    expect(isDevelopmentalIdentity(id)).toBe(false);
  });

  it('reads a developmental row as developmental', () => {
    const id = readIdentity({
      kind: 'developmental', readingId: 'reading-1', draftId: 'draft-1',
      revisionNumber: 1, inputFingerprint: 'f', commissionedLens: 'structure',
      readerProvenance: null,
    });
    expect(isDevelopmentalIdentity(id)).toBe(true);
    if (isDevelopmentalIdentity(id)) expect(id.readingId).toBe('reading-1');
  });

  it('a developmental identity carries no proposalId to be wrong about', () => {
    const id = readIdentity({
      kind: 'developmental', readingId: 'reading-1', draftId: 'draft-1',
      revisionNumber: 1, inputFingerprint: 'f', commissionedLens: 'structure',
      readerProvenance: null,
    });
    expect(id && 'proposalId' in id).toBe(false);
  });

  it('null stays null', () => {
    expect(readIdentity(null)).toBeNull();
  });
});

describe('E6 · location is three-state and unknown never rounds to current', () => {
  it('current where nothing moved', () => {
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: revision.content, now: liveNow,
    });
    expect(ctx.location.state).toBe('current');
  });

  it('superseded where the evidenced section changed, naming what moved', () => {
    const moved: LiveWork = {
      sections: draft.sections.map((s) => ({
        id: s.id, text: s.id === 's0' ? 'Something else entirely 😀' : s.text,
      })),
      structure: null,
    };
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: revision.content, now: moved,
    });
    expect(ctx.location.state).toBe('superseded');
    if (ctx.location.state === 'superseded') {
      expect(ctx.location.moved).toContainEqual({ what: 'section-text', sectionId: 's0' });
    }
  });

  it('unmeasured where the Work could not be read — NOT current', () => {
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: revision.content, now: { sections: null, structure: null },
    });
    expect(ctx.location.state).toBe('unmeasured');
    expect(ctx.location.state).not.toBe('current');
  });

  it('a dimension with nothing to measure is unmeasured, never unchanged', () => {
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: revision.content, now: liveNow,
    });
    const s = developmentalStaleness(ctx, { state: 'unchanged' });
    /* The observation rests on a passage only: input was measured, topology was not. */
    expect(s.inputMoved).toEqual({ state: 'unchanged' });
    expect(s.topologyMoved).toEqual({ state: 'unmeasured' });
    /* Structure-lane notions with no developmental analogue are never claimed. */
    expect(s.reviewMoved).toEqual({ state: 'unmeasured' });
    expect(s.readingSuperseded).toEqual({ state: 'unmeasured' });
  });
});

describe('Q2 · evidence reaches MAIA only through digest verification', () => {
  it('verified evidence carries the exact words read', () => {
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: revision.content, now: liveNow,
    });
    expect(hasUnverifiableEvidence(ctx)).toBe(false);
    const e = ctx.evidence[0];
    expect(e.kind).toBe('verified');
    if (e.kind === 'verified' && e.recovered.kind === 'text') {
      expect(TEXTS[S[0]].startsWith(e.recovered.text)).toBe(true);
    }
  });

  it('WITHOUT the revision, evidence is unverifiable and carries NO text', () => {
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: null, now: liveNow,
    });
    expect(hasUnverifiableEvidence(ctx)).toBe(true);
    const e = ctx.evidence[0];
    expect(e.kind).toBe('unverifiable');
    if (e.kind === 'unverifiable') expect(e.refusal).toBe('revision_content_required');
    expect(JSON.stringify(e)).not.toContain('lantern');
  });

  it('CURRENT TEXT IS NEVER SUBSTITUTED for a revision that does not verify', () => {
    /* The laundering case, stated as an attack: hand the assembly the CURRENT
       draft content in place of the frozen revision. A careless implementation
       slices it and MAIA reasons about words she never read. */
    const currentContent = liveDraft({ s0: 'A completely rewritten opening 😀\n\n' })
      .sections.map((s) => s.text).join('');
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: currentContent, now: liveNow,
    });
    const e = ctx.evidence[0];
    expect(e.kind).toBe('unverifiable');
    if (e.kind === 'unverifiable') expect(e.refusal).toBe('revision_integrity_failure');
    expect(JSON.stringify(e)).not.toContain('rewritten');
  });
});

describe('E8/E9 · what the reader is told, and what it is never told', () => {
  const ctxCurrent = assembleDevelopmentalContext({
    reading: readingOf(), observation: readingOf().observations[0],
    revisionContent: revision.content, now: liveNow,
  });

  it('carries the observation verbatim', () => {
    expect(__systemForTest(ctxCurrent))
      .toContain('A lantern is introduced in the first movement and returns in the fourth.');
  });

  it('carries the limits the observation set on itself', () => {
    expect(__systemForTest(ctxCurrent)).toContain('that the return was deliberate');
  });

  it('names a new reading as the act that answers "what about now"', () => {
    expect(__systemForTest(ctxCurrent)).toContain('A new developmental reading is the act');
  });

  it('says a superseded observation is historical, and what moved', () => {
    const moved: LiveWork = {
      sections: draft.sections.map((s) => ({
        id: s.id, text: s.id === 's0' ? 'Something else entirely 😀' : s.text,
      })),
      structure: null,
    };
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: revision.content, now: moved,
    });
    const sys = __systemForTest(ctx);
    expect(sys).toContain('EARLIER STATE OF THE WORK');
    expect(sys).toContain('the text of Section 1 has changed');
    expect(sys).toContain('You have not seen the current text.');
  });

  it('says unknown as unknown when the Work could not be measured', () => {
    const ctx = assembleDevelopmentalContext({
      reading: readingOf(), observation: readingOf().observations[0],
      revisionContent: revision.content, now: { sections: null, structure: null },
    });
    const sys = __systemForTest(ctx);
    expect(sys).toContain('COULD NOT BE MEASURED');
    expect(sys).not.toContain('is unchanged since you read it');
  });

  it('treats an unlabelled observation as whole, not as a defect', () => {
    const r = readingOf();
    const unlabelled = { ...r.observations[0] };
    delete (unlabelled as { phenomenon?: string }).phenomenon;
    const ctx = assembleDevelopmentalContext({
      reading: r, observation: unlabelled as never,
      revisionContent: revision.content, now: liveNow,
    });
    expect(__systemForTest(ctx)).toContain('That is not a defect');
  });
});

/* ── BLOCKER B · no internal identifier reaches the model ─────────────────── */

/**
 * A Work whose section and unit ids are UUID-SHAPED, as production's are.
 *
 * The shared 07A fixture uses `s0`…`s3`, which are readable and therefore prove
 * nothing about leakage: a reader that emitted them raw would still pass a shape
 * test. This fixture exists so the capability is tested, not the wording.
 */
const UUIDS = [
  '5bfdd360-4124-44ce-a6d3-37286bbe816b',
  'dca75052-1f44-46d8-92e5-f1ab5fb68c05',
  '0186cd37-2cd7-4b35-882d-acda940f0be1',
] as const;
const UNIT_UUID = 'acda940f-bee8-411c-acfe-88bb4abb96e2';
const UNTITLED_UNIT_UUID = '9ba2d93c-1211-4ec9-9c27-572ce76f7225';

const UUID_SHAPED = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function uuidReading(): DevelopmentalReading {
  const sections = UUIDS.map((id, i) => ({ id, text: `Movement ${i + 1} 😀\n\n` }));
  const content = sections.map((x) => x.text).join('');
  const frozen = freezeReadState({
    draft: { draftId: 'draft-uuid', content, sections },
    revision: { revisionNumber: 1, content, sectionPartition: partitionFromSections(sections) },
    bodyScope: [UUIDS[0]],
    structure: {
      units: [
        { id: UNIT_UUID, parent_id: null, position: 0, kind: 'chapter', title: 'The Lantern Road', origin: 'member', adopted_from_id: null },
        { id: UNTITLED_UNIT_UUID, parent_id: null, position: 1, kind: 'chapter', title: null, origin: 'member', adopted_from_id: null },
      ],
      members: [
        { unit_id: UNIT_UUID, draft_section_id: UUIDS[0] },
        { unit_id: UNTITLED_UNIT_UUID, draft_section_id: UUIDS[1] },
      ],
    },
  });
  if (!frozen.ok) throw new Error(`uuid fixture failed: ${frozen.refusal} ${frozen.detail}`);
  return {
    ...readingOf(),
    readState: frozen.value.readState,
    coverage: frozen.value.coverage,
    observations: [{
      ...readingOf().observations[0],
      evidenceRefs: [
        { kind: 'passage', sectionId: UUIDS[0], range: { start: 0, end: 12 } },
        { kind: 'section-run', sectionIds: [UUIDS[0], UUIDS[1]] },
        { kind: 'structure-units', unitIds: [UNIT_UUID, UNTITLED_UNIT_UUID] },
      ] as never,
    }],
  } as DevelopmentalReading;
}

describe('Blocker B · the model receives author-facing names, never internal identifiers', () => {
  const r = uuidReading();
  const revisionContent = UUIDS.map((_, i) => `Movement ${i + 1} 😀\n\n`).join('');

  const ctxFor = (now: LiveWork) => assembleDevelopmentalContext({
    reading: r, observation: r.observations[0], revisionContent, now,
  });

  const liveUuid: LiveWork = {
    sections: UUIDS.map((id, i) => ({ id, text: `Movement ${i + 1} 😀\n\n` })),
    structure: null,
  };

  it('names sections by their place in what she read', () => {
    const sys = __systemForTest(ctxFor(liveUuid));
    expect(sys).toContain('Section 1');
    expect(sys).toContain('Section 1 → Section 2');
  });

  it('names an authored part by the title the author gave it', () => {
    expect(__systemForTest(ctxFor(liveUuid))).toContain('"The Lantern Road"');
  });

  it('names an UNTITLED authored part positionally, never by its id', () => {
    const sys = __systemForTest(ctxFor(liveUuid));
    expect(sys).toContain('an untitled chapter (number 2 at its level)');
    expect(sys).not.toContain(UNTITLED_UNIT_UUID);
  });

  it('the whole system prompt contains ZERO uuid-shaped strings', () => {
    const sys = __systemForTest(ctxFor(liveUuid));
    expect(sys.match(UUID_SHAPED) ?? []).toEqual([]);
  });

  it('and zero when the observation is SUPERSEDED — the moved list is the other leak path', () => {
    const moved: LiveWork = {
      sections: UUIDS.map((id, i) => ({
        id, text: id === UUIDS[0] ? 'Rewritten 😀\n\n' : `Movement ${i + 1} 😀\n\n`,
      })),
      structure: null,
    };
    const sys = __systemForTest(ctxFor(moved));
    expect(sys).toContain('WHAT MOVED SINCE YOU READ');
    expect(sys).toContain('the text of Section 1 has changed');
    expect(sys.match(UUID_SHAPED) ?? []).toEqual([]);
  });

  it('and zero when evidence could NOT be verified', () => {
    const ctx = assembleDevelopmentalContext({
      reading: r, observation: r.observations[0], revisionContent: null, now: liveUuid,
    });
    const sys = __systemForTest(ctx);
    expect(sys).toContain('COULD NOT BE VERIFIED');
    expect(sys.match(UUID_SHAPED) ?? []).toEqual([]);
  });

  it('a reference outside the frozen topology is said honestly, never as an id', () => {
    const stray = { ...r.observations[0], evidenceRefs: [
      { kind: 'section', sectionId: '11111111-2222-3333-4444-555555555555' },
    ] as never };
    const ctx = assembleDevelopmentalContext({
      reading: r, observation: stray as never, revisionContent, now: liveUuid,
    });
    const sys = __systemForTest(ctx);
    expect(sys.match(UUID_SHAPED) ?? []).toEqual([]);
  });
});
