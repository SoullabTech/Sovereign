import { strict as assert } from 'node:assert';
import {
  assertEvidenceIdentical,
  renderCompactNarrativeContext,
  renderRelationalStructureContext,
} from './a4-context-renderers';
import { type GestaltResearchField } from './a4-gestalt-prototype';

/**
 * Mechanical fairness proof for A4 candidate contexts.
 * Synthetic fixture only; no model call and no claim about output quality.
 */

const field: GestaltResearchField = {
  version: 'A4.v0',
  nodes: [
    {
      kind: 'evidence', id: 'e-member-1', sourceRef: 'synthetic:1', sequence: 1,
      authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
      content: 'A recurring image feels ancient and enduring.',
    },
    {
      kind: 'evidence', id: 'e-member-2', sourceRef: 'synthetic:2', sequence: 2,
      authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
      content: 'It slows me down and brings a sense of presence.',
    },
    {
      kind: 'evidence', id: 'e-maia-1', sourceRef: 'synthetic:3', sequence: 3,
      authoredBy: 'maia', standing: 'authored', admissibility: 'synthetic research fixture',
      content: 'The image seems to be developing from a symbol into an orientation.',
    },
    {
      kind: 'observation', id: 'o-quality',
      claim: 'The member associates the image with age and endurance.',
      evidenceIds: ['e-member-1'], provisional: true,
    },
    {
      kind: 'observation', id: 'o-effect',
      claim: 'The member reports slowing and presence.',
      evidenceIds: ['e-member-2'], provisional: true,
    },
    {
      kind: 'observation', id: 'o-maia',
      claim: 'MAIA contributes a formulation of development from symbol to orientation.',
      evidenceIds: ['e-maia-1'], provisional: true,
    },
    {
      kind: 'relation', id: 'r-development', relation: 'develops',
      fromId: 'o-quality', toId: 'o-effect',
      claim: 'Member-described qualities develop into a reported experiential effect.',
      provisional: true,
    },
    {
      kind: 'relation', id: 'r-maia', relation: 'echoes',
      fromId: 'o-effect', toId: 'o-maia',
      claim: 'MAIA contributes a further formulation while source standing remains distinct.',
      provisional: true,
    },
    {
      kind: 'configuration', id: 'c-field', label: 'image-to-orientation',
      claim: 'The field contains member-described qualities/effect and a distinguishable MAIA contribution.',
      memberIds: ['o-quality', 'o-effect', 'o-maia', 'r-development', 'r-maia'], provisional: true,
    },
    {
      kind: 'gestalt', id: 'g-current', asOfSequence: 3,
      claim: 'Provisional projection: the image is developing into an orientation toward slower presence, with MAIA contribution kept source-distinct.',
      supportIds: ['c-field'], provisional: true,
    },
  ],
};

const narrative = renderCompactNarrativeContext(field, 'g-current');
const relational = renderRelationalStructureContext(field, 'g-current');

assert.doesNotThrow(() => assertEvidenceIdentical(narrative, relational));
assert.deepEqual(narrative.evidenceRootIds, ['e-member-1', 'e-member-2', 'e-maia-1']);
assert.deepEqual(relational.evidenceRootIds, narrative.evidenceRootIds);
assert.equal(relational.evidenceLedger, narrative.evidenceLedger);
assert.notEqual(relational.text, narrative.text);
assert.equal(narrative.evidenceLedger.includes('standing=member/self_report'), true);
assert.equal(narrative.evidenceLedger.includes('standing=maia/authored'), true);
assert.equal(relational.text.includes('REL r-development [develops; provisional]'), true);
assert.equal(narrative.text.includes('REL r-development'), false);

const corrupted = { ...relational, evidenceLedger: `${relational.evidenceLedger}\nEXTRA EVIDENCE` };
assert.throws(() => assertEvidenceIdentical(narrative, corrupted), /byte-identical evidence ledger/);

console.log(
  JSON.stringify(
    {
      proof: 'JARVIS-MAIA-FREE-SYNTHESIS-01 A4 evidence-identical renderers',
      status: 'PASS',
      evidenceRoots: narrative.evidenceRootIds,
      evidenceLedgerByteIdentical: true,
      narrativeChars: narrative.charCount,
      relationalChars: relational.charCount,
      candidateTextsDiffer: narrative.text !== relational.text,
      corruptedLedgerRefused: true,
      modelCalls: 0,
    },
    null,
    2,
  ),
);
