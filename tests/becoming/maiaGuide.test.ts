import test from 'node:test';
import assert from 'node:assert/strict';
import { buildJourneyGuidePrompt } from '../../lib/becoming/maiaGuide';
import { newSession } from '../../lib/becoming/core';

const sid='11111111-1111-4111-8111-111111111111';
const pid='22222222-2222-4222-8222-222222222222';
const now='2026-09-27T22:00:00.000Z';

test('guide envelope is current-journey-only and forbids ambient memory', () => {
  const s=newSession(sid,pid,now);
  s.arrival='I want to understand this possible future.';
  s.possibilities[0]!.encounter='I am in a quiet sunlit room.';
  s.possibilities[0]!.elemental!.fire='I feel creative energy moving freely.';
  const prompt=buildJourneyGuidePrompt({
    session:s,
    movement:'encounter',
    activePossibilityId:pid,
    element:'fire',
  });
  assert.match(prompt,/Use only the CURRENT JOURNEY MATERIAL/);
  assert.match(prompt,/Do not retrieve, mention, or infer from prior conversations, memories, profiles/);
  assert.match(prompt,/Offer exactly ONE brief invitation at a time/);
  assert.match(prompt,/Do not force Earth → Water → Air → Fire → Aether/);
  assert.match(prompt,/ACTIVE ELEMENT: FIRE/);
  assert.match(prompt,/I feel creative energy moving freely/);
  assert.match(prompt,/Never impersonate the future self/);
});

test('guide can follow emergence without assigning an element', () => {
  const s=newSession(sid,pid,now);
  s.arrival='Something is changing.';
  const prompt=buildJourneyGuidePrompt({
    session:s,
    movement:'arrive',
    activePossibilityId:pid,
    element:null,
  });
  assert.match(prompt,/ACTIVE ELEMENT: NONE — FOLLOW WHAT IS ARISING/);
  assert.match(prompt,/may gently notice an elemental doorway already present, but do not assign one as truth/);
});
test('aether is gathering, never revelation', () => {
  const s=newSession(sid,pid,now);
  s.possibilities[0]!.elemental!.earth='My body is settled.';
  s.possibilities[0]!.elemental!.aether='The whole scene feels coherent.';
  const prompt=buildJourneyGuidePrompt({
    session:s,
    movement:'encounter',
    activePossibilityId:pid,
    element:'aether',
    previousInvitation:'What becomes noticeable when you hold it together?',
  });
  assert.match(prompt,/Aether gathers the whole field/);
  assert.match(prompt,/never pronounces revelation, destiny, or objective truth/);
  assert.match(prompt,/YOUR PREVIOUS INVITATION IN THIS JOURNEY/);
  assert.match(prompt,/Offer a different or deeper single invitation rather than repeating it/);
});
