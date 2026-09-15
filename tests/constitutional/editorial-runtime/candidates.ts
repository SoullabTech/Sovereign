/**
 * WS-EDITORIAL-RUNTIME-01 · THE CORPUS.
 *
 * ⭐ One conforming REFERENCE and seven DEFEAT CANDIDATES.
 *
 * ⛔ Each defeat candidate is the SMALLEST COMPETENT embodiment of one named
 * constitutional error. It passes every other obligation — which is the whole
 * point: an error that fails everything proves nothing about discrimination.
 *
 * ⛔⛔ THE REFERENCE IS A TEST DOUBLE, NOT A SEED. It has no database, no
 * transaction and no schema. It is evidence that the laws are mutually
 * satisfiable — ⛔ never a design the implementation may be derived from.
 */
import type { EditorialRuntime, MemberAct, MaiaOutcome, Invocation, DurableFact, ActResult } from './runtimeSeam';

const ok = (durable: DurableFact[]): ActResult => ({ ok: true, durable });
const no = (refusal: string): ActResult => ({ ok: false, refusal });
const lawfulInstruction = (s: string) => s.trim().length > 0;

/* ══ THE CONFORMING REFERENCE ═══════════════════════════════════════════ */
export const REFERENCE: EditorialRuntime = {
  name: 'reference · declared-only',
  memberAct(act: MemberAct, inv: Invocation) {
    const turn: DurableFact = { fact: 'member_turn', turnIndex: inv.nextTurnIndex, body: act.text };
    /* ⭐ THE ONLY THING CONSULTED IS `act.act`. The text is never read for meaning. */
    if (act.act === 'discourse') return ok([turn]);
    if (!lawfulInstruction(act.text)) return no('a Direction must carry an instruction');
    return ok([
      turn,
      { fact: 'member_direction', instruction: act.text, refersTo: act.refersTo },
      { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'direction' },
    ]);
  },
  maiaAct(o: MaiaOutcome, inv: Invocation) {
    const turn: DurableFact = { fact: 'maia_turn', turnIndex: inv.nextTurnIndex, body: o.reply };
    /* ⭐ THE ONLY THING CONSULTED IS `o.kind`. */
    switch (o.kind) {
      case 'reply_only':
        return ok([turn]);
      case 'reply_with_direction': {
        if (!o.direction || !lawfulInstruction(o.direction.instruction)) return no('direction declared but absent');
        return ok([turn,
          { fact: 'maia_direction', instruction: o.direction.instruction, refersTo: o.direction.refersTo },
          { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'direction' }]);
      }
      case 'reply_with_proposal': {
        if (!o.proposal) return no('proposal declared but absent');
        if (o.direction) return no('one turn carries at most one semantic adjunct');
        return ok([turn,
          /* ⭐⭐ THE PREDECESSOR IS CARRIED IN, NEVER LOOKED UP. */
          { fact: 'proposal_version', formulation: o.proposal.formulation, supersedes: inv.invokedAgainstVersionId },
          { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'version' }]);
      }
    }
  },
  observe: () => [],
};

/* ══ DEFEAT CANDIDATES ══════════════════════════════════════════════════ */
const clone = (over: Partial<EditorialRuntime>, name: string): EditorialRuntime =>
  ({ ...REFERENCE, ...over, name });

/** DC-1 · the classifier. Text that reads directive becomes a Direction. */
export const DC_PROSE_DIRECTIVE = clone({
  memberAct(act, inv) {
    const looksDirective = /^(could|can|would) you\b|^make (it|this)\b|\bplease\b/i.test(act.text.trim());
    const declared = act.act === 'direction' || looksDirective;
    const turn: DurableFact = { fact: 'member_turn', turnIndex: inv.nextTurnIndex, body: act.text };
    if (!declared) return ok([turn]);
    if (!lawfulInstruction(act.text)) return no('a Direction must carry an instruction');
    return ok([turn,
      { fact: 'member_direction', instruction: act.text, refersTo: act.refersTo },
      { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'direction' }]);
  },
}, 'DC-1 · prose-directive classifier');

/** DC-2 · the scraper. Quoted wording inside MAIA prose becomes candidate text. */
export const DC_PROSE_SCRAPE = clone({
  maiaAct(o, inv) {
    if (o.kind === 'reply_only') {
      const turn: DurableFact = { fact: 'maia_turn', turnIndex: inv.nextTurnIndex, body: o.reply };
      const m = /"([^"]+)"/.exec(o.reply);
      if (!m) return ok([turn]);
      return ok([turn,
        { fact: 'proposal_version', formulation: m[1]!, supersedes: inv.invokedAgainstVersionId },
        { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'version' }]);
    }
    return REFERENCE.maiaAct(o, inv);
  },
}, 'DC-2 · MAIA prose scraper');

/** DC-3 · the rebase. Reads the chain head AFTER cognition. */
export const DC_HEAD_REBASE = clone({
  maiaAct(o, inv) {
    if (o.kind !== 'reply_with_proposal' || !o.proposal) return REFERENCE.maiaAct(o, inv);
    const headNow = 'v-HEAD-AFTER-COGNITION'; /* a lookup MAIA never saw */
    return ok([
      { fact: 'maia_turn', turnIndex: inv.nextTurnIndex, body: o.reply },
      { fact: 'proposal_version', formulation: o.proposal.formulation, supersedes: headNow },
      { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'version' }]);
  },
}, 'DC-3 · post-cognition head rebase');

/** DC-4 · the permissive turn. Honours both adjuncts when both are present. */
export const DC_BOTH_ADJUNCTS = clone({
  maiaAct(o, inv) {
    if (o.kind !== 'reply_with_proposal' || !o.proposal) return REFERENCE.maiaAct(o, inv);
    const d: DurableFact[] = o.direction
      ? [{ fact: 'maia_direction', instruction: o.direction.instruction, refersTo: o.direction.refersTo }] : [];
    return ok([
      { fact: 'maia_turn', turnIndex: inv.nextTurnIndex, body: o.reply },
      { fact: 'proposal_version', formulation: o.proposal.formulation, supersedes: inv.invokedAgainstVersionId },
      ...d,
      { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'version' }]);
  },
}, 'DC-4 · two adjuncts on one turn');

/** DC-5 · the late extractor. A tidy-up pass over stored discourse. */
export const DC_LATE_EXTRACT = clone({
  observe(stored) {
    return stored.flatMap<DurableFact>((f) =>
      f.fact === 'member_turn' && /^(could|can|would) you\b/i.test(f.body)
        ? [{ fact: 'member_direction', instruction: f.body, refersTo: null }] : []);
  },
}, 'DC-5 · late extraction on observe');

/** DC-6 · the split act. The turn is written first and separately. */
export const DC_SPLIT_ACT = clone({
  memberAct(act, inv) {
    const turn: DurableFact = { fact: 'member_turn', turnIndex: inv.nextTurnIndex, body: act.text };
    if (act.act === 'discourse') return ok([turn]);
    /* the turn has already landed; the adjunct is attempted afterwards */
    if (!lawfulInstruction(act.text)) return ok([turn]);
    return ok([turn,
      { fact: 'member_direction', instruction: act.text, refersTo: act.refersTo },
      { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'direction' }]);
  },
}, 'DC-6 · non-atomic member act');

/** DC-7 · the tidier. Normalises the member's words before storing them. */
export const DC_NORMALISE = clone({
  memberAct(act, inv) {
    const turn: DurableFact = { fact: 'member_turn', turnIndex: inv.nextTurnIndex, body: act.text };
    if (act.act === 'discourse') return ok([turn]);
    const instruction = act.text.trim();
    if (!instruction) return no('a Direction must carry an instruction');
    return ok([turn,
      { fact: 'member_direction', instruction, refersTo: act.refersTo },
      { fact: 'binding', turnIndex: inv.nextTurnIndex, to: 'direction' }]);
  },
}, 'DC-7 · host-normalised instruction');

export const CANDIDATES: ReadonlyArray<{ runtime: EditorialRuntime; dies: string; why: string }> = [
  { runtime: DC_PROSE_DIRECTIVE, dies: 'ER-F1', why: 'classifies member prose into a steering act' },
  { runtime: DC_NORMALISE,       dies: 'ER-F2', why: 'the host rewrites the member’s words' },
  { runtime: DC_PROSE_SCRAPE,    dies: 'ER-F3', why: 'scrapes candidate wording out of MAIA prose' },
  { runtime: DC_HEAD_REBASE,     dies: 'ER-F4', why: 'reads the head after cognition and rebases' },
  { runtime: DC_BOTH_ADJUNCTS,   dies: 'ER-F5', why: 'lands two semantic adjuncts on one turn' },
  { runtime: DC_LATE_EXTRACT,    dies: 'ER-F6', why: 'extracts Directions from stored discourse' },
  { runtime: DC_SPLIT_ACT,       dies: 'ER-F7', why: 'writes the turn separately from its declared adjunct' },
];
