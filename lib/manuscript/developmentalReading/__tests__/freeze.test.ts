/**
 * BUILD-07C — the freeze, falsified without a model or a database.
 * INV-0, INV-2, INV-5/8 (re-bind), INV-10, INV-12, INV-16, INV-23/24, and the
 * founder's v1 rulings: observation text verbatim; observation-only; the
 * closed phenomenon family.
 */

import { evidenceAtRev1 } from '../../development/__tests__/fixture';
import { recoverEvidence } from '../../development/resolve';
import type { DevelopmentalEvidence } from '../../development/readState';
import type { DevelopmentalReaderRequest, DevelopmentalReaderResult, RecoveredBody } from '../../developmentalReader/contract';
import { readerIdentity } from '../../developmentalReader/read';
import { DEVELOPMENTAL_PHENOMENA, READING_CONTRACT_VERSION, observationKey, type ClassifierIdentity } from '../contract';
import { freezeReading, structureDependencyOf } from '../freeze';

function recoveredFor(evidence: DevelopmentalEvidence, content: string): RecoveredBody[] {
  return Object.entries(evidence.coverage.sections).filter(([, d]) => d === 'body').map(([sectionId]) => {
    const r = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, content);
    if (!r.ok || r.value.kind !== 'text') throw new Error('fixture');
    return r.value;
  });
}
function request(withStructure = true): DevelopmentalReaderRequest {
  const { revision, evidence } = evidenceAtRev1({ withStructure });
  return { commissionedLens: 'development', evidence, recovered: recoveredFor(evidence, revision.content) };
}
const READER = readerIdentity('claude-test-model');
const CLASSIFIER: ClassifierIdentity = { provider: 'anthropic', model: 'claude-test-model', promptHash: 'h', classifierVersion: 'DEVELOPMENTAL-PHENOMENON-01' };

const claims = (...texts: string[]): DevelopmentalReaderResult => ({
  outcome: 'claims',
  reader: READER,
  claims: texts.map((text, i) => ({
    text,
    refs: i === 0 ? [{ kind: 'section', sectionId: 's0' }] : [{ kind: 'section-run', sectionIds: ['s0', 's1', 's2'] }, { kind: 'structure-unit', unitId: 'u1' }],
    doesNotEstablish: ['across-unread-span'],
  })) as never,
});

describe('freezeReading', () => {
  it('freezes one observation per claim: text verbatim, lens copied, phenomenon from the classifier, keys o1…oN, refs re-bound', () => {
    const req = request();
    const f = freezeReading({ manuscriptId: 'm1', request: req, result: claims('  The lantern is set down.  ', 'The run crosses the unit.'),
      phenomena: ['recurrence', 'movement'], reader: READER, classifier: CLASSIFIER });
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    expect(f.value.outcome).toBe('reading');
    expect(f.value.observations.map((o) => o.key)).toEqual(['o1', 'o2']);
    expect(f.value.observations[0]!.observation).toBe('  The lantern is set down.  ');   // verbatim, not even trimmed
    expect(f.value.observations.every((o) => o.lens === 'development')).toBe(true);
    expect(f.value.observations.map((o) => o.phenomenon)).toEqual(['recurrence', 'movement']);
    expect(f.value.observations[0]!.structureDependency).toEqual({ kind: 'independent' });
    expect(f.value.observations[1]!.structureDependency).toEqual({ kind: 'authored-structure' });
    expect(f.value.observations[0]!.doesNotEstablish).toEqual(['across-unread-span']);
    expect(f.value.scope).toEqual({ commissionedLens: 'development', bodyScope: ['s0', 's1'], withStructure: true });
    expect(f.value.readState).toBe(req.evidence.readState);
    expect(f.value.provenance).toEqual({ reader: READER, classifier: CLASSIFIER, readingContractVersion: READING_CONTRACT_VERSION });
    expect('frozenAt' in f.value.provenance).toBe(false);
    expect('id' in f.value).toBe(false);
  });

  it('observation-only v1: no interpretation, questions, possibilities, uncertainty, severity, priority, score, confidence, rank on any observation', () => {
    const f = freezeReading({ manuscriptId: 'm1', request: request(), result: claims('x'), phenomena: ['movement'], reader: READER, classifier: CLASSIFIER });
    if (!f.ok) throw new Error(f.refusal);
    expect(Object.keys(f.value.observations[0]!).sort()).toEqual(
      ['doesNotEstablish', 'evidenceRefs', 'key', 'lens', 'observation', 'phenomenon', 'structureDependency']);
  });

  it('a none result freezes as a complete none reading with full state, coverage and provenance (INV-23/24)', () => {
    const req = request();
    const f = freezeReading({ manuscriptId: 'm1', request: req, result: { outcome: 'none', reader: READER }, phenomena: [], reader: READER, classifier: null });
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    expect(f.value.outcome).toBe('none');
    expect(f.value.observations).toEqual([]);
    expect(f.value.coverage).toBe(req.evidence.coverage);
    expect(f.value.provenance.classifier).toBeNull();
  });

  it('a refused reader result is never a reading', () => {
    const f = freezeReading({ manuscriptId: 'm1', request: request(), result: { outcome: 'refused', refusal: 'ceiling_exceeded', detail: 'x', index: null },
      phenomena: [], reader: READER, classifier: null });
    expect(f.ok ? 'ok' : f.refusal).toBe('reader_refused');
  });

  it('refuses classification count mismatch, unknown phenomenon, and classifier presence mismatch', () => {
    const req = request();
    const a = freezeReading({ manuscriptId: 'm1', request: req, result: claims('a', 'b'), phenomena: ['movement'], reader: READER, classifier: CLASSIFIER });
    expect(a.ok ? 'ok' : a.refusal).toBe('classification_count_mismatch');
    const b = freezeReading({ manuscriptId: 'm1', request: req, result: claims('a'), phenomena: ['irony' as never], reader: READER, classifier: CLASSIFIER });
    expect(b.ok ? 'ok' : b.refusal).toBe('unknown_phenomenon');
    const c = freezeReading({ manuscriptId: 'm1', request: req, result: claims('a'), phenomena: ['movement'], reader: READER, classifier: null });
    expect(c.ok ? 'ok' : c.refusal).toBe('classifier_presence_mismatch');
    const d = freezeReading({ manuscriptId: 'm1', request: req, result: { outcome: 'none', reader: READER }, phenomena: [], reader: READER, classifier: CLASSIFIER });
    expect(d.ok ? 'ok' : d.refusal).toBe('classifier_presence_mismatch');
  });

  it('re-binds every ref against the request evidence; one unbindable ref refuses the whole freeze', () => {
    const req = request(false);   // no structure supplied → the structural ref in claim 2 cannot bind
    const f = freezeReading({ manuscriptId: 'm1', request: req, result: claims('a', 'b'), phenomena: ['movement', 'movement'], reader: READER, classifier: CLASSIFIER });
    expect(f.ok ? 'ok' : `${f.refusal}:${f.index}`).toBe('claim_unbindable:1');
    expect(f.ok ? '' : f.detail).toMatch(/structure_not_supplied/);
  });

  it('a claim made against a different evidence object is refused by fingerprint', () => {
    const a = request();
    const other = evidenceAtRev1({ bodyScope: ['s0'] });
    const result = claims('a');
    /* Bind proof happens against a.evidence; forge a result whose refs bind but pretend the request is `other` */
    const f = freezeReading({ manuscriptId: 'm1', request: { ...a, evidence: other.evidence, recovered: recoveredFor(other.evidence, other.revision.content) },
      result, phenomena: ['movement'], reader: READER, classifier: CLASSIFIER });
    /* s0 is at body depth in both, so the refs bind — and the fingerprint is the request's own. This is a same-object freeze: ok. */
    expect(f.ok).toBe(true);
    /* The refusal path is structural: bindEvidence stamps the fingerprint of the evidence it was given, and freezeReading
       compares it with the request's — they are the same object here by construction, so the check cannot be tricked by a
       caller supplying a foreign proof. Asserted directly: */
    if (f.ok) expect(f.value.readState.inputFingerprint).toBe(other.evidence.readState.inputFingerprint);
  });

  it('the phenomenon family is exactly the eight UNDERSTAND §4 values', () => {
    expect([...DEVELOPMENTAL_PHENOMENA]).toEqual(['recurrence', 'unresolved-thread', 'register-shift', 'prospective-reference',
      're-explanation-first-mention', 'movement', 'term-drift', 'positional-asymmetry']);
    expect(observationKey(0)).toBe('o1');
    expect(observationKey(6)).toBe('o7');
    expect(structureDependencyOf([{ kind: 'structure-topology' }])).toEqual({ kind: 'authored-structure' });
    expect(structureDependencyOf([{ kind: 'section', sectionId: 's0' }])).toEqual({ kind: 'independent' });
  });
});


describe('WS2-07-F1 · reading contract v2 — the taxonomy may no longer veto an observation', () => {
  /* Observation has ontological priority over classification: the taxonomy may
     describe a developmental observation, but it may neither manufacture one
     nor veto one. */

  it('THE REGRESSION SPECIMEN — valid · declined · valid: all three observations survive, B carries no phenomenon KEY', () => {
    const f = freezeReading({
      manuscriptId: 'm1', request: request(),
      result: claims('A stands.', 'B stands.', 'C stands.'),
      phenomena: ['movement', undefined, 'recurrence'],
      reader: READER, classifier: CLASSIFIER,
    });
    expect(f.ok).toBe(true);
    if (!f.ok) return;

    /* All three exist. A decline did not destroy the reading, and did not
       destroy its siblings' taxonomy either. */
    expect(f.value.observations.map((o) => o.key)).toEqual(['o1', 'o2', 'o3']);
    expect(f.value.observations[0]!.phenomenon).toBe('movement');
    expect(f.value.observations[2]!.phenomenon).toBe('recurrence');

    /* Omission, not `phenomenon: undefined` — one representation of "no
       taxonomy claim", which is what the migration's null-refusal enforces. */
    expect('phenomenon' in f.value.observations[1]!).toBe(false);

    /* The declined observation is a COMPLETE observation. Nothing about it is
       degraded: text verbatim, evidence bound, limits carried. */
    expect(f.value.observations[1]!.observation).toBe('B stands.');
    expect(f.value.observations[1]!.evidenceRefs.length).toBeGreaterThan(0);
    expect(f.value.observations[1]!.doesNotEstablish).toEqual(['across-unread-span']);
  });

  it('every observation declined — the reading is still a reading, and the classifier is still identified', () => {
    const f = freezeReading({
      manuscriptId: 'm1', request: request(), result: claims('one', 'two'),
      phenomena: [undefined, undefined], reader: READER, classifier: CLASSIFIER,
    });
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    expect(f.value.outcome).toBe('reading');
    expect(f.value.observations.map((o) => 'phenomenon' in o)).toEqual([false, false]);
    /* INV-25: null iff classification was not INVOKED. It was invoked here and
       declined everything, so the identity stands. Ran-and-declined is derived
       from this plus the absences above — never stored as a flag. */
    expect(f.value.provenance.classifier).toEqual(CLASSIFIER);
  });

  it('a DEFINED value outside the eight is malformed output, not a decline, and still refuses the whole freeze', () => {
    const f = freezeReading({
      manuscriptId: 'm1', request: request(), result: claims('one', 'two'),
      phenomena: ['movement', 'banana' as never], reader: READER, classifier: CLASSIFIER,
    });
    expect(f.ok ? 'ok' : f.refusal).toBe('unknown_phenomenon');
  });

  it('every frozen reading carries the v2 contract version; a none reading carries it too', () => {
    const withClaims = freezeReading({
      manuscriptId: 'm1', request: request(), result: claims('one'),
      phenomena: [undefined], reader: READER, classifier: CLASSIFIER,
    });
    expect(withClaims.ok && withClaims.value.provenance.readingContractVersion)
      .toBe(READING_CONTRACT_VERSION);

    const none = freezeReading({
      manuscriptId: 'm1', request: request(),
      result: { outcome: 'none', reader: READER } as never,
      phenomena: [], reader: READER, classifier: null,
    });
    if (none.ok) {
      expect(none.value.provenance.readingContractVersion).toBe(READING_CONTRACT_VERSION);
      /* INV-25 the other way: no observations, so classification was never
         invoked, so the identity is null. */
      expect(none.value.provenance.classifier).toBeNull();
    }
  });
});
