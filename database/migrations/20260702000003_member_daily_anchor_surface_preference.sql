-- Daily Anchor — member standing-consent for ambient surfacing.
--
-- WHY: A member authors an anchor's CREATION (answering a Daily Prompt in a
-- moment). But the *eligibility of that anchor to surface into MAIA's prompt on
-- every subsequent turn* was, until this migration, authorized only by the
-- deployment flag MAIA_ANCHOR_CONTEXT_ENABLED — a SYSTEM act, not a member act.
-- The member had no way to inspect or revoke that standing eligibility.
--
-- This mirrors the member_memory_atoms consent model (return_preference): the
-- member's act, not a deploy flag, is the source of standing authorization to
-- surface. The env flag remains a kill-switch only; it is no longer the consent
-- source. See the loader gate in lib/anchor/loadRecentAnchors.ts and the member
-- gesture route app/api/anchor/[id]/surface-preference/route.ts.
--
-- GROUNDING (verified canon — the originally-cited docs/canon/WISDOM_IS_RECOVERED.md
-- could not be found in the repo, so grounding was updated accordingly):
--   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md §7 — longitudinal reflection is
--     "reachable through member-initiated invocation or through MAIA offering —
--     never through ambient surfacing."
--   - The live member_memory_atoms.return_preference consent model (mirrored here
--     verbatim in value vocabulary).
--   - CLAUDE.md "Consent for memory — there is no stealth memory."
--
-- VALUE VOCABULARY (verbatim from member_memory_atoms.return_preference):
--   member_pulled        — surfaces ONLY when the member explicitly pulls it.
--                          Structurally excluded from ambient prompt surfacing.
--   contextual_doorway   — member opted in to ambient contextual surfacing.
--   ritual_review_opt_in — member opted in to review-ritual surfacing.
--
-- DEFAULT: member_pulled. This is the fix's own logic (eligibility originates
-- from a member act). BEHAVIOR CHANGE — INTENTIONAL: because ADD COLUMN ... NOT
-- NULL DEFAULT backfills every existing row to 'member_pulled', all pre-existing
-- anchors STOP surfacing ambiently until each member performs an opt-in gesture.
-- Granting standing consent for existing testers (if desired) is a separate
-- governance/product act, not part of this engineering change.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS (re-running is a no-op).
--
-- ROLLBACK:
--   ALTER TABLE member_daily_anchors DROP COLUMN IF EXISTS surface_preference;
--   (and revert the WHERE-clause gate in lib/anchor/loadRecentAnchors.ts)

ALTER TABLE member_daily_anchors
  ADD COLUMN IF NOT EXISTS surface_preference TEXT NOT NULL DEFAULT 'member_pulled'
    CHECK (surface_preference IN (
      'member_pulled',
      'contextual_doorway',
      'ritual_review_opt_in'
    ));
