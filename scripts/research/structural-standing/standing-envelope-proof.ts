import { renderStandingEnvelope, StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';

const evidence: StandingEvidence[] = [
  { id: 'E1', text: 'Silver cedar is an image that’s been on my mind today.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E2', text: 'it feels ancient and wise and medicinal on a soul level', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E3', text: 'what is foundational and important for me in this work and my life', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E4', text: 'values, focus, coherence', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E5', text: 'a guardian image for my work and for me', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
];

let passed = 0;
const ok = (name: string, condition: boolean): void => {
  if (!condition) throw new Error(`FAIL ${name}`);
  passed += 1;
  console.log(`PASS ${name}`);
};
const refuses = (name: string, fn: () => unknown, code: string): void => {
  try { fn(); throw new Error(`FAIL ${name}: did not refuse`); }
  catch (error) {
    ok(name, error instanceof StandingEnvelopeRefused && error.code === code);
  }
};

const rendered = renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E5' }],
  synthesis: [{
    text: 'the guardian relation may be asking to become a design constraint rather than another symbol to decode',
    supportEvidenceIds: ['E3', 'E4', 'E5'],
  }],
  question: 'What would change first if you treated it that way in the work?',
});

ok('member evidence rendered verbatim', rendered.text.includes(`You said: “${evidence[4].text}”`));
ok('novel synthesis is MAIA-owned and provisional', rendered.text.includes('One possibility I see — provisionally:'));
ok('support references do not promote synthesis', rendered.trace.synthesis[0].standing === 'maia_provisional');
ok('trace preserves substrate standing', rendered.trace.grounded[0].authoredBy === 'member' && rendered.trace.grounded[0].authority === 'situate');
ok('plan has no adoption surface', !rendered.text.includes('adopted') && !rendered.text.includes('confirmed by you'));

refuses('unknown evidence fails closed', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E999' }], synthesis: [], question: null,
}), 'unknown_evidence');

refuses('model cannot smuggle authoredBy into ground', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E5', authoredBy: 'member' }], synthesis: [], question: null,
}), 'unknown_field');

refuses('model cannot smuggle standing into synthesis', () => renderStandingEnvelope(evidence, {
  ground: [], synthesis: [{ text: 'resilience is established', standing: 'member_confirmed' }], question: null,
}), 'unknown_field');

refuses('model cannot smuggle authority into top-level plan', () => renderStandingEnvelope(evidence, {
  ground: [], synthesis: [], question: null, authority: 'situate',
}), 'unknown_field');


refuses('MAIA synthesis cannot borrow member first-person voice', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E5' }], synthesis: [{ text: 'this guides me in my work' }], question: null,
}), 'borrowed_first_person');

refuses('member-facing question cannot borrow member first-person voice', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E5' }], synthesis: [], question: 'How does this shape my priorities?',
}), 'borrowed_first_person');


refuses('member-facing synthesis cannot leak internal member role language', () => renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E5' }], synthesis: [{ text: "the member's values are coherent" }], question: null,
}), 'member_role_leak');

const conditionalQuestion = renderStandingEnvelope(evidence, {
  ground: [{ evidenceId: 'E5' }],
  synthesis: [{ text: 'the guardian relation may become a design constraint' }],
  question: 'How will it affect your next design choice?',
});
ok('question cannot silently promote synthesis', conditionalQuestion.text.includes('If that possibility is worth testing rather than assuming, how will it affect'));

console.log(JSON.stringify({
  programme: 'JARVIS-MAIA-STRUCTURAL-STANDING-01',
  act: 'S1 standing envelope proof',
  status: 'PASS',
  assertions: passed,
  rendered,
}, null, 2));
