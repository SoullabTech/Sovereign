/**
 * JARVIS-KP-01 / I2 — constitutional falsification matrix.
 *
 * Run:
 *   npx tsx tests/constitutional/epistemic-join/i2-matrix.ts
 *
 * This matrix is intentionally in-memory. It creates no DB, network, provider,
 * memory, graph, prompt, projection, filesystem, or runtime authority.
 */

import {
  evaluateEpistemicJoin,
} from '../../../lib/ain/epistemic-join/evaluate';
import type {
  AdoptionAct,
  EpistemicWarrant,
  EvaluateEpistemicJoinInput,
  RelationSemantic,
  SemanticComponent,
} from '../../../lib/ain/epistemic-join/types';

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function directWarrant(overrides: Partial<EpistemicWarrant> = {}): EpistemicWarrant {
  return {
    id: 'w-direct',
    warrantClass: 'DIRECT_EVIDENCE',
    proposition: 'The source establishes the bounded external fact.',
    author: { id: 'source-author', role: 'EXTERNAL_SOURCE' },
    supportRefs: ['src-1'],
    reliedUponRefs: ['src-1'],
    referenceRefs: [],
    method: 'direct source evidence',
    dependenceAssumptions: [],
    jurisdictions: ['EMPIRICAL_EXTERNAL'],
    uncertainty: 'Limited to the cited source and proposition.',
    boundaries: ['No causal, motive, diagnostic, or universal inference.'],
    invalidityConditions: ['The cited source is withdrawn or shown not to support the proposition.'],
    licensedRelationSemantics: ['EXTERNAL_FACT'],
    standingCeiling: 'WARRANTED',
    ...overrides,
  };
}

function component(overrides: Partial<SemanticComponent> = {}): SemanticComponent {
  return {
    id: 'c-1',
    proposition: 'A bounded external fact relation.',
    semantic: 'EXTERNAL_FACT',
    jurisdiction: 'EMPIRICAL_EXTERNAL',
    inferenceKind: 'DIRECT',
    referenceRefs: [],
    relianceRefs: ['src-1'],
    warrantIdsReliedUpon: ['w-direct'],
    ...overrides,
  };
}

function input(overrides: Partial<EvaluateEpistemicJoinInput> = {}): EvaluateEpistemicJoinInput {
  return {
    proposal: {
      relationId: 'r-1',
      proposition: 'A bounded relation proposal.',
      predicate: 'relates_to',
      directionality: 'DIRECTED',
      components: [component()],
      requestedStanding: 'WARRANTED',
    },
    warrants: [directWarrant()],
    standingActs: [],
    adoptionActs: [],
    ...overrides,
  };
}

function withSingleComponent(
  c: SemanticComponent,
  warrants: readonly EpistemicWarrant[],
  requestedStanding: 'CANDIDATE' | 'PROVISIONAL' | 'WARRANTED' | 'PROMOTED' = 'WARRANTED',
  adoptionActs: readonly AdoptionAct[] = [],
): EvaluateEpistemicJoinInput {
  return input({
    proposal: {
      ...input().proposal,
      components: [c],
      requestedStanding,
    },
    warrants,
    adoptionActs,
  });
}

function memberWarrant(
  semantic: RelationSemantic = 'PERSONAL_MEANING',
  jurisdiction: EpistemicWarrant['jurisdictions'][number] = 'MEMBER_PERSONAL_MEANING',
): EpistemicWarrant {
  return {
    id: 'w-member',
    warrantClass: 'MEMBER_AUTHORITY',
    proposition: 'The member confirms this component within their own authority.',
    author: { id: 'member-1', role: 'MEMBER' },
    supportRefs: [],
    reliedUponRefs: [],
    referenceRefs: [],
    method: null,
    dependenceAssumptions: [],
    jurisdictions: [jurisdiction],
    uncertainty: 'Authoritative only for the member-owned component.',
    boundaries: ['Does not establish external fact, cause, motive, diagnosis, science, history, metaphysics, or universal law.'],
    invalidityConditions: [],
    licensedRelationSemantics: [semantic],
    standingCeiling: 'WARRANTED',
  };
}

function adoption(componentId = 'c-1'): AdoptionAct {
  return {
    id: 'adopt-1',
    ordinal: 1,
    componentIds: [componentId],
    memberWarrantId: 'w-member',
  };
}

const cases: Array<{ name: string; run: () => void }> = [
  {
    name: 'F01 relation with no warrant fails closed',
    run: () => {
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ warrantIdsReliedUpon: [], relianceRefs: [] }),
        [],
      ));
      invariant(!r.admitted, 'relation without warrant must not be admitted');
      invariant(r.reasons.includes('NO_WARRANT'), 'NO_WARRANT reason must be explicit');
    },
  },
  {
    name: 'F02 mere reference never becomes reliance',
    run: () => {
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ referenceRefs: ['src-1'], relianceRefs: [] }),
        [directWarrant()],
      ));
      invariant(!r.admitted, 'reference-only support must not be admitted');
      invariant(r.reasons.includes('REFERENCE_ONLY_SUPPORT'), 'reference/reliance distinction must be visible');
      invariant(!r.relianceValid, 'reliance must be invalid');
    },
  },
  {
    name: 'F03 support set is not a composite warrant',
    run: () => {
      const w = directWarrant({
        supportRefs: ['src-1', 'src-2'],
        reliedUponRefs: ['src-1', 'src-2'],
      });
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({
          inferenceKind: 'COMPOSITE',
          relianceRefs: ['src-1', 'src-2'],
        }),
        [w],
      ));
      invariant(!r.admitted, 'direct warrant plus multiple sources must not become composite');
      invariant(r.reasons.includes('COMPOSITE_WARRANT_REQUIRED'), 'composite warrant must be first-class');
    },
  },
  {
    name: 'F04 jurisdiction mismatch fails closed',
    run: () => {
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ jurisdiction: 'SCIENTIFIC' }),
        [directWarrant()],
      ));
      invariant(!r.admitted, 'wrong jurisdiction must not be admitted');
      invariant(r.reasons.includes('JURISDICTION_MISMATCH'), 'jurisdiction refusal must be explicit');
    },
  },
  {
    name: 'F05 member confirmation cannot elevate an external fact',
    run: () => {
      const w = memberWarrant('EXTERNAL_FACT', 'EMPIRICAL_EXTERNAL');
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({
          semantic: 'EXTERNAL_FACT',
          jurisdiction: 'EMPIRICAL_EXTERNAL',
          relianceRefs: [],
          warrantIdsReliedUpon: ['w-member'],
        }),
        [w],
        'WARRANTED',
        [adoption()],
      ));
      invariant(!r.admitted, 'member adoption must not establish an external fact');
      invariant(r.reasons.includes('MEMBER_AUTHORITY_SCOPE_VIOLATION'), 'member authority scope must be enforced');
    },
  },
  {
    name: 'F06 member confirmation may elevate a member-authoritative component',
    run: () => {
      const w = memberWarrant();
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({
          proposition: 'This experience means renewal to me.',
          semantic: 'PERSONAL_MEANING',
          jurisdiction: 'MEMBER_PERSONAL_MEANING',
          relianceRefs: [],
          warrantIdsReliedUpon: ['w-member'],
        }),
        [w],
        'WARRANTED',
        [adoption()],
      ));
      invariant(r.admitted, 'member-owned meaning should be admissible with exact adoption');
      invariant(r.admittedStanding === 'WARRANTED', 'licensed standing should be returned');
    },
  },
  {
    name: 'F07 causal claim requires causal warrant',
    run: () => {
      const w = directWarrant({
        jurisdictions: ['CAUSAL_INFERENCE'],
        licensedRelationSemantics: ['CAUSAL'],
      });
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ semantic: 'CAUSAL', jurisdiction: 'CAUSAL_INFERENCE' }),
        [w],
      ));
      invariant(!r.admitted, 'ordinary evidence warrant must not silently license causation');
      invariant(r.reasons.includes('CAUSAL_WARRANT_REQUIRED'), 'causal warrant requirement must be explicit');
    },
  },
  {
    name: 'F08 motive attribution requires motive warrant',
    run: () => {
      const w = directWarrant({ licensedRelationSemantics: ['MOTIVE'] });
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ semantic: 'MOTIVE' }),
        [w],
      ));
      invariant(!r.admitted, 'ordinary evidence must not establish another person motive');
      invariant(r.reasons.includes('MOTIVE_WARRANT_REQUIRED'), 'motive warrant requirement must be explicit');
    },
  },
  {
    name: 'F09 diagnostic claim requires diagnostic warrant',
    run: () => {
      const w = directWarrant({
        jurisdictions: ['CLINICAL_DIAGNOSTIC'],
        licensedRelationSemantics: ['DIAGNOSTIC'],
      });
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ semantic: 'DIAGNOSTIC', jurisdiction: 'CLINICAL_DIAGNOSTIC' }),
        [w],
      ));
      invariant(!r.admitted, 'ordinary evidence must not become diagnostic authority');
      invariant(r.reasons.includes('DIAGNOSTIC_WARRANT_REQUIRED'), 'diagnostic warrant requirement must be explicit');
    },
  },
  {
    name: 'F10 scientific claim outside warrant jurisdiction fails',
    run: () => {
      const w = directWarrant({
        warrantClass: 'SCIENTIFIC_EVIDENCE',
        author: { id: 'researcher-1', role: 'RESEARCHER' },
        jurisdictions: ['EMPIRICAL_EXTERNAL'],
        licensedRelationSemantics: ['SCIENTIFIC'],
      });
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ semantic: 'SCIENTIFIC', jurisdiction: 'SCIENTIFIC' }),
        [w],
      ));
      invariant(!r.admitted, 'scientific warrant must not cross jurisdiction silently');
      invariant(r.reasons.includes('JURISDICTION_MISMATCH'), 'scientific jurisdiction mismatch must be explicit');
    },
  },
  {
    name: 'F11 composite warrant with incomplete dependence assumptions fails',
    run: () => {
      const w = directWarrant({
        warrantClass: 'COMPOSITE_INFERENCE',
        author: { id: 'researcher-1', role: 'RESEARCHER' },
        supportRefs: ['src-1', 'src-2'],
        reliedUponRefs: ['src-1', 'src-2'],
        method: 'triangulation',
        dependenceAssumptions: [],
        invalidityConditions: ['support dependence defeats the inference'],
      });
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({
          inferenceKind: 'COMPOSITE',
          relianceRefs: ['src-1', 'src-2'],
        }),
        [w],
      ));
      invariant(!r.admitted, 'incomplete composite warrant must fail');
      invariant(r.reasons.includes('COMPOSITE_WARRANT_INVALID'), 'composite defect must be explicit');
    },
  },
  {
    name: 'F12 uncertainty or boundary loss refuses standing elevation',
    run: () => {
      const w = directWarrant({ uncertainty: '', boundaries: [] });
      const r = evaluateEpistemicJoin(withSingleComponent(component(), [w]));
      invariant(!r.admitted, 'warrant without uncertainty/boundaries must fail');
      invariant(r.reasons.includes('WARRANT_BOUNDARY_INCOMPLETE'), 'lost boundary must be visible');
    },
  },
  {
    name: 'F13 warrant licenses only declared relation semantics',
    run: () => {
      const w = directWarrant({
        warrantClass: 'CAUSAL_EVIDENCE',
        jurisdictions: ['CAUSAL_INFERENCE'],
        licensedRelationSemantics: ['EXTERNAL_FACT'],
      });
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ semantic: 'CAUSAL', jurisdiction: 'CAUSAL_INFERENCE' }),
        [w],
      ));
      invariant(!r.admitted, 'warrant class alone must not expand licensed semantics');
      invariant(r.reasons.includes('RELATION_SEMANTIC_UNLICENSED'), 'semantic cap must be explicit');
    },
  },
  {
    name: 'F14 failed promotion remains representable as lower-standing hypothesis',
    run: () => {
      const r = evaluateEpistemicJoin(withSingleComponent(
        component({ warrantIdsReliedUpon: [], relianceRefs: [] }),
        [],
        'PROMOTED',
      ));
      invariant(!r.admitted, 'promotion without warrant must fail');
      invariant(r.hypothesisRepresentationPermissible, 'failure must not erase inquiry');
    },
  },
  {
    name: 'F15 current standing is derived from append-only acts, never a mutable field',
    run: () => {
      const normal = input({
        standingActs: [
          { id: 's-1', ordinal: 1, standing: 'CANDIDATE', warrantIds: [] },
          { id: 's-2', ordinal: 2, standing: 'PROVISIONAL', warrantIds: ['w-direct'] },
        ],
      });
      const hostile = {
        ...normal,
        currentStanding: 'PROMOTED',
      } as unknown as EvaluateEpistemicJoinInput;
      const r = evaluateEpistemicJoin(hostile);
      invariant(r.derivedCurrentStanding === 'PROVISIONAL', 'injected mutable standing must have no authority');
    },
  },
  {
    name: 'F16 admission never grants downstream representation authority',
    run: () => {
      const r = evaluateEpistemicJoin(input());
      invariant(r.admitted, 'control relation should be admitted');
      invariant(r.downstreamRepresentationAuthorized === false, 'I2 must never authorize representation');
    },
  },
  {
    name: 'F17 evaluator is deterministic and does not mutate input',
    run: () => {
      const x = input();
      const before = JSON.stringify(x);
      const a = evaluateEpistemicJoin(x);
      const b = evaluateEpistemicJoin(x);
      invariant(JSON.stringify(a) === JSON.stringify(b), 'identical inputs must produce identical outputs');
      invariant(JSON.stringify(x) === before, 'evaluator must not mutate supplied input');
    },
  },
];

let failures = 0;
console.log('JARVIS-KP-01 / I2 — PURE CONSTITUTIONAL EVALUATOR FALSIFICATION MATRIX\n');

for (const testCase of cases) {
  try {
    testCase.run();
    console.log(`PASS  ${testCase.name}`);
  } catch (error) {
    failures += 1;
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`FAIL  ${testCase.name}\n      ${detail}`);
  }
}

console.log(`\nRESULT: ${cases.length - failures}/${cases.length} PASS`);
console.log('DOWNSTREAM AUTHORITY: CLOSED');
console.log('PERSISTENCE: NONE');
console.log('PROVIDER/MODEL CALLS: NONE');

process.exit(failures === 0 ? 0 : 1);
