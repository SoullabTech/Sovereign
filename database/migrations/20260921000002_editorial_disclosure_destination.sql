-- Separate from the boundary-only migration: record the authorized provider.
-- No manuscript content or selection locators. Existing receipts remain unchanged.
BEGIN;
ALTER TABLE context_disclosure_receipts ADD COLUMN destination text
  CHECK (destination IS NULL OR destination = 'anthropic');
ALTER TABLE context_disclosure_receipts ADD CONSTRAINT editorial_destination_required
  CHECK (boundary <> 'writers_studio.editorial_turn->maia_cognition' OR destination IS NOT NULL);
CREATE FUNCTION preserve_disclosure_destination() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.destination IS DISTINCT FROM OLD.destination THEN
    RAISE EXCEPTION 'disclosure destination is immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER preserve_disclosure_destination BEFORE UPDATE ON context_disclosure_receipts
  FOR EACH ROW EXECUTE FUNCTION preserve_disclosure_destination();
COMMENT ON COLUMN context_disclosure_receipts.destination IS
  'Authorized logical inference provider, not proof of endpoint identity or successful delivery.';
COMMIT;
