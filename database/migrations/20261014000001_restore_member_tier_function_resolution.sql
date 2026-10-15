-- Held beta recovery compatibility; no production execution is authorized here.
-- pg_dump correctly clears search_path. The canonical members trigger calls
-- compute_developmental_tier without a schema, so a valid data-only restore
-- otherwise refuses its first member row. Scope name resolution to this one
-- existing trigger function; do not change its body, age/guardian policy,
-- execution privileges, or any other restore/provenance/deletion gate.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER FUNCTION public.update_developmental_tier()
  SET search_path TO pg_catalog, public;
COMMIT;
