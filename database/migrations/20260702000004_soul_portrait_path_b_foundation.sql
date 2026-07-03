-- Soul Portrait — Path B consent foundation (Gate 2).
--
-- Creates the three tables the Path B consent architecture rests on. NO callers are
-- wired here — the tables are inert until the access helper (Gate 3) and route wiring
-- (Gate 4). Zero runtime change on apply.
--
-- Constitutional invariant: a portrait ABOUT a person is member-bound and its consent is
-- recorded, verifiable, and revocable — never inferred from URL obscurity. This lays the
-- schema that makes that structural.
--
-- SOURCE OF TRUTH: the soul_portrait_consents ledger is authoritative for consent
-- liveness. soul_portraits.consent_state is a DENORMALIZED CACHE only (see its comment).
--
-- Idempotent + self-protecting. Safe to re-run.
-- @see docs/architecture/SOUL_PORTRAIT_PATH_B_SPEC.md §3, §4

-- ── Prerequisite guard ──────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN
    RAISE EXCEPTION 'Path B Gate 2: prerequisite table "members" missing; refusing to create FKs into it';
  END IF;
END $$;

-- ── soul_portraits — the gift: member-bound, revocable, immutable-after-publish ──
CREATE TABLE IF NOT EXISTS soul_portraits (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT NOT NULL UNIQUE,                 -- random, un-guessable; obscurity is defense-in-depth, never the gate
  subject_member_id  UUID REFERENCES members(id),          -- who it is ABOUT (nullable: a minor may lack an account)
  owner_member_id    UUID NOT NULL REFERENCES members(id), -- who created/holds it (adult; guardian for a minor)
  subject_is_minor   BOOLEAN NOT NULL DEFAULT FALSE,
  subject_age        INT,                                  -- at authoring time; informs age-appropriate handling
  portrait_kind      TEXT NOT NULL CHECK (portrait_kind IN ('self','gift','parent_child','legacy')),

  -- consent_state: a DENORMALIZED CACHE for fast filtering ONLY. NEVER authoritative.
  -- The soul_portrait_consents ledger is the sole source of truth for consent liveness.
  -- This column is derived from the ledger and may lag it. Gate-3 access checks MUST read
  -- the ledger, not this column. If the two ever disagree, the ledger wins and this
  -- column is corrected to match — never the reverse.
  consent_state      TEXT NOT NULL DEFAULT 'pending' CHECK (consent_state IN ('pending','active','revoked')),

  immutable_text     JSONB NOT NULL,                       -- the gift; write-once after publish (trigger below)
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_soul_portraits_owner   ON soul_portraits (owner_member_id);
CREATE INDEX IF NOT EXISTS idx_soul_portraits_subject ON soul_portraits (subject_member_id);

-- ── member_guardians — who may consent for a minor subject (admin/manual v1) ──
CREATE TABLE IF NOT EXISTS member_guardians (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minor_member_id    UUID REFERENCES members(id),          -- nullable: minor may have no account
  minor_ref          TEXT,                                 -- stable ref when no account
  guardian_member_id UUID NOT NULL REFERENCES members(id),
  relationship       TEXT NOT NULL CHECK (relationship IN ('parent','caregiver','legal_guardian','other')),
  verified_at        TIMESTAMPTZ,                          -- guardianship established manually/admin (v1)
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (minor_member_id IS NOT NULL OR minor_ref IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_member_guardians_minor    ON member_guardians (minor_member_id);
CREATE INDEX IF NOT EXISTS idx_member_guardians_guardian ON member_guardians (guardian_member_id);
CREATE INDEX IF NOT EXISTS idx_member_guardians_minorref ON member_guardians (minor_ref);

-- ── soul_portrait_consents — append-only ledger; AUTHORITATIVE for liveness ──
-- Mirrors session_consent_events. A portrait is consent-live iff, for the relevant actor,
-- the latest 'set'/'accept' has no later 'refuse'/'revoke'. Never updated or deleted.
CREATE TABLE IF NOT EXISTS soul_portrait_consents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portrait_id       UUID NOT NULL REFERENCES soul_portraits(id),
  actor_type        TEXT NOT NULL CHECK (actor_type IN ('guardian','subject','system')),
  actor_member_id   UUID REFERENCES members(id),
  action            TEXT NOT NULL CHECK (action IN ('set','accept','refuse','change','revoke')),
  consent_source    TEXT CHECK (consent_source IN ('verbal','written','digital')),
  agreement_version TEXT NOT NULL,                          -- the consent statement, frozen at decision time
  flags             JSONB,                                  -- { portrait_read, mentor_dialogue, retention:false }
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Serves the authoritative "latest event for this portrait" liveness query (Gate 3).
CREATE INDEX IF NOT EXISTS idx_spc_portrait_time ON soul_portrait_consents (portrait_id, created_at DESC);

-- ── immutable_text write-once (Traceability Covenant, structural not promised) ──
CREATE OR REPLACE FUNCTION enforce_soul_portrait_immutable_text()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.published_at IS NOT NULL
     AND NEW.immutable_text IS DISTINCT FROM OLD.immutable_text THEN
    RAISE EXCEPTION 'soul_portraits.immutable_text is write-once after publish (portrait %)', OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_soul_portrait_immutable_text ON soul_portraits;
CREATE TRIGGER trg_soul_portrait_immutable_text
  BEFORE UPDATE ON soul_portraits
  FOR EACH ROW EXECUTE FUNCTION enforce_soul_portrait_immutable_text();

-- ── Post-create self-verification (self-protecting) ─────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'soul_portraits' AND column_name = 'immutable_text') THEN
    RAISE EXCEPTION 'Path B Gate 2: soul_portraits exists but lacks immutable_text — pre-existing wrong-shape table; refusing to proceed';
  END IF;
  RAISE NOTICE 'Path B Gate 2 ready: soul_portraits / member_guardians / soul_portrait_consents (inert; no callers until Gate 4)';
END $$;
