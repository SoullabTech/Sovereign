/**
 * C1…C15 — FAILURE, RECOVERY + CONCURRENCY, AS MECHANICAL LAWS.
 *
 * Source: `FAILURE_RECOVERY_AND_CONCURRENCY_CANON_v1.md` §32.
 *
 * ⭐⭐ WRITTEN WHILE THE FLAGSHIP HAS NO ASYNC AT ALL — zero `await`, zero
 * `fetch`, zero Promise in `lib/writersStudio/studio/**` or
 * `app/writers-studio/flagship/**`. That is the ONLY honest moment to write
 * them: every one of C1…C15 is **vacuously satisfied** today, and a suite
 * authored after the first request lands would be shaped by it.
 *
 * ⚠️⚠️ VACUOUS GREEN IS THE HAZARD THIS FILE EXISTS TO NAME. *No async work
 * exists* and *all concurrency laws pass* are indistinguishable from outside,
 * and the second is what a status table would report.
 *
 * ⭐⭐ THE SUBSTRATE IS NOT NEW. `SPM-FC-01` / S3 ratified this exact law at a
 * different boundary and proved it lethal: **act identity is upstream
 * constitutional identity, from which concurrency, replay and recovery
 * semantics follow** — and `request identity may correlate execution, never
 * substitute for act identity` is S3's ruling verbatim. `DC-2 request-keyed
 * idempotency` killed four of nine S3 falsifiers; the canon's D-C2 is the same
 * machine in the Studio. ⛔ The flagship should INHERIT that law, not reinvent
 * it — `lib/disclosure/authorizationAct.ts` is the shipped precedent.
 */

/** What the member's action bound at the moment it was issued. */
export interface RequestIdentity {
  readonly requestId: string;
  readonly workId: string;
  readonly memberId: string;
  readonly version: number;
  readonly seam: string;
  readonly sectionId: string;
  readonly actionType: string;
  readonly intent: string;
  readonly requestedScope: readonly string[];
}

export type AsyncState =
  | 'idle' | 'pending' | 'streaming' | 'succeeded' | 'cancelled'
  | 'failed_recoverable' | 'failed_final' | 'stale_result' | 'superseded';

/** The world as it stood when the response came back. */
export interface WorldAtReturn {
  readonly version: number;
  readonly currentSeam: string;
  readonly currentSectionId: string;
  readonly durable: boolean;
  readonly providerAuthorized: boolean;
  readonly executedScope: readonly string[];
}

/** What the product did with the response. */
export interface Admission {
  readonly state: AsyncState;
  /** ⛔ Empty when nothing was attached anywhere. */
  readonly attachedToSeam: string;
  readonly attachedToSectionId: string;
  readonly admittedAsComplete: boolean;
  readonly streamComplete: boolean;
  /** Durable acts this response created. */
  readonly actsCreated: number;
  /** Mutation applied, and whether its receipt agrees. */
  readonly mutationApplied: boolean;
  readonly receiptSaysApplied: boolean;
  /** Copy shown to the member. */
  readonly memberCopy: string;
  /** Paths back into the Work offered at this outcome. */
  readonly waysBackToWork: number;
}

export interface Episode {
  readonly request: RequestIdentity;
  readonly world: WorldAtReturn;
  readonly admission: Admission;
  /** How many requests carried this same (seam, intent, sectionId). */
  readonly identicalInputs: number;
  /** For a mutation: did it re-check the version before applying? */
  readonly recheckedBeforeMutation: boolean;
  /** For Undo: did it restore the exact authorized prior state? */
  readonly undoRestoredExact: boolean | null;
  /** For Undo: did it stop for reconciliation instead? */
  readonly undoStopped: boolean | null;
  /** Did a dismissal cancel the request? */
  readonly dismissedCancelled: boolean | null;
}

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string; }
const law = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });

const FAILURE_KINDS = ['not-read', 'nothing-found', 'failed', 'insufficient-coverage'] as const;

export function runConcurrencyLaws(e: Episode): readonly LawResult[] {
  const out: LawResult[] = [];
  const { request: r, world: w, admission: a } = e;

  /* ── C1 · REQUEST IDENTITY ───────────────────────────────────────────── */
  const missing = ([['workId', r.workId], ['memberId', r.memberId], ['seam', r.seam],
    ['sectionId', r.sectionId], ['intent', r.intent]] as const)
    .filter(([, v]) => v.trim() === '').map(([k]) => k);
  const bound = missing.length === 0 && r.version >= 1;
  out.push(law('C1-request-binds-exact-identity', bound,
    bound ? `bound to ${r.workId}@v${r.version} · ${r.seam}`
      : `unbound: ${[...missing, ...(r.version < 1 ? ['version'] : [])].join(' · ')}`));

  /* ── C2 · RESPONSE IDENTITY · C4 · LATE RESULT SAFETY ────────────────────
     ⭐⭐ THE CANON'S CENTRAL LAW: *a response without matching identity does
     not attach to the current UI merely because it arrived.* ⛔ The failure is
     not "the answer was wrong" — the answer may be perfectly good about
     Passage A. The failure is that it is rendered beside Passage B. */
  const attached = a.attachedToSeam !== '';
  const matches = a.attachedToSeam === r.seam && a.attachedToSectionId === r.sectionId;
  out.push(law('C2-result-attaches-only-to-its-own-seam', !attached || matches,
    !attached ? 'nothing attached' : matches ? `attached to its own seam ${r.seam}`
      : `answer for ${r.seam}/${r.sectionId} attached to ${a.attachedToSeam}/${a.attachedToSectionId}`));

  const moved = w.currentSeam !== r.seam;
  const migrated = moved && a.attachedToSeam === w.currentSeam;
  out.push(law('C4-late-result-never-migrates', !migrated,
    !moved ? 'the member did not move' : migrated
      ? `member moved to ${w.currentSeam} and the late answer followed them`
      : 'the member moved; the answer stayed with the passage it was about'));

  /* ── C3 · VERSION SAFETY ─────────────────────────────────────────────── */
  const versionMoved = w.version !== r.version;
  out.push(law('C3-changed-work-invalidates-mutation',
    !a.mutationApplied || !versionMoved || e.recheckedBeforeMutation,
    !a.mutationApplied ? 'no mutation' : !versionMoved ? `applied at the version it targeted (v${r.version})`
      : e.recheckedBeforeMutation ? `v${r.version}→v${w.version}, rechecked before applying`
      : `proposal made at v${r.version} applied blindly to v${w.version}`));

  /* ── C5 · DUPLICATE SAFETY ───────────────────────────────────────────────
     ⭐ S3's `DC-2` in the Studio: keying on the REQUEST makes two clicks two
     identities, and both are then admitted. ⛔ The guard is act identity. */
  out.push(law('C5-repeated-input-creates-one-act',
    e.identicalInputs <= 1 || a.actsCreated <= 1,
    e.identicalInputs <= 1 ? 'single input'
      : a.actsCreated <= 1 ? `${e.identicalInputs} inputs, ${a.actsCreated} act(s)`
      : `${e.identicalInputs} identical inputs produced ${a.actsCreated} durable acts`));

  /* ── C6 · STREAMING TRUTH ────────────────────────────────────────────── */
  out.push(law('C6-partial-never-admitted-as-complete',
    !a.admittedAsComplete || a.streamComplete,
    !a.admittedAsComplete ? 'nothing admitted as complete'
      : a.streamComplete ? 'admitted only after the stream completed'
      : 'a partial stream was admitted as a complete finding'));

  /* ── C7 · APPLY ATOMICITY ────────────────────────────────────────────────
     ⭐ Precisely S3's route-integration repair: the mutation and its record
     commit together or neither does. ⛔ Both contradictions are failures —
     *applied but says nothing changed* AND *failed but says applied*. */
  out.push(law('C7-mutation-and-receipt-cannot-contradict',
    a.mutationApplied === a.receiptSaysApplied,
    a.mutationApplied === a.receiptSaysApplied ? 'mutation and receipt agree'
      : a.mutationApplied ? 'the Work changed and the member was told nothing did'
      : 'the member was told it applied and the Work did not change'));

  /* ── C8 · UNDO TRUTH ─────────────────────────────────────────────────── */
  if (e.undoRestoredExact !== null || e.undoStopped !== null) {
    const ok = e.undoRestoredExact === true || e.undoStopped === true;
    out.push(law('C8-undo-restores-exactly-or-stops', ok,
      e.undoRestoredExact ? 'restored the exact authorized prior state'
        : e.undoStopped ? 'stopped for reconciliation rather than guessing'
        : 'undo neither restored the exact prior state nor stopped'));
  }

  /* ── C9 · FAILURE DISTINCTION ────────────────────────────────────────────
     ⭐ The four must not render identically. ⛔ *MAIA found nothing* and *MAIA
     could not finish* are opposite news about the member's Work. */
  const kinds = FAILURE_KINDS.filter((k) => a.memberCopy.toLowerCase().includes(k.replace('-', ' ')));
  const isFailureOutcome = a.state === 'failed_recoverable' || a.state === 'failed_final';
  const saysNothingFound = /didn.t find|nothing (was )?found|found nothing/i.test(a.memberCopy);
  out.push(law('C9-failure-is-not-nothing-found',
    !(isFailureOutcome && saysNothingFound),
    isFailureOutcome && saysNothingFound
      ? `a failure is reported as a result: "${a.memberCopy.slice(0, 60)}"`
      : `${a.state}${kinds.length ? ` · names ${kinds.join(', ')}` : ''}`));

  /* ── C11 · MOBILE DISMISSAL ──────────────────────────────────────────── */
  if (e.dismissedCancelled !== null) {
    out.push(law('C11-dismiss-is-not-cancel',
      !e.dismissedCancelled || /cancel/i.test(a.memberCopy),
      !e.dismissedCancelled ? 'dismissing put the sheet away; the request continued'
        : 'dismissing silently cancelled the member’s request'));
  }

  /* ── C12 · PERSISTENCE TRUTH ─────────────────────────────────────────────
     ⭐ §23 of the Durable Place canon, enforced: ⛔ a UI surface may not imply
     DURABLE when the object is EPHEMERAL. */
  const claimsSaved = /\bsaved\b|\bkept\b/i.test(a.memberCopy);
  out.push(law('C12-saved-only-when-durable', !claimsSaved || w.durable,
    !claimsSaved ? 'nothing claims to be saved'
      : w.durable ? 'says saved, and it is durable'
      : `says "${a.memberCopy.slice(0, 40)}" while nothing was persisted`));

  /* ── C13 · RECOVERY TO WORK ──────────────────────────────────────────── */
  const failed = a.state === 'failed_recoverable' || a.state === 'failed_final'
    || a.state === 'cancelled' || a.state === 'stale_result';
  out.push(law('C13-every-failure-leads-back-to-the-work',
    !failed || a.waysBackToWork >= 1,
    !failed ? 'not a failure outcome'
      : a.waysBackToWork >= 1 ? `${a.waysBackToWork} way(s) back into the Work`
      : 'the member is left at a failure with no path back to their Work'));

  /* ── C14 · PROVIDER HONESTY ──────────────────────────────────────────── */
  out.push(law('C14-no-unauthorized-provider-fallback', w.providerAuthorized,
    w.providerAuthorized ? 'served by an authorized provider'
      : 'a provider failure routed to an unauthorized provider'));

  /* ── C15 · CROSS-SESSION ISOLATION ───────────────────────────────────────
     ⭐ Modelled as SCOPE too: §26's intent race is the same law — the read that
     RAN must be the read the member AGREED to, never the one first proposed. */
  const scopeHonoured = w.executedScope.length === r.requestedScope.length
    && w.executedScope.every((s, i) => s === r.requestedScope[i]);
  out.push(law('C15-executed-scope-is-the-agreed-scope', scopeHonoured,
    scopeHonoured ? `read exactly the agreed ${r.requestedScope.length} section(s)`
      : `agreed [${r.requestedScope.join(', ')}] · read [${w.executedScope.join(', ')}]`));

  return out;
}

/**
 * ⛔ NOT MECHANICALLY TESTABLE HERE — reported UNKNOWN, ⛔ never as passed.
 */
export const NOT_TESTABLE_HERE = [
  { id: 'C10-navigation-freedom', why: 'requires a real browser and a real in-flight request; these are described episodes' },
  { id: 'C6-stream-timing', why: 'the structural half is tested; whether a stream actually tore mid-flight is a runtime fact' },
  { id: 'C15-cross-member-leak', why: 'a real multi-session runtime is required; only scope agreement is structural here' },
] as const;
