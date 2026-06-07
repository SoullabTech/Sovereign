-- Backfill members.is_practitioner to match the authoritative practitioners table.
--
-- Root cause: practitioner rows are created by app/api/practitioners/create and
-- app/api/studio/personal/enter, but neither set members.is_practitioner, so the
-- flag drifted out of sync (13 active practitioner rows vs 2 flags set, as observed
-- 2026-06-06). The Studio access gate (lib/auth/getCurrentPractitioner) reads the
-- practitioners table directly and was unaffected — but auth whoami, Nostr
-- practitioner gating, caseload (lib/caseload/CaseStore), and the team practitioner
-- badge all read this flag, so the 11 mismatched practitioners were mistreated on
-- those surfaces.
--
-- The forward-fix landed in both creation routes (they now set the flag on insert);
-- this migration repairs existing data. Idempotent and safe: only flips rows that
-- have an active practitioner row and are not already true.

UPDATE members m
SET is_practitioner = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM practitioners p
  WHERE p.member_id = m.id
    AND p.status = 'active'
)
AND m.is_practitioner IS DISTINCT FROM true;
