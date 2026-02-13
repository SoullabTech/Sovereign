-- Field Rooms: Sovereign community containers
-- Built with moderation, reporting, rate limiting, k-anonymity, and retention hooks from day one.
--
-- Design principles:
--   1. Rooms are slow containers for reflection, not feeds
--   2. "Witnessing" is the primary response mode (not likes, not comments)
--   3. No social ranking — no view counts, no points, no leaderboards
--   4. Elemental field state is collective only — never per-member inside rooms
--   5. Moderation is structural, not reactive
--   6. Retention policy is configurable but not yet enforced
--
-- Dragons addressed:
--   - Moderation surface (reporting, quarantine, witness depth limits)
--   - Identity edge cases (k-anonymity thresholds, no per-member state in rooms)
--   - Support load (deterministic membership semantics, typed errors)
--   - Data/ethics (retention hooks, no full-text search indexes, no global indexing)

BEGIN;

-- ============================================================
-- 1. ROOMS
-- ============================================================

CREATE TABLE IF NOT EXISTS commons_rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(80) NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL,
  description   TEXT,
  purpose       TEXT,                     -- why this room exists (displayed to members)

  -- Room type and configuration
  room_type     VARCHAR(30) NOT NULL DEFAULT 'field'
                CHECK (room_type IN ('field', 'practice', 'threshold', 'sanctuary', 'workshop')),
  element       VARCHAR(10)
                CHECK (element IS NULL OR element IN ('earth', 'water', 'fire', 'air', 'aether')),

  -- Capacity and access
  max_members   INTEGER DEFAULT 50,       -- soft cap; NULL = unlimited
  join_policy   VARCHAR(20) NOT NULL DEFAULT 'open'
                CHECK (join_policy IN ('open', 'invite', 'passkey')),
  visibility    VARCHAR(20) NOT NULL DEFAULT 'members'
                CHECK (visibility IN ('public', 'members', 'private')),

  -- Status
  status        VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'archived', 'forming', 'closed')),

  -- Retention policy (mechanism ready, enforcement deferred)
  retention_days        INTEGER,          -- NULL = no auto-expiry; set to enable
  retention_action      VARCHAR(10) DEFAULT 'archive'
                        CHECK (retention_action IN ('archive', 'delete')),

  -- Metadata
  created_by    UUID REFERENCES members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commons_rooms_status ON commons_rooms(status);
CREATE INDEX idx_commons_rooms_type ON commons_rooms(room_type);

-- ============================================================
-- 2. ROOM MEMBERSHIP
-- ============================================================
-- Deterministic semantics:
--   join  = upsert row (left_at NULL, status 'present')
--   leave = set left_at, status 'departed'
--   "present" = left_at IS NULL AND status = 'present'

CREATE TABLE IF NOT EXISTS commons_room_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       UUID NOT NULL REFERENCES commons_rooms(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Membership state
  status        VARCHAR(20) NOT NULL DEFAULT 'present'
                CHECK (status IN ('present', 'departed', 'removed', 'banned')),
  role          VARCHAR(20) NOT NULL DEFAULT 'participant'
                CHECK (role IN ('participant', 'steward', 'keeper')),

  -- Timestamps
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at       TIMESTAMPTZ,             -- NULL = currently present
  last_active_at TIMESTAMPTZ DEFAULT now(),

  -- Join/leave cooldown tracking
  join_count    INTEGER NOT NULL DEFAULT 1,
  last_join_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_leave_at TIMESTAMPTZ,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One membership row per member per room
  UNIQUE(room_id, member_id)
);

CREATE INDEX idx_room_members_room_present
  ON commons_room_members(room_id)
  WHERE status = 'present' AND left_at IS NULL;

CREATE INDEX idx_room_members_member
  ON commons_room_members(member_id);

-- ============================================================
-- 3. ROOM EVENTS (posts, reflections, witnessings)
-- ============================================================

CREATE TABLE IF NOT EXISTS commons_room_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       UUID NOT NULL REFERENCES commons_rooms(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES members(id),

  -- Event type
  event_type    VARCHAR(20) NOT NULL
                CHECK (event_type IN ('reflection', 'witness', 'question', 'offering', 'arrival', 'departure')),

  -- Content
  body          TEXT,
  body_length   INTEGER GENERATED ALWAYS AS (length(body)) STORED,

  -- Witness chain (for 'witness' events only)
  witnessed_event_id  UUID REFERENCES commons_room_events(id),
  witness_depth       SMALLINT DEFAULT 0,   -- 0 = original, 1 = witness of original, max 1

  -- Element tagging (optional, member-chosen)
  element       VARCHAR(10)
                CHECK (element IS NULL OR element IN ('earth', 'water', 'fire', 'air', 'aether')),

  -- Moderation
  moderation_status VARCHAR(20) NOT NULL DEFAULT 'visible'
                CHECK (moderation_status IN ('visible', 'quarantined', 'hidden', 'removed')),

  -- Retention (mechanism ready, enforcement deferred)
  expires_at    TIMESTAMPTZ,              -- NULL = no expiry; populated by retention policy
  retention_status VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (retention_status IN ('active', 'archived', 'expired', 'deleted')),

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  -- Body length hard cap: 4000 chars
  CONSTRAINT chk_body_length CHECK (body IS NULL OR length(body) <= 4000),
  -- Witness body hard cap: 280 chars
  CONSTRAINT chk_witness_body_length CHECK (
    event_type != 'witness' OR body IS NULL OR length(body) <= 280
  ),
  -- Witness depth max 1 (no witness-of-witness chains)
  CONSTRAINT chk_witness_depth CHECK (witness_depth <= 1),
  -- Witnessed event must be in same room (enforced by trigger below)
  -- Arrival/departure events have no body
  CONSTRAINT chk_system_events CHECK (
    event_type NOT IN ('arrival', 'departure') OR body IS NULL
  )
);

-- Query pattern: room events, visible only, ordered by time
CREATE INDEX idx_room_events_room_visible
  ON commons_room_events(room_id, created_at)
  WHERE moderation_status = 'visible' AND retention_status = 'active';

CREATE INDEX idx_room_events_member
  ON commons_room_events(member_id, created_at DESC);

CREATE INDEX idx_room_events_witnessed
  ON commons_room_events(witnessed_event_id)
  WHERE witnessed_event_id IS NOT NULL;

-- NO full-text search index. Rooms are ritual space, not knowledge base.

-- ============================================================
-- 4. EVENT REPORTING
-- ============================================================

CREATE TABLE IF NOT EXISTS commons_event_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES commons_room_events(id) ON DELETE CASCADE,
  reporter_id   UUID NOT NULL REFERENCES members(id),

  reason        VARCHAR(40) NOT NULL
                CHECK (reason IN (
                  'harmful_content',
                  'coercion',
                  'unsolicited_advice',
                  'crisis_disclosure',
                  'privacy_violation',
                  'inappropriate',
                  'other'
                )),
  description   TEXT,                     -- optional detail from reporter (max 500)

  -- Processing
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by   UUID REFERENCES members(id),
  reviewed_at   TIMESTAMPTZ,
  action_taken  VARCHAR(40),              -- e.g. 'quarantined', 'hidden', 'removed', 'none'
  review_notes  TEXT,                     -- internal notes

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One report per reporter per event
  UNIQUE(event_id, reporter_id),

  -- Description length cap
  CONSTRAINT chk_report_description CHECK (description IS NULL OR length(description) <= 500)
);

CREATE INDEX idx_event_reports_pending
  ON commons_event_reports(status)
  WHERE status = 'pending';

CREATE INDEX idx_event_reports_event
  ON commons_event_reports(event_id);

-- ============================================================
-- 5. CONTENT RATE LIMITING (database-enforced)
-- ============================================================

CREATE TABLE IF NOT EXISTS commons_rate_limits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id),
  room_id         UUID REFERENCES commons_rooms(id),  -- NULL = global limit

  -- Counters (reset by cleanup function)
  events_this_hour    INTEGER NOT NULL DEFAULT 0,
  events_today        INTEGER NOT NULL DEFAULT 0,
  hour_window_start   TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', now()),
  day_window_start    DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Join/leave tracking
  last_join_at        TIMESTAMPTZ,
  last_leave_at       TIMESTAMPTZ,

  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One rate limit row per member per room (or global)
  UNIQUE(member_id, room_id)
);

-- Rate limit check function
-- Returns TRUE if allowed, FALSE if rate-limited
-- Limits: 5 events/hour, 20 events/day per room
-- Join cooldown: 5 minutes after leaving
CREATE OR REPLACE FUNCTION check_commons_rate_limit(
  p_member_id UUID,
  p_room_id UUID,
  p_max_per_hour INTEGER DEFAULT 5,
  p_max_per_day INTEGER DEFAULT 20,
  p_join_cooldown_minutes INTEGER DEFAULT 5
) RETURNS TABLE(
  allowed BOOLEAN,
  reason VARCHAR(30)
) LANGUAGE plpgsql AS $$
DECLARE
  v_row commons_rate_limits%ROWTYPE;
BEGIN
  -- Upsert rate limit row
  INSERT INTO commons_rate_limits (member_id, room_id)
  VALUES (p_member_id, p_room_id)
  ON CONFLICT (member_id, room_id) DO NOTHING;

  SELECT * INTO v_row
  FROM commons_rate_limits
  WHERE member_id = p_member_id
    AND room_id IS NOT DISTINCT FROM p_room_id
  FOR UPDATE;

  -- Reset hourly counter if window expired
  IF v_row.hour_window_start < date_trunc('hour', now()) THEN
    UPDATE commons_rate_limits
    SET events_this_hour = 0,
        hour_window_start = date_trunc('hour', now()),
        updated_at = now()
    WHERE id = v_row.id;
    v_row.events_this_hour := 0;
  END IF;

  -- Reset daily counter if window expired
  IF v_row.day_window_start < CURRENT_DATE THEN
    UPDATE commons_rate_limits
    SET events_today = 0,
        day_window_start = CURRENT_DATE,
        updated_at = now()
    WHERE id = v_row.id;
    v_row.events_today := 0;
  END IF;

  -- Check hourly limit
  IF v_row.events_this_hour >= p_max_per_hour THEN
    RETURN QUERY SELECT false, 'RATE_LIMITED_HOURLY'::VARCHAR(30);
    RETURN;
  END IF;

  -- Check daily limit
  IF v_row.events_today >= p_max_per_day THEN
    RETURN QUERY SELECT false, 'RATE_LIMITED_DAILY'::VARCHAR(30);
    RETURN;
  END IF;

  -- Check join cooldown
  IF v_row.last_leave_at IS NOT NULL
     AND v_row.last_leave_at > now() - (p_join_cooldown_minutes || ' minutes')::INTERVAL THEN
    RETURN QUERY SELECT false, 'JOIN_COOLDOWN'::VARCHAR(30);
    RETURN;
  END IF;

  -- Increment counters
  UPDATE commons_rate_limits
  SET events_this_hour = events_this_hour + 1,
      events_today = events_today + 1,
      updated_at = now()
  WHERE id = v_row.id;

  RETURN QUERY SELECT true, NULL::VARCHAR(30);
END;
$$;

-- ============================================================
-- 6. VIEWS
-- ============================================================

-- Field state: collective elemental distribution per room
-- k-anonymity threshold: only surface element counts when present_count >= 5
CREATE OR REPLACE VIEW v_room_field_state AS
SELECT
  r.id AS room_id,
  r.slug,
  r.name,
  COUNT(rm.id) FILTER (WHERE rm.status = 'present' AND rm.left_at IS NULL) AS present_count,
  -- Only show element distribution if enough members for k-anonymity (k=5)
  CASE
    WHEN COUNT(rm.id) FILTER (WHERE rm.status = 'present' AND rm.left_at IS NULL) >= 5
    THEN jsonb_build_object(
      'earth', COUNT(*) FILTER (WHERE sv.primary_element = 'earth'),
      'water', COUNT(*) FILTER (WHERE sv.primary_element = 'water'),
      'fire',  COUNT(*) FILTER (WHERE sv.primary_element = 'fire'),
      'air',   COUNT(*) FILTER (WHERE sv.primary_element = 'air'),
      'aether',COUNT(*) FILTER (WHERE sv.primary_element = 'aether')
    )
    ELSE NULL  -- Below threshold: field is "forming"
  END AS element_distribution,
  CASE
    WHEN COUNT(rm.id) FILTER (WHERE rm.status = 'present' AND rm.left_at IS NULL) >= 5
    THEN 'readable'
    ELSE 'forming'
  END AS field_status
FROM commons_rooms r
LEFT JOIN commons_room_members rm ON rm.room_id = r.id
LEFT JOIN LATERAL (
  -- Latest state vector per present member (for element distribution only)
  SELECT sv2.primary_element
  FROM state_vectors sv2
  WHERE sv2.member_id = rm.member_id
  ORDER BY sv2.created_at DESC
  LIMIT 1
) sv ON rm.status = 'present' AND rm.left_at IS NULL
WHERE r.status = 'active'
GROUP BY r.id, r.slug, r.name;

COMMENT ON VIEW v_room_field_state IS
  'Collective elemental field per room. Element distribution only shown when k >= 5 members present (k-anonymity). No per-member state exposed.';

-- Room summary: for listing rooms (no member identity data)
CREATE OR REPLACE VIEW v_rooms_summary AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.description,
  r.purpose,
  r.room_type,
  r.element,
  r.status,
  r.join_policy,
  r.visibility,
  r.max_members,
  COUNT(rm.id) FILTER (WHERE rm.status = 'present' AND rm.left_at IS NULL) AS present_count,
  COUNT(DISTINCT e.id) FILTER (
    WHERE e.moderation_status = 'visible'
      AND e.retention_status = 'active'
      AND e.created_at > now() - INTERVAL '7 days'
  ) AS events_this_week,
  MAX(e.created_at) FILTER (
    WHERE e.moderation_status = 'visible' AND e.retention_status = 'active'
  ) AS last_activity_at
FROM commons_rooms r
LEFT JOIN commons_room_members rm ON rm.room_id = r.id
LEFT JOIN commons_room_events e ON e.room_id = r.id
WHERE r.status IN ('active', 'forming')
GROUP BY r.id;

COMMENT ON VIEW v_rooms_summary IS
  'Room listing with aggregate activity. No member identity data. No join timestamps.';

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

-- Enforce: witnessed event must be in same room
CREATE OR REPLACE FUNCTION trg_validate_witness()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_witnessed_room UUID;
BEGIN
  IF NEW.event_type = 'witness' AND NEW.witnessed_event_id IS NOT NULL THEN
    SELECT room_id INTO v_witnessed_room
    FROM commons_room_events
    WHERE id = NEW.witnessed_event_id;

    IF v_witnessed_room IS NULL THEN
      RAISE EXCEPTION 'Witnessed event does not exist';
    END IF;

    IF v_witnessed_room != NEW.room_id THEN
      RAISE EXCEPTION 'Cannot witness an event from a different room';
    END IF;

    -- Set witness depth
    SELECT witness_depth + 1 INTO NEW.witness_depth
    FROM commons_room_events
    WHERE id = NEW.witnessed_event_id;

    IF NEW.witness_depth > 1 THEN
      RAISE EXCEPTION 'Cannot witness a witness (max depth 1)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_commons_events_validate_witness
  BEFORE INSERT ON commons_room_events
  FOR EACH ROW
  WHEN (NEW.event_type = 'witness')
  EXECUTE FUNCTION trg_validate_witness();

-- Enforce: only room members can post events
CREATE OR REPLACE FUNCTION trg_validate_membership()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_is_member BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM commons_room_members
    WHERE room_id = NEW.room_id
      AND member_id = NEW.member_id
      AND status = 'present'
      AND left_at IS NULL
  ) INTO v_is_member;

  IF NOT v_is_member AND NEW.event_type != 'arrival' THEN
    RAISE EXCEPTION 'NOT_A_MEMBER: Must join room before posting';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_commons_events_validate_membership
  BEFORE INSERT ON commons_room_events
  FOR EACH ROW
  EXECUTE FUNCTION trg_validate_membership();

-- Set expires_at based on room retention policy (when room has retention_days set)
CREATE OR REPLACE FUNCTION trg_set_event_expiry()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_retention_days INTEGER;
BEGIN
  SELECT retention_days INTO v_retention_days
  FROM commons_rooms
  WHERE id = NEW.room_id;

  IF v_retention_days IS NOT NULL THEN
    NEW.expires_at := NEW.created_at + (v_retention_days || ' days')::INTERVAL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_commons_events_set_expiry
  BEFORE INSERT ON commons_room_events
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_event_expiry();

-- Auto-quarantine: events with safety-sensitive content
-- Lightweight keyword check (not NLP — just structural protection)
CREATE OR REPLACE FUNCTION trg_safety_screen()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.body IS NOT NULL AND (
    NEW.body ~* '\m(suicide|self.?harm|kill\s+(my|him|her|them)self|want\s+to\s+die|end\s+(my|it\s+all))\M'
  ) THEN
    NEW.moderation_status := 'quarantined';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_commons_events_safety_screen
  BEFORE INSERT ON commons_room_events
  FOR EACH ROW
  WHEN (NEW.body IS NOT NULL)
  EXECUTE FUNCTION trg_safety_screen();

-- ============================================================
-- 8. RETENTION UTILITIES (not yet scheduled, just available)
-- ============================================================

-- Archive expired events (call from cron or manual)
CREATE OR REPLACE FUNCTION archive_expired_room_events()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE commons_room_events
  SET retention_status = 'archived',
      updated_at = now()
  WHERE expires_at IS NOT NULL
    AND expires_at < now()
    AND retention_status = 'active';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Delete archived events older than N days (strongest sovereignty posture)
CREATE OR REPLACE FUNCTION purge_archived_room_events(p_older_than_days INTEGER DEFAULT 30)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM commons_room_events
  WHERE retention_status IN ('archived', 'expired')
    AND updated_at < now() - (p_older_than_days || ' days')::INTERVAL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Clean up stale rate limit rows
CREATE OR REPLACE FUNCTION cleanup_commons_rate_limits()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM commons_rate_limits
  WHERE updated_at < now() - INTERVAL '48 hours';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================
-- 9. SEED: Beta Field Room
-- ============================================================

INSERT INTO commons_rooms (slug, name, description, purpose, room_type, join_policy, visibility)
VALUES (
  'beta-field',
  'Beta Field',
  'The first gathering space. For stewards helping Soullab grow.',
  'Share what you notice — where it feels alive, where it feels flat, what you wish it could become. This room is the heartbeat of early Soullab.',
  'field',
  'open',
  'members'
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
