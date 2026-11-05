-- ASTRO-PRO-CHART-SHARE-01 — a private link that shows a client their chart.
--
-- One row per link to one Pro saved chart. The owner confirms the person agreed
-- to have their chart shared by link (consent_attested_at); the link reads the
-- saved chart's birth details on the server and draws a view-only chart.
-- Turning a link off sets revoked_at, and the link stops working at once.
-- Deleting the saved chart or the owner removes its links. At most one live
-- link per chart. No viewer data is recorded.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS astrology_pro_chart_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE CHECK (token ~ '^[A-Za-z0-9_-]{43}$'),
  owner_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  saved_chart_id uuid NOT NULL REFERENCES astrology_pro_saved_charts(id) ON DELETE CASCADE,
  consent_attested_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_astrology_pro_chart_shares_live
  ON astrology_pro_chart_shares (saved_chart_id) WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_astrology_pro_chart_shares_owner
  ON astrology_pro_chart_shares (owner_member_id);

COMMENT ON TABLE astrology_pro_chart_shares IS
  'Private view-only links to a Pro saved chart. Owner-attested consent; revoked_at turns a link off; cascades with the chart and the owner; no viewer data.';

COMMIT;
