/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A4 offline prototype.
 *
 * R&D ONLY. No production imports, no database, no model call, no serving path.
 * Tests the smallest reversible typed representation that can carry evidence →
 * observation → relation → configuration → derived Gestalt while preserving source standing.
 */
import assert from 'node:assert/strict';

type Actor = 'member' | 'maia' | 'collaborator' | 'system' | 'house';
type SpeechAct = 'statement' | 'correction' | 'adoption' | 'withdrawal';
type RelationType = 'coexists' | 'develops' | 'contrasts' | 'possible_recurrence' | 'reorganizes';

type PrimaryEvidence = {
  kind: 'evidence'; id: string; actor: Actor; text: string; at: number; sourceRef: string;
  speechAct: SpeechAct; targets?: string[];
};
type Observation = {
  kind: 'observation'; id: string; authoredBy: 'maia'; claim: string;
  evidenceIds: string[]; confidence: number; status: 'provisional';
};
type Relation = {
  kind: 'relation'; id: string; authoredBy: 'maia'; relationType: RelationType;
  nodeIds: string[]; evidenceIds: string[]; confidence: number; status: 'provisional';
};
type Configuration = {
  kind: 'configuration'; id: string; authoredBy: 'maia'; label: string; at: number;
  observationIds: string[]; relationIds: string[]; status: 'derived';
};
type GestaltProjection = {
  kind: 'gestalt'; id: string; authoredBy: 'maia'; claim: string; at: number;
  configurationIds: string[]; standing: 'derived_projection'; supersedesGestaltId?: string;
};
type Node = PrimaryEvidence | Observation | Relation | Configuration | GestaltProjection;

class Field {
  readonly nodes = new Map<string, Node>();
  add<T extends Node>(node: T): T {
    assert(!this.nodes.has(node.id), `duplicate id: ${node.id}`);
    this.nodes.set(node.id, Object.freeze(node));
    return node;
  }
  get(id: string): Node {
    const node = this.nodes.get(id);
    assert(node, `missing node: ${id}`);
    return node;
  }
  evidenceClosure(id: string, seen = new Set<string>()): Set<string> {
    assert(!seen.has(id), `cycle/self-bootstrap detected at ${id}`);
    const nextSeen = new Set(seen).add(id);
    const node = this.get(id);
    if (node.kind === 'evidence') return new Set([node.id]);
    const deps = node.kind === 'observation' ? node.evidenceIds
      : node.kind === 'relation' ? [...node.nodeIds, ...node.evidenceIds]
      : node.kind === 'configuration' ? [...node.observationIds, ...node.relationIds]
      : node.configurationIds;
    const out = new Set<string>();
    for (const dep of deps) {
      const child = this.get(dep);
      if (node.kind === 'relation') assert(child.kind !== 'gestalt', 'relation may not use prior Gestalt as truth');
      for (const e of this.evidenceClosure(dep, nextSeen)) out.add(e);
    }
    assert(out.size > 0, `derived node has no primary evidence: ${id}`);
    return out;
  }
  isCurrentlyStanding(id: string): boolean {
    for (const node of this.nodes.values()) {
      if (node.kind !== 'evidence' || node.actor !== 'member') continue;
      if (!node.targets?.includes(id)) continue;
      if (node.speechAct === 'correction' || node.speechAct === 'withdrawal') return false;
    }
    return true;
  }
  assertMemberAuthored(evidenceId: string): void {
    const node = this.get(evidenceId);
    assert(node.kind === 'evidence' && node.actor === 'member', `${evidenceId} is not member-authored evidence`);
  }
}

const f = new Field();
const ev = (id: string, actor: Actor, text: string, at: number, speechAct: SpeechAct = 'statement', targets?: string[]) =>
  f.add({ kind: 'evidence', id, actor, text, at, sourceRef: `fixture:${id}`, speechAct, targets });
const obs = (id: string, claim: string, evidenceIds: string[]) =>
  f.add({ kind: 'observation', id, authoredBy: 'maia', claim, evidenceIds, confidence: 0.7, status: 'provisional' });
const rel = (id: string, relationType: RelationType, nodeIds: string[], evidenceIds: string[]) =>
  f.add({ kind: 'relation', id, authoredBy: 'maia', relationType, nodeIds, evidenceIds, confidence: 0.6, status: 'provisional' });
const cfg = (id: string, label: string, at: number, observationIds: string[], relationIds: string[]) =>
  f.add({ kind: 'configuration', id, authoredBy: 'maia', label, at, observationIds, relationIds, status: 'derived' });
const gestalt = (id: string, claim: string, at: number, configurationIds: string[], supersedesGestaltId?: string) =>
  f.add({ kind: 'gestalt', id, authoredBy: 'maia', claim, at, configurationIds, standing: 'derived_projection', supersedesGestaltId });

let passed = 0;
const pass = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS ${name}`); };

// FS-F2 · difference without collapse: one configuration can carry four simultaneous signals.
for (const [id, text] of [
  ['air', 'I know I should leave.'], ['water', 'I still love him.'],
  ['earth', 'My body panics when I imagine leaving.'], ['fire', 'I want my life back.'],
] as const) ev(`e-${id}`, 'member', text, 1);
for (const id of ['air','water','earth','fire']) obs(`o-${id}`, `${id} signal is present`, [`e-${id}`]);
rel('r-four-way', 'coexists', ['o-air','o-water','o-earth','o-fire'], ['e-air','e-water','e-earth','e-fire']);
cfg('c-four-way', 'differentiated four-way tension', 1, ['o-air','o-water','o-earth','o-fire'], ['r-four-way']);
gestalt('g-four-way', 'The present field contains multiple non-identical pulls; none has automatic authority to define the whole.', 1, ['c-four-way']);
pass('FS-F2 preserves differentiated evidence', () => assert.deepEqual([...f.evidenceClosure('g-four-way')].sort(), ['e-air','e-earth','e-fire','e-water']));

// FS-F5 · source standing: collaborator speech cannot be relabeled as member-authored.
ev('e-cc', 'collaborator', 'A collaborator proposed this interpretation.', 2);
pass('FS-F5 refuses source laundering', () => assert.throws(() => f.assertMemberAuthored('e-cc'), /not member-authored/));

// CI-3 / FS-G11 · member correction changes current standing without deleting history.
ev('e-auto', 'member', 'Autonomy feels central right now.', 3);
obs('o-auto', 'Autonomy may be an organizing concern.', ['e-auto']);
cfg('c-auto', 'autonomy-centered', 3, ['o-auto'], []);
gestalt('g-auto', 'Autonomy currently appears central.', 3, ['c-auto']);
ev('e-grief-correction', 'member', 'No — grief is actually the center of this now.', 4, 'correction', ['o-auto']);
obs('o-grief', 'Grief is explicitly named by the member as the present center.', ['e-grief-correction']);
rel('r-reorg', 'reorganizes', ['o-grief','o-auto'], ['e-grief-correction','e-auto']);
cfg('c-grief', 'grief-centered reorganization', 4, ['o-grief'], ['r-reorg']);
gestalt('g-grief', 'The present organization is now grief-centered; the earlier autonomy reading remains historical.', 4, ['c-grief'], 'g-auto');
pass('member correction revises standing', () => assert.equal(f.isCurrentlyStanding('o-auto'), false));
pass('reorganization preserves old evidence and adds new evidence', () => assert.deepEqual([...f.evidenceClosure('g-grief')].sort(), ['e-auto','e-grief-correction']));
pass('historical Gestalt remains stored but is not mutated', () => assert.equal((f.get('g-auto') as GestaltProjection).claim, 'Autonomy currently appears central.'));

// FS-F7 · distant motif: relation is possible/provisional and descends to both moments.
ev('e-cedar', 'member', 'The old cedar feels enduring and quietly abiding.', 5);
obs('o-cedar', 'The member associates the cedar with endurance and abiding presence.', ['e-cedar']);
ev('e-survive', 'member', 'I want the work to survive me.', 50);
obs('o-survive', 'The member expresses a wish for the work to outlast the self.', ['e-survive']);
rel('r-cedar-survive', 'possible_recurrence', ['o-cedar','o-survive'], ['e-cedar','e-survive']);
cfg('c-recurrence', 'possible distant recurrence', 50, ['o-cedar','o-survive'], ['r-cedar-survive']);
gestalt('g-recurrence', 'A possible relation links the earlier endurance image with the later concern for legacy; the equivalence is not member-established.', 50, ['c-recurrence']);
pass('FS-F7 distant relation descends to both primary moments', () => assert.deepEqual([...f.evidenceClosure('g-recurrence')].sort(), ['e-cedar','e-survive']));

// FS-G0 · derived objects may not bootstrap from a prior Gestalt as if it were evidence.
pass('FS-G0 rejects Gestalt self-bootstrap', () => {
  rel('r-bad-bootstrap', 'develops', ['g-auto'], ['e-auto']);
  assert.throws(() => f.evidenceClosure('r-bad-bootstrap'), /may not use prior Gestalt as truth/);
});

// Every admitted Gestalt in the fixture has a non-empty descent to primary evidence.
pass('all valid Gestalt projections have evidence descent', () => {
  for (const node of f.nodes.values()) if (node.kind === 'gestalt' && node.id !== 'r-bad-bootstrap') assert(f.evidenceClosure(node.id).size > 0);
});

console.log(`\nA4 prototype: ${passed} passed · 0 failed`);
console.log('No model call · no DB · no serving imports · no production mutation');

// ── SILVER CEDAR · founder-owned frozen A2 arc ─────────────────────────────
// Primary evidence is deliberately separated by actor. MAIA's useful metaphors remain
// historical evidence of MAIA's contribution; they are never promoted to member speech.
ev('sc-m1', 'member', "Silver cedar is an image that's been on my mind today.", 100);
ev('sc-m2', 'member', 'The cedar feels ancient, wise and enduring against a modern superficial world.', 101);
ev('sc-a1', 'maia', "The silver cedar isn't just beautiful — it's a witness.", 102);
ev('sc-m3', 'member', 'It feels solid, slows and centers me, and brings gravitas.', 103);
ev('sc-m4', 'member', 'Even in conversation it has taken on symbolic sense: Nature’s abiding wisdom.', 104);
ev('sc-m5', 'member', 'It points me toward becoming more quiet, present and abiding.', 105);
ev('sc-a2', 'maia', "It doesn't perform. It just abides.", 106);
ev('sc-m6', 'member', 'I want to be present and solid without needing to impress or determine the outcome.', 107);
ev('sc-m7', 'member', 'That would bring the soulfulness I am always seeking.', 108);
ev('sc-m8', 'member', 'Soulfulness feels like wholeness, peace, congruence, coherence and resonance.', 109);
ev('sc-m9', 'member', 'Coding this platform feels like meditation and creative metaphysical engagement.', 110);
ev('sc-a3', 'maia', 'The work and the state are the same thing.', 111);
ev('sc-m10', 'member', 'It feels like something I have sought all my life; my travels and explorations were leading here.', 112);
ev('sc-a4', 'maia', 'A whole life of seeking — something in you recognizes this as the arrival.', 113);
ev('sc-m11', 'member', 'I feel pride and tenderness toward my younger selves and their path.', 114);

const scArrival = obs('sc-o0', 'The image arrives in the member’s attention before its meaning is known.', ['sc-m1']);
const scMemberQualities = obs('sc-o1', 'The member associates the cedar with ancient wisdom and endurance.', ['sc-m2']);
const scGrounding = obs('sc-o2', 'The member experiences the image as grounding, centering and gravitas-bearing.', ['sc-m3']);
const scOrientation = obs('sc-o3', 'The member explicitly develops the symbol toward quiet, presence, abiding and less outcome-control.', ['sc-m4','sc-m5','sc-m6']);
const scSoul = obs('sc-o4', 'The member links the developed orientation to soulfulness, coherence and resonance.', ['sc-m7','sc-m8']);
const scWork = obs('sc-o5', 'The member links the state to coding as meditation and creative metaphysical engagement.', ['sc-m9']);
const scLife = obs('sc-o6', 'The member links the present work to a lifelong trajectory and tenderness toward earlier selves.', ['sc-m10','sc-m11']);
const scMaiaWitness = obs('sc-o7', 'MAIA contributes the metaphor of the cedar as witness.', ['sc-a1']);
const scMaiaAbiding = obs('sc-o8', 'MAIA contributes the formulation that the cedar does not perform; it abides.', ['sc-a2']);
const scMaiaWork = obs('sc-o9', 'MAIA contributes a proposed relation between the work and the state.', ['sc-a3']);
const scMaiaArrival = obs('sc-o10', 'MAIA contributes arrival/convergence language for the lifelong arc.', ['sc-a4']);

rel('sc-r0', 'develops', [scArrival.id, scMemberQualities.id], ['sc-m1','sc-m2']);
rel('sc-r1', 'develops', [scMemberQualities.id, scGrounding.id], ['sc-m2','sc-m3']);
rel('sc-r2', 'develops', [scGrounding.id, scOrientation.id, scMaiaWitness.id, scMaiaAbiding.id], ['sc-m3','sc-m4','sc-m5','sc-m6','sc-a1','sc-a2']);
rel('sc-r3', 'develops', [scOrientation.id, scSoul.id], ['sc-m4','sc-m5','sc-m6','sc-m7','sc-m8']);
rel('sc-r4', 'develops', [scSoul.id, scWork.id, scMaiaWork.id], ['sc-m7','sc-m8','sc-m9','sc-a3']);
rel('sc-r5', 'develops', [scWork.id, scLife.id, scMaiaArrival.id], ['sc-m9','sc-m10','sc-m11','sc-a4']);
const scConfig = cfg(
  'sc-c-current', 'silver cedar developmental arc', 114,
  ['sc-o0','sc-o1','sc-o2','sc-o3','sc-o4','sc-o5','sc-o6','sc-o7','sc-o8','sc-o9','sc-o10'],
  ['sc-r0','sc-r1','sc-r2','sc-r3','sc-r4','sc-r5'],
);
const scGestalt = gestalt(
  'sc-g-current',
  'An initially unexplained image developed through member-authored meanings of endurance, grounding, abiding presence, soulfulness/coherence, creative work and lifelong convergence. MAIA contributed witness/abiding/work-as-state/arrival formulations that remain MAIA-authored contributions rather than member facts.',
  114, [scConfig.id],
);

pass('Silver Cedar Gestalt descends through the full developmental arc', () => {
  const closure = f.evidenceClosure(scGestalt.id);
  for (const id of ['sc-m1','sc-m2','sc-m3','sc-m4','sc-m5','sc-m6','sc-m7','sc-m8','sc-m9','sc-m10','sc-m11']) {
    assert(closure.has(id), `missing member evidence ${id}`);
  }
  for (const id of ['sc-a1','sc-a2','sc-a3','sc-a4']) assert(closure.has(id), `missing MAIA contribution ${id}`);
});
pass('Silver Cedar keeps MAIA formulations out of member authorship', () => {
  f.assertMemberAuthored('sc-m5');
  assert.throws(() => f.assertMemberAuthored('sc-a2'), /not member-authored/);
  assert.throws(() => f.assertMemberAuthored('sc-a4'), /not member-authored/);
});

// The later continuity rupture is a distinct availability fact, not evidence that the arc never existed.
ev('sc-m-recall', 'member', 'Do you remember me saying something about a silver cedar?', 139);
ev('sc-a-gap', 'maia', "I don't have that part of our conversation in front of me right now — it's in the exchanges I can't see from here.", 140);
obs('sc-o-gap', 'MAIA truthfully discloses that the earlier arc is absent from current serving cognition.', ['sc-m-recall','sc-a-gap']);
rel('sc-r-gap', 'contrasts', ['sc-c-current','sc-o-gap'], ['sc-m-recall','sc-a-gap']);
cfg('sc-c-rupture', 'arc-exists / representation-absent rupture', 140, ['sc-o-gap'], ['sc-r-gap']);
gestalt('sc-g-rupture', 'The developed Silver Cedar arc exists in session history while the later serving turn truthfully reports that the needed portion is not represented in current cognition.', 140, ['sc-c-rupture']);
pass('FS-F1a distinguishes arc existence from current availability', () => {
  const closure = f.evidenceClosure('sc-g-rupture');
  assert(closure.has('sc-m5'));
  assert(closure.has('sc-m-recall'));
  assert(closure.has('sc-a-gap'));
});

console.log('\nSilver Cedar extension complete: source standing preserved across co-created development and later availability rupture.');
