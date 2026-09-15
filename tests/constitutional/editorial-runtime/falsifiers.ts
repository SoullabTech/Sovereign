/**
 * WS-EDITORIAL-RUNTIME-01 · THE FALSIFIERS.
 *
 * ⛔ Every obligation here runs against ANY candidate implementing the seam, so
 * that lethality can be proved BEFORE an implementation exists. A suite written
 * against a live implementation tests what that implementation happens to do.
 */
import type { EditorialRuntime, DurableFact, Invocation } from './runtimeSeam';

export interface Result { readonly id: string; readonly ok: boolean; readonly detail?: string }
const pass = (id: string): Result => ({ id, ok: true });
const fail = (id: string, detail: string): Result => ({ id, ok: false, detail });

const INV: Invocation = {
  chainId: 'chain-1', threadId: 'thread-1', nextTurnIndex: 4,
  invokedAgainstVersionId: 'v-PREDECESSOR',
};

/** ⭐ Prose that READS exactly like a steering instruction — and is declared as discourse. */
const DIRECTIVE_SOUNDING = 'Could you make this quieter?';
/** ⭐ MAIA prose that READS exactly like a suggestion — under reply_only. */
const SUGGESTIVE_SOUNDING = 'I might tighten this paragraph, perhaps: "the water, held".';

const has = (d: readonly DurableFact[], f: DurableFact['fact']) => d.some((x) => x.fact === f);
const of_ = <K extends DurableFact['fact']>(d: readonly DurableFact[], f: K) =>
  d.filter((x) => x.fact === f) as Extract<DurableFact, { fact: K }>[];

export const FALSIFIERS: ReadonlyArray<{ id: string; law: string; run(r: EditorialRuntime): Result }> = [
  {
    id: 'ER-F1',
    law: '⛔ member prose that SOUNDS directive, declared as discourse, mints NO Direction',
    run(r) {
      const out = r.memberAct({ act: 'discourse', text: DIRECTIVE_SOUNDING, refersTo: null }, INV);
      if (!out.ok) return fail('ER-F1', `ordinary discourse was refused: ${out.refusal}`);
      if (has(out.durable, 'member_direction'))
        return fail('ER-F1', '⛔⛔ a Direction was inferred from prose the member did not declare as one');
      if (has(out.durable, 'binding'))
        return fail('ER-F1', '⛔ a binding was created for an adjunct that must not exist');
      if (!has(out.durable, 'member_turn')) return fail('ER-F1', 'the member turn did not persist');
      return pass('ER-F1');
    },
  },
  {
    id: 'ER-F2',
    law: '⭐ a DECLARED member Direction carries the turn body character for character',
    run(r) {
      const text = '  Make it quieter.  ';
      const out = r.memberAct({ act: 'direction', text, refersTo: 'v-2' }, INV);
      if (!out.ok) return fail('ER-F2', `a declared Direction was refused: ${out.refusal}`);
      const ds = of_(out.durable, 'member_direction');
      if (ds.length !== 1) return fail('ER-F2', `expected exactly 1 Direction, got ${ds.length}`);
      if (ds[0]!.instruction !== text)
        return fail('ER-F2', `⛔ the instruction was rewritten by the host: [${ds[0]!.instruction}]`);
      if (ds[0]!.refersTo !== 'v-2') return fail('ER-F2', 'the explicit reference was lost');
      if (!has(out.durable, 'binding')) return fail('ER-F2', 'the turn↔act binding is missing');
      return pass('ER-F2');
    },
  },
  {
    id: 'ER-F3',
    law: '⛔⛔ MAIA prose that SOUNDS like a suggestion, under reply_only, mints NO ProposalVersion',
    run(r) {
      const out = r.maiaAct({ kind: 'reply_only', reply: SUGGESTIVE_SOUNDING }, INV);
      if (!out.ok) return fail('ER-F3', `reply_only was refused: ${out.refusal}`);
      if (has(out.durable, 'proposal_version'))
        return fail('ER-F3', '⛔⛔ candidate wording was scraped out of MAIA prose');
      if (has(out.durable, 'maia_direction'))
        return fail('ER-F3', '⛔ a Direction was scraped out of MAIA prose');
      if (has(out.durable, 'binding')) return fail('ER-F3', '⛔ a binding with nothing to bind');
      if (!has(out.durable, 'maia_turn')) return fail('ER-F3', 'MAIA’s turn did not persist');
      return pass('ER-F3');
    },
  },
  {
    id: 'ER-F4',
    law: '⭐⭐ a proposal succeeds the EXACT predecessor MAIA was invoked against — no head lookup',
    run(r) {
      const out = r.maiaAct(
        { kind: 'reply_with_proposal', reply: 'Try this.', proposal: { formulation: ', held', rationale: null } },
        INV,
      );
      if (!out.ok) return fail('ER-F4', `reply_with_proposal was refused: ${out.refusal}`);
      const vs = of_(out.durable, 'proposal_version');
      if (vs.length !== 1) return fail('ER-F4', `expected exactly 1 version, got ${vs.length}`);
      if (vs[0]!.supersedes !== INV.invokedAgainstVersionId)
        return fail('ER-F4', `⛔ rebased: supersedes=[${vs[0]!.supersedes}] but MAIA saw [${INV.invokedAgainstVersionId}]`);
      return pass('ER-F4');
    },
  },
  {
    id: 'ER-F5',
    law: '⛔ at most ONE semantic adjunct per MAIA turn',
    run(r) {
      const out = r.maiaAct(
        {
          kind: 'reply_with_proposal', reply: 'Both, somehow.',
          proposal: { formulation: ', held', rationale: null },
          direction: { instruction: 'and also steer', refersTo: null },
        },
        INV,
      );
      if (!out.ok) return pass('ER-F5'); /* refusing the malformed outcome is lawful */
      const n = of_(out.durable, 'proposal_version').length + of_(out.durable, 'maia_direction').length;
      if (n > 1) return fail('ER-F5', `⛔ ${n} semantic adjuncts landed on one turn`);
      return pass('ER-F5');
    },
  },
  {
    id: 'ER-F6',
    law: '⛔⛔ NO LATE EXTRACTION — observing stored discourse mints nothing',
    run(r) {
      const stored: DurableFact[] = [
        { fact: 'member_turn', turnIndex: 0, body: DIRECTIVE_SOUNDING },
        { fact: 'maia_turn', turnIndex: 1, body: SUGGESTIVE_SOUNDING },
      ];
      const minted = r.observe(stored);
      if (minted.length !== 0)
        return fail('ER-F6', `⛔⛔ ${minted.length} act(s) extracted after the fact: ${minted.map((m) => m.fact).join(', ')}`);
      return pass('ER-F6');
    },
  },
  {
    id: 'ER-F7',
    law: '⛔ the member act is ATOMIC — a refusal lands nothing, not even the turn',
    run(r) {
      /* An empty instruction cannot be a lawful Direction; the turn must not survive alone. */
      const out = r.memberAct({ act: 'direction', text: '   ', refersTo: null }, INV);
      if (out.ok) {
        if (has(out.durable, 'member_turn') && !has(out.durable, 'member_direction'))
          return fail('ER-F7', '⛔ the turn landed while its declared Direction did not — the act was split');
        return pass('ER-F7');
      }
      return pass('ER-F7');
    },
  },
  {
    id: 'ER-F8',
    law: '⭐ a declared MAIA Direction is representable — restraint is not the only lawful outcome',
    run(r) {
      const out = r.maiaAct(
        { kind: 'reply_with_direction', reply: 'Here is what I would steer toward.', direction: { instruction: 'quieter throughout', refersTo: null } },
        INV,
      );
      if (!out.ok) return fail('ER-F8', `a declared MAIA Direction was refused: ${out.refusal}`);
      if (of_(out.durable, 'maia_direction').length !== 1)
        return fail('ER-F8', 'the declared Direction did not land');
      if (has(out.durable, 'proposal_version'))
        return fail('ER-F8', '⛔ a version landed on a direction outcome');
      if (!has(out.durable, 'binding')) return fail('ER-F8', 'the turn↔act binding is missing');
      return pass('ER-F8');
    },
  },
];
