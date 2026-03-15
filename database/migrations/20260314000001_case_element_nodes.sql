-- Case Element Nodes: transformation signature infrastructure
-- Each node records a notable elemental activation in a practitioner case.
-- Facet is the primary semantic unit — 15 total across 5 elements × 3 states each.
-- Element + phase_index stored for querying/rendering convenience.
-- Nodes are system-proposed by default; practitioner confirmation makes them authoritative.
--
-- Facets (from Elemental Alchemy, Kelly Nezat):
--   fire_1: Activating   fire_2: Amplifying    fire_3: Actualizing
--   water_1: Being       water_2: Balancing     water_3: Becoming
--   earth_1: Cultivating earth_2: Crystallizing earth_3: Clarifying
--   air_1: Directing     air_2: Discerning      air_3: Delivering
--   aether_1: Emanation  aether_2: Elevation    aether_3: Equilibrium

-- practitioner_cases was created without a PRIMARY KEY — add it now (table is empty)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'practitioner_cases' AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE practitioner_cases ADD PRIMARY KEY (id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS case_element_nodes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                   UUID NOT NULL REFERENCES practitioner_cases(id) ON DELETE CASCADE,
  practitioner_id           UUID NOT NULL REFERENCES members(id),

  -- Spiralogic position
  facet                     VARCHAR(20) NOT NULL,
  element                   VARCHAR(10) NOT NULL CHECK (element IN ('fire','water','earth','air','aether')),
  phase_index               INTEGER CHECK (phase_index >= 1 AND phase_index <= 3),

  -- Node semantics
  role                      VARCHAR(20) NOT NULL CHECK (role IN ('marker','goal','grounding')),

  -- Qualitative condition of this facet in the case
  -- Internally: negative/neutral/positive
  -- Practitioner UI maps these to: constricted/emergent/coherent
  state_valence             VARCHAR(20) CHECK (state_valence IN ('negative','neutral','positive')),

  -- Generation metadata
  confidence                NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  source_type               VARCHAR(30) CHECK (source_type IN
                              ('case_memory','case_note','mission','follow_up','manual')),
  source_id                 UUID,
  session_context           TEXT,

  -- Practitioner confirmation
  confirmed_by_practitioner BOOLEAN DEFAULT false,
  confirmed_at              TIMESTAMPTZ,
  confirmed_by              UUID REFERENCES members(id),

  -- Annotation
  practitioner_note         TEXT,

  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_element_nodes_case
  ON case_element_nodes(case_id);

CREATE INDEX IF NOT EXISTS idx_case_element_nodes_practitioner
  ON case_element_nodes(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_case_element_nodes_facet
  ON case_element_nodes(case_id, facet);

CREATE INDEX IF NOT EXISTS idx_case_element_nodes_element
  ON case_element_nodes(element, role);

CREATE INDEX IF NOT EXISTS idx_case_element_nodes_confirmed
  ON case_element_nodes(case_id, confirmed_by_practitioner);

CREATE OR REPLACE FUNCTION update_case_element_nodes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_element_nodes_updated_at
  BEFORE UPDATE ON case_element_nodes
  FOR EACH ROW EXECUTE FUNCTION update_case_element_nodes_timestamp();
