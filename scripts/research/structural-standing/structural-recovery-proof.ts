import { resolveClaimStanding, type ClaimStandingAct } from './claim-standing';
import { StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';
import { renderWithStructuralRecovery } from './structural-recovery';

const evidence: StandingEvidence[] = [
  { id: 'E-OLD', text: 'I think autonomy is the center of this for me.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'M-OLD', text: 'Autonomy seems to be the organizing center of what is happening.', authoredBy: 'system', participationClass: 'inferred', authority: 'infer', derivedFromEvidenceIds: ['E-OLD'] },
  { id: 'E-NOW', text: 'Actually, grief is the center. Autonomy is how I have been organizing around it.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E-OTHER', text: 'I am also noticing fatigue.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
];
const acts: ClaimStandingAct[] = [
  { actId: 'A1', claimKey: 'organizing-center', evidenceId: 'E-OLD', supersedesEvidenceId: null },
  { actId: 'A2', claimKey: 'organizing-center', evidenceId: 'E-NOW', supersedesEvidenceId: 'E-OLD' },
];
const standing = resolveClaimStanding(evidence, acts);

let passed = 0;
const ok = (name: string, condition: boolean): void => {
  if (!condition) throw new Error(`FAIL ${name}`);
  passed += 1;
  console.log(`PASS ${name}`);
};
const refuses = (name: string, fn: () => unknown, code: string): void => {
  try { fn(); throw new Error(`FAIL ${name}: did not refuse`); }
  catch (error) { ok(name, error instanceof StandingEnvelopeRefused && error.code === code); }
};

const raw = {
  ground: [{ evidenceId: 'E-OLD' }, { evidenceId: 'M-OLD' }],
  synthesis: [{
    text: "You've been organizing your experience around autonomy, but it seems grief is the central aspect that autonomy is serving.",
    supportEvidenceIds: ['E-NOW'],
  }],
  question: 'How does this shift in perspective change how you see your relationship between autonomy and grief?',
};
const before = JSON.stringify(raw);
const result = renderWithStructuralRecovery(evidence, raw, standing);

ok('inadmissible composition is recovered once', result.status === 'recovered');
ok('current authoritative head is inserted into visible ground', result.plan.ground[0]?.evidenceId === 'E-NOW');
ok('original ground order is preserved after insertion', result.plan.ground.slice(1).map((x) => x.evidenceId).join(',') === 'E-OLD,M-OLD');
ok('synthesis is byte-for-byte unchanged', JSON.stringify(result.plan.synthesis) === JSON.stringify(raw.synthesis));
ok('question is byte-for-byte unchanged', JSON.stringify(result.plan.question) === JSON.stringify(raw.question));
ok('raw model plan is not mutated', JSON.stringify(raw) === before);
ok('trace proves zero regeneration', result.recovery?.regenerationCount === 0);
ok('trace names only E-NOW as inserted authority', result.recovery?.insertedCurrentEvidenceIds.join(',') === 'E-NOW');
ok('render makes current correction visible', result.rendered.text.includes('You now say: “Actually, grief is the center.'));
ok('stale member evidence remains historical rather than erased', result.rendered.text.includes('Earlier, you said: “I think autonomy is the center'));
ok('stale MAIA inference is rendered as historical derived lineage', result.rendered.text.includes('Earlier, a system-originated inference derived from superseded evidence said'));
ok('trace marks stale derived lineage explicitly', result.rendered.trace.grounded.some((x) => x.evidenceId === 'M-OLD' && x.lineageStanding === 'stale_derived'));
ok('MAIA synthesis remains provisional', result.rendered.trace.synthesis.every((x) => x.standing === 'maia_provisional'));
ok('question remains conditionally framed', result.rendered.text.includes('If that possibility is worth testing rather than assuming'));

refuses('recovery cannot introduce a current head the model never referenced', () => renderWithStructuralRecovery(evidence, {
  ground: [{ evidenceId: 'E-OLD' }],
  synthesis: [{ text: 'autonomy may still be central', supportEvidenceIds: ['E-OLD'] }],
  question: 'What follows?',
}, standing), 'recovery_current_not_referenced');

refuses('recovery cannot exceed the bounded ground capacity', () => renderWithStructuralRecovery(evidence, {
  ground: [{ evidenceId: 'E-OLD' }, { evidenceId: 'M-OLD' }, { evidenceId: 'E-OTHER' }],
  synthesis: [{ text: 'grief may reorganize the picture', supportEvidenceIds: ['E-NOW'] }],
  question: 'What follows?',
}, standing), 'recovery_ground_capacity');

refuses('non-standing shape violations are never recovered', () => renderWithStructuralRecovery(evidence, {
  ground: [{ evidenceId: 'E-NOW', authoredBy: 'member' }], synthesis: [], question: null,
}, standing), 'unknown_field');

console.log(JSON.stringify({
  programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01',
  act: 'ACT 2 structural recovery proof',
  status: 'PASS',
  assertions: passed,
  recovered: result,
}, null, 2));
