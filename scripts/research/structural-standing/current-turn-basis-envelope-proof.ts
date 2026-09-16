import { StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';
import { renderCurrentTurnBasisEnvelope } from './current-turn-basis-envelope';

const evidence: StandingEvidence[] = [
  { id: 'E1', text: "I think it's the whole Gestalt of both the questions and your responses", authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E2', text: "I'm more engaged in what we're talking about than the fact that we're talking", authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E3', text: 'both and how I’m heard and how it comes back and something in between the two', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E4', text: 'I would call that that Mercurial third the relational field ... something ineffable rising from the field of things coming together', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'M1', text: 'the quality of contact lives in the middle space', authoredBy: 'system', participationClass: 'inferred', authority: 'infer', derivedFromEvidenceIds: ['E3'] },
];
let passed=0;
const ok=(name:string,c:boolean)=>{if(!c)throw new Error(`FAIL ${name}`);passed++;console.log(`PASS ${name}`)};
const refuses=(name:string,fn:()=>unknown,code:string)=>{try{fn();throw new Error(`FAIL ${name}: did not refuse`)}catch(e){ok(name,e instanceof StandingEnvelopeRefused&&e.code===code)}};
const raw={
  synthesis:[{text:'the relational field may be becoming the actual object of inquiry rather than merely a description of good conversation',basisEvidenceIds:['E1','E2','E3','E4']}],
  question:'What conditions seem to let that third arise without trying to manufacture it?'
};
const r=renderCurrentTurnBasisEnvelope(evidence,raw,'E4');
ok('current authored turn is bound in trace',r.trace.currentTurn.evidenceId==='E4');
ok('current turn is implicit rather than mechanically echoed',r.trace.currentTurn.presentation==='implicit_current_turn' && !r.text.includes('You said:'));
ok('historical basis stays out of visible transcript replay',!r.text.includes(evidence[0].text) && !r.text.includes(evidence[1].text) && !r.text.includes(evidence[2].text));
ok('historical basis remains fully traceable on synthesis',r.trace.synthesis[0].basisEvidenceIds.join(',')==='E1,E2,E3,E4');
ok('synthesis remains provisional',r.trace.synthesis[0].standing==='maia_provisional');
ok('basis remains lineage not entailment',r.trace.synthesis[0].basisSemantics==='lineage_not_entailment');
ok('question remains conditionally framed',r.text.includes('If that possibility is worth testing rather than assuming'));
refuses('system inference cannot be bound as current member turn',()=>renderCurrentTurnBasisEnvelope(evidence,raw,'M1'),'current_turn_requires_member_evidence');
refuses('missing current evidence fails closed',()=>renderCurrentTurnBasisEnvelope(evidence,raw,'NOPE'),'unknown_evidence');
refuses('synthesis without basis fails closed',()=>renderCurrentTurnBasisEnvelope(evidence,{synthesis:[{text:'a thought',basisEvidenceIds:[]}],question:null},'E4'),'synthesis_requires_basis');
console.log(JSON.stringify({programme:'FREE-SYNTHESIS-STRUCTURAL-STANDING-01',act:'ACT 7 current-turn basis proof',status:'PASS',assertions:passed,rendered:r},null,2));
