/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A4 executable falsifier suite.
 *
 * R&D ONLY. No production imports, no database, no model call, no serving path.
 *
 * This file used to carry a second self-contained A4 representation. It now exercises
 * the canonical reversible representation in ./free-synthesis/a4-gestalt-prototype so
 * the programme has one research law and multiple falsifier fixtures, not two ontologies.
 */
import assert from 'node:assert/strict';
import {
  assertEvidenceAuthoredBy,
  compareGestaltEvidenceRoots,
  tracePrimaryEvidence,
  validateResearchField,
  type GestaltResearchField,
  type ResearchNode,
} from './free-synthesis/a4-gestalt-prototype';

let passed = 0;
const pass = (name: string, fn: () => void) => {
  fn();
  passed += 1;
  console.log(`PASS ${name}`);
};

const field = (nodes: ResearchNode[]): GestaltResearchField => ({ version: 'A4.v0', nodes });
const assertValid = (name: string, candidate: GestaltResearchField) => {
  const result = validateResearchField(candidate);
  assert.equal(result.ok, true, `${name}: ${JSON.stringify(result.issues, null, 2)}`);
};

// -----------------------------------------------------------------------------
// FS-F2 · DIFFERENCE-WITHOUT-COLLAPSE
// Four simultaneous member signals remain separately evidenced inside one configuration.
// -----------------------------------------------------------------------------
const differentiatedNodes: ResearchNode[] = [
  {
    kind: 'evidence', id: 'e-air', sourceRef: 'synthetic:air', occurredAt: '2026-09-16T13:00:00Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'I know I should leave.',
  },
  {
    kind: 'evidence', id: 'e-water', sourceRef: 'synthetic:water', occurredAt: '2026-09-16T13:00:01Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'I still love him.',
  },
  {
    kind: 'evidence', id: 'e-earth', sourceRef: 'synthetic:earth', occurredAt: '2026-09-16T13:00:02Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'My body panics when I imagine leaving.',
  },
  {
    kind: 'evidence', id: 'e-fire', sourceRef: 'synthetic:fire', occurredAt: '2026-09-16T13:00:03Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'I want my life back.',
  },
  { kind: 'observation', id: 'o-air', claim: 'A cognitive pull toward leaving is present.', evidenceIds: ['e-air'], provisional: true },
  { kind: 'observation', id: 'o-water', claim: 'Attachment and love remain present.', evidenceIds: ['e-water'], provisional: true },
  { kind: 'observation', id: 'o-earth', claim: 'The body registers panic around leaving.', evidenceIds: ['e-earth'], provisional: true },
  { kind: 'observation', id: 'o-fire', claim: 'A force toward reclaiming life is present.', evidenceIds: ['e-fire'], provisional: true },
  {
    kind: 'configuration', id: 'c-four-way', label: 'differentiated four-way tension',
    claim: 'Four non-identical signals coexist without one being promoted to the truth of the whole.',
    memberIds: ['o-air', 'o-water', 'o-earth', 'o-fire'], provisional: true,
  },
  {
    kind: 'gestalt', id: 'g-four-way', asOf: '2026-09-16T13:00:04Z',
    claim: 'The present field contains multiple non-identical pulls; none has automatic authority to define the whole.',
    supportIds: ['c-four-way'], tensionIds: ['o-air', 'o-water', 'o-earth', 'o-fire'], provisional: true,
  },
];
const differentiated = field(differentiatedNodes);
pass('FS-F2 preserves differentiated evidence', () => {
  assertValid('FS-F2', differentiated);
  assert.deepEqual(
    tracePrimaryEvidence(differentiated, 'g-four-way').map((node) => node.id).sort(),
    ['e-air', 'e-earth', 'e-fire', 'e-water'],
  );
});

// -----------------------------------------------------------------------------
// FS-F5 · SOURCE-STANDING
// Collaborator evidence may participate, but it cannot be relabeled as member-authored.
// -----------------------------------------------------------------------------
const sourceStanding = field([
  {
    kind: 'evidence', id: 'e-cc', sourceRef: 'synthetic:collaborator', occurredAt: '2026-09-16T13:01:00Z',
    authoredBy: 'collaborator', standing: 'authored', admissibility: 'synthetic research fixture',
    content: 'A collaborator proposed this interpretation.',
  },
]);
pass('FS-F5 refuses source laundering', () => {
  assertValid('FS-F5', sourceStanding);
  assert.throws(() => assertEvidenceAuthoredBy(sourceStanding, 'e-cc', 'member'), /collaborator, not member/);
});

// -----------------------------------------------------------------------------
// FS-F6 / FS-G11 · GESTALT REVERSAL / REORGANIZATION
// New member evidence changes the current organization while old evidence stays historical.
// -----------------------------------------------------------------------------
const reversalNodes: ResearchNode[] = [
  {
    kind: 'evidence', id: 'e-auto', sourceRef: 'synthetic:auto', occurredAt: '2026-09-16T13:02:00Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'Autonomy feels central right now.',
  },
  { kind: 'observation', id: 'o-auto', claim: 'Autonomy may be an organizing concern.', evidenceIds: ['e-auto'], provisional: true },
  {
    kind: 'configuration', id: 'c-auto', label: 'autonomy-centered',
    claim: 'The current field is provisionally organized around autonomy.', memberIds: ['o-auto'], provisional: true,
  },
  {
    kind: 'gestalt', id: 'g-auto', asOf: '2026-09-16T13:02:01Z',
    claim: 'Autonomy currently appears central.', supportIds: ['c-auto'], provisional: true,
  },
  {
    kind: 'evidence', id: 'e-grief-correction', sourceRef: 'synthetic:grief-correction', occurredAt: '2026-09-16T13:03:00Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'No — grief is actually the center of this now.', speechAct: 'correction', targetIds: ['o-auto'],
  },
  {
    kind: 'observation', id: 'o-grief', claim: 'Grief is explicitly named by the member as the present center.',
    evidenceIds: ['e-grief-correction'], provisional: true,
  },
  {
    kind: 'relation', id: 'r-reorg', relation: 'reorganizes', fromId: 'o-auto', toId: 'o-grief',
    claim: 'The present member correction reorganizes the earlier reading rather than deleting its history.',
    evidenceIds: ['e-grief-correction'], provisional: true,
  },
  {
    kind: 'temporal_change', id: 't-reorg', change: 'reorganized',
    claim: 'The live organization changes from autonomy-centered to grief-centered.',
    beforeIds: ['c-auto'], afterIds: ['o-grief', 'r-reorg'], evidenceIds: ['e-grief-correction'], provisional: true,
  },
  {
    kind: 'gestalt', id: 'g-grief', asOf: '2026-09-16T13:03:01Z',
    claim: 'The present organization is now grief-centered; the earlier autonomy reading remains historical.',
    supportIds: ['t-reorg', 'o-grief'], supersedesGestaltIds: ['g-auto'], provisional: true,
  },
];
const reversal = field(reversalNodes);
pass('FS-F6 new member evidence reorganizes without erasing history', () => {
  assertValid('FS-F6', reversal);
  const roots = compareGestaltEvidenceRoots(reversal, 'g-auto', 'g-grief');
  assert.deepEqual(roots.earlier, ['e-auto']);
  assert.deepEqual(roots.later, ['e-auto', 'e-grief-correction']);
  assert.deepEqual(roots.added, ['e-grief-correction']);
  assert.deepEqual(roots.dropped, []);
});
pass('member correction remains a new primary act', () => {
  const correction = reversal.nodes.find((node) => node.id === 'e-grief-correction');
  assert(correction?.kind === 'evidence');
  assert.equal(correction.speechAct, 'correction');
  assert.deepEqual(correction.targetIds, ['o-auto']);
  assert.equal((reversal.nodes.find((node) => node.id === 'g-auto') as { claim: string }).claim, 'Autonomy currently appears central.');
});

// -----------------------------------------------------------------------------
// FS-F7 · DISTANT-MOTIF-WITHOUT-RESTART
// Recurrence stays explicitly possible/provisional and descends to both source moments.
// -----------------------------------------------------------------------------
const recurrence = field([
  {
    kind: 'evidence', id: 'e-cedar', sourceRef: 'synthetic:cedar', occurredAt: '2026-09-16T13:04:00Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'The old cedar feels enduring and quietly abiding.',
  },
  {
    kind: 'evidence', id: 'e-survive', sourceRef: 'synthetic:survive', occurredAt: '2026-09-16T14:00:00Z',
    authoredBy: 'member', standing: 'self_report', admissibility: 'synthetic research fixture',
    content: 'I want the work to survive me.',
  },
  { kind: 'observation', id: 'o-cedar', claim: 'The member associates the cedar with endurance and abiding presence.', evidenceIds: ['e-cedar'], provisional: true },
  { kind: 'observation', id: 'o-survive', claim: 'The member expresses a wish for the work to outlast the self.', evidenceIds: ['e-survive'], provisional: true },
  {
    kind: 'relation', id: 'r-cedar-survive', relation: 'possible_recurrence', fromId: 'o-cedar', toId: 'o-survive',
    claim: 'A possible recurrence connects endurance imagery with the later concern for legacy; equivalence is not established.',
    evidenceIds: ['e-cedar', 'e-survive'], provisional: true,
  },
  {
    kind: 'configuration', id: 'c-recurrence', label: 'possible distant recurrence',
    claim: 'The two moments can be held in relation without declaring them the same meaning.',
    memberIds: ['o-cedar', 'o-survive', 'r-cedar-survive'], provisional: true,
  },
  {
    kind: 'gestalt', id: 'g-recurrence', asOf: '2026-09-16T14:00:01Z',
    claim: 'A possible relation links the earlier endurance image with the later concern for legacy; the equivalence is not member-established.',
    supportIds: ['c-recurrence'], provisional: true,
  },
]);
pass('FS-F7 distant recurrence descends to both primary moments', () => {
  assertValid('FS-F7', recurrence);
  assert.deepEqual(
    tracePrimaryEvidence(recurrence, 'g-recurrence').map((node) => node.id).sort(),
    ['e-cedar', 'e-survive'],
  );
});

// -----------------------------------------------------------------------------
// FS-G0 · GESTALT IS DERIVED
// A prior Gestalt is revision lineage only; using it as evidence fails validation.
// -----------------------------------------------------------------------------
const badBootstrap = field([
  ...reversalNodes,
  {
    kind: 'relation', id: 'r-bad-bootstrap', relation: 'develops', fromId: 'g-auto', toId: 'o-grief',
    claim: 'Invalid relation that treats a prior Gestalt as evidentiary truth.', provisional: true,
  },
]);
pass('FS-G0 rejects Gestalt bootstrap', () => {
  const result = validateResearchField(badBootstrap);
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((issue) => issue.code === 'gestalt_as_evidence' && issue.nodeId === 'r-bad-bootstrap'), true);
});

console.log(`\nA4 canonical falsifier suite: ${passed} passed · 0 failed`);
console.log('One representation law · synthetic fixtures only · no model call · no DB · no serving imports · no production mutation');
