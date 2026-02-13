-- Guide Whisper (Phase 3)
-- Extends guidance_signals to track whisper impressions.
-- No new tables — just widens the signal_type CHECK constraint.

BEGIN;

-- Widen signal_type to include whisper-related signals
ALTER TABLE guidance_signals
  DROP CONSTRAINT IF EXISTS guidance_signals_signal_type_check;

ALTER TABLE guidance_signals
  ADD CONSTRAINT guidance_signals_signal_type_check
  CHECK (signal_type IN (
    'tooltip_open',
    'learn_more_click',
    'search_help',
    'error_state',
    'whisper_served',
    'whisper_dismissed',
    'whisper_explore'
  ));

COMMIT;
