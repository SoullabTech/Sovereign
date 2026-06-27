-- Personal Wisdom Library — Increment 1: governance axes on library_sources
-- Spec: docs/specs/PERSONAL_WISDOM_LIBRARY_IMPL_2026-06-27.md §3
-- Architecture: docs/architecture/PERSONAL_WISDOM_LIBRARY.md §4 (five governance axes)
--
-- ADDITIVE ONLY. The existing global pool becomes the platform scope UNTOUCHED:
-- every existing row defaults to scope='platform' / owner_type='platform' /
-- visibility='published'. No data movement. Platform retrieval is unaffected
-- (the authorization predicate admits scope='platform' unconditionally).
--
-- Convention: TEXT + CHECK (matches library_sources.type / ingestion_status),
-- not native ENUM types — easier to extend, consistent with the table.

ALTER TABLE library_sources
  -- Scope: whose domain the object belongs to (§4). Platform default = existing corpus.
  ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'platform'
    CHECK (scope IN ('platform', 'practitioner', 'member')),

  -- Owner axis: who authored/uploaded it. Kept SEPARATE from scope because the
  -- §8 promotion invariant requires it — a member-authored object promoted to
  -- platform scope retains owner_type='member' while scope becomes 'platform'.
  ADD COLUMN IF NOT EXISTS owner_type TEXT NOT NULL DEFAULT 'platform'
    CHECK (owner_type IN ('platform', 'practitioner', 'member')),
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES members(id),

  -- Visibility (§4): who may see it. Default 'published' is correct for the
  -- auto-defaulted platform rows; member-scope writes set 'private' explicitly.
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'published'
    CHECK (visibility IN ('private', 'shared', 'published')),

  -- Usage authority (§4): the dial the MEMBER holds — how MAIA may use it.
  -- Monotonic ladder of MAIA's initiative; defaults to the low end so that
  -- NO KEPT ITEM IS GUIDANCE-AUTHORITATIVE BY DEFAULT.
  ADD COLUMN IF NOT EXISTS usage_authority TEXT NOT NULL DEFAULT 'only_when_i_ask'
    CHECK (usage_authority IN ('store_only', 'only_when_i_ask', 'reflect_with_me', 'use_in_guidance')),

  -- Lifecycle/maturity (§6) — orthogonal to usage_authority. Not used by the
  -- increment-1 retrieval predicate; reserved here so the model is whole.
  ADD COLUMN IF NOT EXISTS lifecycle_state TEXT NOT NULL DEFAULT 'kept'
    CHECK (lifecycle_state IN ('kept', 'curated', 'trusted', 'active', 'retired')),

  -- Provenance (§5/§9): origin/source type. Nullable for the pre-existing
  -- platform corpus (origin unknown); member writes record it.
  ADD COLUMN IF NOT EXISTS provenance TEXT
    CHECK (provenance IS NULL OR provenance IN (
      'transcript', 'manual', 'book', 'paper', 'workshop',
      'personal_insight', 'clinical', 'tradition', 'maia_conversation'
    ));

-- Index the authorization-predicate columns (member retrieval filters on these).
CREATE INDEX IF NOT EXISTS idx_library_sources_owner ON library_sources(owner_id);
CREATE INDEX IF NOT EXISTS idx_library_sources_scope_owner ON library_sources(scope, owner_id);

COMMENT ON COLUMN library_sources.scope IS 'Governance axis — whose domain (platform/practitioner/member). Default platform = existing corpus.';
COMMENT ON COLUMN library_sources.owner_type IS 'Governance axis — who authored it. Separate from scope so promotion preserves authorship (arch §8).';
COMMENT ON COLUMN library_sources.owner_id IS 'Member who owns this source (member scope). NULL for platform/practitioner-without-individual-owner.';
COMMENT ON COLUMN library_sources.visibility IS 'Governance axis — who may see it (private/shared/published).';
COMMENT ON COLUMN library_sources.usage_authority IS 'Governance axis — how MAIA may use it. Monotonic initiative ladder; defaults low. No kept item is guidance-authoritative by default.';
COMMENT ON COLUMN library_sources.lifecycle_state IS 'Maturity axis (orthogonal to authority). kept→curated→trusted→active→retired.';
COMMENT ON COLUMN library_sources.provenance IS 'Origin/source type (member-authored vs imported, kind of source).';
