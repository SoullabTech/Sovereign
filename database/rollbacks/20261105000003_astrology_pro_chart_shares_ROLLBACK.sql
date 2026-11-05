-- ROLLBACK — ASTRO-PRO-CHART-SHARE-01
-- Removes the chart share links table; every shared link stops working.
-- Application code must be reverted with the corresponding PR commit.

BEGIN;

SET LOCAL lock_timeout = '5s';

DROP TABLE IF EXISTS astrology_pro_chart_shares;

COMMIT;
