-- ─────────────────────────────────────────────────────────────────────────────
-- Now What? pilot walk — seed scenario
--
-- ⚠️⚠️ TEST DATA. Every row created here is marked [SEED] in its body text so it
--    can be identified and removed. ⛔ Never run against production.
--
-- Purpose: give the founder walk something to encounter. Larry should see the
-- system respond to a person's actual developmental material, not an empty
-- shell — so this seeds the PRACTITIONER side only and leans on member material
-- that already exists.
--
-- ⛔ WHAT THIS DELIBERATELY DOES NOT SEED:
--
--   Larry's flourishing language. The invitation body below is an obvious
--   placeholder, not an approximation of his framework. Five different
--   five-item lists already circulate in his name and none came from him;
--   seeding a sixth — even as demo data — is how an approximation becomes the
--   thing everyone points at. A placeholder that reads as a placeholder is the
--   honest option (onboarding review §0).
--
--   Member responses. The member's gesture is the member's to make, including
--   during the walk. Pre-accepting it would stage the one moment the walk
--   exists to observe.
--
-- Idempotent: re-running replaces the seeded invitation, nothing else.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- Remove any prior seed so re-runs do not accumulate offers.
DELETE FROM field_invitations WHERE body LIKE '[SEED]%';

INSERT INTO field_invitations
  (field_slug, program_slug, authored_by_practitioner_id, body, addressed_to_member_id)
SELECT
  p.field_slug,
  p.program_slug,
  pf.practitioner_member_id,
  '[SEED] Placeholder invitation. The practitioner''s own words belong here — '
    || 'this text is intentionally not written in their voice.',
  p.member_id
FROM field_program_positions p
JOIN practice_fields pf ON pf.field_slug = p.field_slug
WHERE p.field_slug = 'now-what-demo';

COMMIT;

-- What the walk should now be able to reach.
SELECT
  i.field_slug,
  i.program_slug,
  m.name                       AS authored_by,
  i.addressed_to_member_id IS NOT NULL AS addressed,
  (SELECT count(*) FROM field_invitation_responses r WHERE r.invitation_id = i.id)
                               AS responses_so_far
FROM field_invitations i
JOIN members m ON m.id = i.authored_by_practitioner_id
WHERE i.body LIKE '[SEED]%';
