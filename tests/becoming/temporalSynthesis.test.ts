import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTemporalContextEnvelope } from '../../lib/becoming/temporalContext';
import { buildTemporalSynthesisPrompt, buildTemporalRepairPrompt } from '../../lib/becoming/temporalSynthesis';

const envelope=makeTemporalContextEnvelope([
  {
    source:{facet:'journal',objectType:'entry',objectId:'past-1',revision:1},
    authoredBy:'member',epistemicKind:'remembered_experience',timeRelation:'has_been',
    memberSelected:true,contextScope:'this_conversation',
    text:'I often said yes before checking what I wanted.',
  },
  {
    source:{facet:'becoming',objectType:'present_reflection',objectId:'now-1'},
    authoredBy:'member',epistemicKind:'present_self_report',timeRelation:'is_being',
    memberSelected:true,contextScope:'this_conversation',
    text:'Right now I want spaciousness, but some invitations are genuinely joyful.',
  },
  {
    source:{facet:'becoming',objectType:'future_possibility',objectId:'future-1',revision:1},
    authoredBy:'member',epistemicKind:'imagined_possibility',timeRelation:'is_becoming',
    memberSelected:true,contextScope:'this_conversation',
    text:'I imagine contributing without constant availability.',
  },
]);
test('temporal synthesis preserves temporal and epistemic distinctions in the prompt',()=>{
  const prompt=buildTemporalSynthesisPrompt(envelope);
  assert.match(prompt,/has_been · remembered_experience/);
  assert.match(prompt,/is_being · present_self_report/);
  assert.match(prompt,/is_becoming · imagined_possibility/);
  assert.match(prompt,/hypothesis, never as identity/);
  assert.match(prompt,/Counterevidence and member correction outrank/);
  assert.match(prompt,/Imagined future material remains imagined possibility/);
  assert.match(prompt,/Do not upgrade a member-described contrast into an established pattern/);
  assert.match(prompt,/rather than declaring an old pattern or saying an imagined future has become real/);
  assert.match(prompt,/do not say “the shift is real,” “you have changed,” or equivalent/);
  assert.match(prompt,/Do not relabel member-described behavior with interpretive psychological terms/);
  assert.match(prompt,/one relational gestalt without collapsing the facets/);
  assert.match(prompt,/center is a vantage of integration, not a new source of facts/);
  assert.match(prompt,/preserve every item’s source and epistemic distinction/);
});

test('synthesis explicitly refuses hidden persistence and inferred identity',()=>{
  const prompt=buildTemporalSynthesisPrompt(envelope);
  assert.match(prompt,/Do not infer a thread, memory, relationship profile, developmental score, or receiving-facet object/);
});

test('repair contract releases unsupported hypotheses instead of protecting them',()=>{
  const repair=buildTemporalRepairPrompt(
    'You may repeatedly confuse generosity with automatic availability.',
    'That was true years ago, but these invitations now feel chosen and joyful.',
  );
  assert.match(repair,/member correction outranks the prior hypothesis/i);
  assert.match(repair,/Do not defend, deepen, spiritualize, or reinterpret/);
  assert.match(repair,/Release any unsupported claim/);
  assert.doesNotMatch(repair,/resistance|defense mechanism|deeper truth/i);
});

test('repair preserves a possibility for narrower uncertainty without overriding the member',()=>{
  const repair=buildTemporalRepairPrompt('Broad pattern','Specific correction');
  assert.match(repair,/narrower hypothesis remains possible/);
  assert.match(repair,/only as optional/);
});
