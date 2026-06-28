-- Field Attention — the person's curated attention fields (authored, Oath-safe)
--
-- Backs the Personal Studio home's three curated fields: Important · Needs
-- attention · Emerging. Where field_pulse DERIVES sections from status/urgency,
-- this is CURATION: the person explicitly PLACES a change, a decision, or a free
-- note into a field, and can take it back out (add / subtract). The system never
-- decides what is important — the member does. "Important" is a member label, not
-- a computed score (no ranking, no significance inference). Mirrors field_notes scope.
--
-- A placement can reference an existing change/decision (kind + ref_id) or be a
-- free note (kind='note', ref_id NULL, label = the text). label caches a display
-- string; for change/decision the GET resolves the CURRENT title and falls back to
-- this cache if the source was removed. position is the member's drag order.

CREATE TABLE IF NOT EXISTS field_attention (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id         uuid REFERENCES studio_teams(id) ON DELETE SET NULL,
  field           text NOT NULL CHECK (field IN ('important', 'attention', 'emerging')),
  kind            text NOT NULL CHECK (kind IN ('change', 'decision', 'note')),
  ref_id          uuid,                                          -- change/decision id; NULL for free notes
  label           text NOT NULL CHECK (length(btrim(label)) > 0), -- cached title or the note body
  position        integer NOT NULL DEFAULT 0,                     -- member drag order within a field
  created_at      timestamptz NOT NULL DEFAULT now(),
  -- a referenced item (change/decision) must carry a ref_id; a free note must not
  CHECK ((kind = 'note' AND ref_id IS NULL) OR (kind IN ('change', 'decision') AND ref_id IS NOT NULL))
);

COMMENT ON TABLE field_attention IS
  'Member-CURATED attention placements for the Personal Studio home (Important / Needs attention / Emerging). The person places a change, decision, or free note into a field and can remove it. Complementary to field_pulse (which DERIVES). No significance computation — the member decides. Scope: personal = team_id NULL; co-lab = team_id set (mirrors field_notes).';

CREATE INDEX IF NOT EXISTS idx_field_attention_practitioner ON field_attention(practitioner_id, field, position);
CREATE INDEX IF NOT EXISTS idx_field_attention_team ON field_attention(team_id) WHERE team_id IS NOT NULL;
-- a change/decision lives in a given field at most once (a note can repeat)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_field_attention_ref
  ON field_attention(practitioner_id, field, kind, ref_id)
  WHERE ref_id IS NOT NULL;
