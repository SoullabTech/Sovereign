-- STUDIO-A-LA-CARTE-01 Phase 1 — studio holdings ledger. Built dark.
--
-- Design: docs/programme/STUDIO-A-LA-CARTE-01_PHASE1_ENTITLEMENT_DESIGN_2026-11-12.md
-- (founder rulings R1 + R2, 2026-11-12).
--
-- A record of which studio products a member holds (bought, renewed, comped).
-- It is a SOURCE the entitlement layer (lib/auth/entitlements.ts) may read; it
-- decides nothing on its own. Nothing reads it until the deploy setting
-- STUDIO_HOLDINGS_ENABLED = 'true', and nothing writes it yet (Stripe wiring is
-- Phase 2, separately authorized).
--
-- `product` is a catalogue name (e.g. 'studio.writer.pro'), never an
-- entitlement key. A holding unlocks studio tools only; it never changes MAIA's
-- memory, depth or quality of reflection (MAIA_SANCTUARY_ECONOMY).
--
-- Shape: an append-only event log, as astro_pro_tester_grant_events. Current
-- standing = the member's latest event for that product. History is never
-- rewritten. Erasing a member removes their events with them (R20). No PHI, no
-- content: product names, timestamps and Stripe ids only.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS studio_holding_events (
  id              BIGSERIAL PRIMARY KEY,
  member_id       UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  product         TEXT        NOT NULL CHECK (product ~ '^studio\.[a-z]+(\.[a-z]+)?$'),
  event           TEXT        NOT NULL CHECK (event IN ('granted', 'renewed', 'lapsed', 'revoked')),
  source          TEXT        NOT NULL CHECK (source IN ('stripe', 'owner_comp', 'bundle')),
  period_end      TIMESTAMPTZ,
  stripe_event_id TEXT        UNIQUE,
  actor           TEXT        NOT NULL CHECK (char_length(actor) BETWEEN 1 AND 200),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_holding_events_member_product_latest
  ON studio_holding_events (member_id, product, id DESC);

-- Append-only: an event may never be edited. It may be deleted only when its
-- member no longer exists (the ON DELETE CASCADE of a member erasure), so a
-- revocation can never be quietly removed to bring a holding back.
CREATE OR REPLACE FUNCTION studio_holding_events_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'studio_holding_events is append-only';
  END IF;
  IF EXISTS (SELECT 1 FROM members WHERE id = OLD.member_id) THEN
    RAISE EXCEPTION 'studio_holding_events rows are removed only with their member';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS studio_holding_events_guard ON studio_holding_events;
CREATE TRIGGER studio_holding_events_guard
  BEFORE UPDATE OR DELETE ON studio_holding_events
  FOR EACH ROW EXECUTE FUNCTION studio_holding_events_guard();

CREATE OR REPLACE FUNCTION studio_holding_events_no_truncate()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'studio_holding_events may not be truncated';
END;
$$;

DROP TRIGGER IF EXISTS studio_holding_events_no_truncate ON studio_holding_events;
CREATE TRIGGER studio_holding_events_no_truncate
  BEFORE TRUNCATE ON studio_holding_events
  FOR EACH STATEMENT EXECUTE FUNCTION studio_holding_events_no_truncate();

COMMENT ON TABLE studio_holding_events IS
  'STUDIO-A-LA-CARTE-01: append-only studio product holdings. A source for the entitlement layer; decides nothing. Read only when STUDIO_HOLDINGS_ENABLED=true.';

COMMIT;
