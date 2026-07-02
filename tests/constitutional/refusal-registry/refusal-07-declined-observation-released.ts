import type { RefusalCheck } from './harness';

/**
 * Refusal 07 — A practitioner observation the member has DECLINED never
 * resurfaces. The surfacing capability's missing refusal, now completed.
 *
 * The loader surfaces practitioner_observation atoms with an explicit prompt
 * invitation to "confirm, reject, or refine" (memoryAtomsLoader.ts). Before this
 * refusal there was no column that could RECORD a reject, so a declined
 * observation stayed loader-eligible and re-surfaced next session as if the
 * member had never disagreed — persistent authorship manufacture.
 *
 * Canon: docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md — the member may decline what
 * is held about them, and the system must release it.
 * Migration: database/migrations/20260702000002_member_memory_atoms_response.sql
 *
 * Structural shape (sibling to R04 sacred_protected — a SQL exclusion predicate):
 *
 *   1. RELEASE (the core, Grade A): the loader's surfacing query carries
 *      `member_response_status IS DISTINCT FROM 'rejected'` INSIDE the
 *      `FROM member_memory_atoms` query window — proven per-query (window
 *      technique), so a refactor that drops the predicate from the surfacing
 *      SELECT fails HERE even if the string survives elsewhere in the file.
 *
 *   2. REACHABILITY: a decline is actually recordable — lib/psyche/portfolio.ts
 *      sets member_response_status = 'rejected'. Without a writer the invitation
 *      to reject is empty and the release can never trigger.
 *
 *   3. WRITE-MONOPOLY: only the member gesture path writes member_response_status
 *      (sole writer file = lib/psyche/portfolio.ts). No agent / service / route
 *      may auto-set a verdict on the member's behalf. A foreign writer would let
 *      the system manufacture (or clear) the member's response — caught here.
 *
 * This is NOT Grade C: the release is a SQL predicate, not a prompt instruction.
 */

const LOADER = 'lib/maia/memoryAtomsLoader.ts';
const GESTURE = 'lib/psyche/portfolio.ts';
const ROUTE = 'app/api/sovereign/atoms/[id]/decline/route.ts';

// The sole file permitted to WRITE member_response_status (the member gesture).
const SOLE_WRITER = 'lib/psyche/portfolio.ts';

// A real SQL WRITE to the column: `SET member_response_status = ...`. Anchored on
// the uppercase `SET` keyword so it matches only UPDATE ... SET assignments —
// NOT comment prose ("Sets member_response_status…", "(member_response_status =
// 'rejected')"), which the case-sensitive grep leaves untripped. Same discipline
// as R06: match code constructs, not docblock mentions, so a module may honestly
// NAME the column it refuses to let the system write. The loader's read predicate
// uses `IS DISTINCT FROM` (no `SET`), the migration uses `IN (...)` / `IS NULL`,
// and TS row shapes use `:` — none match. Matched across code dirs only
// (migrations legitimately define the column).
const WRITE_RE = 'SET[[:space:]]+member_response_status[[:space:]]*=';

const RELEASE_PREDICATE = /member_response_status\s+IS\s+DISTINCT\s+FROM\s+'rejected'/i;

export const check: RefusalCheck = {
  id: 'R07',
  refusal:
    'A practitioner observation the member has declined (member_response_status = rejected) never resurfaces in ambient recall',
  grade: 'A',
  enforcedBy:
    "loader surfacing query carries `member_response_status IS DISTINCT FROM 'rejected'` (per-query window); the verdict is member-written only (sole writer lib/psyche/portfolio.ts) via an ownership-scoped, practitioner_observation-scoped gesture",
  evidence: [
    `${LOADER}: FROM member_memory_atoms window contains the rejected-exclusion predicate`,
    `${GESTURE}: declineObservation sets member_response_status = 'rejected' (COALESCE-idempotent, scoped to source_type = 'practitioner_observation')`,
    `${ROUTE}: POST/DELETE behind getMemberIdFromRequest; system has no writer of the column outside the gesture path`,
    'migration 20260702000002 adds the column + member_response_coherent CHECK',
  ].join(' | '),
  violationAttempted: [
    '(1) surface a declined observation — is the exclusion predicate missing from the loader query window?',
    '(2) is the reject unrecordable — no writer sets member_response_status = rejected?',
    '(3) can the system auto-set the verdict — a non-member (agent/service/route) writer of member_response_status?',
  ].join('; '),
  passingAuthorizes:
    'a member-recorded decline structurally removes the observation from ambient recall, and the verdict can only be written by the member gesture (not manufactured by the system)',
  passingDoesNotAuthorize:
    "that any member has actually declined anything (no behavioural claim), that 'confirmed'/'modified' verdicts are wired (they are reserved, unwritten), that a decline UI gesture is shipped, or that DEEP-tier prompt paths carry atoms at all",
  hostileForkMustChange:
    "remove the `member_response_status IS DISTINCT FROM 'rejected'` predicate from the loader's surfacing query (visible diff), or add a non-member writer of member_response_status (visible diff)",

  run(io) {
    // ── 1: RELEASE — exclusion predicate lives INSIDE the surfacing query ──
    const loaderSrc = io.read(LOADER);
    const window = /FROM\s+member_memory_atoms\b([\s\S]*?)`/i.exec(loaderSrc);
    if (!window) {
      io.fail(
        'loader has no `FROM member_memory_atoms` surfacing query',
        'the surfacing path this refusal guards was not found',
      );
    } else if (RELEASE_PREDICATE.test(window[1])) {
      io.pass(
        'loader surfacing query excludes declined observations',
        "member_response_status IS DISTINCT FROM 'rejected' inside the FROM member_memory_atoms window",
      );
    } else {
      io.fail(
        'loader surfacing query does NOT exclude declined observations',
        "expected member_response_status IS DISTINCT FROM 'rejected' in the FROM member_memory_atoms window — a declined observation would resurface",
      );
    }

    // ── 2: REACHABILITY — the decline is recordable ──
    const gestureSrc = io.read(GESTURE);
    if (/member_response_status\s*=\s*'rejected'/i.test(gestureSrc)) {
      io.pass(
        'a decline is recordable',
        "lib/psyche/portfolio.ts sets member_response_status = 'rejected'",
      );
    } else {
      io.fail(
        'no path records a decline',
        "the loader invites 'confirm, reject, or refine' but nothing writes member_response_status = 'rejected' — the invitation is empty",
      );
    }

    // ── 3: WRITE-MONOPOLY — only the member gesture writes the verdict ──
    // Assert no file OTHER than the sole gesture writer assigns member_response_status.
    const writers = io.grep(WRITE_RE, ['app', 'lib', 'scripts']);
    const foreign = writers.filter((l) => !l.startsWith(`${SOLE_WRITER}:`));
    if (foreign.length === 0) {
      io.pass(
        'member_response_status has no non-member writer',
        `sole writer is ${SOLE_WRITER} (the member gesture) — the system cannot auto-set a verdict`,
      );
    } else {
      io.fail(
        'a non-member writer of member_response_status exists — the system could manufacture or clear the member verdict',
        foreign.slice(0, 3).join(' | '),
      );
    }

    // ── Provenance NOTE: the write path is member-authenticated + scoped ──
    if (io.exists(ROUTE)) {
      const routeSrc = io.read(ROUTE);
      const authed = /getMemberIdFromRequest/.test(routeSrc);
      const scoped = /practitioner_observation/.test(gestureSrc);
      if (authed && scoped) {
        io.note(
          'decline route is member-authenticated and the gesture is practitioner-observation-scoped',
          'identity via getMemberIdFromRequest; a non-practitioner target matches 0 rows',
        );
      } else {
        io.warn(
          'decline route auth / gesture scope not both present as expected',
          `getMemberIdFromRequest=${authed} · practitioner_observation-scoped gesture=${scoped}`,
        );
      }
    } else {
      io.note(`decline route ${ROUTE} not found`, 'the gesture may be reached another way');
    }
  },
};
