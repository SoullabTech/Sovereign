/**
 * S3 · P1 — R1–R4, the route-level obligations.
 *
 *   R1  the canonical defect                body loads with no authority
 *   R2  authorization absence ≠ verification failure
 *   R3  the W2 section boundary             S may reach cognition; T never
 *   R4  lost response / replay              one member act, one crossing
 *
 * ⭐ For R1 canonical itself is the known-bad subject, and a fidelity check
 * (`__tests__/canonicalFidelity.test.ts`) pins the modelled canonical shape to
 * the route's actual source so the variant cannot become a strawman.
 *
 * ⭐ For R2–R4 canonical has no positive protocol to exercise, so the deeper
 * rule governs: the instrument must fail against a deliberate implementation of
 * the PROHIBITED behaviour.
 *
 * ⛔ Results are returned, never asserted, so one suite can be required to PASS
 * for a lawful reference and to FAIL — at a named obligation — for each variant.
 */

import type {
  AskBodyGate, BodyGateResult, EvidenceSlice, GateDeps, GateStep,
} from './bodyGateContract';
import type { ConsumedCompletion } from '../pendingAsk/claimContract';

export interface ObligationResult {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

const ok = (id: string, detail: string): ObligationResult => ({ id, ok: true, detail });
const bad = (id: string, detail: string): ObligationResult => ({ id, ok: false, detail });

const S = 'section-S';
const T = 'section-T';
const REF = 'pending-ref-for-obligations-0000000000000';

/** ⭐ Recovery deliberately yields BOTH sections. Authority will only cover S. */
const SLICES: readonly EvidenceSlice[] = [
  { sectionId: S, text: 'authored characters belonging to S' },
  { sectionId: T, text: 'authored characters belonging to T' },
];

interface Harness {
  deps: GateDeps;
  /** Everything the candidate actually handed to cognition. */
  crossed: EvidenceSlice[];
  consumed: { value: boolean };
  /** ⭐ One `attempted` receipt per boundary attempt, succeed or fail. */
  attempted: string[];
  /** ⭐ One completed-crossing receipt per confirmed section. */
  confirmed: string[];
  /** How many times cognition was handed context. Must never exceed 1. */
  handoffs: () => number;
  claims: () => number;
}

const harness = (opts: {
  revision?: string | null;
  recovery?: readonly EvidenceSlice[] | { refusal: string };
  boundary?: 'may_cross' | 'refused';
  /** ⭐ The section whose boundary fails — every other section succeeds. */
  boundaryFailsAt?: string;
  consumedAlready?: boolean;
  completion?: ConsumedCompletion;
} = {}): Harness => {
  const trace: GateStep[] = [];
  const crossed: EvidenceSlice[] = [];
  const attempted: string[] = [];
  const confirmed: string[] = [];
  const consumed = { value: opts.consumedAlready ?? false };
  const deps: GateDeps = {
    async claim() {
      trace.push('claim');
      if (consumed.value) return { kind: 'already_consumed', completion: opts.completion ?? 'completed' };
      consumed.value = true;
      return { kind: 'claimed' };
    },
    async establishBoundary(sectionId) {
      trace.push('boundary');
      /* ⭐ The attempt is recorded BEFORE the outcome is known — the receipt
         substrate mints `attempted` at the boundary, not afterwards. */
      attempted.push(sectionId);
      const r = opts.boundaryFailsAt === sectionId ? 'refused' : (opts.boundary ?? 'may_cross');
      if (r === 'may_cross') trace.push('may_cross');
      return r;
    },
    async loadRevision() { trace.push('load'); return opts.revision === undefined ? 'the whole revision' : opts.revision; },
    async recover() { trace.push('recover'); return opts.recovery ?? SLICES; },
    async cognition(disclosed) { trace.push('cognition'); crossed.push(...disclosed); },
    async confirmCrossing(sectionId) { trace.push('receipt'); confirmed.push(sectionId); },
    trace,
  };
  return {
    deps, crossed, consumed, attempted, confirmed,
    handoffs: () => trace.filter((t) => t === 'cognition').length,
    claims: () => trace.filter((t) => t === 'claim').length,
  };
};

const reached = (h: Harness, ...steps: GateStep[]) => steps.filter((s) => h.deps.trace.includes(s));

export async function runBodyGateObligations(gate: AskBodyGate): Promise<ObligationResult[]> {
  const out: ObligationResult[] = [];

  /* ── ⭐⭐ R1 · THE CANONICAL DEFECT ─────────────────────────────────────────
     Body is required and NO authority exists. Canonical loads the revision
     anyway and hands the recovered characters to cognition. */
  {
    const h = harness();
    const r = await gate({ requiredSections: [S], bodyRequired: true, authorizes: [] }, h.deps);
    const forbidden = reached(h, 'boundary', 'may_cross', 'load', 'cognition', 'receipt');
    const good = r.kind === 'BODY_AUTHORITY_REQUIRED' && forbidden.length === 0 && h.crossed.length === 0;
    out.push(good
      ? ok('R1', `body required with no authority reached nothing — ${h.deps.trace.join(' → ') || '(no steps)'}`)
      : bad('R1', `body required with no authority produced '${r.kind}' and reached ${forbidden.join(', ') || 'nothing'}; ${h.crossed.length} slice(s) crossed`));
  }

  /* ── ⭐ R2 · AUTHORIZATION ABSENCE IS NOT VERIFICATION FAILURE ──────────────
     The assembler tolerates a null revision and answers "unverifiable". Routing
     an unauthorized crossing into that shape is the cheapest repair, and the
     prohibited one. */
  {
    const h = harness({ revision: null });
    const r = await gate({ requiredSections: [S], bodyRequired: true, authorizes: [] }, h.deps);
    out.push(r.kind === 'BODY_AUTHORITY_REQUIRED' && !h.deps.trace.includes('load')
      ? ok('R2', 'absent authority yields BODY_AUTHORITY_REQUIRED and the loader stays unreachable')
      : bad('R2', `absent authority produced '${r.kind}'${h.deps.trace.includes('load') ? ' after reaching the loader' : ''} — it must never masquerade as verification failure`));
  }

  /* R2b · verification failure remains ITSELF, once authority exists. */
  {
    const h = harness({ recovery: { refusal: 'revision_integrity_failure' } });
    const r = await gate({ requiredSections: [S], bodyRequired: true, authorizes: [S], pendingRef: REF }, h.deps);
    out.push(r.kind === 'BODY_UNVERIFIABLE' && h.deps.trace.includes('may_cross')
      ? ok('R2b', 'a genuine recovery failure after may_cross is BODY_UNVERIFIABLE')
      : bad('R2b', `a genuine recovery failure produced '${r.kind}'`));
  }

  /* ── ⭐⭐ R3 · THE W2 SECTION BOUNDARY ─────────────────────────────────────
     Authority for S only, while recovery names S AND T. A candidate that trusts
     `required === authorized` instead of filtering hands T to cognition. */
  {
    const h = harness();
    const r = await gate({ requiredSections: [S], bodyRequired: true, authorizes: [S], pendingRef: REF }, h.deps);
    const leaked = h.crossed.filter((s) => s.sectionId !== S);
    const carriedS = h.crossed.some((s) => s.sectionId === S);
    out.push(r.kind === 'BODY_AUTHORIZED' && leaked.length === 0 && carriedS
      ? ok('R3', 'characters from S reached cognition; characters outside S did not')
      : bad('R3', leaked.length
        ? `characters from ${leaked.map((s) => s.sectionId).join(', ')} reached cognition under authority for ${S}`
        : `authority for ${S} produced '${r.kind}' and carried no S characters`));
  }

  /* R3b · ALL-OR-NONE. Required S and T, authorized S only. */
  {
    const h = harness();
    const r = await gate({ requiredSections: [S, T], bodyRequired: true, authorizes: [S], pendingRef: REF }, h.deps);
    out.push(r.kind === 'BODY_SCOPE_INCOMPLETE' && h.crossed.length === 0
      ? ok('R3b', 'partial authorization yields BODY_SCOPE_INCOMPLETE and crosses nothing')
      : bad('R3b', `partial authorization produced '${r.kind}' and crossed ${h.crossed.length} slice(s) — a complete answer must not be produced from part of what it requires`));
  }

  /* ── ⭐⭐ R4 · LOST RESPONSE · THE CARDINALITY LAW ─────────────────────────
     One member act → at most one crossing → at most one receipt. The retry may
     report the prior outcome; ⛔ it may not re-execute the disclosure. */
  {
    const first = harness();
    await gate({ requiredSections: [S], bodyRequired: true, authorizes: [S], pendingRef: REF }, first.deps);
    const crossings = first.deps.trace.filter((s) => s === 'receipt').length;

    const retry = harness({ consumedAlready: true, completion: 'completed' });
    const r = await gate({ requiredSections: [S], bodyRequired: true, authorizes: [S], pendingRef: REF }, retry.deps);
    const reExecuted = reached(retry, 'boundary', 'may_cross', 'load', 'cognition', 'receipt');
    const good = crossings === 1 && r.kind === 'ALREADY_CONSUMED' && reExecuted.length === 0 && retry.crossed.length === 0;
    out.push(good
      ? ok('R4', `one act, one crossing; the retry reached nothing — ${retry.deps.trace.join(' → ')}`)
      : bad('R4', `the retry produced '${r.kind}' and re-executed ${reExecuted.join(', ') || 'nothing'}; first run minted ${crossings} receipt(s)`));
  }

  /* R0 · structure-sufficient still answers without touching prose. */
  {
    const h = harness();
    const r = await gate({ requiredSections: [], bodyRequired: false, authorizes: [] }, h.deps);
    out.push(r.kind === 'STRUCTURE_SUFFICIENT' && reached(h, 'boundary', 'load', 'receipt').length === 0
      ? ok('R0', 'a structure-sufficient Ask touches no prose and mints no prose receipt')
      : bad('R0', `a structure-sufficient Ask produced '${r.kind}' and reached ${reached(h, 'boundary', 'load', 'receipt').join(', ')}`));
  }

  /* ═══ MULTI-SECTION · A-i RATIFIED 2026-09-10 ═══════════════════════════════
     One member act → one claim → one execution → one handoff, carrying several
     independently section-scoped authorities and therefore several receipts. */

  const U = 'section-U';
  const MULTI = [S, T, U];
  const multiSlices: readonly EvidenceSlice[] = MULTI.map((sectionId) => ({
    sectionId, text: `authored characters belonging to ${sectionId}`,
  }));

  /* MS1 · one act, three boundaries, ONE handoff, three completed receipts. */
  {
    const h = harness({ recovery: multiSlices });
    const r = await gate({ requiredSections: MULTI, bodyRequired: true, authorizes: MULTI, pendingRef: REF }, h.deps);
    const good = r.kind === 'BODY_AUTHORIZED'
      && h.claims() === 1
      && h.attempted.slice().sort().join(',') === MULTI.slice().sort().join(',')
      && h.handoffs() === 1
      && h.confirmed.slice().sort().join(',') === MULTI.slice().sort().join(',')
      && h.crossed.length === 3;
    out.push(good
      ? ok('MS1', 'one act · one claim · three section boundaries · one handoff · three receipts')
      : bad('MS1', `'${r.kind}' with ${h.claims()} claim(s), ${h.attempted.length} boundar(ies), ${h.handoffs()} handoff(s), ${h.confirmed.length} receipt(s)`));
  }

  /* MS2 · partial authorization refuses BEFORE the claim. ⛔ No half-executed
     authorization sequence: the full required set is presented before claim. */
  {
    const h = harness({ recovery: multiSlices });
    const r = await gate({ requiredSections: MULTI, bodyRequired: true, authorizes: [S, T], pendingRef: REF }, h.deps);
    const touched = (['claim', 'boundary', 'load', 'cognition', 'receipt'] as GateStep[])
      .filter((step) => h.deps.trace.includes(step));
    out.push(r.kind === 'BODY_SCOPE_INCOMPLETE' && touched.length === 0
      ? ok('MS2', 'partial authorization refuses before the claim')
      : bad('MS2', `'${r.kind}' after reaching ${touched.join(', ') || 'nothing'} — the claim must never occur`));
  }

  /* ⭐⭐ MS3 · the kth boundary fails. ALL boundaries precede any load, so
     nothing is read, nothing crosses, and NO completed receipt exists — while
     the earlier attempts remain lawful `attempted` evidence. */
  {
    const h = harness({ recovery: multiSlices, boundaryFailsAt: U });
    const r = await gate({ requiredSections: MULTI, bodyRequired: true, authorizes: MULTI, pendingRef: REF }, h.deps);
    const good = r.kind === 'DISCLOSURE_UNAVAILABLE'
      && !h.deps.trace.includes('load')
      && h.handoffs() === 0
      && h.confirmed.length === 0
      && h.attempted.length > 0;
    out.push(good
      ? ok('MS3', `a failed boundary crossed nothing; ${h.attempted.length} attempt(s) remain attempted only`)
      : bad('MS3', `'${r.kind}' with ${h.confirmed.length} completed receipt(s), ${h.handoffs()} handoff(s)${h.deps.trace.includes('load') ? ', and the body was loaded' : ''}`));
  }

  /* MS4 · the act is spent. A retry cannot reuse it. */
  {
    const h = harness({ recovery: multiSlices, consumedAlready: true, completion: 'incomplete' });
    const r = await gate({ requiredSections: MULTI, bodyRequired: true, authorizes: MULTI, pendingRef: REF }, h.deps);
    const touched = (['boundary', 'load', 'cognition', 'receipt'] as GateStep[])
      .filter((step) => h.deps.trace.includes(step));
    out.push(r.kind === 'ALREADY_CONSUMED' && touched.length === 0
      ? ok('MS4', 'a spent act cannot be re-presented; a new member act is required')
      : bad('MS4', `'${r.kind}' after reaching ${touched.join(', ') || 'nothing'} — replay must create zero boundaries, loads, handoffs or receipts`));
  }

  /* ═══ DISCLOSURE_UNAVAILABLE · B-i RATIFIED 2026-09-10 ═══════════════════ */

  /* DU1 · a valid act whose boundary fails yields the sixth state, and says the
     act is spent. ⛔ A state reporting only the failure would leave the member
     believing they are still authorized. */
  {
    const h = harness({ boundary: 'refused' });
    const r = await gate({ requiredSections: [S], bodyRequired: true, authorizes: [S], pendingRef: REF }, h.deps);
    out.push(r.kind === 'DISCLOSURE_UNAVAILABLE' && r.actSpent === true
      ? ok('DU1', 'a boundary failure after a valid act is DISCLOSURE_UNAVAILABLE, act spent')
      : bad('DU1', r.kind === 'DISCLOSURE_UNAVAILABLE'
        ? 'the state does not say the authorization was spent'
        : `a boundary failure produced '${r.kind}'`));
  }

  /* DU2 · ⛔ it may not masquerade as "you have not authorized yet". */
  {
    const h = harness({ boundary: 'refused' });
    const r = await gate({ requiredSections: [S], bodyRequired: true, authorizes: [S], pendingRef: REF }, h.deps);
    out.push(r.kind !== 'BODY_AUTHORITY_REQUIRED'
      ? ok('DU2', 'a boundary failure is never reported as missing authorization')
      : bad('DU2', 'a boundary failure was reported as BODY_AUTHORITY_REQUIRED — the member did authorize'));
  }

  /* DU3 · ⛔ nor as a verification failure. Nothing was read, so nothing failed
     verification. */
  {
    const h = harness({ boundary: 'refused' });
    const r = await gate({ requiredSections: [S], bodyRequired: true, authorizes: [S], pendingRef: REF }, h.deps);
    out.push(r.kind !== 'BODY_UNVERIFIABLE'
      ? ok('DU3', 'a boundary failure is never reported as unverifiable evidence')
      : bad('DU3', 'a boundary failure was reported as BODY_UNVERIFIABLE — recovery never began'));
  }

  /* DU4 · and no authored body is loaded, whatever the report says. */
  {
    const h = harness({ boundary: 'refused' });
    await gate({ requiredSections: [S], bodyRequired: true, authorizes: [S], pendingRef: REF }, h.deps);
    out.push(!h.deps.trace.includes('load') && h.crossed.length === 0
      ? ok('DU4', 'a boundary failure loads no authored body')
      : bad('DU4', `a boundary failure reached ${h.deps.trace.includes('load') ? 'the loader' : 'cognition'}`));
  }

  return out;
}

export const failedObligations = (rs: readonly ObligationResult[]): string[] =>
  rs.filter((r) => !r.ok).map((r) => r.id);

export type { BodyGateResult };
