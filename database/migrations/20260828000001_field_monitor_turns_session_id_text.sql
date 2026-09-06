-- FIELD-MONITOR-UUID-01 — session_id is an opaque encounter key, not a UUID.
--
-- `field_monitor_turns` has never received a row. The only wired writer is
-- app/api/voice/stream-conversation/route.ts, and every insert it attempts is
-- rejected at the type boundary and swallowed by the fire-and-forget catch:
--
--   invalid input syntax for type uuid: "voice-0ea7253b-57f4-4456-a05a-b4b153ff9455"
--
-- The value is a session key, not a UUID, and it is not always a prefixed UUID:
-- three of five mint sites produce no UUID at all (`voice-${Date.now()}`,
-- `voice-${Date.now()}-${random}`), and the route's own fallback is the literal
-- string 'default'. Stripping the prefix would therefore fix one mint and keep
-- failing on the rest — or, worse, synthesize an identity that was never there.
--
-- The intended contract is already expressed in this repository by the adjacent
-- writer: seventeen lines below the field-monitor call, the same
-- `effectiveSessionId` is passed to `storeTrustObservation`, whose column is
-- `session_id TEXT` (20260407200002_trust_observations.sql). Every in-process
-- consumer treats the value as an opaque string — `fieldMonitorTelemetry.ts`
-- types it `string | null` and passes `sessionId ?? 'unknown'` to the quality
-- monitor. Only this column disagreed.
--
--   member_id   = the person.   A real member UUID. NOT NULL. UNCHANGED.
--   session_id  = the encounter. An opaque text key.
--
-- Two identities, two kinds of thing. The paired route change stops invoking
-- the monitor without a member rather than sending '' into member_id, which was
-- the second, independent cast failure behind the same swallowed catch.
--
-- ── SCHEMA CUSTODY ──────────────────────────────────────────────────────────
-- The production table was created out-of-band: `fieldMonitorTelemetry.ts:23`
-- cites `migrations/025_field_monitor_turns.sql`, which does not exist in this
-- repository or in any of its five migration directories. A clean environment
-- therefore cannot construct this table at all. This migration restores custody
-- as well as correcting the type, and is idempotent in BOTH states:
--
--   existing production  → table already present; session_id UUID → TEXT
--   fresh environment    → canonical table created, session_id TEXT from birth
--
-- The CREATE below is a faithful reconstruction of the live definition captured
-- from production on 2026-08-28 (`\dt+` + `\d+`), with session_id as its only
-- correction. No invented foreign keys, no CHECK on `route` merely because
-- TypeScript narrows it to 'oracle' | 'stream', no change to member_id
-- nullability. The live table has no FK and no CHECK constraints; neither does
-- this. BIGSERIAL is used so the reconstructed default matches the captured
-- `nextval('field_monitor_turns_id_seq'::regclass)` exactly.
--
-- Idempotent + self-protecting. Safe to re-run.

-- ── Canonical definition (fresh environments) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.field_monitor_turns (
  id                  BIGSERIAL PRIMARY KEY,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- The person. Telemetry here is member-scoped by design: checkMonoModalCollapse
  -- reads prior rows WHERE member_id = $1, so a memberless row would be
  -- unreachable by the only analysis that consumes history. Kept NOT NULL; the
  -- caller is guarded instead.
  member_id           UUID         NOT NULL,

  -- The encounter. Opaque: 'voice-<uuid>', 'voice-<timestamp>', 'default'.
  session_id          TEXT,

  route                VARCHAR     NOT NULL,
  element              VARCHAR,
  phase                INTEGER,
  motion               VARCHAR,

  frameworks_detected  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  primary_framework    VARCHAR,
  framework_count      INTEGER     NOT NULL DEFAULT 0,
  integration_score    NUMERIC(3,2),

  ain_pass             BOOLEAN,
  ain_score            NUMERIC(3,2),
  ain_mirror           BOOLEAN,
  ain_bridge           BOOLEAN,
  ain_permission       BOOLEAN,
  ain_next_step        BOOLEAN,

  memory_layers_hit    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  memory_layer_count   INTEGER     NOT NULL DEFAULT 0,

  voice_mode           VARCHAR,
  relational_stance    VARCHAR,
  processing_path      VARCHAR,

  diversity_score      NUMERIC(3,2),
  mono_modal_alert     BOOLEAN     NOT NULL DEFAULT FALSE,
  quality_score        NUMERIC(3,2),

  field_intelligence   JSONB,
  wisdom_field         VARCHAR,
  user_state           VARCHAR,
  spiral_scale         VARCHAR,

  pfi_realm            VARCHAR,
  pfi_coherence        VARCHAR,
  pfi_field_work_safe  BOOLEAN,
  pfi_signals          JSONB
);

-- ── Drift guard — name the problem instead of aborting opaquely ─────────────
-- `CREATE TABLE IF NOT EXISTS` SKIPS silently on an existing table; it does not
-- reconcile columns. So if the live table ever diverges from this reconstruction,
-- the first index referencing a missing column aborts the migration mid-way —
-- and because the runner wraps each file in a single transaction, that abort
-- ROLLS BACK the session_id correction below. The failure would read as an
-- unrelated "column ... does not exist" with the real repair silently undone.
--
-- Caught by applying this migration to a divergent table during authoring. The
-- guard does not attempt to reconcile drift — inventing columns would be exactly
-- the fabrication this unit refuses. It fails loudly and names the unit.
DO $$
DECLARE missing TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
              WHERE table_schema='public' AND table_name='field_monitor_turns') THEN
    SELECT string_agg(c, ', ') INTO missing
      FROM unnest(ARRAY['created_at','member_id','session_id','primary_framework']) AS c
     WHERE NOT EXISTS (
       SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='field_monitor_turns' AND column_name=c
     );
    IF missing IS NOT NULL THEN
      RAISE EXCEPTION 'FIELD-MONITOR-UUID-01: existing field_monitor_turns is missing column(s): %. This migration reconstructs the table captured from production 2026-08-28 and will not invent columns to reconcile drift. Re-capture the live DDL before proceeding.', missing;
    END IF;
  END IF;
END $$;

-- ── The correction (existing production) ────────────────────────────────────
-- No-op on a fresh install, where the CREATE above already made it TEXT.
-- USING is explicit rather than relying on implicit cast behaviour; it is
-- harmless on the empty table and correct if rows ever exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'field_monitor_turns'
      AND column_name  = 'session_id'
      AND data_type    = 'uuid'
  ) THEN
    ALTER TABLE public.field_monitor_turns
      ALTER COLUMN session_id TYPE TEXT USING session_id::text;
    RAISE NOTICE 'FIELD-MONITOR-UUID-01: session_id uuid -> text';
  END IF;
END $$;

-- ── Indexes, exactly as captured (the PK arrives with the table) ────────────
CREATE INDEX IF NOT EXISTS idx_field_monitor_created
  ON public.field_monitor_turns (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_field_monitor_framework
  ON public.field_monitor_turns (member_id, primary_framework);
CREATE INDEX IF NOT EXISTS idx_field_monitor_member
  ON public.field_monitor_turns (member_id);
CREATE INDEX IF NOT EXISTS idx_field_monitor_member_time
  ON public.field_monitor_turns (member_id, created_at DESC);

-- ── Comments, as captured; session_id's records the contract ────────────────
COMMENT ON TABLE public.field_monitor_turns IS
  'Per-turn telemetry for field monitoring, quality tracking, and mono-modal collapse detection. Fire-and-forget writes.';

COMMENT ON COLUMN public.field_monitor_turns.session_id IS
  'Opaque encounter/session key as minted by the caller (e.g. voice-<uuid>, voice-<timestamp>, or the literal ''default''). NOT a UUID and not required to contain one. Was uuid until FIELD-MONITOR-UUID-01 (2026-08-28), which rejected every insert this table ever received.';

COMMENT ON COLUMN public.field_monitor_turns.member_id IS
  'The member this turn belongs to. A real member UUID — telemetry here is member-scoped, so callers must not invoke persistence for a memberless turn rather than substituting a placeholder.';

-- ── Post-shape check — fail loudly rather than leave a silent half-apply ────
DO $$
DECLARE
  v_session TEXT;
  v_member  TEXT;
  v_member_null TEXT;
BEGIN
  SELECT data_type INTO v_session FROM information_schema.columns
   WHERE table_schema='public' AND table_name='field_monitor_turns' AND column_name='session_id';
  SELECT data_type, is_nullable INTO v_member, v_member_null FROM information_schema.columns
   WHERE table_schema='public' AND table_name='field_monitor_turns' AND column_name='member_id';

  IF v_session IS DISTINCT FROM 'text' THEN
    RAISE EXCEPTION 'FIELD-MONITOR-UUID-01: session_id is %, expected text', COALESCE(v_session,'absent');
  END IF;
  IF v_member IS DISTINCT FROM 'uuid' OR v_member_null IS DISTINCT FROM 'NO' THEN
    RAISE EXCEPTION 'FIELD-MONITOR-UUID-01: member_id is % nullable=%, expected uuid NOT NULL',
      COALESCE(v_member,'absent'), COALESCE(v_member_null,'?');
  END IF;
END $$;
