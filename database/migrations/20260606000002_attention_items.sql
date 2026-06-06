-- ============================================================================
-- Attention substrate — the per-recipient, SOURCE-AGNOSTIC attention record.
-- ============================================================================
-- Spec: docs/specs/ATTENTION_SUBSTRATE_GENERALIZATION_2026-06-06.md
--       (builds on COLAB_ATTENTION_LAYER_SPEC_2026-06-06.md)
--
-- An attention_item is a SENDER-DECLARED LOOP. Doctrine: "Universal attention
-- substrate; Co-lab-only first surface." The ORIGIN is polymorphic
-- (source_type, source_id, source_context) — NO hard FK to any one origin, so the
-- same table serves Co-lab now and Session / Practitioner / Journal / Relationship
-- sources later. colab_message is the only live source today.
--
-- Boundary (structural):
--   - created_by NOT NULL → no system-authored items (no algorithmic engagement)
--   - status is CLOSURE ONLY (open|resolved|declined). "Opened" is the opened_at
--     TIMESTAMP, not a status — opening a loop does not close it. There is NO field
--     for read-depth / agreement / reception / consent, so "Opened" cannot leak them.
--
-- source_context is the DISPLAY source-of-truth (For You renders from it, no origin
-- join). Losing the FK cascade is handled at the app layer (purgeAttentionForSource
-- + graceful tombstone) — see spec §4.
-- ============================================================================

-- 1. The primitive
CREATE TABLE IF NOT EXISTS attention_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,  -- universal
    created_by      UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,  -- human author (S1)
    source_type     TEXT NOT NULL,                                           -- WHERE it came from ('colab_message', …)
    source_id       UUID NOT NULL,                                           -- originating entity id (NO db FK — polymorphic)
    source_context  JSONB NOT NULL DEFAULT '{}'::jsonb,                      -- denormalized display + link payload
    kind            TEXT NOT NULL CHECK (kind IN ('mention','request','assignment','thread_reply')),
    status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','declined')),  -- closure only
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    opened_at       TIMESTAMPTZ,   -- set when recipient FIRST opens it; does NOT close the loop
    resolved_at     TIMESTAMPTZ    -- set on resolve OR decline
);

-- Idempotency: one source entity can't open duplicate loops of the same kind for the same person.
CREATE UNIQUE INDEX IF NOT EXISTS idx_attention_items_dedup
    ON attention_items (recipient_id, source_type, source_id, kind);

-- For-You read: a recipient's loops, newest first.
CREATE INDEX IF NOT EXISTS idx_attention_items_recipient
    ON attention_items (recipient_id, status, created_at DESC);

-- Sender-side "Opened / Resolved" display + per-source lookups.
CREATE INDEX IF NOT EXISTS idx_attention_items_source
    ON attention_items (source_type, source_id);

-- Digest sweep hot-set: open + unopened, by age.
CREATE INDEX IF NOT EXISTS idx_attention_items_unopened
    ON attention_items (created_at)
    WHERE status = 'open' AND opened_at IS NULL;

-- 2. Extend message_kind to include 'request' (the one new attention-bearing kind)
--    on BOTH channel and DM messages. The original inline CHECK (20260321000004)
--    auto-named as <table>_message_kind_check; drop + recreate by name.
ALTER TABLE team_messages DROP CONSTRAINT IF EXISTS team_messages_message_kind_check;
ALTER TABLE team_messages ADD CONSTRAINT team_messages_message_kind_check
    CHECK (message_kind IN ('build', 'question', 'decision', 'insight', 'request'));

ALTER TABLE team_dm_messages DROP CONSTRAINT IF EXISTS team_dm_messages_message_kind_check;
ALTER TABLE team_dm_messages ADD CONSTRAINT team_dm_messages_message_kind_check
    CHECK (message_kind IN ('build', 'question', 'decision', 'insight', 'request'));

-- 3. Consent gate (D6): opt-out, default on.
ALTER TABLE members
    ADD COLUMN IF NOT EXISTS attention_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE;
