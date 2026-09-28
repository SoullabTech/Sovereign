import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBecomingMaiaHandoff } from '../../lib/becoming/maiaHandoff';
import { newSession, recordReturn } from '../../lib/becoming/core';

const sid='11111111-1111-4111-8111-111111111111';
const pid='22222222-2222-4222-8222-222222222222';
const did='33333333-3333-4333-8333-333333333333';
const rid='44444444-4444-4444-8444-444444444444';
const t0='2026-09-27T20:00:00.000Z';
const t1='2026-09-27T20:20:00.000Z';

test('handoff carries the full journey without converting imaginal material into fact', () => {
  let s=newSession(sid,pid,t0);
  s.title='A spacious contribution';
  s.arrival='I want to explore contribution without constant availability.';
  s.possibilities[0]!.label='A spacious future';
  s.possibilities[0]!.encounter='An ordinary morning with room to walk.';
  s.possibilities[0]!.elemental!.earth='Cool floorboards and morning light.';
  s.possibilities[0]!.elemental!.water='Relief, and affection without urgency.';
  s.possibilities[0]!.elemental!.aether='Contribution can remain without constant availability.';
  s.possibilities[0]!.dialogue=[{id:did,perspective:'imagined_future',author:'member',kind:'imaginal_dialogue',text:'I stopped treating urgency as proof of care.'}];
  s.discernment.noticed='The spaciousness.';
  s.discernment.meaning='Contribution remained, but urgency did not.';
  s.returnNote='Pause before saying yes.';
  s.bridge.orientation='Available without being constantly available.';
  s.connection='Generosity and automatic availability may differ.';
  s.exception='Some invitations feel joyful.';
  s=recordReturn(s,t1,rid);

  const text=buildBecomingMaiaHandoff(s);
  assert.match(text,/Please do not ask me to repeat/);
  assert.match(text,/imaginal possibilities, not predictions/);
  assert.match(text,/Member, imagined future perspective:/);
  assert.match(text,/I stopped treating urgency as proof of care/);
  assert.match(text,/ELEMENTAL IMMERSION — MEMBER-AUTHORED/);
  assert.match(text,/EARTH:\nCool floorboards and morning light/);
  assert.match(text,/AETHER:\nContribution can remain without constant availability/);
  assert.match(text,/WHAT I BROUGHT BACK\nPause before saying yes/);
  assert.match(text,/Way of being: Available without being constantly available/);
  assert.match(text,/patterns.*hypotheses/i);
  assert.doesNotMatch(text,/your future self says/i);
});
