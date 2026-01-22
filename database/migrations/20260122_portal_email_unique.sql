-- ============================================
-- PORTAL EMAIL UNIQUENESS
-- Ensures one portal account per email per practitioner
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_practitioner_clients_unique_portal_email_per_practitioner
  ON practitioner_clients(practitioner_id, portal_email)
  WHERE portal_email IS NOT NULL;

COMMENT ON INDEX idx_practitioner_clients_unique_portal_email_per_practitioner
  IS 'Prevents duplicate portal accounts - one email per practitioner';
