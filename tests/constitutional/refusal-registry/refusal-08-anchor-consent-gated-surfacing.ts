import type { RefusalCheck } from './harness';

/**
 * Refusal 08 — a Daily Anchor never surfaces ambiently without member standing
 * consent.
 *
 * A member authors an anchor's CREATION, but its eligibility to surface into
 * MAIA's prompt on every subsequent turn must originate from a MEMBER act, not
 * from the MAIA_ANCHOR_CONTEXT_ENABLED deployment flag (a system act). The
 * ambient-surfacing loader (loadRecentAnchors) carries an explicit SQL predicate
 * admitting ONLY anchors the member opted in to surface. `member_pulled` (the
 * DEFAULT) is structurally excluded — it can only surface when the member pulls
 * it, never ambiently.
 *
 * The exclusion is structural (in the query), not a post-filter a caller could
 * bypass. Mirrors R04 (sacred_protected). Grounding: SPIRAL_CONTINUITY_ENGINE §7
 * (reflection is invitable, never ambient) + the member_memory_atoms consent
 * model.
 */

const LOADER = 'lib/anchor/loadRecentAnchors.ts';

// The consent gate: surface_preference IN ('contextual_doorway','ritual_review_opt_in').
// Whitespace-tolerant so it survives reformatting. If this predicate is removed
// or weakened, anchors could surface ambiently without member standing consent.
const CONSENT_GATE =
  /surface_preference\s+IN\s*\(\s*'contextual_doorway'\s*,\s*'ritual_review_opt_in'\s*\)/;

// A hostile fork could try to slip 'member_pulled' into the ambient-eligible set.
// If the default value appears inside the loader's IN(...) list, the gate is defeated.
const MEMBER_PULLED_ADMITTED = /IN\s*\([^)]*'member_pulled'[^)]*\)/;

export const check: RefusalCheck = {
  id: 'R08',
  refusal: 'a Daily Anchor never surfaces ambiently without member standing consent',
  grade: 'A-minus',
  enforcedBy: 'SQL predicate in the anchor ambient-surfacing loader (loadRecentAnchors)',
  evidence:
    "loadRecentAnchors.ts — WHERE ... AND surface_preference IN ('contextual_doorway','ritual_review_opt_in'); column + CHECK in migration 20260702000003; consent gesture route app/api/anchor/[id]/surface-preference",
  violationAttempted:
    'find the consent predicate missing/weakened, or member_pulled admitted into the ambient-eligible set, in the anchor loader query',
  passingAuthorizes:
    "this loader's ambient query admits only member-opted-in anchors; member_pulled anchors are excluded from ambient prompt surfacing at the SQL layer",
  passingDoesNotAuthorize:
    'that anchors are unreadable by ALL paths — the member-initiated own-review (/api/anchor/recent) intentionally returns all anchors regardless of preference; only THIS ambient loader is gated. It is a behavioural-absence gate on a write-capable query() handle, not structural write-incapacity — hence A-minus.',
  hostileForkMustChange:
    "remove/weaken the surface_preference IN(...) predicate, or add 'member_pulled' to the ambient-eligible set, in the loader query — visible diff",

  run(io) {
    const src = io.read(LOADER);

    if (CONSENT_GATE.test(src)) {
      io.pass(
        'anchor loader gates ambient surfacing on member standing consent',
        'surface_preference predicate present in loader query',
      );
    } else {
      io.fail(
        'anchor consent gate predicate missing or altered',
        'refusal falsified — anchors could surface ambiently without member consent',
      );
    }

    if (MEMBER_PULLED_ADMITTED.test(src)) {
      io.fail(
        "member_pulled admitted into the loader's ambient-eligible IN(...) set",
        'default (non-consenting) anchors would surface ambiently — refusal falsified',
      );
    } else {
      io.pass(
        'member_pulled is not in the ambient-eligible set',
        'default anchors excluded from ambient surfacing',
      );
    }
  },
};
