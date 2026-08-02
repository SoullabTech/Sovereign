-- Acceptance evidence for M1 — the canonical practitioner–client relationship record.
-- Founder ruling: Kelly, 2026-08-02.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/verify-practitioner-relationship-m1.sql
--
-- Runs entirely inside a transaction that ROLLS BACK. It creates fixtures, exercises
-- the reconciliation classifier and every relationship constraint, and leaves no row
-- behind. A failure RAISEs — silence plus "ALL PASSED" is the only success.
--
-- What it proves, in order:
--   1-8  reconciliation classifies by strength of provenance, and auto-links ONLY
--        verified_invitation and verified_unique_email
--   9-14 the relationship record cannot be quietly corrupted: a link is write-once,
--        one active relationship per practitioner+member, re-engagement is possible,
--        an ended relationship is dated, a pending one is reachable

\set ON_ERROR_STOP on
BEGIN;

-- Fixtures are isolated by a tag so nothing can collide with real data even if a
-- future edit removes the ROLLBACK.
\set tag '\'m1verify\''

DO $$
DECLARE
  prac_member UUID; prac UUID;
  m_invite UUID; m_verified UUID; m_unverified UUID;
  m_dupe_a UUID; m_dupe_b UUID; m_conflict UUID; m_compete UUID;
  r_invite UUID; r_verified UUID; r_unverified UUID; r_dupe UUID;
  r_compete_1 UUID; r_compete_2 UUID; r_noemail UUID; r_nomember UUID; r_conflict UUID;
  n_queued BIGINT; n_linked BIGINT;
  got TEXT; got_uuid UUID; failures INT := 0;
  expected TEXT;
BEGIN
  -- ── fixture people ────────────────────────────────────────────────────────
  INSERT INTO members (passkey, username, password_hash, email, email_verified)
    VALUES ('m1verify-prac', 'm1verify-prac', 'x', 'prac@m1verify.test', TRUE) RETURNING id INTO prac_member;
  INSERT INTO practitioners (member_id, name, email, slug)
    VALUES (prac_member, 'M1 Verify', 'prac@m1verify.test', 'm1verify') RETURNING id INTO prac;

  INSERT INTO members (passkey, username, password_hash, email, email_verified)
    VALUES ('m1verify-1','m1verify-1','x','invited@m1verify.test', TRUE) RETURNING id INTO m_invite;
  INSERT INTO members (passkey, username, password_hash, email, email_verified)
    VALUES ('m1verify-2','m1verify-2','x','verified@m1verify.test', TRUE) RETURNING id INTO m_verified;
  INSERT INTO members (passkey, username, password_hash, email, email_verified)
    VALUES ('m1verify-3','m1verify-3','x','unverified@m1verify.test', FALSE) RETURNING id INTO m_unverified;
  INSERT INTO members (passkey, username, password_hash, email, email_verified)
    VALUES ('m1verify-4','m1verify-4','x','dupe@m1verify.test', TRUE) RETURNING id INTO m_dupe_a;
  INSERT INTO members (passkey, username, password_hash, email, email_verified)
    VALUES ('m1verify-5','m1verify-5','x','dupe@m1verify.test', TRUE) RETURNING id INTO m_dupe_b;
  INSERT INTO members (passkey, username, password_hash, email, email_verified)
    VALUES ('m1verify-6','m1verify-6','x','conflict@m1verify.test', TRUE) RETURNING id INTO m_conflict;
  -- exists, verified, unique — so the ONLY thing blocking this one is that the
  -- practitioner has two live relationships carrying the same invitation address.
  INSERT INTO members (passkey, username, password_hash, email, email_verified)
    VALUES ('m1verify-7','m1verify-7','x','compete@m1verify.test', TRUE) RETURNING id INTO m_compete;

  -- ── fixture relationships (all unlinked, as legacy rows are) ──────────────
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
    VALUES (prac,'Invited','invited@m1verify.test','invited@m1verify.test','pending') RETURNING id INTO r_invite;
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
    VALUES (prac,'Verified','verified@m1verify.test','verified@m1verify.test','pending') RETURNING id INTO r_verified;
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
    VALUES (prac,'Unverified','unverified@m1verify.test','unverified@m1verify.test','pending') RETURNING id INTO r_unverified;
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
    VALUES (prac,'Dupe','dupe@m1verify.test','dupe@m1verify.test','pending') RETURNING id INTO r_dupe;
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status, intended_scope)
    VALUES (prac,'Compete A','compete@m1verify.test','compete@m1verify.test','pending','a') RETURNING id INTO r_compete_1;
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status, intended_scope)
    VALUES (prac,'Compete B','compete@m1verify.test','compete@m1verify.test','pending','b') RETURNING id INTO r_compete_2;
  -- a legacy row carrying no invitation address at all. Legal only because it is
  -- not pending: a PENDING relationship must be reachable (asserted at step 14).
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
    VALUES (prac,'No email','noemail@m1verify.test', NULL, 'active') RETURNING id INTO r_noemail;
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
    VALUES (prac,'Nobody','nobody@m1verify.test','nobody-at-all@m1verify.test','pending') RETURNING id INTO r_nomember;
  INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
    VALUES (prac,'Conflict','conflict@m1verify.test','conflict@m1verify.test','pending') RETURNING id INTO r_conflict;

  -- invitation provenance
  -- NOTE: client_invites.practitioner_id references MEMBERS(id), while
  -- practitioner_clients.practitioner_id references PRACTITIONERS(id). Same column
  -- name, different referent — see the migration's §JOIN KEY note.
  INSERT INTO client_invites (practitioner_id, client_id, code_hash, status, claimed_at, claimed_by_member_id)
    VALUES (prac_member,r_invite, 'h1', 'claimed', NOW(), m_invite);
  -- two different members claimed invitations issued from the same relationship
  -- NOTE: client_invites.practitioner_id references MEMBERS(id), while
  -- practitioner_clients.practitioner_id references PRACTITIONERS(id). Same column
  -- name, different referent — see the migration's §JOIN KEY note.
  INSERT INTO client_invites (practitioner_id, client_id, code_hash, status, claimed_at, claimed_by_member_id)
    VALUES (prac_member,r_conflict, 'h2', 'claimed', NOW(), m_conflict);
  -- NOTE: client_invites.practitioner_id references MEMBERS(id), while
  -- practitioner_clients.practitioner_id references PRACTITIONERS(id). Same column
  -- name, different referent — see the migration's §JOIN KEY note.
  INSERT INTO client_invites (practitioner_id, client_id, code_hash, status, claimed_at, claimed_by_member_id)
    VALUES (prac_member,r_conflict, 'h3', 'claimed', NOW(), m_dupe_a);

  -- ── run the reconciliation mechanism ──────────────────────────────────────
  SELECT queued, auto_linked INTO n_queued, n_linked FROM practitioner_client_reconcile();
  RAISE NOTICE 'reconcile(): queued=% auto_linked=%', n_queued, n_linked;

  -- ── 1-8  classification ───────────────────────────────────────────────────
  FOR expected, got_uuid IN
    SELECT * FROM (VALUES
      ('verified_invitation',              r_invite),
      ('verified_unique_email',            r_verified),
      ('manual_review_required',           r_unverified),
      ('ambiguous_multiple_members',       r_dupe),
      ('ambiguous_multiple_relationships', r_compete_1),
      ('missing_member',                   r_nomember),
      ('missing_email',                    r_noemail),
      ('conflicting_invitation',           r_conflict)
    ) AS t(e, rid)
  LOOP
    SELECT match_basis INTO got FROM practitioner_client_reconciliation WHERE relationship_id = got_uuid;
    IF got IS DISTINCT FROM expected THEN
      failures := failures + 1;
      RAISE WARNING 'FAIL classification: relationship % expected % got %', got_uuid, expected, coalesce(got,'<none>');
    ELSE
      RAISE NOTICE 'ok  classification %  -> %', expected, got_uuid;
    END IF;
  END LOOP;

  -- ── auto-link: ONLY the two admissible bases ──────────────────────────────
  IF (SELECT member_id FROM practitioner_clients WHERE id = r_invite) IS DISTINCT FROM m_invite THEN
    failures := failures + 1; RAISE WARNING 'FAIL: verified_invitation was not auto-linked';
  ELSE RAISE NOTICE 'ok  auto-linked on verified_invitation'; END IF;

  IF (SELECT member_id FROM practitioner_clients WHERE id = r_verified) IS DISTINCT FROM m_verified THEN
    failures := failures + 1; RAISE WARNING 'FAIL: verified_unique_email was not auto-linked';
  ELSE RAISE NOTICE 'ok  auto-linked on verified_unique_email'; END IF;

  IF EXISTS (
    SELECT 1 FROM practitioner_clients
    WHERE id IN (r_unverified, r_dupe, r_compete_1, r_compete_2, r_nomember, r_conflict)
      AND member_id IS NOT NULL
  ) THEN
    failures := failures + 1;
    RAISE WARNING 'FAIL: an ambiguous relationship was auto-linked. Guessing is not permitted.';
  ELSE
    RAISE NOTICE 'ok  no ambiguous relationship was linked (6 rows left for a human)';
  END IF;

  IF failures > 0 THEN
    RAISE EXCEPTION 'M1 reconciliation acceptance FAILED with % failure(s)', failures;
  END IF;
END $$;

-- ── 9  member_id is write-once: cannot be re-pointed ────────────────────────
DO $$
DECLARE rid UUID; other UUID; ok BOOLEAN := FALSE;
BEGIN
  SELECT id INTO rid FROM practitioner_clients WHERE email = 'invited@m1verify.test';
  SELECT id INTO other FROM members WHERE username = 'm1verify-3';
  BEGIN
    UPDATE practitioner_clients SET member_id = other WHERE id = rid;
  EXCEPTION WHEN OTHERS THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL 9: a linked relationship was re-pointed at another member'; END IF;
  RAISE NOTICE 'ok  9  a linked relationship cannot be re-pointed at another member';
END $$;

-- ── 10  and cannot be silently unlinked ─────────────────────────────────────
DO $$
DECLARE rid UUID; ok BOOLEAN := FALSE;
BEGIN
  SELECT id INTO rid FROM practitioner_clients WHERE email = 'invited@m1verify.test';
  BEGIN
    UPDATE practitioner_clients SET member_id = NULL WHERE id = rid;
  EXCEPTION WHEN OTHERS THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL 10: a linked relationship was silently unlinked'; END IF;
  RAISE NOTICE 'ok  10 a linked relationship cannot be silently unlinked';
END $$;

-- ── 11  one ACTIVE relationship per practitioner + member ───────────────────
DO $$
DECLARE prac UUID; mem UUID; ok BOOLEAN := FALSE;
BEGIN
  SELECT id INTO prac FROM practitioners WHERE slug = 'm1verify';
  SELECT id INTO mem  FROM members WHERE username = 'm1verify-1';
  UPDATE practitioner_clients SET relationship_status = 'active'
    WHERE email = 'invited@m1verify.test';
  BEGIN
    INSERT INTO practitioner_clients (practitioner_id, name, email, relationship_status, member_id, linked_at)
      VALUES (prac, 'Duplicate active', 'dup-active@m1verify.test', 'active', mem, NOW());
  EXCEPTION WHEN unique_violation THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL 11: two ACTIVE relationships exist for one practitioner+member'; END IF;
  RAISE NOTICE 'ok  11 a second ACTIVE relationship for the same member is refused';
END $$;

-- ── 12  but re-engagement IS possible once the first has ended ──────────────
DO $$
DECLARE prac UUID; mem UUID; newid UUID;
BEGIN
  SELECT id INTO prac FROM practitioners WHERE slug = 'm1verify';
  SELECT id INTO mem  FROM members WHERE username = 'm1verify-1';
  UPDATE practitioner_clients
     SET relationship_status = 'ended', relationship_ended_at = NOW()
   WHERE email = 'invited@m1verify.test';
  INSERT INTO practitioner_clients (practitioner_id, name, email, relationship_status, member_id, linked_at)
    VALUES (prac, 'Returned', 'returned@m1verify.test', 'active', mem, NOW()) RETURNING id INTO newid;
  IF newid IS NULL THEN RAISE EXCEPTION 'FAIL 12: a returning client could not be re-engaged'; END IF;
  IF NOT EXISTS (SELECT 1 FROM practitioner_clients
                 WHERE email = 'invited@m1verify.test' AND relationship_status = 'ended') THEN
    RAISE EXCEPTION 'FAIL 12: the historical relationship was not preserved';
  END IF;
  RAISE NOTICE 'ok  12 a client can be re-engaged; the ended relationship is preserved, not overwritten';
END $$;

-- ── 13  an ended relationship must be dated ─────────────────────────────────
DO $$
DECLARE ok BOOLEAN := FALSE;
BEGIN
  BEGIN
    UPDATE practitioner_clients SET relationship_status = 'ended', relationship_ended_at = NULL
      WHERE email = 'returned@m1verify.test';
  EXCEPTION WHEN check_violation THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL 13: a relationship ended with no end date'; END IF;
  RAISE NOTICE 'ok  13 ending a relationship requires an end date';
END $$;

-- ── 14  a pending relationship must be reachable by someone ─────────────────
DO $$
DECLARE prac UUID; ok BOOLEAN := FALSE;
BEGIN
  SELECT id INTO prac FROM practitioners WHERE slug = 'm1verify';
  BEGIN
    INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
      VALUES (prac, 'Unreachable', 'u@m1verify.test', NULL, 'pending');
  EXCEPTION WHEN check_violation THEN ok := TRUE;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'FAIL 14: a pending relationship exists that nobody can ever claim'; END IF;
  RAISE NOTICE 'ok  14 a pending relationship must carry a member or an invitation address';
END $$;

SELECT 'M1 RELATIONSHIP ACCEPTANCE — ALL PASSED' AS result;

ROLLBACK;
