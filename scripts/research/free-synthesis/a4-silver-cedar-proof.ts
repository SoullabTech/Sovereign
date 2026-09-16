import { strict as assert } from 'node:assert';
import {
  assertEvidenceAuthoredBy,
  compareGestaltEvidenceRoots,
  tracePrimaryEvidence,
  validateResearchField,
  type GestaltResearchField,
  type PrimaryEvidenceNode,
  type ResearchNode,
} from './a4-gestalt-prototype';

/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A4 Silver Cedar proof
 * Founder-owned A2 benchmark only. No model call, DB access, or serving import.
 *
 * Purpose: prove that a co-created developmental arc can remain reversible without
 * laundering MAIA-authored formulations into member self-report, and that a later
 * availability rupture can be represented without erasing the earlier Gestalt.
 */

const E = (
  id: string,
  authoredBy: PrimaryEvidenceNode['authoredBy'],
  standing: PrimaryEvidenceNode['standing'],
  content: string,
  order: number,
): PrimaryEvidenceNode => ({
  kind: 'evidence', id,
  sourceRef: `A2:Silver-Cedar:source-order-${String(order).padStart(2, '0')}`,
  occurredAt: `source-order:${String(order).padStart(2, '0')}`,
  authoredBy, standing,
  admissibility: 'founder-owned A2 frozen benchmark',
  content,
});

const nodes: ResearchNode[] = [
  E('sc-m01', 'member', 'self_report', "Silver cedar is an image that's been on my mind today.", 1),
  E('sc-m02', 'member', 'self_report', 'The cedar is old, gnarled, silver, ancient and wise.', 2),
  E('sc-m03', 'member', 'self_report', 'Its wisdom and endurance contrast with a modern superficial world.', 3),
  E('sc-a01', 'maia', 'authored', "The silver cedar isn't just beautiful — it's a witness.", 4),
  E('sc-m04', 'member', 'self_report', 'It feels solid, slows and centers me, and brings gravitas.', 5),
  E('sc-m05', 'member', 'self_report', 'Even in conversation it has taken on symbolic sense around Nature’s abiding wisdom.', 6),
  E('sc-m06', 'member', 'self_report', 'It points me toward becoming more quiet, present and abiding.', 7),
  E('sc-a02', 'maia', 'authored', "It doesn't perform. It just abides.", 8),
  E('sc-m07', 'member', 'self_report', 'I want to be present and solid without needing to impress or determine the outcome.', 9),
  E('sc-m08', 'member', 'self_report', 'That would bring the soulfulness I am always seeking.', 10),
  E('sc-m09', 'member', 'self_report', 'Soulfulness feels like wholeness, peace, congruence, coherence and resonance.', 11),
  E('sc-m10', 'member', 'self_report', 'Coding this platform feels like meditation and creative metaphysical engagement.', 12),
  E('sc-a03', 'maia', 'authored', 'The work and the state are the same thing.', 13),
  E('sc-m11', 'member', 'self_report', 'It feels like something I have sought all my life; my travels and explorations were leading here.', 14),
  E('sc-a04', 'maia', 'authored', 'A whole life of seeking — something in you recognizes this as the arrival.', 15),
  E('sc-m12', 'member', 'self_report', 'I feel pride and tenderness toward my younger selves and their path.', 16),

  { kind: 'observation', id: 'sc-o00', claim: 'The image arrives before its meaning is known.', evidenceIds: ['sc-m01'], provisional: true },
  { kind: 'observation', id: 'sc-o01', claim: 'The member associates the cedar with ancient wisdom and endurance.', evidenceIds: ['sc-m02','sc-m03'], provisional: true },
  { kind: 'observation', id: 'sc-o02', claim: 'The member experiences the image as grounding, centering and gravitas-bearing.', evidenceIds: ['sc-m04'], provisional: true },
  { kind: 'observation', id: 'sc-o03', claim: 'The member develops the image toward abiding presence and less outcome-control.', evidenceIds: ['sc-m05','sc-m06','sc-m07'], provisional: true },
  { kind: 'observation', id: 'sc-o04', claim: 'The member links the developed orientation to soulfulness, coherence and resonance.', evidenceIds: ['sc-m08','sc-m09'], provisional: true },
  { kind: 'observation', id: 'sc-o05', claim: 'The member links the state to coding as meditation and creative metaphysical engagement.', evidenceIds: ['sc-m10'], provisional: true },
  { kind: 'observation', id: 'sc-o06', claim: 'The member links the present work to a lifelong trajectory and tenderness toward earlier selves.', evidenceIds: ['sc-m11','sc-m12'], provisional: true },
  { kind: 'observation', id: 'sc-o07', claim: 'MAIA contributes the metaphor of the cedar as witness.', evidenceIds: ['sc-a01'], provisional: true },
  { kind: 'observation', id: 'sc-o08', claim: 'MAIA contributes the non-performing/abiding formulation.', evidenceIds: ['sc-a02'], provisional: true },
  { kind: 'observation', id: 'sc-o09', claim: 'MAIA proposes a relation between the work and the state.', evidenceIds: ['sc-a03'], provisional: true },
  { kind: 'observation', id: 'sc-o10', claim: 'MAIA contributes arrival/convergence language for the lifelong arc.', evidenceIds: ['sc-a04'], provisional: true },

  { kind: 'relation', id: 'sc-r00', relation: 'develops', fromId: 'sc-o00', toId: 'sc-o01', claim: 'An initially unexplained image acquires member-described qualities.', provisional: true },
  { kind: 'relation', id: 'sc-r01', relation: 'develops', fromId: 'sc-o01', toId: 'sc-o02', claim: 'The image qualities become a felt grounding effect.', provisional: true },
  { kind: 'relation', id: 'sc-r02', relation: 'develops', fromId: 'sc-o02', toId: 'sc-o03', evidenceIds: ['sc-a01','sc-a02'], claim: 'Grounding develops into an orientation toward abiding presence while MAIA contributes witness/abiding language.', provisional: true },
  { kind: 'relation', id: 'sc-r03', relation: 'develops', fromId: 'sc-o03', toId: 'sc-o04', claim: 'Abiding presence develops into member-described soulfulness and coherence.', provisional: true },
  { kind: 'relation', id: 'sc-r04', relation: 'develops', fromId: 'sc-o04', toId: 'sc-o05', evidenceIds: ['sc-a03'], claim: 'Soulfulness/coherence becomes connected with creative work; MAIA contributes a work/state formulation.', provisional: true },
  { kind: 'relation', id: 'sc-r05', relation: 'develops', fromId: 'sc-o05', toId: 'sc-o06', evidenceIds: ['sc-a04'], claim: 'The creative work is placed in a lifelong trajectory; MAIA contributes arrival language.', provisional: true },

  {
    kind: 'configuration', id: 'sc-c-current', label: 'silver-cedar-developmental-arc',
    claim: 'The field now relates image, endurance, grounding, abiding presence, soulfulness/coherence, creative work and life trajectory while retaining MAIA’s separate contributions.',
    memberIds: ['sc-o00','sc-o01','sc-o02','sc-o03','sc-o04','sc-o05','sc-o06','sc-o07','sc-o08','sc-o09','sc-o10','sc-r00','sc-r01','sc-r02','sc-r03','sc-r04','sc-r05'],
    provisional: true,
  },
  {
    kind: 'gestalt', id: 'sc-g-current', asOf: 'source-order:16',
    claim: 'Current projection: an initially unexplained image developed through member-authored endurance, grounding, abiding presence, soulfulness/coherence, creative work and lifelong convergence; MAIA’s witness/abiding/work-state/arrival formulations remain MAIA-authored contributions.',
    supportIds: ['sc-c-current'], provisional: true,
  },
];

const positiveField: GestaltResearchField = { version: 'A4.v0', nodes };
const positiveValidation = validateResearchField(positiveField);
assert.equal(positiveValidation.ok, true, JSON.stringify(positiveValidation.issues, null, 2));

const positiveRoots = tracePrimaryEvidence(positiveField, 'sc-g-current');
const rootIds = new Set(positiveRoots.map((node) => node.id));
for (const id of ['sc-m01','sc-m02','sc-m03','sc-m04','sc-m05','sc-m06','sc-m07','sc-m08','sc-m09','sc-m10','sc-m11','sc-m12']) {
  assert.equal(rootIds.has(id), true, `missing member root ${id}`);
}
for (const id of ['sc-a01','sc-a02','sc-a03','sc-a04']) assert.equal(rootIds.has(id), true, `missing MAIA root ${id}`);
assert.equal(assertEvidenceAuthoredBy(positiveField, 'sc-a02', 'maia').authoredBy, 'maia');
assert.equal(assertEvidenceAuthoredBy(positiveField, 'sc-m06', 'member').authoredBy, 'member');
assert.throws(() => assertEvidenceAuthoredBy(positiveField, 'sc-a02', 'member'), /authored by maia, not member/);

// Later continuity rupture: add evidence about availability without erasing the content Gestalt.
const ruptureNodes: ResearchNode[] = [
  ...nodes,
  E('sc-m-recall', 'member', 'self_report', 'Do you remember me saying something about a silver cedar?', 39),
  E('sc-a-gap', 'maia', 'authored', "I don't have that part of our conversation in front of me right now — it's in the exchanges I can't see from here.", 40),
  { kind: 'observation', id: 'sc-o-gap', claim: 'The later serving turn truthfully discloses that the earlier arc is absent from current cognition.', evidenceIds: ['sc-m-recall','sc-a-gap'], provisional: true },
  {
    kind: 'temporal_change', id: 'sc-t-gap', change: 'displaced',
    claim: 'The developed content remains historical while its representation is absent at the later serving turn.',
    beforeIds: ['sc-c-current'], afterIds: ['sc-o-gap'], evidenceIds: ['sc-m-recall','sc-a-gap'], provisional: true,
  },
  {
    kind: 'gestalt', id: 'sc-g-rupture', asOf: 'source-order:40',
    claim: 'Availability projection: the Silver Cedar arc exists in session history, while the later serving turn reports that the needed portion is not represented in current cognition.',
    supportIds: ['sc-t-gap'], provisional: true,
  },
];
const ruptureField: GestaltResearchField = { version: 'A4.v0', nodes: ruptureNodes };
const ruptureValidation = validateResearchField(ruptureField);
assert.equal(ruptureValidation.ok, true, JSON.stringify(ruptureValidation.issues, null, 2));
const availabilityRoots = compareGestaltEvidenceRoots(ruptureField, 'sc-g-current', 'sc-g-rupture');
assert.deepEqual(availabilityRoots.dropped, []);
assert.deepEqual([...availabilityRoots.added].sort(), ['sc-a-gap','sc-m-recall']);

console.log(JSON.stringify({
  proof: 'JARVIS-MAIA-FREE-SYNTHESIS-01 A4 Silver Cedar',
  status: 'PASS',
  validPositiveArc: positiveValidation.ok,
  positivePrimaryRoots: positiveRoots.length,
  memberRoots: positiveRoots.filter((node) => node.authoredBy === 'member').length,
  maiaRoots: positiveRoots.filter((node) => node.authoredBy === 'maia').length,
  sourceStandingPreserved: true,
  fullArcIncludesUnexplainedArrival: rootIds.has('sc-m01'),
  validAvailabilityRupture: ruptureValidation.ok,
  availabilityAddedRoots: availabilityRoots.added,
  availabilityDroppedRoots: availabilityRoots.dropped,
}, null, 2));
