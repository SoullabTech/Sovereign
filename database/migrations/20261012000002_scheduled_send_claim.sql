-- F3: durable, claim-once scheduled email dispatch.
-- Additive except widening the existing status CHECK; old readers can continue
-- using pending/sent/failed/canceled, and ignore the new quarantined statuses.
-- Historical pending/sent data is not modified.
ALTER TABLE public.scheduled_sends
  ADD COLUMN IF NOT EXISTS claim_token uuid,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

ALTER TABLE public.scheduled_sends
  DROP CONSTRAINT IF EXISTS scheduled_sends_status_check;
ALTER TABLE public.scheduled_sends
  ADD CONSTRAINT scheduled_sends_status_check
  CHECK (status IN ('pending', 'sending', 'indeterminate', 'sent', 'failed', 'canceled'));

CREATE INDEX IF NOT EXISTS idx_scheduled_sends_quarantine
  ON public.scheduled_sends (claimed_at)
  WHERE status IN ('sending', 'indeterminate');

COMMENT ON COLUMN public.scheduled_sends.claim_token IS
  'F3 claim-once dispatch UUID. Only the holder may settle an in-flight send.';
COMMENT ON COLUMN public.scheduled_sends.claimed_at IS
  'Claim time. Stale sending is an indeterminate delivery requiring a human decision; NEVER automatically retry.';
