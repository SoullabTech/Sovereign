-- Link practitioner_cases to practitioner_clients via direct FK.
-- Previously, cases used client_identifier (practitioner's pseudonym) only —
-- no structural link to the studio client record.
-- This column makes the case_element_nodes board lookup precise.

ALTER TABLE practitioner_cases
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_practitioner_cases_client_id
  ON practitioner_cases(client_id)
  WHERE client_id IS NOT NULL;
