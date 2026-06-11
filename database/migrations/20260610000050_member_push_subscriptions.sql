-- Co-lab Web Push subscriptions (Web Push API / RFC 8291).
-- Alert-only, opt-in, content-free. DORMANT until VAPID keys are configured.
-- One member -> many devices/browsers (each browser push endpoint is unique).
-- Additive + idempotent. No runtime effect until the push channel is wired + VAPID set.

CREATE TABLE IF NOT EXISTS member_push_subscriptions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    endpoint     TEXT NOT NULL UNIQUE,
    p256dh       TEXT NOT NULL,
    auth         TEXT NOT NULL,
    user_agent   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_member_push_subscriptions_member
    ON member_push_subscriptions(member_id);
