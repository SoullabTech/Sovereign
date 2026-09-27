import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTemporalContextEnvelope, validateTemporalContextEnvelope, type TemporalContextItem } from '../../lib/becoming/temporalContext';

const prior: TemporalContextItem = {
  source: { facet: 'journal', objectType: 'entry', objectId: 'journal-1', revision: 2 },
  authoredBy: 'member',
  epistemicKind: 'remembered_experience',
  timeRelation: 'has_been',
  memberSelected: true,
  contextScope: 'this_conversation',
  text: 'I remember agreeing before I checked what I wanted.',
};

const present: TemporalContextItem = {
  source: { facet: 'becoming', objectType: 'present_reflection', objectId: 'present-1' },
  authoredBy: 'member',
  epistemicKind: 'present_self_report',
  timeRelation: 'is_being',
  memberSelected: true,
  contextScope: 'this_conversation',
  text: 'I notice I want more spaciousness now.',
};

const possible: TemporalContextItem = {
  source: { facet: 'becoming', objectType: 'future_possibility', objectId: 'future-1', revision: 1 },
  authoredBy: 'member',
  epistemicKind: 'imagined_possibility',
  timeRelation: 'is_becoming',
  memberSelected: true,
  contextScope: 'this_conversation',
  text: 'I imagine contributing without constant availability.',
};
test('selected past, present, and possible future can coexist without flattening source kinds', () => {
  const envelope=makeTemporalContextEnvelope([prior,present,possible]);
  assert.deepEqual(envelope.items.map(item=>item.timeRelation),['has_been','is_being','is_becoming']);
  assert.deepEqual(envelope.items.map(item=>item.epistemicKind),['remembered_experience','present_self_report','imagined_possibility']);
  assert.equal(envelope.durableInterpretationAuthorized,false);
  assert.equal(envelope.receivingObjectAuthorized,false);
});

test('unselected context is refused', () => {
  const item:any={...prior,memberSelected:false};
  assert.throws(()=>makeTemporalContextEnvelope([item]),/CONTEXT_NOT_MEMBER_SELECTED/);
});

test('imagined possibility cannot be relabeled as past or present fact', () => {
  const item:any={...possible,timeRelation:'has_been'};
  assert.throws(()=>makeTemporalContextEnvelope([item]),/IMAGINED_MUST_REMAIN_BECOMING/);
});

test('MAIA-authored material can enter only as hypothesis', () => {
  const valid:TemporalContextItem={...present,source:{facet:'becoming',objectType:'maia_reflection',objectId:'hypothesis-1'},authoredBy:'maia',epistemicKind:'maia_hypothesis'};
  validateTemporalContextEnvelope(makeTemporalContextEnvelope([valid]));
  const invalid:any={...valid,epistemicKind:'present_self_report'};
  assert.throws(()=>makeTemporalContextEnvelope([invalid]),/MAIA_AUTHORSHIP_MUST_REMAIN_HYPOTHESIS/);
});

test('context never silently authorizes memory or receiver creation', () => {
  const envelope:any=makeTemporalContextEnvelope([prior,present,possible]);
  envelope.durableInterpretationAuthorized=true;
  assert.throws(()=>validateTemporalContextEnvelope(envelope),/DURABLE_INTERPRETATION_NOT_AUTHORIZED/);
  envelope.durableInterpretationAuthorized=false;
  envelope.receivingObjectAuthorized=true;
  assert.throws(()=>validateTemporalContextEnvelope(envelope),/RECEIVING_OBJECT_NOT_AUTHORIZED/);
});
