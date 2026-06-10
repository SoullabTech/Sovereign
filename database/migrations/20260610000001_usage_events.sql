-- Stewardship usage ledger (append-only) — cost-to-provide, NOT member billing.
--
-- Records every billable interaction (LLM tokens, voice seconds, …) so the system
-- knows its real economics: cost visibility, routing decisions, graceful degradation,
-- and capacity planning. The ledger answers "what did this interaction cost the system
-- to provide?" — never "what do we charge the member?". Charging stays tier-based.
--
-- METRIC-ONLY: never stores prompt/response content. Counts, model, route, timestamp only.
--
-- SANCTUARY INVARIANT: sanctuary events are recorded AGGREGATE-ANONYMOUS —
--   member_id IS NULL and is_sanctuary = true. No per-member attribution, no content,
--   no session linkage. Honors "log that a sanctuary session occurred, never content."
--   The CHECK constraint below makes a sanctuary-row-with-a-member structurally impossible.

CREATE TABLE IF NOT EXISTS usage_events (
  id                    BIGSERIAL    PRIMARY KEY,
  member_id             TEXT         NULL,                 -- NULL for sanctuary / anonymous / system events
  is_sanctuary          BOOLEAN      NOT NULL DEFAULT false,
  kind                  TEXT         NOT NULL,             -- 'llm' | 'voice_stt' | 'voice_tts' | 'embedding' | 'export'
  route                 TEXT         NULL,                 -- origin route id / tag
  tier                  TEXT         NULL,                 -- member tier at event time (nullable; derive at report time if absent)
  provider              TEXT         NOT NULL,             -- 'anthropic' | 'local' | 'ollama' | 'moonshot' | ...
  model                 TEXT         NULL,
  processing_profile    TEXT         NULL,                 -- FAST | CORE | DEEP | BETWEEN
  input_tokens          INTEGER      NULL,
  output_tokens         INTEGER      NULL,
  cache_creation_tokens INTEGER      NULL,
  cache_read_tokens     INTEGER      NULL,
  audio_seconds         INTEGER      NULL,
  audio_bytes           BIGINT       NULL,
  cost_micros           BIGINT       NOT NULL DEFAULT 0,   -- cost-to-provide in micro-USD (1e-6 USD); 0 for local/unknown
  latency_ms            INTEGER      NULL,
  meta                  JSONB        NOT NULL DEFAULT '{}'::jsonb,  -- content-free correlation fields only (e.g. sessionId)
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- Sanctuary guard: a sanctuary event must never carry a member_id.
  CONSTRAINT usage_events_sanctuary_anon CHECK (NOT (is_sanctuary AND member_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS usage_events_member_created_idx   ON usage_events (member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS usage_events_kind_created_idx     ON usage_events (kind, created_at DESC);
CREATE INDEX IF NOT EXISTS usage_events_created_idx          ON usage_events (created_at DESC);
CREATE INDEX IF NOT EXISTS usage_events_provider_model_idx   ON usage_events (provider, model);

-- Unified reporting view: usage_events (+ the existing audio_usage_events when present),
-- in one shape. audio_usage_events already meters voice end-to-end; folded in rather than
-- re-built. Audio cost modeling is a follow-up — cost_micros is 0 for audio rows for now.
-- GUARDED so the migration also applies cleanly where audio_usage_events hasn't been
-- created yet (e.g. a dev DB behind on migrations). Re-run after audio lands to upgrade.
DO $$
BEGIN
  IF to_regclass('public.audio_usage_events') IS NOT NULL THEN
    EXECUTE $v$
      CREATE OR REPLACE VIEW usage_ledger AS
        SELECT 'usage_events'::text AS source, id::text AS event_id, member_id, is_sanctuary,
               kind, route, tier, provider, model, processing_profile,
               input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens,
               audio_seconds, audio_bytes, cost_micros, created_at
        FROM usage_events
        UNION ALL
        SELECT 'audio_usage_events'::text AS source, id::text AS event_id,
               member_id::text AS member_id, false AS is_sanctuary,
               CASE WHEN kind ILIKE '%transcri%' THEN 'voice_stt' ELSE 'voice_tts' END AS kind,
               route, NULL::text AS tier, COALESCE(meta->>'provider', 'audio') AS provider,
               NULL::text AS model, NULL::text AS processing_profile,
               NULL::integer AS input_tokens, NULL::integer AS output_tokens,
               NULL::integer AS cache_creation_tokens, NULL::integer AS cache_read_tokens,
               seconds AS audio_seconds, bytes AS audio_bytes, 0::bigint AS cost_micros, created_at
        FROM audio_usage_events;
    $v$;
  ELSE
    EXECUTE $v$
      CREATE OR REPLACE VIEW usage_ledger AS
        SELECT 'usage_events'::text AS source, id::text AS event_id, member_id, is_sanctuary,
               kind, route, tier, provider, model, processing_profile,
               input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens,
               audio_seconds, audio_bytes, cost_micros, created_at
        FROM usage_events;
    $v$;
  END IF;
END $$;
