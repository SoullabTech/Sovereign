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
  EDITORIAL_TOOL_NAME, editorialToolSchema, admitEditorialOutcome,
  maiaOutcomePlan, onVersionRefusal, withdrawalEffect, editorialPosture,
  type EditorialRecord, type EditorialInvocation,
} from '../contract';
import { PRODUCER_IDS } from '@/lib/maia/canonical-turn/producerRegistry';

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

const HISTORY: readonly EditorialRecord[] = [
  { kind: 'insight', author: 'maia', text: 'The paragraph turns twice on "fixated".' },
  { kind: 'turn', author: 'member', text: 'Why?' },
  { kind: 'turn', author: 'maia', text: 'Because the repetition carries the emotional turn.' },
  { kind: 'direction', author: 'member', text: 'Try it less absolute.', refersTo: null },
  { kind: 'version', author: 'maia', text: 'He stayed there, held by the river.' },
  { kind: 'version', author: 'member', text: 'He stayed by the river.' },
];

describe('C1 · editorial participation partitions by authorship', () => {
  const blocks = editorialCandidates({
    locus: { chainId: 'C1', originalText: 'He was there, fixated, and the river ran on.' },
    history: HISTORY,
    declaredAct: 'discourse',
  });

  it('W4-C2 · ⭐⭐ one mixed member+system producer is unrepresentable', () => {
    /* Every record lands in the producer whose declared authorship is its own —
       and `authoredBy` is a per-producer CONSTANT, so no block can hold both. */
    for (const r of HISTORY) {
      const id = producerForRecord(r);
      expect(EDITORIAL_PRODUCERS[id].authoredBy)
        .toBe(r.author === 'member' ? 'member' : 'system');
    }
    const member = blocks.find((b) => b.producerId === 'member.writer_editorial_history')!;
    const maia = blocks.find((b) => b.producerId === 'system.writer_editorial_history')!;
    /* ⛔ No member text in the system block, and none of hers in theirs. */
    expect(member.text).toContain('Try it less absolute.');
    expect(member.text).not.toContain('held by the river');
    expect(maia.text).toContain('held by the river');
    expect(maia.text).not.toContain('Try it less absolute.');
  });

  it('W4-C2b · ⭐ object kinds stay visibly labelled inside a block', () => {
    const maia = blocks.find((b) => b.producerId === 'system.writer_editorial_history')!;
    /* Sharing provenance axes does not make an Insight a turn. */
    expect(maia.text).toContain('MAIA noticed');
    expect(maia.text).toContain('MAIA said');
    expect(maia.text).toContain('MAIA proposed wording');
    const member = blocks.find((b) => b.producerId === 'member.writer_editorial_history')!;
    expect(member.text).toContain('the writer directed');
    expect(member.text).toContain('the writer said');
  });

  it('W4-C3 · ⭐⭐ the declared-act producer carries the KIND and nothing else', () => {
    /* ⚠️ A MUTANT SURVIVED THE FIRST WRITING OF THIS OBLIGATION. It asserted an
       ABSENCE — that the current utterance is not in the block — while the
       ruling is stronger: the producer *carries ONLY the member-declared kind*,
       ⛔ not a second copy of their words. `M-W4-UTTERANCE-AS-HISTORY` copied
       the HISTORY into the block and satisfied the absence test completely.

       ⭐ Re-asserted as the whole assignment. A block whose exact text is the
       declaration cannot also be carrying prose, whatever the prose is. */
    const b = editorialCandidates({
      locus: { chainId: 'C1', originalText: 'x' }, history: HISTORY, declaredAct: 'discourse',
    });
    const act = b.find((x) => x.producerId === 'member.writer_editorial_act')!;
    expect(act.text).toBe("[The writer's declared act] discourse");
    expect(b.find((x) => x.producerId === 'member.writer_editorial_act')!.itemCount)
      .toBeUndefined();
  });

  it('W4-C3b · ⭐⭐ the current utterance cannot reach participation AT ALL', () => {
    /* ⛔ Structural, not a filter: `EditorialParticipationInput` has no field
       for it. The live sentence is `CanonicalTurn.encounter.input`, and a
       function that cannot receive it cannot duplicate it. */
    const utterance = 'Could we make this less absolute?';
    const b = editorialCandidates({
      locus: { chainId: 'C1', originalText: 'x' }, history: HISTORY, declaredAct: 'discourse',
    });
    for (const block of b) expect(block.text).not.toContain(utterance);
    expect(CONTRACT).toMatch(/export interface EditorialParticipationInput/);
    const iface = CONTRACT.slice(
      CONTRACT.indexOf('export interface EditorialParticipationInput'),
      CONTRACT.indexOf('const line ='));
    expect(iface.length).toBeGreaterThan(40);
    expect(iface).not.toMatch(/utterance|currentText|ask\b|input:/);
  });

  it('⛔ a producer with nothing to carry does not participate', () => {
    const empty = editorialCandidates({
      locus: { chainId: 'C1', originalText: 'x' }, history: [], declaredAct: 'direction',
    });
    expect(empty.map((b) => b.producerId)).toEqual([
      'retrieved.writer_editorial_locus', 'member.writer_editorial_act',
    ]);
  });

  it('⛔ the locus is its own producer — never retrieved.writer_work_context', () => {
    expect(EDITORIAL_PRODUCER_IDS).toContain('retrieved.writer_editorial_locus');
    expect(CONTRACT).not.toMatch(/retrieved\.writer_work_context/);
  });

  it('⛔ [SOURCE] declared, NOT registered — the producer registry is untouched', () => {
    /* anti-vacuity: the registry really has producers */
    expect(PRODUCER_IDS.length).toBeGreaterThan(30);
    for (const id of EDITORIAL_PRODUCER_IDS) {
      expect(PRODUCER_IDS as readonly string[]).not.toContain(id);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   D · HISTORY AUTHORITY
   ══════════════════════════════════════════════════════════════════════════ */

describe('D · ask_turns is the authoritative editorial conversation', () => {
  it('W4-C4 · ⭐⭐ a generic conversation history offered alongside is IGNORED', () => {
    const h = editorialHistory(
      [{ speaker: 'author', body: 'Why?' }, { speaker: 'maia', body: 'Because.' }],
      [{ role: 'user', content: 'a Studio chat turn' },
       { role: 'assistant', content: 'a Focus turn' }],
    );
    expect(h.map((r) => r.text)).toEqual(['Why?', 'Because.']);
    expect(JSON.stringify(h)).not.toContain('Studio chat');
    expect(JSON.stringify(h)).not.toContain('Focus turn');
  });

  it('W4-C4b · authorship survives the mapping', () => {
    const h = editorialHistory([{ speaker: 'author', body: 'a' }, { speaker: 'maia', body: 'b' }]);
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

describe('G · one reply, at most one candidate formulation', () => {
  it('W4-C7 · ⭐⭐ reply_only creates no ProposalVersion', () => {
    const a = admitEditorialOutcome({ kind: 'reply_only', reply: 'I would leave this alone.' });
    expect(a.ok).toBe(true);
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    expect(plan.atomic.map((w) => w.write)).toEqual(['append_maia_turn']);
  });

  it('W4-C8 · ⭐ reply_with_proposal permits exactly ONE candidate', () => {
    const a = admitEditorialOutcome({
      kind: 'reply_with_proposal', reply: 'The repetition is doing the work.',
      proposal: { replacementText: 'He stayed there, held by the river.', rationale: 'Quieter.' },
    });
    expect(a.ok).toBe(true);
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    expect(plan.atomic.filter((w) => w.write === 'append_maia_version')).toHaveLength(1);
  });

  it('W4-C8b · ⛔ an array of proposals is refused — the substrate has no branch', () => {
    expect(admitEditorialOutcome({
      kind: 'reply_with_proposal', reply: 'Three options:',
      proposal: [{ replacementText: 'a' }, { replacementText: 'b' }],
    })).toEqual({ ok: false, reason: 'multiple_proposals' });
  });

  it('W4-C9 · ⭐⭐ the candidate carries the INVOCATION predecessor, unchanged', () => {
    const a = admitEditorialOutcome({
      kind: 'reply_with_proposal', reply: 'r', proposal: { replacementText: 'w' } });
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    const v = plan.atomic.find((w) => w.write === 'append_maia_version')!;
    expect('supersedes' in v && v.supersedes).toBe('V2');
  });

  it('W4-C9b · a zero-version chain authors a root', () => {
    const a = admitEditorialOutcome({
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
    const a = admitEditorialOutcome({
      kind: 'reply_only',
      reply: "Try: 'He stayed there, held by the river.' — that keeps the image.",
    });
    expect(a.ok).toBe(true);
    const plan = maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION);
    expect(plan.atomic.map((w) => w.write)).toEqual(['append_maia_turn']);
    expect(JSON.stringify(plan)).not.toContain('append_maia_version');
  });

  it('W4-C11b · ⛔ [SOURCE] the admitter cannot see prose — there is no text parameter', () => {
    expect(CONTRACT).toMatch(/export function admitEditorialOutcome\(envelope: unknown\)/);
    expect(CONTRACT).not.toMatch(/admitEditorialOutcome\([^)]*text/);
    /* and nothing anywhere extracts quoted wording */
    expect(CONTRACT).not.toMatch(/\/\["']\.\*\?\["']\/|match\(\/.*\['"\]/);
  });

  it('W4-C12 · ⭐⭐ an RC-GEN-01 section outcome cannot narrow into this one', () => {
    expect(admitEditorialOutcome({
      kind: 'proposals',
      proposals: [{ sectionId: 's1', proposedText: 'whole section', reason: 'r' }],
    })).toEqual({ ok: false, reason: 'section_scoped_outcome' });
    expect(admitEditorialOutcome({
      kind: 'reply_with_proposal', reply: 'r',
      proposal: { sectionId: 's1', replacementText: 'w' },
    })).toEqual({ ok: false, reason: 'section_scoped_outcome' });
  });

  it('W4-C12b · ⛔ [SOURCE] RC-GEN-01 is precedent, not a dependency', () => {
    expect(CONTRACT).toMatch(/export const EDITORIAL_TOOL_NAME/);
    expect(CONTRACT).not.toMatch(/from '.*manuscript\/revision/);
    expect(EDITORIAL_TOOL_NAME).toBe('editorial_outcome');
  });

  it('⛔ prose is not an answer — a bare string or a text block is refused', () => {
    expect(admitEditorialOutcome('Because the repetition carries it.'))
      .toEqual({ ok: false, reason: 'not_through_tool' });
    expect(admitEditorialOutcome(null)).toEqual({ ok: false, reason: 'not_through_tool' });
    expect(admitEditorialOutcome({ kind: 'reply_only' })).toEqual({ ok: false, reason: 'malformed' });
    expect(admitEditorialOutcome({ kind: 'something_else', reply: 'r' }))
      .toEqual({ ok: false, reason: 'malformed' });
  });

  it('⛔ a proposal riding along with reply_only is a contradiction, not a bonus', () => {
    expect(admitEditorialOutcome({
      kind: 'reply_only', reply: 'r', proposal: { replacementText: 'w' },
    })).toEqual({ ok: false, reason: 'malformed' });
  });

  it('⭐ the schema itself forbids the section shape and the array', () => {
    const props = (editorialToolSchema.properties as Record<string, Record<string, unknown>>);
    expect(editorialToolSchema.additionalProperties).toBe(false);
    expect(props.proposal.type).toBe('object');
    expect(JSON.stringify(editorialToolSchema)).not.toContain('sectionId');
    expect(JSON.stringify(editorialToolSchema)).not.toContain('proposedText');
    expect((props.kind.enum as string[])).toEqual(['reply_only', 'reply_with_proposal']);
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
    const a = admitEditorialOutcome({ kind: 'reply_only', reply: 'r' });
    expect(maiaOutcomePlan((a as { ok: true; outcome: never }).outcome, INVOCATION)
      .afterAdmission).toBe(true);
  });
});

describe('sanctuary · ordinary, because no act exists to make it otherwise', () => {
  it('⛔ no posture is fabricated where the surface supplies no act', () => {
    expect(editorialPosture(false))
      .toEqual({ sanctuary: false, source: 'ordinary_no_act_available' });
    expect(editorialPosture(true)).toEqual({ sanctuary: true, source: 'member_act' });
  });
});
