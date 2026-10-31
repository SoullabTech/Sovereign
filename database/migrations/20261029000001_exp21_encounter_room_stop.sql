-- EXP-21 R3B-A: durable participant-scoped Stop requests and attributed receipts.
-- Source-only migration. No live transport, recording, deployment or release is enabled.
-- A receipt reports an adapter's assertion; it does not prove physical media silence.
-- Database persistence and append-only guards do not establish R20 stale-restore safety.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION valid_encounter_room_stop_target_bindings(value JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  target TEXT;
  item JSONB;
BEGIN
  IF jsonb_typeof(value) IS DISTINCT FROM 'object' THEN RETURN FALSE; END IF;
  IF (SELECT count(*) FROM jsonb_object_keys(value)) <> 8 THEN RETURN FALSE; END IF;
  FOREACH target IN ARRAY ARRAY[
    'local_media','remote_media','signaling','recorder','captions',
    'maia_inference','maia_playback','late_work'
  ] LOOP
    item := value -> target;
    IF jsonb_typeof(item) IS DISTINCT FROM 'object' THEN RETURN FALSE; END IF;
    IF (SELECT count(*) FROM jsonb_object_keys(item)) <> 3 THEN RETURN FALSE; END IF;
    IF jsonb_typeof(item -> 'principalId') IS DISTINCT FROM 'string'
       OR jsonb_typeof(item -> 'adapterRuntimeId') IS DISTINCT FROM 'string'
       OR jsonb_typeof(item -> 'evidenceKind') IS DISTINCT FROM 'string' THEN
      RETURN FALSE;
    END IF;
    IF length(item ->> 'principalId') NOT BETWEEN 1 AND 200
       OR btrim(item ->> 'principalId') <> item ->> 'principalId'
       OR length(item ->> 'adapterRuntimeId') NOT BETWEEN 1 AND 200
       OR btrim(item ->> 'adapterRuntimeId') <> item ->> 'adapterRuntimeId'
       OR item ->> 'evidenceKind' NOT IN ('server_component','client_report','simulated') THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$;

-- Only an existing trusted server admission process may insert bindings. R3B-A
-- exposes no registration route. The isolated witness seeds fictional fixtures.
-- The admitted roster is complete and immutable: clients cannot omit a target
-- or select a peer's principal. remote_media is this participant's inbound path.
CREATE TABLE encounter_room_stop_bindings (
  encounter_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  agreement_version TEXT NOT NULL CHECK (
    length(agreement_version) BETWEEN 1 AND 200 AND btrim(agreement_version) = agreement_version
  ),
  consent_generation INTEGER NOT NULL CHECK (consent_generation > 0),
  runtime_id TEXT NOT NULL CHECK (length(runtime_id) BETWEEN 1 AND 200 AND btrim(runtime_id) = runtime_id),
  admission_event_id UUID NOT NULL REFERENCES encounter_consent_events(id) ON DELETE CASCADE,
  target_bindings JSONB NOT NULL CHECK (valid_encounter_room_stop_target_bindings(target_bindings)),
  bound_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (encounter_id, participant_id, agreement_version, consent_generation, runtime_id),
  UNIQUE (encounter_id, participant_id, runtime_id),
  FOREIGN KEY (encounter_id, participant_id)
    REFERENCES encounter_participants(encounter_id, id) ON DELETE CASCADE
);

CREATE TABLE encounter_room_stop_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  agreement_version TEXT NOT NULL,
  consent_generation INTEGER NOT NULL,
  runtime_id TEXT NOT NULL,
  -- Filled by the insert trigger, never by the requester or adapter.
  stop_generation INTEGER NOT NULL CHECK (stop_generation > 0),
  request_key TEXT NOT NULL CHECK (length(request_key) BETWEEN 1 AND 200 AND btrim(request_key) = request_key),
  requested_by_participant_id UUID NOT NULL CHECK (requested_by_participant_id = participant_id),
  reason TEXT NOT NULL CHECK (reason = 'participant_withdrawal'),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (encounter_id, participant_id, agreement_version, consent_generation, runtime_id)
    REFERENCES encounter_room_stop_bindings
      (encounter_id, participant_id, agreement_version, consent_generation, runtime_id) ON DELETE CASCADE,
  -- A Stop closes the entire participant + consent scope, including reconnects.
  UNIQUE (encounter_id, participant_id, agreement_version, consent_generation),
  UNIQUE (encounter_id, participant_id, stop_generation),
  UNIQUE (id, encounter_id, participant_id, agreement_version, consent_generation, runtime_id, stop_generation)
);

CREATE TABLE encounter_room_stop_acknowledgements (
  operation_id UUID NOT NULL,
  encounter_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  agreement_version TEXT NOT NULL,
  consent_generation INTEGER NOT NULL,
  runtime_id TEXT NOT NULL,
  stop_generation INTEGER NOT NULL,
  target TEXT NOT NULL CHECK (target IN (
    'local_media','remote_media','signaling','recorder','captions',
    'maia_inference','maia_playback','late_work'
  )),
  principal_id TEXT NOT NULL,
  adapter_runtime_id TEXT NOT NULL,
  evidence_kind TEXT NOT NULL CHECK (evidence_kind IN ('server_component','client_report','simulated')),
  state TEXT NOT NULL CHECK (state IN ('stopped','failed','not_started')),
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  -- At most one immutable final report for each of the eight required targets.
  PRIMARY KEY (operation_id, target),
  FOREIGN KEY (operation_id, encounter_id, participant_id, agreement_version, consent_generation, runtime_id, stop_generation)
    REFERENCES encounter_room_stop_operations
      (id, encounter_id, participant_id, agreement_version, consent_generation, runtime_id, stop_generation)
    ON DELETE CASCADE
);

CREATE FUNCTION enforce_encounter_room_stop_binding()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  admission encounter_consent_events%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(
    'encounter-room-stop|' || NEW.encounter_id::text || '|' || NEW.participant_id::text, 0));
  -- Same join-consent lock as accepted R3A: admission cannot race a revocation.
  PERFORM pg_advisory_xact_lock(hashtextextended(
    NEW.encounter_id::text || '|' || NEW.participant_id::text || '|join|' ||
    NEW.agreement_version || '|' || NEW.consent_generation::text, 0));
  SELECT * INTO admission FROM encounter_consent_events
   WHERE id = NEW.admission_event_id
     AND encounter_id = NEW.encounter_id AND participant_id = NEW.participant_id
     AND actor_participant_id = NEW.participant_id AND purpose = 'join'
     AND agreement_version = NEW.agreement_version AND generation = NEW.consent_generation
     AND action = 'grant' AND legacy_provenance = FALSE;
  IF NOT FOUND OR NOT EXISTS (
    SELECT 1 FROM encounters WHERE id = NEW.encounter_id
      AND consent_agreement_version = NEW.agreement_version AND consent_generation = NEW.consent_generation
  ) THEN
    RAISE EXCEPTION 'encounter-room-stop-binding-admission-invalid';
  END IF;
  IF EXISTS (
    SELECT 1 FROM encounter_consent_events
     WHERE encounter_id = NEW.encounter_id AND participant_id = NEW.participant_id
       AND purpose = 'join' AND agreement_version = NEW.agreement_version
       AND generation = NEW.consent_generation AND legacy_provenance = FALSE
       AND (action = 'revoke' OR (id <> admission.id AND decided_at >= admission.decided_at))
  ) THEN
    RAISE EXCEPTION 'encounter-room-stop-binding-admission-not-current';
  END IF;
  IF EXISTS (
    SELECT 1 FROM encounter_room_stop_operations
     WHERE encounter_id = NEW.encounter_id AND participant_id = NEW.participant_id
       AND agreement_version = NEW.agreement_version AND consent_generation = NEW.consent_generation
  ) THEN
    RAISE EXCEPTION 'encounter-room-stop-consent-scope-closed';
  END IF;
  IF (
    SELECT count(*) FROM encounter_room_stop_bindings
     WHERE encounter_id = NEW.encounter_id AND participant_id = NEW.participant_id
       AND agreement_version = NEW.agreement_version AND consent_generation = NEW.consent_generation
  ) >= 32 THEN
    RAISE EXCEPTION 'encounter-room-stop-binding-limit';
  END IF;
  NEW.bound_at := clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_encounter_room_stop_binding
  BEFORE INSERT ON encounter_room_stop_bindings
  FOR EACH ROW EXECUTE FUNCTION enforce_encounter_room_stop_binding();

CREATE FUNCTION enforce_encounter_room_stop_operation()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  previous_generation INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(
    'encounter-room-stop|' || NEW.encounter_id::text || '|' || NEW.participant_id::text, 0));
  IF NEW.stop_generation IS NOT NULL THEN
    RAISE EXCEPTION 'encounter-room-stop-generation-is-server-issued';
  END IF;
  IF EXISTS (
    SELECT 1 FROM encounter_room_stop_operations
     WHERE encounter_id = NEW.encounter_id AND participant_id = NEW.participant_id
       AND agreement_version = NEW.agreement_version AND consent_generation = NEW.consent_generation
  ) THEN
    RAISE EXCEPTION 'encounter-room-stop-consent-scope-closed';
  END IF;
  SELECT COALESCE(max(stop_generation), 0) INTO previous_generation
    FROM encounter_room_stop_operations
   WHERE encounter_id = NEW.encounter_id AND participant_id = NEW.participant_id;
  IF previous_generation >= 2147483647 THEN
    RAISE EXCEPTION 'encounter-room-stop-generation-limit';
  END IF;
  NEW.stop_generation := previous_generation + 1;
  NEW.requested_at := clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_encounter_room_stop_operation
  BEFORE INSERT ON encounter_room_stop_operations
  FOR EACH ROW EXECUTE FUNCTION enforce_encounter_room_stop_operation();

CREATE FUNCTION enforce_encounter_room_stop_acknowledgement()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  expected JSONB;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(
    'encounter-room-stop|' || NEW.encounter_id::text || '|' || NEW.participant_id::text, 0));
  SELECT b.target_bindings -> NEW.target INTO expected
    FROM encounter_room_stop_operations o
    JOIN encounter_room_stop_bindings b USING
      (encounter_id, participant_id, agreement_version, consent_generation, runtime_id)
   WHERE o.id = NEW.operation_id AND o.encounter_id = NEW.encounter_id
     AND o.participant_id = NEW.participant_id AND o.agreement_version = NEW.agreement_version
     AND o.consent_generation = NEW.consent_generation AND o.runtime_id = NEW.runtime_id
     AND o.stop_generation = NEW.stop_generation;
  IF expected IS NULL
     OR expected ->> 'principalId' IS DISTINCT FROM NEW.principal_id
     OR expected ->> 'adapterRuntimeId' IS DISTINCT FROM NEW.adapter_runtime_id
     OR expected ->> 'evidenceKind' IS DISTINCT FROM NEW.evidence_kind THEN
    RAISE EXCEPTION 'encounter-room-stop-acknowledgement-authority-mismatch';
  END IF;
  NEW.acknowledged_at := clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_encounter_room_stop_acknowledgement
  BEFORE INSERT ON encounter_room_stop_acknowledgements
  FOR EACH ROW EXECUTE FUNCTION enforce_encounter_room_stop_acknowledgement();

-- Same parent lifecycle rule as accepted R3A. Direct child mutations, including
-- TRUNCATE, are refused. Existing Encounter/participant deletion may cascade.
CREATE FUNCTION enforce_encounter_room_stop_append_only()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF TG_OP = 'DELETE' AND (
    NOT EXISTS (SELECT 1 FROM public.encounters WHERE id = OLD.encounter_id)
    OR NOT EXISTS (SELECT 1 FROM public.encounter_participants WHERE id = OLD.participant_id)
  ) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'encounter-room-stop-append-only: % is not permitted', TG_OP;
END;
$$;

CREATE TRIGGER trg_encounter_room_stop_binding_append_only
  BEFORE UPDATE OR DELETE ON encounter_room_stop_bindings
  FOR EACH ROW EXECUTE FUNCTION enforce_encounter_room_stop_append_only();
CREATE TRIGGER trg_encounter_room_stop_binding_no_truncate
  BEFORE TRUNCATE ON encounter_room_stop_bindings
  FOR EACH STATEMENT EXECUTE FUNCTION enforce_encounter_room_stop_append_only();
CREATE TRIGGER trg_encounter_room_stop_operation_append_only
  BEFORE UPDATE OR DELETE ON encounter_room_stop_operations
  FOR EACH ROW EXECUTE FUNCTION enforce_encounter_room_stop_append_only();
CREATE TRIGGER trg_encounter_room_stop_operation_no_truncate
  BEFORE TRUNCATE ON encounter_room_stop_operations
  FOR EACH STATEMENT EXECUTE FUNCTION enforce_encounter_room_stop_append_only();
CREATE TRIGGER trg_encounter_room_stop_acknowledgement_append_only
  BEFORE UPDATE OR DELETE ON encounter_room_stop_acknowledgements
  FOR EACH ROW EXECUTE FUNCTION enforce_encounter_room_stop_append_only();
CREATE TRIGGER trg_encounter_room_stop_acknowledgement_no_truncate
  BEFORE TRUNCATE ON encounter_room_stop_acknowledgements
  FOR EACH STATEMENT EXECUTE FUNCTION enforce_encounter_room_stop_append_only();

COMMENT ON TABLE encounter_room_stop_operations IS
  'One durable terminal participant Stop per consent scope; a committed request closes late work before all adapter reports arrive.';
COMMENT ON TABLE encounter_room_stop_acknowledgements IS
  'Attributed adapter reports, including explicit failure/not-started; neither client reports nor server receipts prove remote physical silence.';

COMMIT;
