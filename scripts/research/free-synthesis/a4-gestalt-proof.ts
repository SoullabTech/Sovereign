import { strict as assert } from 'node:assert';
import {
  compareGestaltEvidenceRoots,
  tracePrimaryEvidence,
  validateResearchField,
  type GestaltResearchField,
  type ResearchNode,
} from './a4-gestalt-prototype';

/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A4 proof
 *
 * Synthetic only. This file is a mechanical proof of representation laws, not an
 * Alive-MAIA exemplar and not evidence about member phenomenology.
 */

const baseNodes: ResearchNode[] = [
  {
    kind: 'evidence',
    id: 'e1',
    sourceRef: 'synthetic:turn-1',
    occurredAt: '2026-09-16T12:00:00Z',
    authoredBy: 'member',
    standing: 'self_report',
    admissibility: 'synthetic research fixture',
    content: 'A recurring image has been on my mind again.',
  },
  {
    kind: 'evidence',
    id: 'e2',
    sourceRef: 'synthetic:turn-2',
    occurredAt: '2026-09-16T12:01:00Z',
    authoredBy: 'member',
    standing: 'self_report',
    admissibility: 'synthetic research fixture',
    content: 'It feels less like a symbol to solve and more like a way of slowing down.',
  },
  {
    kind: 'evidence',
    id: 'e3',
    sourceRef: 'synthetic:turn-3',
    occurredAt: '2026-09-16T12:02:00Z',
    authoredBy: 'maia',
    standing: 'authored',
    admissibility: 'synthetic research fixture',
    content: 'The image seems to have shifted from an object of interpretation into a lived orientation.',
  },
  {
    kind: 'observation',
    id: 'o1',
    claim: 'The member links the recurring image with slowing down rather than explanation.',
    evidenceIds: ['e1', 'e2'],
    provisional: true,
  },
  {
    kind: 'observation',
    id: 'o2',
    claim: 'MAIA reflects a change in how the image functions in the conversation.',
    evidenceIds: ['e3'],
    provisional: true,
  },
  {
    kind: 'relation',
    id: 'r1',
    relation: 'develops',
    fromId: 'o1',
    toId: 'o2',
    claim: 'The later reflection develops the member-authored shift rather than replacing it.',
    provisional: true,
  },
  {
    kind: 'configuration',
    id: 'c1',
    label: 'image-as-orientation',
    claim: 'The exchange organizes the image around lived pacing rather than symbolic decoding.',
    memberIds: ['o1', 'o2', 'r1'],
    provisional: true,
  },
  {
    kind: 'gestalt',
    id: 'g1',
    asOf: '2026-09-16T12:02:30Z',
    claim: 'Current projection: the recurring image is functioning as an orientation toward slower, lived contact.',
    supportIds: ['c1'],
    provisional: true,
  },
];

const baseField: GestaltResearchField = { version: 'A4.v0', nodes: baseNodes };
const baseValidation = validateResearchField(baseField);
assert.equal(baseValidation.ok, true, JSON.stringify(baseValidation.issues, null, 2));
assert.deepEqual(
  tracePrimaryEvidence(baseField, 'g1').map((node) => node.id).sort(),
  ['e1', 'e2', 'e3'],
);

// FS-F6 shape: new authoritative evidence can reorganize the present projection.
const reversalNodes: ResearchNode[] = [
  ...baseNodes,
  {
    kind: 'evidence',
    id: 'e4',
    sourceRef: 'synthetic:turn-4',
    occurredAt: '2026-09-16T12:03:00Z',
    authoredBy: 'member',
    standing: 'self_report',
    admissibility: 'synthetic research fixture',
    content: 'Actually, right now the image feels energizing rather than slowing. I want to move.',
  },
  {
    kind: 'observation',
    id: 'o3',
    claim: 'The member explicitly revises the current meaning and names movement rather than slowing.',
    evidenceIds: ['e4'],
    provisional: true,
  },
  {
    kind: 'relation',
    id: 'r2',
    relation: 'corrects',
    fromId: 'o3',
    toId: 'o1',
    claim: 'The present self-report corrects the earlier orientation as a description of the current moment.',
    provisional: true,
  },
  {
    kind: 'temporal_change',
    id: 't1',
    change: 'reorganized',
    claim: 'The live organization changes from slowing toward movement after the member correction.',
    beforeIds: ['c1'],
    afterIds: ['o3', 'r2'],
    evidenceIds: ['e4'],
    provisional: true,
  },
  {
    kind: 'gestalt',
    id: 'g2',
    asOf: '2026-09-16T12:03:30Z',
    claim: 'Current projection: the image is now organizing toward movement, while the earlier slowing orientation remains historical rather than governing.',
    supportIds: ['t1', 'o3'],
    supersedesGestaltIds: ['g1'],
    provisional: true,
  },
];

const reversalField: GestaltResearchField = { version: 'A4.v0', nodes: reversalNodes };
const reversalValidation = validateResearchField(reversalField);
assert.equal(reversalValidation.ok, true, JSON.stringify(reversalValidation.issues, null, 2));

const roots = compareGestaltEvidenceRoots(reversalField, 'g1', 'g2');
assert.deepEqual(roots.added, ['e4']);
assert.deepEqual(roots.dropped.sort(), ['e1', 'e2', 'e3']);

// A prior Gestalt may be superseded, but it may never become evidence for the next Gestalt.
const bootstrappedField: GestaltResearchField = {
  version: 'A4.v0',
  nodes: [
    ...reversalNodes,
    {
      kind: 'gestalt',
      id: 'g3',
      asOf: '2026-09-16T12:04:00Z',
      claim: 'Invalid projection that bootstraps from a prior projection.',
      supportIds: ['g2'],
      supersedesGestaltIds: ['g2'],
      provisional: true,
    },
  ],
};
const bootstrapValidation = validateResearchField(bootstrappedField);
assert.equal(bootstrapValidation.ok, false);
assert.equal(
  bootstrapValidation.issues.some((issue) => issue.code === 'gestalt_as_evidence' && issue.nodeId === 'g3'),
  true,
);

// Stage inversion is refused: an observation must descend directly to primary evidence.
const invertedField: GestaltResearchField = {
  version: 'A4.v0',
  nodes: [
    ...baseNodes,
    {
      kind: 'observation',
      id: 'o-invalid',
      claim: 'Invalid observation grounded in another observation rather than source evidence.',
      evidenceIds: ['o1'],
      provisional: true,
    },
  ],
};
const invertedValidation = validateResearchField(invertedField);
assert.equal(invertedValidation.ok, false);
assert.equal(
  invertedValidation.issues.some(
    (issue) => issue.code === 'non_reversible_stage_order' && issue.nodeId === 'o-invalid',
  ),
  true,
);

console.log(
  JSON.stringify(
    {
      proof: 'JARVIS-MAIA-FREE-SYNTHESIS-01 A4',
      status: 'PASS',
      validBase: baseValidation.ok,
      validReversal: reversalValidation.ok,
      reversalEvidenceRoots: roots,
      refusedGestaltBootstrap: true,
      refusedStageInversion: true,
    },
    null,
    2,
  ),
);
