-- ============================================================================
-- Member notification preferences — per (event_type × delivery_channel) opt-out.
-- ============================================================================
-- Directive (Kelly, 2026-06-09): model notifications around EVENT TYPES, not
-- transports. "event_type × delivery_channel ... is not a JSON blob problem,
-- that's relational data." Store ONLY explicit overrides; resolve defaults in
-- code (lib/team/notificationPreferences.ts) so defaults can change without a
-- backfill and so push / WhatsApp / new events can be added with NO migration.
--
-- Code-resolved defaults (the rows that are NOT stored here):
--   dm_received      → email ON,  in_app ON, sms OFF   (personal)
--   mentioned        → email ON,  in_app ON, sms OFF   (intentional)
--   thread_reply     → email ON,  in_app ON, sms OFF   (intentional)
--   channel_activity → email OFF, in_app ON, sms OFF   (ambient → opt-in)
--
-- This is the DELIVERY-preference layer. It is DISTINCT from attention_items
-- (the in-app "For You" attention substrate) and from the coarse
-- members.attention_notifications_enabled global flag. A row here is a member's
-- explicit choice to diverge from the default for ONE event on ONE channel.
--
-- NO CHECK on event_type / channel BY DESIGN: the app owns the valid set
-- (NotificationEventType × NotificationChannel). Adding a transport (push,
-- whatsapp) or event (team_announcement) is then a code change, not a migration.
-- An unrecognized row is simply ignored by the resolver.
-- ============================================================================

CREATE TABLE IF NOT EXISTS member_notification_preferences (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    event_type  TEXT NOT NULL,   -- 'dm_received' | 'mentioned' | 'thread_reply' | 'channel_activity' | …
    channel     TEXT NOT NULL,   -- 'email' | 'in_app' | 'sms' | …
    enabled     BOOLEAN NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One explicit override per (member, event, channel). Doubles as the upsert
-- conflict target (ON CONFLICT (member_id, event_type, channel)).
CREATE UNIQUE INDEX IF NOT EXISTS idx_mnp_member_event_channel
    ON member_notification_preferences (member_id, event_type, channel);

-- Send-time gate reads one member's overrides; panel reads all of them.
CREATE INDEX IF NOT EXISTS idx_mnp_member
    ON member_notification_preferences (member_id);

COMMENT ON TABLE member_notification_preferences IS
    'Per (event_type × channel) notification DELIVERY overrides. Defaults resolved in code (lib/team/notificationPreferences.ts); only explicit opt-in/opt-out rows are stored.';
