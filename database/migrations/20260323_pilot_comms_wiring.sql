-- ═══════════════════════════════════════════════════════════════════════════════
-- PILOT COMMS WIRING
--
-- Wire portal clients into the comms spine:
-- 1. Unique active thread index (prevents duplicate threads per client)
-- 2. Seed comms_identities for clients who already claimed portal access
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Ensure 1 active thread per client per domain+type
--    Enables ON CONFLICT for findOrCreateThread
CREATE UNIQUE INDEX IF NOT EXISTS idx_comms_threads_unique_active
  ON comms_threads (practitioner_id, client_id, domain, thread_type)
  WHERE status = 'active';

-- 2. Seed comms_identities for existing claimed portal clients
--    Creates an in_app identity so the comms spine can resolve them
INSERT INTO comms_identities (owner_type, owner_id, channel_type, address, verified, is_primary, status)
SELECT 'client', pc.id, 'in_app', pc.portal_email, true, true, 'active'
FROM practitioner_clients pc
WHERE pc.portal_claimed_at IS NOT NULL
  AND pc.portal_email IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Seed comms_threads for existing claimed portal clients
--    Creates a clinical between_session thread if one doesn't exist
INSERT INTO comms_threads (domain, thread_type, participants, practitioner_id, client_id, status)
SELECT
  'clinical',
  'between_session',
  jsonb_build_object('practitioner_id', p.member_id, 'client_id', pc.id),
  p.member_id,
  pc.id,
  'active'
FROM practitioner_clients pc
JOIN practitioners p ON p.id = pc.practitioner_id
WHERE pc.portal_claimed_at IS NOT NULL
  AND pc.portal_email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM comms_threads ct
    WHERE ct.practitioner_id = p.member_id
      AND ct.client_id = pc.id
      AND ct.domain = 'clinical'
      AND ct.thread_type = 'between_session'
      AND ct.status = 'active'
  );
