import { strict as assert } from 'node:assert';
import { renderNarrativeGestalt, renderRelationalGestalt } from './a4-context-renderers';
import { SILVER_CEDAR_POSITIVE_GESTALT_ID, silverCedarField } from './a4-silver-cedar-trace';

const narrative = renderNarrativeGestalt(silverCedarField, SILVER_CEDAR_POSITIVE_GESTALT_ID);
const relational = renderRelationalGestalt(silverCedarField, SILVER_CEDAR_POSITIVE_GESTALT_ID);

assert.deepEqual(narrative.evidenceIds, relational.evidenceIds);
assert.equal(narrative.evidenceDigest, relational.evidenceDigest);
assert.equal(narrative.evidenceIds.length, 14);
assert.match(narrative.text, /PROVISIONAL \/ MAIA-AUTHORED/);
assert.match(relational.text, /PROVISIONAL \/ MAIA-AUTHORED/);
assert.doesNotMatch(narrative.text, /Current shift/i);
assert.doesNotMatch(relational.text, /Current shift/i);
assert.match(narrative.text, /author=member/);
assert.match(narrative.text, /author=maia/);
assert.match(relational.text, /author=member/);
assert.match(relational.text, /author=maia/);

console.log(JSON.stringify({
  proof: 'JARVIS-MAIA-FREE-SYNTHESIS-01 A4 representation identity',
  status: 'PASS',
  sameEvidenceMembership: true,
  sameEvidenceDigest: narrative.evidenceDigest,
  evidenceRoots: narrative.evidenceIds.length,
  narrativeChars: narrative.chars,
  relationalChars: relational.chars,
  relationalOverNarrativeRatio: Number((relational.chars / narrative.chars).toFixed(3)),
  hiddenEvidenceSelectionDifference: false,
}, null, 2));
