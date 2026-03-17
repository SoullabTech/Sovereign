CREATE TABLE IF NOT EXISTS care_evaluation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('care', 'care+ifs', 'mentor', 'mentor+ifs')),
  therapeutic_framework TEXT,
  mentor_stance BOOLEAN NOT NULL DEFAULT FALSE,
  lens_fidelity INTEGER CHECK (lens_fidelity BETWEEN 1 AND 5),
  elemental_integrity INTEGER CHECK (elemental_integrity BETWEEN 1 AND 5),
  canon_alignment INTEGER CHECK (canon_alignment BETWEEN 1 AND 5),
  helpfulness INTEGER CHECK (helpfulness BETWEEN 1 AND 5),
  clarity INTEGER CHECK (clarity BETWEEN 1 AND 5),
  agency_preservation INTEGER CHECK (agency_preservation BETWEEN 1 AND 5),
  trust_again INTEGER CHECK (trust_again BETWEEN 1 AND 5),
  verdict TEXT CHECK (verdict IN ('pass', 'borderline', 'fail')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
