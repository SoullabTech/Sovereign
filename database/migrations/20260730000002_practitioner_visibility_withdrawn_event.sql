-- Lane V — record the withdrawal of practitioner visibility in the authorship ledger.
--
-- A member may withdraw practitioner visibility from a kept thread
-- (app/api/now-what/field-note/[id]). Until now that act left no ledger row,
-- because no existing event type described it truthfully:
--
--   'released'        — wrong act. Release removes the thread from the member's
--                       OWN field as well; withdrawal leaves it fully present.
--   'consent_changed' — wrong subject, and unsafe. The thread's consent_state is
--                       untouched by a withdrawal; only the practitioner-visibility
--                       boolean moves. Worse, scripts/repro/consent_gate_proof.mjs
--                       DELETEs rows of that event_type as test cleanup, which
--                       would put real member records in a delete path.
--
-- So the vocabulary gains one value, scoped to exactly that capability.
--
-- SHARED SUBSTRATE. member_field_note_events is written by Field Lab, Vision
-- Studio and Now What?. This migration only WIDENS the accepted set: every
-- previously valid event_type remains valid, so existing writers and readers are
-- unaffected. Forward-only — no DOWN step, because narrowing the constraint
-- later could orphan rows already written.

ALTER TABLE member_field_note_events
  DROP CONSTRAINT IF EXISTS member_field_note_events_event_type_check;

ALTER TABLE member_field_note_events
  ADD CONSTRAINT member_field_note_events_event_type_check
  CHECK (event_type IN (
    -- Pre-existing vocabulary, carried forward unchanged
    -- (20260626000001 + 20260626000003).
    'proposed','kept','revised','split','discarded','created','consent_changed','released',
    -- Lane V: the member ended practitioner access to a thread they keep.
    'practitioner_visibility_withdrawn'
  ));

COMMENT ON COLUMN member_field_note_events.event_type IS
  'Authorship ledger vocabulary. practitioner_visibility_withdrawn = the member ended a practitioner''s access to a thread that remains fully present in the member''s own field — distinct from ''released'' (thread leaves both fields) and from ''consent_changed'' (the thread''s consent_state transitioned).';
