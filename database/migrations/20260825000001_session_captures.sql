-- Universal Session Capture (JARVIS-USC-01 / USC-02)
--
-- One capture object. Many capture surfaces. One Session Room memory.
--
-- Governed by:
--   docs/security/free-text-phi-doctrine.md      (free-text is PHI by default)
--   database/migrations/README.md                (founder ruling 2026-08-02:
--                                                 structural-only foundations; no
--                                                 plaintext placeholder that must
--                                                 later be migrated)
--   docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md    (consent, non-possession)
--
-- ─────────────────────────────────────────────────────────────────────────────
-- PROVENANCE LAYERS (L3 may never masquerade as L1)
--
--   L0  EVENT               captured_at / session_offset_ms / source / modality
--   L1  RAW HUMAN CAPTURE   content_enc / transcript_enc      ← IMMUTABLE
--   L2  ORGANIZED MATERIAL  capture_kind / tags / elemental_lenses
--   L3  INTERPRETATION      MAIA synthesis — LIVES OUTSIDE THIS TABLE ENTIRELY
--
-- This table holds L0–L2 only. There is deliberately no column in which a
-- MAIA-derived note could be stored, and `captured_by` is CHECK-constrained to
-- 'member' so the system cannot author a capture. Derived material belongs to
-- the session summary / atom lanes, which reference captures rather than
-- overwrite them.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- CONSENT BOUNDARY
--   A capture is NOT a keep. `member_memory_atoms` governs portfolio memory
--   ("material becomes portfolio memory only when the member keeps it").
--   A capture enters MAIA's memory only via an explicit member promotion,
--   recorded here as promoted_atom_id. Nothing in this table reaches MAIA's
--   prompt context on its own.
--
-- SESSION BINDING
--   session_id is NULLABLE by design:
--     bound   → an active, CONSENTED Session Room session (practitioner/solo)
--     unbound → the member's personal capture inbox in their MAIA realm
--   Ingestion never auto-creates a session. A capture arriving with no
--   consented session falls back to unbound; it must never manufacture the
--   consent moment that Session Room requires.

-- ── Prereq guards ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN
    RAISE EXCEPTION 'session_captures requires members table';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scribe_sessions') THEN
    RAISE EXCEPTION 'session_captures requires scribe_sessions table';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'member_memory_atoms') THEN
    RAISE EXCEPTION 'session_captures requires member_memory_atoms table';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS session_captures (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- NULL = personal capture in the member's MAIA realm (see SESSION BINDING).
  session_id           UUID REFERENCES scribe_sessions(id) ON DELETE SET NULL,

  -- ── L0: event ──────────────────────────────────────────────────────────────
  captured_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_offset_ms    INTEGER,

  source               TEXT NOT NULL CHECK (
                         source IN ('web','iphone','ipad','watch','siri','unknown')),
  modality             TEXT NOT NULL CHECK (
                         modality IN ('marker','text','voice','photo','task')),

  -- Structural refusal: MAIA cannot author a capture. L3 cannot become L1.
  captured_by          TEXT NOT NULL DEFAULT 'member' CHECK (captured_by = 'member'),

  -- ── L1: raw human capture — encrypted at birth, no plaintext lane ──────────
  -- AES-256-GCM via lib/security/phiEncryption.ts, AAD-bound to
  -- (table, column, rowId, ownerId). Never returned from the data layer raw.
  content_enc          TEXT,
  content_enc_meta     JSONB,
  transcript_enc       TEXT,
  transcript_enc_meta  JSONB,

  -- Opaque storage locator for voice/photo captures. Never a content field.
  media_path           TEXT,

  -- ── L2: organization — member-assigned only, never system-inferred ─────────
  capture_kind         TEXT,
  tags                 TEXT[] NOT NULL DEFAULT '{}',
  elemental_lenses     TEXT[] NOT NULL DEFAULT '{}',

  visibility           TEXT NOT NULL DEFAULT 'private' CHECK (
                         visibility IN ('private','shareable')),

  -- ── Promotion: the member's keep act (capture → portfolio memory) ──────────
  promoted_atom_id     UUID REFERENCES member_memory_atoms(id) ON DELETE SET NULL,
  promoted_at          TIMESTAMPTZ,

  -- ── Offline-first idempotency ─────────────────────────────────────────────
  -- Client-generated id, stamped at the moment of capture on the device.
  -- A queued watch tap replayed after reconnect resolves to the same row.
  client_capture_id    TEXT NOT NULL,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT session_captures_kind_valid CHECK (
    capture_kind IS NULL OR capture_kind IN (
      'insight','emotion','body','pattern','question','follow_up')),

  CONSTRAINT session_captures_lenses_valid CHECK (
    elemental_lenses <@ ARRAY['fire','water','earth','air','aether']::TEXT[]),

  -- An offset is meaningless without a session to offset from.
  CONSTRAINT session_captures_offset_requires_session CHECK (
    session_offset_ms IS NULL OR session_id IS NOT NULL),

  -- Ciphertext and its metadata are inseparable.
  CONSTRAINT session_captures_content_enc_paired CHECK (
    (content_enc IS NULL) = (content_enc_meta IS NULL)),
  CONSTRAINT session_captures_transcript_enc_paired CHECK (
    (transcript_enc IS NULL) = (transcript_enc_meta IS NULL)),

  -- Promotion is atomic: both halves or neither.
  CONSTRAINT session_captures_promotion_paired CHECK (
    (promoted_atom_id IS NULL) = (promoted_at IS NULL))
);

-- Idempotent ingestion key. This is what makes offline replay safe.
CREATE UNIQUE INDEX IF NOT EXISTS session_captures_client_id_uniq
  ON session_captures (member_id, client_capture_id);

CREATE INDEX IF NOT EXISTS idx_session_captures_session_time
  ON session_captures (session_id, captured_at ASC)
  WHERE session_id IS NOT NULL;

-- The member's unbound capture inbox.
CREATE INDEX IF NOT EXISTS idx_session_captures_inbox
  ON session_captures (member_id, captured_at DESC)
  WHERE session_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_session_captures_unpromoted
  ON session_captures (member_id, captured_at DESC)
  WHERE promoted_atom_id IS NULL;

-- ── L1 immutability: the original observation is never rewritten ─────────────
-- Session Room may organize a capture (L2) or promote it, but the raw material
-- and its provenance are append-only. This is what lets a derived note be
-- trusted as derived.
CREATE OR REPLACE FUNCTION session_captures_protect_raw()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_enc      IS DISTINCT FROM OLD.content_enc
  OR NEW.transcript_enc   IS DISTINCT FROM OLD.transcript_enc
  OR NEW.captured_at      IS DISTINCT FROM OLD.captured_at
  OR NEW.source           IS DISTINCT FROM OLD.source
  OR NEW.modality         IS DISTINCT FROM OLD.modality
  OR NEW.member_id        IS DISTINCT FROM OLD.member_id
  OR NEW.captured_by      IS DISTINCT FROM OLD.captured_by
  OR NEW.client_capture_id IS DISTINCT FROM OLD.client_capture_id
  THEN
    RAISE EXCEPTION
      'session_captures: raw capture (L1) and provenance (L0) are immutable; '
      'attempted mutation on capture %', OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS session_captures_protect_raw_trg ON session_captures;
CREATE TRIGGER session_captures_protect_raw_trg
  BEFORE UPDATE ON session_captures
  FOR EACH ROW
  EXECUTE FUNCTION session_captures_protect_raw();

-- ── Post-create shape check ──────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_captures'
      AND column_name IN ('raw_content','content','transcript','note','body')
  ) THEN
    RAISE EXCEPTION
      'session_captures must not carry a plaintext content column '
      '(founder ruling 2026-08-02)';
  END IF;
END $$;

COMMENT ON TABLE session_captures IS
  'Universal capture spine (USC). L0-L2 only; L3 interpretation lives elsewhere. '
  'Content encrypted at birth. session_id NULL = personal capture inbox.';
COMMENT ON COLUMN session_captures.client_capture_id IS
  'Device-generated id enabling idempotent offline replay (unique per member)';
COMMENT ON COLUMN session_captures.captured_by IS
  'CHECK-pinned to member: the system may never author a capture';
COMMENT ON COLUMN session_captures.promoted_atom_id IS
  'Set only by an explicit member keep act; capture is not memory until promoted';
