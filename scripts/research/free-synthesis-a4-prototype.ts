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
