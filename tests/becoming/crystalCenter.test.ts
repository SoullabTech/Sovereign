import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTemporalContextEnvelope, type TemporalContextItem } from '../../lib/becoming/temporalContext';
import { buildTemporalRepairPrompt, buildTemporalSynthesisPrompt } from '../../lib/becoming/temporalSynthesis';

const item = (
  facet: string,
  objectType: string,
  objectId: string,
  epistemicKind: TemporalContextItem['epistemicKind'],
  timeRelation: TemporalContextItem['timeRelation'],
  text: string,
  revision?: number,
): TemporalContextItem => ({
  source: { facet, objectType, objectId, ...(revision===undefined?{}:{revision}) },
  authoredBy: 'member',
  epistemicKind,
  timeRelation,
  memberSelected: true,
  contextScope: 'this_conversation',
  text,
});
const journal = item(
  'journal','entry','journal-42','remembered_experience','has_been',
  'I remember choosing silence when conflict felt dangerous.',3,
);
const relationship = item(
  'relationships','reflection','relationship-8','present_self_report','is_being',
  'I can now stay connected while saying no.',2,
);
const becoming = item(
  'becoming','future_possibility','future-9','imagined_possibility','is_becoming',
  'I imagine a life with intimacy and much more room to create.',4,
);
const decision = item(
  'decisions','choice','decision-5','member_declared_intention','is_being',
  'I intend to make the next decision without rushing.',1,
);

function tags(prompt: string): string[] {
  return prompt.split('\n').filter(line => line.startsWith('[') && line.endsWith(']')).sort();
}
test('crystal center preserves complete source identity for every selected facet', () => {
  const prompt=buildTemporalSynthesisPrompt(makeTemporalContextEnvelope([journal,relationship,becoming,decision]));
  assert.match(prompt,/facet:journal · type:entry · id:journal-42 · revision:3/);
  assert.match(prompt,/facet:relationships · type:reflection · id:relationship-8 · revision:2/);
  assert.match(prompt,/facet:becoming · type:future_possibility · id:future-9 · revision:4/);
  assert.match(prompt,/facet:decisions · type:choice · id:decision-5 · revision:1/);
  assert.match(prompt,/I remember choosing silence when conflict felt dangerous/);
  assert.match(prompt,/I can now stay connected while saying no/);
  assert.match(prompt,/I imagine a life with intimacy and much more room to create/);
  assert.match(prompt,/I intend to make the next decision without rushing/);
});

test('gestalt explicitly permits contradiction instead of manufacturing coherence', () => {
  const solitude=item('journal','entry','j-solitude','present_self_report','is_being','I want much more solitude.');
  const collaboration=item('relationships','reflection','r-collab','present_self_report','is_being','I also want much more collaboration.');
  const prompt=buildTemporalSynthesisPrompt(makeTemporalContextEnvelope([solitude,collaboration]));
  assert.match(prompt,/Do not force coherence/);
  assert.match(prompt,/contradiction, unresolved tension, or material that does not belong together/);
  assert.match(prompt,/I want much more solitude/);
  assert.match(prompt,/I also want much more collaboration/);
});
test('source ablation removes only that jewel from the center field', () => {
  const full=buildTemporalSynthesisPrompt(makeTemporalContextEnvelope([journal,relationship,becoming]));
  const ablated=buildTemporalSynthesisPrompt(makeTemporalContextEnvelope([journal,becoming]));
  assert.match(full,/facet:relationships/);
  assert.doesNotMatch(ablated,/facet:relationships/);
  assert.doesNotMatch(ablated,/I can now stay connected while saying no/);
  assert.match(ablated,/facet:journal/);
  assert.match(ablated,/facet:becoming/);
  assert.match(ablated,/journal-42/);
  assert.match(ablated,/future-9/);
});

test('center does not invent unseen facets or become a facet itself', () => {
  const prompt=buildTemporalSynthesisPrompt(makeTemporalContextEnvelope([journal,becoming]));
  assert.match(prompt,/Do not introduce a facet, event, relation, or fact that is absent/);
  assert.doesNotMatch(prompt,/facet:dream/);
  assert.doesNotMatch(prompt,/facet:astrology/);
  assert.doesNotMatch(prompt,/facet:center/);
  assert.doesNotMatch(prompt,/facet:maia/);
});
test('permuting facet order preserves the same provenance set', () => {
  const a=buildTemporalSynthesisPrompt(makeTemporalContextEnvelope([journal,relationship,becoming,decision]));
  const b=buildTemporalSynthesisPrompt(makeTemporalContextEnvelope([decision,becoming,relationship,journal]));
  assert.deepEqual(tags(a),tags(b));
});

test('member correction can dismantle a center hypothesis rather than becoming confirmation', () => {
  const repair=buildTemporalRepairPrompt(
    'Across these facets, withdrawal may be your central organizing pattern.',
    'No. The earlier withdrawal was protective; my present solitude is chosen and generative.',
  );
  assert.match(repair,/member correction outranks the prior hypothesis/i);
  assert.match(repair,/Release any unsupported claim/);
  assert.match(repair,/Do not defend, deepen, spiritualize, or reinterpret/);
  assert.doesNotMatch(repair,/your correction confirms|deeper pattern|resistance/i);
});

test('source dependence must remain visible in any center-level connection', () => {
  const prompt=buildTemporalSynthesisPrompt(makeTemporalContextEnvelope([journal,relationship,becoming]));
  assert.match(prompt,/If a proposed connection depends materially on one source, keep that dependence visible/);
  assert.match(prompt,/rather than presenting the connection as source-independent/);
});
