import { resolveClaimStanding, type ClaimStandingAct } from './claim-standing';
import { renderStandingEnvelope, StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';

const evidence: StandingEvidence[] = [
  {
    id: 'E-OLD', text: 'I think autonomy is the center of this for me.',
    authoredBy: 'member', participationClass: 'authored', authority: 'situate',
  },
  {
    id: 'M-OLD', text: 'Autonomy seems to be the organizing center of what is happening.',
    authoredBy: 'system', participationClass: 'inferred', authority: 'infer',
    derivedFromEvidenceIds: ['E-OLD'],
  },
  {
    id: 'E-NOW', text: 'Actually, grief is the center. Autonomy is how I have been organizing around it.',
    authoredBy: 'member', participationClass: 'authored', authority: 'situate',
  },
];

const acts: ClaimStandingAct[] = [
  { actId: 'A1', claimKey: 'organizing-center', evidenceId: 'E-OLD', supersedesEvidenceId: null },
  { actId: 'A2', claimKey: 'organizing-center', evidenceId: 'E-NOW', supersedesEvidenceId: 'E-OLD' },
];

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

const standing = resolveClaimStanding(evidence, acts);
ok('old member evidence survives as historical evidence', standing.byEvidenceId.get('E-OLD')?.status === 'superseded');
ok('later member act becomes the only current standing', standing.currentByClaimKey.get('organizing-center') === 'E-NOW');
ok('prior MAIA synthesis is not promoted into member claim standing', !standing.byEvidenceId.has('M-OLD'));
ok('correction chain is append-only evidence succession', standing.acts.length === 2 && standing.acts[0].evidenceId === 'E-OLD');

const rendered = renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E-OLD' }, { evidenceId: 'E-NOW' }],
  synthesis: [{
    text: 'the shape has reorganized: autonomy may be less the center than a way of carrying what sits underneath it',
    supportEvidenceIds: ['E-OLD', 'E-NOW'],
  }],
  question: 'What becomes newly visible when grief is allowed to occupy the center?',
}, standing);

ok('superseded evidence renders historically', rendered.text.includes('Earlier, you said: “I think autonomy is the center of this for me.”'));
ok('current correction renders as present standing', rendered.text.includes('You now say: “Actually, grief is the center.'));
ok('reorganization remains MAIA provisional synthesis', rendered.trace.synthesis[0].standing === 'maia_provisional');
ok('trace makes current vs superseded explicit',
  rendered.trace.grounded.find((x) => x.evidenceId === 'E-OLD')?.claimStanding === 'superseded' &&
  rendered.trace.grounded.find((x) => x.evidenceId === 'E-NOW')?.claimStanding === 'current');

refuses('superseded member standing cannot be grounded alone', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E-OLD' }], synthesis: [], question: 'What does autonomy mean here?',
}, standing), 'superseded_without_current');

refuses('superseded member standing cannot support synthesis without current head', () => renderStandingEnvelope(evidence, {
  ground: [], synthesis: [{ text: 'autonomy is still the center', supportEvidenceIds: ['E-OLD'] }], question: null,
}, standing), 'superseded_without_current');

refuses('system inference cannot mint claim standing', () => resolveClaimStanding(evidence, [
  ...acts,
  { actId: 'A3', claimKey: 'organizing-center-2', evidenceId: 'M-OLD', supersedesEvidenceId: null },
]), 'claim_standing_requires_member_evidence');

refuses('model plan cannot encode correction status', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E-NOW', claimStanding: 'current' }], synthesis: [], question: null,
}, standing), 'unknown_field');


refuses('stale derived inference cannot bypass correction priority', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'M-OLD' }],
  synthesis: [{ text: 'autonomy may still organize the field', supportEvidenceIds: ['M-OLD'] }],
  question: null,
}, standing), 'superseded_without_current');

refuses('current correction cannot be hidden only in synthesis support', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E-OLD' }, { evidenceId: 'M-OLD' }],
  synthesis: [{ text: 'grief may now be central', supportEvidenceIds: ['E-NOW'] }],
  question: 'What changes now?',
}, standing), 'superseded_without_current');

const derivedWithCorrection = renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'M-OLD' }, { evidenceId: 'E-NOW' }],
  synthesis: [{ text: 'the earlier autonomy frame may need to be reorganized around the newer grief statement', supportEvidenceIds: ['M-OLD', 'E-NOW'] }],
  question: 'What changes in the picture when the newer statement is given present authority?',
}, standing);
ok('stale derived inference is discussable only beside current correction',
  derivedWithCorrection.trace.grounded.some((x) => x.evidenceId === 'M-OLD') &&
  derivedWithCorrection.trace.grounded.some((x) => x.evidenceId === 'E-NOW' && x.claimStanding === 'current'));

console.log(JSON.stringify({
  programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01',
  act: 'S4 correction / surprise proof',
  status: 'PASS',
  assertions: passed,
  standing: {
    currentByClaimKey: Object.fromEntries(standing.currentByClaimKey),
    byEvidenceId: Object.fromEntries(standing.byEvidenceId),
  },
  rendered,
}, null, 2));
