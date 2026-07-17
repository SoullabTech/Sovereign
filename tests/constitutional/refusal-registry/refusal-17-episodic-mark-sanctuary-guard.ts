import type { RefusalCheck } from './harness';

/**
 * Refusal 17 — a moment from a Sanctuary session cannot be persisted as an
 * episodic mark.
 *
 * Sanctuary invariant 6 (CLAUDE.md) is absolute: nothing from a Sanctuary
 * session can be saved, extracted, inferred, or converted into long-term
 * memory, under any circumstances, INCLUDING by member request during the
 * session. The client suppresses the "Keep this moment" affordance during
 * Sanctuary, but a client-side gate alone is not a boundary — a direct POST to
 * /api/sovereign/episodes/mark would have written the row.
 *
 * The server-side guard resolves the source session's sanctuary state via
 * sourceSessionId against BOTH session tables — maia_sessions (mode /
 * privacy_mode, written at session start, so the guard holds mid-session) and
 * member_sessions (mode, written at finalization) — and refuses with 403
 * before any INSERT. Mirrors the SessionSummaryStore precedent (summaryText
 * forced null when isSanctuary) and the MemberLiveContext read-skips.
 */

const ROUTE = 'app/api/sovereign/episodes/mark/route.ts';

// The live-session predicate: maia_sessions consulted on mode OR privacy_mode,
// ownership-scoped to the authenticated member (NULL-owner rows included: for
// Sanctuary the guard errs toward refusal, and an unattributed row cannot be
// tied to any other member).
const LIVE_SESSION_PREDICATE =
  /maia_sessions[\s\S]{0,300}?member_id\s*=\s*\$2\s*OR\s*member_id\s+IS\s+NULL[\s\S]{0,200}?mode\s*=\s*'sanctuary'\s*OR\s*privacy_mode\s*=\s*'sanctuary'/;

// The finalized-session predicate: member_sessions consulted on mode, strictly
// member-scoped (column is NOT NULL). Cross-member session ids must resolve
// exactly like nonexistent ones — no cross-member refusal flip, no existence
// oracle.
const FINALIZED_SESSION_PREDICATE =
  /member_sessions[\s\S]{0,300}?member_id\s*=\s*\$2(::uuid)?[\s\S]{0,120}?mode\s*=\s*'sanctuary'/;

// The refusal must be a hard 403, not a silent success that drops the write.
const HARD_REFUSAL = /status:\s*403/;

export const check: RefusalCheck = {
  id: 'R17',
  refusal: 'a moment from a Sanctuary session cannot be persisted as an episodic mark',
  grade: 'B',
  enforcedBy: 'server-side sanctuary resolution in the episodic mark route (POST), before the INSERT',
  evidence:
    "episodes/mark/route.ts — EXISTS predicates on maia_sessions (mode/privacy_mode = 'sanctuary') OR member_sessions (mode = 'sanctuary') keyed by sourceSessionId AND the authenticated member id; 403 refusal precedes INSERT INTO episodic_memories; runtime cases in app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts + scripts/verify-episodic-sanctuary-guard.ts",
  violationAttempted:
    'find the sanctuary predicates missing/weakened, the member-ownership scoping dropped (turning the guard into a cross-member existence oracle), the refusal downgraded from a hard 403, or the guard placed after the INSERT where it could no longer prevent the write',
  passingAuthorizes:
    'a mark request that names a session known to be Sanctuary (in either session table) is refused server-side before any episodic_memories write — the boundary no longer depends on the client behaving',
  passingDoesNotAuthorize:
    'that every sanctuary-originated mark is caught — a direct caller that omits sourceSessionId gives the server no provenance to resolve, and only the client-side gate covers that path; nor that the guard is structural write-incapacity (it is a behavioural pre-check on a write-capable query() handle) — hence B, not A-minus',
  hostileForkMustChange:
    "remove/weaken either sanctuary EXISTS predicate, drop the 403, or move the guard below the INSERT in the mark route — visible diff",

  run(io) {
    const src = io.read(ROUTE);

    if (LIVE_SESSION_PREDICATE.test(src)) {
      io.pass(
        'mark route consults maia_sessions for live-session sanctuary state',
        "mode = 'sanctuary' OR privacy_mode = 'sanctuary' predicate present",
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
        "member_sessions mode = 'sanctuary' predicate present",
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
        'sanctuary guard precedes the episodic INSERT',
        `guard at char ${guardAt}, INSERT at char ${insertAt}`,
      );
    } else {
      io.fail(
        'sanctuary guard does not precede the INSERT',
        'a guard that runs after the write prevents nothing',
      );
    }

    if (HARD_REFUSAL.test(src)) {
      io.pass('refusal is a hard 403, not a silent drop');
    } else {
      io.fail(
        'no 403 refusal found in the mark route',
        'a silent success would hide the boundary from the member (dangerous failure feels like success)',
      );
    }
  },
};
