-- Async embedding queue (DB-based)
-- Allows decoupling text ingestion from embedding generation

CREATE TABLE IF NOT EXISTS embedding_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','done','error')),

  job_type text NOT NULL DEFAULT 'case_memory_chunk',

  target_table text NOT NULL DEFAULT 'case_memory_chunks',
  target_id uuid NOT NULL,

  model text NOT NULL DEFAULT 'nomic-embed-text',
  input text NOT NULL,

  attempts int NOT NULL DEFAULT 0,
  last_error text,

  locked_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_embedding_jobs_status_created
  ON embedding_jobs(status, created_at);

CREATE INDEX IF NOT EXISTS idx_embedding_jobs_target
  ON embedding_jobs(target_table, target_id);

-- Prevent duplicate pending jobs per target
CREATE UNIQUE INDEX IF NOT EXISTS uniq_embedding_jobs_pending_target
  ON embedding_jobs(target_table, target_id)
  WHERE status IN ('pending','processing');
