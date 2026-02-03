-- ============================================
-- UPGRADE BETA MEMBERS TO PERSONAL TIER
-- All existing members are beta testers who
-- should have personal tier access
-- ============================================

BEGIN;

-- Upgrade all members with free/null tier to personal
UPDATE members
SET tier = 'personal'
WHERE tier = 'free' OR tier IS NULL;

-- Log the upgrade
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Upgraded % members to personal tier', v_count;
END;
$$;

COMMIT;
