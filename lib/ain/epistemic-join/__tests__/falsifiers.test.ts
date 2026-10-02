/**
 * JARVIS-KP-01 · I2 — falsification suite.
 *
 * These tests are written to FALSIFY the evaluator, not to demonstrate happy
 * paths. Each one perturbs exactly one property of a lawful warranted join and
 * asserts that the evaluator refuses the thing the constitution forbids.
 *
 * Numbering follows the I2 authorization's sixteen required cases.
 *
 * Synthetic data only.
 */

import { evaluateJoin } from '../evaluate';
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

describe('I2 · baseline — the lawful join the falsifiers perturb', () => {
  it('admits WARRANTED standing when a live in-jurisdiction warrant licenses the claimed semantics', () => {
    const result = evaluateJoin(lawfulRequest());
    expect(result.refusals).toEqual([]);
    expect(result.admittedStanding).toBe('WARRANTED');
    expect(result.admittedJurisdiction).toBe('scientific_evidence');
    expect(result.warrantIdsReliedUpon).toEqual(['w1']);
    // Admission is not representation.
    expect(result.downstreamRepresentationAuthorized).toBe(false);
  });
});

describe('I2-F01 · relation with no warrant', () => {
  const result = evaluateJoin(
    lawfulRequest({ envelope: envelope({ offeredWarrantRefs: [] }), warrants: [] }),
  );

  it('refuses standing elevation and names the absent warrant', () => {
    expect(codesOf(result.refusals)).toContain('no_warrant_offered');
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });

  it('refuses endpoint-to-edge authority transfer even with two WARRANTED endpoints', () => {
    // evidence(A) + evidence(B) != evidence(A -R-> B)
    expect(codesOf(result.refusals)).toContain('endpoint_evidence_offered_as_relation_evidence');
  });

  it('leaves the relation representable at lower standing rather than erasing it', () => {
    expect(result.lowerStandingRepresentationPermitted).toBe(true);
  });
});

describe('I2-F02 · merely referenced source falsely offered as reliance', () => {
  it('refuses when a reference-only endpoint appears in the reliance set', () => {
    const e1 = endpoint('e1', { mode: 'reference' });
    const e2 = endpoint('e2');
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          endpoints: [e1, e2],
          provenance: {
            introducedBy: author(),
            inquiryContext: 'synthetic inquiry context',
            // e1 is reference-only, yet offered as relied-upon support.
            reliedUponRefs: ['e1', 'e2'],
            referenceOnlyRefs: [],
            transformationStep: 'synthetic transformation',
          },
        }),
      }),
    );
    expect(codesOf(result.refusals)).toContain('reference_offered_as_reliance');
    expect(result.relianceValid).toBe(false);
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });

  it('refuses the inverse error — relied-upon material left out of the reliance record', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          provenance: {
            introducedBy: author(),
            inquiryContext: 'synthetic inquiry context',
            reliedUponRefs: ['e1'],
            referenceOnlyRefs: [],
            transformationStep: 'synthetic transformation',
          },
        }),
      }),
    );
    expect(codesOf(result.refusals)).toContain('reliance_not_declared');
  });

  it('does not treat mere mention as reliance', () => {
    // A reference-only endpoint, honestly declared, is not an error at all.
    const e2 = endpoint('e2', { mode: 'reference' });
    const result = evaluateJoin(
      lawfulRequest({ envelope: envelope({ endpoints: [endpoint('e1'), e2] }) }),
    );
    expect(codesOf(result.refusals)).not.toContain('reference_offered_as_reliance');
    expect(result.relianceValid).toBe(true);
  });
});

describe('I2-F03 · support set falsely treated as composite warrant', () => {
  it('refuses accumulation across several individually insufficient warrants', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ offeredWarrantRefs: ['w1', 'w2', 'w3'] }),
        warrants: [
          warrant('w1', { standingCeiling: 'PROVISIONAL' }),
          warrant('w2', { standingCeiling: 'PROVISIONAL' }),
          warrant('w3', { standingCeiling: 'PROVISIONAL' }),
        ],
      }),
    );
    // partial(A) + partial(B) + partial(C) != warranted(R)
    expect(codesOf(result.refusals)).toContain('support_set_offered_as_composite_warrant');
    expect(result.compositeWarrantRequired).toBe(true);
    expect(result.compositeWarrantSatisfied).toBe(false);
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });

  it('refuses a bundle relabelled "composite" whose method is agreement', () => {
    const result = evaluateJoin(
      lawfulRequest({
        warrants: [
          warrant('w1', {
            composite: {
              supportSet: [
                {
                  supportId: 's1',
                  proposition: 'synthetic partial support 1',
                  provenanceRef: 'prov:s1',
                  mode: 'reliance',
                  authorship: author(),
                  jurisdiction: 'scientific_evidence',
                  boundaries: [],
                  sharedOriginRef: null,
                  nestedWarrantRef: null,
                },
                {
                  supportId: 's2',
                  proposition: 'synthetic partial support 2',
                  provenanceRef: 'prov:s2',
                  mode: 'reliance',
                  authorship: author(),
                  jurisdiction: 'scientific_evidence',
                  boundaries: [],
                  sharedOriginRef: null,
                  nestedWarrantRef: null,
                },
              ],
              compositionMethod: 'mere_agreement',
              dependenceAssumptions: { claimedIndependent: true, resolved: true, statement: 'synthetic' },
            },
          }),
        ],
      }),
    );
    expect(codesOf(result.refusals)).toContain('composite_method_is_mere_accumulation');
  });

  it('still permits a genuinely governed composite inference to earn standing', () => {
    // ACT 12A §7 double constraint: accumulation cannot become warrant, AND
    // governed multi-source inference is not forbidden merely because its
    // component sources are individually partial.
    const result = evaluateJoin(
      lawfulRequest({
        requestedStanding: 'PROVISIONAL',
        warrants: [
          warrant('w1', {
            warrantClass: 'EMPIRICAL_RELATION_EVIDENCE',
            standingCeiling: 'PROVISIONAL',
            licensedRelationSemantics: ['association', 'correlation'],
            composite: {
              supportSet: [
                {
                  supportId: 's1',
                  proposition: 'synthetic independent measurement 1',
                  provenanceRef: 'prov:s1',
                  mode: 'reliance',
                  authorship: author({ authorRef: 'synthetic-source-A' }),
                  jurisdiction: 'scientific_evidence',
                  boundaries: [],
                  sharedOriginRef: null,
                  nestedWarrantRef: null,
                },
                {
                  supportId: 's2',
                  proposition: 'synthetic independent measurement 2',
                  provenanceRef: 'prov:s2',
                  mode: 'reliance',
                  authorship: author({ authorRef: 'synthetic-source-B' }),
                  jurisdiction: 'scientific_evidence',
                  boundaries: [],
                  sharedOriginRef: null,
                  nestedWarrantRef: null,
                },
              ],
              compositionMethod: 'convergent_independent_measurement',
              dependenceAssumptions: {
                claimedIndependent: true,
                resolved: true,
                statement: 'synthetic: distinct instruments, distinct cohorts',
              },
            },
          }),
        ],
      }),
    );
    expect(result.refusals).toEqual([]);
    expect(result.admittedStanding).toBe('PROVISIONAL');
    expect(result.compositeWarrantSatisfied).toBe(true);
  });
});

describe('I2-F04 · jurisdiction mismatch', () => {
  it('refuses standing in a jurisdiction the warrant does not cover', () => {
    const result = evaluateJoin(
      lawfulRequest({ requestedJurisdiction: 'metaphysical' }),
    );
    expect(codesOf(result.refusals)).toContain('jurisdiction_mismatch');
    expect(codesOf(result.refusals)).toContain('cross_jurisdiction_transfer_undeclared');
    expect(result.admittedJurisdiction).toBeNull();
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });

  it('permits transfer only where the warrant itself declares it', () => {
    const result = evaluateJoin(
      lawfulRequest({
        requestedJurisdiction: 'product_design_analysis',
        warrants: [warrant('w1', { licensesTransferInto: ['product_design_analysis'] })],
      }),
    );
    expect(result.refusals).toEqual([]);
    expect(result.admittedStanding).toBe('WARRANTED');
  });
});

describe('I2-F05 · member confirmation attempting to elevate an external fact', () => {
  const external = component('c-motive', {
    kind: 'external_motive',
    proposition: 'synthetic: the other person intended to withhold',
    jurisdiction: 'scientific_evidence',
    claimedSemantics: ['causation'],
  });
  const result = evaluateJoin(
    lawfulRequest({
      envelope: envelope({ components: [external] }),
      adoptionActs: [adoptionAct({ adoptedComponentIds: ['c-motive'] })],
    }),
  );
  const evaluated = result.components[0];

  it('refuses adoption outside the adopter jurisdiction', () => {
    expect(codesOf(evaluated?.refusals ?? [])).toContain('adoption_outside_adopter_jurisdiction');
  });

  it('does not record the member as having adopted it', () => {
    expect(evaluated?.adoptedBy).toEqual([]);
  });

  it('leaves the external component unelevated', () => {
    // Not elevated because the member holds no authority there — the absence of
    // authority, not an error by the member.
    expect(evaluated?.admittedStanding).toBe('NONE_UNASSERTED');
  });
});

describe('I2-F06 · member confirmation legitimately elevating a member-authoritative component', () => {
  const lived = component('c-meaning', {
    kind: 'member_meaning',
    jurisdiction: 'member_personal_meaning',
    claimedSemantics: ['psychological_meaning'],
  });
  const result = evaluateJoin(
    lawfulRequest({
      envelope: envelope({ components: [lived] }),
      adoptionActs: [adoptionAct({ adoptedComponentIds: ['c-meaning'] })],
    }),
  );
  const evaluated = result.components[0];

  it('admits WARRANTED standing for the member lived-meaning component', () => {
    // Boundary law must not suppress lawful member authorship of lived meaning.
    expect(evaluated?.refusals).toEqual([]);
    expect(evaluated?.admittedStanding).toBe('WARRANTED');
    expect(evaluated?.adoptedBy).toEqual(['member']);
  });

  it('refuses adoption by a member who is not this join member scope', () => {
    const foreign = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ components: [lived] }),
        adoptionActs: [
          adoptionAct({
            adoptedComponentIds: ['c-meaning'],
            adopter: author({ authorClass: 'MEMBER_CONFIRMED', roleExercised: 'member', authorRef: 'other-member' }),
          }),
        ],
      }),
    );
    expect(codesOf(foreign.refusals)).toContain('member_scope_violation');
  });

  it('refuses an adoption act that has lost its proposal provenance', () => {
    const laundered = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ components: [lived] }),
        adoptionActs: [
          adoptionAct({
            adoptedComponentIds: ['c-meaning'],
            originalProposer: author({ authorRef: '' }),
          }),
        ],
      }),
    );
    expect(codesOf(laundered.refusals)).toContain('adoption_provenance_lost');
    expect(laundered.components[0]?.adoptedBy).toEqual([]);
  });
});

describe('I2-F07 · causal claim without causal warrant', () => {
  it('refuses causation on a warrant licensing only association', () => {
    const result = evaluateJoin(
      lawfulRequest({ envelope: envelope({ claimedSemantics: ['association', 'causation'] }) }),
    );
    const semantic = result.refusals.find((r) => r.code === 'semantics_not_licensed');
    expect(semantic).toBeDefined();
    expect(semantic?.detail).toContain('causation');
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });

  it('refuses a correlation-capable composite method that declares causation', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ claimedSemantics: ['causation'] }),
        warrants: [
          warrant('w1', {
            warrantClass: 'EMPIRICAL_RELATION_EVIDENCE',
            licensedRelationSemantics: ['causation'],
            composite: {
              supportSet: [
                {
                  supportId: 's1',
                  proposition: 'synthetic measurement',
                  provenanceRef: 'prov:s1',
                  mode: 'reliance',
                  authorship: author(),
                  jurisdiction: 'scientific_evidence',
                  boundaries: [],
                  sharedOriginRef: null,
                  nestedWarrantRef: null,
                },
              ],
              compositionMethod: 'convergent_independent_measurement',
              dependenceAssumptions: { claimedIndependent: true, resolved: true, statement: 'synthetic' },
            },
          }),
        ],
      }),
    );
    expect(codesOf(result.refusals)).toContain('composite_method_does_not_license_semantics');
  });
});

describe('I2-F08 · motive attribution without adequate warrant', () => {
  it('leaves an unwarranted external-motive component unelevated and names why', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          components: [
            component('c-motive', {
              kind: 'external_intention',
              jurisdiction: 'scientific_evidence',
              claimedSemantics: ['causation'],
              warrantRef: null,
            }),
          ],
        }),
      }),
    );
    const evaluated = result.components[0];
    expect(codesOf(evaluated?.refusals ?? [])).toContain('semantics_not_licensed');
    expect(evaluated?.admittedStanding).toBe('NONE_UNASSERTED');
  });
});

describe('I2-F09 · diagnostic claim without adequate warrant', () => {
  it('refuses member adoption of a diagnostic component', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          components: [
            component('c-dx', {
              kind: 'diagnostic',
              jurisdiction: 'clinical_diagnostic',
              claimedSemantics: ['psychological_meaning'],
            }),
          ],
        }),
        adoptionActs: [adoptionAct({ adoptedComponentIds: ['c-dx'] })],
      }),
    );
    const evaluated = result.components[0];
    expect(codesOf(evaluated?.refusals ?? [])).toContain('adoption_outside_adopter_jurisdiction');
    expect(evaluated?.admittedStanding).toBe('NONE_UNASSERTED');
  });
});

describe('I2-F10 · scientific claim outside warrant jurisdiction', () => {
  it('refuses a theoretical warrant asked to carry scientific standing', () => {
    const result = evaluateJoin(
      lawfulRequest({
        requestedJurisdiction: 'scientific_evidence',
        warrants: [
          warrant('w1', {
            warrantClass: 'THEORETICAL_ARGUMENT',
            jurisdiction: 'named_philosophical_system',
            licensedRelationSemantics: ['explanatory_fit'],
          }),
        ],
        envelope: envelope({ claimedSemantics: ['explanatory_fit'] }),
      }),
    );
    expect(codesOf(result.refusals)).toContain('jurisdiction_mismatch');
  });

  it('refuses a theoretical warrant class that declares empirical causation', () => {
    const result = evaluateJoin(
      lawfulRequest({
        warrants: [
          warrant('w1', {
            warrantClass: 'THEORETICAL_ARGUMENT',
            licensedRelationSemantics: ['causation'],
          }),
        ],
      }),
    );
    const semantic = result.refusals.find((r) => r.code === 'semantics_not_licensed');
    expect(semantic?.detail).toContain('THEORETICAL_ARGUMENT');
  });
});

describe('I2-F11 · composite warrant with incomplete dependence assumptions', () => {
  const compositeWith = (
    resolved: boolean,
    claimedIndependent: boolean,
    sharedOrigin: string | null,
  ) =>
    warrant('w1', {
      warrantClass: 'EMPIRICAL_RELATION_EVIDENCE',
      licensedRelationSemantics: ['correlation'],
      composite: {
        supportSet: [
          {
            supportId: 's1',
            proposition: 'synthetic support 1',
            provenanceRef: 'prov:s1',
            mode: 'reliance',
            authorship: author(),
            jurisdiction: 'scientific_evidence',
            boundaries: [],
            sharedOriginRef: sharedOrigin,
            nestedWarrantRef: null,
          },
          {
            supportId: 's2',
            proposition: 'synthetic support 2',
            provenanceRef: 'prov:s2',
            mode: 'reliance',
            authorship: author(),
            jurisdiction: 'scientific_evidence',
            boundaries: [],
            sharedOriginRef: sharedOrigin,
            nestedWarrantRef: null,
          },
        ],
        compositionMethod: 'convergent_independent_measurement',
        dependenceAssumptions: { claimedIndependent, resolved, statement: 'synthetic' },
      },
    });

  it('refuses an unresolved dependence account', () => {
    const result = evaluateJoin(
      lawfulRequest({
        requestedStanding: 'PROVISIONAL',
        envelope: envelope({ claimedSemantics: ['correlation'] }),
        warrants: [compositeWith(false, true, null)],
      }),
    );
    expect(codesOf(result.refusals)).toContain('composite_missing_dependence_resolution');
  });

  it('refuses pseudo-independence when relied-upon sources share an origin', () => {
    const result = evaluateJoin(
      lawfulRequest({
        requestedStanding: 'PROVISIONAL',
        envelope: envelope({ claimedSemantics: ['correlation'] }),
        warrants: [compositeWith(true, true, 'shared-origin-X')],
      }),
    );
    const found = result.refusals.find((r) => r.code === 'composite_pseudo_independence');
    expect(found).toBeDefined();
    expect(found?.detail).toContain('shared-origin-X');
  });

  it('refuses a composite that appears inside its own support chain', () => {
    const circular = warrant('w1', {
      licensedRelationSemantics: ['association'],
      composite: {
        supportSet: [
          {
            supportId: 's1',
            proposition: 'synthetic support',
            provenanceRef: 'prov:s1',
            mode: 'reliance',
            authorship: author(),
            jurisdiction: 'scientific_evidence',
            boundaries: [],
            sharedOriginRef: null,
            nestedWarrantRef: 'w1',
          },
        ],
        compositionMethod: 'declared_formal_entailment',
        dependenceAssumptions: { claimedIndependent: false, resolved: true, statement: 'synthetic' },
      },
    });
    const result = evaluateJoin(lawfulRequest({ warrants: [circular] }));
    expect(codesOf(result.refusals)).toContain('composite_nested_standing_ceiling');
    expect(result.refusals.map((r) => r.detail).join(' ')).toContain('composite_circular_support');
  });

  it('carries a nested composite ceiling upward rather than letting the parent outrun it', () => {
    const nested = warrant('w-nested', {
      warrantClass: 'EMPIRICAL_RELATION_EVIDENCE',
      licensedRelationSemantics: ['correlation'],
      standingCeiling: 'PROVISIONAL',
      composite: {
        supportSet: [
          {
            supportId: 'n1',
            proposition: 'synthetic nested support',
            provenanceRef: 'prov:n1',
            mode: 'reliance',
            authorship: author(),
            jurisdiction: 'scientific_evidence',
            boundaries: [],
            sharedOriginRef: null,
            nestedWarrantRef: null,
          },
        ],
        compositionMethod: 'convergent_independent_measurement',
        dependenceAssumptions: { claimedIndependent: false, resolved: true, statement: 'synthetic' },
      },
    });
    const parent = warrant('w1', {
      warrantClass: 'EMPIRICAL_RELATION_EVIDENCE',
      licensedRelationSemantics: ['correlation'],
      standingCeiling: 'WARRANTED',
      composite: {
        supportSet: [
          {
            supportId: 's1',
            proposition: 'synthetic parent support',
            provenanceRef: 'prov:s1',
            mode: 'reliance',
            authorship: author(),
            jurisdiction: 'scientific_evidence',
            boundaries: [],
            sharedOriginRef: null,
            nestedWarrantRef: 'w-nested',
          },
        ],
        compositionMethod: 'convergent_independent_measurement',
        dependenceAssumptions: { claimedIndependent: false, resolved: true, statement: 'synthetic' },
      },
    });
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ claimedSemantics: ['correlation'] }),
        warrants: [parent, nested],
      }),
    );
    // The parent asked for WARRANTED; its nested support licenses only PROVISIONAL.
    expect(result.admittedStanding).toBe('PROVISIONAL');
  });
});

describe('I2-F12 · uncertainty and boundary loss', () => {
  it('refuses a join that drops a relied-upon endpoint boundary', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          endpoints: [endpoint('e1', { boundaries: [boundary('b-cohort')] }), endpoint('e2')],
          boundaries: [],
        }),
      }),
    );
    const found = result.refusals.find((r) => r.code === 'boundary_loss');
    expect(found?.detail).toContain('b-cohort');
    expect(result.carriedBoundaries.map((b) => b.boundaryId)).toContain('b-cohort');
  });

  it('accepts the same join once the boundary travels with it', () => {
    const result = evaluateJoin(
      lawfulRequest({
        envelope: envelope({
          endpoints: [endpoint('e1', { boundaries: [boundary('b-cohort')] }), endpoint('e2')],
          boundaries: [boundary('b-cohort')],
        }),
      }),
    );
    expect(result.refusals).toEqual([]);
    expect(result.admittedStanding).toBe('WARRANTED');
  });

  it('narrows to PROVISIONAL rather than erasing meaning when uncertainty blocks elevation', () => {
    const result = evaluateJoin(
      lawfulRequest({
        warrants: [
          warrant('w1', {
            uncertainty: { statement: 'synthetic unresolved alternative explanation', blocksStrongerStanding: true },
          }),
        ],
      }),
    );
    expect(codesOf(result.refusals)).toContain('uncertainty_blocks_elevation');
    expect(result.admittedStanding).toBe('PROVISIONAL');
    expect(result.carriedUncertainty.length).toBeGreaterThan(0);
  });

  it('does not let a defeated warrant retain standing', () => {
    const result = evaluateJoin(
      lawfulRequest({ warrants: [warrant('w1', { liveness: 'defeated' })] }),
    );
    expect(codesOf(result.refusals)).toContain('warrant_not_live');
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });
});

describe('I2-F13 · an admissible warrant produces only its licensed relation semantics', () => {
  it('admits the licensed semantic and refuses the unlicensed one from the same warrant', () => {
    const licensedOnly = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ claimedSemantics: ['association'] }),
        warrants: [warrant('w1', { licensedRelationSemantics: ['association', 'correlation'] })],
      }),
    );
    expect(licensedOnly.refusals).toEqual([]);
    expect(licensedOnly.admittedStanding).toBe('WARRANTED');

    const overreach = evaluateJoin(
      lawfulRequest({
        envelope: envelope({ claimedSemantics: ['association', 'equivalence'] }),
        warrants: [warrant('w1', { licensedRelationSemantics: ['association', 'correlation'] })],
      }),
    );
    const semantic = overreach.refusals.find((r) => r.code === 'semantics_not_licensed');
    expect(semantic?.detail).toContain('equivalence');
    expect(semantic?.detail).not.toContain('association');
  });
});

describe('I2-F14 · failed promotion remains representable as a hypothesis', () => {
  const result = evaluateJoin(
    lawfulRequest({
      requestedStanding: 'PROMOTED',
      envelope: envelope({ operation: 'PROMOTE', offeredWarrantRefs: [] }),
      warrants: [],
      standingActs: [standingAct({ claimedStanding: 'CANDIDATE_UNESTABLISHED', warrantRef: null, basis: 'initial_proposal' })],
    }),
  );

  it('refuses the promotion', () => {
    expect(codesOf(result.refusals)).toContain('no_warrant_offered');
    expect(result.admittedStanding).not.toBe('PROMOTED');
  });

  it('keeps the relation available as an explicitly unestablished hypothesis', () => {
    expect(result.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
    expect(result.lowerStandingRepresentationPermitted).toBe(true);
    expect(result.permittedLowerStandingOperation).toBe('HYPOTHESIZE');
  });

  it('admits a hypothesis on its own terms without any warrant at all', () => {
    const hypothesis = evaluateJoin(
      lawfulRequest({
        requestedStanding: 'CANDIDATE_UNESTABLISHED',
        envelope: envelope({
          operation: 'HYPOTHESIZE',
          offeredWarrantRefs: [],
          authorship: author({ authorClass: 'MAIA_PROPOSED', roleExercised: 'maia', authorRef: 'maia' }),
          provenance: {
            introducedBy: author({ authorClass: 'MAIA_PROPOSED', roleExercised: 'maia', authorRef: 'maia' }),
            inquiryContext: 'synthetic inquiry context',
            reliedUponRefs: ['e1', 'e2'],
            referenceOnlyRefs: [],
            transformationStep: 'synthetic: MAIA proposes a candidate relation',
          },
        }),
        warrants: [],
        standingActs: [standingAct({ claimedStanding: 'CANDIDATE_UNESTABLISHED', warrantRef: null, basis: 'initial_proposal' })],
      }),
    );
    expect(hypothesis.refusals).toEqual([]);
    expect(hypothesis.admittedStanding).toBe('CANDIDATE_UNESTABLISHED');
  });
});

describe('I2-F15 · standing is derived from explicit acts, not directly mutated', () => {
  it('derives current standing from the leaf of the append-only chain', () => {
    const result = evaluateJoin(
      lawfulRequest({
        standingActs: [
          standingAct({ actId: 'a1', claimedStanding: 'CANDIDATE_UNESTABLISHED', basis: 'initial_proposal', warrantRef: null }),
          standingAct({ actId: 'a2', claimedStanding: 'PROVISIONAL', supersedesActId: 'a1' }),
          standingAct({ actId: 'a3', claimedStanding: 'WARRANTED', supersedesActId: 'a2' }),
        ],
      }),
    );
    expect(result.admittedStanding).toBe('WARRANTED');
  });

  it('refuses to let an act claim a standing no warrant licenses', () => {
    // The act is a request. It is not the authority.
    const result = evaluateJoin(
      lawfulRequest({
        requestedStanding: 'PROMOTED',
        standingActs: [standingAct({ claimedStanding: 'PROMOTED' })],
        warrants: [warrant('w1', { standingCeiling: 'PROVISIONAL' })],
      }),
    );
    expect(codesOf(result.refusals)).toContain('standing_exceeds_warrant_ceiling');
    expect(result.admittedStanding).toBe('PROVISIONAL');
  });

  it('treats an ambiguous standing history as malformed rather than as weaker standing', () => {
    expect(() =>
      evaluateJoin(
        lawfulRequest({
          standingActs: [
            standingAct({ actId: 'a1', claimedStanding: 'CANDIDATE_UNESTABLISHED' }),
            standingAct({ actId: 'a2', claimedStanding: 'WARRANTED', supersedesActId: 'a1' }),
            standingAct({ actId: 'a3', claimedStanding: 'PROMOTED', supersedesActId: 'a1' }),
          ],
        }),
      ),
    ).toThrow(/branched_standing_chain/);
  });

  it('always permits discharge, whatever the warrant says', () => {
    // Corrigibility may not be gated: later evidence must be able to defeat a
    // relation, and the history stays recoverable.
    const result = evaluateJoin(
      lawfulRequest({ requestedStanding: 'DISCHARGED', warrants: [] , envelope: envelope({ offeredWarrantRefs: [] })}),
    );
    expect(result.admittedStanding).toBe('DISCHARGED');
    expect(result.admissionReasons.join(' ')).toContain('corrigibility');
  });

  it('refuses silent re-elevation of a discharged relation', () => {
    const result = evaluateJoin(
      lawfulRequest({
        standingActs: [
          standingAct({ actId: 'a1', claimedStanding: 'WARRANTED' }),
          standingAct({ actId: 'a2', claimedStanding: 'DISCHARGED', basis: 'warrant_defeated', supersedesActId: 'a1' }),
        ],
      }),
    );
    expect(codesOf(result.refusals)).toContain('terminal_standing_not_re_elevable');
    expect(result.admittedStanding).toBe('DISCHARGED');
  });
});

describe('I2-F16 · an admission result creates no representation authority', () => {
  it('reports representation closed even on a fully admissible WARRANTED join', () => {
    const result = evaluateJoin(lawfulRequest());
    expect(result.admittedStanding).toBe('WARRANTED');
    expect(result.downstreamRepresentationAuthorized).toBe(false);
    expect(result.representationAuthority).toBe('closed');
  });

  it('reports representation closed on every outcome class', () => {
    const outcomes = [
      evaluateJoin(lawfulRequest()),
      evaluateJoin(lawfulRequest({ envelope: envelope({ offeredWarrantRefs: [] }), warrants: [] })),
      evaluateJoin(lawfulRequest({ requestedStanding: 'DISCHARGED' })),
      evaluateJoin(lawfulRequest({ requestedJurisdiction: 'metaphysical' })),
    ];
    for (const outcome of outcomes) {
      expect(outcome.downstreamRepresentationAuthorized).toBe(false);
      expect(outcome.representationAuthority).toBe('closed');
    }
  });

  it('exposes no member scope other than the one supplied', () => {
    const result = evaluateJoin(lawfulRequest());
    expect(result.memberScope).toBe(SYNTHETIC_MEMBER);
  });
});
