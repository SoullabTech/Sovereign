-- ─────────────────────────────────────────────────────────────────────────────
-- ADDENDUM-01 · the disclosure vocabulary catches up with the shipped product.
--
--   The disclosure authority was correctly designed as one boundary; what was
--   incomplete was our knowledge of the gestures, scopes, and act identities
--   that must arrive at it.
--
-- Three consumers cross one boundary: Focus, the developmental Ask, and the
-- commissioned reading. `/readings` already offers the writer four scope shapes
-- (whole · section · unit · range), and two of them had no truthful name here.
--
-- ⛔ ADDITIVE AND NARROW. No storage redesign, no UNIQUE(request_ref), no generic
-- JSONB scope bag, and `passage` keeps its prohibition on a containing
-- `section_ref`. A wider vocabulary is not a wider licence.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── 1 · SCOPE SHAPES ────────────────────────────────────────────────────────
-- `unit` is one authored structural division and the sections it lawfully holds.
-- `range` is one explicitly bounded contiguous run of sections.
--
-- ⛔ NEITHER MEANS whole_work, and neither may be decomposed into several
-- receipts to fit an older vocabulary: one commissioned reading is ONE handoff
-- and therefore ONE disclosure act, however many sections its body contains.
ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_scope_kind_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_scope_kind_check
  CHECK (scope_kind IN ('whole_work', 'section', 'passage', 'unit', 'range'));

-- ── 2 · LOCATORS ────────────────────────────────────────────────────────────
-- The governing test, unchanged from the record:
--
--   A durable locator may name the thing that was disclosed; it may not smuggle
--   in a containing location merely because implementation knows it.
--
-- A unit id names the authored division that IS what crossed. Range bounds ARE
-- the identity of the disclosed run. A passage's containing section is neither —
-- it narrows reconstruction of a selection the receipt deliberately does not
-- record, and stays refused.
ALTER TABLE context_disclosure_receipts
  ADD COLUMN IF NOT EXISTS unit_ref       TEXT,
  ADD COLUMN IF NOT EXISTS range_from_ref TEXT,
  ADD COLUMN IF NOT EXISTS range_to_ref   TEXT;

-- ⭐ Stronger than `section_ref`'s rule, deliberately. `section_ref` may be absent
-- from a section receipt for historical reasons; these columns are constituted
-- now, so a `unit` receipt that does not name its unit — or a `range` receipt
-- that names one bound — is refused rather than stored as a half-truth.
ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_unit_scope_only
  CHECK ((unit_ref IS NOT NULL) = (scope_kind = 'unit'));

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_range_scope_only
  CHECK ((range_from_ref IS NOT NULL) = (scope_kind = 'range'));

-- ⭐ The bounds travel as a pair. One endpoint without the other is not a
-- truthful range locator — it is a section reference wearing a range's name.
ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_range_bounds_paired
  CHECK ((range_from_ref IS NULL) = (range_to_ref IS NULL));

-- ── 3 · BOUNDARY VOCABULARY ─────────────────────────────────────────────────
-- The old literal names a SURFACE. Three consumers cross one boundary, and the
-- boundary column should say what crosses, not which screen the writer used —
-- that is what `gesture` is for.
--
-- ⛔ HISTORICAL VALUE PRESERVED. Receipts already written under the Focus-named
-- boundary are not rewritten to normalize vocabulary. A record is a reading at a
-- time; the honest repair is to admit the new value, never to edit the old rows.
ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_boundary_check
  CHECK (boundary IN (
    'writers_studio.focus->maia_cognition',  -- HISTORICAL. Do not use for new crossings.
    'manuscript_prose->maia_cognition'       -- ⭐ The semantic boundary. One for all three consumers.
  ));

-- ── 4 · GESTURE VOCABULARY ──────────────────────────────────────────────────
-- The writer act that authorized the crossing. The surface lives here, not in
-- `boundary`. A commissioned reading is not an ask.
ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_gesture_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_gesture_check
  CHECK (gesture IN ('ask_maia', 'work_with_this', 'widen_focus', 'commission_reading'));

-- ── 5 · THE NEW LOCATORS ARE IMMUTABLE AT MINT ──────────────────────────────
-- ⛔ Adding a column without adding it here would make it the one mutable field
-- on an otherwise frozen receipt — and the mutable field is exactly where a
-- later "correction" would rewrite what crossed.
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
     OR NEW.unit_ref      IS DISTINCT FROM OLD.unit_ref
     OR NEW.range_from_ref IS DISTINCT FROM OLD.range_from_ref
     OR NEW.range_to_ref  IS DISTINCT FROM OLD.range_to_ref
     OR NEW.authorized_by IS DISTINCT FROM OLD.authorized_by
     OR NEW.gesture       IS DISTINCT FROM OLD.gesture
     OR NEW.policy_version IS DISTINCT FROM OLD.policy_version
     OR NEW.attempted_at  IS DISTINCT FROM OLD.attempted_at THEN
    RAISE EXCEPTION
      '[DISCLOSURE] receipt is immutable at mint — UPDATE refused (disclosure_id prefix %)',
      LEFT(OLD.disclosure_id, 12);
  END IF;

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

COMMENT ON COLUMN context_disclosure_receipts.unit_ref IS
'ADDENDUM-01: the authored structural division that IS the disclosed thing. Present exactly when scope_kind=unit.';
COMMENT ON COLUMN context_disclosure_receipts.range_from_ref IS
'ADDENDUM-01: first section of the disclosed contiguous run. Present exactly when scope_kind=range, always paired with range_to_ref.';
COMMENT ON COLUMN context_disclosure_receipts.range_to_ref IS
'ADDENDUM-01: last section of the disclosed contiguous run. Paired with range_from_ref; one bound alone is not a truthful range.';

COMMIT;
