#!/usr/bin/env bash
#
# Kelly identity footprint census — READ ONLY.
#
# Answers the question the Soul Portrait witness left standing (founder ruling
# 2026-08-24): WHICH Kelly member identity is canonical? The portraits are not
# lost — 16 sit under ce284751 (kelly@soullab.life) while the browser is signed
# in as 49ae4717 (soullab1@gmail.com). Before anything moves, we need to know
# which identity carries the broader MAIA history: sessions, roles, memory,
# astrology, Studio data, relationships.
#
# It does NOT guess table names. It discovers every foreign key into members(id)
# from the live catalog and counts rows per identity per table, so it covers
# surfaces nobody remembered to list and cannot reference a column that does not
# exist. Counting is done with query_to_xml(), which needs no temp function.
#
# STRUCTURALLY READ ONLY: BEGIN READ ONLY + default_transaction_read_only. This
# script decides nothing and moves nothing. Reconciliation is a separate,
# founder-authorized act with its own plan and rollback.
#
# Usage:  scripts/kelly-identity-footprint.sh
set -euo pipefail

HOST="${MINISFORUM_HOST:-soullab@minisforum}"

psql_ro() {
  ssh "$HOST" "docker exec -i maia-postgres psql -U soullab maia_consciousness \
    -v ON_ERROR_STOP=1 -c \"SET default_transaction_read_only = on;\" -c \"$1\""
}

echo "════════════════════════════════════════════════════════════════════"
echo " Kelly identity footprint — READ ONLY"
echo " host=$HOST   at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "════════════════════════════════════════════════════════════════════"
echo
echo "── The six candidate identities (from the 2026-08-24 witness) ────────"
echo "   ce284751  Kelly         kelly@soullab.life          16 portraits"
echo "   49ae4717  soullab13cab  soullab1@gmail.com           0 portraits  ← browser"
echo "   ed52e28f  info          info@soullab.life            0 portraits"
echo "   44241845  sophie        snezat27@…                   0  (family)"
echo "   66ba03b0  augusten      augustennezat@…              0  (family)"
echo "   aed4e372  kristen       Inhomesanctuary@…            0  (family)"

echo; echo "── 1. FOOTPRINT — every table with a FK into members(id) ─────────────"
echo "     Rows with zero everywhere are omitted. Read this as: which identity"
echo "     actually carries the history? A high count under 49ae4717 means"
echo "     moving TO ce284751 would strand it, and vice versa."
psql_ro "BEGIN READ ONLY;
WITH member_fk AS (
  SELECT c.conrelid::regclass::text AS tbl, a.attname AS col
    FROM pg_constraint c
    JOIN LATERAL unnest(c.conkey) AS k(attnum) ON TRUE
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
   WHERE c.contype = 'f' AND c.confrelid = 'members'::regclass
),
ids(tag, mid) AS (VALUES
  ('kelly',    'ce284751-e457-42f6-89b6-bc07d0876682'),
  ('soullab1', '49ae4717-2b3a-4189-b25d-2bef95b1a45a'),
  ('info',     'ed52e28f-5331-4288-a9ab-4dae230079c9'),
  ('sophie',   '44241845-c1c3-4af0-b6b0-3c629a3664ea'),
  ('augusten', '66ba03b0-b430-4be9-b425-cee3665fc78c'),
  ('kristen',  'aed4e372-874d-44c3-816e-dcf3cd9c09b8')
),
counts AS (
  SELECT f.tbl, f.col, i.tag,
         (xpath('/row/c/text()',
            query_to_xml(format('SELECT count(*) AS c FROM %s WHERE %I = %L', f.tbl, f.col, i.mid),
                         false, true, '')))[1]::text::bigint AS n
    FROM member_fk f CROSS JOIN ids i
)
SELECT tbl AS table_name, col AS column_name,
       max(n) FILTER (WHERE tag='kelly')    AS \\\"ce284751_kelly\\\",
       max(n) FILTER (WHERE tag='soullab1') AS \\\"49ae4717_soullab1\\\",
       max(n) FILTER (WHERE tag='info')     AS \\\"ed52e28f_info\\\",
       max(n) FILTER (WHERE tag='sophie')   AS sophie,
       max(n) FILTER (WHERE tag='augusten') AS augusten,
       max(n) FILTER (WHERE tag='kristen')  AS kristen
  FROM counts GROUP BY 1,2 HAVING sum(n) > 0
 ORDER BY sum(n) DESC;
COMMIT;"

echo; echo "── 2. Practitioner status — does ce284751 have a Studio at all? ──────"
echo "     /studio/* gates on getCurrentPractitioner. The witness showed the"
echo "     practitionerId sits on 49ae4717, the account with NO portraits."
psql_ro "BEGIN READ ONLY;
SELECT p.id AS practitioner_id, p.member_id, m.username, m.email,
       (SELECT count(*) FROM soul_portraits sp WHERE sp.owner_member_id = p.member_id) AS portraits
  FROM practitioners p
  LEFT JOIN members m ON m.id = p.member_id
 WHERE p.member_id IN ('ce284751-e457-42f6-89b6-bc07d0876682',
                       '49ae4717-2b3a-4189-b25d-2bef95b1a45a',
                       'ed52e28f-5331-4288-a9ab-4dae230079c9')
 ORDER BY portraits DESC;
COMMIT;"

echo; echo "── 3. Session recency — which identity is actually being used? ───────"
psql_ro "BEGIN READ ONLY;
SELECT m.username, m.email, count(*) AS live_sessions, max(s.expires_at) AS latest_expiry
  FROM auth_sessions s JOIN members m ON m.id = s.member_id
 WHERE s.revoked = FALSE AND s.expires_at > NOW()
   AND s.member_id IN ('ce284751-e457-42f6-89b6-bc07d0876682',
                       '49ae4717-2b3a-4189-b25d-2bef95b1a45a',
                       'ed52e28f-5331-4288-a9ab-4dae230079c9')
 GROUP BY 1,2 ORDER BY live_sessions DESC;
COMMIT;"

cat <<'EOT'

════════════════════════════════════════════════════════════════════
 HOW TO READ THIS — no decision is encoded here
════════════════════════════════════════════════════════════════════
 §1 is the whole argument. Whichever identity carries the deep history
 (memory, atoms, sessions, relationships, astrology, Studio records) is
 the expensive one to abandon. The portraits are 16 rows; a member's
 accumulated field is not relocatable by the same logic.

 If the history sits under 49ae4717 and only the portraits sit under
 ce284751, the cheap correct act is to move 16 portrait rows — a scoped
 UPDATE of owner_member_id with a row-level rollback.

 If the history is SPLIT across both, there is no cheap act, and the
 answer is a founder ruling on canonical identity, not a query.

 NOT AUTHORIZED BY THIS SCRIPT, in any outcome:
   · merging members rows          · deleting any member
   · overwriting a profile         · relocating anything outside portraits
   · touching the family accounts (sophie/augusten/kristen) at all
════════════════════════════════════════════════════════════════════
EOT
