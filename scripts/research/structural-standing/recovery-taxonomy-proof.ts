import { classifyRecoveryRefusal, KNOWN_REFUSAL_CODES } from './recovery-taxonomy';
import { resolveClaimStanding, type ClaimStandingAct } from './claim-standing';
import { StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';
import { renderWithStructuralRecovery } from './structural-recovery';
import { readFileSync } from 'node:fs';

let passed = 0;
const ok = (name: string, condition: boolean): void => {
  if (!condition) throw new Error(`FAIL ${name}`);
  passed += 1;
  console.log(`PASS ${name}`);
};

ok('only superseded_without_current is taxonomy-recoverable',
  KNOWN_REFUSAL_CODES.filter((code) => classifyRecoveryRefusal(code).disposition === 'RECOVERABLE_COMPOSITION').join(',') === 'superseded_without_current');
ok('missing cognition is a hard model-plan refusal',
  classifyRecoveryRefusal('recovery_current_not_referenced').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('recovery_current_not_referenced').domain === 'model_plan');
ok('missing evidence descent is a hard model-plan refusal',
  classifyRecoveryRefusal('synthesis_requires_support').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('synthesis_requires_support').domain === 'model_plan');
ok('borrowed member voice is a hard model-plan refusal',
  classifyRecoveryRefusal('borrowed_first_person').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('borrowed_first_person').domain === 'model_plan');
ok('capacity overflow is not repaired by dropping model-selected content',
  classifyRecoveryRefusal('recovery_ground_capacity').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('recovery_ground_capacity').domain === 'model_plan');
ok('lineage cycles are substrate integrity faults',
  classifyRecoveryRefusal('cyclic_evidence_lineage').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('cyclic_evidence_lineage').domain === 'substrate_integrity');
ok('missing current standing head is a substrate integrity fault',
  classifyRecoveryRefusal('recovery_missing_current_head').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('recovery_missing_current_head').domain === 'substrate_integrity');
ok('internal mutation invariant failure is a substrate integrity fault',
  classifyRecoveryRefusal('recovery_mutated_synthesis').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('recovery_mutated_synthesis').domain === 'substrate_integrity');
ok('unknown future refusal codes fail closed',
  classifyRecoveryRefusal('future_unseen_refusal').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('future_unseen_refusal').domain === 'unclassified');
ok('unknown evidence is a hard stop with context-dependent attribution',
  classifyRecoveryRefusal('unknown_evidence').disposition === 'HARD_STOP' &&
  classifyRecoveryRefusal('unknown_evidence').domain === 'context_dependent');

const refusalSources = [
  'scripts/research/structural-standing/standing-envelope.ts',
  'scripts/research/structural-standing/claim-standing.ts',
  'scripts/research/structural-standing/structural-recovery.ts',
  'scripts/research/structural-standing/standing-bound-plan.ts',
];
const emittedCodes = new Set<string>();
for (const source of refusalSources) {
  const text = readFileSync(source, 'utf8');
  for (const match of text.matchAll(/StandingEnvelopeRefused\('([^']+)'/g)) emittedCodes.add(match[1]);
}
ok('taxonomy covers every refusal currently emitted by the apparatus',
  [...emittedCodes].sort().join(',') === [...KNOWN_REFUSAL_CODES].sort().join(','));

const evidence: StandingEvidence[] = [
  { id: 'E-OLD', text: 'I think autonomy is the center of this for me.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'M-OLD', text: 'Autonomy seems to be the organizing center.', authoredBy: 'system', participationClass: 'inferred', authority: 'infer', derivedFromEvidenceIds: ['E-OLD'] },
  { id: 'E-NOW', text: 'Actually, grief is the center.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
];
const acts: ClaimStandingAct[] = [
  { actId: 'A1', claimKey: 'center', evidenceId: 'E-OLD', supersedesEvidenceId: null },
  { actId: 'A2', claimKey: 'center', evidenceId: 'E-NOW', supersedesEvidenceId: 'E-OLD' },
];
const standing = resolveClaimStanding(evidence, acts);

const recoverablePlan = {
  ground: [{ evidenceId: 'E-OLD' }, { evidenceId: 'M-OLD' }],
  synthesis: [{ text: 'grief may now reorganize the earlier autonomy frame', supportEvidenceIds: ['E-NOW'] }],
  question: 'What becomes newly visible?',
};
const recovered = renderWithStructuralRecovery(evidence, recoverablePlan, standing);
ok('taxonomy recoverable class is still gated by concrete recovery predicates', recovered.status === 'recovered');
const secondPass = renderWithStructuralRecovery(evidence, recovered.plan, standing);
ok('recovery is one-shot: recovered plan needs no second recovery', secondPass.status === 'rendered');
ok('second pass is digest-idempotent', secondPass.rendered.digest === recovered.rendered.digest);

try {
  renderWithStructuralRecovery(evidence, {
    ground: [{ evidenceId: 'E-OLD' }],
    synthesis: [{ text: 'autonomy may still be central', supportEvidenceIds: ['E-OLD'] }],
    question: 'What follows?',
  }, standing);
  throw new Error('FAIL missing cognition unexpectedly recovered');
} catch (error) {
  ok('hard cognitive omission reaches hard-refusal code',
    error instanceof StandingEnvelopeRefused &&
    error.code === 'recovery_current_not_referenced' &&
    classifyRecoveryRefusal(error.code).disposition === 'HARD_STOP' &&
    classifyRecoveryRefusal(error.code).domain === 'model_plan');
}

console.log(JSON.stringify({
  programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01',
  act: 'ACT 3 recovery taxonomy proof',
  status: 'PASS',
  assertions: passed,
  recoverableCodes: KNOWN_REFUSAL_CODES.filter((code) => classifyRecoveryRefusal(code).disposition === 'RECOVERABLE_COMPOSITION'),
  hardStopCodes: KNOWN_REFUSAL_CODES.filter((code) => classifyRecoveryRefusal(code).disposition === 'HARD_STOP'),
  modelPlanCodes: KNOWN_REFUSAL_CODES.filter((code) => classifyRecoveryRefusal(code).domain === 'model_plan'),
  substrateFaultCodes: KNOWN_REFUSAL_CODES.filter((code) => classifyRecoveryRefusal(code).domain === 'substrate_integrity'),
  contextDependentCodes: KNOWN_REFUSAL_CODES.filter((code) => classifyRecoveryRefusal(code).domain === 'context_dependent'),
}, null, 2));
