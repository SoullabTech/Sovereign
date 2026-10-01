-- SOULLAB-LIVING-ARCHIVE-01 · LIVING-ARCHIVE-SOURCE-VAULT-R1
-- Founder ratification: 2026-10-01 (LA-27, LA-28, LA-29, layered entry).
--
-- Additive historical-evidence substrate only.
-- NO artifact ingestion, NO backfill, NO member-facing route, NO renderer.
--
-- The `living_archive_*` namespace is deliberate. MAIA-WISDOM-01 already uses
-- "Source Vault" for a different corpus authority. The Living Archive must not
-- silently reuse Library Intelligence, Writer's Studio custody, or deletion
-- provenance as historical-evidence authority.

-- Rollback: DROP the five living_archive_* tables in reverse dependency order.
-- No artifact/member data is inserted by this migration.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- ---------------------------------------------------------------------------
-- 1. Catalogue unit versions.
-- LA-27 requires visible standing for the point-counting unit. A unit change is
-- not "newly recovered history" and must be separately identifiable.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS living_archive_catalogue_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  unit_definition TEXT NOT NULL CHECK (length(btrim(unit_definition)) > 0),
  change_note TEXT,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO living_archive_catalogue_versions (version, unit_definition, change_note)
VALUES (
  'LA-CATALOGUE-UNIT-v1',
  'The provenance-bearing object as it was made. Pages, excerpts, clips, transcript spans, frames and sections are sub-artifacts and do not become separate Dark Field points merely because they are addressable.',
  'Founder-ratified fixed unit supporting LA-27.'
)
ON CONFLICT (version) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Artifacts.
-- The row describes historical evidence and its standing. It does NOT imply
-- publication. `point_visibility` concerns Dark Field geometry only; content
-- access is independent so a SEALED (SELF) point can be visible while content
-- remains closed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS living_archive_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_id TEXT NOT NULL UNIQUE CHECK (length(btrim(archive_id)) > 0),
  parent_artifact_id UUID REFERENCES living_archive_artifacts(id) ON DELETE RESTRICT,
  catalogue_version_id UUID NOT NULL REFERENCES living_archive_catalogue_versions(id) ON DELETE RESTRICT,

  title TEXT NOT NULL CHECK (length(btrim(title)) > 0),
  artifact_class TEXT NOT NULL CHECK (length(btrim(artifact_class)) > 0),
  source_status TEXT NOT NULL CHECK (source_status IN (
    'original',
    'contemporary_record',
    'later_recollection',
    'reconstruction',
    'derived_record'
  )),
  creator_voice TEXT,

  date_precision TEXT NOT NULL CHECK (date_precision IN ('exact','approximate','range','unknown')),
  date_start DATE,
  date_end DATE,
  date_display TEXT NOT NULL CHECK (length(btrim(date_display)) > 0),

  source_location TEXT,
  storage_ref TEXT,
  content_hash TEXT,
  digitization_status TEXT NOT NULL DEFAULT 'not_digitized' CHECK (digitization_status IN (
    'not_digitized','partial','digitized','transcribed','recovered','not_applicable'
  )),

  privacy_class TEXT NOT NULL DEFAULT 'ordinary' CHECK (privacy_class IN (
    'ordinary','sealed_self','withheld_third_party'
  )),
  point_visibility TEXT NOT NULL DEFAULT 'none' CHECK (point_visibility IN (
    'public','member','founder','none'
  )),
  content_access TEXT NOT NULL DEFAULT 'private' CHECK (content_access IN (
    'public','member','steward','research','founder','private'
  )),
  rights_status TEXT NOT NULL DEFAULT 'unknown' CHECK (rights_status IN (
    'unknown','owned','licensed','public_domain','permission_required','restricted','review'
  )),
  rights_privacy_notes TEXT,

  admission_stage TEXT NOT NULL DEFAULT 'discovered' CHECK (admission_stage IN (
    'discovered','catalogued','reviewed','admitted'
  )),
  display_status TEXT NOT NULL DEFAULT 'hidden' CHECK (display_status IN (
    'hidden','eligible','redacted','exhibited','restricted','private'
  )),
  custody_status TEXT NOT NULL DEFAULT 'active' CHECK (custody_status IN ('active','withdrawn')),
  withdrawn_at TIMESTAMPTZ,

  what_establishes TEXT,
  what_does_not_establish TEXT,
  understood_then TEXT,
  developed_between TEXT,
  current_interpretation TEXT,
  unknowns TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT living_archive_artifacts_date_shape CHECK (
    (date_precision = 'unknown' AND date_start IS NULL AND date_end IS NULL)
    OR (date_precision = 'exact' AND date_start IS NOT NULL AND date_end IS NOT NULL AND date_end = date_start)
    OR (date_precision = 'approximate' AND date_start IS NOT NULL AND (date_end IS NULL OR date_end >= date_start))
    OR (date_precision = 'range' AND date_start IS NOT NULL AND date_end IS NOT NULL AND date_end >= date_start)
  ),
  CONSTRAINT living_archive_subartifact_not_point CHECK (
    parent_artifact_id IS NULL OR point_visibility = 'none'
  ),
  CONSTRAINT living_archive_withheld_no_geometry CHECK (
    privacy_class <> 'withheld_third_party'
    OR (
      point_visibility = 'none'
      AND content_access = 'private'
      AND display_status IN ('hidden','restricted','private')
    )
  ),
  CONSTRAINT living_archive_sealed_content_closed CHECK (
    privacy_class <> 'sealed_self'
    OR (
      point_visibility IN ('member','founder','none')
      AND content_access IN ('founder','private')
      AND display_status IN ('hidden','eligible','redacted','restricted','private')
    )
  ),
  CONSTRAINT living_archive_withdrawal_time CHECK (
    (custody_status = 'active' AND withdrawn_at IS NULL)
    OR (custody_status = 'withdrawn' AND withdrawn_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_living_archive_artifacts_parent
  ON living_archive_artifacts(parent_artifact_id);
CREATE INDEX IF NOT EXISTS idx_living_archive_artifacts_date
  ON living_archive_artifacts(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_living_archive_artifacts_admission
  ON living_archive_artifacts(admission_stage, display_status);
CREATE INDEX IF NOT EXISTS idx_living_archive_artifacts_privacy
  ON living_archive_artifacts(privacy_class, point_visibility);

COMMENT ON TABLE living_archive_artifacts IS
  'SOULLAB-LIVING-ARCHIVE-01 historical evidence objects. Top-level rows may become Dark Field points; sub-artifacts never inflate point count.';
COMMENT ON COLUMN living_archive_artifacts.point_visibility IS
  'Dark Field geometry eligibility only. It is intentionally independent of content_access so sealed_self may be visible as a closed point.';
COMMENT ON COLUMN living_archive_artifacts.privacy_class IS
  'withheld_third_party is geometrically invisible by LA-29. sealed_self is founder-owned private material and a distinct class.';

-- ---------------------------------------------------------------------------
-- 3. Provenance claims.
-- One artifact may carry several standings at once (e.g. B + C + D).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS living_archive_provenance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES living_archive_artifacts(id) ON DELETE CASCADE,
  claim_class TEXT NOT NULL CHECK (claim_class IN ('A','B','C','D','E')),
  claim_text TEXT NOT NULL CHECK (length(btrim(claim_text)) > 0),
  evidence_ref TEXT,
  asserted_by TEXT,
  interpretive_distance TEXT CHECK (interpretive_distance IS NULL OR interpretive_distance IN (
    'contemporary_interpretation',
    'near_contemporary_reflection',
    'later_retrospective_interpretation',
    'current_synthesis'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_living_archive_provenance_artifact
  ON living_archive_provenance_claims(artifact_id, claim_class);

COMMENT ON TABLE living_archive_provenance_claims IS
  'Qualitative provenance standings: A contemporary primary artifact; B later primary testimony; C independently contextualized; D retrospective interpretation; E MAIA-proposed connection.';

-- ---------------------------------------------------------------------------
-- 4. Known gaps are first-class records, not inferred empty space and not fake
-- artifacts. This is LA-13 made structurally distinguishable from layout.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS living_archive_known_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id TEXT NOT NULL UNIQUE CHECK (length(btrim(gap_id)) > 0),
  title TEXT NOT NULL CHECK (length(btrim(title)) > 0),

  date_precision TEXT NOT NULL CHECK (date_precision IN ('exact','approximate','range','unknown')),
  date_start DATE,
  date_end DATE,
  date_display TEXT NOT NULL CHECK (length(btrim(date_display)) > 0),

  what_is_missing TEXT NOT NULL CHECK (length(btrim(what_is_missing)) > 0),
  how_absence_is_known TEXT NOT NULL CHECK (length(btrim(how_absence_is_known)) > 0),
  source_of_gap_claim TEXT NOT NULL CHECK (length(btrim(source_of_gap_claim)) > 0),

  privacy_class TEXT NOT NULL DEFAULT 'ordinary' CHECK (privacy_class IN (
    'ordinary','sealed_self','withheld_third_party'
  )),
  point_visibility TEXT NOT NULL DEFAULT 'none' CHECK (point_visibility IN (
    'public','member','founder','none'
  )),
  content_access TEXT NOT NULL DEFAULT 'private' CHECK (content_access IN (
    'public','member','steward','research','founder','private'
  )),
  admission_stage TEXT NOT NULL DEFAULT 'discovered' CHECK (admission_stage IN (
    'discovered','catalogued','reviewed','admitted'
  )),
  display_status TEXT NOT NULL DEFAULT 'hidden' CHECK (display_status IN (
    'hidden','eligible','exhibited','restricted','private'
  )),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT living_archive_known_gaps_date_shape CHECK (
    (date_precision = 'unknown' AND date_start IS NULL AND date_end IS NULL)
    OR (date_precision = 'exact' AND date_start IS NOT NULL AND date_end IS NOT NULL AND date_end = date_start)
    OR (date_precision = 'approximate' AND date_start IS NOT NULL AND (date_end IS NULL OR date_end >= date_start))
    OR (date_precision = 'range' AND date_start IS NOT NULL AND date_end IS NOT NULL AND date_end >= date_start)
  ),
  CONSTRAINT living_archive_known_gaps_withheld_no_geometry CHECK (
    privacy_class <> 'withheld_third_party'
    OR (
      point_visibility = 'none'
      AND content_access = 'private'
      AND display_status IN ('hidden','restricted','private')
    )
  ),
  CONSTRAINT living_archive_known_gaps_sealed_content_closed CHECK (
    privacy_class <> 'sealed_self'
    OR (
      point_visibility IN ('member','founder','none')
      AND content_access IN ('founder','private')
      AND display_status IN ('hidden','eligible','restricted','private')
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_living_archive_known_gaps_date
  ON living_archive_known_gaps(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_living_archive_known_gaps_privacy
  ON living_archive_known_gaps(privacy_class, point_visibility);

-- ---------------------------------------------------------------------------
-- 5. Lineage edges carry standing. "This became that" is never an untyped edge.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS living_archive_lineage_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_artifact_id UUID NOT NULL REFERENCES living_archive_artifacts(id) ON DELETE CASCADE,
  to_artifact_id UUID NOT NULL REFERENCES living_archive_artifacts(id) ON DELETE CASCADE,
  standing TEXT NOT NULL CHECK (standing IN ('direct','founder_attested','structural','proposed')),
  relation TEXT NOT NULL CHECK (length(btrim(relation)) > 0),
  evidence_ref TEXT,
  asserted_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT living_archive_lineage_not_self CHECK (from_artifact_id <> to_artifact_id),
  CONSTRAINT living_archive_lineage_unique UNIQUE (from_artifact_id, to_artifact_id, standing, relation)
);

CREATE INDEX IF NOT EXISTS idx_living_archive_lineage_from
  ON living_archive_lineage_edges(from_artifact_id);
CREATE INDEX IF NOT EXISTS idx_living_archive_lineage_to
  ON living_archive_lineage_edges(to_artifact_id);
CREATE INDEX IF NOT EXISTS idx_living_archive_lineage_standing
  ON living_archive_lineage_edges(standing);

COMMENT ON TABLE living_archive_lineage_edges IS
  'Historical/genealogical edges with explicit standing: direct, founder_attested, structural, or proposed. Rendering must still exclude withheld_third_party endpoints by LA-29.';

COMMIT;
