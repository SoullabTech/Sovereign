import { createHash } from 'node:crypto';
import { strict as assert } from 'node:assert';
import {
  assertEvidenceIdentical,
  renderCompactNarrativeContext,
  renderRelationalStructureContext,
} from './a4-context-renderers';
import { SILVER_CEDAR_POSITIVE_GESTALT_ID, silverCedarField } from './a4-silver-cedar-trace';

const narrative = renderCompactNarrativeContext(silverCedarField, SILVER_CEDAR_POSITIVE_GESTALT_ID);
const relational = renderRelationalStructureContext(silverCedarField, SILVER_CEDAR_POSITIVE_GESTALT_ID);

assert.doesNotThrow(() => assertEvidenceIdentical(narrative, relational));
assert.deepEqual(narrative.evidenceRootIds, relational.evidenceRootIds);
assert.equal(narrative.evidenceLedger, relational.evidenceLedger);
assert.equal(narrative.evidenceRootIds.length, 14);
assert.match(narrative.text, /DERIVED · PROVISIONAL · REVISABLE · NOT PRIMARY EVIDENCE/);
assert.match(relational.text, /DERIVED · PROVISIONAL · REVISABLE · NOT PRIMARY EVIDENCE/);
assert.doesNotMatch(narrative.text, /Current shift/i);
assert.doesNotMatch(relational.text, /Current shift/i);
assert.match(narrative.evidenceLedger, /standing=member\/self_report/);
assert.match(narrative.evidenceLedger, /standing=maia\/authored/);
assert.match(relational.text, /REL sc-r-1 \[develops; provisional\]/);
assert.equal(narrative.text.includes('REL sc-r-1'), false);

const digest = createHash('sha256').update(narrative.evidenceLedger).digest('hex');
const corrupted = { ...relational, evidenceLedger: `${relational.evidenceLedger}\nEXTRA EVIDENCE` };
assert.throws(() => assertEvidenceIdentical(narrative, corrupted), /byte-identical evidence ledger/);

console.log(JSON.stringify({
  proof: 'JARVIS-MAIA-FREE-SYNTHESIS-01 A4 real-source representation identity',
  status: 'PASS',
  sameEvidenceMembership: true,
  sameEvidenceDigest: digest,
  evidenceRoots: narrative.evidenceRootIds.length,
  narrativeChars: narrative.charCount,
  relationalChars: relational.charCount,
  relationalOverNarrativeRatio: Number((relational.charCount / narrative.charCount).toFixed(3)),
  targetSupportClosureOnly: true,
  corruptedLedgerRefused: true,
  hiddenEvidenceSelectionDifference: false,
}, null, 2));
