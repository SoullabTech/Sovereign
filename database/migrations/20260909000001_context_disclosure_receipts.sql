-- Context Disclosure Receipts — the disclosure-accountability substrate.
--
-- Authority:
--   docs/programme/FOCUS-DISCLOSURE-RECEIPT_CONTRACT_2026-09-09.md  (Step 5, RATIFIED)
--   docs/programme/FOCUS-RECEIPT-SUBSTRATE_CENSUS_2026-09-09.md     (Step 4: dedicated substrate)
--   docs/programme/FOCUS-DISCLOSURE-CONTRACT_TURNS_CENSUS_2026-09-09.md
--
--   Disclosure without accountability is not authorized.
--   Accountability without a disclosure must never pretend that one occurred.
--
-- ⭐ GENERALIZED BEFORE FIRST APPLICATION (founder, 2026-09-09). The
-- constitutional question is not unique to manuscript passages. It is the same
-- wherever ANY member-owned or member-derived context crosses into cognition —
-- a journal entry, a Keep, a remembered decision, a past session, a Work
-- passage, an invoked astrological or divinatory reading:
--
--   ⭐⭐ What context crossed into cognition for this encounter,
--       and under what authority?
--
-- One substrate answers that, with `source_class` naming the kind of context and
-- `participation_basis` naming why it was entitled to participate. Focus is the
-- FIRST implemented source class, not the only conceivable one — but ⛔ only the
-- values v1 can actually produce are admitted by the CHECKs. A future capability
-- is not a present data field; widening either axis is a migration, and
-- therefore a governed act.
--
-- WHAT THIS IS, and the three truths it must not collapse:
--   conversation_turns              what was said
--   S5 provenance / consent state   under what authority persistence was allowed
--   THIS TABLE                      what governed boundary actually crossed
--
-- Persistence provenance is not disclosure provenance. A receipt is minted where
-- the disclosure occurs, not where the conversation turn is stored.
--
-- ⛔ THE WORK IS NOT AN INSTRUCTION CHANNEL. A manuscript sentence reading
-- "ask the I Ching what this means" does not authorize a consultation. The Work
-- may contain an invitation as CONTENT; only the writer can turn it into
-- AUTHORITY. No `participation_basis` may ever be derived from crossed content.
--
-- ⛔ CONTENT-FREE BY CONSTITUTION. A disclosure receipt records the fact and
-- scope of disclosure, never the disclosed content itself: the evidence that
-- content crossed a boundary must not itself become another copy of the content.
-- REFUSED, permanently, by ruling: passage text · excerpt · summary · embedding ·
-- content hash or fingerprint · character offsets · length · selection geometry ·
-- a passage-level section_ref.
--   ⭐ The hash is the one that looks safe and is not. A digest leaks nothing
--   WITHOUT the Work — but the Work is exactly what anyone auditing this system
--   holds, so a hash beside the manuscript is a selection locator.
--
-- LIFECYCLE (stated as constitution, never inherited):
--   * identifying fields immutable at mint; the ONLY lawful UPDATE is
--     attempted → crossed, trigger-enforced.
--   * `attempted` means A CROSSING MAY HAVE OCCURRED AND WAS NOT CONFIRMED.
--     ⛔ It never means "nothing crossed". No reader may read it as absence.
--   * no automatic pruning, and no age-based lifecycle. Ordinary transcript
--     pruning (TurnsStore.pruneOldTurns) must never reach a receipt.
--   * deliberately deleted with the member's account — the table is named in
--     GOVERNED_CONTENT so it cannot survive by nobody having listed it.
--   * Sanctuary: the receipt is PERMITTED, the disclosed thing is FORBIDDEN.
--     Sanctuary may retain the fact of a disclosure; it may not retain the
--     disclosed thing. The refusals above are what make that safe.
--   * restores must honour deletion manifests + provenance tombstones (S5).
--   * a future audit-retention limit must be separately ratified. No TTL now.
--
-- Release unit: ships with lib/writers-studio/disclosure/focusDisclosureReceipt.ts.
-- ⛔ Unlike observability substrates, the writer here is NOT failure-tolerant:
-- if this migration has not run, the mint fails and the disclosure does not
-- happen. Deploy via the FULL path (scripts/deploy-production.sh deploy <SHA>).

BEGIN;

CREATE TABLE IF NOT EXISTS context_disclosure_receipts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Idempotency: one disclosure attempt, one row. A retry carrying the same id
  -- can neither duplicate a crossing nor contradict a recorded one.
  disclosure_id  TEXT NOT NULL UNIQUE,

  member_id      TEXT NOT NULL,

  -- The temporal anchor. The disclosure occurs WITHIN the serving request,
  -- whether or not a conversation turn is ever persisted; and it joins to
  -- runtime_consent_state, where the posture is REFERENCED, never copied.
  -- ⛔ Deliberately NOT a conversation_turns.id: durable audit identity must not
  -- depend on a routinely pruned content object.
  -- ⭐ SUBSTRATE-A(B): the reference must RESOLVE. Without the FK a receipt could
  -- satisfy every constraint while pointing at a consent record that does not
  -- exist — "posture is referenced, not copied" would be a comment, not an
  -- architecture. runtime_consent_state.request_id is UNIQUE.
  -- ⚠️ UNWITNESSED AS OF THIS MIGRATION: that the serving boundary mints the
  -- consent row BEFORE Work context is assembled. The FK makes a violation fail
  -- closed — the correct direction, and still a silent capability loss.
  -- REQUEST-ORDER-01 proves the ordering; do not wire Focus before it passes.
  request_ref    TEXT NOT NULL REFERENCES runtime_consent_state(request_id),

  boundary       TEXT NOT NULL CHECK (
    boundary IN ('writers_studio.focus->maia_cognition')
  ),

  -- WHAT kind of context crossed. Intended axis vocabulary (⛔ NOT admitted yet):
  --   work · memory · journal · keep · decision · change · session · symbolic_system
  source_class   TEXT NOT NULL CHECK (source_class IN ('work')),

  -- WHY it was entitled to participate. ⭐ Availability is not permission to
  -- participate; participation is not authority. Intended axis vocabulary
  -- (⛔ NOT admitted yet): ambient_continuity · member_invited ·
  -- member_invoked · standing_authorization.
  --   v1 admits only `member_invoked`: Focus is context the writer placed and
  --   then explicitly handed across, not context MAIA reached for.
  participation_basis TEXT NOT NULL CHECK (participation_basis IN ('member_invoked')),

  -- Identity of the crossed thing: authored or assigned, NEVER derived from its
  -- content. For source_class='work' this is the Work id.
  source_ref     TEXT NOT NULL,

  -- The SHAPE of the selection, never its location.
  scope_kind     TEXT NOT NULL CHECK (scope_kind IN ('whole_work', 'section', 'passage')),

  -- Legitimate only when the section IS the disclosed thing. For a passage the
  -- containing section materially narrows reconstruction, so it is refused —
  -- the receipt proves the governed crossing, not the identity of what crossed.
  section_ref    TEXT,

  -- ⭐ Visible Focus is writer-owned. The system may assemble what the member
  -- authorized; assembly is not authorization. A lawful ambient Work-context
  -- policy, if one is ever constituted, is its own authority class — not an enum
  -- value sitting available from day one.
  authorized_by  TEXT NOT NULL CHECK (authorized_by = 'member'),
  gesture        TEXT NOT NULL CHECK (
    gesture IN ('ask_maia', 'work_with_this', 'widen_focus')
  ),

  policy_version TEXT NOT NULL,

  -- Two states, and no third. A `withheld` state would assert a negative the
  -- database cannot prove: unknown may be noisy, false certainty is worse.
  state          TEXT NOT NULL CHECK (state IN ('attempted', 'crossed')),
  attempted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  crossed_at     TIMESTAMPTZ,

  CONSTRAINT context_disclosure_receipts_section_scope_only
    CHECK (section_ref IS NULL OR scope_kind = 'section'),
  CONSTRAINT context_disclosure_receipts_crossed_at_matches_state
    CHECK ((state = 'crossed') = (crossed_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_context_disclosure_receipts_member
  ON context_disclosure_receipts (member_id, attempted_at DESC);

-- The governance anomaly query: crossings begun and never confirmed. Permanent,
-- queryable and loud — the opposite of a silent loss.
CREATE INDEX IF NOT EXISTS idx_context_disclosure_receipts_unresolved
  ON context_disclosure_receipts (attempted_at) WHERE state = 'attempted';

-- ─────────────────────────────────────────────────────────────────────────────
-- Monotonic immutability: frozen at mint, except one lawful step forward.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION context_disclosure_receipt_monotonic() RETURNS trigger AS $$
BEGIN
  IF NEW.disclosure_id IS DISTINCT FROM OLD.disclosure_id
     OR NEW.member_id     IS DISTINCT FROM OLD.member_id
     OR NEW.request_ref   IS DISTINCT FROM OLD.request_ref
     OR NEW.boundary      IS DISTINCT FROM OLD.boundary
     OR NEW.source_class  IS DISTINCT FROM OLD.source_class
     OR NEW.participation_basis IS DISTINCT FROM OLD.participation_basis
     OR NEW.source_ref    IS DISTINCT FROM OLD.source_ref
     OR NEW.scope_kind    IS DISTINCT FROM OLD.scope_kind
     OR NEW.section_ref   IS DISTINCT FROM OLD.section_ref
     OR NEW.authorized_by IS DISTINCT FROM OLD.authorized_by
     OR NEW.gesture       IS DISTINCT FROM OLD.gesture
     OR NEW.policy_version IS DISTINCT FROM OLD.policy_version
     OR NEW.attempted_at  IS DISTINCT FROM OLD.attempted_at THEN
    RAISE EXCEPTION
      '[DISCLOSURE] receipt is immutable at mint — UPDATE refused (disclosure_id prefix %)',
      LEFT(OLD.disclosure_id, 12);
  END IF;

  -- Confirming an already-confirmed crossing is a no-op, not an error: a retry
  -- must not become a second, contradictory piece of evidence.
  IF OLD.state = 'crossed' AND NEW.state = 'crossed' THEN
    NEW.crossed_at := OLD.crossed_at;
    RETURN NEW;
  END IF;

  IF NOT (OLD.state = 'attempted' AND NEW.state = 'crossed') THEN
    RAISE EXCEPTION
      '[DISCLOSURE] unlawful state transition % → % — the only lawful step is attempted → crossed (disclosure_id prefix %)',
      OLD.state, NEW.state, LEFT(OLD.disclosure_id, 12);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- SUBSTRATE-A(C) · Custody ENFORCED, not merely claimed.
--
-- ⛔ The contract said "deletion outside governed custody is refused" and
-- "restores must honour manifests and tombstones". A stronger sentence must never
-- stand over weaker machinery, so both are triggers now.
--
-- The S5 generic restore-refusal machinery is NOT reused: it was written around
-- content rows carrying session_id/created_at, while this receipt carries
-- member_id/request_ref/attempted_at. A receipt-shaped refusal, deliberately.
-- ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletion is lawful only inside a governed custody act that NAMES its manifest.
 * The manifest id is set for the transaction:
 *   SET LOCAL app.disclosure_deletion_manifest = '<manifest uuid>';
 * An unnamed DELETE — ordinary pruning, a stray script, a cleanup job — refuses.
 */
CREATE OR REPLACE FUNCTION context_disclosure_receipt_governed_delete() RETURNS trigger AS $$
DECLARE
  manifest TEXT := NULLIF(current_setting('app.disclosure_deletion_manifest', TRUE), '');
BEGIN
  IF manifest IS NULL THEN
    RAISE EXCEPTION
      '[DISCLOSURE] DELETE refused — a disclosure receipt may be ended only by a governed custody act naming its manifest (SET LOCAL app.disclosure_deletion_manifest). disclosure_id prefix %',
      LEFT(OLD.disclosure_id, 12);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM deletion_manifests WHERE id::text = manifest) THEN
    RAISE EXCEPTION
      '[DISCLOSURE] DELETE refused — named manifest % does not exist', manifest;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS context_disclosure_receipt_governed_delete_trigger ON context_disclosure_receipts;
CREATE TRIGGER context_disclosure_receipt_governed_delete_trigger
  BEFORE DELETE ON context_disclosure_receipts
  FOR EACH ROW EXECUTE FUNCTION context_disclosure_receipt_governed_delete();

/**
 * A tombstoned receipt may never be resurrected by a restore.
 * Forgetting is a decision; a backup must not quietly reverse it.
 */
CREATE OR REPLACE FUNCTION context_disclosure_receipt_restore_refusal() RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM provenance_tombstones
     WHERE object_kind = 'context_disclosure_receipts'
       AND object_id = NEW.disclosure_id
  ) THEN
    RAISE EXCEPTION
      '[DISCLOSURE] INSERT refused — reason=tombstone disclosure_id prefix %',
      LEFT(NEW.disclosure_id, 12);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS context_disclosure_receipt_restore_refusal_trigger ON context_disclosure_receipts;
CREATE TRIGGER context_disclosure_receipt_restore_refusal_trigger
  BEFORE INSERT ON context_disclosure_receipts
  FOR EACH ROW EXECUTE FUNCTION context_disclosure_receipt_restore_refusal();

DROP TRIGGER IF EXISTS context_disclosure_receipt_monotonic_trigger ON context_disclosure_receipts;
CREATE TRIGGER context_disclosure_receipt_monotonic_trigger
  BEFORE UPDATE ON context_disclosure_receipts
  FOR EACH ROW EXECUTE FUNCTION context_disclosure_receipt_monotonic();

COMMENT ON TABLE context_disclosure_receipts IS
'Records that member-owned or member-derived context crossed a defined boundary into cognition, with source_class naming the kind of context and participation_basis naming why it was entitled to participate. Focus/work is the first implemented source class; each axis admits only what v1 can produce, and widening either is a governed migration. Content-free by constitution: the fact and scope of a disclosure, never the disclosed content — no text, excerpt, summary, embedding, hash, offset, length or geometry, and no passage-level section_ref (a hash or offset beside the Work is a selection locator). Lifecycle: identifying fields immutable at mint, the only lawful UPDATE being attempted → crossed (trigger-enforced); no automatic pruning and no age-based lifecycle; deletable ONLY by a governed custody act naming its deletion manifest (BEFORE DELETE trigger); named in GOVERNED_CONTENT, where the account-deletion route is in REFUSE posture — so today a receipt cannot survive a successful account deletion because deletion refuses to proceed while one exists; deletion WITH the account awaits the governed deletion lane; a tombstoned receipt cannot be restored (BEFORE INSERT trigger); permitted under Sanctuary while the disclosed thing is forbidden; restores must honour deletion manifests and tombstones. state=attempted means A CROSSING MAY HAVE OCCURRED AND WAS NOT CONFIRMED — never that nothing crossed.';

COMMENT ON COLUMN context_disclosure_receipts.participation_basis IS
'Why this context was entitled to participate — not merely that it was available. Availability is not permission to participate; participation is not authority. NEVER derived from the crossed content: the Work may contain an invitation as content, but only the member can turn it into authority.';

COMMENT ON COLUMN context_disclosure_receipts.request_ref IS
'Serving-request id; the temporal anchor, and the join to runtime_consent_state where the posture is referenced rather than copied. Never a conversation_turns.id: durable audit identity must not depend on a routinely pruned content object.';

COMMENT ON COLUMN context_disclosure_receipts.state IS
'attempted = minted before the crossing and not conclusively confirmed (a crossing may have occurred). crossed = confirmed. There is no withheld state: it would assert a negative the database cannot prove.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260909000001: context_disclosure_receipts + monotonic immutability trigger applied';
END $$;
