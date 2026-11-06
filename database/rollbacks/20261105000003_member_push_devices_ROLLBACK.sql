-- ROLLBACK — PUSH-NOTIFICATIONS / P1
-- Removes the registered-device table. Nothing reads it except the registration
-- endpoint and the dark APNs sender; no notification depends on it yet.
-- Application code must be reverted with the corresponding PR commit.

BEGIN;

SET LOCAL lock_timeout = '5s';

DROP TABLE IF EXISTS member_push_devices;

COMMIT;
