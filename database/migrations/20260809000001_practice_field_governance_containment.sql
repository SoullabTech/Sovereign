-- Governance Containment for Practice Fields
--
-- Founder ruling 2026-08-09: "Readiness is modeled. Containment is not."
-- Design + durable record: docs/design/practitioner-portal/GOVERNANCE_CONTAINMENT_2026-08-09.md
--
--   readiness   = "could this go live?"      → status / status_reason (computed from content)
--   containment = "may this go live?"        → containment_status     (an explicit governance act)
--
-- These are INDEPENDENT. The state the previous model could not represent:
--     ready = true AND contained = true  →  MUST REMAIN NON-LIVE
--
-- GC-1  Readiness recomputation may never clear, weaken, or override an active containment.
-- GC-2  effective_live := (status = 'live') AND (containment_status = 'none')
-- GC-3  Containment transitions are explicit, attributed acts. No computation, migration,
--       or content edit may set or clear containment — with the single, narrowly scoped
--       legacy exception at the bottom of this file.
--
-- WHY THIS IS TRANSACTIONAL (ordering hazard):
--   Before this migration, practice_field 8be895ad is held non-live ONLY by a free-text
--   sentence in status_reason. It already satisfies checkPracticeFieldReadiness (all four
--   required sections populated; recomputed is_live = true). The moment status becomes
--   purely readiness-derived, that row would compute to 'live' and arm the invitation
--   pathway. The containment must therefore be instantiated in the SAME transaction that
--   creates the substrate — otherwise the migration itself reopens the question the
--   containment was imposed to hold.

BEGIN;

-- ── Substrate ────────────────────────────────────────────────────────────────

ALTER TABLE practice_fields
  ADD COLUMN IF NOT EXISTS containment_status    TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS containment_kind       TEXT,
  ADD COLUMN IF NOT EXISTS containment_reason    TEXT,
  ADD COLUMN IF NOT EXISTS contained_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contained_by          UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS containment_reference TEXT,
  ADD COLUMN IF NOT EXISTS released_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_by           UUID REFERENCES members(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practice_fields_containment_status_check'
  ) THEN
    ALTER TABLE practice_fields
      ADD CONSTRAINT practice_fields_containment_status_check
      CHECK (containment_status IN ('none', 'contained'));
  END IF;
END $$;

-- GC-4 — WHOSE act imposed the containment, and therefore whose act may lift it.
--
--   'voluntary_hold'     — the field holder withheld their own field; they may release it.
--   'governance_hold' — imposed by an authority other than the holder; the SUBJECT may never
--                  release it through the ordinary holder path.
--
-- Same storage, different release authority. This mirrors auth_sessions.revoked, which is
-- written by four paths under three authorities and discriminated by revoked_reason.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practice_fields_containment_kind_check'
  ) THEN
    ALTER TABLE practice_fields
      ADD CONSTRAINT practice_fields_containment_kind_check
      CHECK (containment_kind IS NULL OR containment_kind IN ('voluntary_hold', 'governance_hold'));
  END IF;
END $$;

-- A containment must carry its reason and its date.
--
-- contained_by is deliberately NOT required. Founder ruling 2026-08-09:
--   "Do not invent the missing actor. The database should permit the historical unknown;
--    the live write path should not create new unknown actors."
-- Attribution for NEW containment acts is enforced at the route (GC-3), not here, so that
-- the one legacy containment whose author is unrecoverable from evidence can be recorded
-- honestly rather than fabricated.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practice_fields_containment_has_provenance'
  ) THEN
    ALTER TABLE practice_fields
      ADD CONSTRAINT practice_fields_containment_has_provenance
      CHECK (
        containment_status = 'none'
        OR (containment_reason IS NOT NULL
            AND contained_at IS NOT NULL
            -- An unclassifiable hold has no defined release authority. Refuse to store one.
            AND containment_kind IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_practice_fields_containment
  ON practice_fields(containment_status)
  WHERE containment_status = 'contained';

-- ── Governed transition record ───────────────────────────────────────────────
--
-- R-GC2: "Release should be a governed act with actor, time, prior state, resulting
-- state, and authority basis." Imposition is recorded the same way — an act that can be
-- taken but not audited is not governed.
--
-- Modelled on admin_role_grants (actor / target / old → new), the codebase's existing
-- pattern for recording authority changes durably.

CREATE TABLE IF NOT EXISTS practice_field_containment_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_field_id     UUID NOT NULL REFERENCES practice_fields(id) ON DELETE CASCADE,

  event                 TEXT NOT NULL CHECK (event IN ('imposed', 'released', 'classified')),

  -- Prior → resulting containment state.
  prior_status          TEXT,
  prior_kind            TEXT,
  resulting_status      TEXT NOT NULL,
  resulting_kind        TEXT,

  -- Under what authority the act was taken. Distinct from `reason`, which is prose.
  authority_basis       TEXT NOT NULL
                          CHECK (authority_basis IN ('field_holder', 'platform_governance', 'governed_migration')),
  -- NULL only where the actor is genuinely unrecoverable (the 2026-08-03 legacy case)
  -- or where the act is the migration itself.
  actor_member_id       UUID REFERENCES members(id) ON DELETE SET NULL,
  actor_admin_role      TEXT,

  -- Why, in prose. NEVER parsed to determine authority (R-GC2).
  note                  TEXT,
  classification_basis  TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pf_containment_events_field
  ON practice_field_containment_events(practice_field_id, created_at DESC);

COMMENT ON TABLE practice_field_containment_events IS
  'Governed record of every containment transition: actor, time, prior state, resulting state, authority basis. R-GC2. `note` is explanatory provenance and is NEVER the machine-readable source of release authority — that is containment_kind.';
COMMENT ON COLUMN practice_field_containment_events.authority_basis IS
  'field_holder = the holder acted on their own field · platform_governance = founder/cto acted under R-GC2a · governed_migration = a one-time act performed by an authorized migration.';

COMMENT ON COLUMN practice_fields.containment_status IS
  'Governance containment — "may this go live?", independent of readiness. Only an explicit attributed act may set or clear it (GC-3). syncStatus must never write this column (GC-1).';
COMMENT ON COLUMN practice_fields.containment_reason IS
  'Why the field is contained. Preserved verbatim across release — a released containment keeps its history.';
COMMENT ON COLUMN practice_fields.containment_kind IS
  'GC-4 — whose act imposed the containment, and therefore whose act may lift it. voluntary_hold = the field holder withheld their own field and may release it. governance_hold = imposed under platform governance authority (R-GC2a); the subject may NEVER release it through the holder path. Release authority follows the kind of containment, never the actor''s relationship to the resource.';
COMMENT ON COLUMN practice_fields.contained_by IS
  'Member who imposed the containment. NULL is permitted ONLY for the 2026-08-03 legacy containment, whose author is unrecoverable from evidence. New containments require an authenticated actor, enforced at the route.';
COMMENT ON COLUMN practice_fields.containment_reference IS
  'Pointer to the governing document for this containment.';
COMMENT ON COLUMN practice_fields.released_at IS
  'When an explicit governance release act lifted the containment. Release preserves containment_reason as history rather than erasing it — a hold that can only be imposed and never lifted is not governance.';

-- ── Legacy containment — NARROWLY SCOPED, ONE ROW ────────────────────────────
--
-- Founder ruling 2026-08-09, verbatim scope:
--   "The migration may instantiate containment only for 8be895ad, using the surviving
--    status_reason verbatim and the known date. It must not infer or backfill containment
--    for any other row."
--
-- This is NOT manufacturing a governance act. It preserves an already-existing act from its
-- surviving primary evidence: the status_reason string itself, recorded read-only on
-- 2026-08-09 and reproduced in the durable record. Author unknown → contained_by stays NULL.
--
-- Guarded on the exact surviving text, so this is inert if the row has already been
-- edited, already contained, or does not exist in this database.

-- containment_kind = 'governance_hold', on the evidence of the surviving text itself:
-- "preserved as evidence pending governance decision". This is a prohibition pending a
-- governance decision, NOT a practitioner pausing their own field. The field holder must
-- therefore not be able to lift it through the ordinary holder path (GC-4).
-- It is also the safe direction: an unclassifiable restraint takes the more restrictive
-- classification, never the more permissive one.

UPDATE practice_fields
   SET containment_status    = 'contained',
       containment_kind       = 'governance_hold',
       containment_reason    = status_reason,
       contained_at          = TIMESTAMPTZ '2026-08-03 00:00:00+00',
       contained_by          = NULL,
       containment_reference = 'docs/design/practitioner-portal/GOVERNANCE_CONTAINMENT_2026-08-09.md — legacy containment preserved from surviving status_reason; author unrecoverable from evidence'
 WHERE id::text LIKE '8be895ad%'
   AND containment_status = 'none'
   AND status_reason LIKE 'contained 2026-08-03:%';

-- Record the classification as a governed act, so the epistemology stays clean.
--
-- ⛔ THIS IS A ONE-TIME GOVERNED CLASSIFICATION, NOT A PRECEDENT.
--
-- Founder ruling 2026-08-09: "legacy classification by explicit migration decision ≠
-- permission for runtime semantic inference from `reason`." The surviving text was
-- sufficient evidence for a founder to classify THIS instance. No code may ever read
-- prose to decide a containment's kind or its release authority — that is what
-- containment_kind exists for, and invariant K3 enforces it.

INSERT INTO practice_field_containment_events (
  practice_field_id, event,
  prior_status, prior_kind, resulting_status, resulting_kind,
  authority_basis, actor_member_id, actor_admin_role,
  note, classification_basis
)
SELECT
  pf.id, 'classified',
  'contained', NULL,          -- untyped: contained in substance, with no kind recorded
  'contained', 'governance_hold',
  'governed_migration', NULL, NULL,
  'legacy untyped containment → governance_hold',
  'R-GC2 legacy ruling (founder, 2026-08-09) — classified from the surviving status_reason of 2026-08-03; imposing actor unrecoverable and deliberately not invented. Classification by explicit migration decision only; confers no permission for runtime inference from reason text.'
FROM practice_fields pf
WHERE pf.id::text LIKE '8be895ad%'
  AND pf.containment_kind = 'governance_hold'
  AND NOT EXISTS (
    SELECT 1 FROM practice_field_containment_events e
     WHERE e.practice_field_id = pf.id AND e.event = 'classified'
  );

COMMIT;
