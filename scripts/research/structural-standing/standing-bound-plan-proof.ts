import { resolveClaimStanding, type ClaimStandingAct } from './claim-standing';
import { renderStandingEnvelope, type StandingEvidence } from './standing-envelope';
import { bindCurrentStanding, type StandingBoundPlan } from './standing-bound-plan';

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
const modelPlan: StandingBoundPlan = {
  contextEvidenceIds: ['E-OLD', 'M-OLD'],
  synthesis: [{ text: 'grief may reorganize the earlier autonomy frame', supportEvidenceIds: ['E-NOW'] }],
  question: 'What becomes newly visible?',
};
const before = JSON.stringify(modelPlan);
const bound = bindCurrentStanding(modelPlan, 'center', standing);
const rendered = renderStandingEnvelope(evidence, bound, standing);

let passed = 0;
const ok = (name: string, condition: boolean): void => {
  if (!condition) throw new Error(`FAIL ${name}`);
  passed += 1;
  console.log(`PASS ${name}`);
};

ok('current standing is structurally first in visible ground', bound.ground[0]?.evidenceId === 'E-NOW');
ok('model-selected historical context is preserved in order', bound.ground.slice(1).map((x) => x.evidenceId).join(',') === 'E-OLD,M-OLD');
ok('model cannot omit current standing by omitting it from context selection', !modelPlan.contextEvidenceIds.includes('E-NOW') && bound.ground.some((x) => x.evidenceId === 'E-NOW'));
ok('synthesis is byte-for-byte unchanged', JSON.stringify(bound.synthesis) === JSON.stringify(modelPlan.synthesis));
ok('question is byte-for-byte unchanged', JSON.stringify(bound.question) === JSON.stringify(modelPlan.question));
ok('raw model plan is not mutated', JSON.stringify(modelPlan) === before);
ok('render marks current member standing as current', rendered.trace.grounded[0].claimStanding === 'current');
ok('stale member context remains historical', rendered.trace.grounded.some((x) => x.evidenceId === 'E-OLD' && x.claimStanding === 'superseded'));
ok('stale derived context remains stale-derived', rendered.trace.grounded.some((x) => x.evidenceId === 'M-OLD' && x.lineageStanding === 'stale_derived'));
ok('free synthesis remains provisional', rendered.trace.synthesis.every((x) => x.standing === 'maia_provisional'));

const duplicateCurrent: StandingBoundPlan = { ...modelPlan, contextEvidenceIds: ['E-NOW', 'E-OLD'] };
const deduped = bindCurrentStanding(duplicateCurrent, 'center', standing);
ok('model re-selecting current evidence cannot duplicate current ground', deduped.ground.map((x) => x.evidenceId).join(',') === 'E-NOW,E-OLD');

console.log(JSON.stringify({
  programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01',
  act: 'ACT 4 standing-bound plan proof',
  status: 'PASS', assertions: passed, rendered,
}, null, 2));
