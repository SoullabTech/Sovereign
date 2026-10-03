-- C7B2 BUILD CANDIDATE. Deliberately NOT in database/migrations.
-- Only exercised in a disposable witness cluster until a separate migration act.
CREATE TABLE constellation_experience_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  policy text NOT NULL CHECK (policy = 'writers-first-experience-v1'),
  issued_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  expires_at timestamptz NOT NULL DEFAULT statement_timestamp() + interval '15 minutes',
  consumed_at timestamptz,
  CHECK (expires_at = issued_at + interval '15 minutes'),
  CHECK (consumed_at IS NULL OR (consumed_at >= issued_at AND consumed_at < expires_at))
);
CREATE INDEX constellation_experience_opportunity_expiry ON constellation_experience_opportunities(expires_at);

CREATE TABLE constellation_experience_reports (
  -- Not an FK to opportunities: expiry cleanup must not delete a held report.
  id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  policy text NOT NULL CHECK (policy = 'writers-first-experience-v1'),
  agreement text NOT NULL CHECK (agreement = 'submit_this_report_once'),
  activity text NOT NULL CHECK (activity IN ('discussed_passage', 'considered_revision')),
  usefulness text NOT NULL CHECK (usefulness IN ('helped','partly','not_sure','did_not_help','prefer_not_to_answer')),
  invitation text CHECK (invitation IS NULL OR invitation IN ('wisdom-carrier','existing-author','voice-first','editorially-wounded')),
  submitted_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  expires_at timestamptz NOT NULL DEFAULT statement_timestamp() + interval '720 hours',
  CHECK (expires_at = submitted_at + interval '720 hours'),
  UNIQUE (member_id, policy)
);
CREATE INDEX constellation_experience_report_expiry ON constellation_experience_reports(expires_at);

-- Retention uses elapsed hours: 30 calendar days can exceed 720 hours across a DST fall-back.
-- Retry cannot renew retention or quietly revise an already submitted answer.
CREATE FUNCTION constellation_experience_report_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'experience_report_immutable';
END;
$$;
CREATE TRIGGER constellation_experience_report_no_update BEFORE UPDATE ON constellation_experience_reports
  FOR EACH ROW EXECUTE FUNCTION constellation_experience_report_immutable();

-- The opportunity may be consumed once; it is not a durable permission profile.
CREATE FUNCTION constellation_experience_opportunity_monotonic() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.member_id IS DISTINCT FROM OLD.member_id
     OR NEW.policy IS DISTINCT FROM OLD.policy OR NEW.issued_at IS DISTINCT FROM OLD.issued_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at OR OLD.consumed_at IS NOT NULL
     OR NEW.consumed_at IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'experience_opportunity_immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER constellation_experience_opportunity_no_rearm BEFORE UPDATE ON constellation_experience_opportunities
  FOR EACH ROW EXECUTE FUNCTION constellation_experience_opportunity_monotonic();

COMMENT ON TABLE constellation_experience_reports IS
  'C7B2 explicit one-experience feedback; no text, chart data or return tracking. Author withdrawal deletes the report; expiry excludes reads. Active-table cleanup and backup custody must be operational before collection opens.';
