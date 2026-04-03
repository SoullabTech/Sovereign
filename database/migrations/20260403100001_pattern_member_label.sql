-- Pattern member label: let members name patterns in their own language
-- Additive, nullable — no risk to existing data

ALTER TABLE pattern_ledger ADD COLUMN IF NOT EXISTS member_label TEXT;
ALTER TABLE member_patterns ADD COLUMN IF NOT EXISTS member_label TEXT;
