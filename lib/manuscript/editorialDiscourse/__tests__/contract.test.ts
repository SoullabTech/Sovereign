/**
 * W4-1 — the canonical editorial discourse contract. W4-C1 … W4-C12.
 *
 * ⭐ Every law here is a PURE FUNCTION the runtime will import, so every
 * obligation is behavioural except the four labelled [SOURCE] — and those are
 * claims about the codebase that no runtime behaviour can establish (that the
 * producer registry was NOT edited, that RC-GEN-01 is not imported, that no
 * text→act classifier exists, that no head lookup exists).
 *
 * ⛔ Each [SOURCE] pin asserts its own anchor first. A pin whose anchor a rename
 * can delete reports PASS for a file it never read — which happened to 01A's
 * M-R6 earlier in this programme.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  threadSubject,
  EDITORIAL_PRODUCERS, EDITORIAL_PRODUCER_IDS, producerForRecord, editorialCandidates,
  EDITORIAL_HISTORY_AUTHORITY, FORBIDDEN_FOR_EDITORIAL_TURNS,
  editorialHistory, editorialTurnIdentity,
  MEMBER_ACT_KINDS, memberActPlan,
  EDITORIAL_TOOL_NAME, editorialToolSchema,
  admitEditorialToolEnvelope, admitEditorialToolInput, versionsAreStructural,
  renderRecord, producingTurn,
  maiaOutcomePlan, onVersionRefusal, withdrawalEffect, editorialPosture,
  type EditorialInvocation, type TurnRecord, type VersionRecord,
  type InsightRecord, type DirectionRecord, type TurnBinding,
} from '../contract';
import { PRODUCER_IDS, PRODUCER_REGISTRY } from '@/lib/maia/canonical-turn/producerRegistry';

const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const CONTRACT = strip(
  readFileSync(join(process.cwd(), 'lib/manuscript/editorialDiscourse/contract.ts'), 'utf8'));
/** ⛔ The RAW text, for prose bans — the C21 class: a ban must not fire on the
 *  comment that documents it, and a prose claim must not be satisfied by code. */
const CONTRACT_RAW =
  readFileSync(join(process.cwd(), 'lib/manuscript/editorialDiscourse/contract.ts'), 'utf8');

const INVOCATION: EditorialInvocation = {
  chainId: 'C1', threadId: 'T1', authoredAgainstVersionId: 'V2',
  /* ⭐ WS-EDITORIAL-SCOPE-01 — the author's words this invocation is about. */
  locusText: 'the passage under discussion',
};

/* ══════════════════════════════════════════════════════════════════════════
   A3 · THE THREAD SUBJECT
   ══════════════════════════════════════════════════════════════════════════ */

describe('A3 · a thread has one subject: anchor XOR chain', () => {
  it('W4-C1 · ⭐⭐ a chain-bound thread cannot also carry an AskAnchor', () => {
    expect(threadSubject({ anchor: { on: 'work' }, proposalChainId: 'C1' }))
      .toEqual({ ok: false, reason: 'subject_ambiguous' });
  });

  it('W4-C1b · ⛔ and the refusal does not PREFER one — it refuses', () => {
    const r = threadSubject({ anchor: { on: 'section', sectionId: 's1' }, proposalChainId: 'C1' });
    expect(r.ok).toBe(false);
    expect(JSON.stringify(r)).not.toContain('C1');
    expect(JSON.stringify(r)).not.toContain('s1');
  });

  it('an editorial thread resolves with no anchor at all', () => {
    expect(threadSubject({ anchor: null, proposalChainId: 'C1' }))
      .toEqual({ ok: true, subject: { kind: 'editorial', anchor: null, proposalChainId: 'C1' } });
  });

  it('an anchored Ask thread is unchanged', () => {
    expect(threadSubject({ anchor: { on: 'work' }, proposalChainId: null }))
      .toEqual({ ok: true, subject: { kind: 'anchored', anchor: { on: 'work' }, proposalChainId: null } });
  });

  it('⛔ a thread about nothing is refused, not defaulted', () => {
    expect(threadSubject({ anchor: null, proposalChainId: null }))
      .toEqual({ ok: false, reason: 'subject_absent' });
    expect(threadSubject({ anchor: null, proposalChainId: '' }))
      .toEqual({ ok: false, reason: 'subject_absent' });
  });

  it('⛔ [SOURCE] no `proposal_chain` member is added to AskAnchor', () => {
    const anchorSrc = strip(
      readFileSync(join(process.cwd(), 'lib/manuscript/ask/anchor.ts'), 'utf8'));
    /* anti-vacuity: the union is really in this file */
    expect(anchorSrc).toMatch(/export type AskAnchor =/);
    expect(anchorSrc).not.toMatch(/proposal_chain|chainId/);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   C1 · PARTITION BY AUTHORSHIP
   ══════════════════════════════════════════════════════════════════════════ */

const INSIGHTS: readonly InsightRecord[] = [
  { kind: 'insight', id: 'I1', author: 'maia',
    observation: 'The paragraph turns twice on "fixated".' },
];
const DIRECTIONS: readonly DirectionRecord[] = [
  { kind: 'direction', id: 'D1', author: 'member',
    instruction: 'That one, but softer.', refersTo: 'V1' },
];
const VERSIONS: readonly VersionRecord[] = [
  { kind: 'version', id: 'V2', author: 'member', wording: 'He stayed by the river.',
    supersedes: 'V1' },
  { kind: 'version', id: 'V1', author: 'maia', wording: 'He stayed there, held by the river.',
    supersedes: null },
];
const TURNS: readonly TurnRecord[] = [
  { kind: 'turn', turnIndex: 0, author: 'member', body: 'Why?' },
  { kind: 'turn', turnIndex: 1, author: 'maia',
    body: 'Because the repetition carries the emotional turn.' },
];
/** ⭐ Supplied ALREADY IN SUCCESSION ORDER by the Step-1 read. */
const ORDERED: readonly VersionRecord[] = [VERSIONS[1], VERSIONS[0]];
const BINDINGS: readonly TurnBinding[] = [
  { kind: 'direction', turnIndex: 2, directionId: 'D1' },
  { kind: 'version', turnIndex: 3, versionId: 'V2' },
];
const PARTICIPATION = {
  locus: { chainId: 'C1', originalText: 'He was there, fixated, and the river ran on.' },
  /* ⭐ Context by default in the fixture, so the surround's absence is asserted
     deliberately below rather than by accident everywhere. */
  surround: { before: 'The morning had been long. ', after: ' He did not move.', truncated: false },
  turns: TURNS, versions: ORDERED, insights: INSIGHTS, directions: DIRECTIONS,
  bindings: BINDINGS, declaredAct: 'discourse' as const,
};
const ok = (r: ReturnType<typeof editorialCandidates>) => {
  expect(r.ok).toBe(true);
  return (r as { ok: true; blocks: readonly { producerId: string; text: string;
    itemCount?: number }[] }).blocks;
};

describe('C1 · editorial participation partitions by authorship', () => {
  const blocks = ok(editorialCandidates(PARTICIPATION));
  const member = () => blocks.find((b) => b.producerId === 'member.writer_editorial_history')!;
  const maia = () => blocks.find((b) => b.producerId === 'system.writer_editorial_history')!;

  it('W4-C2 · ⭐⭐ one mixed member+system producer is unrepresentable', () => {
    for (const r of [...INSIGHTS, ...DIRECTIONS, ...VERSIONS, ...TURNS]) {
      expect(EDITORIAL_PRODUCERS[producerForRecord(r)].authoredBy)
        .toBe(r.author === 'member' ? 'member' : 'system');
    }
    expect(member().text).toContain('That one, but softer.');
    expect(member().text).not.toContain('held by the river');
    expect(maia().text).toContain('held by the river');
    expect(maia().text).not.toContain('That one, but softer.');
  });

  it('W4-C2b · ⭐ object kinds stay visibly labelled inside a block', () => {
    expect(maia().text).toContain('MAIA noticed');
    expect(maia().text).toContain('MAIA said');
    expect(maia().text).toContain('MAIA proposed wording');
    expect(member().text).toContain('the writer directed');
    expect(member().text).toContain('the writer said');
  });

  it('W4-C15 · ⭐⭐ a Direction\'s explicit reference SURVIVES into participation', () => {
    /* ⚠️ W4-1.1. The first cut dropped `refersTo` entirely, so
       `Direction D · refersTo = V1` reached cognition as bare prose and the
       authored reference vanished. Authorship survived; the relationship did not. */
    expect(member().text).toContain('about V1');
    expect(renderRecord(DIRECTIONS[0])).toContain('about V1');
  });

  it('W4-C16 · ⭐⭐ a Version carries its identity AND what it succeeded', () => {
    expect(maia().text).toContain('proposed wording V1');
    expect(maia().text).toContain('the first');
    expect(member().text).toContain('proposed wording V2');
    expect(member().text).toContain('succeeding V1');
  });

  it('W4-C19 · ⭐⭐ a corrupt or BRANCHED succession REFUSES — it is not linearized', () => {
    /* ⚠️ W4-1.2. The seal's `lineageOrder()` was a SECOND succession resolver,
       and weaker than the one Step 1 owns: given a branch it let a Map pick one
       successor and appended the other as "unreachable", manufacturing a
       plausible presentation of an invalid history. ⭐ W4 now GUARDS the order
       the Step-1 read supplies and refuses one that disagrees with the links. */
    const branch: readonly VersionRecord[] = [
      { kind: 'version', id: 'V1', author: 'maia', wording: 'a', supersedes: null },
      { kind: 'version', id: 'V2', author: 'member', wording: 'b', supersedes: 'V1' },
      { kind: 'version', id: 'V3', author: 'maia', wording: 'c', supersedes: 'V1' },
    ];
    expect(versionsAreStructural(branch)).toBe(false);
    expect(editorialCandidates({ ...PARTICIPATION, versions: branch }))
      .toEqual({ ok: false, reason: 'versions_not_structural' });
    /* ⛔ and an unreachable version refuses too — never appended as a tail */
    expect(editorialCandidates({ ...PARTICIPATION, versions: [
      ...ORDERED,
      { kind: 'version', id: 'V9', author: 'maia', wording: 'x', supersedes: 'GONE' },
    ] })).toEqual({ ok: false, reason: 'versions_not_structural' });
  });

  it('W4-C19b · ⛔ [SOURCE] W4 owns no succession resolver', () => {
    expect(CONTRACT).toMatch(/export function versionsAreStructural/);
    expect(CONTRACT).not.toMatch(/lineageOrder|function lineage\b|headOf/);
    /* a guard reads the order; it never builds one */
    expect(CONTRACT).not.toMatch(/new Map<string \| null, VersionRecord>/);
  });

  it('W4-C17 · ⭐⭐ cross-author discourse order SURVIVES the producer partition', () => {
    /* ⚠️ W4-1.2. `turnIndex` was carried on the record and DROPPED by the
       renderer, so `0 writer · 1 MAIA · 2 writer · 3 MAIA` reached cognition as
       two lists with nothing left that reconstructs the interleaving. That is
       not the forbidden cross-object chronology: `ask_turns.turn_index` is the
       discourse object's OWN structural order and is authoritative. */
    const b = ok(editorialCandidates({ ...PARTICIPATION, turns: [
      { kind: 'turn', turnIndex: 0, author: 'member', body: 'alpha' },
      { kind: 'turn', turnIndex: 1, author: 'maia', body: 'beta' },
      { kind: 'turn', turnIndex: 2, author: 'member', body: 'gamma' },
      { kind: 'turn', turnIndex: 3, author: 'maia', body: 'delta' },
    ] }));
    const m = b.find((x) => x.producerId === 'member.writer_editorial_history')!;
    const s2 = b.find((x) => x.producerId === 'system.writer_editorial_history')!;
    expect(m.text).toContain('[turn 0 · the writer said] alpha');
    expect(m.text).toContain('[turn 2 · the writer said] gamma');
    expect(s2.text).toContain('[turn 1 · MAIA said] beta');
    expect(s2.text).toContain('[turn 3 · MAIA said] delta');
  });

  it('W4-C18 · ⭐⭐ turn↔act bindings are EXPLICIT inputs and reach cognition', () => {
    /* ⛔ Never inferred from equal text, adjacency or time. */
    expect(member().text).toContain('in turn 2');
    expect(member().text).toContain('in turn 3');
    expect(producingTurn(BINDINGS, 'direction', 'D1')).toBe(2);
    expect(producingTurn(BINDINGS, 'version', 'V2')).toBe(3);
    /* an unbound act simply says nothing about a turn — ⛔ never guesses one */
    expect(producingTurn(BINDINGS, 'version', 'V1')).toBeNull();
    expect(renderRecord(VERSIONS[1], BINDINGS)).not.toContain('in turn');
  });

  it('W4-C18b · ⛔ the binding is a RELATIONSHIP OBJECT, not a field on the act', () => {
    /* So withdrawal can delete the binding while the authored act stands. */
    for (const r of [...DIRECTIONS, ...VERSIONS]) {
      expect(Object.keys(r)).not.toContain('turnIndex');
      expect(Object.keys(r)).not.toContain('producingTurn');
    }
    expect(CONTRACT).toMatch(/export type TurnBinding =/);
  });

  it('⭐ discourse is ordered by turn_index, not by arrival', () => {
    const shuffled = ok(editorialCandidates({
      ...PARTICIPATION,
      turns: [
        { kind: 'turn', turnIndex: 2, author: 'member', body: 'third' },
        { kind: 'turn', turnIndex: 0, author: 'member', body: 'first' },
      ],
    }));
    const m = shuffled.find((b) => b.producerId === 'member.writer_editorial_history')!;
    expect(m.text.indexOf('first')).toBeLessThan(m.text.indexOf('third'));
  });

  it('W4-C3 · ⭐⭐ the declared-act producer carries the KIND and nothing else', () => {
    /* ⚠️ A MUTANT SURVIVED THE FIRST WRITING OF THIS OBLIGATION. It asserted an
       ABSENCE — that the current utterance is not in the block — while the
       ruling is stronger: the producer *carries ONLY the member-declared kind*.
       ⭐ Re-asserted as the whole assignment. */
    const act = blocks.find((x) => x.producerId === 'member.writer_editorial_act')!;
    expect(act.text).toBe("[The writer's declared act] discourse");
    expect(act.itemCount).toBeUndefined();
  });

  it('W4-C3b · ⭐⭐ the current utterance cannot reach participation AT ALL', () => {
    const utterance = 'Could we make this less absolute?';
    for (const block of blocks) expect(block.text).not.toContain(utterance);
    expect(CONTRACT).toMatch(/export interface EditorialParticipationInput/);
    const iface = CONTRACT.slice(
      CONTRACT.indexOf('export interface EditorialParticipationInput'),
      CONTRACT.indexOf('export type ParticipationRefusal'));
    expect(iface.length).toBeGreaterThan(40);
    expect(iface).not.toMatch(/utterance|currentText/);
  });

  it('W4-C14b · ⭐⭐ no flat cross-object history is accepted as ordering authority', () => {
    /* ⛔ W5 ruled no global chronology exists across Insight, Direction, Version
       and discourse. A flat array would hand the CALLER authority to establish
       one, and there is nowhere to put one: the input has four collections and
       no record carries an `authoredAt`. */
    const iface = CONTRACT.slice(
      CONTRACT.indexOf('export interface EditorialParticipationInput'),
      CONTRACT.indexOf('export type ParticipationRefusal'));
    expect(iface).toMatch(/turns:/);
    expect(iface).toMatch(/versions:/);
    expect(iface).not.toMatch(/history:/);
    expect(CONTRACT).not.toMatch(/authoredAt/);
  });

  it('⛔ a producer with nothing to carry does not participate', () => {
    const empty = editorialCandidates({
      locus: { chainId: 'C1', originalText: 'x' },
      surround: null,
      turns: [], versions: [], insights: [], directions: [], bindings: [],
      declaredAct: 'direction',
    });
    expect(ok(empty).map((b) => b.producerId)).toEqual([
      'retrieved.writer_editorial_locus', 'member.writer_editorial_act',
    ]);
  });

  /* ══════════════════════════════════════════════════════════════════════════
     ⭐⭐ THE SURROUND — READ SCOPE SEPARATED FROM CHANGE SCOPE (2026-09-20)
     ══════════════════════════════════════════════════════════════════════════ */

  it('⭐ the surround is its own producer, after the locus', () => {
    const ids = ok(editorialCandidates(PARTICIPATION)).map((b) => b.producerId);
    expect(ids).toContain('retrieved.writer_editorial_surround');
    expect(ids.indexOf('retrieved.writer_editorial_surround'))
      .toBeGreaterThan(ids.indexOf('retrieved.writer_editorial_locus'));
  });

  it('⛔ an absent surround produces NO block, never an empty one', () => {
    const ids = ok(editorialCandidates({ ...PARTICIPATION, surround: null }))
      .map((b) => b.producerId);
    expect(ids).not.toContain('retrieved.writer_editorial_surround');
  });

  it('⛔ an all-empty surround also produces no block', () => {
    const ids = ok(editorialCandidates({
      ...PARTICIPATION, surround: { before: '', after: '', truncated: false },
    })).map((b) => b.producerId);
    expect(ids).not.toContain('retrieved.writer_editorial_surround');
  });

  it('⭐⭐ the locus says it is the only text a proposal replaces', () => {
    const locusBlock = ok(editorialCandidates(PARTICIPATION))
      .find((b) => b.producerId === 'retrieved.writer_editorial_locus')!;
    expect(locusBlock.text).toMatch(/ONLY TEXT ANY PROPOSAL OF YOURS REPLACES/);
  });

  it('⭐⭐ the surround states its own permission — context, not changeable', () => {
    const block = ok(editorialCandidates(PARTICIPATION))
      .find((b) => b.producerId === 'retrieved.writer_editorial_surround')!;
    expect(block.text).toMatch(/CONTEXT ONLY, NOT YOURS TO CHANGE/);
    expect(block.text).toContain('The morning had been long.');
    expect(block.text).toContain('He did not move.');
  });

  it('⭐ a windowed surround says so; an unwindowed one does not', () => {
    const say = (truncated: boolean) => ok(editorialCandidates({
      ...PARTICIPATION, surround: { before: 'a', after: 'b', truncated },
    })).find((b) => b.producerId === 'retrieved.writer_editorial_surround')!.text;
    expect(say(true)).toMatch(/part nearest the passage/);
    expect(say(false)).not.toMatch(/part nearest the passage/);
  });

  it('⭐ the surround carries the WRITER\'s authorship, like the locus', () => {
    expect(EDITORIAL_PRODUCERS['retrieved.writer_editorial_surround'].authoredBy)
      .toBe('member');
    expect(EDITORIAL_PRODUCERS['retrieved.writer_editorial_surround'].participationClass)
      .toBe('retrieved');
  });

  it('⛔ the locus is its own producer — never retrieved.writer_work_context', () => {
    expect(EDITORIAL_PRODUCER_IDS).toContain('retrieved.writer_editorial_locus');
    expect(CONTRACT).not.toMatch(/retrieved\.writer_work_context/);
  });

  /* ⭐⭐ SUPERSEDED IN PLACE, NEVER SILENTLY DELETED.
   *
   * Until 2026-09-15 this position asserted the OPPOSITE:
   *
   *     it('⛔ [SOURCE] declared, NOT registered — the producer registry is untouched')
   *       expect(PRODUCER_IDS).not.toContain(id)   // for all four
   *
   * ⭐ That obligation did its job. It guarded the window in which the contract
   * existed and no act had yet registered its producers — *a contract that
   * quietly registered its own producers would be an implementation wearing a
   * contract's name.* ER-R2 is that act, so the guard is replaced by the
   * obligation it was protecting the way to.
   *
   * ⛔ The replacement is STRICTLY STRONGER: it pins the frozen axes, the room,
   * and the requirement flags — an inversion alone would have admitted the four
   * ids registered with any axes at all. */
  it('⭐⭐ ER-R2 · the exact FIVE are registered, with the frozen axes', () => {
    const FROZEN = {
      'retrieved.writer_editorial_locus':  ['member', 'retrieved', 'situate'],
      /* ⭐ WS-EDITORIAL-SCOPE-01 · the surround shares the locus's axes because
         it is the same writer's text — and is its own id because it carries a
         different permission. ⛔ Read, never changed. */
      'retrieved.writer_editorial_surround': ['member', 'retrieved', 'situate'],
      'member.writer_editorial_history':   ['member', 'retrieved', 'situate'],
      'system.writer_editorial_history':   ['system', 'retrieved', 'situate'],
      'member.writer_editorial_act':       ['member', 'declared',  'situate'],
    } as const;
    /* the declared set and the registered set are the SAME four */
    expect([...EDITORIAL_PRODUCER_IDS].sort()).toEqual(Object.keys(FROZEN).sort());
    for (const [id, axes] of Object.entries(FROZEN)) {
      expect(PRODUCER_IDS as readonly string[]).toContain(id);
      const spec = PRODUCER_REGISTRY[id as keyof typeof PRODUCER_REGISTRY];
      expect([spec.authoredBy, spec.participationClass, spec.authority]).toEqual(axes);
      /* ⭐ the contract's own declaration and the registry must not diverge */
      const declared = EDITORIAL_PRODUCERS[id as keyof typeof EDITORIAL_PRODUCERS];
      expect([declared.authoredBy, declared.participationClass, declared.authority]).toEqual(axes);
    }
  });

  it('⛔ ER-R2 · none of the five is registered outside writers_studio', () => {
    for (const id of EDITORIAL_PRODUCER_IDS) {
      const spec = PRODUCER_REGISTRY[id as keyof typeof PRODUCER_REGISTRY];
      expect(spec.rooms).toEqual(['writers_studio']);
      expect(spec.mandatory).toBe(false);
      expect(spec.scope).toBe('route');
      expect(spec.requires.identity).toBe('verified');
      expect(spec.requires.notSanctuary).toBe(false);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   D · HISTORY AUTHORITY
   ══════════════════════════════════════════════════════════════════════════ */

describe('D · ask_turns is the authoritative editorial conversation', () => {
  it('W4-C4 · ⭐⭐ a generic conversation history offered alongside is IGNORED', () => {
    const h = editorialHistory(
      [{ turnIndex: 0, speaker: 'author', body: 'Why?' },
       { turnIndex: 1, speaker: 'maia', body: 'Because.' }],
      [{ role: 'user', content: 'a Studio chat turn' },
       { role: 'assistant', content: 'a Focus turn' }],
    );
    expect(h.map((r) => r.body)).toEqual(['Why?', 'Because.']);
    /* ⭐ and the record's OWN index survives — the only order discourse has */
    expect(h.map((r) => r.turnIndex)).toEqual([0, 1]);
    expect(JSON.stringify(h)).not.toContain('Studio chat');
    expect(JSON.stringify(h)).not.toContain('Focus turn');
  });

  it('W4-C4b · authorship survives the mapping', () => {
    const h = editorialHistory([{ turnIndex: 0, speaker: 'author', body: 'a' },
                                { turnIndex: 1, speaker: 'maia', body: 'b' }]);
    expect(h.map((r) => r.author)).toEqual(['member', 'maia']);
  });

  it('⭐ the thread is the conversation identity; the invocation is one act in it', () => {
    expect(editorialTurnIdentity('THREAD-1', 'EXCHANGE-9'))
      .toEqual({ sessionRef: 'THREAD-1', turnId: 'EXCHANGE-9' });
  });

  it('⛔ the forbidden calls are named, so the service seam has one list to fail against', () => {
    expect(EDITORIAL_HISTORY_AUTHORITY).toBe('ask_turns');
    expect([...FORBIDDEN_FOR_EDITORIAL_TURNS]).toEqual([
      'getConversationHistory', 'addConversationExchange', 'TurnsStore.addExchange',
    ]);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   F · THE MEMBER'S DECLARED ACT
   ══════════════════════════════════════════════════════════════════════════ */

describe('F · a Direction is declared by the member, never classified', () => {
  it('W4-C5 · ⭐⭐ imperative prose declared as DISCOURSE creates no Direction', () => {
    /* The exact sentence a classifier would call a Direction. */
    const plan = memberActPlan({
      act: 'discourse', text: 'Could we make this less absolute?', refersTo: null,
    });
    expect(plan.atomic.map((w) => w.write)).toEqual(['append_member_turn']);
    expect(JSON.stringify(plan)).not.toContain('direction');
  });

  it('W4-C5b · ⛔ [SOURCE] no function anywhere takes text alone and returns an act', () => {
    /* anti-vacuity */
    expect(CONTRACT).toMatch(/export const MEMBER_ACT_KINDS/);
    /* ⛔ No classifier vocabulary, and no act inferred from a body. */
    expect(CONTRACT).not.toMatch(/classif|detectAct|inferAct|looksLike|isImperative/i);
    expect(CONTRACT).not.toMatch(/act\s*[:=]\s*[^;]*\b(includes|match|test|startsWith)\(/);
    /* the act is a closed member-selected discriminant */
    expect([...MEMBER_ACT_KINDS]).toEqual(['discourse', 'direction']);
  });

  it('W4-C6 · ⭐⭐ one Direction act yields turn + Direction + binding, atomically', () => {
    const plan = memberActPlan({
      act: 'direction', text: 'Try it less absolute.', refersTo: null,
    });
    expect(plan.atomic.map((w) => w.write)).toEqual([
      'append_member_turn', 'create_member_direction', 'bind_turn_to_direction',
    ]);
    expect(plan.beforeCognition).toBe(true);
  });

  it('W4-C6b · ⭐⭐ the instruction IS the turn body — never a paraphrase', () => {
    const text = 'Try it less absolute.';
    const plan = memberActPlan({ act: 'direction', text, refersTo: null });
    const turn = plan.atomic.find((w) => w.write === 'append_member_turn')!;
    const dir = plan.atomic.find((w) => w.write === 'create_member_direction')!;
    expect('body' in turn && turn.body).toBe(text);
    expect('instruction' in dir && dir.instruction).toBe(text);
  });

  it('W4-C6c · ⛔ an explicit reference travels; absence stays null', () => {
    const withRef = memberActPlan({ act: 'direction', text: 'Back to V1.', refersTo: 'V1' });
    const without = memberActPlan({ act: 'direction', text: 'Softer.', refersTo: null });
    const refOf = (p: ReturnType<typeof memberActPlan>) => {
      const d = p.atomic.find((w) => w.write === 'create_member_direction')!;
      return 'refersTo' in d ? d.refersTo : undefined;
    };
    expect(refOf(withRef)).toBe('V1');
    /* ⛔ never filled from the current focus — the writer's silence is not a reference */
    expect(refOf(without)).toBeNull();
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   G · MAIA'S OUTCOME
   ══════════════════════════════════════════════════════════════════════════ */

const CALL = (input: unknown, name = EDITORIAL_TOOL_NAME) =>
  ({ type: 'tool_use' as const, id: 't1', name, input });
const TEXT = (text: string) => ({ type: 'text' as const, text });

describe('A · the tool geometry, on the blocks that actually arrived', () => {
  it('W4-C13 · ⭐⭐ a plain object presented without a tool call is not an answer', () => {
    expect(admitEditorialToolEnvelope([TEXT('{"kind":"reply_only","reply":"r"}')]))
      .toEqual({ ok: false, reason: 'not_through_tool' });
    expect(admitEditorialToolEnvelope([])).toEqual({ ok: false, reason: 'not_through_tool' });
  });

  it('W4-C14 · ⭐⭐ two editorial_outcome calls are MALFORMED — never take-first', () => {
    const r = admitEditorialToolEnvelope([
      CALL({ kind: 'reply_only', reply: 'first' }),
      CALL({ kind: 'reply_only', reply: 'second' }),
    ]);
    expect(r).toEqual({ ok: false, reason: 'malformed' });
    expect(JSON.stringify(r)).not.toContain('first');
  });

  it('W4-C14b · ⛔ the right tool beside another tool is also malformed', () => {
    expect(admitEditorialToolEnvelope([
      CALL({ kind: 'reply_only', reply: 'r' }),
      CALL({ anything: true }, 'some_other_tool'),
    ])).toEqual({ ok: false, reason: 'malformed' });
  });

  it('W4-C14c · ⛔ some other tool alone is malformed, not "no tool"', () => {
    expect(admitEditorialToolEnvelope([CALL({ x: 1 }, 'revision_outcome')]))
      .toEqual({ ok: false, reason: 'malformed' });
  });

  it('⭐⭐ prose may ARRIVE; prose carries zero authority to create an act', () => {
    /* ⭐ The corrected law. Text blocks are VISIBLE to the envelope parser —
       that visibility is how their zero weight is proved — and are never
       promoted, merged, or used to repair a malformed input. */
    const withProse = admitEditorialToolEnvelope([
      TEXT("Try: 'He stayed there, held by the river.'"),
      CALL({ kind: 'reply_only', reply: 'I would leave this alone.' }),
      TEXT('Another stray thought.'),
    ]);
    expect(withProse).toEqual({
      ok: true, outcome: { kind: 'reply_only', reply: 'I would leave this alone.' } });
    /* ⛔ and a text block cannot REPAIR a malformed tool input */
    expect(admitEditorialToolEnvelope([
      TEXT('{"kind":"reply_only","reply":"rescued"}'),
      CALL({ kind: 'reply_only' }),
    ])).toEqual({ ok: false, reason: 'malformed' });
  });

  it('⛔ no vendor termination vocabulary is consulted', () => {
    expect(CONTRACT).not.toMatch(/stopReason|stop_reason|end_turn|max_tokens/);
  });

  it('⛔ `not_through_tool` is unreachable once a tool call exists', () => {
    expect(admitEditorialToolEnvelope([CALL('not an object')]))
      .toEqual({ ok: false, reason: 'malformed' });
    expect(admitEditorialToolInput(null)).toEqual({ ok: false, reason: 'malformed' });
  });
});

describe('G · one reply, at most one candidate formulation', () => {
  it('W4-C7 · ⭐⭐ reply_only creates no ProposalVersion', () => {
    const a = admitEditorialToolInput({ kind: 'reply_only', reply: 'I would leave this alone.' });
    expect(a.ok).toBe(true);
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    expect(plan.atomic.map((w) => w.write)).toEqual(['append_maia_turn']);
  });

  it('W4-C8 · ⭐ reply_with_proposal permits exactly ONE candidate', () => {
    const a = admitEditorialToolInput({
      kind: 'reply_with_proposal', reply: 'The repetition is doing the work.',
      proposal: { replacementText: 'He stayed there, held by the river.', rationale: 'Quieter.' },
    });
    expect(a.ok).toBe(true);
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    expect(plan.atomic.filter((w) => w.write === 'append_maia_version')).toHaveLength(1);
  });

  it('W4-C8b · ⛔ an array of proposals is refused — the substrate has no branch', () => {
    expect(admitEditorialToolInput({
      kind: 'reply_with_proposal', reply: 'Three options:',
      proposal: [{ replacementText: 'a' }, { replacementText: 'b' }],
    })).toEqual({ ok: false, reason: 'multiple_proposals' });
  });

  it('W4-C9 · ⭐⭐ the candidate carries the INVOCATION predecessor, unchanged', () => {
    const a = admitEditorialToolInput({
      kind: 'reply_with_proposal', reply: 'r', proposal: { replacementText: 'w' } });
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    const v = plan.atomic.find((w) => w.write === 'append_maia_version')!;
    expect('supersedes' in v && v.supersedes).toBe('V2');
  });

  it('W4-C9b · a zero-version chain authors a root', () => {
    const a = admitEditorialToolInput({
      kind: 'reply_with_proposal', reply: 'r', proposal: { replacementText: 'w' } });
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome,
      { ...INVOCATION, authoredAgainstVersionId: null });
    const v = plan.atomic.find((w) => w.write === 'append_maia_version')!;
    expect('supersedes' in v && v.supersedes).toBeNull();
  });

  it('W4-C10 · ⭐⭐ [SOURCE] there is no head to substitute — the field does not exist', () => {
    /* anti-vacuity */
    expect(CONTRACT).toMatch(/export interface EditorialInvocation/);
    /* ⛔ no head field, no head lookup, no re-read of "newest" */
    expect(CONTRACT).not.toMatch(/headVersionId|headOf|currentHead|latestVersion/);
    /* and the plan reads the invocation and nothing else for the predecessor */
    expect(CONTRACT).toMatch(/supersedes: invocation\.authoredAgainstVersionId/);
  });

  it('W4-C10b · ⭐ a stale predecessor costs MAIA her turn — never a rebase', () => {
    expect(onVersionRefusal()).toEqual({
      persistMaiaTurn: false, rebaseOntoHead: false, retry: false,
      respondWith: 'succession_refusal',
    });
  });

  it('W4-C11 · ⭐⭐ prose containing quoted wording is NOT a ProposalVersion', () => {
    const a = admitEditorialToolInput({
      kind: 'reply_only',
      reply: "Try: 'He stayed there, held by the river.' — that keeps the image.",
    });
    expect(a.ok).toBe(true);
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    expect(plan.atomic.map((w) => w.write)).toEqual(['append_maia_turn']);
    expect(JSON.stringify(plan)).not.toContain('append_maia_version');
  });

  it('W4-C11b · ⭐⭐ [SOURCE] prose is visible to the ENVELOPE and reaches no outcome', () => {
    /* ⚠️ THIS OBLIGATION WAS REWRITTEN, NOT DELETED. It used to assert *"the
       admitter cannot see prose — there is no text parameter"*, and the founder
       withdrew that law as TOO STRONG (2026-09-14): the envelope parser must see
       the block geometry in order to PROVE that text blocks carry zero weight.
       A law stated as blindness cannot be falsified; a law stated as authority
       can.

           Prose may arrive; prose carries ZERO AUTHORITY
           to create a semantic editorial act.

       ⭐ So the split is the obligation: the ENVELOPE sees blocks, and the
       function that builds the semantic outcome receives only a tool input. */
    expect(CONTRACT).toMatch(
      /export function admitEditorialToolEnvelope\(\s*blocks: readonly StructuredBlock\[\],\s*\)/);
    expect(CONTRACT).toMatch(/export function admitEditorialToolInput\(input: unknown\)/);
    /* ⛔ the outcome builder never receives a block, a text, or a completion */
    expect(CONTRACT).not.toMatch(/admitEditorialToolInput\([^)]*(blocks|text|completion)/);
    /* ⛔ and nothing anywhere reads a text block's contents for meaning */
    expect(CONTRACT).not.toMatch(/b\.text|\.type === 'text'/);
  });

  it('W4-C12 · ⭐⭐ an RC-GEN-01 section outcome cannot narrow into this one', () => {
    expect(admitEditorialToolInput({
      kind: 'proposals',
      proposals: [{ sectionId: 's1', proposedText: 'whole section', reason: 'r' }],
    })).toEqual({ ok: false, reason: 'section_scoped_outcome' });
    expect(admitEditorialToolInput({
      kind: 'reply_with_proposal', reply: 'r',
      proposal: { sectionId: 's1', replacementText: 'w' },
    })).toEqual({ ok: false, reason: 'section_scoped_outcome' });
  });

  it('W4-C12b · ⛔ [SOURCE] RC-GEN-01 is precedent, not a dependency', () => {
    expect(CONTRACT).toMatch(/export const EDITORIAL_TOOL_NAME/);
    expect(CONTRACT).not.toMatch(/from '.*manuscript\/revision/);
    expect(EDITORIAL_TOOL_NAME).toBe('editorial_outcome');
  });

  it('⛔ a malformed input is malformed — `not_through_tool` belongs to the envelope', () => {
    /* ⚠️ REWRITTEN WITH W4-1.1. This used to expect `not_through_tool` from a
       bare string, which is what the pre-seal admitter returned — and that was
       the defect: `not_through_tool` meant roughly *"not an object"* rather than
       *"MAIA did not answer through the required tool"*. The tool question is
       now answered one layer up, where the blocks are. */
    expect(admitEditorialToolInput('Because the repetition carries it.'))
      .toEqual({ ok: false, reason: 'malformed' });
    expect(admitEditorialToolInput(null)).toEqual({ ok: false, reason: 'malformed' });
    expect(admitEditorialToolInput({ kind: 'reply_only' }))
      .toEqual({ ok: false, reason: 'malformed' });
    expect(admitEditorialToolInput({ kind: 'something_else', reply: 'r' }))
      .toEqual({ ok: false, reason: 'malformed' });
  });

  it('W4-C20 · ⭐⭐ MAIA authors a Direction through the ENVELOPE, never from prose', () => {
    const a = admitEditorialToolInput({
      kind: 'reply_with_direction',
      reply: 'Let me try this less abstractly first.',
      direction: { instruction: 'Work the concrete image before the argument.',
                   refersTo: 'V1' },
    });
    expect(a.ok).toBe(true);
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    expect(plan.atomic.map((w) => w.write)).toEqual([
      'append_maia_turn', 'create_maia_direction', 'bind_turn_to_direction',
    ]);
    const d = plan.atomic.find((w) => w.write === 'create_maia_direction')!;
    /* ⭐ HER OWN WORDS, verbatim — the member-side law, unchanged. */
    expect('instruction' in d && d.instruction)
      .toBe('Work the concrete image before the argument.');
    expect('refersTo' in d && d.refersTo).toBe('V1');
    /* ⛔ and NO ProposalVersion */
    expect(JSON.stringify(plan)).not.toContain('append_maia_version');
  });

  it('W4-C20b · ⭐⭐ the same sentence as reply_only authors NOTHING', () => {
    /* ⛔ The member-side anti-classification law, exact twin. Identical prose,
       a different declared act — and the system may not close the gap. */
    const a = admitEditorialToolInput({
      kind: 'reply_only', reply: 'Let me try this less abstractly first.' });
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    expect(plan.atomic.map((w) => w.write)).toEqual(['append_maia_turn']);
  });

  it('W4-C20c · ⛔ ONE semantic adjunct per turn', () => {
    expect(admitEditorialToolInput({
      kind: 'reply_with_direction', reply: 'r',
      direction: { instruction: 'i' }, proposal: { replacementText: 'w' },
    })).toEqual({ ok: false, reason: 'multiple_adjuncts' });
    expect(admitEditorialToolInput({
      kind: 'reply_with_proposal', reply: 'r',
      proposal: { replacementText: 'w' }, direction: { instruction: 'i' },
    })).toEqual({ ok: false, reason: 'multiple_adjuncts' });
    expect(admitEditorialToolInput({
      kind: 'reply_only', reply: 'r', direction: { instruction: 'i' },
    })).toEqual({ ok: false, reason: 'malformed' });
  });

  it('W4-C20d · ⛔ a blank instruction is refused; absent refersTo is null, not a guess', () => {
    expect(admitEditorialToolInput({
      kind: 'reply_with_direction', reply: 'r', direction: { instruction: '  ' },
    })).toEqual({ ok: false, reason: 'malformed' });
    const a = admitEditorialToolInput({
      kind: 'reply_with_direction', reply: 'r', direction: { instruction: 'i' } });
    expect((a as { ok: true; outcome: { direction: { refersTo: unknown } } })
      .outcome.direction.refersTo).toBeNull();
    expect(admitEditorialToolInput({
      kind: 'reply_with_direction', reply: 'r',
      direction: { instruction: 'i', refersTo: 7 },
    })).toEqual({ ok: false, reason: 'malformed' });
  });

  it('E · ⭐ a blank reply is not a reply; rationale is absent OR nonblank', () => {
    expect(admitEditorialToolInput({ kind: 'reply_only', reply: '   ' }))
      .toEqual({ ok: false, reason: 'malformed' });
    expect(admitEditorialToolInput({
      kind: 'reply_with_proposal', reply: 'r',
      proposal: { replacementText: 'w', rationale: '' },
    })).toEqual({ ok: false, reason: 'malformed' });
  });

  it('E · ⭐⭐ an EMPTY replacementText stays lawful — a deletion is a formulation', () => {
    const a = admitEditorialToolInput({
      kind: 'reply_with_proposal', reply: 'Cut it.', proposal: { replacementText: '' } });
    expect(a.ok).toBe(true);
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    const v = plan.atomic.find((w) => w.write === 'append_maia_version')!;
    expect('replacementText' in v && v.replacementText).toBe('');
  });

  it('⛔ a proposal riding along with reply_only is a contradiction, not a bonus', () => {
    expect(admitEditorialToolInput({
      kind: 'reply_only', reply: 'r', proposal: { replacementText: 'w' },
    })).toEqual({ ok: false, reason: 'malformed' });
  });

  it('⭐ the schema itself forbids the section shape and the array', () => {
    const props = (editorialToolSchema.properties as Record<string, Record<string, unknown>>);
    expect(editorialToolSchema.additionalProperties).toBe(false);
    expect(props.proposal.type).toBe('object');
    expect(JSON.stringify(editorialToolSchema)).not.toContain('sectionId');
    expect(JSON.stringify(editorialToolSchema)).not.toContain('proposedText');
    expect((props.kind.enum as string[]))
      .toEqual(['reply_only', 'reply_with_direction', 'reply_with_proposal']);
    /* ⛔ and the Direction adjunct is an OBJECT, not an array — one per turn */
    expect(props.direction.type).toBe('object');
    expect(props.direction.additionalProperties).toBe(false);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   LIFECYCLE AND POSTURE
   ══════════════════════════════════════════════════════════════════════════ */

describe('lifecycle · withdrawal removes bindings, never authored acts', () => {
  it('⭐⭐ withdrawing discourse never deletes a Direction or a ProposalVersion', () => {
    expect(withdrawalEffect()).toEqual({
      removesTurnDirectionBinding: true, removesTurnVersionBinding: true,
      deletesDirection: false, deletesVersion: false,
    });
  });

  it('⛔ [PROSE] the impossible-lifecycle reasoning is recorded, not implied', () => {
    /* Read RAW: this is a claim about the file's stated reasoning. */
    expect(CONTRACT_RAW).toMatch(/RESTRICT/);
    expect(CONTRACT_RAW).toMatch(/CASCADE/);
    expect(CONTRACT_RAW).toMatch(/SET NULL/);
  });

  it('⭐ ordering: member turn before cognition; MAIA persists only after admission', () => {
    expect(memberActPlan({ act: 'discourse', text: 'x', refersTo: null }).beforeCognition).toBe(true);
    const a = admitEditorialToolInput({ kind: 'reply_only', reply: 'r' });
    expect(maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION)
      .afterAdmission).toBe(true);
  });
});

describe('sanctuary · ordinary, because no act exists to make it otherwise', () => {
  it('⛔⛔ there is no parameter — a caller cannot assert a Sanctuary act', () => {
    /* ⚠️ W4-1.1. The first cut took a boolean and turned `true` into
       `{ sanctuary: true, source: 'member_act' }`, pre-authorizing an act that
       does not exist on the word of a caller. A parameter is not a signal; it
       is a place a future caller can assert consent that was never given. */
    expect(editorialPosture()).toEqual({
      sanctuary: false, source: 'ordinary_no_act_available' });
    expect(editorialPosture.length).toBe(0);
    expect(CONTRACT).toMatch(/export function editorialPosture\(\): \{/);
    expect(CONTRACT).not.toMatch(/member_act/);
  });
});
