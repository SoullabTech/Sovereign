import { resolveClaimStanding, type ClaimStandingAct } from './claim-standing';
import { renderStandingEnvelope, StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';
import { deriveSupportGround, type SupportDerivedPlan } from './support-derived-ground';

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
let passed = 0;
const ok = (name: string, condition: boolean): void => {
  if (!condition) throw new Error(`FAIL ${name}`);
  passed += 1; console.log(`PASS ${name}`);
};

const currentOnly: SupportDerivedPlan = {
  synthesis: [{ text: 'grief may reorganize the picture', supportEvidenceIds: ['E-NOW'] }],
  question: 'What becomes newly visible?',
};
const p1 = deriveSupportGround(currentOnly, 'center', standing);
ok('current support does not duplicate current visible ground', p1.ground.map((x) => x.evidenceId).join(',') === 'E-NOW');
ok('synthesis unchanged under ground derivation', JSON.stringify(p1.synthesis) === JSON.stringify(currentOnly.synthesis));
ok('question unchanged under ground derivation', p1.question === currentOnly.question);
const r1 = renderStandingEnvelope(evidence, p1, standing);
ok('current-only support renders current standing visibly', r1.trace.grounded.length === 1 && r1.trace.grounded[0].claimStanding === 'current');

const historicalSupport: SupportDerivedPlan = {
  synthesis: [{ text: 'the older autonomy frame may now be reorganized', supportEvidenceIds: ['E-OLD', 'E-NOW'] }],
  question: 'What changes?',
};
const p2 = deriveSupportGround(historicalSupport, 'center', standing);
ok('superseded member evidence becomes visible only when directly cited as support', p2.ground.map((x) => x.evidenceId).join(',') === 'E-NOW,E-OLD');
const r2 = renderStandingEnvelope(evidence, p2, standing);
ok('historical support renders explicitly historical', r2.text.includes('Earlier, you said'));

const staleInferenceSupport: SupportDerivedPlan = {
  synthesis: [{ text: 'the earlier inference may need reorganization', supportEvidenceIds: ['M-OLD', 'E-NOW'] }],
  question: 'What changes?',
};
const p3 = deriveSupportGround(staleInferenceSupport, 'center', standing);
const r3 = renderStandingEnvelope(evidence, p3, standing);
ok('stale derived inference becomes visible only when directly cited as support', p3.ground.map((x) => x.evidenceId).join(',') === 'E-NOW,M-OLD');
ok('stale derived support is labeled stale in trace', r3.trace.grounded.some((x) => x.evidenceId === 'M-OLD' && x.lineageStanding === 'stale_derived'));

const overCapacity: SupportDerivedPlan = {
  synthesis: [{ text: 'many supports', supportEvidenceIds: ['E-OLD', 'M-OLD', 'E-NOW', 'E-X'] }], question: null,
};
try {
  renderStandingEnvelope(evidence, deriveSupportGround(overCapacity, 'center', standing), standing);
  throw new Error('FAIL over-capacity support unexpectedly rendered');
} catch (error) {
  ok('support-derived ground never drops evidence silently when capacity is exceeded', error instanceof StandingEnvelopeRefused && error.code === 'too_many_ground_segments');
}

console.log(JSON.stringify({ programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01', act: 'ACT 5 support-derived ground proof', status: 'PASS', assertions: passed, currentOnly: r1, historical: r2, staleInference: r3 }, null, 2));
