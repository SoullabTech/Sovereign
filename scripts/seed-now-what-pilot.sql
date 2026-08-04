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

-- ── Demo credential, owned here instead of by hand ───────────────────────────
-- 2026-08-03: walking the UI needed a signed-in member, and members.password_hash
-- was edited directly to get one -- without capturing the original first, which
-- is therefore gone. Putting it here makes the credential auditable, repeatable,
-- and reviewable in a diff instead of living in someone's shell history.
--
-- Legacy SHA256 path (lib/auth/passwordUtils.hashPasswordLegacy):
--     sha256(password + PASSWORD_SALT)
-- password 'walk-2026-08-03' + default salt 'maia-sovereign-salt'.
--
-- ⚠️ Dev fixture only. If PASSWORD_SALT is set in your environment this hash
--    will not match — regenerate rather than editing the row by hand.
-- The literal is the precomputed sha256, so this runs without pgcrypto.
--
-- ⚠️ This value is a STARTING state, not a stable one. verifyPassword() detects
--    the legacy format and the signin route upgrades the row to bcrypt on the
--    first successful login — observed 2026-08-03, the row read back as
--    $2b$12$… afterwards. Re-running this script resets it to legacy, which
--    then upgrades again. That is the intended behaviour, not drift.
UPDATE members
   SET password_hash = '94ce33d086460ee15db29d4f3a492a41232c675eeaf68521ea416e8aa7530f12'
 WHERE username = 'demo.practitioner';

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
