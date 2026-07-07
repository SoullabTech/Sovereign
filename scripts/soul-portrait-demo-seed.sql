-- Soul Portrait practitioner pilot — LOCAL DEMO SEED (review only).
--
-- Populates a self-contained, FICTIONAL demo so the practitioner Return surface
-- (/studio/soul-portraits) is reviewable locally with a believable body of work.
-- Everything here is invented — NO client data, NO production. Local DB only.
--
-- Fixed demo UUIDs (d01..d07) make it idempotent and easy to tear down (bottom).
-- Prereq: migrations for members, practitioners, studio_people, soul_portraits
-- (20260702000004 + 20260704000001) applied to the local DB.
--
-- After seeding, authenticate as the demo practitioner by setting the cookie
--   maia_session = demo_soul_portrait_review
-- then visit /studio/soul-portraits (the Return / body-of-work surface).
--
-- NOTE (honest limitation): the generate form's people-selector reads
-- /api/studio/people, which resolves practitioner identity through a separate
-- layer (colab team / identity) not exercised by this seed. The Return page and
-- subject threading do NOT depend on it and are fully demoable here; the live
-- selector may show empty for the demo member until that identity link exists.

BEGIN;

-- Demo practitioner's member account + a long-lived local session.
INSERT INTO members (id, passkey, username, password_hash, name, email, onboarded)
VALUES ('00000000-0000-4000-a000-000000000d01',
        'SOULLAB-DEMO-PRACTITIONER', 'demo.practitioner', 'x',
        'Demo Practitioner', 'demo+practitioner@soullab.life', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth_sessions (member_id, session_token, expires_at)
VALUES ('00000000-0000-4000-a000-000000000d01', 'demo_soul_portrait_review', NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- The practitioner directory record (older practitioners table: slug/name/email/status).
INSERT INTO practitioners (id, slug, name, email, status)
VALUES ('00000000-0000-4000-a000-000000000d02',
        'demo-practitioner', 'Demo Practitioner', 'demo+practitioner@soullab.life', 'active')
ON CONFLICT (id) DO NOTHING;

-- Two fictional subjects in the practitioner's directory (studio_people).
INSERT INTO studio_people (id, practitioner_id, name, notes)
VALUES
  ('00000000-0000-4000-a000-000000000d03', '00000000-0000-4000-a000-000000000d02', 'Marcus Chen', 'demo subject'),
  ('00000000-0000-4000-a000-000000000d04', '00000000-0000-4000-a000-000000000d02', 'Diane Okafor', 'demo subject')
ON CONFLICT (id) DO NOTHING;

-- Three draft portraits owned by the demo member, threaded by subject. immutable_text
-- is a minimal stub — enough for the Return LIST (title/kind/date). To demo the full
-- portrait render, generate one live at /soul-portrait/generate.
INSERT INTO soul_portraits (id, slug, owner_member_id, portrait_kind, consent_state, immutable_text, subject_person_id, created_at)
VALUES
  ('00000000-0000-4000-a000-000000000d05', 'marcus-chen-demo', '00000000-0000-4000-a000-000000000d01',
   'gift', 'pending', '{"person":{"name":"Marcus Chen","slug":"marcus-chen-demo"},"mode":"gift"}'::jsonb,
   '00000000-0000-4000-a000-000000000d03', NOW() - INTERVAL '21 days'),
  ('00000000-0000-4000-a000-000000000d06', 'marcus-chen-demo-2', '00000000-0000-4000-a000-000000000d01',
   'legacy', 'pending', '{"person":{"name":"Marcus Chen","slug":"marcus-chen-demo-2"},"mode":"legacy"}'::jsonb,
   '00000000-0000-4000-a000-000000000d03', NOW() - INTERVAL '6 days'),
  ('00000000-0000-4000-a000-000000000d07', 'diane-okafor-demo', '00000000-0000-4000-a000-000000000d01',
   'gift', 'pending', '{"person":{"name":"Diane Okafor","slug":"diane-okafor-demo"},"mode":"gift"}'::jsonb,
   '00000000-0000-4000-a000-000000000d04', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ── Teardown (run to remove the demo entirely) ──────────────────────────────
-- BEGIN;
-- DELETE FROM soul_portraits WHERE owner_member_id = '00000000-0000-4000-a000-000000000d01';
-- DELETE FROM studio_people  WHERE practitioner_id = '00000000-0000-4000-a000-000000000d02';
-- DELETE FROM practitioners  WHERE id = '00000000-0000-4000-a000-000000000d02';
-- DELETE FROM auth_sessions  WHERE member_id = '00000000-0000-4000-a000-000000000d01';
-- DELETE FROM members        WHERE id = '00000000-0000-4000-a000-000000000d01';
-- COMMIT;
