-- ============================================
-- COMMS SPINE: Backward-Compatible Views
--
-- Maps new comms_* tables to legacy table interfaces.
-- Allows existing /stellium/messages UI and /api/practitioner/*
-- routes to continue working during migration.
--
-- Legacy tables:
--   client_messages -> comms_messages (clinical domain threads)
--   message_policies -> comms_policies
--   safety_concern_logs -> comms_safety_flags
--   client_message_tokens -> unchanged (still needed for portal auth)
--
-- Strategy:
--   1. Create views with exact column names/types as legacy tables
--   2. Add INSTEAD OF triggers for INSERT/UPDATE/DELETE
--   3. Gradually migrate code to use new tables directly
--   4. Drop views once migration complete
-- ============================================

-- ============================================================================
-- VIEW: v_legacy_client_messages
-- Maps comms_messages to old client_messages interface
-- ============================================================================

CREATE OR REPLACE VIEW v_legacy_client_messages AS
SELECT
  m.id,
  t.client_id,
  t.practitioner_id,
  -- Map sender_type to direction
  CASE m.sender_type
    WHEN 'client' THEN 'client_to_practitioner'
    WHEN 'practitioner' THEN 'practitioner_to_client'
    ELSE 'client_to_practitioner'
  END AS direction,
  -- Map message_type (comms uses more types, collapse to legacy set)
  CASE m.message_type
    WHEN 'reflection' THEN 'reflection'
    WHEN 'question' THEN 'question'
    WHEN 'win' THEN 'win'
    WHEN 'struggle' THEN 'struggle'
    WHEN 'logistics' THEN 'logistics'
    WHEN 'reply' THEN 'reply'
    ELSE 'reflection'  -- default fallback
  END AS message_type,
  -- Map urgency (comms uses channel urgency field)
  CASE m.urgency
    WHEN 'normal' THEN 'not_urgent'
    WHEN 'time_sensitive' THEN 'time_sensitive'
    WHEN 'safety_concern' THEN 'safety_concern'
    ELSE 'not_urgent'
  END AS urgency,
  -- Body (prefer decrypted, fall back to encrypted column for reads)
  COALESCE(m.body, '') AS body,
  m.is_quick_response,
  m.quick_response_type,
  m.reply_to_id,
  -- Map delivery_status to legacy status
  CASE m.delivery_status
    WHEN 'sent' THEN 'sent'
    WHEN 'delivered' THEN 'sent'
    WHEN 'read' THEN 'read'
    WHEN 'failed' THEN 'sent'
    ELSE 'sent'
  END AS status,
  m.read_at,
  -- Safety review: check if there's an acknowledged safety flag for this message
  EXISTS (
    SELECT 1 FROM comms_safety_flags sf
    WHERE sf.message_id = m.id
      AND sf.acknowledged_at IS NOT NULL
  ) AS safety_reviewed,
  (
    SELECT sf.acknowledged_at FROM comms_safety_flags sf
    WHERE sf.message_id = m.id
      AND sf.acknowledged_at IS NOT NULL
    LIMIT 1
  ) AS safety_reviewed_at,
  (
    SELECT sf.acknowledged_by FROM comms_safety_flags sf
    WHERE sf.message_id = m.id
      AND sf.acknowledged_at IS NOT NULL
    LIMIT 1
  ) AS safety_reviewed_by,
  m.created_at,
  m.updated_at,
  -- PHI encryption columns (pass through if used)
  m.body_enc,
  m.body_enc_meta
FROM comms_messages m
JOIN comms_threads t ON m.thread_id = t.id
WHERE t.domain = 'clinical'
  AND t.thread_type IN ('between_session', 'session_prep', 'safety_followup');

COMMENT ON VIEW v_legacy_client_messages IS
  'Backward-compatible view mapping comms_messages to legacy client_messages interface';


-- ============================================================================
-- VIEW: v_legacy_message_policies
-- Maps comms_policies to old message_policies interface
-- ============================================================================

CREATE OR REPLACE VIEW v_legacy_message_policies AS
SELECT
  p.id,
  p.practitioner_id,
  p.client_id,
  -- check_days is already an array in comms_policies
  COALESCE(p.check_days, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday']) AS check_days,
  -- Window times are already proper columns
  COALESCE(p.check_window_start, '09:00'::TIME) AS check_window_start,
  COALESCE(p.check_window_end, '17:00'::TIME) AS check_window_end,
  COALESCE(p.timezone, 'America/New_York') AS timezone,
  -- Max response hours
  COALESCE(p.max_response_hours, 48) AS max_response_hours,
  -- Crisis copy
  COALESCE(p.crisis_copy, 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.') AS crisis_copy,
  -- Permissions - map new names to legacy names
  p.allow_inbound AS allow_client_messages,
  p.allow_outbound AS allow_practitioner_reply,
  p.is_active,
  p.created_at,
  p.updated_at
FROM comms_policies p
WHERE p.domain = 'clinical';

COMMENT ON VIEW v_legacy_message_policies IS
  'Backward-compatible view mapping comms_policies to legacy message_policies interface';


-- ============================================================================
-- VIEW: v_legacy_safety_concern_logs
-- Maps comms_safety_flags to old safety_concern_logs interface
-- ============================================================================

CREATE OR REPLACE VIEW v_legacy_safety_concern_logs AS
SELECT
  sf.id,
  t.practitioner_id,
  t.client_id,
  sf.message_id,
  sf.created_at AS logged_at,
  -- Notification tracking (map from comms_events if needed, default pending)
  'sent' AS email_status,
  TRUE AS email_sent,
  sf.created_at AS email_sent_at,
  NULL::TEXT AS email_error,
  sf.acknowledged_at,
  sf.acknowledged_by,
  sf.created_at,
  sf.review_note
FROM comms_safety_flags sf
JOIN comms_threads t ON sf.thread_id = t.id
WHERE sf.severity IN ('red', 'crisis');  -- Legacy only tracked red/crisis level

COMMENT ON VIEW v_legacy_safety_concern_logs IS
  'Backward-compatible view mapping comms_safety_flags to legacy safety_concern_logs interface';


-- ============================================================================
-- VIEW: v_legacy_client_unread_counts
-- Replace the old v_client_unread_counts with comms_messages data
-- ============================================================================

CREATE OR REPLACE VIEW v_legacy_client_unread_counts AS
SELECT
  t.practitioner_id,
  t.client_id,
  COUNT(*) FILTER (WHERE m.delivery_status IN ('sent', 'delivered') AND m.sender_type = 'client') AS unread_count,
  COUNT(*) FILTER (
    WHERE m.urgency = 'safety_concern'
      AND m.sender_type = 'client'
      AND NOT EXISTS (
        SELECT 1 FROM comms_safety_flags sf
        WHERE sf.message_id = m.id
          AND sf.acknowledged_at IS NOT NULL
      )
  ) AS safety_count,
  MAX(m.created_at) AS latest_message_at
FROM comms_threads t
JOIN comms_messages m ON m.thread_id = t.id
WHERE t.domain = 'clinical'
  AND t.thread_type IN ('between_session', 'session_prep', 'safety_followup')
GROUP BY t.practitioner_id, t.client_id;

COMMENT ON VIEW v_legacy_client_unread_counts IS
  'Backward-compatible view for unread message counts per client';


-- ============================================================================
-- VIEW: v_legacy_messages_since_last_session
-- Replace v_messages_since_last_session with comms data
-- ============================================================================

CREATE OR REPLACE VIEW v_legacy_messages_since_last_session AS
SELECT
  t.client_id,
  t.practitioner_id,
  m.id AS message_id,
  CASE m.sender_type
    WHEN 'client' THEN 'client_to_practitioner'
    WHEN 'practitioner' THEN 'practitioner_to_client'
    ELSE 'client_to_practitioner'
  END AS direction,
  m.message_type,
  CASE m.urgency
    WHEN 'normal' THEN 'not_urgent'
    WHEN 'time_sensitive' THEN 'time_sensitive'
    WHEN 'safety_concern' THEN 'safety_concern'
    ELSE 'not_urgent'
  END AS urgency,
  m.body,
  CASE m.delivery_status
    WHEN 'sent' THEN 'sent'
    WHEN 'delivered' THEN 'sent'
    WHEN 'read' THEN 'read'
    ELSE 'sent'
  END AS status,
  m.created_at
FROM comms_threads t
JOIN comms_messages m ON m.thread_id = t.id
JOIN practitioner_clients pc ON t.client_id = pc.id
WHERE t.domain = 'clinical'
  AND t.thread_type IN ('between_session', 'session_prep', 'safety_followup')
  AND m.created_at > COALESCE(pc.last_session_at, pc.created_at)
ORDER BY m.created_at DESC;

COMMENT ON VIEW v_legacy_messages_since_last_session IS
  'Messages received since client last session - backward-compatible view';


-- ============================================================================
-- INSTEAD OF TRIGGERS: Allow writes through legacy views
-- ============================================================================

-- Function to handle INSERT into v_legacy_client_messages
CREATE OR REPLACE FUNCTION fn_legacy_client_messages_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_thread_id UUID;
  v_sender_type TEXT;
  v_urgency TEXT;
BEGIN
  -- Find or create thread for this client-practitioner pair
  SELECT id INTO v_thread_id
  FROM comms_threads
  WHERE client_id = NEW.client_id
    AND practitioner_id = NEW.practitioner_id
    AND domain = 'clinical'
    AND thread_type = 'between_session'
  LIMIT 1;

  IF v_thread_id IS NULL THEN
    INSERT INTO comms_threads (
      domain, thread_type, practitioner_id, client_id,
      participants, status
    ) VALUES (
      'clinical', 'between_session', NEW.practitioner_id, NEW.client_id,
      jsonb_build_object(
        'client', NEW.client_id::text,
        'practitioner', NEW.practitioner_id::text
      ),
      'active'
    )
    RETURNING id INTO v_thread_id;
  END IF;

  -- Map direction to sender_type
  v_sender_type := CASE NEW.direction
    WHEN 'client_to_practitioner' THEN 'client'
    WHEN 'practitioner_to_client' THEN 'practitioner'
    ELSE 'client'
  END;

  -- Map urgency
  v_urgency := CASE NEW.urgency
    WHEN 'not_urgent' THEN 'normal'
    WHEN 'time_sensitive' THEN 'time_sensitive'
    WHEN 'safety_concern' THEN 'safety_concern'
    ELSE 'normal'
  END;

  -- Insert into comms_messages
  INSERT INTO comms_messages (
    id, thread_id, sender_type, sender_id,
    channel_type, message_type, urgency,
    body, body_enc, body_enc_meta,
    is_quick_response, quick_response_type,
    reply_to_id, delivery_status, read_at,
    created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    v_thread_id,
    v_sender_type,
    CASE v_sender_type
      WHEN 'client' THEN NEW.client_id
      ELSE NEW.practitioner_id
    END,
    'in_app',
    COALESCE(NEW.message_type, 'reflection'),
    v_urgency,
    NEW.body,
    NEW.body_enc,
    NEW.body_enc_meta,
    COALESCE(NEW.is_quick_response, FALSE),
    NEW.quick_response_type,
    NEW.reply_to_id,
    CASE NEW.status
      WHEN 'read' THEN 'read'
      ELSE 'sent'
    END,
    NEW.read_at,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  );

  -- If safety concern, create safety flag
  IF NEW.urgency = 'safety_concern' THEN
    INSERT INTO comms_safety_flags (
      thread_id, message_id, severity, cues, source
    ) VALUES (
      v_thread_id,
      NEW.id,
      'red',
      ARRAY['client_flagged'],
      'client_flagged'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_legacy_client_messages_insert
  INSTEAD OF INSERT ON v_legacy_client_messages
  FOR EACH ROW EXECUTE FUNCTION fn_legacy_client_messages_insert();


-- Function to handle UPDATE on v_legacy_client_messages
CREATE OR REPLACE FUNCTION fn_legacy_client_messages_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the comms_messages record
  UPDATE comms_messages SET
    body = NEW.body,
    body_enc = NEW.body_enc,
    body_enc_meta = NEW.body_enc_meta,
    delivery_status = CASE NEW.status
      WHEN 'read' THEN 'read'
      WHEN 'archived' THEN 'read'  -- no direct mapping, treat as read
      ELSE 'sent'
    END,
    read_at = NEW.read_at,
    updated_at = NOW()
  WHERE id = OLD.id;

  -- Handle safety_reviewed change
  IF NEW.safety_reviewed = TRUE AND OLD.safety_reviewed = FALSE THEN
    UPDATE comms_safety_flags SET
      acknowledged_at = COALESCE(NEW.safety_reviewed_at, NOW()),
      acknowledged_by = NEW.safety_reviewed_by
    WHERE message_id = OLD.id
      AND acknowledged_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_legacy_client_messages_update
  INSTEAD OF UPDATE ON v_legacy_client_messages
  FOR EACH ROW EXECUTE FUNCTION fn_legacy_client_messages_update();


-- Function to handle INSERT into v_legacy_message_policies
CREATE OR REPLACE FUNCTION fn_legacy_message_policies_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO comms_policies (
    id, practitioner_id, client_id, domain, thread_type,
    schedule, max_response_hours, crisis_copy,
    inbound_enabled, outbound_enabled, is_active,
    created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.practitioner_id,
    NEW.client_id,
    'clinical',
    'between_session',
    jsonb_build_object(
      'check_days', NEW.check_days,
      'check_window_start', NEW.check_window_start::text,
      'check_window_end', NEW.check_window_end::text,
      'timezone', COALESCE(NEW.timezone, 'America/New_York')
    ),
    COALESCE(NEW.max_response_hours, 48),
    NEW.crisis_copy,
    COALESCE(NEW.allow_client_messages, TRUE),
    COALESCE(NEW.allow_practitioner_reply, TRUE),
    COALESCE(NEW.is_active, TRUE),
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_legacy_message_policies_insert
  INSTEAD OF INSERT ON v_legacy_message_policies
  FOR EACH ROW EXECUTE FUNCTION fn_legacy_message_policies_insert();


-- Function to handle UPDATE on v_legacy_message_policies
CREATE OR REPLACE FUNCTION fn_legacy_message_policies_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comms_policies SET
    schedule = jsonb_build_object(
      'check_days', NEW.check_days,
      'check_window_start', NEW.check_window_start::text,
      'check_window_end', NEW.check_window_end::text,
      'timezone', COALESCE(NEW.timezone, 'America/New_York')
    ),
    max_response_hours = NEW.max_response_hours,
    crisis_copy = NEW.crisis_copy,
    inbound_enabled = NEW.allow_client_messages,
    outbound_enabled = NEW.allow_practitioner_reply,
    is_active = NEW.is_active,
    updated_at = NOW()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_legacy_message_policies_update
  INSTEAD OF UPDATE ON v_legacy_message_policies
  FOR EACH ROW EXECUTE FUNCTION fn_legacy_message_policies_update();


-- ============================================================================
-- SYNONYM VIEWS: Point old table names to new views
-- These allow existing queries using old table names to work
-- ============================================================================

-- Note: PostgreSQL doesn't support true synonyms, so we create additional views
-- that just select * from the compatibility views. Code can reference these
-- directly if needed.

-- The old tables still exist, so we don't create views with those exact names.
-- Instead, existing code should be updated to either:
--   1. Query v_legacy_client_messages (recommended during transition)
--   2. Query comms_messages directly (recommended long-term)


-- ============================================================================
-- DATA MIGRATION HELPER: Sync existing legacy data to new tables
-- Run this after creating the comms_* tables to copy existing data
-- ============================================================================

-- Migration function: client_messages -> comms_threads + comms_messages
CREATE OR REPLACE FUNCTION fn_migrate_legacy_messages()
RETURNS TABLE (
  threads_created INT,
  messages_migrated INT,
  safety_flags_created INT
) AS $$
DECLARE
  v_threads_created INT := 0;
  v_messages_migrated INT := 0;
  v_safety_flags_created INT := 0;
  v_thread_id UUID;
  rec RECORD;
BEGIN
  -- Loop through unique client-practitioner pairs
  FOR rec IN
    SELECT DISTINCT client_id, practitioner_id
    FROM client_messages
    WHERE client_id IS NOT NULL AND practitioner_id IS NOT NULL
  LOOP
    -- Create thread if doesn't exist
    INSERT INTO comms_threads (
      domain, thread_type, practitioner_id, client_id,
      participants, status, created_at
    )
    SELECT
      'clinical', 'between_session', rec.practitioner_id, rec.client_id,
      jsonb_build_object(
        'client', rec.client_id::text,
        'practitioner', rec.practitioner_id::text
      ),
      'active',
      MIN(cm.created_at)
    FROM client_messages cm
    WHERE cm.client_id = rec.client_id
      AND cm.practitioner_id = rec.practitioner_id
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_thread_id;

    IF v_thread_id IS NOT NULL THEN
      v_threads_created := v_threads_created + 1;
    ELSE
      -- Get existing thread ID
      SELECT id INTO v_thread_id
      FROM comms_threads
      WHERE client_id = rec.client_id
        AND practitioner_id = rec.practitioner_id
        AND domain = 'clinical'
        AND thread_type = 'between_session'
      LIMIT 1;
    END IF;

    -- Skip if still no thread (shouldn't happen)
    CONTINUE WHEN v_thread_id IS NULL;

    -- Migrate messages for this thread
    INSERT INTO comms_messages (
      id, thread_id, sender_type, sender_id,
      channel_type, message_type, urgency,
      body, body_enc, body_enc_meta,
      is_quick_response, quick_response_type,
      reply_to_id, delivery_status, read_at,
      created_at, updated_at
    )
    SELECT
      cm.id,
      v_thread_id,
      CASE cm.direction
        WHEN 'client_to_practitioner' THEN 'client'
        WHEN 'practitioner_to_client' THEN 'practitioner'
        ELSE 'client'
      END,
      CASE cm.direction
        WHEN 'client_to_practitioner' THEN cm.client_id
        ELSE cm.practitioner_id
      END,
      'in_app',
      COALESCE(cm.message_type, 'reflection'),
      CASE cm.urgency
        WHEN 'not_urgent' THEN 'normal'
        WHEN 'time_sensitive' THEN 'time_sensitive'
        WHEN 'safety_concern' THEN 'safety_concern'
        ELSE 'normal'
      END,
      cm.body,
      cm.body_enc,
      cm.body_enc_meta,
      COALESCE(cm.is_quick_response, FALSE),
      cm.quick_response_type,
      cm.reply_to_id,
      CASE cm.status
        WHEN 'read' THEN 'read'
        WHEN 'archived' THEN 'read'
        ELSE 'sent'
      END,
      cm.read_at,
      cm.created_at,
      cm.updated_at
    FROM client_messages cm
    WHERE cm.client_id = rec.client_id
      AND cm.practitioner_id = rec.practitioner_id
    ON CONFLICT (id) DO NOTHING;

    GET DIAGNOSTICS v_threads_created = ROW_COUNT;
    v_messages_migrated := v_messages_migrated + v_threads_created;
  END LOOP;

  -- Migrate safety concern logs to comms_safety_flags
  INSERT INTO comms_safety_flags (
    thread_id, message_id, severity, cues, source,
    acknowledged_at, acknowledged_by, review_note, created_at
  )
  SELECT
    t.id,
    scl.message_id,
    'red',
    ARRAY['client_flagged'],
    'client_flagged',
    scl.acknowledged_at,
    scl.acknowledged_by,
    scl.review_note,
    scl.created_at
  FROM safety_concern_logs scl
  JOIN comms_messages m ON m.id = scl.message_id
  JOIN comms_threads t ON t.id = m.thread_id
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_safety_flags_created = ROW_COUNT;

  RETURN QUERY SELECT v_threads_created, v_messages_migrated, v_safety_flags_created;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_migrate_legacy_messages IS
  'One-time migration: copies client_messages and safety_concern_logs to comms_* tables';


-- Migration function: message_policies -> comms_policies
CREATE OR REPLACE FUNCTION fn_migrate_legacy_policies()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO comms_policies (
    practitioner_id, client_id, domain,
    check_days, check_window_start, check_window_end, timezone,
    max_response_hours, crisis_copy,
    allow_inbound, allow_outbound, is_active,
    created_at, updated_at
  )
  SELECT
    mp.practitioner_id,
    mp.client_id,
    'clinical',
    mp.check_days,
    mp.check_window_start,
    mp.check_window_end,
    COALESCE(mp.timezone, 'America/New_York'),
    COALESCE(mp.max_response_hours, 48),
    mp.crisis_copy,
    COALESCE(mp.allow_client_messages, TRUE),
    COALESCE(mp.allow_practitioner_reply, TRUE),
    COALESCE(mp.is_active, TRUE),
    mp.created_at,
    mp.updated_at
  FROM message_policies mp
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_migrate_legacy_policies IS
  'One-time migration: copies message_policies to comms_policies';


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
