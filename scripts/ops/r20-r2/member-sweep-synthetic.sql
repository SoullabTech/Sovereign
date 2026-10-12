-- R20 member-scope post-restore sweep candidate.
-- SYNTHETIC LAB ONLY: execute only against r20_synthetic in a network-isolated
-- disposable PostgreSQL 16 container. DO NOT run against production.
-- Uses an allowlisted table-to-owner-column map; never guesses.
DO $r20$
DECLARE
  s RECORD;
  owner_column TEXT;
  target_table REGCLASS;
  q TEXT;
  n BIGINT;
  remaining BIGINT;
  total BIGINT := 0;
BEGIN
  IF current_database() <> 'r20_synthetic' THEN
    RAISE EXCEPTION 'R20 LAB ONLY: wrong database %', current_database();
  END IF;
  FOR s IN
    SELECT id, manifest_id, table_name, member_id, session_id,
           window_start, window_end
      FROM public.deletion_manifest_scopes
     WHERE member_id IS NOT NULL
     ORDER BY id
  LOOP
    owner_column := CASE
      WHEN s.table_name IN ('conversation_turns','agent_runs','integration_passes')
        THEN 'user_id'
      WHEN s.table_name = 'member_manuscripts'
        THEN 'member_id'
      ELSE NULL
    END;
    IF owner_column IS NULL THEN
      RAISE EXCEPTION 'R20 REFUSAL: member scope targets unapproved table %', s.table_name;
    END IF;
    target_table := to_regclass(format('public.%I', s.table_name));
    IF target_table IS NULL THEN
      RAISE EXCEPTION 'R20 REFUSAL: member scope table missing %', s.table_name;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_attribute
       WHERE attrelid = target_table AND attname = owner_column
         AND NOT attisdropped
    ) THEN
      RAISE EXCEPTION 'R20 REFUSAL: required owner column absent on %', s.table_name;
    END IF;
    IF s.session_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM pg_attribute WHERE attrelid = target_table
       AND attname = 'session_id' AND NOT attisdropped
    ) THEN
      RAISE EXCEPTION 'R20 REFUSAL: required session column absent on %', s.table_name;
    END IF;
    IF (s.window_start IS NOT NULL OR s.window_end IS NOT NULL)
       AND NOT EXISTS (
         SELECT 1 FROM pg_attribute WHERE attrelid = target_table
         AND attname = 'created_at' AND NOT attisdropped
       ) THEN
      RAISE EXCEPTION 'R20 REFUSAL: timestamp column absent on %', s.table_name;
    END IF;
    q := format('DELETE FROM public.%I WHERE %I::text = $1', s.table_name, owner_column);
    IF s.session_id IS NOT NULL THEN
      q := q || ' AND session_id::text = $2';
    END IF;
    IF s.window_start IS NOT NULL THEN
      q := q || ' AND created_at >= $3';
    END IF;
    IF s.window_end IS NOT NULL THEN
      q := q || ' AND created_at <= $4';
    END IF;
    EXECUTE q USING s.member_id, s.session_id, s.window_start, s.window_end;
    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;
    -- Explicit postcondition; fail instead of reporting success over survivors.
    q := format('SELECT count(*) FROM public.%I WHERE %I::text = $1', s.table_name, owner_column);
    IF s.session_id IS NOT NULL THEN
      q := q || ' AND session_id::text = $2';
    END IF;
    IF s.window_start IS NOT NULL THEN
      q := q || ' AND created_at >= $3';
    END IF;
    IF s.window_end IS NOT NULL THEN
      q := q || ' AND created_at <= $4';
    END IF;
    EXECUTE q INTO remaining USING s.member_id, s.session_id, s.window_start, s.window_end;
    IF remaining <> 0 THEN
      RAISE EXCEPTION 'R20 REFUSAL: unresolved member scope on % (% rows)', s.table_name, remaining;
    END IF;
  END LOOP;
  RAISE NOTICE 'R20 SYNTHETIC member-scope reconciliation PASS; rows removed: %', total;
END $r20$;
