/**
 * JARVIS-KP-01 · I2 — regression witnesses for the canonical invariants.
 *
 * Each test names the invariant it holds under pressure, so a later change that
 * weakens one of them fails against the invariant's own identity rather than
 * against an incidental assertion:
 *
 *   ACT 11    INV-01 .. INV-14
 *   ACT 11A   A11A-INV-01 .. A11A-INV-10
 *   ACT 12A   §6 human-authority non-regression · §7 composite double constraint
 *   I1        §14 disposition criteria 4, 5, 6, 7, 8, 9, 10
 *
 * Synthetic data only.
 */

import { assessComposite } from '../composite';
import { authorityReaches, resolveAdoption } from '../adoption';
import { evaluateJoin } from '../evaluate';
import { resolveStanding, subjectKey } from '../standing';
import {
  adoptionAct,
  author,
  boundary,
  codesOf,
  component,
  endpoint,
  envelope,
  lawfulRequest,
  standingAct,
  SYNTHETIC_MEMBER,
  warrant,
} from './fixtures';
import type { SupportEntry, Warrant } from '../types';

const support = (id: string, partial: Partial<SupportEntry> = {}): SupportEntry => ({
  supportId: id,
  proposition: `synthetic support ${id}`,
  provenanceRef: `prov:${id}`,
  mode: 'reliance',
  authorship: author(),
  jurisdiction: 'scientific_evidence',
  boundaries: [],
  sharedOriginRef: null,
  nestedWarrantRef: null,
  ...partial,
});

describe('INV-01 · endpoint independence', () => {
  it('does not alter an endpoint merely because a relation was proposed', () => {
    const e1 = endpoint('e1', { standing: 'WARRANTED', jurisdiction: 'scientific_evidence' });
    const request = lawfulRequest({ envelope: envelope({ endpoints: [e1, endpoint('e2')], offeredWarrantRefs: [] }), warrants: [] });
    const before = JSON.stringify(request.envelope.endpoints);
    const result = evaluateJoin(request);
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
    // The refused relation left both endpoints exactly as they were.
    expect(JSON.stringify(request.envelope.endpoints)).toBe(before);
    expect(e1.standing).toBe('WARRANTED');
  });
});

describe('INV-02 · join separability', () => {
  it('reports the relation proposition separately from its endpoints', () => {
    const result = evaluateJoin(lawfulRequest());
    expect(result.relationProposition).toBe('synthetic relation: e1 is associated with e2');
    expect(result.warrantIdsReliedUpon).toEqual(['w1']);
  });
});

describe('INV-03 / INV-11 · join authorship integrity and human authority', () => {
  it('refuses a JARVIS-introduced relation presented as member-authored', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          authorship: author({ authorClass: 'MEMBER_AUTHORED', roleExercised: 'member', authorRef: SYNTHETIC_MEMBER }),
          provenance: {
            introducedBy: author({ authorClass: 'JARVIS_AUTHORED', roleExercised: 'jarvis', authorRef: 'jarvis' }),
            inquiryContext: 'synthetic inquiry context',
            reliedUponRefs: ['e1', 'e2'],
            referenceOnlyRefs: [],
            transformationStep: 'synthetic: jarvis synthesised the relation',
          },
        }),
      }),
    );
    const found = result.refusals.find((r) => r.code === 'authorship_composition_attempted');
    expect(found).toBeDefined();
    expect(found?.invariant).toBe('INV-03');
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });

  it('refuses a practitioner-authored relation that MAIA actually introduced', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          authorship: author({ authorClass: 'PRACTITIONER_AUTHORED', roleExercised: 'practitioner', authorRef: 'prac-1' }),
          provenance: {
            introducedBy: author({ authorClass: 'MAIA_PROPOSED', roleExercised: 'maia', authorRef: 'maia' }),
            inquiryContext: 'synthetic inquiry context',
            reliedUponRefs: ['e1', 'e2'],
            referenceOnlyRefs: [],
            transformationStep: 'synthetic: maia proposed the relation',
          },
        }),
      }),
    );
    expect(codesOf(result.refusals)).toContain('authorship_composition_attempted');
  });

  it('refuses MEMBER_CONFIRMED authorship with no adoption act behind it', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          authorship: author({ authorClass: 'MEMBER_CONFIRMED', roleExercised: 'member', authorRef: SYNTHETIC_MEMBER }),
          provenance: {
            introducedBy: author({ authorClass: 'MAIA_PROPOSED', roleExercised: 'maia', authorRef: 'maia' }),
            inquiryContext: 'synthetic inquiry context',
            reliedUponRefs: ['e1', 'e2'],
            referenceOnlyRefs: [],
            transformationStep: 'synthetic: maia proposed the relation',
          },
        }),
        adoptionActs: [],
      }),
    );
    const found = result.refusals.find((r) => r.invariant === 'INV-11');
    expect(found?.code).toBe('authorship_composition_attempted');
  });

  it('admits MEMBER_CONFIRMED authorship once a real adoption act exists', () => {
    const lived = component('c-meaning');
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          components: [lived],
          authorship: author({ authorClass: 'MEMBER_CONFIRMED', roleExercised: 'member', authorRef: SYNTHETIC_MEMBER }),
          provenance: {
            introducedBy: author({ authorClass: 'MAIA_PROPOSED', roleExercised: 'maia', authorRef: 'maia' }),
            inquiryContext: 'synthetic inquiry context',
            reliedUponRefs: ['e1', 'e2'],
            referenceOnlyRefs: [],
            transformationStep: 'synthetic: maia proposed, member adopted',
          },
        }),
        adoptionActs: [adoptionAct({ adoptedComponentIds: ['c-meaning'] })],
      }),
    );
    expect(result.refusals).toEqual([]);
    // The history still shows that MAIA proposed and the member adopted.
    expect(result.components[0]?.adoptedBy).toEqual(['member']);
  });

  it('gives no agent role the power to adopt', () => {
    expect(authorityReaches('maia', 'member_meaning')).toBe(false);
    expect(authorityReaches('jarvis', 'member_meaning')).toBe(false);
    expect(authorityReaches('member', 'member_meaning')).toBe(true);
    expect(authorityReaches('practitioner', 'practitioner_interpretation')).toBe(true);
    expect(authorityReaches('practitioner', 'member_meaning')).toBe(false);
  });
});

describe('INV-04 · join provenance integrity', () => {
  it('refuses a join whose own origin is not recorded', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          provenance: {
            introducedBy: author(),
            inquiryContext: '',
            reliedUponRefs: ['e1', 'e2'],
            referenceOnlyRefs: [],
            transformationStep: '',
          },
        }),
      }),
    );
    expect(codesOf(result.refusals)).toContain('join_provenance_incomplete');
  });

  it('refuses an offered warrant that is not present to be inspected', () => {
    const result = evaluateJoin(lawfulRequest({ warrants: [] }));
    expect(codesOf(result.refusals)).toContain('warrant_unknown');
  });
});

describe('INV-06 · stage integrity', () => {
  it('refuses comparison asked to carry warranted standing', () => {
    const result = evaluateJoin(
      lawfulRequest({ envelope: envelope({ operation: 'COMPARE_JUXTAPOSE' }) }),
    );
    expect(codesOf(result.refusals)).toContain('operation_stage_below_requested_standing');
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });

  it('asserts nothing from a bare reference', () => {
    const result = evaluateJoin(
      lawfulRequest({
        requestedStanding: 'CANDIDATE_UNESTABLISHED',
        envelope: envelope({ operation: 'REFERENCE' }),
      }),
    );
    expect(result.admittedStanding).toBe('NONE_UNASSERTED');
  });
});

describe('INV-14 · no hidden promotion', () => {
  it('does not raise standing through repetition of the same adoption', () => {
    const lived = component('c-meaning');
    const once = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ components: [lived] }),
        adoptionActs: [adoptionAct({ actId: 'adopt-1', adoptedComponentIds: ['c-meaning'] })],
      }),
    );
    const many = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ components: [lived] }),
        adoptionActs: [
          adoptionAct({ actId: 'adopt-1', adoptedComponentIds: ['c-meaning'] }),
          adoptionAct({ actId: 'adopt-2', adoptedComponentIds: ['c-meaning'] }),
          adoptionAct({ actId: 'adopt-3', adoptedComponentIds: ['c-meaning'] }),
        ],
      }),
    );
    expect(many.components[0]?.admittedStanding).toBe(once.components[0]?.admittedStanding);
    expect(many.components[0]?.adoptedBy).toEqual(['member']);
  });

  it('does not raise standing by restating the same warrant many times', () => {
    const result = evaluateJoin(
      lawfulRequest({
        requestedStanding: 'PROMOTED',
        envelope: envelope({ operation: 'PROMOTE', offeredWarrantRefs: ['w1', 'w2', 'w3'] }),
        warrants: [
          warrant('w1', { standingCeiling: 'PROVISIONAL' }),
          warrant('w2', { standingCeiling: 'PROVISIONAL' }),
          warrant('w3', { standingCeiling: 'PROVISIONAL' }),
        ],
      }),
    );
    expect(result.admittedStanding).not.toBe('PROMOTED');
  });
});

describe('INV-12 · corrigibility — history is preserved, never pruned', () => {
  it('keeps the full standing chain recoverable after supersession', () => {
    const acts = [
      standingAct({ actId: 'a1', claimedStanding: 'CANDIDATE_UNESTABLISHED', basis: 'initial_proposal', warrantRef: null }),
      standingAct({ actId: 'a2', claimedStanding: 'WARRANTED', supersedesActId: 'a1' }),
      standingAct({ actId: 'a3', claimedStanding: 'SUPERSEDED', basis: 'superseded_by_later_proposition', supersedesActId: 'a2' }),
    ];
    const resolved = resolveStanding(acts);
    const subject = resolved.bySubject.get(subjectKey('join-1', null));
    expect(subject?.claimedStanding).toBe('SUPERSEDED');
    expect(subject?.history.map((a) => a.actId)).toEqual(['a1', 'a2', 'a3']);
    // Discharge is not deletion: what was once warranted, and by whom, remains readable.
    expect(subject?.history[1]?.claimedStanding).toBe('WARRANTED');
  });
});

describe('A11A-INV-01 / A11A-INV-02 / A11A-INV-03 · composite separability, authorship, provenance', () => {
  const warrantsById = (list: readonly Warrant[]) => new Map(list.map((w) => [w.warrantId, w] as const));

  it('refuses a non-composite warrant offered as a composite', () => {
    const w = warrant('w1');
    const assessment = assessComposite(w, warrantsById([w]));
    expect(codesOf(assessment.refusals)).toContain('support_set_offered_as_composite_warrant');
    expect(assessment.satisfied).toBe(false);
  });

  it('refuses a composite inference with no declared author', () => {
    const w = warrant('w1', {
      authorship: author({ authorRef: '' }),
      composite: {
        supportSet: [support('s1'), support('s2')],
        compositionMethod: 'declared_formal_entailment',
        dependenceAssumptions: { claimedIndependent: false, resolved: true, statement: 'synthetic' },
      },
    });
    const assessment = assessComposite(w, warrantsById([w]));
    expect(assessment.refusals.some((r) => r.invariant === 'A11A-INV-02')).toBe(true);
  });

  it('refuses a relied-upon support entry whose provenance is not recoverable', () => {
    const w = warrant('w1', {
      composite: {
        supportSet: [support('s1', { provenanceRef: '' })],
        compositionMethod: 'declared_formal_entailment',
        dependenceAssumptions: { claimedIndependent: false, resolved: true, statement: 'synthetic' },
      },
    });
    const assessment = assessComposite(w, warrantsById([w]));
    expect(assessment.refusals.some((r) => r.invariant === 'A11A-INV-03')).toBe(true);
  });

  it('refuses a composite whose support set contains only references', () => {
    const w = warrant('w1', {
      composite: {
        supportSet: [support('s1', { mode: 'reference' })],
        compositionMethod: 'declared_formal_entailment',
        dependenceAssumptions: { claimedIndependent: false, resolved: true, statement: 'synthetic' },
      },
    });
    const assessment = assessComposite(w, warrantsById([w]));
    expect(codesOf(assessment.refusals)).toContain('reliance_not_declared');
  });
});

describe('A11A-INV-05 / A11A-INV-06 · the composite double constraint (ACT 12A §7)', () => {
  it('refuses prestige and count as composition methods', () => {
    for (const method of ['source_prestige', 'source_count', 'restatement', 'mere_agreement'] as const) {
      const w = warrant('w1', {
        licensedRelationSemantics: ['association'],
        composite: {
          supportSet: [support('s1'), support('s2')],
          compositionMethod: method,
          dependenceAssumptions: { claimedIndependent: false, resolved: true, statement: 'synthetic' },
        },
      });
      const assessment = assessComposite(w, new Map([[w.warrantId, w]]));
      expect(codesOf(assessment.refusals)).toContain('composite_method_is_mere_accumulation');
    }
  });

  it('does not forbid governed triangulation merely because each source is partial', () => {
    const w = warrant('w1', {
      warrantClass: 'EMPIRICAL_RELATION_EVIDENCE',
      standingCeiling: 'PROVISIONAL',
      licensedRelationSemantics: ['correlation'],
      composite: {
        supportSet: [support('s1'), support('s2'), support('s3')],
        compositionMethod: 'convergent_independent_measurement',
        dependenceAssumptions: {
          claimedIndependent: true,
          resolved: true,
          statement: 'synthetic: independent instruments, resolved',
        },
      },
    });
    const assessment = assessComposite(w, new Map([[w.warrantId, w]]));
    expect(assessment.refusals).toEqual([]);
    expect(assessment.satisfied).toBe(true);
    expect(assessment.standingCeiling).toBe('PROVISIONAL');
  });

  it('keeps explanatory coherence from becoming empirical truth', () => {
    const w = warrant('w1', {
      warrantClass: 'THEORETICAL_ARGUMENT',
      licensedRelationSemantics: ['explanatory_fit', 'causation'],
      composite: {
        supportSet: [support('s1'), support('s2')],
        compositionMethod: 'explanatory_coherence',
        dependenceAssumptions: { claimedIndependent: false, resolved: true, statement: 'synthetic' },
      },
    });
    const assessment = assessComposite(w, new Map([[w.warrantId, w]]));
    expect(codesOf(assessment.refusals)).toContain('composite_method_does_not_license_semantics');
  });
});

describe('A11A-INV-07 / A11A-INV-08 / A11A-INV-09 · adoption scope and mixed standing', () => {
  it('carries different standing across components of one proposition', () => {
    // The ACT 11A §2.4 shape: lived-meaning components the member may adopt,
    // beside an external-motive component the member cannot.
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          components: [
            component('c-experience', { kind: 'member_experience', claimedSemantics: ['co_presence'] }),
            component('c-meaning', { kind: 'member_meaning', claimedSemantics: ['psychological_meaning'] }),
            component('c-motive', {
              kind: 'external_motive',
              jurisdiction: 'scientific_evidence',
              claimedSemantics: ['causation'],
            }),
            component('c-control', {
              kind: 'external_causal_mechanism',
              jurisdiction: 'scientific_evidence',
              claimedSemantics: ['causation'],
            }),
          ],
        }),
        adoptionActs: [
          adoptionAct({ adoptedComponentIds: ['c-experience', 'c-meaning', 'c-motive', 'c-control'] }),
        ],
      }),
    );
    const byId = new Map(result.components.map((c) => [c.componentId, c] as const));
    expect(byId.get('c-experience')?.admittedStanding).toBe('WARRANTED');
    expect(byId.get('c-meaning')?.admittedStanding).toBe('WARRANTED');
    expect(byId.get('c-motive')?.admittedStanding).toBe('NONE_UNASSERTED');
    expect(byId.get('c-control')?.admittedStanding).toBe('NONE_UNASSERTED');
    // Whole-sentence confirmation did not promote the components it contained.
    expect(byId.get('c-motive')?.adoptedBy).toEqual([]);
  });

  it('lets an external component reach standing on its own independent warrant', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          components: [
            component('c-external', {
              kind: 'scientific',
              jurisdiction: 'scientific_evidence',
              claimedSemantics: ['correlation'],
              warrantRef: 'w-sci',
            }),
          ],
        }),
        warrants: [
          warrant('w1'),
          warrant('w-sci', {
            warrantClass: 'EMPIRICAL_RELATION_EVIDENCE',
            licensedRelationSemantics: ['correlation'],
          }),
        ],
      }),
    );
    expect(result.components[0]?.admittedStanding).toBe('WARRANTED');
    expect(result.components[0]?.warrantIdsReliedUpon).toEqual(['w-sci']);
    // Independent warrant, not adoption.
    expect(result.components[0]?.adoptedBy).toEqual([]);
  });

  it('records an unknown adopted component rather than inventing it', () => {
    const resolution = resolveAdoption([component('c-1')], [adoptionAct({ adoptedComponentIds: ['c-ghost'] })]);
    expect(codesOf(resolution.actRefusals)).toContain('adoption_component_unknown');
  });
});

describe('ACT 12A §6 · human-authority non-regression', () => {
  it('does not suppress lawful member authorship of lived meaning', () => {
    const kinds = ['member_experience', 'member_meaning', 'member_value', 'member_preference', 'member_intention', 'member_interpretation'] as const;
    for (const kind of kinds) {
      const result = evaluateJoin(
        lawfulRequest({
          envelope: envelope({ components: [component('c-1', { kind, claimedSemantics: ['psychological_meaning'] })] }),
          adoptionActs: [adoptionAct({ adoptedComponentIds: ['c-1'] })],
        }),
      );
      expect(result.components[0]?.refusals).toEqual([]);
      expect(result.components[0]?.admittedStanding).toBe('WARRANTED');
    }
  });
});

describe('I1 §14 · disposition criteria still hold in the implemented form', () => {
  it('criterion 9 — reference and reliance remain separable throughout', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          endpoints: [endpoint('e1'), endpoint('e2', { mode: 'reference', boundaries: [boundary('b-ref')] })],
        }),
      }),
    );
    // A reference-only endpoint's boundary is not inherited, because reference
    // is not dependence.
    expect(result.carriedBoundaries.map((b) => b.boundaryId)).not.toContain('b-ref');
    expect(result.refusals).toEqual([]);
  });

  it('criterion 10 — a lower-standing hypothesis survives a refused promotion', () => {
    const result = evaluateJoin(
      lawfulRequest({ requestedStanding: 'PROMOTED', envelope: envelope({ operation: 'PROMOTE' }) }),
    );
    expect(result.admittedStanding).toBe('WARRANTED');
    expect(result.lowerStandingRepresentationPermitted).toBe(true);
  });
});

describe('standing-chain integrity · an ambiguous history is malformed, never a weaker standing', () => {
  it('refuses a rootless chain whose acts no derivation would ever read', () => {
    // Two acts superseding each other: well-formed pairwise, yet the subject has
    // no root, so nothing derives from either. An act that sits in the record
    // claiming a standing no derivation reads must be refused, not ignored.
    expect(() =>
      resolveStanding([
        standingAct({ actId: 'a1', claimedStanding: 'WARRANTED', supersedesActId: 'a2' }),
        standingAct({ actId: 'a2', claimedStanding: 'PROVISIONAL', supersedesActId: 'a1' }),
      ]),
    ).toThrow(/orphan_standing_act/);
  });

  it('refuses two roots for one subject', () => {
    expect(() =>
      resolveStanding([
        standingAct({ actId: 'a1', claimedStanding: 'CANDIDATE_UNESTABLISHED' }),
        standingAct({ actId: 'a2', claimedStanding: 'WARRANTED' }),
      ]),
    ).toThrow(/multiple_standing_roots/);
  });

  it('refuses succession across different subjects', () => {
    expect(() =>
      resolveStanding([
        standingAct({ actId: 'a1', claimedStanding: 'CANDIDATE_UNESTABLISHED' }),
        standingAct({ actId: 'a2', claimedStanding: 'WARRANTED', componentId: 'c-1', supersedesActId: 'a1' }),
      ]),
    ).toThrow(/cross_subject_supersession/);
  });

  it('refuses a duplicate act id', () => {
    expect(() =>
      resolveStanding([
        standingAct({ actId: 'a1', claimedStanding: 'CANDIDATE_UNESTABLISHED' }),
        standingAct({ actId: 'a1', claimedStanding: 'WARRANTED' }),
      ]),
    ).toThrow(/duplicate_standing_act/);
  });

  it('refuses an unknown predecessor rather than starting a new chain', () => {
    expect(() =>
      resolveStanding([standingAct({ actId: 'a2', claimedStanding: 'WARRANTED', supersedesActId: 'ghost' })]),
    ).toThrow(/unknown_superseded_act/);
  });
});
