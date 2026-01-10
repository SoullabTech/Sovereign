-- Ensure gen_random_uuid() is available for corpus tables and other UUID defaults
-- Some Postgres installations require pgcrypto for this function
CREATE EXTENSION IF NOT EXISTS pgcrypto;
