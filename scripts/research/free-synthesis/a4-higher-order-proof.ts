import { strict as assert } from 'node:assert';
import {
  tracePrimaryEvidence,
  validateResearchField,
  type GestaltResearchField,
  type ResearchNode,
} from './a4-gestalt-prototype';

/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A4 higher-order configuration proof.
 *
 * Synthetic only. Tests whether the canonical ConfigurationNode can carry a meaning
 * that depends on THREE independently grounded relations without adding a hyperedge
 * primitive or another ontology.
 */

const nodes: ResearchNode[] = [
  // Dimension 1 — values / way of being
  {
    kind: 'evidence', id: 'e-v1', sourceRef: 'synthetic:values:1', occurredAt: '2026-09-16T15:00:00Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'I want to live with more presence and less performance.',
  },
  {
    kind: 'evidence', id: 'e-v2', sourceRef: 'synthetic:values:2', occurredAt: '2026-09-16T15:00:01Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'This work asks me to be present rather than perform.',
  },
  { kind: 'observation', id: 'o-v1', claim: 'The member values presence over performance.', evidenceIds: ['e-v1'], provisional: true },
  { kind: 'observation', id: 'o-v2', claim: 'The member experiences the work as requiring presence rather than performance.', evidenceIds: ['e-v2'], provisional: true },
  {
    kind: 'relation', id: 'r-values', relation: 'echoes', fromId: 'o-v1', toId: 'o-v2',
    claim: 'The way the work is experienced echoes the member’s stated way-of-being value.', provisional: true,
  },

  // Dimension 2 — embodied state
  {
    kind: 'evidence', id: 'e-b1', sourceRef: 'synthetic:body:1', occurredAt: '2026-09-16T15:00:02Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'My body settles when I enter the work.',
  },
  {
    kind: 'evidence', id: 'e-b2', sourceRef: 'synthetic:body:2', occurredAt: '2026-09-16T15:00:03Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'I leave the work feeling more coherent rather than depleted.',
  },
  { kind: 'observation', id: 'o-b1', claim: 'The member reports bodily settling during the work.', evidenceIds: ['e-b1'], provisional: true },
  { kind: 'observation', id: 'o-b2', claim: 'The member reports increased coherence after the work.', evidenceIds: ['e-b2'], provisional: true },
  {
    kind: 'relation', id: 'r-body', relation: 'develops', fromId: 'o-b1', toId: 'o-b2',
    claim: 'The embodied experience develops from settling into reported coherence.', provisional: true,
  },

  // Dimension 3 — temporal / life trajectory
  {
    kind: 'evidence', id: 'e-t1', sourceRef: 'synthetic:time:1', occurredAt: '2026-09-16T15:00:04Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'I have been looking for this quality of engagement for decades.',
  },
  {
    kind: 'evidence', id: 'e-t2', sourceRef: 'synthetic:time:2', occurredAt: '2026-09-16T15:00:05Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'This feels connected with what those earlier years were moving toward.',
  },
  { kind: 'observation', id: 'o-t1', claim: 'The member names a decades-long search for this quality of engagement.', evidenceIds: ['e-t1'], provisional: true },
  { kind: 'observation', id: 'o-t2', claim: 'The member links the present work with that earlier trajectory.', evidenceIds: ['e-t2'], provisional: true },
  {
    kind: 'relation', id: 'r-time', relation: 'develops', fromId: 'o-t1', toId: 'o-t2',
    claim: 'The present work is situated by the member within a longer developmental trajectory.', provisional: true,
  },

  // The higher-order meaning belongs to the organization of all THREE relations.
  {
    kind: 'configuration', id: 'c-convergence', label: 'three-dimensional convergence',
    claim: 'A possible convergence is present across way-of-being, embodied experience, and life trajectory. No one dimension is promoted as sufficient proof of the whole.',
    memberIds: ['r-values', 'r-body', 'r-time'], provisional: true,
  },
  {
    kind: 'gestalt', id: 'g-convergence', asOf: '2026-09-16T15:00:06Z',
    claim: 'Current projection: the work may be functioning as a convergence point because three independently evidenced dimensions align — values, embodied coherence, and developmental trajectory.',
    supportIds: ['c-convergence'], provisional: true,
  },
];

const full: GestaltResearchField = { version: 'A4.v0', nodes };
const validation = validateResearchField(full);
assert.equal(validation.ok, true, JSON.stringify(validation.issues, null, 2));

const roots = tracePrimaryEvidence(full, 'g-convergence').map((node) => node.id).sort();
assert.deepEqual(roots, ['e-b1', 'e-b2', 'e-t1', 'e-t2', 'e-v1', 'e-v2']);

// Each relation is independently reversible and carries only its own evidence dimension.
const relationRoots = Object.fromEntries(
  ['r-values', 'r-body', 'r-time'].map((id) => [
    id,
    tracePrimaryEvidence(full, id).map((node) => node.id).sort(),
  ]),
);
assert.deepEqual(relationRoots['r-values'], ['e-v1', 'e-v2']);
assert.deepEqual(relationRoots['r-body'], ['e-b1', 'e-b2']);
assert.deepEqual(relationRoots['r-time'], ['e-t1', 'e-t2']);

// No single relation contains the configuration's full evidence field.
for (const ids of Object.values(relationRoots)) assert.notDeepEqual(ids, roots);

// Removing any relation removes its independently grounded dimension from the configuration.
for (const omitted of ['r-values', 'r-body', 'r-time']) {
  const reducedNodes = nodes
    .filter((node) => node.id !== 'c-convergence' && node.id !== 'g-convergence')
    .concat([
      {
        kind: 'configuration' as const,
        id: `c-without-${omitted}`,
        label: `configuration without ${omitted}`,
        claim: 'Reduced comparison configuration.',
        memberIds: ['r-values', 'r-body', 'r-time'].filter((id) => id !== omitted),
        provisional: true as const,
      },
      {
        kind: 'gestalt' as const,
        id: `g-without-${omitted}`,
        asOf: '2026-09-16T15:00:07Z',
        claim: 'Reduced comparison projection.',
        supportIds: [`c-without-${omitted}`],
        provisional: true as const,
      },
    ]);
  const reduced: GestaltResearchField = { version: 'A4.v0', nodes: reducedNodes };
  const reducedValidation = validateResearchField(reduced);
  assert.equal(reducedValidation.ok, true, `${omitted}: ${JSON.stringify(reducedValidation.issues, null, 2)}`);
  const reducedRoots = tracePrimaryEvidence(reduced, `g-without-${omitted}`).map((node) => node.id).sort();
  assert(reducedRoots.length < roots.length, `${omitted} did not reduce evidence descent`);
}

console.log(JSON.stringify({
  proof: 'JARVIS-MAIA-FREE-SYNTHESIS-01 A4 higher-order configuration',
  status: 'PASS',
  configurationMembers: ['r-values', 'r-body', 'r-time'],
  configurationEvidenceRoots: roots,
  independentlyReversibleRelations: relationRoots,
  higherOrderCarrier: 'ConfigurationNode.memberIds',
  hyperedgePrimitiveRequiredByThisFalsifier: false,
}, null, 2));
