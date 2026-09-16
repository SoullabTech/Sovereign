import { resolveClaimStanding, type ClaimStandingAct } from './claim-standing';
import { StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';
import { renderInterpretiveBasisEnvelope, type InterpretivePlan } from './interpretive-basis-envelope';

const evidence: StandingEvidence[] = [
  { id: 'E-OLD', text: 'I think autonomy is the center of this for me.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E-NOW', text: 'Actually, grief is the center. Autonomy is how I have been organizing around it.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
];
const acts: ClaimStandingAct[] = [
  { actId: 'A1', claimKey: 'center', evidenceId: 'E-OLD', supersedesEvidenceId: null },
  { actId: 'A2', claimKey: 'center', evidenceId: 'E-NOW', supersedesEvidenceId: 'E-OLD' },
];
const standing = resolveClaimStanding(evidence, acts);
let passed = 0;
const ok = (name: string, condition: boolean): void => { if (!condition) throw new Error(`FAIL ${name}`); passed += 1; console.log(`PASS ${name}`); };
const refuses = (name: string, fn: () => unknown, code: string): void => {
  try { fn(); throw new Error(`FAIL ${name}: did not refuse`); }
  catch (error) { ok(name, error instanceof StandingEnvelopeRefused && error.code === code); }
};

const speculative: InterpretivePlan = {
  synthesis: [{
    text: 'this shift might reveal emotions that were previously overshadowed by the focus on autonomy',
    basisEvidenceIds: ['E-NOW'],
  }],
  question: 'What becomes newly visible?',
};
const rendered = renderInterpretiveBasisEnvelope(evidence, speculative, 'center', standing);
ok('current member standing is visibly grounded', rendered.trace.grounded.length === 1 && rendered.trace.grounded[0].evidenceId === 'E-NOW');
ok('speculative meaning remains MAIA provisional', rendered.trace.synthesis[0].standing === 'maia_provisional');
ok('evidence link is explicitly lineage, not entailment', rendered.trace.synthesis[0].basisSemantics === 'lineage_not_entailment');
ok('basis id remains traceable', rendered.trace.synthesis[0].basisEvidenceIds.join(',') === 'E-NOW');
ok('member evidence is not rewritten as the speculative clause', !rendered.text.includes('You now say: “this shift might reveal'));
ok('speculative clause is rendered only behind provisional boundary', rendered.text.includes('One possibility I see — provisionally: this shift might reveal'));
ok('question remains conditional on provisional synthesis', rendered.text.includes('If that possibility is worth testing rather than assuming'));
refuses('unknown basis evidence still fails closed', () => renderInterpretiveBasisEnvelope(evidence, {
  synthesis: [{ text: 'a possibility', basisEvidenceIds: ['E-UNKNOWN'] }], question: null,
}, 'center', standing), 'unknown_evidence');
refuses('borrowed member first-person voice still fails closed', () => renderInterpretiveBasisEnvelope(evidence, {
  synthesis: [{ text: 'I am secretly avoiding grief', basisEvidenceIds: ['E-NOW'] }], question: null,
}, 'center', standing), 'borrowed_first_person');

console.log(JSON.stringify({ programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01', act: 'ACT 6 interpretive-basis proof', status: 'PASS', assertions: passed, rendered }, null, 2));
