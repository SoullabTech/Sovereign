import type { RefusalCheck } from './harness';

/**
 * Refusal 18 — a moment from a Sanctuary session cannot be persisted as an
 * episodic mark, and no episodic mark may be written without resolvable
 * source-session provenance.
 *
 * Sanctuary invariant 6 (CLAUDE.md) is absolute: nothing from a Sanctuary
 * session can be saved, extracted, inferred, or converted into long-term
 * memory, under any circumstances, INCLUDING by member request during the
 * session. The client suppresses the "Keep this moment" affordance during
 * Sanctuary, but a client-side gate alone is not a boundary — a direct POST to
 * /api/sovereign/episodes/mark would have written the row.
 *
 * GOVERNING RULE (ruled 2026-07-17): no durable episodic mark may be written
 * without a resolvable source; for the present API the only valid source is
 * an authenticated member-owned session. The route therefore:
 *   1. refuses missing/empty provenance with 403 (a Sanctuary-boundary
 *      refusal, not field validation — optional provenance would mean
 *      optional boundary enforcement);
 *   2. resolves sourceSessionId as an ALLOWLIST against BOTH session tables —
 *      maia_sessions (mode/privacy_mode, written at session start, so the
 *      guard holds mid-session) and member_sessions (mode, written at
 *      finalization) — ownership-scoped to the authenticated member;
 *   3. refuses Sanctuary sources with 403 before any INSERT;
 *   4. gives nonexistent, malformed, and cross-member ids one identical
 *      governed denial (no existence oracle).
 * Mirrors the SessionSummaryStore precedent (summaryText forced null when
 * isSanctuary) and the MemberLiveContext read-skips.
 */

const ROUTE = 'app/api/sovereign/episodes/mark/route.ts';

// The provenance requirement: absence of a source session is refused as a
// boundary matter. If this text is gone, provenance has become optional again
// and boundary enforcement optional with it.
const PROVENANCE_REQUIRED = /Episodic marks require source-session provenance/;

// The allowlist resolution: the query must compute an `owned` verdict, not
// only a sanctuary verdict — the write is permitted only for an owned,
// non-Sanctuary source.
const OWNED_ALLOWLIST = /AS owned/;

// The live-session predicate: maia_sessions consulted on mode OR privacy_mode,
// ownership-scoped to the authenticated member (NULL-owner rows included: for
// Sanctuary the guard errs toward refusal, and an unattributed row cannot be
// tied to any other member).
const LIVE_SESSION_PREDICATE =
  /maia_sessions[\s\S]{0,300}?member_id\s*=\s*\$2\s*OR\s*member_id\s+IS\s+NULL[\s\S]{0,200}?mode\s*=\s*'sanctuary'\s*OR\s*privacy_mode\s*=\s*'sanctuary'/;

// The finalized-session predicate: member_sessions consulted on mode, strictly
// member-scoped (column is NOT NULL).
const FINALIZED_SESSION_PREDICATE =
  /member_sessions[\s\S]{0,300}?member_id\s*=\s*\$2(::uuid)?[\s\S]{0,120}?mode\s*=\s*'sanctuary'/;

// The refusal must be a hard 403, not a silent success that drops the write.
const HARD_REFUSAL = /status:\s*403/;

export const check: RefusalCheck = {
  id: 'R18',
  refusal:
    'an episodic mark cannot be persisted from a Sanctuary session, nor without resolvable member-owned source provenance',
  grade: 'A-minus',
  enforcedBy:
    'server-side provenance requirement + ownership-scoped allowlist resolution in the episodic mark route (POST), before the INSERT',
  evidence:
    "episodes/mark/route.ts — 403 on missing provenance; owned+is_sanctuary EXISTS resolution over maia_sessions (mode/privacy_mode = 'sanctuary') and member_sessions (mode = 'sanctuary') keyed by sourceSessionId AND the authenticated member id; identical denial for nonexistent/cross-member ids; 403 precedes INSERT INTO episodic_memories; runtime cases in app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts + scripts/verify-episodic-sanctuary-guard.ts",
  violationAttempted:
    'find provenance made optional again, the owned allowlist or sanctuary predicates missing/weakened, the member-ownership scoping dropped (turning the guard into a cross-member existence oracle), the refusal downgraded from a hard 403, or the guard placed after the INSERT where it could no longer prevent the write',
  passingAuthorizes:
    'the episodic-mark API requires authoritative source-session provenance and refuses Sanctuary-origin writes before persistence — every write through THIS route names a member-owned, non-Sanctuary source, with no caller-controllable bypass',
  passingDoesNotAuthorize:
    'repository-wide Sanctuary write-incapacity — episodic_memories has other writers outside this route (app/api/journal/quick/list, app/api/maia/memory/ingest, lib/maia/sessionProcessor, scripts/run-session-summary-worker, lib/consciousness/memory/EpisodicMemoryService) that this check does not govern; that remains the broader Sanctuary audit. Nor structural write-incapacity even here: the guard is route logic on a write-capable query() handle — hence A-minus, not A (same criterion as R08)',
  hostileForkMustChange:
    'make sourceSessionId optional again, remove/weaken the owned allowlist or either sanctuary EXISTS predicate, drop a 403, or move the resolution below the INSERT in the mark route — visible diff',

  run(io) {
    const src = io.read(ROUTE);

    if (PROVENANCE_REQUIRED.test(src)) {
      io.pass(
        'provenance is required — missing source refuses as a boundary matter',
        'optional provenance would mean optional boundary enforcement',
      );
    } else {
      io.fail(
        'provenance requirement missing — sourceSessionId has become optional again',
        'refusal falsified — a provenance-less mark could be written with no boundary check at all',
      );
    }

    if (OWNED_ALLOWLIST.test(src)) {
      io.pass(
        'resolution is an allowlist (owned verdict computed), not a sanctuary-only blocklist',
        'writes proceed only for an owned, non-Sanctuary source',
      );
    } else {
      io.fail(
        'owned allowlist missing from the resolution query',
        'unresolvable/cross-member sources could write again',
      );
    }

    if (LIVE_SESSION_PREDICATE.test(src)) {
      io.pass(
        'mark route consults maia_sessions for live-session sanctuary state',
        "member-scoped; mode = 'sanctuary' OR privacy_mode = 'sanctuary' predicate present",
      );
    } else {
      io.fail(
        'live-session sanctuary predicate missing or altered',
        'refusal falsified — a mark during an active Sanctuary session could be written',
      );
    }

    if (FINALIZED_SESSION_PREDICATE.test(src)) {
      io.pass(
        'mark route consults member_sessions for finalized sanctuary state',
        "member-scoped; member_sessions mode = 'sanctuary' predicate present",
      );
    } else {
      io.fail(
        'finalized-session sanctuary predicate missing or altered',
        'refusal falsified — a mark naming an already-finalized Sanctuary session could be written',
      );
    }

    const guardAt = src.indexOf('is_sanctuary');
    const insertAt = src.indexOf('INSERT INTO episodic_memories');
    if (guardAt !== -1 && insertAt !== -1 && guardAt < insertAt) {
      io.pass(
        'provenance resolution precedes the episodic INSERT',
        `resolution at char ${guardAt}, INSERT at char ${insertAt}`,
      );
    } else {
      io.fail(
        'resolution does not precede the INSERT',
        'a guard that runs after the write prevents nothing',
      );
    }

    if (HARD_REFUSAL.test(src)) {
      io.pass('refusals are hard 403s, not silent drops');
    } else {
      io.fail(
        'no 403 refusal found in the mark route',
        'a silent success would hide the boundary from the member (dangerous failure feels like success)',
      );
    }
  },
};
