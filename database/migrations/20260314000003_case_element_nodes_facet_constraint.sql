-- Enforce canonical 15-facet ontology on case_element_nodes.facet
--
-- Before this migration, the facet column was VARCHAR(20) with no value constraint.
-- Legacy records with facet = 'aether' (undifferentiated singleton, pre-triadic model)
-- are normalized at read time via coerceLegacyFacetKey() in elementNodeGenerator.ts.
--
-- This constraint prevents NEW records from being written with legacy or invalid facet
-- strings. Historical ambiguity is preserved in read-path normalization; write-path
-- ambiguity is blocked here.
--
-- The 15 canonical keys are (source: Elemental Alchemy — Kelly Nezat):
--   Fire:   fire_1 (Activating)   fire_2 (Amplifying)   fire_3 (Actualizing)
--   Water:  water_1 (Being)       water_2 (Balancing)   water_3 (Becoming)
--   Earth:  earth_1 (Cultivating) earth_2 (Crystallizing) earth_3 (Clarifying)
--   Air:    air_1 (Directing)     air_2 (Discerning)    air_3 (Delivering)
--   Aether: aether_1 (Emanation)  aether_2 (Elevation)  aether_3 (Equilibrium)

ALTER TABLE case_element_nodes
  ADD CONSTRAINT case_element_nodes_facet_canonical CHECK (
    facet IN (
      'fire_1','fire_2','fire_3',
      'water_1','water_2','water_3',
      'earth_1','earth_2','earth_3',
      'air_1','air_2','air_3',
      'aether_1','aether_2','aether_3'
    )
  );
